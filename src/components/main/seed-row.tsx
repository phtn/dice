"use client";

import { SeedPair } from "@/app/utils/rng";
import { useRNGCtx } from "@/app/ctx/rng-ctx";

export const SeedRow = () => {
  const { seedPair, generateSeeds } = useRNGCtx();

  return (
    <div className="flex w-full p-4 h-fit rounded-xl bg-zinc-900/50 row-start-2 items-start justify-between">
      <SeedValues {...seedPair} />
      <GenerateNewSeed generateFn={generateSeeds} />
    </div>
  );
};

const SeedValues = ({ cS, sS, nonce }: SeedPair) => {
  return (
    <ul className="list-inside text-sm/6 space-y-3 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
      <li className="tracking-[-.01em] space-x-4 flex">
        <div className="w-16 text-right">
          <code className="bg-black/[.05] text-zinc-400 dark:bg-white/[.06] tracking-wide text-xs px-1.5 py-0.5 rounded-md font-[family-name:var(--font-geist-mono)] font-semibold">
            client
          </code>
        </div>
        <span className="tracking-widest text-teal-200/90 font-semibold">
          {cS}
        </span>
      </li>
      <li className="tracking-[-.01em] space-x-4 flex">
        <div className="w-16 text-right">
          <code className="bg-black/[.05] text-zinc-400 dark:bg-white/[.06] tracking-wide text-xs px-1.5 py-0.5 rounded-md font-[family-name:var(--font-geist-mono)] font-semibold">
            server
          </code>
        </div>
        <span className="tracking-widest text-indigo-200/90 font-semibold">
          {sS}
        </span>
      </li>
      <li className="tracking-[-.01em] space-x-4 flex">
        <div className="w-16 text-right">
          <code className="bg-black/[.05] text-zinc-400 dark:bg-white/[.06] tracking-wide text-xs px-1.5 py-0.5 rounded-md font-[family-name:var(--font-geist-mono)] font-semibold">
            nonce
          </code>
        </div>
        <span className="tracking-widest text-indigo-200/80 font-semibold">
          {nonce}
        </span>
      </li>
    </ul>
  );
};

interface GenerateNewSeedProps {
  generateFn: VoidFunction;
}
const GenerateNewSeed = ({ generateFn }: GenerateNewSeedProps) => {
  return (
    <div>
      <button
        className="rounded-xl border bg-zinc-400 border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full"
        onClick={generateFn}
      >
        New Seed
      </button>
    </div>
  );
};
