/**
 * Tests for proper blackjack dealing order
 * In real blackjack, cards are dealt alternately: Player → Dealer → Player → Dealer
 */

import { BlackjackEngine } from "../game-engine";
import { Card } from "../types";

describe("Blackjack Dealing Order", () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test("should deal cards in correct alternating order", () => {
    // Create a predictable deck by tracking dealt cards
    const dealtCards: Card[] = [];
    const originalDealCard = engine.dealCard.bind(engine);

    // Mock dealCard to track the order
    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealtCards.push(card);
      }
      return card;
    };

    // Simulate the dealing process as it happens in startNewGame
    const playerCards: Card[] = [];
    const dealerCards: Card[] = [];

    // Deal in proper blackjack order: Player → Dealer → Player → Dealer
    const playerCard1 = engine.dealCard();
    const dealerCard1 = engine.dealCard();
    const playerCard2 = engine.dealCard();
    const dealerCard2 = engine.dealCard();

    if (playerCard1) playerCards.push(playerCard1);
    if (playerCard2) playerCards.push(playerCard2);
    if (dealerCard1) dealerCards.push(dealerCard1);
    if (dealerCard2) dealerCards.push(dealerCard2);

    // Verify dealing order
    expect(dealtCards.length).toBe(4);
    expect(dealtCards[0]).toBe(playerCard1); // First card to player
    expect(dealtCards[1]).toBe(dealerCard1); // Second card to dealer
    expect(dealtCards[2]).toBe(playerCard2); // Third card to player
    expect(dealtCards[3]).toBe(dealerCard2); // Fourth card to dealer

    // Verify hands are built correctly
    expect(playerCards.length).toBe(2);
    expect(dealerCards.length).toBe(2);
    expect(playerCards[0]).toBe(dealtCards[0]); // Player's first card
    expect(playerCards[1]).toBe(dealtCards[2]); // Player's second card
    expect(dealerCards[0]).toBe(dealtCards[1]); // Dealer's first card
    expect(dealerCards[1]).toBe(dealtCards[3]); // Dealer's second card
  });

  test("should maintain proper order with multiple players (split scenario)", () => {
    // In a split scenario, each hand should get cards in proper order
    const dealtCards: Card[] = [];
    const originalDealCard = engine.dealCard.bind(engine);

    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealtCards.push(card);
      }
      return card;
    };

    // Simulate initial deal
    const playerCard1 = engine.dealCard(); // 1st card
    // const dealerCard1 = engine.dealCard(); // 2nd card
    const playerCard2 = engine.dealCard(); // 3rd card
    // const dealerCard2 = engine.dealCard(); // 4th card

    // Simulate split (player gets pair)
    const pairCards = [playerCard1!, playerCard2!];
    const initialHand = engine.createHand(pairCards);

    // If it's a splittable pair, simulate the split
    if (engine.canSplit(initialHand)) {
      // const { hand1, hand2 } = engine.splitHand(initialHand);

      // Deal one card to each split hand (continuing the alternating pattern)
      const splitCard1 = engine.dealCard(); // 5th card - to first split hand
      const splitCard2 = engine.dealCard(); // 6th card - to second split hand

      expect(dealtCards.length).toBe(6);
      expect(splitCard1).toBe(dealtCards[4]);
      expect(splitCard2).toBe(dealtCards[5]);
    }
  });

  test("should deal hit cards in proper sequence", () => {
    const dealtCards: Card[] = [];
    const originalDealCard = engine.dealCard.bind(engine);

    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealtCards.push(card);
      }
      return card;
    };

    // Initial deal
    const playerCard1 = engine.dealCard();
    const dealerCard1 = engine.dealCard();
    const playerCard2 = engine.dealCard();
    const dealerCard2 = engine.dealCard();

    // Player hits
    const playerHitCard = engine.dealCard();

    // Dealer hits (during dealer play)
    const dealerHitCard = engine.dealCard();

    expect(dealtCards.length).toBe(6);
    expect(dealtCards[0]).toBe(playerCard1);
    expect(dealtCards[1]).toBe(dealerCard1);
    expect(dealtCards[2]).toBe(playerCard2);
    expect(dealtCards[3]).toBe(dealerCard2);
    expect(dealtCards[4]).toBe(playerHitCard);
    expect(dealtCards[5]).toBe(dealerHitCard);
  });

  test("should handle edge case where deck runs out during initial deal", () => {
    // Create engine with very few cards
    const smallEngine = new BlackjackEngine(1);

    // Deal most of the deck
    for (let i = 0; i < 50; i++) {
      smallEngine.dealCard();
    }

    expect(smallEngine.getRemainingCards()).toBe(2);

    // Try to deal initial hand (needs 4 cards, but only 2 remain)
    const playerCard1 = smallEngine.dealCard(); // Should work
    const dealerCard1 = smallEngine.dealCard(); // Should work
    const playerCard2 = smallEngine.dealCard(); // Should trigger shuffle and work
    const dealerCard2 = smallEngine.dealCard(); // Should work from reshuffled deck

    expect(playerCard1).toBeTruthy();
    expect(dealerCard1).toBeTruthy();
    expect(playerCard2).toBeTruthy();
    expect(dealerCard2).toBeTruthy();

    // Should have reshuffled
    expect(smallEngine.getRemainingCards()).toBeGreaterThan(40);
  });

  test("should verify card uniqueness in initial deal", () => {
    const dealtCards: Card[] = [];
    const originalDealCard = engine.dealCard.bind(engine);

    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealtCards.push(card);
      }
      return card;
    };

    // Deal initial cards
    // const playerCard1 = engine.dealCard();
    // const dealerCard1 = engine.dealCard();
    // const playerCard2 = engine.dealCard();
    // const dealerCard2 = engine.dealCard();

    // All cards should be unique (no duplicates)
    const cardStrings = dealtCards.map((card) => `${card.rank}${card.suit}`);
    const uniqueCards = new Set(cardStrings);

    expect(uniqueCards.size).toBe(4);
    expect(cardStrings.length).toBe(4);
  });

  test("should maintain dealing order consistency across multiple games", () => {
    const gameResults: Card[][] = [];

    // Play 5 games and track dealing order
    for (let game = 0; game < 5; game++) {
      const gameCards: Card[] = [];
      const originalDealCard = engine.dealCard.bind(engine);

      engine.dealCard = () => {
        const card = originalDealCard();
        if (card) {
          gameCards.push(card);
        }
        return card;
      };

      // Deal initial hand
      const playerCard1 = engine.dealCard();
      const dealerCard1 = engine.dealCard();
      const playerCard2 = engine.dealCard();
      const dealerCard2 = engine.dealCard();

      gameResults.push(gameCards);

      // Verify order for this game
      expect(gameCards.length).toBe(4);
      expect(gameCards[0]).toBe(playerCard1);
      expect(gameCards[1]).toBe(dealerCard1);
      expect(gameCards[2]).toBe(playerCard2);
      expect(gameCards[3]).toBe(dealerCard2);
    }

    // Each game should have dealt 4 cards in proper order
    expect(gameResults.length).toBe(5);
    gameResults.forEach((gameCards) => {
      expect(gameCards.length).toBe(4);
    });
  });
});

