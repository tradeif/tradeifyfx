"use client";

import React, { useEffect, useRef } from "react";

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  speedY: number;
  driftX: number;
  twinkleSpeed: number;
  phase: number;
}

interface GlobalSparkParticlesProps {
  particleCount?: number;
  className?: string;
}

export default function GlobalSparkParticles({
  particleCount = 45,
  className = "fixed inset-0 pointer-events-none w-full h-full z-[1] overflow-hidden",
}: GlobalSparkParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking state
    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Premium Gold & Embers Color Palette
    const colors = [
      "#FFD700", // Gold
      "#FFF5C0", // Sparkling White-Gold
      "#FFA000", // Amber Glow
      "#F59E0B", // Golden Orange
      "#D4AF37", // Metallic Gold
    ];

    // Create particles evenly across viewport
    const particles: SparkParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: Math.random() * 1.4 + 0.8, // 0.8px to 2.2px for crisp visibility
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.3,
      speedY: Math.random() * 0.25 + 0.1, // Smooth upward float
      driftX: (Math.random() - 0.5) * 0.2, // Subtle horizontal drift
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let time = 0;
    const repulsionRadius = 140; // Mouse push radius in pixels

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Mouse repulsion logic
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < repulsionRadius && dist > 0) {
              const force = (1 - dist / repulsionRadius) * 1.5;
              const angle = Math.atan2(dy, dx);
              p.vx += Math.cos(angle) * force;
              p.vy += Math.sin(angle) * force;
            }
          }

          // Damping / friction on mouse impulse
          p.vx *= 0.92;
          p.vy *= 0.92;

          // Update position
          p.x += p.driftX + Math.sin(time * 0.8 + p.phase) * 0.25 + p.vx;
          p.y -= p.speedY - p.vy;

          // Soft twinkle effect
          p.alpha = p.baseAlpha + Math.sin(time * 2.5 + p.phase) * 0.25;
          p.alpha = Math.max(0.2, Math.min(0.95, p.alpha));

          // Screen wrapping
          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
            p.vx = 0;
            p.vy = 0;
          }
          if (p.y > height + 30) {
            p.y = -10;
            p.vx = 0;
            p.vy = 0;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = p.radius * 4;
        ctx.shadowColor = p.color;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount]);

  return <canvas ref={canvasRef} className={className} />;
}
