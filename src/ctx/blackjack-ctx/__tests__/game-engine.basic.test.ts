/**
 * Basic Game Engine Tests
 * These tests focus on the core game logic without React dependencies
 */

import { BlackjackEngine } from '../game-engine';
import { Card } from '../types';

describe('BlackjackEngine - Basic Tests', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should initialize with 52 cards', () => {
    expect(engine.getTotalCards()).toBe(52);
    expect(engine.getRemainingCards()).toBe(52);
    expect(engine.getUsedCards()).toBe(0);
  });

  test('should deal cards correctly', () => {
    const card = engine.dealCard();
    expect(card).toBeTruthy();
    expect(card?.suit).toMatch(/^(hearts|diamonds|clubs|spades)$/);
    expect(card?.rank).toMatch(/^(A|2|3|4|5|6|7|8|9|10|J|Q|K)$/);
    expect(engine.getRemainingCards()).toBe(51);
    expect(engine.getUsedCards()).toBe(1);
  });

  test('should calculate hand values correctly', () => {
    // Simple hand: 7 + 5 = 12
    const cards: Card[] = [
      { suit: 'hearts', rank: '7', value: 7 },
      { suit: 'spades', rank: '5', value: 5 }
    ];
    
    const hand = engine.createHand(cards);
    expect(hand.value).toBe(12);
    expect(hand.isSoft).toBe(false);
    expect(hand.isBlackjack).toBe(false);
    expect(hand.isBust).toBe(false);
  });

  test('should handle aces correctly', () => {
    // Ace + 9 = 20 (soft)
    const softHand: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '9', value: 9 }
    ];
    
    const hand = engine.createHand(softHand);
    expect(hand.value).toBe(20);
    expect(hand.isSoft).toBe(true);
    expect(hand.isBlackjack).toBe(false);
  });

  test('should detect blackjack', () => {
    const blackjackHand: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: 'K', value: 10 }
    ];
    
    const hand = engine.createHand(blackjackHand);
    expect(hand.value).toBe(21);
    expect(hand.isBlackjack).toBe(true);
    expect(hand.isSoft).toBe(true);
  });

  test('should detect bust', () => {
    const bustHand: Card[] = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];
    
    const hand = engine.createHand(bustHand);
    expect(hand.value).toBe(25);
    expect(hand.isBust).toBe(true);
  });

  test('should handle dealer hitting rules', () => {
    // Dealer should hit on 16
    const hit16: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '6', value: 6 }
    ];
    const hand16 = engine.createHand(hit16);
    expect(engine.shouldDealerHit(hand16)).toBe(true);

    // Dealer should stand on hard 17
    const stand17: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '7', value: 7 }
    ];
    const hand17 = engine.createHand(stand17);
    expect(engine.shouldDealerHit(hand17)).toBe(false);

    // Dealer should hit on soft 17
    const hitSoft17: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '6', value: 6 }
    ];
    const handSoft17 = engine.createHand(hitSoft17);
    expect(handSoft17.isSoft).toBe(true);
    expect(engine.shouldDealerHit(handSoft17)).toBe(true);
  });

  test('should determine winners correctly', () => {
    // Player blackjack vs dealer 20
    const playerBJ: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: 'K', value: 10 }
    ];
    const dealer20: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '10', value: 10 }
    ];
    
    const playerHand = engine.createHand(playerBJ);
    const dealerHand = engine.createHand(dealer20);
    
    expect(engine.determineWinner(playerHand, dealerHand)).toBe('player-blackjack');
  });

  test('should handle splitting', () => {
    // Pair of 8s can be split
    const pair8s: Card[] = [
      { suit: 'hearts', rank: '8', value: 8 },
      { suit: 'spades', rank: '8', value: 8 }
    ];
    
    const hand = engine.createHand(pair8s);
    expect(engine.canSplit(hand)).toBe(true);
    
    const { hand1, hand2 } = engine.splitHand(hand);
    expect(hand1.cards.length).toBe(1);
    expect(hand2.cards.length).toBe(1);
    expect(hand1.cards[0].rank).toBe('8');
    expect(hand2.cards[0].rank).toBe('8');
  });

  test('should format card display correctly', () => {
    const aceHearts: Card = { suit: 'hearts', rank: 'A', value: 11 };
    const kingSpades: Card = { suit: 'spades', rank: 'K', value: 10 };
    const ten: Card = { suit: 'diamonds', rank: '10', value: 10 };
    
    expect(engine.getCardDisplay(aceHearts)).toBe('A♥');
    expect(engine.getCardDisplay(kingSpades)).toBe('K♠');
    expect(engine.getCardDisplay(ten)).toBe('10♦');
  });

  test('should handle multiple decks', () => {
    const sixDeckEngine = new BlackjackEngine(6);
    expect(sixDeckEngine.getTotalCards()).toBe(312); // 6 * 52
    expect(sixDeckEngine.getDeckCount()).toBe(6);
    
    // Should have 24 aces total (6 decks * 4 aces each)
    const remainingByRank = sixDeckEngine.getRemainingCardsByRank();
    expect(remainingByRank['A']).toBe(24);
  });

  test('should track used cards by rank', () => {
    // Deal some cards and check tracking
    const dealtCards = [];
    for (let i = 0; i < 10; i++) {
      const card = engine.dealCard();
      if (card) dealtCards.push(card);
    }
    
    const usedByRank = engine.getUsedCardsByRank();
    const remainingByRank = engine.getRemainingCardsByRank();
    
    // Total used cards should be 10
    const totalUsed = Object.values(usedByRank).reduce((sum, count) => sum + count, 0);
    expect(totalUsed).toBe(10);
    
    // For each rank, used + remaining should equal 4 (single deck)
    Object.keys(usedByRank).forEach(rank => {
      expect(usedByRank[rank] + remainingByRank[rank]).toBe(4);
    });
  });

  test('should shuffle when deck is low', () => {
    // Deal most cards (40 out of 52, leaving 12)
    for (let i = 0; i < 40; i++) {
      engine.dealCard();
    }
    
    expect(engine.getRemainingCards()).toBe(12);
    expect(engine.getUsedCards()).toBe(40);
    
    // Next deal should trigger shuffle (when remaining < 25% of total)
    const cardBeforeShuffle = engine.getRemainingCards();
    engine.dealCard();
    
    // After shuffle, should have more cards available
    expect(engine.getRemainingCards()).toBeGreaterThan(cardBeforeShuffle);
  });
});

