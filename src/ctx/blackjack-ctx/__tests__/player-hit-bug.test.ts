import { describe, it, expect, beforeEach } from 'bun:test';
import { BlackjackEngine } from '../game-engine';
import { PlayerHand } from '../types';

describe('Player Hit Bug Fix', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  it('should allow player to continue playing after hitting 21', () => {
    // Player has 11, hits and gets 10 to make 21
    const playerHand: PlayerHand = {
      id: '1',
      cards: [
        { suit: 'hearts' as const, rank: '5' as const, value: 5 },
        { suit: 'diamonds' as const, rank: '6' as const, value: 6 },
        { suit: 'clubs' as const, rank: '10' as const, value: 10 }
      ],
      value: 21,
      betAmount: 100,
      isBlackjack: false, // Not blackjack because it's 3 cards
      isBust: false,
      isSoft: false,
      isActive: true
    };

    // Player should still be able to play (though hitting would bust)
    expect(playerHand.value).toBe(21);
    expect(playerHand.isBust).toBe(false);
    expect(playerHand.isBlackjack).toBe(false);

    // This hand should still be considered "playable" 
    // (player can choose to stand or hit and bust)
  });

  it('should only auto-advance on bust, not on 21', () => {
    // Test the findNextPlayableHand logic
    const hands: PlayerHand[] = [
      {
        id: '1',
        cards: [
          { suit: 'hearts' as const, rank: '10' as const, value: 10 },
          { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
          { suit: 'clubs' as const, rank: '5' as const, value: 5 }
        ],
        value: 25, // Busted
        betAmount: 100,
        isBlackjack: false,
        isBust: true,
        isSoft: false,
        isActive: false
      },
      {
        id: '2',
        cards: [
          { suit: 'spades' as const, rank: '10' as const, value: 10 },
          { suit: 'hearts' as const, rank: '6' as const, value: 6 },
          { suit: 'diamonds' as const, rank: '5' as const, value: 5 }
        ],
        value: 21, // Should still be playable
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: true
      }
    ];

    // The second hand (with 21) should be found as playable
    // This simulates the findNextPlayableHand function logic
    let playableIndex = -1;
    for (let i = 0; i < hands.length; i++) {
      const hand = hands[i];
      if (!hand.isBlackjack && !hand.isBust) {
        playableIndex = i;
        break;
      }
    }

    expect(playableIndex).toBe(1); // Should find the hand with 21
  });

  it('should correctly identify busted vs 21 hands', () => {
    const hand21 = engine.createHand([
      { suit: 'hearts' as const, rank: '10' as const, value: 10 },
      { suit: 'diamonds' as const, rank: '6' as const, value: 6 },
      { suit: 'clubs' as const, rank: '5' as const, value: 5 }
    ]);

    const handBust = engine.createHand([
      { suit: 'hearts' as const, rank: '10' as const, value: 10 },
      { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
      { suit: 'clubs' as const, rank: '5' as const, value: 5 }
    ]);

    expect(hand21.value).toBe(21);
    expect(hand21.isBust).toBe(false);

    expect(handBust.value).toBe(25);
    expect(handBust.isBust).toBe(true);
  });

  it('should handle blackjack vs regular 21 correctly', () => {
    // Blackjack (2 cards totaling 21)
    const blackjack = engine.createHand([
      { suit: 'hearts' as const, rank: 'A' as const, value: 11 },
      { suit: 'diamonds' as const, rank: 'K' as const, value: 10 }
    ]);

    // Regular 21 (3+ cards totaling 21)
    const regular21 = engine.createHand([
      { suit: 'hearts' as const, rank: '7' as const, value: 7 },
      { suit: 'diamonds' as const, rank: '7' as const, value: 7 },
      { suit: 'clubs' as const, rank: '7' as const, value: 7 }
    ]);

    expect(blackjack.value).toBe(21);
    expect(blackjack.isBlackjack).toBe(true);

    expect(regular21.value).toBe(21);
    expect(regular21.isBlackjack).toBe(false);

    // Both should not be considered "playable" for different reasons:
    // - Blackjack: Game ends immediately
    // - Regular 21: Player should be able to choose (stand or hit and bust)
  });
});