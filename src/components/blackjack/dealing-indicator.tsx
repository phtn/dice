"use client";

import { FC, useEffect, useRef } from "react";
import { createTimeline, createAnimatable } from "animejs";

interface DealingIndicatorProps {
  isDealing: boolean;
  className?: string;
}

export const DealingIndicator: FC<DealingIndicatorProps> = ({
  isDealing,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDealing || !containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.deal-indicator');
    if (elements.length === 0) return;

    const timeline = createTimeline({
      loop: true,
      duration: 1500
    });

    elements.forEach((element, index) => {
      // Set initial state
      createAnimatable(element, {
        scale: 0.5,
        opacity: 0,
        translateY: 0
      });

      // Pulsing animation
      timeline.add(element, {
        scale: [0.5, 1.2, 0.5],
        opacity: [0, 0.8, 0],
        translateY: [0, -10, 0],
        duration: 1000,
        easing: 'easeInOutSine',
        delay: index * 200
      }, 0);
    });

    return () => {
      timeline.pause();
    };
  }, [isDealing]);

  if (!isDealing) return null;

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
    >
      {/* Subtle dealing indicators */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="deal-indicator absolute w-2 h-2 bg-blue-400/60 rounded-full"
          style={{
            left: `${45 + i * 5}%`,
            top: `${45 + i * 5}%`
          }}
        />
      ))}
      
      {/* Optional text indicator */}
      <div className="deal-indicator absolute text-xs text-blue-400/80 font-mono tracking-wider">
        DEALING
      </div>
    </div>
  );
};