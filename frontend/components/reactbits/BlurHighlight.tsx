'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BlurHighlightProps {
  children: React.ReactNode;
  highlights?: string[];
  highlightColor?: string;
  highlightTextColor?: string;
  className?: string;
  delay?: number;
}

export function BlurHighlight({
  children,
  highlights = [],
  highlightColor = 'rgba(16, 185, 129, 0.18)',
  highlightTextColor = '#34D399',
  className = '',
  delay = 0,
}: BlurHighlightProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        filter: isInView ? 'blur(0px)' : 'blur(6px)',
        opacity: isInView ? 1 : 0.4,
        transform: isInView ? 'translateY(0)' : 'translateY(8px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
