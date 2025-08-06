"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface StrategyMatrixImageProps {
  className?: string;
}

export const StrategyMatrixImage: FC<StrategyMatrixImageProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={cn(
          "bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-700 text-xs",
          className,
        )}
      >
        <Icon name="arrow-right" className="w-4 h-4 mr-1" />
        Strategy Chart
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h3 className="text-lg font-bold text-neutral-200">
            Blackjack Basic Strategy
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <Icon name="clear" className="w-5 h-5" />
          </Button>
        </div>

        {/* Strategy Chart Image */}
        <div className="p-4">
          <div className="bg-white rounded-lg p-4 mb-4">
            {/* You would replace this with your actual image */}
            {/* Strategy chart would go here - replace with your actual image */}
            <div className="w-full h-64 bg-neutral-100 rounded flex items-center justify-center text-neutral-600">
              Strategy Chart Image Placeholder
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-neutral-800/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-bold text-neutral-200 mb-2">
              Quick Tips:
            </h4>
            <div className="text-xs text-neutral-300 space-y-1">
              <p>
                • <strong>Hard Totals:</strong> Hands without an Ace or with Ace
                counted as 1
              </p>
              <p>
                • <strong>Soft Totals:</strong> Hands with an Ace counted as 11
              </p>
              <p>
                • <strong>Pair Splitting:</strong> When you have two cards of
                the same rank
              </p>
              <p>
                • <strong>DAS:</strong> Double After Split (if allowed by house
                rules)
              </p>
              <p>
                • <strong>Surrender:</strong> Give up half your bet (if allowed)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
