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
import { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type { Card, Hand } from "@/ctx/blackjack-ctx/types";
import { opts } from "@/utils/helpers";
import { getBaseStrategy } from "@/components/blackjack/strategy-guide";

const chipValues = [5, 10, 25, 50, 100, 250, 1000];

// Helper function to format hand value display
const formatHandValue = (hand: Hand) => {
  if (hand.isBlackjack) {
    return hand.value.toString();
  }

  // If hand has aces and the low/high values are different, show both
  const hasAces = hand.cards.some((card: Card) => card.rank === "A");
  if (hasAces && hand.lowValue !== hand.highValue && !hand.isBust) {
    return `${hand.lowValue} | ${hand.highValue}`;
  }

  return hand.value.toString();
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

  const [selectedChips, setSelectedChips] = useState<number[]>([]);
  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [betHistory, setBetHistory] = useState<number[]>([]);

  const baseStrategy = useMemo(
    () =>
      gameState === "player-turn" &&
      getBaseStrategy(
        playerHands[0],
        dealerHand.cards[0],
        canDoubleDown,
        canSplit,
      ),
    [gameState, canDoubleDown, canSplit, dealerHand.cards, playerHands],
  );

  // Clear selected chips when returning to betting phase
  useEffect(() => {
    if (gameState === "betting" && betAmount === 0) {
      setSelectedChips([]);
      setBetHistory([]);
    }
  }, [gameState, betAmount]);

  const onChipClick = useCallback(
    (chipValue: number) => {
      if ((balance?.amount || 0) >= chipValue) {
        setBetAmount(betAmount + chipValue);
        setSelectedChips((prev: number[]) => [...prev, chipValue]);
        setBetHistory((prev: number[]) => [...prev, chipValue]);
      }
    },
    [balance?.amount, betAmount, setBetAmount],
  );

  const handleUndo = useCallback(() => {
    if (betHistory.length > 0) {
      const lastChip = betHistory[betHistory.length - 1];
      setBetAmount(betAmount - lastChip);
      setBetHistory((prev: number[]) => prev.slice(0, -1));

      // Remove the last occurrence of this chip from selectedChips
      const chipIndex = selectedChips.lastIndexOf(lastChip);
      if (chipIndex > -1) {
        const newSelectedChips = [...selectedChips];
        newSelectedChips.splice(chipIndex, 1);
        setSelectedChips(newSelectedChips);
      }
    }
  }, [betAmount, betHistory, selectedChips, setBetAmount]);

  const handleClearBet = useCallback(() => {
    setBetAmount(0);
    setSelectedChips([]);
    setBetHistory([]);
  }, [setBetAmount]);

  // Save the bet amount when starting a new game
  const handleStartNewGame = useCallback(() => {
    setLastBetAmount(betAmount);
    startNewGame();
  }, [betAmount, startNewGame]);

  const handleReplay = useCallback(() => {
    if (lastBetAmount > 0 && (balance?.amount || 0) >= lastBetAmount) {
      setBetAmount(lastBetAmount);
      // Reconstruct bet history for re-bet (simplified as single amount)
      setBetHistory([lastBetAmount]);
      setSelectedChips([lastBetAmount]);
    }
  }, [balance?.amount, lastBetAmount, setBetAmount]);
  const getResultMessage = useCallback(() => {
    switch (gameResult) {
      case "player-blackjack":
        return "BLACKJACK! You win!";
      case "player-wins":
        return "You win!";
      case "dealer-blackjack":
        return "Dealer Blackjack. You lose.";
      case "dealer-wins":
        return "Dealer wins. You lose.";
      case "push":
        return "Push! It's a tie.";
      default:
        return "";
    }
  }, [gameResult]);

  const handleChipSelect = useCallback(
    (v: number) => () => onChipClick(v),
    [onChipClick],
  );

  const ChipArray = useCallback(() => {
    const radius = 50; // distance from center
    const angleStart = -Math.PI; // in degrees
    const angleEnd = 0;
    const centerX = 0;
    const centerY = 0;

    // Convert degrees to radians
    // Create 7 evenly spaced angles between start and end
    // const angleStep = (angleEnd - angleStart) / (chipValues.length - 1);
    const angleStep = (angleEnd - angleStart) / (chipValues.length - 1);

    const arcPositions = chipValues.map((_, index) => {
      const angle = angleStart + index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle); // This gives you the "dome" effect (higher y → top)

      return { x, y };
    });

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.25,
            },
          },
        }}
        className="relative bottom-0 border rounded-xl h-48 mx-auto mt-0 w-full flex justify-center items-center"
      >
        {chipValues.map((chipValue, i) => {
          const { x, y } = arcPositions[i];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: y + 30 }}
              animate={{ opacity: 1, x, y }}
              transition={{
                type: "spring",
                visualDuration: 0.6,
                bounce: 0.4,
                delay: i * 0.1,
              }}
            >
              <Chip
                key={chipValue}
                value={chipValue}
                selected={selectedChips.includes(chipValue)}
                disabled={(balance?.amount || 0) < chipValue}
                onClick={handleChipSelect(chipValue)}
              />
            </motion.div>
          );
        })}
      </motion.div>
    );
  }, [balance?.amount, handleChipSelect, selectedChips]);

  const PlayerActions = useCallback(() => {
    const isPlayersTurn = gameState === "player-turn";
    const options = opts(
      <div className="space-y-4 pt-4 flex flex-col items-center justify-center">
        {baseStrategy && (
          <div className="text-sm flex items-center border-b px-6 py-1">
            {baseStrategy.action}
            <span className="font-thin opacity-60 px-4">|</span>
            {baseStrategy.confidence}
          </div>
        )}
        <div className="flex space-x-4">
          <Button
            onClick={doubleDown}
            disabled={!canDoubleDown}
            className="bg-zinc-900/60 hover:bg-zinc-900 relative text-orange-200 text-xl font-black px-2 rounded-lg tracking-tighter"
          >
            <span className="absolute blur-xs text-orange-100/60">x2</span>
            <span className="drop-shadow-xs">x2</span>
          </Button>
          <Button
            onClick={hit}
            disabled={!canHit}
            className="bg-zinc-900 hover:bg-zinc-900 text-blue-300 text-base font-bold px-2 rounded-lg"
          >
            HIT
          </Button>
          {canSplit && (
            <Button
              onClick={split}
              className="bg-indigo-600 hover:bg-zinc-900 text-indigo-100 tracking-tighter text-base font-semibold px-2 rounded-lg"
            >
              SPLIT
            </Button>
          )}
          <Button
            onClick={stand}
            disabled={!canStand}
            className="bg-red-400 hover:bg-zinc-900 text-white tracking-tighter text-base font-semibold px-2 rounded-lg grow-0"
          >
            <Icon solid name="stop" className="size-7" />
          </Button>
        </div>
      </div>,
      null,
    );
    return <>{options.get(isPlayersTurn)}</>;
  }, [
    baseStrategy,
    canDoubleDown,
    canHit,
    canSplit,
    canStand,
    doubleDown,
    gameState,
    hit,
    split,
    stand,
  ]);

  const ResultBanner = useCallback(() => {
    const options = opts(
      <div className="h-16">
        <div className="text-lg tracking-tight font-bold text-orange-300">
          {getResultMessage()}
        </div>
        <button onClick={startNewBet} className="px-8">
          Continue
        </button>
      </div>,
      null,
    );
    return <>{options.get(gameResult !== null)}</>;
  }, [gameResult, getResultMessage, startNewBet]);

  const BetModifier = useCallback(() => {
    const options = opts(
      <div className="">
        <div className="space-x-4 flex items-center justify-center">
          <Button
            size="icon"
            onClick={handleUndo}
            disabled={betHistory.length === 0}
            variant="outline"
            className="text-xs bg-zinc-700/10 rounded-full border-transparent text-neutral-50 hover:bg-zinc-800 disabled:opacity-0"
          >
            <Icon name="arrow-undo" className="size-4" />
          </Button>
          <div className="-space-y-1 flex flex-col items-center">
            <span className="text-white tracking-tight text-xl font-sans font-bold">
              {betAmount.toLocaleString()}
            </span>
            <div className="text-[8px] tracking-wider text-neutral-200">
              BET
            </div>
          </div>

          <div>
            {betAmount > 0 && (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleClearBet}
                  className="text-xs bg-zinc-700/10 rounded-full border-transparent text-neutral-50 hover:bg-zinc-800 disabled:opacity-50"
                >
                  <Icon name="clear" className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>,
      null,
    );
    return <>{options.get(gameState === "betting" && betAmount !== 0)}</>;
  }, [betAmount, betHistory, gameState, handleClearBet, handleUndo]);

  const QuickBetOptions = useCallback(() => {
    const options = opts(
      <Button
        onClick={handleReplay}
        disabled={(balance?.amount || 0) < lastBetAmount}
        variant="outline"
        className={cn(
          "flex justify-center items-center absolute h-12 w-8 flex-shrink aspect-square bottom-20 rounded-full border border-yellow-200/80 bg-neutral-900/30 text-yellow-200 hover:bg-neutral-700",
        )}
      >
        <Icon solid name="rebet" className={`size-8`} />
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
            setBetAmount(betAmount * 2);
            setBetHistory((prev: number[]) => [...prev, betAmount]);
          }}
          disabled={betAmount <= 0 || (balance?.amount || 0) < betAmount * 2}
          variant="outline"
          className="bg-zinc-900 border-transparent text-cyan-300 font-semibold tracking-tighter text-lg rounded-lg px-2.5"
        >
          2x
        </Button>
      </motion.div>,
    );
    return <>{options.get(betAmount === 0 && lastBetAmount > 0)}</>;
  }, [balance?.amount, betAmount, handleReplay, lastBetAmount, setBetAmount]);

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
        className="absolute border bottom-8"
      >
        <Button
          size="icon"
          onClick={handleStartNewGame}
          disabled={betAmount <= 0 || (balance?.amount || 0) < betAmount}
          className={cn(
            "rounded-full border-2 border-teal-300 bg-zinc-900/40 text-white shrink-0",
          )}
        >
          <Icon solid name="play" className={`size-4 fill-white`} />
        </Button>
      </motion.div>,
      null,
    );
    return <>{options.get(betAmount !== 0)}</>;
  }, [balance?.amount, betAmount, handleStartNewGame]);

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
      <div className="flex gap-2">
        {cards.map((card, id) => (
          <PlayingCard key={id} card={card} />
        ))}
      </div>
    );
  }, []);

  return (
    <AnimatePresence>
      <CardComp className="h-[calc(100vh-64px)] portrait:min-h-[calc(100vh-64px)] space-y-0 lg:col-span-5 bg-poker-dark border-transparent rounded-b-3xl">
        <div className="px-2 flex items-center justify-between md:px-4">
          <CardTitle className="text-sm border border-border/20 rounded-sm p-px font-medium text-neutral-300 tracking-wider">
            <span>BL♠CKJ♦CK</span>
            <button
              onClick={toggleAutoReturnToBetting}
              className="px-4 cursor-pointer tracking-tighter text-xs"
            >
              {autoReturnToBetting ? "Auto" : "Manual"}
            </button>
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
          <div className="space-y-0 min-h-1/4 rounded-lg border bg-zinc-700/5 flex items-center justify-center">
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

              <div className="text-white font-mono text-lg">
                {gameState === "player-turn"
                  ? "?"
                  : formatHandValue(dealerHand)}
                {dealerHand.isSoft && gameState !== "player-turn" && (
                  <span className="text-sm text-neutral-400"> (soft)</span>
                )}
                {dealerHand.isBlackjack && gameState !== "player-turn" && (
                  <span className="text-orange-300 text-sm"> BLACKJACK!</span>
                )}
                {dealerHand.isBust && (
                  <span className="text-red-500 text-base"> BUST!</span>
                )}
              </div>
            </div>
          </div>

          {/* Player Hands */}
          <div className="py-0 min-h-1/2 relative flex items-center justify-center">
            <div className="absolute bg-zinc-900 justify-center flex w-full left-0 top-0">
              <ResultBanner />
            </div>
            <div>
              {playerHands.map((hand, handIndex) => (
                <div
                  key={hand.id}
                  className={cn("mb-4 p-4 rounded-xl", {
                    "border-2 border-cyan-400":
                      playerHands.length > 1 && handIndex === activeHandIndex,
                  })}
                >
                  {playerHands.length > 1 && (
                    <div className="text-xs text-neutral-200 font-space text-left pb-2">
                      Hand {handIndex + 1}
                      {handIndex === activeHandIndex &&
                        gameState === "player-turn" && (
                          <span className="text-cyan-300 px-3 font-medium">
                            ACTIVE
                          </span>
                        )}
                      {hand.result && (
                        <span
                          className={`ml-2 ${
                            hand.result === "player-wins" ||
                            hand.result === "player-blackjack"
                              ? "text-white"
                              : hand.result === "push"
                                ? "text-sky-500"
                                : "text-red-500"
                          }`}
                        >
                          {hand.result === "player-blackjack"
                            ? "BLACKJACK!"
                            : hand.result === "player-wins"
                              ? "WIN"
                              : hand.result === "push"
                                ? "PUSH"
                                : "LOSE"}
                        </span>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="flex gap-6 items-center justify-center">
                      <PlayerHands cards={hand.cards} />
                      <div className="text-white font-redhat text-xl">
                        <div className="py-1 space-x-3 flex items-center tracking-tight">
                          <span className="">
                            {formatHandValue(hand)
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
                          {hand.isSoft && (
                            <span className="text-sm font-space px-2 text-neutral-300">
                              soft
                            </span>
                          )}
                          {hand.isBlackjack && (
                            <span className="text-white text-sm">
                              {" "}
                              BLACKJACK!
                            </span>
                          )}
                          {hand.isBust && (
                            <span className="text-red-500 text-sm"> BUST!</span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-100 py-1.5 border-t-3 border-poker-dark">
                          ${hand.betAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <BetModifier />
            </div>
          </div>

          <BettingControls />
          {/* Game Actions */}
          <PlayerActions />

          {/* Dealer Turn */}

          {/* Game Over Message */}

          {/* Current Bet Display */}
        </CardContent>
      </CardComp>
    </AnimatePresence>
  );
};

/*
{gameState === "dealer-turn" && (
            <div className=" border-transparent text-center">
              <div className="text-sm text-neutral-400 font-mono">
                Payouts...
              </div>
            </div>
          )}
*/

/*
{gameState === "game-over" && (
            <div className="border-transparent text-center">
              <div className="text-sm text-neutral-400 font-mono">
                Next game starting in a moment...
              </div>
            </div>
          )}
*/

/*
          {betAmount > 0 && gameState !== "betting" && (
            <div className="_flex hidden absolute bottom-2 items-center gap-4 text-xs border-transparent flex-col">
              <div className="text-neutral-400 font-mono">
                Current Bet:{" "}
                <span className="text-white font-bold">${betAmount}</span>
              </div>
              <div className="text-neutral-400 font-mono">
                Balance:{" "}
                <span className="text-white font-bold">
                  ${balance?.amount ?? 0}
                </span>
              </div>
            </div>
          )}

*/

/*
<Button
  size="lg"
  className={cn(
    "bg-zinc-900 border-transparent text-orange-500 font-bold tracking-tighter text-lg px-2.5 rounded-xl",
    // {" ":}
  )}
  onClick={() => {
    const maxBet = Math.min(balance?.amount || 0, 1000); // Cap at 1000 or balance
    if (maxBet > betAmount) {
      const addAmount = maxBet - betAmount;
      setBetAmount(maxBet);
      setBetHistory((prev: number[]) => [...prev, addAmount]);
      setSelectedChips((prev: number[]) => [...prev, addAmount]);
    }
  }}
  disabled={
    betAmount >= (balance?.amount ?? 0) ||
    (balance?.amount ?? 0) === 0
  }
  variant="outline"
>
  Max
</Button>

const arcPositions = chipValues.map((_, index) => {
      const angleDeg = angleStart + index * angleStep;
      const angleRad = degToRad(angleDeg);

      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);

      return { x, y };
    });

*/
