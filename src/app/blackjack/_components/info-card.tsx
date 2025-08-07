"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameStats, useBlackjackCtx } from "@/ctx/blackjack-ctx";
import {
  GameHistoryManager,
  GameHistoryEntry,
} from "@/ctx/blackjack-ctx/game-history";
import { StrategyGuide } from "@/components/blackjack/strategy-guide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const InfoCard = () => {
  const { getHistoryStats, getRecentGames, clearGameHistory } =
    useBlackjackCtx();
  // const { balance } = useAccountCtx();

  const historyStats = getHistoryStats();
  const recentGames = getRecentGames(20);

  return (
    <Tabs
      defaultValue={"stats"}
      className="lg:col-span-4 bg-neutral-900/0 -pt-8 max-h-[calc(100vh-64px)] overflow-hidden"
    >
      <TabsList className="dark:bg-zinc-700/20 inset-shadow-[0_0.5px_rgb(255_255_255/0.20)] space-x-6 overflow-hidden">
        <TabsTrigger
          value="stats"
          className="border-none shadow-none bg-transparent"
        >
          Game Stats
        </TabsTrigger>
        <TabsTrigger value="strategy">Strategy Guide</TabsTrigger>
        <TabsTrigger value="history">Recent Games</TabsTrigger>
      </TabsList>

      <CardContent className="space-y-6 lg:px-2 rounded-xl">
        <TabsContent value="stats">
          <GameStatsSection stats={historyStats} />
          <RecentGamesSection
            games={recentGames}
            onClearHistory={clearGameHistory}
          />
        </TabsContent>
        <TabsContent value="strategy">
          <StrategyGuide />
        </TabsContent>
        <TabsContent value="history"></TabsContent>
      </CardContent>
    </Tabs>
  );
};

interface GameStatsProps {
  stats: ReturnType<typeof GameHistoryManager.getStats>;
}

