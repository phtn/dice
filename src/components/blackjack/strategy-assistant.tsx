"use client";

import { FC, useState } from "react";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx/blackjack-ctx";
import { useAdvancedStrategy } from "@/hooks/use-advanced-strategy";
import { Button } from "@/components/ui/button";
import { Card as CardComp, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StrategyAssistantProps {
  className?: string;
  compact?: boolean;
}

export const StrategyAssistant: FC<StrategyAssistantProps> = ({
  className,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const {
    playerHands,
    dealerHand,
    activeHandIndex,
    gameState,
    canDoubleDown,
    canSplit,
    getRemainingCardsByRank,
    hit,
    stand,
    doubleDown,
    split,
  } = useBlackjackCtx();

  const currentPlayerHand = playerHands[activeHandIndex];
  const dealerUpCard = dealerHand.cards[0];
  const remainingCardsByRank = getRemainingCardsByRank();
  
  // Debug logging
  console.log('Strategy Assistant - remainingCardsByRank:', remainingCardsByRank);
  console.log('Strategy Assistant - currentPlayerHand:', currentPlayerHand);
  console.log('Strategy Assistant - dealerUpCard:', dealerUpCard);

  const {
    strategy,
    trueCount,
    deckComposition,
    isCountFavorable,
    shouldTakeInsurance,
  } = useAdvancedStrategy({
    playerHand: currentPlayerHand,
    dealerUpCard,
    remainingCardsByRank,
    canDoubleDown,
    canSplit,
  });

  // Don't show during betting or if no current hand
  if (
    gameState === "betting" ||
    !currentPlayerHand ||
    !dealerUpCard ||
    !strategy
  ) {
    return null;
  }

  const handleStrategyAction = () => {
    if (!strategy) return;

    switch (strategy.action) {
      case "HIT":
        hit();
        break;
      case "STAND":
        stand();
        break;
      case "DOUBLE DOWN":
        if (canDoubleDown) {
          doubleDown();
        } else {
          hit();
        }
        break;
      case "SPLIT":
        if (canSplit) {
          split();
        }
        break;
    }
  };

  if (compact && !isExpanded) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="text-xs text-neutral-400">Recommended:</div>
        <div
          className={cn(
            "px-2 py-1 rounded text-xs font-bold",
            strategy.action.includes("HIT")
              ? "bg-red-500/20 text-red-300"
              : strategy.action.includes("STAND")
                ? "bg-green-500/20 text-green-300"
                : strategy.action.includes("DOUBLE")
                  ? "bg-yellow-500/20 text-yellow-300"
                  : strategy.action.includes("SPLIT")
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-neutral-500/20 text-neutral-300",
          )}
        >
          {strategy.action}
        </div>
        {gameState === "player-turn" && (
          <Button
            onClick={handleStrategyAction}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
          >
            Follow
          </Button>
        )}
        <Button
          onClick={() => setIsExpanded(true)}
          variant="ghost"
          size="sm"
          className="text-xs text-neutral-400 hover:text-neutral-200 px-1"
        >
          Details
        </Button>
      </div>
    );
  }

  return (
    <CardComp className={cn("bg-neutral-900/95 border-neutral-800", className)}>
      <CardContent className="px-4 space-y-3">
        {compact && (
          <div className="flex justify-between items-center">
            <div className="text-sm font-bold text-neutral-300">
              Strategy Assistant
            </div>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              Minimize
            </Button>
          </div>
        )}

        {/* Main Recommendation */}
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap",
                  strategy.action.includes("HIT")
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : strategy.action.includes("STAND")
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : strategy.action.includes("DOUBLE")
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : strategy.action.includes("SPLIT")
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-neutral-500/20 text-neutral-300 border border-neutral-500/30",
                )}
              >
                {strategy.action}
              </div>
              <div className="text-sm text-neutral-200">
                {strategy.description}
              </div>
            </div>

            {gameState === "player-turn" && (
              <Button
                onClick={handleStrategyAction}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Follow Strategy
              </Button>
            )}
          </div>

          <div className="text-xs text-neutral-400">
            <strong>Reasoning:</strong> {strategy.reason}
          </div>

          {strategy.deviation && (
            <div className="text-xs text-orange-300 bg-orange-500/10 p-2 rounded border border-orange-500/20 mt-2">
              <strong>Deviation:</strong> {strategy.deviation}
            </div>
          )}
        </div>

        {/* Count & Deck Info */}
        {deckComposition && (
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            <div className="bg-neutral-800/30 rounded p-2">
              <div className="text-neutral-400">True Count</div>
              <div
                className={cn(
                  "font-bold text-sm",
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
            <div className="bg-neutral-800/30 rounded p-2">
              <div className="text-neutral-400">10-Values</div>
              <div
                className={cn(
                  "font-bold text-sm",
                  deckComposition.tenValuePercentage > 35
                    ? "text-green-400"
                    : deckComposition.tenValuePercentage < 25
                      ? "text-red-400"
                      : "text-neutral-300",
                )}
              >
                {deckComposition.tenValuePercentage.toFixed(0)}%
              </div>
            </div>
            <div className="bg-neutral-800/30 rounded p-2">
              <div className="text-neutral-400">Aces</div>
              <div
                className={cn(
                  "font-bold text-sm",
                  deckComposition.acePercentage > 8
                    ? "text-green-400"
                    : deckComposition.acePercentage < 6
                      ? "text-red-400"
                      : "text-neutral-300",
                )}
              >
                {deckComposition.acePercentage.toFixed(0)}%
              </div>
            </div>
            <div className="bg-neutral-800/30 rounded p-2">
              <div className="text-neutral-400">Confidence</div>
              <div
                className={cn(
                  "font-bold text-sm",
                  strategy.confidence === "high"
                    ? "text-green-400"
                    : strategy.confidence === "medium"
                      ? "text-yellow-400"
                      : "text-red-400",
                )}
              >
                {strategy.confidence.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Special Alerts */}
        {(isCountFavorable || shouldTakeInsurance) && (
          <div className="space-y-1">
            {isCountFavorable && (
              <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                🎯 Favorable count - consider increasing bets next hand
              </div>
            )}
            {shouldTakeInsurance && (
              <div className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                💰 Insurance recommended with count +{trueCount.toFixed(1)}
              </div>
            )}
          </div>
        )}

        {/* Hand Summary */}
        <div className="text-xs text-neutral-500 bg-neutral-800/20 p-2 rounded">
          <strong>Hand:</strong>{" "}
          {currentPlayerHand.cards
            .map((card) => `${card.rank}${card.suit}`)
            .join(", ")}
          ({currentPlayerHand.value},{" "}
          {currentPlayerHand.isSoft ? "Soft" : "Hard"}) vs Dealer{" "}
          {dealerUpCard.rank}
        </div>
      </CardContent>
    </CardComp>
  );
};
