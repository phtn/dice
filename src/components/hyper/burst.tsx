import { type ReactNode, useEffect, useRef, useState } from "react";
import { createTimeline, createAnimatable, engine, utils } from "animejs";
import { cn } from "@/lib/utils";

interface Props {
  shouldAnimate?: boolean;
  children?: ReactNode;
  speed?: number;
  duration?: number;
  count?: number;
}
export const Burst = ({
  shouldAnimate = false,
  speed = 60,
  duration = 2500,
  children,
  count = 16,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [_speed, setSpeed] = useState(speed);
  const [_shouldAnimate] = useState(shouldAnimate);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; scale: number; delay: number }>
  >([]);
  const [isClient, setIsClient] = useState(false);
  const animationRef = useRef<Animation | null>(null);

  // Utility function to generate random numbers
  // const random = (min: number, max: number, decimals: number = 0): number => {
  //   const value = Math.random() * (max - min) + min;
  //   return decimals === 0 ? Math.floor(value) : Number(value.toFixed(decimals));
  // };

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize particles
  useEffect(() => {
    if (!isClient) return;

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: utils.random(-12, 12, 1),
        y: utils.random(-3, 3, 2),
        scale: utils.random(0, _shouldAnimate ? 1.5 : 0, 0.0),
        delay: utils.random(0, 1000),
      });
    }
    setParticles(newParticles);
  }, [isClient, count, _shouldAnimate]);

  // Create burst animation
  useEffect(() => {
    if (!isClient || particles.length === 0) return;

    // Wait for DOM elements to be created
    setTimeout(() => {
      const particleElements =
        containerRef.current?.querySelectorAll(".particle");
      if (!particleElements) return;

      // Stop previous animation
      if (animationRef.current) {
        animationRef.current.pause();
      }

      // Create timeline for burst effect
      const timeline = createTimeline({
        defaults: { duration },
        delay: 0,
        loop: false,
        autoplay: _shouldAnimate,
      });

      particleElements.forEach((element, index) => {
        const particle = particles[index];
        if (!particle) return;

        // Set initial position and scale
        createAnimatable(element, {
          translateX: 0,
          translateY: 0,
          scale: 0,
          rotate: 0,
        });

        // Add bursting animation
        timeline.add(
          element,
          {
            translateX: particle.x + "rem",
            translateY: particle.y + "rem",
            opacity: [0, particle.scale, 0],
            scale: [0, particle.scale, 0],
            rotate: utils.random(-45, 45),
            delay: particle.delay,
            duration: duration + utils.random(0, 1000),
            loop: false,
          },
          0,
        );
      });

      animationRef.current = timeline as unknown as Animation;
    }, 100);

    return () => {
      if (animationRef.current && _shouldAnimate) {
        animationRef.current.play();
      }
    };
  }, [particles, isClient, _shouldAnimate, duration]);

  useEffect(() => {
    engine.fps = _speed;
  }, [_speed]);

  return (
    <div className="particles-wrapper flex flex-col items-center justify-center">
      <div
        className="large row container relative flex items-center justify-center overflow-hidden backdrop-blur-sm rounded-xl"
        ref={containerRef}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={cn(
              `particle absolute  via-cyan-200 bg-teal-100 rounded-[2.5px]`,
              {
                hidden: !_shouldAnimate || Math.abs(particle.y) === 0,
                // "hidden": Math.abs(particle.x) <= 4,
                "bg-pink-100": Math.abs(particle.x) <= 2,
                "bg-yellow-100 z-10": Math.abs(particle.x) <= 8,
                "bg-orange-300": Math.abs(particle.x) >= 4,
                " size-2": shouldAnimate,
              },
              "flex items-center justify-center",
            )}
          >
            {/*<div
              className={cn(
                `inner relative z-20 blur-sm rounded-[${particle.x}px]`,
                {
                  "bg-white": Math.abs(particle.x) <= 7,
                  "size-1.5": shouldAnimate,
                },
              )}
            />*/}
          </div>
        ))}

        {/* Center glow effect */}
        <div className="absolute inset-0 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
      <div className="medium hidden row mt-4">
        <fieldset className="controls">
          <label className="text-white text-sm font-medium mr-4">
            Speed: {_speed.toFixed(2)}x
          </label>
          <input
            type="range"
            min={0.1}
            max={2}
            value={_speed}
            step={0.01}
            className="range"
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </fieldset>
      </div>
    </div>
  );
};
