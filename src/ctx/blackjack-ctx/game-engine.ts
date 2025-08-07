import { Card, DealtCard, Hand } from "./types";

/**
 * BlackjackEngine - Core game logic for blackjack
 *
 * Dealing Order (Casino Standard):
 * 1. Player gets first card (face up)
 * 2. Dealer gets first card (face up)
 * 3. Player gets second card (face up)
 * 4. Dealer gets second card (face down - "hole card")
 *
 * This alternating pattern continues for splits and hits.
 */
export class BlackjackEngine {
  private deck: Card[] = [];
  private usedCards: Card[] = [];
  private deckCount: number = 1;

  constructor(deckCount: number = 1) {
    this.deckCount = deckCount;
    this.initializeDeck();
    this.shuffleDeck();
  }

  private initializeDeck(): void {
    const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Card["rank"][] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    this.deck = [];
    this.usedCards = [];

    // Create multiple decks
    for (let deckIndex = 0; deckIndex < this.deckCount; deckIndex++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          let value: number;
          if (rank === "A") {
            value = 11; // Will be adjusted in hand calculation
          } else if (["J", "Q", "K"].includes(rank)) {
            value = 10;
          } else {
            value = parseInt(rank);
          }

          this.deck.push({ suit, rank, value });
        }
      }
    }
  }

  shuffleDeck(): void {
    // Return used cards to deck
    this.deck.push(...this.usedCards);
    this.usedCards = [];

    // Shuffle the deck
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCard(): DealtCard | null {
    // Auto-shuffle when deck gets low (less than 25% remaining)
    const totalCards = this.deckCount * 52;
    if (this.deck.length < totalCards * 0.25) {
      this.shuffleDeck();
    }

    const card = this.deck.pop() || null;
    if (card) {
      this.usedCards.push(card);
    }
    return card as DealtCard;
  }

  setDeckCount(count: number): void {
    this.deckCount = count;
    this.initializeDeck();
    this.shuffleDeck();
  }

  getDeckCount(): number {
    return this.deckCount;
  }

  getTotalCards(): number {
    return this.deckCount * 52;
  }

  getUsedCards(): number {
    return this.usedCards.length;
  }

  calculateHandValue(cards: Card[]): {
    value: number;
    lowValue: number;
    highValue: number;
    isSoft: boolean;
    isBlackjack: boolean;
    isBust: boolean;
  } {
    let nonAceValue = 0;
    let aces = 0;

    // Count non-ace cards and aces separately
    for (const card of cards) {
      if (card.rank === "A") {
        aces++;
      } else {
        nonAceValue += card.value;
      }
    }

    // Calculate low value (all aces as 1)
    const lowValue = nonAceValue + aces;

    // Calculate high value (optimal ace usage)
    let highValue = nonAceValue;
    let acesUsedAsEleven = 0;

    // Add aces optimally
    for (let i = 0; i < aces; i++) {
      if (highValue + 11 <= 21) {
        highValue += 11;
        acesUsedAsEleven++;
      } else {
        highValue += 1;
      }
    }

    // The optimal value is the high value
    const value = highValue;

    // Hand is soft if it contains at least one ace counted as 11
    const isSoft = acesUsedAsEleven > 0;

    const isBlackjack = cards.length === 2 && value === 21;
    const isBust = value > 21;

    return { value, lowValue, highValue, isSoft, isBlackjack, isBust };
  }

  createHand(cards: Card[] = []): Hand {
    const { value, lowValue, highValue, isSoft, isBlackjack, isBust } =
      this.calculateHandValue(cards);

    return {
      cards,
      value,
      lowValue,
      highValue,
      isSoft,
      isBlackjack,
      isBust,
    };
  }

  shouldDealerHit(dealerHand: Hand): boolean {
    if (dealerHand.value < 17) return true;
    if (dealerHand.value === 17 && dealerHand.isSoft) return true; // Dealer hits soft 17
    return false;
  }

  determineWinner(
    playerHand: Hand,
    dealerHand: Hand,
  ):
    | "player-wins"
    | "dealer-wins"
    | "push"
    | "player-blackjack"
    | "dealer-blackjack" {
    // Check for blackjacks first
    if (playerHand.isBlackjack && dealerHand.isBlackjack) return "push";
    if (playerHand.isBlackjack) return "player-blackjack";
    if (dealerHand.isBlackjack) return "dealer-blackjack";

    // Check for busts
    if (playerHand.isBust) return "dealer-wins";
    if (dealerHand.isBust) return "player-wins";

    // Compare values
    if (playerHand.value > dealerHand.value) return "player-wins";
    if (dealerHand.value > playerHand.value) return "dealer-wins";

    return "push";
  }

  getCardDisplay(card: Card): string {
    const suitSymbols = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    };

    return `${card.rank}${suitSymbols[card.suit]}`;
  }

  getRemainingCards(): number {
    return this.deck.length;
  }

  getUsedCardsByRank(): Record<string, number> {
    const cardCount: Record<string, number> = {};
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    // Initialize counts
    ranks.forEach((rank) => {
      cardCount[rank] = 0;
    });

    // Count used cards
    this.usedCards.forEach((card) => {
      cardCount[card.rank]++;
    });

    return cardCount;
  }

  getRemainingCardsByRank(): Record<string, number> {
    const usedByRank = this.getUsedCardsByRank();
    const remainingByRank: Record<string, number> = {};
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    ranks.forEach((rank) => {
      const totalOfRank = this.deckCount * 4; // 4 cards of each rank per deck
      remainingByRank[rank] = totalOfRank - (usedByRank[rank] || 0);
    });

    return remainingByRank;
  }

  canSplit(hand: Hand): boolean {
    return hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank;
  }

  splitHand(hand: Hand): { hand1: Hand; hand2: Hand } {
    if (!this.canSplit(hand)) {
      throw new Error("Cannot split this hand");
    }

    const card1 = hand.cards[0];
    const card2 = hand.cards[1];

    const hand1 = this.createHand([card1]);
    const hand2 = this.createHand([card2]);

    return { hand1, hand2 };
  }
}
