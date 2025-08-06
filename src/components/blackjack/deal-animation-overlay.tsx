"use client";

import { createAnimatable, createTimeline } from "animejs";
import { FC, useEffect, useRef, useState, useCallback } from "react";

// Dynamic import for animejs to avoid module resolution issues
let anime: unknown;

interface DealAnimationOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
  cardCount?: number;
  dealSpeed?: number;
}

export const DealAnimationOverlay: FC<DealAnimationOverlayProps> = ({
  isActive,
  onComplete,
  cardCount = 4,
  dealSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // Load animejs dynamically
  useEffect(() => {
    const loadAnime = async () => {
      if (!anime) {
        try {
          anime = await import("animejs");
        } catch (error) {
          console.error("Failed to load animejs:", error);
        }
      }
    };
    loadAnime();
  }, []);

  const startDealAnimation = useCallback(() => {
    if (!containerRef.current) return;

    // Fallback if anime.js isn't loaded
    if (!anime) {
      setTimeout(() => {
        setShowAnimation(false);
        onComplete?.();
      }, 2000);
      return;
    }

    setTimeout(() => {
      const cardElements = containerRef.current?.querySelectorAll(".deal-card");
      if (!cardElements) return;

      const timeline = createTimeline({
        loop: false,
        onComplete: () => {
          setTimeout(() => {
            setShowAnimation(false);
            onComplete?.();
          }, 500);
        },
      });

      // Deal sequence: Player → Dealer → Player → Dealer
      const dealSequence = [
        { target: "player", x: -120, y: 80, rotation: 0 },
        { target: "dealer", x: 120, y: -80, rotation: 180 },
        { target: "player", x: -120, y: 80, rotation: 0 },
        { target: "dealer", x: 120, y: -80, rotation: 180 },
      ];

      cardElements.forEach((element, index) => {
        if (index >= dealSequence.length) return;

        const sequence = dealSequence[index];

        // Set initial state
        createAnimatable(element, {
          translateX: 0,
          translateY: 0,
          scale: 0.5,
          rotateZ: 0,
          opacity: 0,
        });

        // Deal animation
        timeline.add(
          element,
          {
            translateX: sequence.x,
            translateY: sequence.y,
            scale: 1,
            rotateZ: sequence.rotation,
            opacity: [0, 1, 0.8],
            duration: 600 / dealSpeed,
            easing: "easeOutBack",
          },
          index * (300 / dealSpeed),
        );

        // Card settle effect
        timeline.add(
          element,
          {
            rotateY: [0, 10, 0],
            scale: [1, 1.05, 1],
            duration: 200 / dealSpeed,
            easing: "easeInOutSine",
          },
          (index * 300 + 400) / dealSpeed,
        );
      });
    }, 100);
  }, [dealSpeed, onComplete]);

  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      startDealAnimation();
    } else {
      setShowAnimation(false);
    }
  }, [isActive, startDealAnimation]);

  if (!showAnimation) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Deck/Shoe */}
      <div className="absolute">
        <div className="w-24 h-16 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 rounded-2xl shadow-2xl border-2 border-amber-400/30">
          <div className="w-full h-full bg-gradient-to-t from-black/40 to-white/10 rounded-2xl flex items-center justify-center">
            <div className="text-amber-100 text-sm font-bold tracking-widest drop-shadow-lg">
              SHOE
            </div>
          </div>
        </div>
      </div>

      {/* Dealing cards */}
      {[...Array(cardCount)].map((_, index) => (
        <div key={index} className="deal-card absolute">
          <div className="w-16 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl shadow-2xl border-2 border-blue-400/40">
            <div className="w-full h-full bg-gradient-to-t from-black/30 to-white/10 rounded-2xl p-1">
              <div className="w-full h-full bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-inner">
                <div className="text-blue-700 text-2xl font-bold drop-shadow">
                  {index % 2 === 0 ? "♠" : "♦"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Particle burst effect */}
      <div className="absolute">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              animation: `dealBurst ${1200}ms ease-out forwards`,
              animationDelay: `${i * 100}ms`,
              transform: `rotate(${i * 30}deg) translateY(-20px)`,
            }}
          />
        ))}
      </div>

      {/* Position indicators */}
      <div className="absolute bottom-20">
        <div className="text-green-400 text-sm font-bold bg-black/70 px-4 py-2 rounded-full border border-green-400/40 shadow-lg">
          PLAYER
        </div>
      </div>

      <div className="absolute top-20">
        <div className="text-red-400 text-sm font-bold bg-black/70 px-4 py-2 rounded-full border border-red-400/40 shadow-lg">
          DEALER
        </div>
      </div>

      <style jsx>{`
        @keyframes dealBurst {
          0% {
            transform: rotate(${Math.random() * 360}deg) translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: rotate(${Math.random() * 360}deg) translateY(-100px)
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
