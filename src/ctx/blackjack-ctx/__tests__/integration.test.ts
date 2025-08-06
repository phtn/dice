/**
 * Integration Tests for Blackjack Game Logic
 * These tests verify the complete game flow without React dependencies
 */

import { BlackjackEngine } from '../game-engine';
import { Card } from '../types';

describe('Blackjack Integration Tests', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should simulate a complete blackjack game - player wins', () => {
    // Simulate dealing initial cards
    const playerCards: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '9', value: 9 }
    ];
    const dealerCards: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '6', value: 6 }
    ];

    const playerHand = engine.createHand(playerCards);
    let dealerHand = engine.createHand(dealerCards);

    // Player stands with 19
    expect(playerHand.value).toBe(19);
    expect(playerHand.isBust).toBe(false);

    // Dealer must hit on 16
    expect(dealerHand.value).toBe(16);
    expect(engine.shouldDealerHit(dealerHand)).toBe(true);

    // Simulate dealer hitting and busting
    const dealerThirdCard: Card = { suit: 'hearts', rank: '8', value: 8 };
    dealerHand = engine.createHand([...dealerCards, dealerThirdCard]);

    expect(dealerHand.value).toBe(24);
    expect(dealerHand.isBust).toBe(true);
    expect(engine.shouldDealerHit(dealerHand)).toBe(false);

    // Determine winner
    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('player-wins');
  });

  test('should simulate a blackjack vs regular 21', () => {
    // Player gets blackjack
    const playerBlackjack: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: 'K', value: 10 }
    ];

    // Dealer gets 21 with 3 cards
    const dealer21: Card[] = [
      { suit: 'clubs', rank: '7', value: 7 },
      { suit: 'diamonds', rank: '7', value: 7 },
      { suit: 'hearts', rank: '7', value: 7 }
    ];

    const playerHand = engine.createHand(playerBlackjack);
    const dealerHand = engine.createHand(dealer21);

    expect(playerHand.isBlackjack).toBe(true);
    expect(dealerHand.isBlackjack).toBe(false);
    expect(dealerHand.value).toBe(21);

    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('player-blackjack');
  });

  test('should simulate a split scenario', () => {
    // Player gets pair of 8s
    const pairOf8s: Card[] = [
      { suit: 'hearts', rank: '8', value: 8 },
      { suit: 'spades', rank: '8', value: 8 }
    ];

    const initialHand = engine.createHand(pairOf8s);
    expect(engine.canSplit(initialHand)).toBe(true);

    // Split the hand
    const { hand1, hand2 } = engine.splitHand(initialHand);
    expect(hand1.value).toBe(8);
    expect(hand2.value).toBe(8);

    // Simulate dealing additional cards to each split hand
    const hand1Card: Card = { suit: 'clubs', rank: '10', value: 10 };
    const hand2Card: Card = { suit: 'diamonds', rank: '3', value: 3 };

    const finalHand1 = engine.createHand([...hand1.cards, hand1Card]);
    const finalHand2 = engine.createHand([...hand2.cards, hand2Card]);

    expect(finalHand1.value).toBe(18);
    expect(finalHand2.value).toBe(11);

    // Both hands should be playable
    expect(finalHand1.isBust).toBe(false);
    expect(finalHand2.isBust).toBe(false);
  });

  test('should simulate dealer soft 17 scenario', () => {
    // Dealer gets A-6 (soft 17)
    const dealerSoft17: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '6', value: 6 }
    ];

    let dealerHand = engine.createHand(dealerSoft17);
    expect(dealerHand.value).toBe(17);
    expect(dealerHand.isSoft).toBe(true);
    expect(engine.shouldDealerHit(dealerHand)).toBe(true);

    // Dealer hits and gets a 5
    const dealerThirdCard: Card = { suit: 'clubs', rank: '5', value: 5 };
    dealerHand = engine.createHand([...dealerSoft17, dealerThirdCard]);

    // Should now be A(1) + 6 + 5 = 12 (ace converted to 1)
    expect(dealerHand.value).toBe(12);
    expect(dealerHand.isSoft).toBe(false);
    expect(engine.shouldDealerHit(dealerHand)).toBe(true);
  });

  test('should simulate multiple aces scenario', () => {
    // Player gets A-A-9
    const multipleAces: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: 'A', value: 11 },
      { suit: 'clubs', rank: '9', value: 9 }
    ];

    const hand = engine.createHand(multipleAces);
    
    // Should be A(11) + A(1) + 9 = 21
    expect(hand.value).toBe(21);
    expect(hand.isSoft).toBe(true);
    expect(hand.isBlackjack).toBe(false); // Not blackjack because 3 cards
  });

  test('should simulate card counting scenario', () => {
    // Deal several cards and track them
    const dealtCards: Card[] = [];
    
    for (let i = 0; i < 20; i++) {
      const card = engine.dealCard();
      if (card) dealtCards.push(card);
    }

    expect(dealtCards.length).toBe(20);
    expect(engine.getUsedCards()).toBe(20);
    expect(engine.getRemainingCards()).toBe(32);

    // Check card counting accuracy
    const usedByRank = engine.getUsedCardsByRank();
    const remainingByRank = engine.getRemainingCardsByRank();

    // Count actual dealt cards by rank
    const actualCount: Record<string, number> = {};
    dealtCards.forEach(card => {
      actualCount[card.rank] = (actualCount[card.rank] || 0) + 1;
    });

    // Verify tracking matches reality
    Object.keys(actualCount).forEach(rank => {
      expect(usedByRank[rank]).toBe(actualCount[rank]);
      expect(remainingByRank[rank]).toBe(4 - actualCount[rank]);
    });
  });

  test('should simulate deck shuffle scenario', () => {
    // Deal most of the deck
    for (let i = 0; i < 40; i++) {
      engine.dealCard();
    }

    expect(engine.getRemainingCards()).toBe(12);
    expect(engine.getUsedCards()).toBe(40);

    // Next deal should trigger shuffle
    const beforeShuffle = engine.getRemainingCards();
    engine.dealCard();
    const afterShuffle = engine.getRemainingCards();

    // Should have more cards after shuffle
    expect(afterShuffle).toBeGreaterThan(beforeShuffle);
    expect(engine.getUsedCards()).toBeLessThan(40);
  });

  test('should simulate all possible game outcomes', () => {
    const testCases = [
      {
        name: 'Player Blackjack',
        player: [{ suit: 'hearts', rank: 'A', value: 11 }, { suit: 'spades', rank: 'K', value: 10 }],
        dealer: [{ suit: 'clubs', rank: '10', value: 10 }, { suit: 'diamonds', rank: '9', value: 9 }],
        expected: 'player-blackjack'
      },
      {
        name: 'Dealer Blackjack',
        player: [{ suit: 'hearts', rank: '10', value: 10 }, { suit: 'spades', rank: '9', value: 9 }],
        dealer: [{ suit: 'clubs', rank: 'A', value: 11 }, { suit: 'diamonds', rank: 'Q', value: 10 }],
        expected: 'dealer-blackjack'
      },
      {
        name: 'Push (both blackjack)',
        player: [{ suit: 'hearts', rank: 'A', value: 11 }, { suit: 'spades', rank: 'K', value: 10 }],
        dealer: [{ suit: 'clubs', rank: 'A', value: 11 }, { suit: 'diamonds', rank: 'Q', value: 10 }],
        expected: 'push'
      },
      {
        name: 'Player wins',
        player: [{ suit: 'hearts', rank: '10', value: 10 }, { suit: 'spades', rank: '9', value: 9 }],
        dealer: [{ suit: 'clubs', rank: '10', value: 10 }, { suit: 'diamonds', rank: '7', value: 7 }],
        expected: 'player-wins'
      },
      {
        name: 'Dealer wins',
        player: [{ suit: 'hearts', rank: '10', value: 10 }, { suit: 'spades', rank: '7', value: 7 }],
        dealer: [{ suit: 'clubs', rank: '10', value: 10 }, { suit: 'diamonds', rank: '9', value: 9 }],
        expected: 'dealer-wins'
      },
      {
        name: 'Push (equal values)',
        player: [{ suit: 'hearts', rank: '10', value: 10 }, { suit: 'spades', rank: '8', value: 8 }],
        dealer: [{ suit: 'clubs', rank: '9', value: 9 }, { suit: 'diamonds', rank: '9', value: 9 }],
        expected: 'push'
      }
    ];

    testCases.forEach(testCase => {
      const playerHand = engine.createHand(testCase.player);
      const dealerHand = engine.createHand(testCase.dealer);
      const result = engine.determineWinner(playerHand, dealerHand);
      
      expect(result).toBe(testCase.expected);
    });
  });
});

