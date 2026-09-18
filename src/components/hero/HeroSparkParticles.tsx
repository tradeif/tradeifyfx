"use client";

import React, { useEffect, useRef } from "react";

interface SparkParticle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  speedY: number;
  driftX: number;
  twinkleSpeed: number;
  phase: number;
}

interface HeroSparkParticlesProps {
  particleCount?: number;
  className?: string;
}

export default function HeroSparkParticles({
  particleCount = 45,
  className = "absolute inset-0 pointer-events-none w-full h-full z-0",
}: HeroSparkParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    // Color palette: Gold, Amber, Light Gold, Soft Orange Embers
    const colors = [
      "#FFD700", // Gold
      "#FFF5C0", // Light Gold Spark
      "#FFA000", // Amber Glow
      "#F59E0B", // Golden Orange
      "#D4AF37", // Metallic Gold
    ];

    // Create particles
    const particles: SparkParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8, // Size 0.8px to 3.0px
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.35,
      speedY: Math.random() * 0.5 + 0.15, // Upward floating speed
      driftX: (Math.random() - 0.5) * 0.3, // Gentle horizontal sway
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    // Resize handler
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Update positions
          p.y -= p.speedY;
          p.x += Math.sin(time * 0.8 + p.phase) * 0.35 + p.driftX;

          // Twinkle effect
          p.alpha = p.baseAlpha + Math.sin(time * 3 + p.phase) * 0.25;
          p.alpha = Math.max(0.1, Math.min(1, p.alpha));

          // Reset particle when it floats off the top
          if (p.y < -15) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        // Render glowing particle
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
      resizeObserver.disconnect();
    };
  }, [particleCount]);

  return <canvas ref={canvasRef} className={className} />;
}
