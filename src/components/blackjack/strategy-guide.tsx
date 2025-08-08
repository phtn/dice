"use client";

import { FC, useState } from "react";
import {
  Card as CardComp,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card, Hand } from "@/ctx/blackjack-ctx/types";

interface StrategyGuideProps {
  toggleStudio: VoidFunction;
  className?: string;
  // Optional props for advanced strategy
  playerHand?: Hand;
  dealerUpCard?: Card;
  remainingCardsByRank?: Record<string, number>;
  canDoubleDown?: boolean;
  canSplit?: boolean;
  showAdvancedStrategy?: boolean;
}

type CardCategory = "hard" | "soft" | "pairs" | "advanced";
type Confidence = "high" | "medium" | "low";

interface BaseStrategy {
  action: string;
  description: string;
  confidence: Confidence;
  reason?: string;
  deviation?: string;
}

interface AdvancedStrategy extends BaseStrategy {
  reason: string;
  countInfluence: "positive" | "negative" | "neutral";
  deviation?: string;
}

// Calculate true count for card counting
const calculateTrueCount = (
  remainingCardsByRank: Record<string, number>,
): number => {
  const totalRemaining = Object.values(remainingCardsByRank).reduce(
    (sum, count) => sum + count,
    0,
  );
  const decksRemaining = totalRemaining / 52;

  // Running count calculation (Hi-Lo system)
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
  // Note: Neutral cards (7, 8, 9) don't affect the Hi-Lo count, so we don't need to track them

  // Expected counts in a fresh deck
  const expectedLowCards = decksRemaining * 20; // 5 ranks × 4 suits
  const expectedHighCards = decksRemaining * 20; // 5 ranks × 4 suits

  // Running count = (actual high cards - expected high cards) - (actual low cards - expected low cards)
  const runningCount =
    highCards - expectedHighCards - (lowCards - expectedLowCards);

  return decksRemaining > 0 ? runningCount / decksRemaining : 0;
};

