'use client';

import React, { useEffect, useRef } from 'react';

interface BeamsBackgroundProps {
  className?: string;
  beamColor?: string;
  density?: number;
}

export function BeamsBackground({
  className = '',
  beamColor = 'rgba(85, 37, 245, 0.12)',
  density = 6,
}: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < density; i++) {
        ctx.beginPath();
        const offset = (i / density) * Math.PI * 2;
        const x1 = (w * 0.2) + Math.sin(time + offset) * (w * 0.25);
        const y1 = -50;
        const x2 = (w * 0.6) + Math.cos(time * 0.7 + offset) * (w * 0.35);
        const y2 = h + 50;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.35, beamColor);
        grad.addColorStop(0.7, 'rgba(66, 99, 255, 0.08)');
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 140;
        ctx.filter = 'blur(40px)';
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
          x1 + Math.sin(time + i) * 80,
          h * 0.4,
          x2 - Math.cos(time + i) * 80,
          h * 0.6,
          x2,
          y2
        );
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [beamColor, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}

