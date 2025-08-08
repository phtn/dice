"use client";

import { FC } from "react";
import { StrategyAssistant } from "./strategy-assistant";
// import { AdvancedStrategyDisplay } from "./advanced-strategy-display";
import { cn } from "@/lib/utils";

interface StrategyIntegrationExampleProps {
  className?: string;
}

export const StrategyIntegrationExample: FC<StrategyIntegrationExampleProps> = ({
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Simple Strategy Assistant - Use this in your main game */}
      <StrategyAssistant compact={false} />

      {/* Or use the compact version for minimal space */}
      {/* <StrategyAssistant compact={true} /> */}

      {/* Full Advanced Strategy Display - Use this for detailed analysis */}
      {/* <AdvancedStrategyDisplay
        playerHand={currentPlayerHand}
        dealerUpCard={dealerUpCard}
        remainingCardsByRank={remainingCardsByRank}
        canDoubleDown={canDoubleDown}
        canSplit={canSplit}
      /> */}
    </div>
  );
};