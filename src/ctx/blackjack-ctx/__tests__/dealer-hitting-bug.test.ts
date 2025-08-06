import { describe, it, expect, beforeEach } from 'bun:test';
import { BlackjackEngine } from '../game-engine';
import { Hand } from '../types';

describe('Dealer Hitting Logic Bug', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  it('should stop dealer at 17 even if player has higher value', () => {
    // Player has 20
    const playerHand: Hand = {
      cards: [
        { suit: 'hearts', rank: 'K', value: 10 },
        { suit: 'spades', rank: '10', value: 10 }
      ],
      value: 20,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // Dealer has 17 (should stop here)
    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '7', value: 7 }
      ],
      value: 17,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // Dealer should NOT hit with 17, even though player has 20
    expect(engine.shouldDealerHit(dealerHand)).toBe(false);
    
    // Player should win this scenario
    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('player-wins');
  });

  it('should stop dealer at 18 even if player has higher value', () => {
    // Player has 21
    const playerHand: Hand = {
      cards: [
        { suit: 'hearts', rank: 'K', value: 10 },
        { suit: 'spades', rank: 'A', value: 11 }
      ],
      value: 21,
      isBlackjack: true,
      isBust: false,
      isSoft: true
    };

    // Dealer has 18 (should stop here)
    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '8', value: 8 }
      ],
      value: 18,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // Dealer should NOT hit with 18, even though player has blackjack
    expect(engine.shouldDealerHit(dealerHand)).toBe(false);
    
    // Player should win this scenario (blackjack beats 18)
    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('player-blackjack');
  });

  it('should continue hitting dealer until 17', () => {
    // Dealer has 16 (should hit)
    const dealerHand16: Hand = {
      cards: [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '6', value: 6 }
      ],
      value: 16,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    expect(engine.shouldDealerHit(dealerHand16)).toBe(true);

    // Dealer has 15 (should hit)
    const dealerHand15: Hand = {
      cards: [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '5', value: 5 }
      ],
      value: 15,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    expect(engine.shouldDealerHit(dealerHand15)).toBe(true);
  });

  it('should hit on soft 17 but stand on hard 17', () => {
    // Soft 17 (A,6) - should hit
    const softSeventeen: Hand = {
      cards: [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'clubs', rank: '6', value: 6 }
      ],
      value: 17,
      isBlackjack: false,
      isBust: false,
      isSoft: true
    };

    expect(engine.shouldDealerHit(softSeventeen)).toBe(true);

    // Hard 17 (10,7) - should stand
    const hardSeventeen: Hand = {
      cards: [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '7', value: 7 }
      ],
      value: 17,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    expect(engine.shouldDealerHit(hardSeventeen)).toBe(false);
  });

  it('should never hit on 18 or higher', () => {
    const values = [18, 19, 20, 21];
    
    values.forEach(value => {
      const dealerHand: Hand = {
        cards: [
          { suit: 'diamonds', rank: '10', value: 10 },
          { suit: 'clubs', rank: (value - 10).toString() as '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A', value: value - 10 }
        ],
        value,
        isBlackjack: false,
        isBust: false,
        isSoft: false
      };

      expect(engine.shouldDealerHit(dealerHand)).toBe(false);
    });
  });
});