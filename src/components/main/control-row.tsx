"use client";

import { useBetCtx } from "@/app/ctx/bet-ctx";
import { useRNGCtx } from "@/app/ctx/rng-ctx";
import { useCallback, useMemo, useRef } from "react";
import { HyperList } from "../hyper/list";
import { useAccountCtx } from "@/app/ctx/acc-ctx/account-ctx";
import { generateId } from "ai";
import { setAccount } from "@/app/actions";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { AUTOPLAYS, BetAmountMulticand } from "@/app/ctx/bet-ctx/bet-ctx";

export const ControlRow = () => {
  const { generateSeeds, rollDice, seedPair, setResults, result } = useRNGCtx();
  const {
    setBet,
    betAmount,
    multiplier,
    x,
    autoplayCount,
    isAutoplaying,
    setAutoplayCount,
    setIsAutoplaying,
  } = useBetCtx();
  const { balance, getBalance, updateBalance } = useAccountCtx();
  // const [bal, setBal] = useState<number | undefined>(balance?.amount);

  const handleDiceRoll = useCallback(async () => {
    const currentBetAmount = betAmount; // Capture current bet amount
    const currentMultiplier = multiplier; // Capture current multiplier
    // const currentX = x; // Capture current x

    rollDice(
      {
        seedPair: {
          clientSeed: seedPair.cS,
          serverSeed: seedPair.sS,
          nonce: seedPair.nonce,
        },
      },
      (r = result) => {
        generateSeeds();
        const balAmount =
          balance &&
          balance.amount +
            currentBetAmount * (r < x ? -1 : currentMultiplier) -
            (r < x ? 0 : currentBetAmount);
        updateBalance(balAmount ?? 0 - currentBetAmount);
        setResults((prev) => [
          ...prev,
          { value: r, type: r > x ? "win" : "lose" },
        ]);
      },
    );
  }, [
    x,
    result,
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
    (type: BetAmountMulticand) => () => {
      setBet(type);
      getBalance();
    },
    [setBet, getBalance],
  );

  const timerRef = useRef<number | undefined>(undefined);
  const rollDiceRef = useRef<HTMLButtonElement>(null);

  const toggleAutoplay = useCallback(() => {
    // If already autoplaying, stop it
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
      setIsAutoplaying(false);
      setAutoplayCount(0);
      return;
    }

    // Start autoplaying
    setIsAutoplaying(true);
    setAutoplayCount(AUTOPLAYS);

    const autoplay = () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
      }
      setAutoplayCount((prevCount) => {
        if (prevCount >= 1) {
          rollDiceRef.current?.click();
          // Clear any existing timeout before setting a new one

          timerRef.current = +setTimeout(autoplay, 1000);
          return prevCount - 1;
        } else {
          // Stop autoplaying
          setIsAutoplaying(false);
          if (timerRef.current !== undefined) {
            clearTimeout(timerRef.current);
            timerRef.current = undefined;
          }
          return prevCount;
        }
      });
    };

    // Start the first iteration with a delay instead of immediately
    timerRef.current = +setTimeout(autoplay, 1000);
  }, [setIsAutoplaying, setAutoplayCount]); // Remove playCount from dependencies since we use the updater function

  const controls = useMemo(
    () =>
      [
        {
          fn: handleSetBet("zero"),
          label: 0,
        },
        { fn: handleSetBet("half"), label: "1/2" },
        { fn: handleSetBet("2x"), label: "2x" },
        { fn: handleSetBet("max"), label: "max" },
      ] as IButtonItem[],
    [handleSetBet],
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
          className="rounded-3xl md:w-36 w-32 ps-4 py-3 bg-zinc-500/10 transition-colors flex flex-col items-start justify-center text-sky-100 gap-2 whitespace-nowrap"
        >
          <span className="text-zinc-400 text-sm">Balance:</span>{" "}
          <span className="font-medium text-xl tracking-tight">
            <span className="text-zinc-300 font-normal">$</span>{" "}
            {balance?.amount?.toFixed(2)}
          </span>
        </button>
        <HyperList
          data={controls}
          component={ButtonItem}
          direction="right"
          itemStyle={cn({ "pointer-events-none select-none": isAutoplaying })}
          container="flex overflow-hidden p-1 space-x-1"
        />
      </div>
      <div className="h-24 flex items-center space-x-4 justify-center w-full">
        <button
          ref={rollDiceRef}
          onClick={handleDiceRoll}
          className={cn(
            "flex items-center justify-center gap-4",
            "rounded-2xl border border-zinc-700 bg-zinc-200",
            "cursor-pointer disabled:cursor-auto whitespace-nowrap",
            "transition-colors text-zinc-600 font-medium text-sm",
            "h-20 sm:h-16 px-16 sm:px-10 sm:w-auto w-64",
          )}
        >
          <Icon
            size={12}
            className={"shrink-0 text-zinc-800"}
            name={isAutoplaying ? "spinners-3-dots-move" : "re-up.ph"}
          />
          <span
            className={cn(
              "text-lg capitalize font-space text-zinc-800 font-bold",
              {
                "text-orange-500": betAmount === 0,
                "text-sky-600": isAutoplaying,
              },
            )}
          >
            {isAutoplaying ? "autoplaying" : "play"}
          </span>
        </button>
        <button
          onClick={toggleAutoplay}
          className={cn(
            "flex items-center justify-between w-24 aspect-square",
            "rounded-3xl border border-zinc-600 bg-zinc-800",
            "cursor-pointer disabled:cursor-auto",
            "transition-colors text-zinc-600 font-medium text-sm",
            "h-20 sm:h-16 px-3 sm:px-10 sm:w-auto",
            { "text-xl font-bold text-white bg-sky-400": isAutoplaying },
          )}
        >
          <Icon
            name="tri"
            size={16}
            className={cn("text-sky-400 shrink-0", {
              "text-zinc-50": isAutoplaying,
            })}
          />
          <div
            className={cn(
              "text-lg capitalize tracking-tight leading-none font-space text-sky-400 font-bold",
              { "text-white": isAutoplaying },
            )}
          >
            {isAutoplaying ? autoplayCount : "auto"}
          </div>
        </button>
      </div>
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
    className="rounded-3xl border border-solid border-zinc-700 text-sm cursor-pointer disabled:cursor-auto transition-colors flex items-center justify-center text-zinc-300 gap-2 hover:opacity-80 dark:hover:opacity-80 font-medium h-16 aspect-square px-2 whitespace-nowrap"
  >
    {item.label}
  </button>
);
