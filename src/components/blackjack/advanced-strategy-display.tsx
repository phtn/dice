"use client";

import { FC } from "react";
import {
  Card as CardComp,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAdvancedStrategy } from "./strategy-guide";
import type { Card, Hand } from "@/ctx/blackjack-ctx/types";

interface AdvancedStrategyDisplayProps {
  playerHand: Hand;
  dealerUpCard: Card;
  remainingCardsByRank: Record<string, number>;
  canDoubleDown?: boolean;
  canSplit?: boolean;
  className?: string;
}

export const AdvancedStrategyDisplay: FC<AdvancedStrategyDisplayProps> = ({
  playerHand,
  dealerUpCard,
  remainingCardsByRank,
  canDoubleDown = true,
  canSplit = false,
  className,
}) => {
  const strategy = getAdvancedStrategy(
    playerHand,
    dealerUpCard,
    remainingCardsByRank,
    canDoubleDown,
    canSplit,
  );

  // Calculate additional metrics
  const totalRemaining = Object.values(remainingCardsByRank).reduce(
    (sum, count) => sum + count,
    0,
  );
  const trueCount = (() => {
    const decksRemaining = totalRemaining / 52;
    const lowCards =
      (remainingCardsByRank["2"] || 0) +
      (remainingCardsByRank["3"] || 0) +
      (remainingCardsByRank["4"] || 0) +
      (remainingCardsByRank["5"] || 0) +
      (remainingCardsByRank["6"] || 0);
    const highCards =
      (remainingCardsByRank["10"] || 0) +
      (remainingCardsByRank["J"] || 0) +
      (remainingCardsByRank["Q"] || 0) +
      (remainingCardsByRank["K"] || 0) +
      (remainingCardsByRank["A"] || 0);
    // Note: Neutral cards (7, 8, 9) don't affect Hi-Lo count
    const expectedLowCards = decksRemaining * 20;
    const expectedHighCards = decksRemaining * 20;
    const runningCount =
      highCards - expectedHighCards - (lowCards - expectedLowCards);
    return decksRemaining > 0 ? runningCount / decksRemaining : 0;
  })();

  const tenValueProb =
    (Object.entries(remainingCardsByRank)
      .filter(([rank]) => ["10", "J", "Q", "K"].includes(rank))
      .reduce((sum, [, count]) => sum + count, 0) /
      totalRemaining) *
    100;

  const aceProb = ((remainingCardsByRank["A"] || 0) / totalRemaining) * 100;

  const lowCardProb =
    (Object.entries(remainingCardsByRank)
      .filter(([rank]) => ["2", "3", "4", "5", "6"].includes(rank))
      .reduce((sum, [, count]) => sum + count, 0) /
      totalRemaining) *
    100;

  return (
    <CardComp className={cn("bg-neutral-900/95 border-neutral-700", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
          ADVANCED STRATEGY RECOMMENDATION
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Recommendation */}
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold",
                strategy.action.includes("HIT")
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : strategy.action.includes("STAND")
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : strategy.action.includes("DOUBLE")
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : strategy.action.includes("SPLIT")
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : strategy.action.includes("INSURANCE")
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-neutral-500/20 text-neutral-300 border border-neutral-500/30",
              )}
            >
              {strategy.action}
            </div>
            <div className="flex-1">
              <div className="text-sm text-neutral-200 font-medium">
                {strategy.description}
              </div>
              <div
                className={cn(
                  "text-xs mt-1",
                  strategy.confidence === "high"
                    ? "text-green-400"
                    : strategy.confidence === "medium"
                      ? "text-yellow-400"
                      : "text-red-400",
                )}
              >
                Confidence: {strategy.confidence.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Count and Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-neutral-900/50 rounded p-2">
              <div className="text-xs text-neutral-400">True Count</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  trueCount > 1
                    ? "text-green-400"
                    : trueCount < -1
                      ? "text-red-400"
                      : "text-neutral-300",
                )}
              >
                {trueCount > 0 ? "+" : ""}
                {trueCount.toFixed(1)}
              </div>
            </div>
            <div className="bg-neutral-900/50 rounded p-2">
              <div className="text-xs text-neutral-400">Count Influence</div>
              <div
                className={cn(
                  "text-sm font-bold capitalize",
                  strategy.countInfluence === "positive"
                    ? "text-green-400"
                    : strategy.countInfluence === "negative"
                      ? "text-red-400"
                      : "text-neutral-300",
                )}
              >
                {strategy.countInfluence}
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="text-xs text-neutral-300 bg-neutral-900/50 p-3 rounded">
            <div className="font-bold text-neutral-200 mb-1">Reasoning:</div>
            {strategy.reason}
          </div>

          {/* Strategy Deviation */}
          {strategy.deviation && (
            <div className="text-xs text-orange-300 bg-orange-500/10 p-3 rounded border border-orange-500/20 mt-2">
              <div className="font-bold mb-1">Strategy Deviation:</div>
              {strategy.deviation}
            </div>
          )}
        </div>

        {/* Card Composition Analysis */}
        <div className="bg-neutral-800/30 rounded-lg p-3">
          <div className="text-xs font-bold text-neutral-300 mb-2">
            REMAINING DECK COMPOSITION
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="text-neutral-400">10-Value Cards</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  tenValueProb > 35
                    ? "text-green-400"
                    : tenValueProb < 25
                      ? "text-red-400"
                      : "text-neutral-300",
                )}
              >
                {tenValueProb.toFixed(1)}%
              </div>
              <div className="text-neutral-500">
                (
                {Object.entries(remainingCardsByRank)
                  .filter(([rank]) => ["10", "J", "Q", "K"].includes(rank))
                  .reduce((sum, [, count]) => sum + count, 0)}{" "}
                cards)
              </div>
            </div>
            <div className="text-center">
              <div className="text-neutral-400">Aces</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  aceProb > 8
                    ? "text-green-400"
                    : aceProb < 6
                      ? "text-red-400"
                      : "text-neutral-300",
                )}
              >
                {aceProb.toFixed(1)}%
              </div>
              <div className="text-neutral-500">
                ({remainingCardsByRank["A"] || 0} cards)
              </div>
            </div>
            <div className="text-center">
              <div className="text-neutral-400">Low Cards (2-6)</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  lowCardProb > 40
                    ? "text-red-400"
                    : lowCardProb < 30
                      ? "text-green-400"
                      : "text-neutral-300",
                )}
              >
                {lowCardProb.toFixed(1)}%
              </div>
              <div className="text-neutral-500">
                (
                {Object.entries(remainingCardsByRank)
                  .filter(([rank]) => ["2", "3", "4", "5", "6"].includes(rank))
                  .reduce((sum, [, count]) => sum + count, 0)}{" "}
                cards)
              </div>
            </div>
          </div>
        </div>

        {/* Hand Summary */}
        <div className="text-xs text-neutral-500 bg-neutral-800/20 p-2 rounded">
          <strong>Current Hand:</strong>{" "}
          {playerHand.cards
            .map((card) => `${card.rank}${card.suit}`)
            .join(", ")}
          (Value: {playerHand.value}, {playerHand.isSoft ? "Soft" : "Hard"}) vs
          Dealer {dealerUpCard.rank}
        </div>
      </CardContent>
    </CardComp>
  );
};
