import { createAnimatable, createTimeline } from "animejs";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";

// Dynamic import for animejs to avoid module resolution issues
let anime: unknown;

interface Particle {
  id: number;
  x: number;
  y: number;
  baseScale: number;
  delay: number;
  element?: HTMLDivElement;
}

export const HyperDeal: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [precision, setPrecision] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(1);
  const [intensity, setIntensity] = useState<number>(150);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<Animation>(null);

  // Load animejs dynamically
  useEffect(() => {
    const loadAnime = async () => {
      if (!anime) {
        anime = await import("animejs");
      }
    };
    loadAnime();
  }, []);

  // Utility function to generate random numbers
  const random = (min: number, max: number, decimals: number = 0): number => {
    const value = Math.random() * (max - min) + min;
    return decimals === 0 ? Math.floor(value) : Number(value.toFixed(decimals));
  };

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < intensity; i++) {
      newParticles.push({
        id: i,
        x: random(-160, 160, 1), // Spread across container width
        y: random(-80, 80, 1), // Spread across container height
        baseScale: random(0.2, 1.5, 2),
        delay: random(0, 2000), // Stagger animations up to 2 seconds
      });
    }
    setParticles(newParticles);
  }, [intensity]);

  // Start Anime.js animation
  useEffect(() => {
    if (particles.length === 0 || !anime) return;

    // Stop previous animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    // Wait for DOM elements to be created
    setTimeout(() => {
      const particleElements =
        containerRef.current?.querySelectorAll(".particle");
      if (!particleElements) return;

      // Create timeline for smooth, continuous animation
      const timeline = createTimeline({
        loop: true,
      });

      particleElements.forEach((element, index) => {
        const particle = particles[index];
        if (!particle) return;

        // Set initial position and scale
        createAnimatable(element, {
          translateX: particle.x,
          translateY: particle.y,
          scale: 0,
        });

        // Add breathing/pulsing animation for each particle
        timeline.add(
          element,
          {
            scale: [
              { value: 0, duration: 0 },
              {
                value: particle.baseScale * (precision / 10 + 0.1),
                duration: 1000 + random(-200, 200),
              },
              { value: 0, duration: 1000 + random(-200, 200) },
            ],
            rotate: random(0, 360),
            delay: particle.delay,
            duration: 2000 * speed,
          },
          0,
        ); // Start all animations at the same time with individual delays

        // Add subtle floating movement
        timeline.add(
          element,
          {
            translateX: particle.x + random(-20, 20),
            translateY: particle.y + random(-20, 20),
            duration: 4000 * speed,
            delay: particle.delay,
            direction: "alternate",
          },
          0,
        );
      });

      animationRef.current = timeline as unknown as Animation;
    }, 100);

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [particles, precision, speed]);

  const handlePrecisionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrecision(parseInt(event.target.value, 10));
  };

  const handleSpeedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(event.target.value));
  };

  const handleIntensityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIntensity(parseInt(event.target.value, 10));
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center">
      <div
        ref={containerRef}
        className="container relative w-96 h-96 bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.3) 70%)",
        }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle absolute rounded-full transition-all duration-1000 ease-in-out"
            style={{
              left: "50%",
              top: "50%",
              width: "8px",
              height: "8px",
              background: `hsl(${200 + random(-50, 50)}, 70%, ${50 + random(-20, 30)}%)`,
              boxShadow: `0 0 ${random(10, 20)}px currentColor`,
              filter: "blur(0.5px)",
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) scale(${anime ? 0 : particle.baseScale * (precision / 10 + 0.1)})`,
            }}
          />
        ))}

        {/* Center glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="mt-8 space-y-4 bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/10">
        <div className="flex items-center space-x-4">
          <label
            htmlFor="precision"
            className="text-white text-sm font-medium min-w-[80px]"
          >
            Scale:
          </label>
          <input
            id="precision"
            type="range"
            min="1"
            max="20"
            step="1"
            value={precision}
            onChange={handlePrecisionChange}
            className="range w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-blue-300 text-sm font-mono min-w-[60px]">
            {precision}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <label
            htmlFor="speed"
            className="text-white text-sm font-medium min-w-[80px]"
          >
            Speed:
          </label>
          <input
            id="speed"
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
            className="range w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-blue-300 text-sm font-mono min-w-[60px]">
            {speed.toFixed(1)}x
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <label
            htmlFor="intensity"
            className="text-white text-sm font-medium min-w-[80px]"
          >
            Particles:
          </label>
          <input
            id="intensity"
            type="range"
            min="50"
            max="300"
            step="10"
            value={intensity}
            onChange={handleIntensityChange}
            className="range w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-blue-300 text-sm font-mono min-w-[60px]">
            {intensity}
          </span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .slider:hover::-webkit-slider-thumb {
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};
