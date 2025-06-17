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
      "text-zinc-400 h-8 font-semibold tracking-tighter flex items-center bg-zinc-800 w-14 justify-center rounded-md",
      { "text-blink-green font-medium bg-blink-green/10": item.type === "win" },
    )}
  >
    {item.value?.toFixed(2) ?? 0}
  </div>
);
