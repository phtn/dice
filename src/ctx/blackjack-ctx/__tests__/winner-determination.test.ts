/**
 * Tests for winner determination logic
 * Testing the specific scenario: Player 17 vs Dealer 21
 */

import { BlackjackEngine } from '../game-engine';
import { Card } from '../types';

describe('Winner Determination Tests', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should correctly determine dealer wins when dealer has higher value', () => {
    // Player stands at 17
    const playerCards: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '7', value: 7 }
    ];

    // Dealer gets 21
    const dealerCards: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '6', value: 6 },
      { suit: 'hearts', rank: '5', value: 5 }
    ];

    const playerHand = engine.createHand(playerCards);
    const dealerHand = engine.createHand(dealerCards);

    expect(playerHand.value).toBe(17);
    expect(playerHand.isBust).toBe(false);
    expect(playerHand.isBlackjack).toBe(false);

    expect(dealerHand.value).toBe(21);
    expect(dealerHand.isBust).toBe(false);
    expect(dealerHand.isBlackjack).toBe(false); // Not blackjack because 3 cards

    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('dealer-wins');
  });

  test('should handle various dealer vs player scenarios', () => {
    const testCases = [
      {
        name: 'Player 17 vs Dealer 21',
        playerCards: [
          { suit: 'hearts', rank: '10', value: 10 },
          { suit: 'spades', rank: '7', value: 7 }
        ],
        dealerCards: [
          { suit: 'clubs', rank: '10', value: 10 },
          { suit: 'diamonds', rank: '6', value: 6 },
          { suit: 'hearts', rank: '5', value: 5 }
        ],
        expected: 'dealer-wins'
      },
      {
        name: 'Player 20 vs Dealer 19',
        playerCards: [
          { suit: 'hearts', rank: '10', value: 10 },
          { suit: 'spades', rank: '10', value: 10 }
        ],
        dealerCards: [
          { suit: 'clubs', rank: '10', value: 10 },
          { suit: 'diamonds', rank: '9', value: 9 }
        ],
        expected: 'player-wins'
      },
      {
        name: 'Player 18 vs Dealer 18',
        playerCards: [
          { suit: 'hearts', rank: '9', value: 9 },
          { suit: 'spades', rank: '9', value: 9 }
        ],
        dealerCards: [
          { suit: 'clubs', rank: '10', value: 10 },
          { suit: 'diamonds', rank: '8', value: 8 }
        ],
        expected: 'push'
      },
      {
        name: 'Player 19 vs Dealer 21',
        playerCards: [
          { suit: 'hearts', rank: '10', value: 10 },
          { suit: 'spades', rank: '9', value: 9 }
        ],
        dealerCards: [
          { suit: 'clubs', rank: '7', value: 7 },
          { suit: 'diamonds', rank: '7', value: 7 },
          { suit: 'hearts', rank: '7', value: 7 }
        ],
        expected: 'dealer-wins'
      }
    ];

    testCases.forEach(testCase => {
      const playerHand = engine.createHand(testCase.playerCards);
      const dealerHand = engine.createHand(testCase.dealerCards);
      const result = engine.determineWinner(playerHand, dealerHand);
      
      expect(result).toBe(testCase.expected);
    });
  });

  test('should prioritize blackjack over regular 21', () => {
    // Player has regular 21 (3 cards)
    const playerCards: Card[] = [
      { suit: 'hearts', rank: '7', value: 7 },
      { suit: 'spades', rank: '7', value: 7 },
      { suit: 'clubs', rank: '7', value: 7 }
    ];

    // Dealer has blackjack (2 cards)
    const dealerCards: Card[] = [
      { suit: 'diamonds', rank: 'A', value: 11 },
      { suit: 'hearts', rank: 'K', value: 10 }
    ];

    const playerHand = engine.createHand(playerCards);
    const dealerHand = engine.createHand(dealerCards);

    expect(playerHand.value).toBe(21);
    expect(playerHand.isBlackjack).toBe(false); // 3 cards
    expect(dealerHand.value).toBe(21);
    expect(dealerHand.isBlackjack).toBe(true); // 2 cards

    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('dealer-blackjack');
  });

  test('should handle dealer bust scenarios', () => {
    // Player has 17
    const playerCards: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '7', value: 7 }
    ];

    // Dealer busts with 22
    const dealerCards: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '6', value: 6 },
      { suit: 'hearts', rank: '6', value: 6 }
    ];

    const playerHand = engine.createHand(playerCards);
    const dealerHand = engine.createHand(dealerCards);

    expect(playerHand.value).toBe(17);
    expect(playerHand.isBust).toBe(false);
    expect(dealerHand.value).toBe(22);
    expect(dealerHand.isBust).toBe(true);

    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('player-wins');
  });

  test('should verify the exact scenario from user report', () => {
    // User scenario: Player stands at 17, dealer draws to 21
    
    // Player: 10 + 7 = 17 (stands)
    const playerCards: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '7', value: 7 }
    ];

    // Dealer: 10 + 6 = 16 (must hit), then gets 5 = 21
    const dealerCards: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '6', value: 6 },
      { suit: 'hearts', rank: '5', value: 5 }
    ];

    const playerHand = engine.createHand(playerCards);
    const dealerHand = engine.createHand(dealerCards);

    // Verify hand values
    expect(playerHand.value).toBe(17);
    expect(playerHand.isBust).toBe(false);
    expect(playerHand.isBlackjack).toBe(false);

    expect(dealerHand.value).toBe(21);
    expect(dealerHand.isBust).toBe(false);
    expect(dealerHand.isBlackjack).toBe(false); // 3 cards, not blackjack

    // Dealer should win with 21 vs player's 17
    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('dealer-wins');

    // Verify dealer hitting logic
    const dealerBeforeHit = engine.createHand([dealerCards[0], dealerCards[1]]);
    expect(dealerBeforeHit.value).toBe(16);
    expect(engine.shouldDealerHit(dealerBeforeHit)).toBe(true); // Must hit on 16

    const dealerAfterHit = engine.createHand(dealerCards);
    expect(dealerAfterHit.value).toBe(21);
    expect(engine.shouldDealerHit(dealerAfterHit)).toBe(false); // Must stand on 21
  });

  test('should test edge cases around 21', () => {
    const edgeCases = [
      {
        name: 'Both have 21 - player blackjack vs dealer 21',
        playerCards: [
          { suit: 'hearts', rank: 'A', value: 11 },
          { suit: 'spades', rank: 'K', value: 10 }
        ],
        dealerCards: [
          { suit: 'clubs', rank: '7', value: 7 },
          { suit: 'diamonds', rank: '7', value: 7 },
          { suit: 'hearts', rank: '7', value: 7 }
        ],
        expected: 'player-blackjack'
      },
      {
        name: 'Both have 21 - dealer blackjack vs player 21',
        playerCards: [
          { suit: 'hearts', rank: '7', value: 7 },
          { suit: 'spades', rank: '7', value: 7 },
          { suit: 'clubs', rank: '7', value: 7 }
        ],
        dealerCards: [
          { suit: 'diamonds', rank: 'A', value: 11 },
          { suit: 'hearts', rank: 'Q', value: 10 }
        ],
        expected: 'dealer-blackjack'
      },
      {
        name: 'Both have blackjack',
        playerCards: [
          { suit: 'hearts', rank: 'A', value: 11 },
          { suit: 'spades', rank: 'K', value: 10 }
        ],
        dealerCards: [
          { suit: 'clubs', rank: 'A', value: 11 },
          { suit: 'diamonds', rank: 'Q', value: 10 }
        ],
        expected: 'push'
      }
    ];

    edgeCases.forEach(testCase => {
      const playerHand = engine.createHand(testCase.playerCards);
      const dealerHand = engine.createHand(testCase.dealerCards);
      const result = engine.determineWinner(playerHand, dealerHand);
      
      expect(result).toBe(testCase.expected);
    });
  });
});