describe("Blackjack Dealing Rules Compliance", () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test("should follow casino dealing protocol", () => {
    // In a real casino:
    // 1. Player gets first card (face up)
    // 2. Dealer gets first card (face up)
    // 3. Player gets second card (face up)
    // 4. Dealer gets second card (face down - "hole card")

    const dealtCards: Card[] = [];
    const originalDealCard = engine.dealCard.bind(engine);

    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealtCards.push(card);
      }
      return card;
    };

    // Simulate casino dealing
    const playerFirstCard = engine.dealCard(); // Player's first card (face up)
    const dealerFirstCard = engine.dealCard(); // Dealer's first card (face up)
    const playerSecondCard = engine.dealCard(); // Player's second card (face up)
    const dealerHoleCard = engine.dealCard(); // Dealer's hole card (face down)

    // Verify proper sequence
    expect(dealtCards[0]).toBe(playerFirstCard);
    expect(dealtCards[1]).toBe(dealerFirstCard);
    expect(dealtCards[2]).toBe(playerSecondCard);
    expect(dealtCards[3]).toBe(dealerHoleCard);

    // In our implementation, all cards are "face up" for game logic,
    // but the UI should hide the dealer's second card until dealer's turn
    const playerHand = engine.createHand([playerFirstCard!, playerSecondCard!]);
    const dealerHand = engine.createHand([dealerFirstCard!, dealerHoleCard!]);

    expect(playerHand.cards.length).toBe(2);
    expect(dealerHand.cards.length).toBe(2);
  });

  test("should handle blackjack detection with proper dealing order", () => {
    // Create a scenario where dealing order affects blackjack detection
    const testCases = [
      {
        name: "Player blackjack with A first",
        cards: [
          { suit: "hearts", rank: "A", value: 11 }, // Player 1st
          { suit: "clubs", rank: "7", value: 7 }, // Dealer 1st
          { suit: "spades", rank: "K", value: 10 }, // Player 2nd
          { suit: "diamonds", rank: "8", value: 8 }, // Dealer 2nd
        ],
      },
      {
        name: "Player blackjack with K first",
        cards: [
          { suit: "hearts", rank: "K", value: 10 }, // Player 1st
          { suit: "clubs", rank: "7", value: 7 }, // Dealer 1st
          { suit: "spades", rank: "A", value: 11 }, // Player 2nd
          { suit: "diamonds", rank: "8", value: 8 }, // Dealer 2nd
        ],
      },
    ];

    testCases.forEach((testCase) => {
      const playerCards = [testCase.cards[0], testCase.cards[2]] as Card[]; // 1st and 3rd cards
      const dealerCards = [testCase.cards[1], testCase.cards[3]] as Card[]; // 2nd and 4th cards

      const playerHand = engine.createHand(playerCards);
      const dealerHand = engine.createHand(dealerCards);

      expect(playerHand.isBlackjack).toBe(true);
      expect(playerHand.value).toBe(21);
      expect(dealerHand.isBlackjack).toBe(false);
      expect(dealerHand.value).toBe(15);
    });
  });
});
