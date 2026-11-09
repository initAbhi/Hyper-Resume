'use client';

import React, { useState, useEffect } from 'react';

interface TextMorphProps {
  words: string[];
  interval?: number;
  className?: string;
  transitColor?: string;
}

export function TextMorph({
  words,
  interval = 3200,
  className = '',
  transitColor = '#A5B4FC',
}: TextMorphProps) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!words || words.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setIsTransitioning(false);
      }, 400); // Cross-dissolve duration
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  const currentWord = words[index] || '';

  return (
    <span
      className={`inline-block transition-all duration-500 ease-out font-semibold ${className}`}
      style={{
        filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
        opacity: isTransitioning ? 0.3 : 1,
        transform: isTransitioning ? 'scale(0.96) translateY(2px)' : 'scale(1) translateY(0)',
        color: isTransitioning ? transitColor : undefined,
      }}
    >
      {currentWord}
    </span>
  );
}
