"use client";

import { useRNGCtx } from "@/app/ctx/rng-ctx";
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
        data={results.reverse().slice(results.length - 15)}
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
      "text-zinc-50 text-[14px] h-8 font-bold font-space tracking-tight flex items-center bg-zinc-600 w-16 justify-center rounded-lg",
      { "text-white font-bold bg-green-500/80": item.type === "win" },
    )}
  >
    {item.value?.toFixed(2) ?? 0}
  </div>
);
