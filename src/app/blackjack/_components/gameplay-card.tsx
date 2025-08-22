"use client";

import {
  Card as CardComp,
  CardAction,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx";
import { useAccountCtx } from "@/ctx/acc-ctx";
import { Chip } from "./chip";
import { PlayingCard } from "./playing-card";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { Card, GameResult, Hand } from "@/ctx/blackjack-ctx/types";
import { opts } from "@/utils/helpers";
import { getBaseStrategy } from "@/components/blackjack/strategy-guide";
import { Burst } from "@/components/hyper/burst";
import { IPlayerAction, PlayerAction } from "./player-actions";
import { HyperList } from "@/components/hyper/list";

// Helper function to format hand value display
const formatHandValue = (hand: Hand, gameResult?: GameResult) => {
  if (hand.isBlackjack) {
    return hand.value.toString();
  }

  // If hand has aces and the low/high values are different, show both
  const hasAces = hand.cards.some((card: Card) => card.rank === "A");
  if (hasAces && hand.lowValue !== hand.highValue && !hand.isBust) {
    return gameResult === null
      ? `${hand.lowValue} | ${hand.highValue}`
      : `${hand.highValue}`;
  }

  return hand.value.toString() === "0" ? "" : hand.value.toString();
};

export const GameplayCard = () => {
  const {
    gameState,
    gameResult,
    playerHands,
    dealerHand,
    activeHandIndex,
    betAmount,
    setBetAmount,
    netWinnings,
    startNewGame,
    hit,
    stand,
    doubleDown,
    split,
    canDoubleDown,
    canHit,
    canStand,
    canSplit,
    toggleAutoReturnToBetting,
    autoReturnToBetting,
    startNewBet,
  } = useBlackjackCtx();

  const { balance, resetBalance } = useAccountCtx();

  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [lastSlotBets, setLastSlotBets] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
  });
  const [betHistory, setBetHistory] = useState<number[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [slotBets, setSlotBets] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
  });
  const [multiSlotMode, setMultiSlotMode] = useState(false);

  const baseStrategy = useMemo(
    () =>
      gameState === "player-turn" &&
      playerHands[activeHandIndex] &&
      getBaseStrategy(
        playerHands[activeHandIndex],
        dealerHand.cards[0],
        canDoubleDown,
        canSplit,
      ),
    [
      gameState,
      canDoubleDown,
      canSplit,
      dealerHand.cards,
      playerHands,
      activeHandIndex,
    ],
  );

  // Clear bet history when returning to betting phase
  useEffect(() => {
    if (gameState === "betting" && betAmount === 0) {
      setBetHistory([]);
      setSlotBets({ 0: 0, 1: 0, 2: 0 });
      setActiveSlot(0);
      setMultiSlotMode(false);
    }
  }, [gameState, betAmount]);

  // Update total bet amount when slot bets change
  useEffect(() => {
    const totalBet = Object.values(slotBets).reduce((sum, bet) => sum + bet, 0);
    setBetAmount(totalBet);
  }, [slotBets, setBetAmount]);

  const handleUndo = useCallback(() => {
    if (betHistory.length > 0) {
      const lastChip = betHistory[betHistory.length - 1];
      setSlotBets((prev) => ({
        ...prev,
        [activeSlot]: Math.max(0, prev[activeSlot] - lastChip),
      }));
      setBetHistory((prev: number[]) => prev.slice(0, -1));
    }
  }, [betHistory, activeSlot]);

  const handleClearBet = useCallback(() => {
    setSlotBets((prev) => ({ ...prev, [activeSlot]: 0 }));
    setBetHistory([]);
  }, [activeSlot]);

  // Save the bet amount when starting a new game
  const handleStartNewGame = useCallback(() => {
    setLastBetAmount(betAmount);
    setLastSlotBets({ ...slotBets });
    // Pass slot bets to context
    const activeBets = Object.fromEntries(
      Object.entries(slotBets).filter(([, bet]) => bet > 0),
    );
    startNewGame(activeBets);
  }, [betAmount, startNewGame, slotBets]);

  const handleReplay = useCallback(() => {
    if (lastBetAmount > 0 && (balance?.amount || 0) >= lastBetAmount) {
      setSlotBets({ ...lastSlotBets });
      // Enable multi-slot mode for adding to all active slots
      const activeSlots = Object.entries(lastSlotBets).filter(
        ([, bet]) => bet > 0,
      );
      setMultiSlotMode(activeSlots.length > 1);
      // Reconstruct bet history with total amount
      setBetHistory([lastBetAmount]);
    }
  }, [balance?.amount, lastBetAmount, lastSlotBets]);
  const getResultMessage = useCallback(() => {
    switch (gameResult) {
      case "player-blackjack":
        return "Blackjack!";
      case "player-wins":
        return "You win!";
      case "dealer-blackjack":
        return "Dealer Blackjack.";
      case "dealer-wins":
        return "Dealer wins.";
      case "push":
        return "PUSH";
      default:
        return "";
    }
  }, [gameResult]);

  // Create a completely static ChipArray that never re-renders
  const ChipArray = useCallback(() => {
    const chipValues = [25, 50, 100, 250, 1000];
    const radius = 15;
    const angleStart = -Math.PI;
    const angleEnd = 0;
    const centerX = 0;
    const centerY = 0;
    const angleStep = (angleEnd - angleStart) / (chipValues.length - 1);

    const arcPositions = chipValues.map((_, index) => {
      const angle = angleStart + index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y };
    });

    return (
      <motion.div
        initial="hidden"
        animate={{
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.25,
          },
        }}
        className="relative bottom-0 border rounded-xl h-48 mx-auto mt-0 w-full flex justify-center items-center"
      >
        {chipValues.map((chipValue, i) => {
          const { x, y } = arcPositions[i];
          return (
            <motion.button
              key={chipValue}
              initial={{ opacity: 0, x, y: y + 10 }}
              animate={{ opacity: 1, x, y }}
              transition={{
                type: gameState === "betting" && "spring",
                visualDuration: 0.2,
                bounce: 0.2,
                delay: i * 0.12,
              }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const totalCurrentBet = Object.values(slotBets).reduce(
                  (sum, bet) => sum + bet,
                  0,
                );

                if (multiSlotMode) {
                  // Add to all slots that had bets in the previous game
                  const activeSlots = Object.entries(lastSlotBets)
                    .filter(([, bet]) => bet > 0)
                    .map(([slot]) => parseInt(slot));

                  const totalChipCost = chipValue * activeSlots.length;

                  if (
                    (balance?.amount ?? 0) >=
                    totalCurrentBet + totalChipCost
                  ) {
                    setSlotBets((prev) => {
                      const newBets = { ...prev };
                      activeSlots.forEach((slot) => {
                        newBets[slot] = prev[slot] + chipValue;
                      });
                      return newBets;
                    });
                    setBetHistory((prev: number[]) => [...prev, totalChipCost]);
                  }
                } else {
                  // Normal single slot mode
                  if ((balance?.amount ?? 0) >= totalCurrentBet + chipValue) {
                    setSlotBets((prev) => ({
                      ...prev,
                      [activeSlot]: prev[activeSlot] + chipValue,
                    }));
                    setBetHistory((prev: number[]) => [...prev, chipValue]);
                  }
                }
              }}
              className="disabled:opacity-50 cursor-not-allowed"
            >
              <Chip value={chipValue} />
              {/*<Chip
                value={chipValue}
                disabled={(balance?.amount ?? 0) <= chipValue} // Handle disabled state in the click handler
                onClick={handleChip(chipValue)}

              />*/}
            </motion.button>
          );
        })}
      </motion.div>
    );
  }, [
    balance?.amount,
    gameState,
    slotBets,
    activeSlot,
    multiSlotMode,
    lastSlotBets,
  ]); /// eslint-disable-line react-hooks/exhaustive-deps

  const player_actions = useMemo(
    () =>
      [
        {
          name: "Double Down",
          label: "x2",
          actionFn: doubleDown,
          disabled: !canHit && gameState !== "player-turn",
          style: "bg-double border-double",
        },
        {
          name: "Hit",
          actionFn: hit,
          disabled: !canHit && gameState !== "player-turn",
          icon: "add",
          style: "bg-hit border-hit",
        },
        {
          name: "Stand",
          actionFn: stand,
          disabled: !canStand && gameState !== "player-turn",
          icon: "stand",
          style: "bg-stand border-stand",
        },

        {
          name: "Split",
          actionFn: split,
          label: "Split",
          disabled: !canSplit && gameState !== "player-turn",
          style: "bg-indigo-500 border-indigo-500",
        },
      ] as IPlayerAction[],
    [doubleDown, canHit, gameState, split, canSplit, stand, canStand, hit],
  );

  const PlayerActionPanel = useCallback(() => {
    return (
      <HyperList
        direction="down"
        data={player_actions}
        component={PlayerAction}
        container="flex items-center justify-center gap-4"
      />
    );
  }, [player_actions]);

  const PlayerActions = useCallback(() => {
    const options = opts(
      <div className="space-y-4 pt-4 flex flex-col items-center justify-center">
        {baseStrategy && (
          <div className="text-sm flex items-center border-b px-6 py-1">
            {baseStrategy.action}
            <span className="font-thin opacity-60 px-4">|</span>
            {baseStrategy.confidence}
          </div>
        )}
        <div className="flex space-x-4 items-end">
          <PlayerActionPanel />
        </div>
      </div>,
      null,
    );
    return (
      <>{options.get(gameState === "player-turn" && gameResult === null)}</>
    );
  }, [baseStrategy, gameState, gameResult, PlayerActionPanel]);

  const ResultBanner = useCallback(() => {
    const options = opts(
      <div className="h-20 overflow-hidden flex items-center justify-center space-x-4">
        <div className="w-56 h-20"></div>
        <div className="relative flex flex-col items-center space-y-1">
          <Burst
            shouldAnimate={
              gameResult === "player-blackjack" || gameResult === "player-wins"
            }
            duration={1500}
            speed={120}
            count={100}
          >
            <motion.div
              initial={{ scale: 0, y: -35 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                type: "spring",
                visualDuration: 0.55,
                bounce: 0.4,
                delay: 0.1,
              }}
              className={cn(
                "text-2xl h-20 w-72 flex items-center justify-center tracking-tight font-bold text-emerald-100",
                {
                  "text-sky-400": gameResult === "push",
                  "text-orange-200": gameResult === "player-blackjack",
                },
              )}
            >
              <div className="bg-zinc-900 tracking-tighter mb-2 h-fit w-fit rounded-xl">
                {getResultMessage()}
              </div>
            </motion.div>
          </Burst>
          <motion.button
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{
              type: "spring",
              visualDuration: 0.5,
              bounce: 0.3,
              delay: 0.85,
            }}
            onClick={startNewBet}
            className="absolute z-40 bottom-1.5 tracking-tighter cursor-pointer"
          >
            continue
          </motion.button>
        </div>

        <div className="w-40 h-20 flex flex-col items-center justify-center">
          <div
            className={cn("text-lg font-bold", {
              "text-emerald-300": netWinnings > 0,
              "text-red-300": netWinnings < 0,
              "text-neutral-300": netWinnings === 0,
            })}
          >
            {netWinnings >= 0 ? "+" : ""}
            {netWinnings.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-400">
            {netWinnings > 0
              ? "Profit"
              : netWinnings < 0
                ? "Loss"
                : "Break Even "}
          </div>
        </div>
      </div>,
      null,
    );
    return <>{options.get(gameResult !== null)}</>;
  }, [gameResult, getResultMessage, startNewBet, netWinnings]);

  const BettingSlot = useCallback(
    ({ slotIndex }: { slotIndex: number }) => {
      const isActive = activeSlot === slotIndex;
      const slotBet = slotBets[slotIndex] || 0;
      const isDisabled = gameState !== "betting";

      return (
        <motion.div
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
          onClick={() => !isDisabled && setActiveSlot(slotIndex)}
          className={cn(
            "relative w-fit mx-auto col-span-4 rounded-xl border px-4 py-2 min-w-28 min-h-16 flex flex-col items-center justify-center transition-all",
            {
              "border-emerald-50/80 bg-emerald-50/5 cursor-pointer":
                isActive && !isDisabled,
              "border-zinc-300/60 bg-zinc-800/20 hover:border-emerald-300 cursor-pointer":
                !isActive && !isDisabled,
              "border-zinc-600/40 bg-zinc-800/10 opacity-50 cursor-not-allowed":
                isDisabled,
            },
          )}
        >
          {/* Slot indicator */}
          <div
            className={cn(
              "absolute -top-2 -left-2 w-6 h-6 rounded-full font-redhat border flex items-center justify-center text-sm font-bold",
              {
                "border-emerald-300 bg-emerald-300 text-black": isActive,
                "border-zinc-300 bg-zinc-800 text-zinc-300": !isActive,
              },
            )}
          >
            {slotIndex + 1}
          </div>

          {/* Bet amount */}
          <div className="-space-y-1.5 flex flex-col items-center">
            <span
              className={cn(
                "tracking-tighter text-lg font-sans font-semibold",
                {
                  "text-emerald-200": isActive,
                  "text-white": !isActive && slotBet > 0,
                  "text-zinc-300": !isActive && slotBet === 0,
                },
              )}
            >
              {slotBet > 0 ? slotBet.toLocaleString() : "0"}
            </span>
            <div className="text-[6px]  text-neutral-200">BET</div>
          </div>

          {/* Active slot controls */}
          {isActive && slotBet > 0 && !isDisabled && (
            <div className="absolute -bottom-6 flex justify-end items-end space-x-2">
              <Button
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUndo();
                }}
                disabled={betHistory.length === 0}
                variant="outline"
                className="w-5 h-4 text-xs bg-zinc-800/30 rounded border-transparent text-white hover:bg-zinc-800/60 disabled:opacity-50"
              >
                <Icon name="arrow-undo" className="size-3" solid />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearBet();
                }}
                className="w-5 h-4 text-xs bg-zinc-800/30 rounded border-transparent text-neutral-50 hover:bg-zinc-800"
              >
                <Icon name="clear" className="size-3 stroke-2" solid />
              </Button>
            </div>
          )}
        </motion.div>
      );
    },
    [activeSlot, slotBets, betHistory, handleUndo, handleClearBet, gameState],
  );

  const QuickBetOptions = useCallback(() => {
    const hasLastBets = Object.values(lastSlotBets).some((bet) => bet > 0);

    const options = opts(
      <Button
        onClick={handleReplay}
        disabled={(balance?.amount || 0) < lastBetAmount || !hasLastBets}
        variant="outline"
        className={cn(
          "flex justify-center items-center absolute h-12 w-8 flex-shrink aspect-square bottom-8 rounded-full border border-yellow-200/80 bg-neutral-900/30 text-yellow-200 hover:bg-neutral-700",
        )}
      >
        <Icon solid name="rebet" className={`size-7`} />
      </Button>,
      <motion.div
        initial={{ scale: 0, opacity: 0, x: -100 }}
        animate={{ scale: 1, opacity: 1, x: 20 }}
        transition={{
          type: "spring",
          visualDuration: 0.4,
          bounce: 0.3,
        }}
        className="absolute bottom-8"
      >
        <Button
          size="lg"
          onClick={() => {
            if (multiSlotMode) {
              // Double all slots that have bets
              const activeSlots = Object.entries(slotBets)
                .filter(([, bet]) => bet > 0)
                .map(([slot]) => parseInt(slot));

              const totalCurrentBet = Object.values(slotBets).reduce(
                (sum, bet) => sum + bet,
                0,
              );

              if (
                activeSlots.length > 0 &&
                (balance?.amount || 0) >= totalCurrentBet * 2
              ) {
                setSlotBets((prev) => {
                  const newBets = { ...prev };
                  activeSlots.forEach((slot) => {
                    newBets[slot] = prev[slot] * 2;
                  });
                  return newBets;
                });
                setBetHistory((prev: number[]) => [...prev, totalCurrentBet]);
              }
            } else {
              // Single slot mode - double only active slot
              const currentSlotBet = slotBets[activeSlot];
              const totalCurrentBet = Object.values(slotBets).reduce(
                (sum, bet) => sum + bet,
                0,
              );
              if (
                currentSlotBet > 0 &&
                (balance?.amount || 0) >= totalCurrentBet + currentSlotBet
              ) {
                setSlotBets((prev) => ({
                  ...prev,
                  [activeSlot]: prev[activeSlot] * 2,
                }));
                setBetHistory((prev: number[]) => [...prev, currentSlotBet]);
              }
            }
          }}
          disabled={
            multiSlotMode
              ? betAmount <= 0 || (balance?.amount || 0) < betAmount * 2
              : slotBets[activeSlot] <= 0 ||
                (balance?.amount || 0) < betAmount + slotBets[activeSlot]
          }
          variant="outline"
          className="bg-zinc-900 border-transparent text-cyan-200 font-semibold tracking-tighter text-lg rounded-lg px-2.5"
        >
          2x
        </Button>
      </motion.div>,
    );
    return (
      <>
        {options.get(
          betAmount === 0 &&
            hasLastBets &&
            gameState === "betting" &&
            gameResult === null,
        )}
      </>
    );
  }, [
    balance?.amount,
    betAmount,
    handleReplay,
    lastBetAmount,
    lastSlotBets,
    gameResult,
    gameState,
    activeSlot,
    slotBets,
    multiSlotMode,
  ]);

  const PlayOptions = useCallback(() => {
    const options = opts(
      <motion.div
        initial={{ scale: 0, opacity: 0, x: 100 }}
        animate={{ scale: 1, opacity: 1, x: -20 }}
        transition={{
          type: "spring",
          visualDuration: 0.4,
          bounce: 0.3,
        }}
        className="absolute bottom-8"
      >
        <Button
          size="icon"
          onClick={handleStartNewGame}
          disabled={betAmount <= 0 || (balance?.amount || 0) < betAmount}
          className={cn(
            "rounded-full border-2 border-teal-300 bg-zinc-900/40 hover:bg-zinc-900/80 text-white shrink-0",
          )}
        >
          <Icon solid name="play" className={`size-4 fill-white`} />
        </Button>
      </motion.div>,
      null,
    );
    return <>{options.get(betAmount !== 0 && gameResult === null)}</>;
  }, [balance?.amount, betAmount, handleStartNewGame, gameResult]);

  // Create a stable callback using useRef
  const setBetAmountRef = useRef(setBetAmount);
  const setBetHistoryRef = useRef(setBetHistory);

  // Update refs when functions change
  setBetAmountRef.current = setBetAmount;
  setBetHistoryRef.current = setBetHistory;

  // Completely stable callback for chip clicks
  // const handleChipClick = useCallback((chipValue: number) => {
  //   setBetAmountRef.current((prev) => prev + chipValue);
  //   setBetHistoryRef.current((prev: number[]) => [...prev, chipValue]);
  // }, []); // No dependencies!

  const BettingControls = useCallback(() => {
    const options = opts(
      <div className=" ">
        <div className="relative bottom-0 h-1/4 flex gap-3 justify-center">
          <ChipArray />
          <PlayOptions />
          <QuickBetOptions />
        </div>
      </div>,
      null,
    );
    return <>{options.get(gameState === "betting")}</>;
  }, [ChipArray, PlayOptions, QuickBetOptions, gameState]);

  const PlayerHands = useCallback(({ cards }: { cards: Card[] }) => {
    return (
      <div className="flex -space-x-10 md:-space-x-9 ">
        {cards.map((card, id) => (
          <div key={id} className={`mt-${id * 2}`}>
            <PlayingCard card={card} />
          </div>
        ))}
      </div>
    );
  }, []);

  const toggleMultiSlotMode = useCallback(() => {
    setMultiSlotMode(!multiSlotMode);
  }, [multiSlotMode]);

  return (
    <CardComp
      suppressHydrationWarning
      className="h-[calc(100vh-64px)] portrait:min-h-[calc(90vh)] space-y-0 lg:col-span-6 bg-poker-dark border-transparent rounded-b-3xl"
    >
      <div className="px-2 flex items-center justify-between md:px-4">
        <CardTitle className="text-sm border border-border/20 rounded-sm p-px font-medium text-neutral-300 tracking-wider">
          <span>BL♠CKJ♦CK</span>
          <button
            onClick={toggleAutoReturnToBetting}
            className="px-4 cursor-pointer tracking-tighter text-xs"
          >
            {autoReturnToBetting ? "Auto" : "Manual"}
          </button>
          <span className="hidden">
            {gameState} _ {dealerHand?.cards[0]?.value} |{" "}
            {dealerHand?.cards[1]?.value}
          </span>
        </CardTitle>
        <CardAction>
          <div className="flex gap-1 items-center">
            <div className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
              $
              <span className="tracking-tight">
                {balance?.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                }) ?? 0}
              </span>
            </div>
            <button
              onClick={resetBalance}
              className="text-xs tracking-tight size-5 rounded-full bg-transparent border-transparent text-neutral-300"
            >
              <Icon name="add-circle" className="size-5" />
            </button>
          </div>
        </CardAction>
      </div>
      {/**/}
      {/* === CONTENT BODY ===*/}
      {/**/}
      <CardContent className="bg-poker-light mx-2 border border-white/10 h-full rounded-[1.75rem]">
        {/* Dealer Hand */}
        <div className="space-y-0 min-h-1/4 rounded-lg border-2 flex items-center justify-center">
          <div className="flex gap-3 items-center justify-center">
            <div className="flex gap-2">
              {dealerHand.cards.map((card, index) => (
                <PlayingCard
                  key={index}
                  card={card}
                  hidden={gameState === "player-turn" && index === 1}
                />
              ))}
            </div>

            <div className="text-white flex items-center font-sans space-x-3 text-lg">
              <span>
                {dealerHand && gameState !== "dealer-turn"
                  ? "?"
                  : formatHandValue(dealerHand, gameResult)}
              </span>

              {dealerHand.isBlackjack && gameState !== "player-turn" && (
                <span className="text-orange-200 text-sm bg-zinc-900 rounded-full p-1.5 aspect-square border-3 border-orange-100/80">
                  <Icon name="blackjack" className="size-8" />
                </span>
              )}
              {dealerHand.isBust && (
                <span className="bg-red-500 flex items-center space-x-0.5 px-1 font-bold tracking-tighter rounded-sm text-base">
                  <Icon name="bust" className="size-5" /> <span>BUST</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Player Hands */}
        <div className="py-0 md:min-h-1/2 relative flex flex-col items-center justify-center">
          <div className="absolute bg-zinc-900 rounded-xl justify-center flex w-full left-0 top-0">
            <ResultBanner />
          </div>
          <span>
            {gameState === "betting" && !multiSlotMode && "Place your bets"}
            {gameState === "betting" && multiSlotMode && (
              <span className="flex items-center gap-2">
                <span className="text-cyan-300">Multi-slot Active</span>
                <button
                  onClick={toggleMultiSlotMode}
                  className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                >
                  Single Slot
                </button>
              </span>
            )}
          </span>
          <div className="md:min-h-48 h-40 mt-3 w-full grid grid-cols-12">
            {playerHands.map((hand, handIndex) => (
              <div
                key={hand.id}
                className={cn(
                  "mb-4 p-2 border-2 border-transparent rounded-xl col-span-4",
                  {
                    " border-emerald-300":
                      playerHands.length > 1 &&
                      handIndex === activeHandIndex &&
                      gameResult === null,
                  },
                )}
              >
                {playerHands.length > 1 && (
                  <div className="text-xs text-neutral-200 h-10 font-redhat text-left flex items-start">
                    <div
                      className={cn(
                        "size-4 aspect-square rounded-full font-redhat flex items-center justify-center text-sm font-bold",
                        {
                          "border-emerald-300 bg-emerald-300 text-black":
                            handIndex === activeHandIndex &&
                            gameResult === null,
                          "border-zinc-300 bg-zinc-800/40 text-zinc-400":
                            handIndex !== activeHandIndex &&
                            gameResult === null,
                          "text-emerald-200": gameResult !== null,
                        },
                      )}
                    >
                      {+hand.id.replace("slot-", "") + 1}
                    </div>
                    <div>
                      {handIndex === activeHandIndex &&
                        gameState === "player-turn" && (
                          <span className="text-emerald-200 font-medium"></span>
                        )}
                    </div>
                    <div className="text-white flex items-center font-redhat px-2 text-xl space-x-4">
                      <div className="flex items-center space-x-1 tracking-tight">
                        <span className="">
                          {formatHandValue(hand, gameResult)
                            .split(" ")
                            .map((e, i) =>
                              e === "|" ? (
                                <span
                                  key={i}
                                  className="font-thin opacity-60 px-2.5"
                                >
                                  {e}
                                </span>
                              ) : (
                                e
                              ),
                            )}
                        </span>

                        {hand.isBlackjack && (
                          <span className="ml-2 text-sm bg-zinc-900 rounded-full p-0.5 relative flex items-center justify-center aspect-square border-[1.33px] border-orange-100">
                            <Icon
                              name="blackjack"
                              className="absolute size-6 text-orange-200 blur-xs"
                            />
                            <Icon
                              name="blackjack"
                              className="size-5 text-orange-50"
                            />
                          </span>
                        )}
                        {hand.isBust && (
                          <span className="bg-zinc-900 ml-2 flex items-center space-x-0.5 font-bold tracking-tighter rounded-full text-base">
                            <Icon name="bust" className="size-5" />
                          </span>
                        )}
                      </div>
                      {hand.result && (
                        <span
                          className={`size-5 flex items-center justify-center aspect-square ${
                            hand.result === "player-blackjack"
                              ? ""
                              : hand.result === "player-wins"
                                ? "text-white bg-six-nine rounded-full"
                                : hand.result === "push"
                                  ? "text-white bg-sky-400 rounded-sm"
                                  : "text-red-100 bg-red-700 rounded-sm"
                          }`}
                        >
                          {hand.result === "player-wins" ? (
                            <Icon name="win-coin" className="size-6" />
                          ) : hand.result === "player-blackjack" ? (
                            ""
                          ) : hand.result === "push" ? (
                            <Icon name="push" className="size-6" />
                          ) : (
                            <Icon name="add" className="rotate-45 size-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="col-span-12">
                  <div className="flex gap-6 items-center justify-start">
                    <PlayerHands cards={hand.cards} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className={cn("h-16 gap-8 col-span-12 grid grid-cols-12 w-full", {
              " h-8": gameState !== "betting",
            })}
          >
            <BettingSlot slotIndex={0} />
            <BettingSlot slotIndex={1} />
            <BettingSlot slotIndex={2} />
          </div>
        </div>

        <div className="font-sans flex space-x-2 tracking-tighter">
          <span className="text-orange-200">Total bet:</span>
          <span>{betAmount}</span>
        </div>
        <BettingControls />
        <PlayerActions />
      </CardContent>
    </CardComp>
  );
};
