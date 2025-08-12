"use client";

import { ClassName } from "@/app/types";
import { Card as CardType } from "@/ctx/blackjack-ctx";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: CardType;
  hidden?: boolean;
  className?: ClassName;
}

const getSuitColor = (suit: CardType["suit"]) => {
  return suit === "hearts" || suit === "diamonds"
    ? "text-red-600"
    : "text-black";
};

const getSuitSymbol = (suit: CardType["suit"]) => {
  const symbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  return symbols[suit];
};

export const PlayingCard = ({
  card,
  hidden = false,
  className,
}: PlayingCardProps) => {
  if (hidden) {
    return (
      <div
        className={cn(
          "w-[4.25rem] h-24 bg-blue-900 rounded-md border-1 border-blue-800/90 flex items-center justify-center relative overflow-hidden",
          className,
        )}
      >
        <div className="absolute rounded-sm inset-2 bg-gradient-to-r from-blue-800 via-blue-800/40 to-blue-800"></div>
        <div className="relative text-blue-900/70 text-3xl">♠</div>
        <div className="absolute inset-0.5 border border-blue-800/40 rounded-md"></div>
      </div>
    );
  }

  const suitColor = getSuitColor(card.suit);
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <div
      className={cn(
        "w-[4.25rem] h-24 bg-white rounded-sm flex flex-col justify-between p-1.5 relative shadow-sm select-none",
        className,
      )}
    >
      {/* Top left corner */}
      <div
        className={`text-2xl flex items-center justify-between tracking-tighter font-redhat font-semibold ${suitColor} leading-none`}
      >
        <div>{card.rank}</div>
        <div className="text-xl">{suitSymbol}</div>
      </div>

      {/* Center symbol */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${suitColor}`}
      >
        <Icon
          name="blackjack"
          className="size-2.5 opacity-50 border-[0.33px] border-zinc-400 rounded-xs"
        />
      </div>

      {/* Bottom right corner (rotated) */}
      <div
        className={`text-2xl rotate-180 flex items-center justify-between tracking-tighter font-redhat font-semibold ${suitColor} leading-none`}
      >
        <div>{card.rank}</div>
        <div className="text-xl rotate-180">{suitSymbol}</div>
      </div>
    </div>
  );
};
