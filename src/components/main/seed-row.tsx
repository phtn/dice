"use client";

import { SeedPair } from "use-rng";
import { useRNGCtx } from "@/app/ctx/rng-ctx";

export const SeedRow = () => {
  const { seedPair, generateSeeds } = useRNGCtx();

  return (
    <div className="pt-2 flex w-full h-fit rounded-xl bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/10 row-start-2 items-start justify-between">
      <SeedValues
        clientSeed={seedPair.cS}
        serverSeed={seedPair.sS}
        nonce={seedPair.nonce}
      />
      <GenerateNewSeed generateFn={generateSeeds} />
    </div>
  );
};

const SeedValues = ({ clientSeed: cS, serverSeed: sS, nonce }: SeedPair) => {
  return (
    <ul className="list-inside text-sm/6 space-y-0.5 text-center sm:text-left">
      <li className="tracking-[-.01em] space-x-4 flex">
        <div className="w-16 text-right">
          <code className="bg-black/[.05] text-zinc-400 dark:bg-white/[.06] tracking-wide text-xs px-1.5 py-0.5 rounded-md font-[family-name:var(--font-geist-mono)] font-semibold">
            client
          </code>
        </div>
        <span className="tracking-widest text-sky-300/90 font-space">{cS}</span>
      </li>
      <li className="tracking-[-.01em] space-x-4 flex">
        <div className="w-16 text-right">
          <code className="bg-black/[.05] text-zinc-500 dark:bg-white/[.06] tracking-wide text-xs px-1.5 py-0.5 rounded-md font-[family-name:var(--font-geist-mono)] font-semibold">
            server
          </code>
        </div>
        <span className="tracking-widest text-indigo-300/90 font-space">
          {sS}
        </span>
      </li>
      <li className="tracking-[-.01em] space-x-4 flex">
        <div className="w-16 text-right">
          <code className="bg-black/[.05] text-zinc-600 dark:bg-white/[.06] tracking-wide text-xs px-1.5 py-0.5 rounded-md font-[family-name:var(--font-geist-mono)] font-semibold">
            nonce
          </code>
        </div>
        <span className="tracking-widest text-orange-200/80 font-space">
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
