"use client";

import { Card as CardType } from "@/ctx/blackjack-ctx";

interface PlayingCardProps {
  card: CardType;
  hidden?: boolean;
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

export const PlayingCard = ({ card, hidden = false }: PlayingCardProps) => {
  if (hidden) {
    return (
      <div className="w-[4.25rem] h-24 bg-blue-900 rounded-md border-1 border-blue-800/90 flex items-center justify-center relative overflow-hidden">
        <div className="absolute rounded-sm inset-2 bg-gradient-to-r from-blue-800 via-blue-800/40 to-blue-800"></div>
        <div className="relative text-blue-900/70 text-3xl">♠</div>
        <div className="absolute inset-0.5 border border-blue-800/40 rounded-md"></div>
      </div>
    );
  }

  const suitColor = getSuitColor(card.suit);
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <div className="w-[4.25rem] h-24 bg-white rounded-md flex flex-col justify-between p-1.5 relative shadow-lg">
      {/* Top left corner */}
      <div className={`text-xs font-bold ${suitColor} leading-none`}>
        <div>{card.rank}</div>
        <div className="text-center">{suitSymbol}</div>
      </div>

      {/* Center symbol */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${suitColor}`}
      >
        <div className="text-2xl">{suitSymbol}</div>
      </div>

      {/* Bottom right corner (rotated) */}
      <div
        className={`${suitColor} leading-none self-end transform rotate-180`}
      >
        <div className="text-sm font-redhat">{card.rank}</div>
        <div className="text-center text-[6px]">{suitSymbol}</div>
      </div>
    </div>
  );
};
