"use client";

import React from "react";

export function StarsBackground() {
  // Generate many stars for a dense starfield
  const stars = Array.from({ length: 200 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: 0.3 + Math.random() * 0.7,
    twinkleDelay: Math.random() * 5,
    twinkleDuration: 3 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star-dot"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            '--twinkle-duration': `${star.twinkleDuration}s`,
            '--twinkle-delay': `${star.twinkleDelay}s`,
            animation: `star-twinkle var(--twinkle-duration) ease-in-out infinite`,
            animationDelay: `var(--twinkle-delay)`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

