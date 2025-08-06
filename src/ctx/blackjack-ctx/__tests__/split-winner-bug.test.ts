import { describe, it, expect, beforeEach } from 'bun:test';
import { BlackjackEngine } from '../game-engine';
import { PlayerHand, Hand } from '../types';

describe('Split Winner Bug Investigation', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  it('should correctly determine winners for split hands scenario', () => {
    // Create a scenario where player splits and second hand might have winner determination issues
    
    // Player splits 8s
    const originalHand: PlayerHand = {
      id: '1',
      cards: [
        { suit: 'hearts' as const, rank: '8' as const, value: 8 },
        { suit: 'spades' as const, rank: '8' as const, value: 8 }
      ],
      value: 16,
      betAmount: 100,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
      isActive: true
    };

    // Split the hand
    const { hand1, hand2 } = engine.splitHand(originalHand);

    // First split hand gets a 3 (total 11)
    const splitHand1Cards = [...hand1.cards, { suit: 'diamonds' as const, rank: '3' as const, value: 3 }];

    // Second split hand gets a 10 (total 18)
    const splitHand2Cards = [...hand2.cards, { suit: 'clubs' as const, rank: '10' as const, value: 10 }];
    const splitHand2 = engine.createHand(splitHand2Cards);

    // Player hits first hand and gets another 8 (total 19)
    const finalHand1Cards = [...splitHand1Cards, { suit: 'hearts' as const, rank: '8' as const, value: 8 }];
    const finalHand1 = engine.createHand(finalHand1Cards);

    // Player stands on second hand (18)
    const finalHand2 = splitHand2;

    // Create final player hands
    const playerHands: PlayerHand[] = [
      {
        id: '1-1',
        ...finalHand1,
        betAmount: 100,
        isActive: false
      },
      {
        id: '1-2', 
        ...finalHand2,
        betAmount: 100,
        isActive: false
      }
    ];

    // Dealer has 17
    const dealerHand: Hand = {
      cards: [
        { suit: 'spades' as const, rank: '10' as const, value: 10 },
        { suit: 'diamonds' as const, rank: '7' as const, value: 7 }
      ],
      value: 17,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // Determine winners for each hand
    const result1 = engine.determineWinner(playerHands[0], dealerHand);
    const result2 = engine.determineWinner(playerHands[1], dealerHand);

    // First hand (19) should beat dealer (17)
    expect(result1).toBe('player-wins');
    
    // Second hand (18) should beat dealer (17)
    expect(result2).toBe('player-wins');

    console.log('Hand 1 (19 vs 17):', result1);
    console.log('Hand 2 (18 vs 17):', result2);
  });

  it('should test split hand with bust scenario', () => {
    // Test scenario where one split hand busts and other doesn't
    
    const playerHands: PlayerHand[] = [
      {
        id: '1-1',
        cards: [
          { suit: 'hearts' as const, rank: '8' as const, value: 8 },
          { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
          { suit: 'clubs' as const, rank: '5' as const, value: 5 }
        ],
        value: 23,
        betAmount: 100,
        isBlackjack: false,
        isBust: true,
        isSoft: false,
        isActive: false
      },
      {
        id: '1-2',
        cards: [
          { suit: 'spades' as const, rank: '8' as const, value: 8 },
          { suit: 'hearts' as const, rank: '10' as const, value: 10 }
        ],
        value: 18,
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: false
      }
    ];

    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
        { suit: 'clubs' as const, rank: '7' as const, value: 7 }
      ],
      value: 17,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // First hand busted - should be dealer wins
    const result1 = engine.determineWinner(playerHands[0], dealerHand);
    expect(result1).toBe('dealer-wins');

    // Second hand (18) should beat dealer (17)
    const result2 = engine.determineWinner(playerHands[1], dealerHand);
    expect(result2).toBe('player-wins');

    console.log('Bust hand result:', result1);
    console.log('Good hand result:', result2);
  });

  it('should test edge case with 21 on split hand', () => {
    // Test when split hand gets exactly 21
    
    const playerHands: PlayerHand[] = [
      {
        id: '1-1',
        cards: [
          { suit: 'hearts' as const, rank: 'A' as const, value: 11 },
          { suit: 'diamonds' as const, rank: '10' as const, value: 10 }
        ],
        value: 21,
        betAmount: 100,
        isBlackjack: false, // Not blackjack because it's from a split
        isBust: false,
        isSoft: true,
        isActive: false
      },
      {
        id: '1-2',
        cards: [
          { suit: 'spades' as const, rank: 'A' as const, value: 11 },
          { suit: 'clubs' as const, rank: '9' as const, value: 9 }
        ],
        value: 20,
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: true,
        isActive: false
      }
    ];

    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds' as const, rank: 'K' as const, value: 10 },
        { suit: 'hearts' as const, rank: 'Q' as const, value: 10 }
      ],
      value: 20,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // First hand (21) should beat dealer (20)
    const result1 = engine.determineWinner(playerHands[0], dealerHand);
    expect(result1).toBe('player-wins');

    // Second hand (20) should push with dealer (20)
    const result2 = engine.determineWinner(playerHands[1], dealerHand);
    expect(result2).toBe('push');

    console.log('21 vs 20 result:', result1);
    console.log('20 vs 20 result:', result2);
  });
});