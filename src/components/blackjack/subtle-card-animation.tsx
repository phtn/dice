"use client";

import { FC, useEffect, useRef, useState } from "react";
import { createTimeline, createAnimatable } from "animejs";

interface SubtleCardAnimationProps {
  isDealing: boolean;
  onComplete?: () => void;
  dealSpeed?: number;
}

export const SubtleCardAnimation: FC<SubtleCardAnimationProps> = ({
  isDealing,
  onComplete,
  dealSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isDealing || !containerRef.current) return;

    const cardElements = containerRef.current.querySelectorAll(".subtle-card");
    if (cardElements.length === 0) return;

    const timeline = createTimeline({
      defaults: {
        duration: 400 / dealSpeed,
      },
      onComplete: () => {
        setTimeout(() => {
          onComplete?.();
        }, 200);
      },
    });

    // Subtle dealing sequence - cards appear from shoe area
    const dealSequence = [
      { target: "player", x: -60, y: 30 },
      { target: "dealer", x: 60, y: -30 },
      { target: "player", x: -60, y: 30 },
      { target: "dealer", x: 60, y: -30 },
    ];

    cardElements.forEach((element, index) => {
      if (index >= dealSequence.length) return;

      const sequence = dealSequence[index];

      // Initial state - small and invisible
      createAnimatable(element, {
        translateX: 0,
        translateY: 0,
        scale: 0.3,
        opacity: 0,
      });

      // Quick, subtle animation
      timeline.add(
        element,
        {
          translateX: sequence.x,
          translateY: sequence.y,
          scale: [0.3, 1.1, 1],
          opacity: [0, 0.8, 0],
          duration: 300 / dealSpeed,
          easing: "easeOutCubic",
        },
        index * (150 / dealSpeed),
      );
    });
  }, [isDealing, dealSpeed, onComplete]);

  if (!isDealing) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10"
    >
      {/* Minimal card representations */}
      {[1, 2, 3, 4].map((cardNum) => (
        <div
          key={cardNum}
          className="subtle-card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-8 h-12 bg-blue-500/60 rounded-lg shadow-lg border border-blue-400/40 backdrop-blur-sm">
            <div className="w-full h-full bg-gradient-to-t from-white/20 to-transparent rounded-lg" />
          </div>
        </div>
      ))}

      {/* Subtle particle effects */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-400/60 rounded-full"
          style={{
            animation: `subtleParticle ${800}ms ease-out forwards`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes subtleParticle {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(
                ${isClient ? Math.random() * 100 - 50 : 0}px,
                ${isClient ? Math.random() * 100 - 50 : 0}px
              )
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
