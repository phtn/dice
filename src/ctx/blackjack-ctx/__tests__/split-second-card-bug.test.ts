import { describe, it, expect, beforeEach } from 'bun:test';
import { BlackjackEngine } from '../game-engine';
import { PlayerHand, Hand } from '../types';

describe('Split Second Card Bug', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  it('should handle winner determination correctly when second split hand gets a card', () => {
    // Simulate the exact scenario where the bug occurs
    // Player splits, plays first hand, then gets second card on second hand
    
    // Initial split hands after dealing one card to each
    const splitHands: PlayerHand[] = [
      {
        id: '1-1',
        cards: [
          { suit: 'hearts' as const, rank: '8' as const, value: 8 },
          { suit: 'diamonds' as const, rank: '5' as const, value: 5 }
        ],
        value: 13,
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: false // First hand is done
      },
      {
        id: '1-2',
        cards: [
          { suit: 'spades' as const, rank: '8' as const, value: 8 },
          { suit: 'clubs' as const, rank: '3' as const, value: 3 }
        ],
        value: 11,
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: true // Second hand is active
      }
    ];

    // Player hits second hand and gets a 10
    const secondHandAfterHit = engine.createHand([
      ...splitHands[1].cards,
      { suit: 'hearts' as const, rank: '10' as const, value: 10 }
    ]);

    const finalHands: PlayerHand[] = [
      splitHands[0], // First hand unchanged
      {
        ...splitHands[1],
        ...secondHandAfterHit,
        isActive: false
      }
    ];

    // Dealer has 20
    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
        { suit: 'clubs' as const, rank: '10' as const, value: 10 }
      ],
      value: 20,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // Check winner determination for each hand
    const result1 = engine.determineWinner(finalHands[0], dealerHand); // 13 vs 20
    const result2 = engine.determineWinner(finalHands[1], dealerHand); // 21 vs 20

    expect(result1).toBe('dealer-wins'); // 13 should lose to 20
    expect(result2).toBe('player-wins'); // 21 should beat 20

    console.log('First hand (13 vs 20):', result1);
    console.log('Second hand (21 vs 20):', result2);
  });

  it('should test the exact scenario that might cause the bug', () => {
    // Test a scenario where the second split hand gets exactly 21
    // and there might be a timing issue with winner determination
    
    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
        { suit: 'clubs' as const, rank: '9' as const, value: 9 }
      ],
      value: 19,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // First split hand - player stood with 18
    const hand1: PlayerHand = {
      id: '1-1',
      cards: [
        { suit: 'hearts' as const, rank: '9' as const, value: 9 },
        { suit: 'diamonds' as const, rank: '9' as const, value: 9 }
      ],
      value: 18,
      betAmount: 100,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
      isActive: false
    };

    // Second split hand - player hit and got 21
    const hand2: PlayerHand = {
      id: '1-2',
      cards: [
        { suit: 'spades' as const, rank: '9' as const, value: 9 },
        { suit: 'clubs' as const, rank: '3' as const, value: 3 },
        { suit: 'hearts' as const, rank: '9' as const, value: 9 }
      ],
      value: 21,
      betAmount: 100,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
      isActive: false
    };

    // Test winner determination
    const result1 = engine.determineWinner(hand1, dealerHand); // 18 vs 19
    const result2 = engine.determineWinner(hand2, dealerHand); // 21 vs 19

    expect(result1).toBe('dealer-wins'); // 18 should lose to 19
    expect(result2).toBe('player-wins'); // 21 should beat 19

    console.log('Hand 1 (18 vs 19):', result1);
    console.log('Hand 2 (21 vs 19):', result2);

    // Test overall game result logic
    let playerWins = 0;
    let dealerWins = 0;
    
    if (result1 === 'player-wins') playerWins++;
    if (result1 === 'dealer-wins') dealerWins++;
    if (result2 === 'player-wins') playerWins++;
    if (result2 === 'dealer-wins') dealerWins++;

    // Overall result should be mixed (1 win, 1 loss)
    expect(playerWins).toBe(1);
    expect(dealerWins).toBe(1);

    console.log('Player wins:', playerWins, 'Dealer wins:', dealerWins);
  });
});