// Advanced strategy that considers remaining cards
export const getAdvancedStrategy = (
  playerHand: Hand,
  dealerUpCard: Card,
  remainingCardsByRank: Record<string, number>,
  canDoubleDown: boolean = true,
  canSplit: boolean = false,
): AdvancedStrategy => {
  const baseStrategy = getBaseStrategy(
    playerHand,
    dealerUpCard,
    canDoubleDown,
    canSplit,
  );
  const trueCount = calculateTrueCount(remainingCardsByRank);
  const totalRemaining = Object.values(remainingCardsByRank).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Get specific card probabilities
  const getCardProbability = (rank: string): number => {
    const count = remainingCardsByRank[rank] || 0;
    return totalRemaining > 0 ? count / totalRemaining : 0;
  };

  const tenValueProb =
    getCardProbability("10") +
    getCardProbability("J") +
    getCardProbability("Q") +
    getCardProbability("K");
  const aceProb = getCardProbability("A");
  const lowCardProb =
    getCardProbability("2") +
    getCardProbability("3") +
    getCardProbability("4") +
    getCardProbability("5") +
    getCardProbability("6");

  // Strategy deviations based on true count and card composition
  const playerValue = playerHand.value;
  const dealerValue =
    dealerUpCard.rank === "A"
      ? 11
      : ["J", "Q", "K"].includes(dealerUpCard.rank)
        ? 10
        : parseInt(dealerUpCard.rank);

  // High count deviations (rich in 10s and Aces)
  if (trueCount >= 2) {
    // More aggressive doubling when count is high
    if (playerValue === 9 && dealerValue === 2 && canDoubleDown) {
      return {
        ...baseStrategy,
        action: "DOUBLE DOWN",
        description: "Double down on 9 vs 2 with high count",
        confidence: "high",
        reason: `High count (+${trueCount.toFixed(1)}) favors doubling`,
        countInfluence: "positive",
        deviation: "Basic strategy says hit, but high count suggests double",
      };
    }

    // More conservative hitting on stiff hands
    if (playerValue === 16 && dealerValue === 10) {
      return {
        ...baseStrategy,
        action: "STAND",
        description: "Stand on 16 vs 10 with high count",
        confidence: "medium",
        reason: `High count (+${trueCount.toFixed(1)}) increases bust probability`,
        countInfluence: "positive",
        deviation: "Basic strategy says hit, but high count suggests stand",
      };
    }

    // Insurance becomes favorable
    if (dealerUpCard.rank === "A" && trueCount >= 3) {
      return {
        ...baseStrategy,
        action: "INSURANCE",
        description: "Take insurance with very high count",
        confidence: "high",
        reason: `Very high count (+${trueCount.toFixed(1)}) makes insurance profitable`,
        countInfluence: "positive",
        deviation:
          "Insurance is normally a bad bet, but high count makes it favorable",
      };
    }
  }

  // Low count deviations (rich in small cards)
  if (trueCount <= -2) {
    // More aggressive hitting
    if (playerValue === 12 && [4, 5, 6].includes(dealerValue)) {
      return {
        ...baseStrategy,
        action: "HIT",
        description: "Hit 12 vs weak dealer with low count",
        confidence: "medium",
        reason: `Low count (${trueCount.toFixed(1)}) reduces bust risk`,
        countInfluence: "negative",
        deviation: "Basic strategy says stand, but low count suggests hit",
      };
    }

    // Less aggressive doubling
    if (playerValue === 11 && dealerValue === 10 && canDoubleDown) {
      return {
        ...baseStrategy,
        action: "HIT",
        description: "Hit 11 vs 10 with low count instead of doubling",
        confidence: "medium",
        reason: `Low count (${trueCount.toFixed(1)}) reduces chance of getting 10`,
        countInfluence: "negative",
        deviation:
          "Basic strategy says double, but low count suggests just hit",
      };
    }
  }

  // Specific card composition adjustments
  if (tenValueProb > 0.35) {
    // Deck rich in 10-value cards
    if (playerValue === 11 && canDoubleDown) {
      return {
        ...baseStrategy,
        action: "DOUBLE DOWN",
        description: "Double down with high 10-value card concentration",
        confidence: "high",
        reason: `${(tenValueProb * 100).toFixed(1)}% chance of 10-value card`,
        countInfluence: "positive",
      };
    }
  }

  if (aceProb > 0.1) {
    // Deck rich in Aces
    if (playerHand.isSoft && playerValue <= 18) {
      return {
        ...baseStrategy,
        action: baseStrategy.action,
        description: baseStrategy.description + " (Ace-rich deck)",
        confidence: baseStrategy.confidence,
        reason: `High Ace concentration (${(aceProb * 100).toFixed(1)}%) affects soft hand strategy`,
        countInfluence: "positive",
      };
    }
  }

  if (lowCardProb > 0.4) {
    // Deck rich in low cards
    if (playerValue >= 12 && playerValue <= 16 && dealerValue >= 7) {
      return {
        ...baseStrategy,
        action: "HIT",
        description: "Hit stiff hand with low card concentration",
        confidence: "medium",
        reason: `${(lowCardProb * 100).toFixed(1)}% chance of low card reduces bust risk`,
        countInfluence: "negative",
      };
    }
  }

  // Return enhanced base strategy with count information
  return {
    ...baseStrategy,
    reason:
      trueCount > 1
        ? `Positive count (+${trueCount.toFixed(1)}) supports basic strategy`
        : trueCount < -1
          ? `Negative count (${trueCount.toFixed(1)}) supports basic strategy`
          : "Neutral count, following basic strategy",
    countInfluence:
      trueCount > 1 ? "positive" : trueCount < -1 ? "negative" : "neutral",
  };
};

