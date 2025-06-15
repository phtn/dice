"use client";

import { useBetCtx } from "@/app/ctx/bet-ctx";
import { useRNGCtx } from "@/app/ctx/rng-ctx";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import { HyperList } from "../hyper/list";
import { useAccountCtx } from "@/app/ctx/acc-ctx/account-ctx";
import { generateId } from "ai";
import { setAccount } from "@/app/actions";

export const ControlRow = () => {
  const { generateSeeds, rollDice, seedPair, setResults } = useRNGCtx();
  const { setBet, betAmount, multiplier, x } = useBetCtx();
  const { balance, getBalance, updateBalance } = useAccountCtx();
  // const [bal, setBal] = useState<number | undefined>(balance?.amount);

  const handleDiceRoll = useCallback(async () => {
    generateSeeds();
    const currentBetAmount = betAmount; // Capture current bet amount
    const currentMultiplier = multiplier; // Capture current multiplier
    // const currentX = x; // Capture current x

    rollDice({ seedPair }, (result: number) => {
      const balAmount =
        balance &&
        balance.amount +
          currentBetAmount * (result < x ? -1 : currentMultiplier) -
          (result < x ? 0 : currentBetAmount);
      console.log(result < x, result, x);
      updateBalance(balAmount ?? 0 - currentBetAmount);
      setResults((prev) => [
        ...prev,
        { value: result, type: result > x ? "win" : "lose" },
      ]);
    });
  }, [
    x,
    balance,
    seedPair,
    rollDice,
    betAmount,
    setResults,
    multiplier,
    generateSeeds,
    updateBalance,
  ]);

  const handleSetBet = useCallback(
    (x: number) => () => {
      setBet(x);
      getBalance();
    },
    [setBet, getBalance],
  );

  const controls = useMemo(
    () =>
      [
        {
          fn: handleSetBet(0),
          label: 0,
        },
        { fn: handleSetBet(0.5), label: "1/2" },
        { fn: handleSetBet(2), label: "2x" },
        { fn: handleSetBet(balance?.amount ?? 0), label: "max" },
      ] as IButtonItem[],
    [handleSetBet, balance],
  );

  const handleSetAccount = useCallback(async () => {
    await setAccount({
      id: generateId(),
      balance: { currencyCode: "PHP", fractionalDigits: 2, amount: 420.69 },
    });
    await getBalance();
  }, [getBalance]);

  return (
    <div className="flex gap-4 items-center h-80 flex-col">
      <div className="h-24 flex items-center space-x-4 justify-evenly w-full">
        <button
          onClick={handleSetAccount}
          className="rounded-3xl w-36 transition-colors flex flex-col items-start justify-center text-sky-300 gap-2 h-16 aspect-square px-2 whitespace-nowrap"
        >
          <span className="text-zinc-300">Balance:</span>{" "}
          <span className="font-semibold text-lg">
            <span className="text-zinc-300">$</span>{" "}
            {balance?.amount?.toFixed(2)}
          </span>
        </button>
        <HyperList
          data={controls}
          component={ButtonItem}
          direction="right"
          container="flex overflow-hidden space-x-1"
        />
      </div>
      <button
        onClick={handleDiceRoll}
        className="rounded-2xl border border-solid transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-16 sm:h-12 px-16 sm:px-5 sm:w-auto whitespace-nowrap"
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

interface IButtonItem {
  fn: VoidFunction;
  label: string | number;
}
const ButtonItem = (item: IButtonItem) => (
  <button
    onClick={item.fn}
    className="rounded-3xl border border-solid text-sm cursor-pointer disabled:cursor-auto border-transparent transition-colors flex items-center justify-center bg-zinc-400 text-zinc-900 gap-2 hover:opacity-80 dark:hover:opacity-80 font-medium h-16 aspect-square px-2 whitespace-nowrap"
  >
    {item.label}
  </button>
);
