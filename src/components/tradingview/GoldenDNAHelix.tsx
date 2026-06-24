"use client";

import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   GoldenBullScene – premium 3D-style canvas hero
   Layers (back → front):
     1. Deep navy gradient background
     2. Holographic grid floor
     3. Holographic chart (translucent polyline + area fill)
     4. Floating candlestick bars
     5. Market-data particle field (dots + text labels)
     6. 3D Golden Bull silhouette (path-drawn, shaded)
     7. Ambient glow halos
   All rendered on a single 2D canvas – no external dependencies.
───────────────────────────────────────────────────────────────────────────── */

export default function GoldenDNAHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;

    /* ── resize ── */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", resize);
    resize();

    /* ── palette ── */
    const C = {
      gold:        "#C9A84C",
      goldBright:  "#F0C040",
      goldDim:     "#8B6914",
      goldGlow:    "rgba(201,168,76,0.55)",
      navy:        "#0A0E1A",
      navyMid:     "#0D1526",
      holoCyan:    "rgba(0,220,255,0.18)",
      holoBlue:    "rgba(60,140,255,0.22)",
      holoGrid:    "rgba(60,130,220,0.08)",
      bullGold1:   "#D4A843",
      bullGold2:   "#F5CC6A",
      bullShadow:  "#5A3A00",
      green:       "#22C55E",
      red:         "#EF4444",
      white10:     "rgba(255,255,255,0.10)",
      white6:      "rgba(255,255,255,0.06)",
    };

    /* ── time ── */
    let t = 0;

    /* ─────────────────────────────────────────────────────────── */
    /* 1. Candlestick data (normalised 0-1) – 28 bars             */
    /* ─────────────────────────────────────────────────────────── */
    interface Bar { o: number; h: number; l: number; c: number; }
    const RAW: Bar[] = [
      {o:.42,h:.52,l:.38,c:.49},{o:.49,h:.58,l:.45,c:.55},{o:.55,h:.60,l:.48,c:.50},
      {o:.50,h:.54,l:.42,c:.43},{o:.43,h:.48,l:.38,c:.46},{o:.46,h:.56,l:.44,c:.54},
      {o:.54,h:.62,l:.51,c:.60},{o:.60,h:.68,l:.57,c:.65},{o:.65,h:.70,l:.60,c:.62},
      {o:.62,h:.66,l:.55,c:.57},{o:.57,h:.60,l:.50,c:.53},{o:.53,h:.58,l:.49,c:.56},
      {o:.56,h:.64,l:.53,c:.62},{o:.62,h:.70,l:.59,c:.68},{o:.68,h:.76,l:.65,c:.73},
      {o:.73,h:.78,l:.68,c:.71},{o:.71,h:.74,l:.64,c:.66},{o:.66,h:.70,l:.60,c:.63},
      {o:.63,h:.68,l:.58,c:.67},{o:.67,h:.74,l:.64,c:.72},{o:.72,h:.80,l:.69,c:.78},
      {o:.78,h:.84,l:.74,c:.80},{o:.80,h:.86,l:.76,c:.82},{o:.82,h:.88,l:.78,c:.85},
      {o:.85,h:.90,l:.80,c:.83},{o:.83,h:.86,l:.76,c:.79},{o:.79,h:.84,l:.74,c:.81},
      {o:.81,h:.88,l:.78,c:.86},
    ];

    /* ─────────────────────────────────────────────────────────── */
    /* 2. Market-data particles                                    */
    /* ─────────────────────────────────────────────────────────── */
    const LABELS = ["XAU/USD","BTC","SPX","EURUSD","DXY","NQ","GC","SI","NIFTY","VIX","OIL","GOLD"];
    interface Particle {
      x:number; y:number; vx:number; vy:number;
      label:string; alpha:number; size:number; phase:number; isText:boolean;
    }
    const particles: Particle[] = Array.from({length: 55}, () => ({
      x: Math.random() * 800 - 400,
      y: Math.random() * 500 - 250,
      vx: (Math.random() - .5) * .28,
      vy: -0.12 - Math.random() * .22,
      label: LABELS[Math.floor(Math.random() * LABELS.length)],
      alpha: .12 + Math.random() * .28,
      size: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      isText: Math.random() > .55,
    }));

    /* ─────────────────────────────────────────────────────────── */
    /* 3. Floating candlestick sprites (world-space)              */
    /* ─────────────────────────────────────────────────────────── */
    interface FloatBar { x:number; y:number; z:number; vy:number; phase:number; barIdx:number; }
    const floatBars: FloatBar[] = Array.from({length: 9}, () => ({
      x: (Math.random() - .5) * 340,
      y: (Math.random() - .5) * 260,
      z: 30 + Math.random() * 120,
      vy: -0.18 - Math.random() * .14,
      phase: Math.random() * Math.PI * 2,
      barIdx: Math.floor(Math.random() * RAW.length),
    }));

    /* ─────────────────────────────────────────────────────────── */
    /* 4. Bull body path (normalised, centred at 0,0, ~200×180)  */
    /* The path is a detailed bull silhouette made of bezier      */
    /* curves, drawn at runtime and filled with a radial gold     */
    /* gradient to simulate 3-D shading.                          */
    /* ─────────────────────────────────────────────────────────── */
    const drawBull = (cx: number, cy: number, sc: number, floatY: number) => {
      // sc = uniform scale factor; floatY = vertical float offset
      const s = (x: number, y: number): [number, number] => [cx + x * sc, cy + y * sc + floatY];

      ctx.save();

      /* ── ambient under-glow ── */
      const aura = ctx.createRadialGradient(cx, cy + 30*sc, 0, cx, cy + 30*sc, 120*sc);
      aura.addColorStop(0,   "rgba(201,168,76,0.18)");
      aura.addColorStop(0.5, "rgba(201,168,76,0.06)");
      aura.addColorStop(1,   "rgba(201,168,76,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 55*sc + floatY, 130*sc, 50*sc, 0, 0, Math.PI*2);
      ctx.fill();

      /* ── shadow ellipse on floor ── */
      const shadowAlpha = 0.18 + 0.06 * Math.sin(t * 0.04);
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 68*sc + floatY, 75*sc, 14*sc, 0, 0, Math.PI*2);
      ctx.fill();

      /* ── body path ── */
      ctx.beginPath();

      // Tail (left)
      ctx.moveTo(...s(-88, 20));
      ctx.bezierCurveTo(...s(-100, 5), ...s(-105, -15), ...s(-95, -28));
      ctx.bezierCurveTo(...s(-88, -38), ...s(-80, -42), ...s(-72, -35));

      // Back top-line → rump → back
      ctx.bezierCurveTo(...s(-60, -28), ...s(-50, -22), ...s(-36, -42));
      ctx.bezierCurveTo(...s(-22, -60), ...s(-4, -70), ...s(14, -72));

      // Neck rise
      ctx.bezierCurveTo(...s(30, -74), ...s(46, -68), ...s(56, -56));
      ctx.bezierCurveTo(...s(62, -48), ...s(66, -36), ...s(68, -24));

      // Head top
      ctx.bezierCurveTo(...s(70, -12), ...s(74, 0), ...s(82, 4));
      ctx.bezierCurveTo(...s(90, 8), ...s(96, 6), ...s(102, 2));

      // Horn (right)
      ctx.bezierCurveTo(...s(108, -4), ...s(112, -18), ...s(108, -30));
      ctx.bezierCurveTo(...s(104, -40), ...s(96, -46), ...s(88, -40));

      // Forehead → nose → muzzle
      ctx.bezierCurveTo(...s(82, -34), ...s(80, -24), ...s(84, -14));
      ctx.bezierCurveTo(...s(88, -4), ...s(90, 8), ...s(84, 16));
      ctx.bezierCurveTo(...s(78, 24), ...s(68, 28), ...s(58, 24));

      // Dewlap / chest
      ctx.bezierCurveTo(...s(50, 20), ...s(46, 28), ...s(48, 38));
      ctx.bezierCurveTo(...s(50, 48), ...s(48, 58), ...s(44, 62));

      // Front right leg
      ctx.bezierCurveTo(...s(40, 68), ...s(38, 72), ...s(38, 82));
      ctx.lineTo(...s(44, 82));
      ctx.lineTo(...s(44, 68));
      ctx.bezierCurveTo(...s(46, 60), ...s(50, 54), ...s(54, 50));

      // Belly → hind right leg
      ctx.bezierCurveTo(...s(62, 42), ...s(66, 34), ...s(68, 30));
      ctx.bezierCurveTo(...s(74, 22), ...s(78, 24), ...s(80, 34));
      ctx.bezierCurveTo(...s(82, 44), ...s(80, 58), ...s(78, 66));
      ctx.lineTo(...s(84, 66));
      ctx.lineTo(...s(82, 50));
      ctx.bezierCurveTo(...s(84, 40), ...s(86, 30), ...s(84, 22));

      // Bottom line → hind left leg
      ctx.bezierCurveTo(...s(70, 16), ...s(50, 20), ...s(30, 26));
      ctx.bezierCurveTo(...s(10, 32), ...s(-8, 30), ...s(-22, 30));
      ctx.bezierCurveTo(...s(-36, 30), ...s(-46, 34), ...s(-52, 42));
      ctx.bezierCurveTo(...s(-56, 50), ...s(-56, 60), ...s(-58, 68));
      ctx.lineTo(...s(-52, 68));
      ctx.lineTo(...s(-50, 54));
      ctx.bezierCurveTo(...s(-48, 44), ...s(-44, 36), ...s(-38, 32));

      // Front left leg
      ctx.bezierCurveTo(...s(-28, 28), ...s(-18, 26), ...s(-10, 28));
      ctx.bezierCurveTo(...s(-2, 30), ...s(6, 32), ...s(10, 40));
      ctx.bezierCurveTo(...s(14, 50), ...s(12, 62), ...s(10, 70));
      ctx.lineTo(...s(16, 70));
      ctx.lineTo(...s(18, 56));
      ctx.bezierCurveTo(...s(20, 44), ...s(20, 34), ...s(16, 26));
      ctx.bezierCurveTo(...s(8, 18), ...s(-4, 14), ...s(-16, 14));
      ctx.bezierCurveTo(...s(-30, 14), ...s(-44, 16), ...s(-56, 14));
      ctx.bezierCurveTo(...s(-66, 12), ...s(-76, 8), ...s(-84, 14));
      ctx.bezierCurveTo(...s(-88, 18), ...s(-88, 20), ...s(-88, 20));

      ctx.closePath();

      /* ── 3-D shading gradient ── */
      const g = ctx.createLinearGradient(cx - 80*sc, cy - 80*sc + floatY, cx + 80*sc, cy + 60*sc + floatY);
      g.addColorStop(0,    "#F5CC6A"); // highlight
      g.addColorStop(0.28, "#D4A843"); // mid-gold
      g.addColorStop(0.6,  "#9B7228"); // shadow side
      g.addColorStop(1,    "#4A2D00"); // deep shadow

      ctx.fillStyle = g;
      ctx.fill();

      /* ── rim-light stroke ── */
      ctx.strokeStyle = "rgba(245,204,106,0.35)";
      ctx.lineWidth = 1.2 * sc;
      ctx.stroke();

      /* ── specular highlight on back ── */
      const spec = ctx.createLinearGradient(...s(-40, -65), ...s(0, -50));
      spec.addColorStop(0, "rgba(255,248,200,0.50)");
      spec.addColorStop(1, "rgba(255,248,200,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.moveTo(...s(-36, -42));
      ctx.bezierCurveTo(...s(-22, -60), ...s(-4, -70), ...s(14, -72));
      ctx.bezierCurveTo(...s(0, -62), ...s(-16, -52), ...s(-36, -42));
      ctx.fill();

      /* ── left horn ── */
      ctx.beginPath();
      ctx.moveTo(...s(-72, -35));
      ctx.bezierCurveTo(...s(-68, -52), ...s(-58, -62), ...s(-50, -68));
      ctx.bezierCurveTo(...s(-44, -72), ...s(-38, -70), ...s(-38, -60));
      ctx.bezierCurveTo(...s(-40, -50), ...s(-50, -44), ...s(-60, -40));
      ctx.bezierCurveTo(...s(-66, -38), ...s(-70, -36), ...s(-72, -35));
      ctx.closePath();
      ctx.fillStyle = "#D4A843";
      ctx.fill();
      ctx.strokeStyle = "rgba(245,204,106,0.3)";
      ctx.lineWidth = 0.8 * sc;
      ctx.stroke();

      ctx.restore();
    };

    /* ─────────────────────────────────────────────────────────── */
    /* 5. Holographic chart  (transparent glass panel + lines)    */
    /* ─────────────────────────────────────────────────────────── */
    const drawChart = (px: number, py: number, pw: number, ph: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      /* panel glass */
      const panel = ctx.createLinearGradient(px, py, px, py + ph);
      panel.addColorStop(0,   "rgba(14,30,70,0.55)");
      panel.addColorStop(0.5, "rgba(10,20,50,0.38)");
      panel.addColorStop(1,   "rgba(6,14,36,0.22)");
      ctx.fillStyle = panel;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 10);
      ctx.fill();

      /* panel border */
      ctx.strokeStyle = "rgba(60,140,255,0.28)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      /* header strip */
      ctx.fillStyle = "rgba(60,140,255,0.12)";
      ctx.beginPath();
      ctx.roundRect(px, py, pw, 18, [10, 10, 0, 0]);
      ctx.fill();

      /* label */
      ctx.fillStyle = "rgba(100,180,255,0.7)";
      ctx.font = "bold 7px 'SF Mono',monospace";
      ctx.fillText("XAU/USD  •  LIVE", px + 8, py + 12);

      ctx.fillStyle = "#22C55E";
      ctx.font = "bold 6.5px monospace";
      ctx.textAlign = "right";
      ctx.fillText("+2.14%", px + pw - 8, py + 12);
      ctx.textAlign = "left";

      /* grid lines */
      const rows = 4;
      for (let r = 1; r <= rows; r++) {
        const gy = py + 18 + (r / rows) * (ph - 18);
        ctx.beginPath();
        ctx.moveTo(px, gy);
        ctx.lineTo(px + pw, gy);
        ctx.strokeStyle = "rgba(60,130,220,0.10)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      const cols = 6;
      for (let c = 1; c < cols; c++) {
        const gx = px + (c / cols) * pw;
        ctx.beginPath();
        ctx.moveTo(gx, py + 18);
        ctx.lineTo(gx, py + ph);
        ctx.strokeStyle = "rgba(60,130,220,0.10)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* area fill */
      const chartT = py + 24, chartB = py + ph - 6;
      const chartH = chartB - chartT;
      const chartW = pw - 12;
      const chartX = px + 6;

      const aFill = ctx.createLinearGradient(chartX, chartT, chartX, chartB);
      aFill.addColorStop(0,   "rgba(34,197,94,0.28)");
      aFill.addColorStop(0.6, "rgba(34,197,94,0.06)");
      aFill.addColorStop(1,   "rgba(34,197,94,0)");

      ctx.beginPath();
      ctx.moveTo(chartX, chartB);
      RAW.forEach((bar, i) => {
        const x = chartX + (i / (RAW.length - 1)) * chartW;
        const y = chartT + (1 - bar.c) * chartH;
        if (i === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(chartX + chartW, chartB);
      ctx.closePath();
      ctx.fillStyle = aFill;
      ctx.fill();

      /* line */
      ctx.beginPath();
      RAW.forEach((bar, i) => {
        const x = chartX + (i / (RAW.length - 1)) * chartW;
        const y = chartT + (1 - bar.c) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#22C55E";
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(34,197,94,0.6)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* mini candlesticks */
      const barW = (chartW / RAW.length) * 0.55;
      RAW.forEach((bar, i) => {
        const x = chartX + (i / (RAW.length - 1)) * chartW;
        const bull = bar.c >= bar.o;
        const clr = bull ? "#22C55E" : "#EF4444";
        const oY = chartT + (1 - bar.o) * chartH;
        const cY = chartT + (1 - bar.c) * chartH;
        const hY = chartT + (1 - bar.h) * chartH;
        const lY = chartT + (1 - bar.l) * chartH;
        ctx.strokeStyle = clr;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, hY);
        ctx.lineTo(x, lY);
        ctx.stroke();
        ctx.fillStyle = clr;
        ctx.fillRect(x - barW / 2, Math.min(oY, cY), barW, Math.max(1, Math.abs(cY - oY)));
      });

      ctx.restore();
    };

    /* ─────────────────────────────────────────────────────────── */
    /* 6. Floating candlestick (world-projected)                  */
    /* ─────────────────────────────────────────────────────────── */
    const drawFloatCandle = (sx: number, sy: number, barIdx: number, alpha: number, sc2: number) => {
      const bar = RAW[barIdx % RAW.length];
      const bull = bar.c >= bar.o;
      const clr = bull ? C.green : C.red;
      const bH = 28 * sc2;
      const bW = 6 * sc2;
      const oY = -bar.o * bH;
      const cY = -bar.c * bH;
      const hY = -bar.h * bH;
      const lY = -bar.l * bH;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = clr;
      ctx.lineWidth = 0.8 * sc2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = bull ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)";
      ctx.beginPath();
      ctx.moveTo(sx, sy + hY);
      ctx.lineTo(sx, sy + lY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = clr;
      ctx.fillRect(sx - bW / 2, sy + Math.min(oY, cY), bW, Math.max(1.5, Math.abs(cY - oY)));
      ctx.restore();
    };

    /* ─────────────────────────────────────────────────────────── */
    /* 7. Floor holographic grid                                  */
    /* ─────────────────────────────────────────────────────────── */
    const drawGrid = (gy: number) => {
      ctx.save();
      const steps = 12;
      const gw = W;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * gw;
        const grad = ctx.createLinearGradient(x, gy, x, H);
        grad.addColorStop(0, "rgba(60,140,255,0.12)");
        grad.addColorStop(1, "rgba(60,140,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      const rowSteps = 7;
      for (let j = 0; j <= rowSteps; j++) {
        const frac = j / rowSteps;
        const y = gy + frac * (H - gy);
        const grad2 = ctx.createLinearGradient(0, y, gw, y);
        grad2.addColorStop(0,   "rgba(60,140,255,0)");
        grad2.addColorStop(0.5, `rgba(60,140,255,${0.12 * (1 - frac)})`);
        grad2.addColorStop(1,   "rgba(60,140,255,0)");
        ctx.strokeStyle = grad2;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gw, y);
        ctx.stroke();
      }
      /* horizon fade */
      const haze = ctx.createLinearGradient(0, gy - 20, 0, gy + 60);
      haze.addColorStop(0, "rgba(10,20,50,0)");
      haze.addColorStop(0.4, "rgba(14,36,90,0.20)");
      haze.addColorStop(1, "rgba(14,36,90,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, gy - 20, gw, 80);
      ctx.restore();
    };

    /* ─────────────────────────────────────────────────────────── */
    /* MAIN DRAW LOOP                                             */
    /* ─────────────────────────────────────────────────────────── */
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      /* ── background gradient ── */
      const bg = ctx.createRadialGradient(W * .55, H * .4, 0, W * .55, H * .4, Math.max(W, H));
      bg.addColorStop(0,   "rgba(16,26,56,0.0)");   // transparent center
      bg.addColorStop(0.5, "rgba(8,14,34,0.0)");
      bg.addColorStop(1,   "rgba(4,8,20,0.0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* ── floor grid ── */
      const floorY = H * 0.78;
      drawGrid(floorY);

      /* ── layout params ── */
      const bullCX   = W * 0.58;
      const bullCY   = H * 0.54;
      const bullScale = Math.min(W, H) * 0.0028 + 0.45;
      const floatAmp  = 6;
      const floatY    = Math.sin(t * 0.025) * floatAmp;

      /* ── holographic chart panels ── */
      // Main large chart – behind the bull, offset left+up
      const ch1W = W * 0.42, ch1H = H * 0.36;
      const ch1X = W * 0.06, ch1Y = H * 0.14;
      drawChart(ch1X, ch1Y, ch1W, ch1H, 0.72 + 0.06 * Math.sin(t * 0.03));

      // Small secondary chart top-right
      const ch2W = W * 0.22, ch2H = H * 0.22;
      const ch2X = W * 0.74, ch2Y = H * 0.08;
      drawChart(ch2X, ch2Y, ch2W, ch2H, 0.55 + 0.05 * Math.sin(t * 0.04 + 1));

      /* ── floating world-space candlesticks ── */
      const fov2 = 260, cam2 = 280;
      floatBars.forEach((fb, i) => {
        fb.y += fb.vy;
        if (fb.y < -280) { fb.y = 120; fb.x = (Math.random() - .5) * 320; }
        const depth = cam2 + fb.z;
        const sc2 = fov2 / Math.max(20, depth);
        const sx = W * 0.52 + fb.x * sc2;
        const sy = H * 0.50 + fb.y * sc2 + floatY * 0.3;
        if (sx < 0 || sx > W || sy < 0 || sy > H) return;
        const a = 0.18 + 0.10 * Math.sin(t * 0.022 + fb.phase + i);
        drawFloatCandle(sx, sy, fb.barIdx, a, sc2 * 0.7);
      });

      /* ── market data particles ── */
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -280) { p.y = 200; p.x = (Math.random() - .5) * 700; }
        if (p.x > 450)  p.x = -450;
        if (p.x < -450) p.x = 450;

        const depth = cam2 + 80;
        const sc3 = fov2 / depth;
        const px2 = W * 0.52 + p.x * sc3;
        const py2 = H * 0.50 + p.y * sc3 + floatY * 0.2;
        if (px2 < 0 || px2 > W || py2 < 0 || py2 > H) return;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.03 + p.phase);
        const alpha = p.alpha * (0.6 + 0.4 * pulse);

        ctx.save();
        ctx.globalAlpha = alpha;
        if (p.isText) {
          ctx.fillStyle = C.gold;
          ctx.font = `${Math.round(7 + p.size * 1.2)}px 'SF Mono',monospace`;
          ctx.textAlign = "center";
          ctx.fillText(p.label, px2, py2);
        } else {
          ctx.fillStyle = C.goldBright;
          ctx.shadowBlur = 6;
          ctx.shadowColor = C.goldGlow;
          ctx.beginPath();
          ctx.arc(px2, py2, p.size * sc3 * 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      });

      /* ── bull sculpture ── */
      drawBull(bullCX, bullCY, bullScale, floatY);

      /* ── top glow halo ── */
      const halo = ctx.createRadialGradient(bullCX, bullCY - 60 * bullScale + floatY, 0,
                                             bullCX, bullCY - 60 * bullScale + floatY, 90 * bullScale);
      halo.addColorStop(0,   "rgba(201,168,76,0.10)");
      halo.addColorStop(0.5, "rgba(201,168,76,0.03)");
      halo.addColorStop(1,   "rgba(201,168,76,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(bullCX, bullCY - 40 * bullScale + floatY, 100 * bullScale, 55 * bullScale, 0, 0, Math.PI * 2);
      ctx.fill();

      /* ── thin gold accent lines (chart connectors) ── */
      ctx.save();
      ctx.globalAlpha = 0.12 + 0.04 * Math.sin(t * 0.02);
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 6]);
      // line from chart to bull
      ctx.beginPath();
      ctx.moveTo(ch1X + ch1W, ch1Y + ch1H * 0.5);
      ctx.lineTo(bullCX - 80 * bullScale, bullCY - 40 * bullScale + floatY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-transparent"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
