"use client";

import { FC, useEffect, useRef } from "react";
import { createTimeline, createAnimatable } from "animejs";

interface CardAppearAnimationProps {
  children: React.ReactNode;
  shouldAnimate: boolean;
  delay?: number;
  isDealer?: boolean;
  onComplete?: () => void;
}

export const CardAppearAnimation: FC<CardAppearAnimationProps> = ({
  children,
  shouldAnimate,
  delay = 0,
  isDealer = false,
  onComplete,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldAnimate || !cardRef.current) return;

    const element = cardRef.current;

    // Set initial state
    createAnimatable(element, {
      scale: 0.3,
      rotateY: isDealer ? 180 : 0,
      opacity: 0,
      translateY: -20,
    });

    // Create appear animation
    const timeline = createTimeline({
      onComplete: () => {
        onComplete?.();
      },
    });

    timeline.add(element, {
      scale: [0.3, 1.1, 1],
      rotateY: isDealer ? [180, 180] : [0, 0],
      opacity: [0, 1],
      translateY: [-20, 5, 0],
      duration: 500,
      easing: "easeOutBack",
      delay: delay,
    });
  }, [shouldAnimate, delay, isDealer, onComplete]);

  return (
    <div ref={cardRef} className="inline-block">
      {children}
    </div>
  );
};