const GameStatsSection = ({ stats }: GameStatsProps) => {
  return (
    <div className="bg-zinc-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-500 font-medium">
          GAME STATISTICS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Total Games</span>
            <span className="text-white font-bold font-mono">
              {stats.totalGames}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Win Rate</span>
            <span className="text-white font-bold font-mono">
              {stats.winRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Blackjacks</span>
            <span className="text-white font-bold font-mono">
              {stats.totalBlackjacks}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Net Winnings</span>
            <span
              className={`font-bold font-mono text-xs ${stats.totalWinnings >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              ${stats.totalWinnings}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Biggest Win</span>
            <span className="text-green-400 font-bold font-mono">
              ${stats.biggestWin}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Biggest Loss</span>
            <span className="text-red-400 font-bold font-mono">
              ${Math.abs(stats.biggestLoss)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RecentGamesProps {
  games: ReturnType<typeof GameHistoryManager.getRecentGames>;
  onClearHistory: () => void;
}

const RecentGamesSection = ({ games, onClearHistory }: RecentGamesProps) => {
  const getResultColor = (result: string) => {
    switch (result) {
      case "player-blackjack":
        return "text-yellow-400";
      case "player-wins":
        return "text-green-400";
      case "push":
        return "text-blue-400";
      case "dealer-wins":
      case "dealer-blackjack":
        return "text-red-400";
      default:
        return "text-neutral-400";
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "player-blackjack":
        return "★";
      case "player-wins":
        return "✓";
      case "push":
        return "=";
      case "dealer-wins":
      case "dealer-blackjack":
        return "✗";
      default:
        return "?";
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case "player-blackjack":
        return "BLACKJACK";
      case "player-wins":
        return "WIN";
      case "push":
        return "PUSH";
      case "dealer-wins":
        return "LOSS";
      case "dealer-blackjack":
        return "DEALER BJ";
      default:
        return "UNKNOWN";
    }
  };

  const getPlayerHandValue = (game: GameHistoryEntry) => {
    // For multiple hands (splits), show the first hand or highest value
    if (game.playerHands.length === 1) {
      return game.playerHands[0].value;
    }
    // For multiple hands, show count and best value
    const bestValue = Math.max(
      ...game.playerHands.map((h) => (h.isBust ? 0 : h.value)),
    );
    return `${game.playerHands.length}H:${bestValue}`;
  };

  const getHandValueColor = (
    playerValue: number,
    dealerValue: number,
    isBust: boolean,
  ) => {
    if (isBust) return "text-red-400";
    if (playerValue > dealerValue) return "text-green-400";
    if (playerValue === dealerValue) return "text-blue-400";
    return "text-red-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-orange-500 font-medium">
            RECENT GAMES ({games.length})
          </span>
        </div>
        {games.length > 0 && (
          <Button
            onClick={onClearHistory}
            variant="ghost"
            size="sm"
            className="text-xs text-neutral-400 hover:text-red-400 h-6 px-2"
          >
            Clear
          </Button>
        )}
      </div>

      {games.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-xs">
          No games played yet
        </div>
      ) : (
        <div className="space-y-1 max-h-[32rem] overflow-y-auto">
          {games.map((game) => {
            const playerValue = getPlayerHandValue(game);
            const dealerValue = game.dealerHand.value;
            const playerIsBust = game.playerHands.some((h) => h.isBust);

            return (
              <div
                key={game.id}
                className="py-2 px-3 bg-neutral-800/50 rounded text-xs hover:bg-neutral-800/70 transition-colors"
              >
                {/* First row: Result, bet, winnings, time */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold ${getResultColor(game.overallResult || "")}`}
                    >
                      {getResultIcon(game.overallResult || "")}
                    </span>
                    <span
                      className={`font-medium ${getResultColor(game.overallResult || "")}`}
                    >
                      {getResultText(game.overallResult || "")}
                    </span>
                    <span className="text-neutral-400">
                      ${game.totalBetAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold font-mono ${game.netWinnings >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {game.netWinnings >= 0 ? "+" : ""}${game.netWinnings}
                    </span>
                    <span className="text-neutral-500 text-xs">
                      {new Date(game.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Second row: Hand values */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">You:</span>
                    <span
                      className={`font-mono font-bold ${
                        typeof playerValue === "string"
                          ? "text-neutral-300"
                          : getHandValueColor(
                              playerValue as number,
                              dealerValue,
                              playerIsBust,
                            )
                      }`}
                    >
                      {playerValue}
                    </span>
                    <span className="text-neutral-500">vs</span>
                    <span className="text-neutral-500">Dealer:</span>
                    <span className="font-mono font-bold text-neutral-300">
                      {dealerValue}
                    </span>
                  </div>

                  {game.playerHands.length > 1 && (
                    <span className="text-neutral-500 text-xs">
                      {game.playerHands.length} hands
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const GameConcept = () => {
  return (
    <div>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
          GAME RULES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">
              OBJECTIVE
            </div>
            <div className="text-xs text-neutral-300">
              Get as close to 21 as possible without going over. Beat the
              dealer&apos;s hand.
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">
              CARD VALUES
            </div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>• Number cards: Face value</div>
              <div>• Face cards (J, Q, K): 10 points</div>
              <div>• Aces: 1 or 11 points</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">
              ACTIONS
            </div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>
                • <span className="text-blue-400">HIT</span>: Take another card
              </div>
              <div>
                • <span className="text-red-400">STAND</span>: Keep current hand
              </div>
              <div>
                • <span className="text-orange-300">x2</span>: Double bet, take
                one card
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">
              PAYOUTS
            </div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>• Blackjack: 3:2 (1.5x bet)</div>
              <div>• Regular win: 1:1 (1x bet)</div>
              <div>• Push: Bet returned</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">
              STRATEGY
            </div>
            <div className="text-xs text-neutral-300">
              Use basic strategy to optimize your play and reduce the house
              edge.
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

interface LineDetailProps {
  stats: GameStats;
  balance?: number;
  winRate?: number;
  remainingCards?: number;
}
export const OldStats = ({
  stats,
  balance,
  winRate,
  remainingCards,
}: LineDetailProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        </div>
        <div className="text-center p-4 bg-neutral-800 rounded">
          <div className="text-2xl font-bold text-white font-mono">
            ${balance ?? 0}
          </div>
          <div className="text-xs text-neutral-400">Available Funds</div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-500 font-medium">
            Game Results
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Games Played</span>
            <span className="text-white font-bold font-mono">
              {stats.gamesPlayed}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Games Won</span>
            <span className="text-white font-bold font-mono">
              {stats.gamesWon}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Games Lost</span>
            <span className="text-white font-bold font-mono">
              {stats.gamesLost}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Pushes</span>
            <span className="text-white font-bold font-mono">
              {stats.pushes}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-orange-500 font-medium">
            Performance
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Win Rate</span>
            <span className="text-white font-bold font-mono">{winRate}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Blackjacks</span>
            <span className="text-white font-bold font-mono">
              {stats.blackjacks}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Total Winnings</span>
            <span className="text-white font-bold font-mono">
              {stats.totalWinnings}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Cards Left</span>
            <span className="text-white font-bold font-mono">
              {remainingCards}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
