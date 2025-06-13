"use client";

import { useRNGCtx } from "@/app/ctx/rng-ctx";
import Image from "next/image";
import { useCallback } from "react";

export const ControlRow = () => {
  const { generateSeeds, rollDice, seedPair } = useRNGCtx();
  const handleDiceRoll = useCallback(async () => {
    generateSeeds();
    await rollDice({ seedPair });
  }, [seedPair, rollDice, generateSeeds]);

  return (
    <div className="flex gap-4 flex-1 items-center h-64 flex-row">
      <button
        onClick={handleDiceRoll}
        className="rounded-2xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-16 sm:h-12 px-16 sm:px-5 sm:w-auto whitespace-nowrap"
      >
        <Image
          className="dark:invert"
          src="/vercel.svg"
          alt="Vercel logomark"
          width={12}
          height={12}
        />
        Roll Dice
      </button>
    </div>
  );
};
