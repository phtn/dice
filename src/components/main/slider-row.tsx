"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
// import { Slider } from "@/components/ui/slider";
import { motion } from "motion/react";
import { Slider } from "../ui/slider";
import Image from "next/image";
import { useRNGCtx } from "@/ctx/rng-ctx";
import { cn } from "@/lib/utils";
import { useBetCtx } from "@/ctx/bet-ctx";
import { useSFX } from "@/lib/hooks/use-sfx";

export const SliderRow = () => {
  const { result } = useRNGCtx();
  const { setMult, isAutoplaying, gameType } = useBetCtx();

  const [prevRandomNumber, setPrevRandomNumber] = useState(
    gameType === "dice" ? 0 : 1.01,
  ); // Track previous value
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [tilt, setTilt] = useState(0);
  const [sliderValue, setSliderValue] = useState<number[]>([
    gameType === "dice" ? 50 : 1,
  ]);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Calculate tilt based on movement direction and distance
  const calculateTilt = useCallback(() => {
    if (isFirstRun) return 0;

    const distance = Math.abs(result - prevRandomNumber);
    const direction = result > prevRandomNumber ? 1 : -1;

    const maxTilt = 12; // Increased max tilt for more variance

    // Quadratic curve for tilt calculation:
    const tiltAmount = maxTilt * Math.pow(distance / 100, 2); // Non-linear relationship

    return direction * -tiltAmount;
    /* eslint-disable-next-line */
  }, [isFirstRun, result]);

  useEffect(() => {
    let delay: NodeJS.Timeout;
    if (result) {
      setIsPlaying(true);
      if (isFirstRun) {
        setIsFirstRun(false);
      }
      setTilt(calculateTilt());
      setPrevRandomNumber(result);
      setIsAnimating(true);

      delay = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }

    return () => clearTimeout(delay);
  }, [result, isFirstRun, calculateTilt]);

  const handleSliderChange = useCallback(
    (value: number[]) => {
      setIsPlaying(false);
      setSliderValue(value);
      setMult(value[0], gameType);
    },
    [setMult, gameType],
  );

  const absChg = useMemo(
    () => Math.abs(prevRandomNumber - result),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result],
  );

  const { winSFX: fx, stepSFX: step } = useSFX();

  const sV = useMemo(
    () =>
      gameType === "dice"
        ? Math.floor(sliderValue[0])
        : sliderValue[0] / 11.2 + 1,
    [gameType, sliderValue],
  );

  const rV = useMemo(
    () => (gameType === "dice" ? Math.floor(result) : (1 / result) * 98),
    [gameType, result],
  );
  useEffect(() => {
    if (isPlaying) {
      if (rV > sV) fx();
    }
  }, [isPlaying, fx, rV, sV]);

  useEffect(() => {
    if (isAnimating) {
      if (tilt >= 3) step({ playbackRate: 2.4 });
      if (tilt >= 1) step({ playbackRate: 2.0 });
      if (tilt <= 1) step({ playbackRate: 1.6 });
      console.log(Math.abs(tilt));
    }
  }, [isAnimating, tilt, step]);

  return (
    <div className="w-[95vw] mx-auto md:w-3xl mt-28 md:px-6 py-6 border border-zinc-700 rounded-xl text-white">
      <div className="relative w-auto mb-12" ref={sliderContainerRef}>
        {/* Random Number Badge */}
        <motion.div
          id="hex-result"
          key={`random-${rV}`}
          initial={{
            left: isFirstRun
              ? "0%"
              : `${gameType === "dice" && prevRandomNumber}%`,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            left: `${rV.toFixed(0)}%`,
            rotate: isAnimating ? `${tilt}deg` : "0deg",
            scale: isAnimating ? (absChg > 40 ? 0.95 : 1) : 1,
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
              stiffness: 180,
              damping: 10,
              duration: 0.05,
            },
            scale: {
              type: "spring",
              stiffness: 200,
              damping: 10,
              duration: 0.05,
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
          <div
            className={cn(
              "bg-white rotate-[30deg] text-black font-semibold clip-hexagon flex items-center justify-center",
              { "bg-blink-green/80": rV < sV },
            )}
          >
            <div
              className={cn(
                "clip-hexagon rotate-0 ease-in bg-zinc-300 absolute scale-[99%]",
                {
                  "bg-blink-green rotate-[30deg] duration-[5s]": rV > sV,
                },
              )}
            />
            <div className="clip-hexagon bg-zinc-800 absolute scale-[90%]" />
            <div
              className={cn(
                "-rotate-[30deg] font-bold font-sans text-lg text-zinc-300 tracking-tighter",
                {
                  "text-white": rV > sV,
                },
              )}
            >
              {rV.toFixed(2)}
            </div>
          </div>
        </motion.div>

        {/* Slider Position Indicator */}
        <motion.div
          className="absolute font-mono -top-9 rounded-full bg-zinc-950 leading-none transform -translate-x-1/2 text-zinc-300 font-bold px-2 pt-1.5 text-xs"
          animate={{
            left: `${gameType === "dice" && sV}%`,
          }}
        >
          {sV.toFixed(2)}
        </motion.div>

        {/* Slider Background */}
        <div
          className="absolute -top-1 inset-0 rounded-full"
          style={{
            background:
              gameType === "dice"
                ? `linear-gradient(to right, #f87171 0%, #f87171 ${sV}%, #4ade80 ${sV}%, #4ade80 100%)`
                : "",
          }}
        />

        {/* Slider Component */}
        <Slider
          step={gameType === "dice" ? 1 : 0.01}
          min={gameType === "dice" ? 2 : 0.1}
          max={99.99}
          value={sliderValue}
          disabled={isAutoplaying}
          className="z-10 relative"
          onValueChange={handleSliderChange}
        />

        <div
          style={{ left: `${sliderValue[0]}%` }}
          className="absolute -ml-[14px] justify-center top-4 pointer-events-none select-none"
        >
          <Image
            className={cn("dark:invert relative", {
              "rotate-180": gameType === "limbo",
            })}
            src="/vercel.svg"
            alt="Delta Pointer"
            width={28}
            height={28}
          />
        </div>
      </div>

      {gameType === "dice" ? <DiceRange /> : <LimboRange />}
    </div>
  );
};

const DiceRange = () => (
  <div className="flex justify-between pointer-events-none select-none text-zinc-400/80">
    <span className="flex w-full">0</span>
    <span className="flex w-full">25</span>
    <div className="px-1.5 flex border justify-center rounded-md border-zinc-400/30">
      <span className="text-zinc-400">50</span>
    </div>
    <span className="w-full flex justify-end">75</span>
    <span className="w-full flex justify-end">100</span>
  </div>
);
const LimboRange = () => (
  <div className="flex justify-between pointer-events-none select-none text-zinc-400/80">
    <span className="flex w-full">1</span>
    <span className="flex w-full">2</span>
    <span className="flex w-full">3</span>
    <span className="flex w-full">4</span>
    <div className="px-1.5 flex border justify-center rounded-md border-zinc-400/30">
      <span className="text-zinc-400">5</span>
    </div>

    <span className="w-full flex justify-end">6</span>
    <span className="w-full flex justify-end">7</span>
    <span className="w-full flex justify-end">8</span>
    <span className="w-full flex justify-end">9</span>
    <span className="w-full flex justify-end">10</span>
  </div>
);
