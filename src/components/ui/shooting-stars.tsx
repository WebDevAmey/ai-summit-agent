"use client";

import React from "react";

export function ShootingStars() {
  // Generate stars with random starting positions and directions
  const stars = Array.from({ length: 50 }, (_, i) => {
    // Random starting position (can be from any edge)
    const startEdge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let angle = 0;
    
    // Random angle between -60 and -30 degrees (diagonal down-right) or variations
    const baseAngle = -45 + (Math.random() * 30 - 15); // -60 to -30 degrees
    
    if (startEdge === 0) {
      // Start from top edge
      startX = Math.random() * 100;
      startY = -10;
      endX = startX + (50 + Math.random() * 50);
      endY = 110;
      angle = baseAngle;
    } else if (startEdge === 1) {
      // Start from right edge
      startX = 110;
      startY = Math.random() * 100;
      endX = -10;
      endY = startY + (50 + Math.random() * 50);
      angle = 135 + (Math.random() * 30 - 15); // 120 to 150 degrees
    } else if (startEdge === 2) {
      // Start from bottom edge
      startX = Math.random() * 100;
      startY = 110;
      endX = startX - (50 + Math.random() * 50);
      endY = -10;
      angle = 135 + (Math.random() * 30 - 15); // 120 to 150 degrees
    } else {
      // Start from left edge
      startX = -10;
      startY = Math.random() * 100;
      endX = 110;
      endY = startY + (50 + Math.random() * 50);
      angle = baseAngle;
    }
    
    return {
      id: i,
      startX,
      startY,
      endX,
      endY,
      angle,
      delay: Math.random() * 8,
      duration: 1.5 + Math.random() * 2.5,
      size: 1 + Math.random() * 2,
      trailLength: 200 + Math.random() * 300,
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => {
        // Calculate the distance and direction
        const deltaX = star.endX - star.startX;
        const deltaY = star.endY - star.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        return (
          <div
            key={star.id}
            className="shooting-star-trail"
            style={{
              left: `${star.startX}%`,
              top: `${star.startY}%`,
              '--star-duration': `${star.duration}s`,
              '--star-delay': `${star.delay}s`,
              '--trail-length': `${star.trailLength}px`,
              '--move-x': `${deltaX}%`,
              '--move-y': `${deltaY}%`,
              '--star-angle': `${star.angle}deg`,
            } as React.CSSProperties}
          >
            <div className="shooting-star-dot" />
            <div className="shooting-star-line" />
          </div>
        );
      })}
    </div>
  );
}

