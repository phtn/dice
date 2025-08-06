"use client";

import { FC, useEffect, useRef, useState } from "react";
import { createTimeline, createAnimatable } from "animejs";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  direction: number;
}

interface DeckParticleEffectProps {
  isActive: boolean;
  intensity?: number;
  duration?: number;
}

export const DeckParticleEffect: FC<DeckParticleEffectProps> = ({
  isActive,
  intensity = 8,
  duration = 2000
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles when effect becomes active
  useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < intensity; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 40 - 20, // Small spread around center
          y: Math.random() * 40 - 20,
          delay: Math.random() * 500,
          direction: Math.random() * 360
        });
      }
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, intensity]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0 || !containerRef.current) return;

    const particleElements = containerRef.current.querySelectorAll('.deck-particle');
    if (particleElements.length === 0) return;

    const timeline = createTimeline({
      loop: isActive,
      duration: duration
    });

    particleElements.forEach((element, index) => {
      const particle = particles[index];
      if (!particle) return;

      // Set initial state
      createAnimatable(element, {
        translateX: 0,
        translateY: 0,
        scale: 0,
        opacity: 0
      });

      // Particle animation
      timeline.add(element, {
        translateX: particle.x * 3,
        translateY: particle.y * 3,
        scale: [0, 1, 0],
        opacity: [0, 0.6, 0],
        rotate: particle.direction,
        duration: 1000,
        easing: 'easeOutQuart',
        delay: particle.delay
      }, 0);
    });

  }, [particles, isActive, duration]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="deck-particle absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-1.5 h-1.5 bg-blue-400/70 rounded-full shadow-sm" />
        </div>
      ))}
    </div>
  );
};