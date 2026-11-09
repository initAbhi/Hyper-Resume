'use client';

import React, { useEffect, useRef } from 'react';

interface GlyphOrbProps {
  className?: string;
  colors?: [string, string]; // [shadedColor, litColor]
  size?: number; // Target diameter in px
  characterRamp?: string;
  speed?: number;
}

export function GlyphOrb({
  className = '',
  colors = ['#5525F5', '#E9E6FF'],
  size = 360,
  characterRamp = ' .·:-=+*#%@',
  speed = 0.008,
}: GlyphOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;
    let isVisible = true;

    // Pause when offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    // Characters for brightness mapping
    const ramp = characterRamp || ' .:-=+*#%@';
    const numRamp = ramp.length;

    // Target light source vector (top-right frontal sun)
    const lx = 0.65;
    const ly = -0.25;
    const lz = 0.71;

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const radius = Math.min(width, height) * 0.44;
      const cx = width / 2;
      const cy = height / 2;

      // Density of character sampling
      const step = 9; // Grid step in pixels
      ctx.font = '10px "Geist Mono", monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      rotation += speed;

      for (let y = -radius; y <= radius; y += step) {
        const rowWidth = Math.sqrt(Math.max(0, radius * radius - y * y));
        for (let x = -rowWidth; x <= rowWidth; x += step) {
          const zSq = radius * radius - x * x - y * y;
          if (zSq < 0) continue;
          const z = Math.sqrt(zSq);

          // Normal vector
          const nx = x / radius;
          const ny = y / radius;
          const nz = z / radius;

          // Rotate around Y axis
          const cos = Math.cos(rotation);
          const sin = Math.sin(rotation);
          const rotNx = nx * cos + nz * sin;
          const rotNz = -nx * sin + nz * cos;

          // Banding frequency (latitude bands)
          const band = Math.sin(ny * 12 + rotation * 2) * 0.15;

          // Dot product with light source
          const dot = rotNx * lx + ny * ly + rotNz * lz + band;
          const intensity = Math.max(0, Math.min(1, dot * 0.9 + 0.1));

          if (intensity <= 0.05) continue;

          // Pick character based on intensity
          const charIndex = Math.min(numRamp - 1, Math.floor(intensity * numRamp));
          const char = ramp[charIndex];

          // Compute color: blend between colors[0] (dim violet) and colors[1] (bright white/cyan)
          if (intensity > 0.7) {
            ctx.fillStyle = '#FFFFFF';
          } else if (intensity > 0.4) {
            ctx.fillStyle = colors[1];
          } else {
            ctx.fillStyle = colors[0];
          }

          ctx.fillText(char, cx + x, cy + y);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [colors, characterRamp, speed]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient background glow behind the orb */}
      <div 
        className="absolute rounded-full pointer-events-none blur-3xl opacity-40"
        style={{
          width: `${size * 0.85}px`,
          height: `${size * 0.85}px`,
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
        }}
      />
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="relative z-10 w-full max-w-[360px] aspect-square"
      />
    </div>
  );
}
