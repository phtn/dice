import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UpdatesCard = () => {
  return (
    <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
          GAME RULES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">OBJECTIVE</div>
            <div className="text-xs text-neutral-300">
              Get as close to 21 as possible without going over. Beat the dealer&apos;s hand.
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">CARD VALUES</div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>• Number cards: Face value</div>
              <div>• Face cards (J, Q, K): 10 points</div>
              <div>• Aces: 1 or 11 points</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">ACTIONS</div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>• <span className="text-green-500">HIT</span>: Take another card</div>
              <div>• <span className="text-red-500">STAND</span>: Keep current hand</div>
              <div>• <span className="text-blue-500">DOUBLE DOWN</span>: Double bet, take one card</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-orange-500 font-medium mb-2">PAYOUTS</div>
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
