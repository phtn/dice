"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx";
import { useAccountCtx } from "@/ctx/acc-ctx";
import { Chip } from "./chip";
import { PlayingCard } from "./playing-card";
import { useState, useEffect } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

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
  } = useBlackjackCtx();

  const { balance, resetBalance } = useAccountCtx();

  const chipValues = [5, 10, 25, 50, 100, 250, 1000];
  const [selectedChips, setSelectedChips] = useState<number[]>([]);
  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [betHistory, setBetHistory] = useState<number[]>([]);

  // Clear selected chips when returning to betting phase
  useEffect(() => {
    if (gameState === "betting" && betAmount === 0) {
      setSelectedChips([]);
      setBetHistory([]);
    }
  }, [gameState, betAmount]);

  const handleChipClick = (chipValue: number) => {
    if ((balance?.amount || 0) >= chipValue) {
      setBetAmount(betAmount + chipValue);
      setSelectedChips((prev: number[]) => [...prev, chipValue]);
      setBetHistory((prev: number[]) => [...prev, chipValue]);
    }
  };

  const handleUndo = () => {
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
  };

  const handleClearBet = () => {
    setBetAmount(0);
    setSelectedChips([]);
    setBetHistory([]);
  };

  // Save the bet amount when starting a new game
  const handleStartNewGame = () => {
    setLastBetAmount(betAmount);
    startNewGame();
  };

  const handleReplay = () => {
    if (lastBetAmount > 0 && (balance?.amount || 0) >= lastBetAmount) {
      setBetAmount(lastBetAmount);
      // Reconstruct bet history for re-bet (simplified as single amount)
      startNewGame();
      setBetHistory([lastBetAmount]);
      setSelectedChips([lastBetAmount]);
    }
  };
  const getResultMessage = () => {
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
  };

  return (
    <Card className="lg:col-span-6 bg-poker-dark border-transparent rounded-b-3xl">
      <CardHeader className="">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
          BL♠CKJ♦CK
        </CardTitle>
        <CardAction>
          <div className="flex gap-2 items-center">
            <div className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
              <span>Balance:</span> $
              <span className="tracking-tight">
                {balance?.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                }) ?? 0}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={resetBalance}
              className="text-xs tracking-tight h-6 px-1.5 bg-neutral-800 border-transparent text-neutral-300 hover:bg-neutral-700"
            >
              Reset
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="bg-poker-light space-y-8 mx-2 border border-white/10 h-full rounded-[1.75rem]">
        {/* Dealer Hand */}
        <div className="space-y-3 min-h-24">
          <div className="text-xs text-neutral-400 font-mono p-2">DEALER</div>
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
              {gameState === "player-turn" ? "?" : dealerHand.value}
              {dealerHand.isSoft && gameState !== "player-turn" && (
                <span className="text-sm text-neutral-400"> (soft)</span>
              )}
              {dealerHand.isBlackjack && gameState !== "player-turn" && (
                <span className="text-orange-300 text-sm"> BLACKJACK!</span>
              )}
              {dealerHand.isBust && (
                <span className="text-red-300 text-sm"> BUST!</span>
              )}
            </div>
          </div>
        </div>

        {/* Player Hands */}
        <div className="py-8 min-h-24">
          {playerHands.map((hand, handIndex) => (
            <div key={hand.id} className="mb-4">
              {playerHands.length > 1 && (
                <div className="text-xs text-neutral-500 font-mono text-center mb-2">
                  Hand {handIndex + 1}
                  {handIndex === activeHandIndex &&
                    gameState === "player-turn" && (
                      <span className="text-orange-500"> (ACTIVE)</span>
                    )}
                  {hand.result && (
                    <span
                      className={`ml-2 ${
                        hand.result === "player-wins" ||
                        hand.result === "player-blackjack"
                          ? "text-green-500"
                          : hand.result === "push"
                            ? "text-yellow-500"
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
              <div className="flex gap-3 items-center justify-center">
                <div className="flex gap-2">
                  {hand.cards.map((card, cardIndex) => (
                    <PlayingCard key={cardIndex} card={card} />
                  ))}
                </div>
                <div className="text-white font-mono text-lg">
                  {hand.value}
                  {hand.isSoft && (
                    <span className="text-sm text-neutral-400"> (soft)</span>
                  )}
                  {hand.isBlackjack && (
                    <span className="text-orange-300 text-sm"> BLACKJACK!</span>
                  )}
                  {hand.isBust && (
                    <span className="text-red-300 text-sm"> BUST!</span>
                  )}
                  <div className="text-xs text-neutral-400">
                    Bet: ${hand.betAmount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Result */}
        {gameResult && (
          <div className="text-center py-4">
            <div className="text-lg font-bold text-orange-300">
              {getResultMessage()}
            </div>
          </div>
        )}

        {/* Betting Interface */}
        {gameState === "betting" && (
          <div className="space-y-4 border-neutral-700 pt-4">
            <div className="flex justify-between items-center">
              <div className="h-px bg-zinc-100/50 w-[12px]"></div>
              <div className="h-px bg-zinc-100/50 w-[12px]"></div>
            </div>

            {/* Current Bet Display */}
            <div className="space-y-2">
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

              {/* Bet History Display */}
              {betHistory.length < 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500">Bet History:</span>
                  <div className="flex gap-1">
                    {betHistory.map((chip, index) => (
                      <span
                        key={index}
                        className="text-xs bg-neutral-800 px-1 py-0.5 rounded text-neutral-300 font-mono"
                      >
                        +${chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chip Selection */}
            <div className="space-y-2 flex items-center justify-center pt-16 pb-4">
              <div className="flex flex-wrap gap-3">
                {chipValues.map((chipValue) => (
                  <Chip
                    key={chipValue}
                    value={chipValue}
                    selected={selectedChips.includes(chipValue)}
                    disabled={(balance?.amount || 0) < chipValue}
                    onClick={() => handleChipClick(chipValue)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                size="lg"
                onClick={handleStartNewGame}
                disabled={betAmount <= 0 || (balance?.amount || 0) < betAmount}
                className={cn(
                  "bg-zinc-900 text-orange-400 font-bold tracking-tighter text-xl px-2 rounded-lg",
                )}
              >
                Deal
              </Button>

              {/* Re-bet or Double Bet button */}
              {betAmount === 0 && lastBetAmount > 0 ? (
                <Button
                  size="icon"
                  onClick={handleReplay}
                  disabled={(balance?.amount || 0) < lastBetAmount}
                  variant="outline"
                  className={cn(
                    "rounded-full bg-neutral-900 border-transparent text-emerald-300 hover:bg-neutral-700 shrink-0 font-bold tracking-tighter text-xl",
                  )}
                >
                  <Icon name="arrow-rotate-ccw" className={`size-6`} />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => {
                    setBetAmount(betAmount * 2);
                    setBetHistory((prev: number[]) => [...prev, betAmount]);
                  }}
                  disabled={
                    betAmount <= 0 || (balance?.amount || 0) < betAmount * 2
                  }
                  variant="outline"
                  className="bg-zinc-900 border-transparent text-cyan-300 font-semibold tracking-tighter text-lg rounded-lg px-2.5"
                >
                  2x
                </Button>
              )}

              {/* Max Bet button */}
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
            </div>
          </div>
        )}

        {/* Game Actions */}
        {gameState === "player-turn" && (
          <div className="space-y-4 pt-4 flex justify-center">
            <div className="flex gap-5">
              <Button
                onClick={doubleDown}
                disabled={!canDoubleDown}
                className="bg-zinc-900/60 hover:bg-zinc-900 text-orange-300 text-lg font-bold px-2 rounded-lg"
              >
                <span className="drop-shadow-xs">x2</span>
              </Button>
              <Button
                onClick={hit}
                disabled={!canHit}
                className="bg-zinc-900/60 hover:bg-zinc-900 text-blue-300 text-base font-semibold px-2 rounded-lg"
              >
                HIT
              </Button>
              {canSplit && (
                <Button
                  onClick={split}
                  className="bg-zinc-900/60 hover:bg-zinc-900 text-yellow-300 text-base font-semibold px-2 rounded-lg"
                >
                  SPLIT
                </Button>
              )}
              <Button
                onClick={stand}
                disabled={!canStand}
                className="bg-zinc-900/60 hover:bg-zinc-900 text-red-400 tracking-tighter text-base font-semibold px-2 rounded-lg"
              >
                STAND
              </Button>
            </div>
          </div>
        )}

        {/* Dealer Turn */}
        {gameState === "dealer-turn" && (
          <div className=" border-transparent pt-4 text-center">
            <div className="text-sm text-neutral-400 font-mono">Payouts...</div>
          </div>
        )}

        {/* Game Over Message */}
        {gameState === "game-over" && (
          <div className="border-transparent pt-4 text-center">
            <div className="text-sm text-neutral-400 font-mono">
              Next game starting in a moment...
            </div>
          </div>
        )}

        {/* Current Bet Display */}
        {betAmount > 0 && gameState !== "betting" && (
          <div className="flex items-center gap-4 text-xs border-transparent pt-4 flex-col">
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
      </CardContent>
    </Card>
  );
};
