export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank:
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K";
  value: number;
}

export interface Hand {
  cards: Card[];
  value: number;
  isBlackjack: boolean;
  isBust: boolean;
  isSoft: boolean; // Contains an ace counted as 11
}

export interface DealtCard extends Card {
  order: number;
  dealOrder: number;
  recipient: "player" | "dealer";
  dealIndex: number;
}

export type GameState =
  | "betting"
  | "dealing"
  | "player-turn"
  | "dealer-turn"
  | "game-over";

export type GameResult =
  | "player-wins"
  | "dealer-wins"
  | "push"
  | "player-blackjack"
  | "dealer-blackjack"
  | null;

export interface PlayerHand extends Hand {
  id: string;
  betAmount: number;
  isActive: boolean;
  result?: GameResult;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  pushes: number;
  blackjacks: number;
  totalWinnings: number;
}
