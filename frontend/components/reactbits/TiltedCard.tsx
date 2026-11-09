'use client';

import React, { useState, useRef } from 'react';

export interface TiltedCardProps {
  children?: React.ReactNode;
  className?: string;
  maxRotate?: number; // degrees
  scaleOnHover?: number;
  showGlare?: boolean;
}

export function TiltedCard({
  children,
  className = '',
  maxRotate = 10,
  scaleOnHover = 1.02,
  showGlare = true,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    scale: 1,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxRotate;
    const rotateY = ((x - centerX) / centerX) * maxRotate;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform({
      rotateX,
      rotateY,
      glareX,
      glareY,
      glareOpacity: 0.35,
      scale: scaleOnHover,
    });
  };

  const handleMouseLeave = () => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
      scale: 1,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative preserve-3d transition-transform duration-300 ease-out select-none ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) scale(${transform.scale})`,
      }}
    >
      {/* Specular Glare Reflection Layer */}
      {showGlare && (
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] transition-opacity duration-300 mix-blend-screen overflow-hidden"
          style={{
            opacity: transform.glareOpacity,
            background: `radial-gradient(circle 350px at ${transform.glareX}% ${transform.glareY}%, rgba(255,255,255,0.45), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Surface Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
