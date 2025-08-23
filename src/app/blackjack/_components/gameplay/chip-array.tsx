"use client";

import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { Chip } from "../chip";
import type { Dispatch, SetStateAction } from "react";

interface ChipArrayProps {
  balanceAmount: number;
  slotBets: { [key: number]: number };
  activeSlot: number;
  multiSlotMode: boolean;
  lastSlotBets: { [key: number]: number };
  setSlotBets: Dispatch<SetStateAction<{ [key: number]: number }>>;
  setBetHistory: Dispatch<SetStateAction<number[]>>;
  gameState: string;
}

const ChipArrayComponent = ({
  balanceAmount,
  slotBets,
  activeSlot,
  multiSlotMode,
  lastSlotBets,
  setSlotBets,
  setBetHistory,
  gameState,
}: ChipArrayProps) => {
  const chipValues = useMemo(() => [25, 50, 100, 250, 1000], []);
  const radius = 15;
  const angleStart = -Math.PI;
  const angleEnd = 0;
  const centerX = 0;
  const centerY = 0;
  const angleStep = (angleEnd - angleStart) / (chipValues.length - 1);

  const arcPositions = useMemo(
    () =>
      chipValues.map((_, index) => {
        const angle = angleStart + index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return { x, y };
      }),
    [chipValues, angleStart, angleStep],
  );

  return (
    <motion.div
      initial="hidden"
      animate={{
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.25,
        },
      }}
      className="relative bottom-0 border rounded-xl h-48 mx-auto mt-0 w-full flex justify-center items-center"
    >
      {chipValues.map((chipValue, i) => {
        const { x, y } = arcPositions[i];
        return (
          <motion.button
            key={chipValue}
            initial={{ opacity: 0, x, y: y + 10 }}
            animate={{ opacity: 1, x, y }}
            transition={{
              type: gameState === "betting" && "spring",
              visualDuration: 0.2,
              bounce: 0.2,
              delay: i * 0.12,
            }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const totalCurrentBet = Object.values(slotBets).reduce(
                (sum, bet) => sum + bet,
                0,
              );

              if (multiSlotMode) {
                const activeSlots = Object.entries(lastSlotBets)
                  .filter(([, bet]) => bet > 0)
                  .map(([slot]) => parseInt(slot));

                const totalChipCost = chipValue * activeSlots.length;

                if (balanceAmount >= totalCurrentBet + totalChipCost) {
                  setSlotBets((prev) => {
                    const newBets = { ...prev };
                    activeSlots.forEach((slot) => {
                      newBets[slot] = prev[slot] + chipValue;
                    });
                    return newBets;
                  });
                  setBetHistory((prev: number[]) => [...prev, totalChipCost]);
                }
              } else {
                if (balanceAmount >= totalCurrentBet + chipValue) {
                  setSlotBets((prev) => ({
                    ...prev,
                    [activeSlot]: prev[activeSlot] + chipValue,
                  }));
                  setBetHistory((prev: number[]) => [...prev, chipValue]);
                }
              }
            }}
            className="disabled:opacity-50 cursor-not-allowed"
          >
            <Chip value={chipValue} />
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export const ChipArray = memo(ChipArrayComponent);
