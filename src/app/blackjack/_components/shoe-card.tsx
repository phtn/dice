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
import { StatCard } from "@/components/hyper/stat-card";
import { ProgressBar } from "@/components/hyper/progress-bar";
import { cn } from "@/lib/utils";

export const ShoeCard = () => {
  const {
    remainingCards,
    totalCards,
    usedCards,
    deckCount,
    setDeckCount,
    gameState,
    shuffleDeck,
    getRemainingCardsByRank,
    getUsedCardsByRank,
  } = useBlackjackCtx();

  const deckOptions = [1, 2, 4, 6, 8];
  const remainingPercentage =
    totalCards > 0 ? (remainingCards / totalCards) * 100 : 0;
  const usedPercentage = totalCards > 0 ? (usedCards / totalCards) * 100 : 0;

  const remainingByRank = getRemainingCardsByRank();
  const usedByRank = getUsedCardsByRank();

  const getCardsByCategory = () => {
    // Group cards by their blackjack significance
    const categories = [
      {
        name: "high",
        ranks: ["10", "J", "Q", "K"],
        color: "text-red-200",
      },
      {
        name: "aces",
        ranks: ["A"],
        color: "text-yellow-200",
      },
      {
        name: "neutral (7-9)",
        ranks: ["7", "8", "9"],
        color: "text-blue-300",
      },
      {
        name: "low (2-6)",
        ranks: ["2", "3", "4", "5", "6"],
        color: "text-green-300",
      },
    ];

    return categories.map((category) => ({
      ...category,
      cards: category.ranks.map((rank) => {
        const totalOfRank = deckCount * 4;
        const usedOfRank = usedByRank[rank] || 0;
        const remainingOfRank = remainingByRank[rank] || 0;

        return {
          rank,
          total: totalOfRank,
          used: usedOfRank,
          remaining: remainingOfRank,
        };
      }),
    }));
  };

  const cardsByCategory = getCardsByCategory();

  return (
    <Card className="lg:col-span-3 bg-neutral-900/80 border-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
          SHOE STATUS
        </CardTitle>
        <CardAction>
          <div className="space-x-2 flex items-center">
            <div className="text-xs text-neutral-400 font-mono -space-y-0.5">
              <div>DECK</div>
              <div>COUNT</div>
            </div>
            <div className="flex gap-1">
              {deckOptions.map((count) => (
                <Button
                  key={count}
                  onClick={() => setDeckCount(count)}
                  size={"sm"}
                  disabled={gameState !== "betting"}
                  variant={deckCount === count ? "default" : "outline"}
                  className={cn(
                    "text-sm font-bold cursor-pointer bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-400 hover:bg-neutral-700",
                    {
                      "bg-six-nine/75 hover:bg-orange-700 text-primary":
                        deckCount === count,
                    },
                  )}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Shoe Overview */}
        <div className=" grid grid-cols-3 gap-4">
          {/* Total Cards */}
          <StatCard label={"total cards"} value={totalCards} />

          {/* Remaining Cards */}
          <StatCard label={"remaining"} value={remainingCards} />

          {/* Used Cards */}

          <StatCard label={"used"} value={usedCards} />
        </div>
        <div className="space-y-1">
          {/* Progress Bar */}
          <ProgressBar title="Shoe Progress" value={usedPercentage} />
          <div className="justify-between hidden text-xs text-neutral-500">
            <span>{usedPercentage.toFixed(1)}% used</span>
            <span>{remainingPercentage.toFixed(1)}% left</span>
          </div>
        </div>

        {/* Card Count by Category */}
        <div className="space-y-6">
          {cardsByCategory.map(({ name, cards, color }) => (
            <div key={name} className="space-y-1">
              <div className="flex items-center space-x-2">
                <div
                  className={`text-sm tracking-wide font-mono uppercase ${color}`}
                >
                  {name}
                </div>
                <div className="text-xs text-neutral-500 text-center">
                  Total: {cards.reduce((sum, card) => sum + card.remaining, 0)}/
                  {cards.reduce((sum, card) => sum + card.total, 0)}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                {cards.map(({ rank, remaining, total }) => (
                  <StatCard key={rank} className="space-y-0 rounded-lg">
                    <div className=" flex items-start justify-between">
                      <div className="text-zinc-300 text-2xl font-redhat">
                        {rank}
                      </div>
                      <div
                        className={cn("text-teal-400 tracking-tight", {
                          "text-sky-400": remaining / total < 0.75,
                          "text-orange-400": remaining / total < 0.5,
                          "text-red-400": remaining / total < 0.25,
                        })}
                      >
                        {remaining}
                      </div>
                    </div>
                  </StatCard>
                ))}
              </div>
              {/* Category Summary */}
            </div>
          ))}
        </div>

        {/* Shuffle Button */}
        <div className="pt-2">
          <Button
            size="lg"
            onClick={shuffleDeck}
            disabled={gameState !== "betting"}
            className="w-full text-xs py-4"
          >
            Shuffle Deck
          </Button>
        </div>

        {/* Penetration Warning */}
        {remainingPercentage < 25 && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-2">
            <div className="text-xs text-yellow-500 font-mono">
              ⚠️ Low penetration - Consider shuffling
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
