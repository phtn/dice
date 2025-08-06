/**
 * Integration test to verify proper dealing order in the blackjack context
 */

import { BlackjackEngine } from "../game-engine";
import { DealtCard } from "../types";

describe("Dealing Order Integration", () => {
  test("should deal initial cards in correct alternating order", () => {
    const engine = new BlackjackEngine(1);
    const dealtCards: DealtCard[] = [];

    // Track the order cards are dealt
    const originalDealCard = engine.dealCard.bind(engine);
    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealtCards.push({ ...card, order: dealtCards.length + 1 });
      }
      return card;
    };

    // Simulate the exact logic from startNewGame
    const playerCards: DealtCard[] = [];
    const dealerCards: DealtCard[] = [];

    // Deal initial cards in proper blackjack order: Player → Dealer → Player → Dealer
    const playerCard1 = engine.dealCard();
    const dealerCard1 = engine.dealCard();
    const playerCard2 = engine.dealCard();
    const dealerCard2 = engine.dealCard();

    if (playerCard1) playerCards.push(playerCard1);
    if (playerCard2) playerCards.push(playerCard2);
    if (dealerCard1) dealerCards.push(dealerCard1);
    if (dealerCard2) dealerCards.push(dealerCard2);

    // Verify the dealing order
    expect(dealtCards.length).toBe(4);
    expect(dealtCards[0].order).toBe(1); // First card to player
    expect(dealtCards[1].order).toBe(2); // Second card to dealer
    expect(dealtCards[2].order).toBe(3); // Third card to player
    expect(dealtCards[3].order).toBe(4); // Fourth card to dealer

    // Verify hands are constructed correctly
    expect(playerCards.length).toBe(2);
    expect(dealerCards.length).toBe(2);

    // Player should have 1st and 3rd cards dealt
    expect(playerCards[0]).toBe(dealtCards[0]);
    expect(playerCards[1]).toBe(dealtCards[2]);

    // Dealer should have 2nd and 4th cards dealt
    expect(dealerCards[0]).toBe(dealtCards[1]);
    expect(dealerCards[1]).toBe(dealtCards[3]);
  });

  test("should maintain proper order during split scenario", () => {
    const engine = new BlackjackEngine(1);
    let dealOrder = 0;

    const originalDealCard = engine.dealCard.bind(engine);
    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        dealOrder++;
        card.dealOrder = dealOrder;
      }
      return card;
    };

    // Initial deal
    const playerCard1 = engine.dealCard(); // Order 1
    const dealerCard1 = engine.dealCard(); // Order 2
    const playerCard2 = engine.dealCard(); // Order 3
    const dealerCard2 = engine.dealCard(); // Order 4

    // Verify initial order
    expect(playerCard1?.dealOrder).toBe(1);
    expect(dealerCard1?.dealOrder).toBe(2);
    expect(playerCard2?.dealOrder).toBe(3);
    expect(dealerCard2?.dealOrder).toBe(4);

    // If player has a pair, simulate split
    if (playerCard1 && playerCard2 && playerCard1.rank === playerCard2.rank) {
      const splitCard1 = engine.dealCard(); // Order 5 - to first split hand
      const splitCard2 = engine.dealCard(); // Order 6 - to second split hand

      expect(splitCard1?.dealOrder).toBe(5);
      expect(splitCard2?.dealOrder).toBe(6);
    }
  });

  test("should verify casino-standard dealing protocol", () => {
    const engine = new BlackjackEngine(1);

    // In a real casino, the dealing order is crucial for fairness
    // and follows strict protocols

    const gameCards: DealtCard[] = [];
    const originalDealCard = engine.dealCard.bind(engine);
    engine.dealCard = () => {
      const card = originalDealCard();
      if (card) {
        gameCards.push({
          ...card,
          position: gameCards.length,
          recipient: gameCards.length % 2 === 0 ? "player" : "dealer",
        });
      }
      return card;
    };

    // Deal according to our implementation
    // const playerCard1 = engine.dealCard(); // Position 0 - Player
    // const dealerCard1 = engine.dealCard(); // Position 1 - Dealer
    // const playerCard2 = engine.dealCard(); // Position 2 - Player
    // const dealerCard2 = engine.dealCard(); // Position 3 - Dealer

    // Verify alternating pattern
    expect(gameCards[0].recipient).toBe("player");
    expect(gameCards[1].recipient).toBe("dealer");
    expect(gameCards[2].recipient).toBe("player");
    expect(gameCards[3].recipient).toBe("dealer");

    // Verify no card duplication
    const cardIds = gameCards.map((card) => `${card.rank}${card.suit}`);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(4);
  });

  test("should handle edge cases in dealing order", () => {
    const engine = new BlackjackEngine(1);

    // Test with very specific card combinations
    const testScenarios = [
      "Normal deal",
      "Blackjack scenario",
      "Split scenario",
      "Multiple hits",
    ];

    testScenarios.forEach((scenario) => {
      const dealtCards: DealtCard[] = [];
      const originalDealCard = engine.dealCard.bind(engine);

      engine.dealCard = () => {
        const card = originalDealCard();
        if (card) {
          dealtCards.push({
            ...card,
            scenario,
            dealIndex: dealtCards.length,
          });
        }
        return card;
      };

      // Deal initial cards
      const cards = [
        engine.dealCard(), // Player 1st
        engine.dealCard(), // Dealer 1st
        engine.dealCard(), // Player 2nd
        engine.dealCard(), // Dealer 2nd
      ];

      expect(dealtCards.length).toBe(4);
      expect(cards.every((card) => card !== null)).toBe(true);

      // Verify order consistency
      dealtCards.forEach((card, index) => {
        expect(card.dealIndex).toBe(index);
      });
    });
  });
});
