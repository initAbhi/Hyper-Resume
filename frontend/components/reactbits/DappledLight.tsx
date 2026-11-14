'use client';

import React, { useEffect, useRef } from 'react';

export interface DappledLightProps {
  className?: string;
  lightColor?: string;      // Color of the window sunlight beam (e.g. violet '#9333EA')
  beamOpacity?: number;     // Intensity of the light patch (default: 0.35)
  leafColor?: string;       // Color of the leaf shadows (default: deep dark '#06070B')
  speed?: number;           // Wind speed multiplier (default: 1.0)
  placement?: 'top-right' | 'top-left'; // Direction light enters from (default: 'top-right' -> right to left)
  showWindowFrame?: boolean;// Show subtle window mullions
}

export function DappledLight({
  className = '',
  lightColor = '#7C3AED',
  beamOpacity = 0.32,
  leafColor = '#07080E',
  speed = 1.0,
  placement = 'top-right',
  showWindowFrame = true,
}: DappledLightProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let time = 0;

    // Handle high DPI resize
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Pause animation when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Procedural Ficus Leaf Branch Definition
    // Each leaf has position along stem, length, width, angle, and phase offset
    interface Leaf {
      stemU: number;     // 0 to 1 position along stem
      length: number;
      width: number;
      angle: number;     // offset from stem angle in radians
      phase: number;     // wind flutter offset
      flutterRate: number;
    }

    interface Branch {
      originX: number;   // normalized (0..1)
      originY: number;   // normalized (0..1)
      length: number;    // normalized
      angle: number;     // base angle in radians
      flexibility: number;
      leaves: Leaf[];
    }

    // Generate natural ficus branch clusters
    const branches: Branch[] = [
      {
        originX: placement === 'top-right' ? 1.05 : -0.05,
        originY: -0.05,
        length: 0.72,
        angle: placement === 'top-right' ? Math.PI * 0.72 : Math.PI * 0.28,
        flexibility: 1.2,
        leaves: [
          { stemU: 0.22, length: 54, width: 28, angle: 0.75, phase: 0.2, flutterRate: 1.3 },
          { stemU: 0.35, length: 62, width: 32, angle: -0.80, phase: 0.8, flutterRate: 1.1 },
          { stemU: 0.48, length: 70, width: 34, angle: 0.65, phase: 1.4, flutterRate: 1.4 },
          { stemU: 0.60, length: 66, width: 30, angle: -0.70, phase: 2.1, flutterRate: 1.2 },
          { stemU: 0.72, length: 58, width: 26, angle: 0.60, phase: 2.9, flutterRate: 1.5 },
          { stemU: 0.85, length: 50, width: 24, angle: -0.55, phase: 3.7, flutterRate: 1.3 },
          { stemU: 0.98, length: 44, width: 20, angle: 0.10, phase: 4.5, flutterRate: 1.6 },
        ],
      },
      {
        originX: placement === 'top-right' ? 0.96 : 0.04,
        originY: -0.08,
        length: 0.85,
        angle: placement === 'top-right' ? Math.PI * 0.66 : Math.PI * 0.34,
        flexibility: 1.5,
        leaves: [
          { stemU: 0.18, length: 48, width: 24, angle: -0.65, phase: 1.1, flutterRate: 1.2 },
          { stemU: 0.30, length: 68, width: 34, angle: 0.85, phase: 1.7, flutterRate: 1.0 },
          { stemU: 0.44, length: 74, width: 36, angle: -0.75, phase: 2.4, flutterRate: 1.3 },
          { stemU: 0.58, length: 68, width: 32, angle: 0.70, phase: 3.1, flutterRate: 1.1 },
          { stemU: 0.72, length: 62, width: 28, angle: -0.60, phase: 3.9, flutterRate: 1.4 },
          { stemU: 0.86, length: 52, width: 22, angle: 0.50, phase: 4.7, flutterRate: 1.2 },
          { stemU: 0.99, length: 42, width: 18, angle: -0.05, phase: 5.5, flutterRate: 1.5 },
        ],
      },
      {
        originX: placement === 'top-right' ? 1.12 : -0.12,
        originY: 0.12,
        length: 0.65,
        angle: placement === 'top-right' ? Math.PI * 0.82 : Math.PI * 0.18,
        flexibility: 1.0,
        leaves: [
          { stemU: 0.25, length: 52, width: 26, angle: 0.70, phase: 0.6, flutterRate: 1.2 },
          { stemU: 0.42, length: 64, width: 30, angle: -0.75, phase: 1.5, flutterRate: 1.1 },
          { stemU: 0.62, length: 58, width: 28, angle: 0.65, phase: 2.6, flutterRate: 1.3 },
          { stemU: 0.82, length: 48, width: 22, angle: -0.55, phase: 3.8, flutterRate: 1.4 },
        ],
      },
    ];

    // Helper: Draw single curved ficus leaf
    const drawFicusLeaf = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      length: number,
      width: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);

      context.beginPath();
      context.moveTo(0, 0);
      // Top curved arc
      context.bezierCurveTo(
        length * 0.35, -width * 0.55,
        length * 0.75, -width * 0.45,
        length, 0
      );
      // Bottom curved arc returning to stem
      context.bezierCurveTo(
        length * 0.75, width * 0.45,
        length * 0.35, width * 0.55,
        0, 0
      );
      context.closePath();
      context.fill();
      context.restore();
    };

    // Main animation loop
    const render = () => {
      animId = requestAnimationFrame(render);
      if (!isVisible || width === 0 || height === 0) return;

      time += 0.016 * speed;

      ctx.clearRect(0, 0, width, height);

      // ========================================================
      // 1. THE ANGLED WINDOW SUNLIGHT BEAM (Right to Left Projection)
      // ========================================================
      // Trapezoidal window light patch projected on wall
      ctx.save();
      
      const isRight = placement === 'top-right';
      const quadP1 = { x: isRight ? width * 0.95 : width * 0.05, y: -20 };
      const quadP2 = { x: isRight ? width * 1.10 : width * -0.10, y: height * 0.35 };
      const quadP3 = { x: isRight ? width * 0.35 : width * 0.65, y: height * 1.05 };
      const quadP4 = { x: isRight ? width * 0.15 : width * 0.85, y: height * 0.75 };

      // Passing cloud gentle luminosity modulation
      const cloudBreathing = Math.sin(time * 0.4) * 0.08 + Math.cos(time * 0.15) * 0.05;
      const currentOpacity = Math.max(0.22, Math.min(0.65, beamOpacity + cloudBreathing));

      // Create radial/linear radiant sunlight gradient
      const lightGrad = ctx.createRadialGradient(
        isRight ? width * 0.85 : width * 0.15,
        height * 0.15,
        40,
        isRight ? width * 0.45 : width * 0.55,
        height * 0.75,
        Math.max(width, height) * 0.85
      );
      lightGrad.addColorStop(0.0, `rgba(168, 85, 247, ${currentOpacity * 1.1})`);
      lightGrad.addColorStop(0.35, `rgba(124, 58, 237, ${currentOpacity * 0.85})`);
      lightGrad.addColorStop(0.70, `rgba(85, 37, 245, ${currentOpacity * 0.4})`);
      lightGrad.addColorStop(1.0, 'rgba(85, 37, 245, 0)');

      // Draw the illuminated window shape with soft blur
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.moveTo(quadP1.x, quadP1.y);
      ctx.lineTo(quadP2.x, quadP2.y);
      ctx.lineTo(quadP3.x, quadP3.y);
      ctx.lineTo(quadP4.x, quadP4.y);
      ctx.closePath();
      ctx.fill();

      // ========================================================
      // 2. CUT OUT WINDOW FRAME SHADOW MULLIONS (The Cross / Panes)
      // ========================================================
      // Use destination-out to naturally subtract light where shadows fall
      ctx.globalCompositeOperation = 'destination-out';

      if (showWindowFrame) {
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.65;

        // Angled mullion cross center
        const centerX = isRight ? width * 0.62 : width * 0.38;
        const centerY = height * 0.48;
        const windowAngle = isRight ? -0.28 : 0.28;

        ctx.translate(centerX, centerY);
        ctx.rotate(windowAngle);

        // Vertical mullion bar
        ctx.fillRect(-18, -height * 0.8, 36, height * 1.6);
        // Horizontal mullion bar
        ctx.fillRect(-width * 0.8, -16, width * 1.6, 32);

        ctx.restore();
      }

      // ========================================================
      // 3. CUT OUT SWAYING FICUS BOTANICAL LEAF SHADOWS
      // ========================================================
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.globalAlpha = 0.82; // Semi-transparent soft leaf shadow blocking light

      // Natural multi-harmonic wind wave
      const windPrimary = Math.sin(time * 0.9) * 0.05 + Math.sin(time * 1.7) * 0.025;
      const windGust = Math.sin(time * 0.3) * 0.04;

      branches.forEach((branch) => {
        const startX = branch.originX * width;
        const startY = branch.originY * height;
        const branchLen = branch.length * Math.hypot(width, height) * 0.55;

        // Branch tip sway
        const currentBranchAngle = branch.angle + (windPrimary + windGust) * branch.flexibility;

        // Draw curved stem
        const endX = startX + Math.cos(currentBranchAngle) * branchLen;
        const endY = startY + Math.sin(currentBranchAngle) * branchLen;
        const ctrlX = startX + Math.cos(currentBranchAngle - 0.2) * (branchLen * 0.5);
        const ctrlY = startY + Math.sin(currentBranchAngle - 0.2) * (branchLen * 0.5);

        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.stroke();

        // Draw leaves along the swaying stem
        branch.leaves.forEach((leaf) => {
          // Point along quadratic curve
          const t = leaf.stemU;
          const lx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
          const ly = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;

          // Tangent angle along curve
          const tx = 2 * (1 - t) * (ctrlX - startX) + 2 * t * (endX - ctrlX);
          const ty = 2 * (1 - t) * (ctrlY - startY) + 2 * t * (endY - ctrlY);
          const tangentAngle = Math.atan2(ty, tx);

          // Individual leaf flutter
          const leafFlutter = Math.sin(time * 2.2 * leaf.flutterRate + leaf.phase) * 0.09;
          const leafAngle = tangentAngle + leaf.angle + leafFlutter;

          // Scale leaves slightly with breeze
          const scaleBreath = 1 + Math.sin(time * 1.5 + leaf.phase) * 0.03;

          drawFicusLeaf(
            ctx,
            lx,
            ly,
            leafAngle,
            leaf.length * scaleBreath,
            leaf.width * scaleBreath
          );
        });
      });

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [lightColor, beamOpacity, leafColor, speed, placement, showWindowFrame]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block filter blur-[6px] sm:blur-[8px]"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
