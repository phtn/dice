import { describe, it, expect, beforeEach } from 'bun:test';
import { BlackjackEngine } from '../game-engine';
import { PlayerHand, Hand, GameResult } from '../types';

describe('Split State Timing Issues', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  it('should correctly process game end with updated split hands', () => {
    // Simulate the exact state that would exist when processGameEnd is called
    // after the second split hand gets a card
    
    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
        { suit: 'clubs' as const, rank: '8' as const, value: 8 }
      ],
      value: 18,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // This represents the final state of split hands after all actions
    const finalSplitHands: PlayerHand[] = [
      {
        id: '1-1',
        cards: [
          { suit: 'hearts' as const, rank: '9' as const, value: 9 },
          { suit: 'diamonds' as const, rank: '7' as const, value: 7 }
        ],
        value: 16,
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: false,
        result: undefined // Will be set by processGameEnd
      },
      {
        id: '1-2',
        cards: [
          { suit: 'spades' as const, rank: '9' as const, value: 9 },
          { suit: 'clubs' as const, rank: '2' as const, value: 2 },
          { suit: 'hearts' as const, rank: '8' as const, value: 8 }
        ],
        value: 19,
        betAmount: 100,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: false,
        result: undefined // Will be set by processGameEnd
      }
    ];

    // Simulate what processGameEnd should do
    let totalWinAmount = 0;
    let playerWins = 0;
    let dealerWins = 0;

    const updatedHands = finalSplitHands.map(hand => {
      let result: GameResult;
      let winAmount = 0;

      if (hand.isBust) {
        result = 'dealer-wins';
        winAmount = 0;
        dealerWins++;
      } else {
        result = engine.determineWinner(hand, dealerHand);
        
        switch (result) {
          case 'player-wins':
            winAmount = hand.betAmount + hand.betAmount;
            playerWins++;
            break;
          case 'push':
            winAmount = hand.betAmount;
            break;
          case 'dealer-wins':
            winAmount = 0;
            dealerWins++;
            break;
          default:
            winAmount = 0;
            break;
        }
      }

      totalWinAmount += winAmount;

      return {
        ...hand,
        result
      };
    });

    // Verify results
    expect(updatedHands[0].result).toBe('dealer-wins'); // 16 vs 18
    expect(updatedHands[1].result).toBe('player-wins'); // 19 vs 18

    // Verify overall game logic
    expect(playerWins).toBe(1);
    expect(dealerWins).toBe(1);
    expect(totalWinAmount).toBe(100); // Lost 100 on first hand, won 200 on second hand

    console.log('Hand 1 result (16 vs 18):', updatedHands[0].result);
    console.log('Hand 2 result (19 vs 18):', updatedHands[1].result);
    console.log('Total win amount:', totalWinAmount);
  });

  it('should handle the critical timing scenario', () => {
    // This test simulates the exact moment when the bug might occur:
    // - Second split hand just got its final card
    // - processGameEnd is called immediately
    // - We need to ensure it uses the correct hand values
    
    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds' as const, rank: 'K' as const, value: 10 },
        { suit: 'clubs' as const, rank: '9' as const, value: 9 }
      ],
      value: 19,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    // First split hand - already completed
    const firstHand: PlayerHand = {
      id: '1-1',
      cards: [
        { suit: 'hearts' as const, rank: '8' as const, value: 8 },
        { suit: 'diamonds' as const, rank: '10' as const, value: 10 }
      ],
      value: 18,
      betAmount: 50,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
      isActive: false
    };

    // Second split hand - just got its final card (this is the critical moment)
    const secondHandBeforeCard: PlayerHand = {
      id: '1-2',
      cards: [
        { suit: 'spades' as const, rank: '8' as const, value: 8 },
        { suit: 'clubs' as const, rank: '5' as const, value: 5 }
      ],
      value: 13,
      betAmount: 50,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
      isActive: true
    };

    // Player hits and gets an 8 (total 21)
    const finalCard = { suit: 'hearts' as const, rank: '8' as const, value: 8 };
    const secondHandAfterCard = engine.createHand([...secondHandBeforeCard.cards, finalCard]);

    const secondHandFinal: PlayerHand = {
      ...secondHandBeforeCard,
      ...secondHandAfterCard,
      isActive: false
    };

    // This is the state that should be used in processGameEnd
    const finalHands = [firstHand, secondHandFinal];

    // Test winner determination
    const result1 = engine.determineWinner(finalHands[0], dealerHand); // 18 vs 19
    const result2 = engine.determineWinner(finalHands[1], dealerHand); // 21 vs 19

    expect(result1).toBe('dealer-wins'); // 18 should lose to 19
    expect(result2).toBe('player-wins'); // 21 should beat 19

    console.log('Critical timing test:');
    console.log('First hand (18 vs 19):', result1);
    console.log('Second hand (21 vs 19):', result2);

    // The bug would manifest as the second hand showing the wrong result
    // because processGameEnd might use the old hand value (13) instead of new (21)
  });
});