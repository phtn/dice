"use client";

import { useRNGCtx } from "@/ctx/rng-ctx";
import { HyperList } from "../hyper/list";
import { cn } from "@/lib/utils";

export const ResultsRow = () => {
  const { results } = useRNGCtx();

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <HyperList
        delay={0}
        direction="left"
        component={ResultItem}
        data={results.slice(-15)}
        container="h-12 flex space-x-2 justify-center items-center overflow-x-scroll"
      />
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
      "text-zinc-50 text-sm h-8 font-semibold font-space tracking-tight flex items-center bg-zinc-600 w-14 justify-center rounded-lg",
      { "text-white font-semibold bg-green-500/80": item.type === "win" },
    )}
  >
    {item.value?.toFixed(2) ?? 0}
  </div>
);
