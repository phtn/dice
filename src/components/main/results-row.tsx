"use client";

import { useBetCtx } from "@/app/ctx/bet-ctx";
import { useRNGCtx } from "@/app/ctx/rng-ctx";
import { HyperList } from "../hyper/list";
import { cn } from "@/lib/utils";

export const ResultsRow = () => {
  const { results } = useRNGCtx();
  const { betAmount, multiplier } = useBetCtx();

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <HyperList
        data={results.reverse().slice(results.length - 15)}
        direction="left"
        delay={0}
        component={ResultItem}
        container="h-10 flex space-x-2 justify-end items-center overflow-x-scroll"
      />
      <div className="grid grid-cols-4 md:gap-4 text-zinc-300 w-full h-20 rounded-xl row-start-2 items-start justify-between">
        <div className="flex flex-col items-start pt-2 justify-center space-y-1 px-4 bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/10">
          <span className="text-zinc-400 text-sm">Bet Amount</span>
          <span className="text-xl font-semibold">{betAmount}</span>
        </div>
        <div className="flex flex-col w-full px-2 pt-2 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/10">
          <span className="text-zinc-400">Multiplier</span>
          <span className="text-teal-500 text-lg font-semibold">
            x{multiplier.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col w-full px-2 pt-2 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/10">
          <span className="text-zinc-400">Payout</span>
          <span className="text-lg font-semibold">
            $ {(betAmount * multiplier).toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col w-full px-2 pt-2 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/10">
          <span className="text-zinc-400">Profit/Loss</span>
          <span className="text-lg font-semibold">
            $ {(betAmount * multiplier).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

interface IResultItem {
  value?: number;
  type: "win" | "lose";
}
const ResultItem = (item: IResultItem) => (
  <div
    className={cn(
      "text-zinc-300 h-8 font-semibold tracking-tighter flex items-center bg-zinc-600/40 w-14 justify-center rounded-md",
      { "bg-green-600 text-white font-semibold": item.type === "win" },
    )}
  >
    {item.value?.toFixed(2) ?? 0}
  </div>
);
