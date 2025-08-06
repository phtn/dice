"use client";

import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface StrategyGuideProps {
  className?: string;
}

type CardCategory = "hard" | "soft" | "pairs";

export const StrategyGuide: FC<StrategyGuideProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CardCategory>("hard");

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
      default:
        return hardTotals;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={cn(
          "bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-700",
          className,
        )}
      >
        <Icon name="arrow-right" className="w-4 h-4 mr-2" />
        Strategy Guide
      </Button>
    );
  }

  return (
    <Card className="bg-neutral-900/95 border-neutral-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            BASIC STRATEGY GUIDE
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <Icon name="clear" className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3">
          {[
            { key: "hard", label: "Hard Totals" },
            { key: "soft", label: "Soft Totals" },
            { key: "pairs", label: "Pair Splitting" },
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
        {/* Strategy Matrix */}
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

        {/* Legend */}
        <div className="border-t border-neutral-700 pt-3">
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

        {/* Note */}
        <div className="text-xs text-neutral-500 bg-neutral-800/50 p-2 rounded">
          <strong>Note:</strong> This basic strategy assumes standard blackjack
          rules. Always consider the specific rules of the game you&apos;re
          playing.
        </div>
      </CardContent>
    </Card>
  );
};
