"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx";
import { useAccountCtx } from "@/ctx/acc-ctx";

export const InfoCard = () => {
  const { stats, remainingCards } = useBlackjackCtx();
  const { balance, resetBalance } = useAccountCtx();

  const winRate =
    stats.gamesPlayed > 0
      ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  return (
    <Card className="lg:col-span-3 bg-neutral-900/70 border-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            GAME STATISTICS
          </CardTitle>
          <Button
            onClick={resetBalance}
            size="sm"
            variant="outline"
            className="text-xs h-6 px-2 bg-neutral-800 border-neutral-600 text-neutral-300 hover:bg-neutral-700"
          >
            Reset Balance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Balance Display */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-yellow-500 font-medium">
                Account Balance
              </span>
            </div>
            <div className="text-center p-4 bg-neutral-800 rounded">
              <div className="text-2xl font-bold text-white font-mono">
                ${balance?.amount || 0}
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
                <span className="text-white font-bold font-mono">
                  {winRate}%
                </span>
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
      </CardContent>
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
        </div>
      </CardContent>
    </Card>
  );
};