// Export the strategy recommendation function for use in other components
export const getBaseStrategy = (
  playerHand: Hand,
  dealerUpCard: Card,
  canDoubleDown: boolean = true,
  canSplit: boolean = false,
): BaseStrategy => {
  // Strategy data (duplicated for standalone function)
  const hardTotals = [
    {
      player: "17",
      dealer: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
    },
    {
      player: "16",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "15",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "14",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "13",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "12",
      dealer: ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "11",
      dealer: ["D", "D", "D", "D", "D", "D", "D", "D", "D", "H"],
    },
    {
      player: "10",
      dealer: ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
    },
    { player: "9", dealer: ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"] },
    { player: "8", dealer: ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"] },
  ];

  const softTotals = [
    {
      player: "A,9",
      dealer: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
    },
    {
      player: "A,8",
      dealer: ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"],
    },
    {
      player: "A,7",
      dealer: ["Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"],
    },
    {
      player: "A,6",
      dealer: ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,5",
      dealer: ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,4",
      dealer: ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,3",
      dealer: ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,2",
      dealer: ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
    },
  ];

  const pairSplitting = [
    {
      player: "A,A",
      dealer: ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    },
    {
      player: "10,10",
      dealer: ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    },
    {
      player: "9,9",
      dealer: ["Y", "Y", "Y", "Y", "Y", "N", "Y", "Y", "N", "N"],
    },
    {
      player: "8,8",
      dealer: ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    },
    {
      player: "7,7",
      dealer: ["Y", "Y", "Y", "Y", "Y", "Y", "N", "N", "N", "N"],
    },
    {
      player: "6,6",
      dealer: ["Y/N", "Y", "Y", "Y", "Y", "N", "N", "N", "N", "N"],
    },
    {
      player: "5,5",
      dealer: ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    },
    {
      player: "4,4",
      dealer: ["N", "N", "N", "Y/N", "Y/N", "N", "N", "N", "N", "N"],
    },
    {
      player: "3,3",
      dealer: ["Y/N", "Y/N", "Y", "Y", "Y", "Y", "N", "N", "N", "N"],
    },
    {
      player: "2,2",
      dealer: ["Y/N", "Y/N", "Y", "Y", "Y", "Y", "N", "N", "N", "N"],
    },
  ];

  const getDealerIndex = (card: Card): number => {
    if (card?.rank === "A") return 9;
    if (["J", "Q", "K"].includes(card?.rank)) return 8;
    if (card?.rank === "10") return 8;
    return parseInt(card?.rank) - 2;
  };

  const getActionRecommendation = (
    action: string,
    canDoubleDown: boolean,
    confidence: "high" | "medium" | "low",
  ) => {
    switch (action) {
      case "H":
        return { action: "HIT", description: "Take another card", confidence };
      case "S":
        return {
          action: "STAND",
          description: "Keep your current total",
          confidence,
        };
      case "D":
        return canDoubleDown
          ? {
              action: "DOUBLE DOWN",
              description: "Double your bet and take exactly one more card",
              confidence,
            }
          : {
              action: "HIT",
              description: "Hit (can't double down)",
              confidence: "medium" as const,
            };
      case "Ds":
        return canDoubleDown
          ? {
              action: "DOUBLE DOWN",
              description:
                "Double your bet and take exactly one more card, or stand if you can't double",
              confidence,
            }
          : {
              action: "STAND",
              description: "Stand (can't double down)",
              confidence: "medium" as const,
            };
      default:
        return {
          action: "HIT",
          description: "Default action",
          confidence: "low" as const,
        };
    }
  };

  const dealerIndex = getDealerIndex(dealerUpCard);
  const isPair =
    playerHand.cards.length === 2 &&
    playerHand.cards[0].rank === playerHand.cards[1].rank;
  const isSoft = playerHand.isSoft;

  // Check pairs first
  if (isPair && canSplit) {
    const pairValue = playerHand.cards[0].rank;
    let pairRow = null;

    if (pairValue === "A") {
      pairRow = pairSplitting.find((row) => row.player === "A,A");
    } else if (["J", "Q", "K", "10"].includes(pairValue)) {
      pairRow = pairSplitting.find((row) => row.player === "10,10");
    } else {
      pairRow = pairSplitting.find(
        (row) => row.player === `${pairValue},${pairValue}`,
      );
    }

    if (pairRow) {
      const action = pairRow.dealer[dealerIndex];
      if (action === "Y") {
        return {
          action: "SPLIT",
          description: `Split your pair of ${pairValue}s`,
          confidence: "high",
        };
      } else if (action === "Y/N") {
        return {
          action: "SPLIT",
          description: `Split if Double After Split is allowed, otherwise follow basic strategy`,
          confidence: "medium",
        };
      }
    }
  }

  // Check soft hands
  if (isSoft && playerHand.cards.length === 2) {
    const aceCard = playerHand.cards.find((card) => card.rank === "A");
    const otherCard = playerHand.cards.find((card) => card.rank !== "A");

    if (aceCard && otherCard) {
      const otherValue =
        otherCard.rank === "A"
          ? "9"
          : ["J", "Q", "K"].includes(otherCard.rank)
            ? "9" // A,10 is A,9 in soft totals
            : otherCard.rank;

      const softRow = softTotals.find(
        (row) => row.player === `A,${otherValue}`,
      );

      if (softRow) {
        const action = softRow.dealer[dealerIndex];
        return getActionRecommendation(action, canDoubleDown, "high");
      }
    }
  }

  // Check hard hands
  const handValue = playerHand.value;
  const hardRow = hardTotals.find((row) => parseInt(row.player) === handValue);

  if (hardRow) {
    const action = hardRow.dealer[dealerIndex];
    return getActionRecommendation(action, canDoubleDown, "high");
  }

  // Fallback
  if (handValue >= 17) {
    return {
      action: "STAND",
      description: "Stand on 17 or higher",
      confidence: "high",
    };
  } else if (handValue <= 8) {
    return {
      action: "HIT",
      description: "Always hit on 8 or lower",
      confidence: "high",
    };
  }

  return {
    action: "HIT",
    description: "Default recommendation",
    confidence: "low",
  };
};

export const StrategyGuide: FC<StrategyGuideProps> = ({
  toggleStudio,
  playerHand,
  dealerUpCard,
  remainingCardsByRank,
  canDoubleDown = true,
  canSplit = false,
  showAdvancedStrategy = false,
}) => {
  // const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CardCategory>("hard");
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedStrategy);

  // Strategy data based on your matrix
  const hardTotals = [
    {
      player: "17",
      dealer: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
    },
    {
      player: "16",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "15",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "14",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "13",
      dealer: ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "12",
      dealer: ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"],
    },
    {
      player: "11",
      dealer: ["D", "D", "D", "D", "D", "D", "D", "D", "D", "H"],
    },
    {
      player: "10",
      dealer: ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
    },
    { player: "9", dealer: ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"] },
    { player: "8", dealer: ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"] },
  ];

  const softTotals = [
    {
      player: "A,9",
      dealer: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
    },
    {
      player: "A,8",
      dealer: ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"],
    },
    {
      player: "A,7",
      dealer: ["Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"],
    },
    {
      player: "A,6",
      dealer: ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,5",
      dealer: ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,4",
      dealer: ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,3",
      dealer: ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
    },
    {
      player: "A,2",
      dealer: ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
    },
  ];

  const pairSplitting = [
    {
      player: "A,A",
      dealer: ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    },
    {
      player: "10,10",
      dealer: ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    },
    {
      player: "9,9",
      dealer: ["Y", "Y", "Y", "Y", "Y", "N", "Y", "Y", "N", "N"],
    },
    {
      player: "8,8",
      dealer: ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    },
    {
      player: "7,7",
      dealer: ["Y", "Y", "Y", "Y", "Y", "Y", "N", "N", "N", "N"],
    },
    {
      player: "6,6",
      dealer: ["Y/N", "Y", "Y", "Y", "Y", "N", "N", "N", "N", "N"],
    },
    {
      player: "5,5",
      dealer: ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    },
    {
      player: "4,4",
      dealer: ["N", "N", "N", "Y/N", "Y/N", "N", "N", "N", "N", "N"],
    },
    {
      player: "3,3",
      dealer: ["Y/N", "Y/N", "Y", "Y", "Y", "Y", "N", "N", "N", "N"],
    },
    {
      player: "2,2",
      dealer: ["Y/N", "Y/N", "Y", "Y", "Y", "Y", "N", "N", "N", "N"],
    },
  ];

  const dealerCards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];

  const getActionColor = (action: string) => {
    switch (action) {
      case "H":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "S":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "D":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Ds":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Y":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "N":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Y/N":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "SUR":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "H":
        return "Hit";
      case "S":
        return "Stand";
      case "D":
        return "Double";
      case "Ds":
        return "Double/Stand";
      case "Y":
        return "Split";
      case "N":
        return "Don't Split";
      case "Y/N":
        return "Split if DAS";
      case "SUR":
        return "Surrender";
      default:
        return action;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "hard":
        return hardTotals;
      case "soft":
        return softTotals;
      case "pairs":
        return pairSplitting;
      case "advanced":
        return []; // Advanced strategy doesn't use matrix data
      default:
        return hardTotals;
    }
  };

  // if (!isOpen) {
  //   return (
  //     <Button
  //       onClick={() => setIsOpen(true)}
  //       variant="outline"
  //       size="sm"
  //       className={cn(
  //         "bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-700",
  //         className,
  //       )}
  //     >
  //       <Icon name="arrow-right" className="w-4 h-4 mr-2" />
  //       Strategy Guide
  //     </Button>
  //   );
  // }

  return (
    <CardComp className="bg-neutral-900/95 border-neutral-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            BASIC STRATEGY GUIDE
          </CardTitle>

          <Button
            onClick={toggleStudio}
            variant="ghost"
            className="text-cyan-100 hover:text-cyan-50"
          >
            Toggle Studio
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3">
          {[
            { key: "hard", label: "Hard Totals" },
            { key: "soft", label: "Soft Totals" },
            { key: "pairs", label: "Pair Splitting" },
            { key: "advanced", label: "Advanced Strategy" },
          ].map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as CardCategory)}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-xs",
                activeTab === tab.key
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700",
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Advanced Strategy Recommendation */}
        {showAdvanced && playerHand && dealerUpCard && remainingCardsByRank && (
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-neutral-200">
                Current Hand Recommendation
              </h4>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="ghost"
                size="sm"
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button>
            </div>

            {(() => {
              const advancedStrategy = getAdvancedStrategy(
                playerHand,
                dealerUpCard,
                remainingCardsByRank,
                canDoubleDown,
                canSplit,
              );
              const trueCount = calculateTrueCount(remainingCardsByRank);

              return (
                <div className="space-y-3">
                  {/* Main Recommendation */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold",
                        advancedStrategy.action.includes("HIT")
                          ? "bg-red-500/20 text-red-300"
                          : advancedStrategy.action.includes("STAND")
                            ? "bg-green-500/20 text-green-300"
                            : advancedStrategy.action.includes("DOUBLE")
                              ? "bg-yellow-500/20 text-yellow-300"
                              : advancedStrategy.action.includes("SPLIT")
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-neutral-500/20 text-neutral-300",
                      )}
                    >
                      {advancedStrategy.action}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {advancedStrategy.description}
                    </div>
                  </div>

                  {/* Count Information */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400">True Count: </span>
                      <span
                        className={cn(
                          "font-bold",
                          trueCount > 1
                            ? "text-green-400"
                            : trueCount < -1
                              ? "text-red-400"
                              : "text-neutral-300",
                        )}
                      >
                        {trueCount > 0 ? "+" : ""}
                        {trueCount.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Confidence: </span>
                      <span
                        className={cn(
                          "font-bold",
                          advancedStrategy.confidence === "high"
                            ? "text-green-400"
                            : advancedStrategy.confidence === "medium"
                              ? "text-yellow-400"
                              : "text-red-400",
                        )}
                      >
                        {advancedStrategy.confidence.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="text-xs text-neutral-400 bg-neutral-900/50 p-2 rounded">
                    <strong>Reasoning:</strong> {advancedStrategy.reason}
                  </div>

                  {/* Deviation Notice */}
                  {advancedStrategy.deviation && (
                    <div className="text-xs text-orange-300 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                      <strong>Strategy Deviation:</strong>{" "}
                      {advancedStrategy.deviation}
                    </div>
                  )}

                  {/* Card Composition */}
                  <div className="text-xs text-neutral-500">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span>10-values: </span>
                        <span className="text-neutral-300">
                          {(
                            (Object.entries(remainingCardsByRank)
                              .filter(([rank]) =>
                                ["10", "J", "Q", "K"].includes(rank),
                              )
                              .reduce((sum, [, count]) => sum + count, 0) /
                              Object.values(remainingCardsByRank).reduce(
                                (sum, count) => sum + count,
                                0,
                              )) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div>
                        <span>Aces: </span>
                        <span className="text-neutral-300">
                          {(
                            ((remainingCardsByRank["A"] || 0) /
                              Object.values(remainingCardsByRank).reduce(
                                (sum, count) => sum + count,
                                0,
                              )) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div>
                        <span>Low (2-6): </span>
                        <span className="text-neutral-300">
                          {(
                            (Object.entries(remainingCardsByRank)
                              .filter(([rank]) =>
                                ["2", "3", "4", "5", "6"].includes(rank),
                              )
                              .reduce((sum, [, count]) => sum + count, 0) /
                              Object.values(remainingCardsByRank).reduce(
                                (sum, count) => sum + count,
                                0,
                              )) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Toggle Advanced Strategy */}
        {playerHand &&
          dealerUpCard &&
          remainingCardsByRank &&
          !showAdvanced && (
            <div className="text-center">
              <Button
                onClick={() => setShowAdvanced(true)}
                variant="outline"
                size="sm"
                className="bg-neutral-800/50 border-neutral-600 text-neutral-300 hover:bg-neutral-700"
              >
                Show Advanced Strategy for Current Hand
              </Button>
            </div>
          )}

        {/* Strategy Matrix or Advanced Strategy */}
        {activeTab === "advanced" ? (
          /* Advanced Strategy Tab Content */
          <div className="space-y-4">
            {playerHand && dealerUpCard && remainingCardsByRank ? (
              /* Show Advanced Strategy Display */
              (() => {
                const strategy = getAdvancedStrategy(
                  playerHand,
                  dealerUpCard,
                  remainingCardsByRank,
                  canDoubleDown,
                  canSplit,
                );
                const trueCount = calculateTrueCount(remainingCardsByRank);
                const totalRemaining = Object.values(
                  remainingCardsByRank,
                ).reduce((sum, count) => sum + count, 0);

                const tenValueProb =
                  (Object.entries(remainingCardsByRank)
                    .filter(([rank]) => ["10", "J", "Q", "K"].includes(rank))
                    .reduce((sum, [, count]) => sum + count, 0) /
                    totalRemaining) *
                  100;

                const aceProb =
                  ((remainingCardsByRank["A"] || 0) / totalRemaining) * 100;

                const lowCardProb =
                  (Object.entries(remainingCardsByRank)
                    .filter(([rank]) =>
                      ["2", "3", "4", "5", "6"].includes(rank),
                    )
                    .reduce((sum, [, count]) => sum + count, 0) /
                    totalRemaining) *
                  100;

                return (
                  <div className="space-y-4">
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
                          <div className="text-xs text-neutral-400">
                            True Count
                          </div>
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
                          <div className="text-xs text-neutral-400">
                            Count Influence
                          </div>
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
                        <div className="font-bold text-neutral-200 mb-1">
                          Reasoning:
                        </div>
                        {strategy.reason}
                      </div>

                      {/* Strategy Deviation */}
                      {strategy.deviation && (
                        <div className="text-xs text-orange-300 bg-orange-500/10 p-3 rounded border border-orange-500/20 mt-2">
                          <div className="font-bold mb-1">
                            Strategy Deviation:
                          </div>
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
                              .filter(([rank]) =>
                                ["10", "J", "Q", "K"].includes(rank),
                              )
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
                          <div className="text-neutral-400">
                            Low Cards (2-6)
                          </div>
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
                              .filter(([rank]) =>
                                ["2", "3", "4", "5", "6"].includes(rank),
                              )
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
                      (Value: {playerHand.value},{" "}
                      {playerHand.isSoft ? "Soft" : "Hard"}) vs Dealer{" "}
                      {dealerUpCard.rank}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* No current hand data */
              <div className="bg-neutral-800/30 rounded-lg p-6 text-center">
                <div className="text-neutral-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="text-neutral-300 font-medium mb-1">
                  No Active Hand
                </div>
                <div className="text-sm text-neutral-500">
                  Start a game to see advanced strategy recommendations based on
                  remaining cards and true count.
                </div>
                <div className="mt-4 text-xs text-neutral-600">
                  <div className="mb-2">
                    <strong>Advanced Strategy Features:</strong>
                  </div>
                  <div className="space-y-1 text-left max-w-md mx-auto">
                    <div>• Card counting with Hi-Lo system</div>
                    <div>• True count calculations</div>
                    <div>• Strategy deviations based on count</div>
                    <div>• Deck composition analysis</div>
                    <div>• Insurance recommendations</div>
                    <div>• Real-time probability calculations</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Basic Strategy Matrix */
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row */}
              <div className="grid grid-cols-11 gap-1 mb-2">
                <div className="text-xs font-bold text-neutral-400 text-center py-1">
                  {activeTab === "pairs" ? "PAIR" : "HAND"}
                </div>
                {dealerCards.map((card) => (
                  <div
                    key={card}
                    className="text-xs font-bold text-neutral-300 text-center py-1 bg-neutral-800 rounded"
                  >
                    {card}
                  </div>
                ))}
              </div>

              {/* Strategy Rows */}
              {getCurrentData().map((row, index) => (
                <div key={index} className="grid grid-cols-11 gap-1 mb-1">
                  <div className="text-xs font-bold text-neutral-300 text-center py-1 bg-neutral-800 rounded">
                    {row.player}
                  </div>
                  {row.dealer.map((action, actionIndex) => (
                    <div
                      key={actionIndex}
                      className={cn(
                        "text-xs font-bold text-center py-1 rounded border",
                        getActionColor(action),
                      )}
                      title={getActionText(action)}
                    >
                      {action}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </CardComp>
  );
};

export const MatrixLegend = () => (
  <div className="hidden border-t border-neutral-700 pt-3">
    <div className="text-xs font-bold text-neutral-400 mb-2">LEGEND:</div>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span className="text-neutral-300">H = Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
          <span className="text-neutral-300">S = Stand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
          <span className="text-neutral-300">D = Double</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/30 rounded"></div>
          <span className="text-neutral-300">Ds = Double/Stand</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
          <span className="text-neutral-300">Y = Split</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500/20 border border-gray-500/30 rounded"></div>
          <span className="text-neutral-300">N = Don&apos;t Split</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/30 rounded"></div>
          <span className="text-neutral-300">Y/N = Split if DAS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-500/20 border border-pink-500/30 rounded"></div>
          <span className="text-neutral-300">SUR = Surrender</span>
        </div>
      </div>
    </div>
  </div>
);

export const MatrixNote = () => (
  <div className="text-xs text-neutral-500 bg-neutral-800/50 p-2 rounded">
    <strong>Note:</strong> This basic strategy assumes standard blackjack rules.
    Always consider the specific rules of the game you&apos;re playing.
  </div>
);
