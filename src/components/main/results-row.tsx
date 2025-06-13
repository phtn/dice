"use client";

import { useBetCtx } from "@/app/ctx/b-ctx";
import { useRNGCtx } from "@/app/ctx/rng-ctx";

export const ResultsRow = () => {
  const { result } = useRNGCtx();
  const { x, betAmount } = useBetCtx();

  return (
    <div className="border h-40 w-full">
      <div className="h-20">
        <h1 className="text-7xl text-zinc-400">
          {result?.toFixed(2) ?? "0.00"}
        </h1>
      </div>
      <div className="h-20 text-white border grid grid-cols-5 w-full">
        <div className="flex items-center col-span-2 justify-center">
          {betAmount}
        </div>
        <div className="flex w-full col-span-2 px-3 font-semibold items-center justify-between">
          <div>{betAmount * x}</div>
        </div>
        <div className="flex px-3 flex-1 items-center justify-center">
          <div className="text-teal-500">x{x}</div>
        </div>
      </div>
    </div>
  );
};
