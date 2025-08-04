import { useBetCtx } from "@/ctx/bet-ctx";

export const ParamsRow = () => {
  const { betAmount, multiplier } = useBetCtx();
  return (
    <div className="grid grid-cols-3 md:gap-4 text-zinc-300 w-full h-20 rounded-xl items-start justify-between">
      <div className="flex flex-col w-full p-4 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/70 rounded-lg via-zinc-900/30 to-zinc-900/10">
        <span className="text-zinc-400 text-sm">Bet Amount</span>
        <span className="text-xl font-medium tracking-tight">
          ${betAmount.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col w-full p-4 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/70 rounded-lg via-zinc-900/30 to-zinc-900/10">
        <span className="text-zinc-400 text-sm">Multiplier</span>
        <span className="text-teal-500 text-xl font-semibold">
          x{multiplier.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col w-full p-4 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/70 rounded-lg via-zinc-900/30 to-zinc-900/10">
        <span className="text-zinc-400 text-sm">Payout</span>
        <span className="text-zinc-300 text-xl font-semibold">
          $ {(betAmount * multiplier).toFixed(2)}
        </span>
      </div>
      <div className="hidden flex-col w-full p-4 space-y-1 items-start justify-center bg-gradient-to-br from-zinc-900/70 rounded-lg via-zinc-900/30 to-zinc-900/10">
        <span className="text-zinc-400 text-sm">Profit/Loss</span>
        <span className="text-zinc-300 text-xl font-semibold">
          $ {(betAmount * multiplier).toFixed(2)}
        </span>
      </div>
    </div>
  );
};