// Test edge cases
describe('BlackjackEngine - Edge Cases', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should handle multiple aces correctly', () => {
    // A + A + 9 should be 21 (one ace as 11, one as 1)
    const multipleAces: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: 'A', value: 11 },
      { suit: 'clubs', rank: '9', value: 9 }
    ];
    
    const hand = engine.createHand(multipleAces);
    expect(hand.value).toBe(21);
    expect(hand.isSoft).toBe(true);
  });

  test('should handle ace conversion from soft to hard', () => {
    // A + 6 + 5 should convert ace from 11 to 1 (total 12, not 22)
    const aceConversion: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '6', value: 6 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];
    
    const hand = engine.createHand(aceConversion);
    expect(hand.value).toBe(12); // A=1, 6, 5
    expect(hand.isSoft).toBe(false);
    expect(hand.isBust).toBe(false);
  });

  test('should not allow splitting non-pairs', () => {
    const nonPair: Card[] = [
      { suit: 'hearts', rank: '8', value: 8 },
      { suit: 'spades', rank: '7', value: 7 }
    ];
    
    const hand = engine.createHand(nonPair);
    expect(engine.canSplit(hand)).toBe(false);
    expect(() => engine.splitHand(hand)).toThrow('Cannot split this hand');
  });

  test('should handle all possible winner scenarios', () => {
    // Both blackjack = push
    const bj1: Card[] = [{ suit: 'hearts', rank: 'A', value: 11 }, { suit: 'spades', rank: 'K', value: 10 }];
    const bj2: Card[] = [{ suit: 'clubs', rank: 'A', value: 11 }, { suit: 'diamonds', rank: 'Q', value: 10 }];
    expect(engine.determineWinner(engine.createHand(bj1), engine.createHand(bj2))).toBe('push');

    // Player bust = dealer wins
    const bust: Card[] = [{ suit: 'hearts', rank: 'K', value: 10 }, { suit: 'spades', rank: 'Q', value: 10 }, { suit: 'clubs', rank: '5', value: 5 }];
    const normal: Card[] = [{ suit: 'diamonds', rank: '10', value: 10 }, { suit: 'hearts', rank: '7', value: 7 }];
    expect(engine.determineWinner(engine.createHand(bust), engine.createHand(normal))).toBe('dealer-wins');

    // Equal values = push
    const eighteen1: Card[] = [{ suit: 'hearts', rank: '10', value: 10 }, { suit: 'spades', rank: '8', value: 8 }];
    const eighteen2: Card[] = [{ suit: 'clubs', rank: '9', value: 9 }, { suit: 'diamonds', rank: '9', value: 9 }];
    expect(engine.determineWinner(engine.createHand(eighteen1), engine.createHand(eighteen2))).toBe('push');
  });
});