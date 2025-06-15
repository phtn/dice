"use client";

import { useState, useRef, useEffect, useCallback } from "react";
// import { Slider } from "@/components/ui/slider";
import { motion } from "motion/react";
import { Slider } from "../ui/slider";
import Image from "next/image";
import { useRNGCtx } from "@/app/ctx/rng-ctx";
import { cn } from "@/lib/utils";
import { useBetCtx } from "@/app/ctx/bet-ctx";

export const SliderRow = () => {
  const { result } = useRNGCtx();
  const { setMult } = useBetCtx();

  const [prevRandomNumber, setPrevRandomNumber] = useState(0); // Track previous value
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [tilt, setTilt] = useState(0);
  const [sliderValue, setSliderValue] = useState<number[]>([50]);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Calculate tilt based on movement direction and distance
  const calculateTilt = useCallback(() => {
    if (isFirstRun) return 0;

    const distance = Math.abs(result - prevRandomNumber);
    const direction = result > prevRandomNumber ? 1 : -1;

    const maxTilt = 18; // Increased max tilt for more variance

    // Quadratic curve for tilt calculation:
    const tiltAmount = maxTilt * Math.pow(distance / 100, 2); // Non-linear relationship

    return direction * -tiltAmount;
  }, [isFirstRun, result, prevRandomNumber]);

  useEffect(() => {
    let delay: NodeJS.Timeout;
    if (result) {
      setTilt(calculateTilt());
      setPrevRandomNumber(result);
      // Generate new random number
      setIsAnimating(true);
      // No longer first run
      if (isFirstRun) {
        setIsFirstRun(false);
      }
      delay = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }

    // Reset animation state after animation completes

    return () => clearTimeout(delay);
  }, [result, isFirstRun, calculateTilt]);

  const handleSliderChange = useCallback(
    (value: number[]) => {
      setSliderValue(value);
      setMult(value[0]);
    },
    [setMult],
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-4  rounded-xl text-white">
      <div className="relative w-full mb-12" ref={sliderContainerRef}>
        {/* Random Number Badge */}

        <motion.div
          id="hex-result"
          key={`random-${result}`}
          initial={{
            left: isFirstRun ? "0%" : `${prevRandomNumber}%`,
            rotate: "0deg",
          }}
          animate={{
            left: `${result.toFixed(0)}%`,
            rotate: isAnimating ? `${tilt}deg` : "0deg",
          }}
          transition={{
            left: {
              type: "spring",
              stiffness: 120,
              damping: 20,
              duration: 0.5,
            },
            rotate: {
              type: "spring", // Spring for smooth rotation back to 0
              damping: 1,
              duration: 0.02,
            },
          }}
          style={{
            position: "absolute",
            top: "-84px", // Adjusted vertical position
            transformOrigin: "bottom center", // Set pivot point to bottom-center
          }}
          className={cn("absolute transform-all -translate-x-1/2", {
            "opacity-0": isFirstRun,
          })}
        >
          <div className="bg-white rotate-[30deg] text-black font-semibold text-xl clip-hexagon flex items-center justify-center">
            <div className="-rotate-[30deg] tracking-tighter">
              {result.toFixed(2)}
            </div>
          </div>
        </motion.div>

        {/* Slider Position Indicator */}
        <motion.div
          className="absolute -top-12 font-space transform -translate-x-1/2 text-zinc-300 px-2 py-1 rounded-md font-medium text-sm"
          animate={{ left: `${sliderValue[0]}%` }}
        >
          {sliderValue[0]}
        </motion.div>

        {/* Slider Background */}
        <div
          className="absolute -top-1 inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, #f87171 0%, #f87171 ${sliderValue[0]}%, #4ade80 ${sliderValue[0]}%, #4ade80 100%)`,
          }}
        />

        {/* Slider Component */}
        <Slider
          min={2}
          step={1}
          max={99.99}
          value={sliderValue}
          className="z-10 relative"
          onValueChange={handleSliderChange}
        />

        <div
          style={{ left: `${sliderValue[0]}%` }}
          className="absolute -ml-[12px] top-4 pointer-events-none select-none"
        >
          <Image
            className="dark:invert relative"
            src="/vercel.svg"
            alt="Vercel logomark"
            width={24}
            height={24}
          />
        </div>
      </div>

      <div className="flex justify-between pointer-events-none select-none text-zinc-400/60">
        <span className="flex w-full">0</span>
        <span className="flex w-full">25</span>
        <div className="px-2 flex border justify-center rounded-lg border-zinc-400/30">
          <span>50</span>
        </div>
        <span className="w-full flex justify-end">75</span>
        <span className="w-full flex justify-end">100</span>
      </div>
    </div>
  );
};