// Performance and stress tests
describe('Blackjack Performance Tests', () => {
  test('should handle many consecutive games efficiently', () => {
    const engine = new BlackjackEngine(6); // Use 6 decks for more cards
    const startTime = Date.now();
    
    // Simulate 1000 quick games
    for (let i = 0; i < 1000; i++) {
      const playerCards = [engine.dealCard(), engine.dealCard()].filter(Boolean);
      const dealerCards = [engine.dealCard(), engine.dealCard()].filter(Boolean);
      
      if (playerCards.length === 2 && dealerCards.length === 2) {
        const playerHand = engine.createHand(playerCards);
        const dealerHand = engine.createHand(dealerCards);
        engine.determineWinner(playerHand, dealerHand);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete 1000 games in reasonable time (less than 1 second)
    expect(duration).toBeLessThan(1000);
    expect(engine.getUsedCards()).toBeGreaterThan(0);
  });

  test('should maintain accuracy with large deck counts', () => {
    const engine = new BlackjackEngine(8); // 8 decks = 416 cards
    
    expect(engine.getTotalCards()).toBe(416);
    expect(engine.getRemainingCards()).toBe(416);
    
    // Deal 100 cards
    for (let i = 0; i < 100; i++) {
      engine.dealCard();
    }
    
    expect(engine.getUsedCards()).toBe(100);
    expect(engine.getRemainingCards()).toBe(316);
    
    // Verify card counting accuracy
    const usedByRank = engine.getUsedCardsByRank();
    const remainingByRank = engine.getRemainingCardsByRank();
    
    Object.keys(usedByRank).forEach(rank => {
      expect(usedByRank[rank] + remainingByRank[rank]).toBe(32); // 8 decks * 4 cards per rank
    });
  });
});