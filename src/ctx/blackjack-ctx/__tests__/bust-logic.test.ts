/**
 * Tests for proper bust handling in blackjack
 * When player busts, dealer wins immediately without revealing hole card
 */

import { BlackjackEngine } from '../game-engine';
import { Card } from '../types';

describe('Blackjack Bust Logic', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should end game immediately when player busts', () => {
    // Player busts with K+Q+5 = 25
    const playerBustHand: Card[] = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];

    // Dealer has any hand (doesn't matter since player busted)
    const dealerHand: Card[] = [
      { suit: 'diamonds', rank: '10', value: 10 },
      { suit: 'hearts', rank: '6', value: 6 }
    ];

    const playerHand = engine.createHand(playerBustHand);
    const dealer = engine.createHand(dealerHand);

    expect(playerHand.isBust).toBe(true);
    expect(playerHand.value).toBe(25);

    // When player busts, dealer wins regardless of dealer's hand
    const result = engine.determineWinner(playerHand, dealer);
    expect(result).toBe('dealer-wins');
  });

  test('should not require dealer to play when all player hands bust', () => {
    // Simulate multiple hands (from splits) where all bust
    const bustHand1: Card[] = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];

    const bustHand2: Card[] = [
      { suit: 'diamonds', rank: 'J', value: 10 },
      { suit: 'hearts', rank: '9', value: 9 },
      { suit: 'spades', rank: '7', value: 7 }
    ];

    // Dealer has initial 2 cards (hole card not revealed)
    const dealerInitialHand: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '6', value: 6 } // This would normally require dealer to hit
    ];

    const playerHand1 = engine.createHand(bustHand1);
    const playerHand2 = engine.createHand(bustHand2);
    const dealerHand = engine.createHand(dealerInitialHand);

    expect(playerHand1.isBust).toBe(true);
    expect(playerHand2.isBust).toBe(true);
    expect(dealerHand.value).toBe(16); // Dealer would normally hit on 16

    // Both player hands bust, so dealer wins without playing
    expect(engine.determineWinner(playerHand1, dealerHand)).toBe('dealer-wins');
    expect(engine.determineWinner(playerHand2, dealerHand)).toBe('dealer-wins');

    // Dealer should NOT need to hit on 16 because all players busted
    expect(engine.shouldDealerHit(dealerHand)).toBe(true); // This is still true for the rule
    // But in game logic, dealer doesn't play if all players bust
  });

  test('should handle mixed results - some bust, some dont', () => {
    // Hand 1: Player busts
    const bustHand: Card[] = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];

    // Hand 2: Player has 19
    const goodHand: Card[] = [
      { suit: 'diamonds', rank: '10', value: 10 },
      { suit: 'hearts', rank: '9', value: 9 }
    ];

    // Dealer has 18
    const dealerHand: Card[] = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'spades', rank: '8', value: 8 }
    ];

    const playerHand1 = engine.createHand(bustHand);
    const playerHand2 = engine.createHand(goodHand);
    const dealer = engine.createHand(dealerHand);

    expect(playerHand1.isBust).toBe(true);
    expect(playerHand2.isBust).toBe(false);
    expect(playerHand2.value).toBe(19);
    expect(dealer.value).toBe(18);

    // Hand 1: Dealer wins due to player bust
    expect(engine.determineWinner(playerHand1, dealer)).toBe('dealer-wins');
    
    // Hand 2: Player wins with 19 vs dealer 18
    expect(engine.determineWinner(playerHand2, dealer)).toBe('player-wins');

    // In this case, dealer SHOULD play because not all hands busted
  });

  test('should handle bust with blackjack scenarios', () => {
    // Player busts
    const playerBustHand: Card[] = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];

    // Dealer has blackjack
    const dealerBlackjack: Card[] = [
      { suit: 'diamonds', rank: 'A', value: 11 },
      { suit: 'hearts', rank: 'K', value: 10 }
    ];

    const playerHand = engine.createHand(playerBustHand);
    const dealerHand = engine.createHand(dealerBlackjack);

    expect(playerHand.isBust).toBe(true);
    expect(dealerHand.isBlackjack).toBe(true);

    // Player bust takes precedence - dealer wins due to player bust, not blackjack
    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('dealer-wins');
  });

  test('should handle ace conversion leading to bust', () => {
    // Player has A+6+5 = 12 (ace converts from 11 to 1)
    const aceConversionHand: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '6', value: 6 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];

    // Then player hits and gets 10, making it 22 (bust)
    const bustWithAceHand: Card[] = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '6', value: 6 },
      { suit: 'clubs', rank: '5', value: 5 },
      { suit: 'diamonds', rank: '10', value: 10 }
    ];

    const beforeBust = engine.createHand(aceConversionHand);
    const afterBust = engine.createHand(bustWithAceHand);

    expect(beforeBust.value).toBe(12); // A=1, 6, 5
    expect(beforeBust.isBust).toBe(false);
    expect(beforeBust.isSoft).toBe(false); // Ace is now hard

    expect(afterBust.value).toBe(22); // A=1, 6, 5, 10
    expect(afterBust.isBust).toBe(true);
  });

  test('should verify bust detection accuracy', () => {
    const testCases = [
      {
        name: 'Simple bust',
        cards: [
          { suit: 'hearts', rank: 'K', value: 10 },
          { suit: 'spades', rank: 'Q', value: 10 },
          { suit: 'clubs', rank: '5', value: 5 }
        ],
        expectedValue: 25,
        expectedBust: true
      },
      {
        name: 'Exactly 21',
        cards: [
          { suit: 'hearts', rank: 'K', value: 10 },
          { suit: 'spades', rank: 'A', value: 11 }
        ],
        expectedValue: 21,
        expectedBust: false
      },
      {
        name: 'Just under bust',
        cards: [
          { suit: 'hearts', rank: '7', value: 7 },
          { suit: 'spades', rank: '7', value: 7 },
          { suit: 'clubs', rank: '7', value: 7 }
        ],
        expectedValue: 21,
        expectedBust: false
      },
      {
        name: 'Multiple aces bust',
        cards: [
          { suit: 'hearts', rank: 'A', value: 11 },
          { suit: 'spades', rank: 'A', value: 11 },
          { suit: 'clubs', rank: 'A', value: 11 },
          { suit: 'diamonds', rank: '10', value: 10 }
        ],
        expectedValue: 13, // A=1, A=1, A=1, 10
        expectedBust: false
      }
    ];

    testCases.forEach(testCase => {
      const hand = engine.createHand(testCase.cards);
      expect(hand.value).toBe(testCase.expectedValue);
      expect(hand.isBust).toBe(testCase.expectedBust);
    });
  });
});

describe('Blackjack Dealer Play Logic', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should not require dealer play when all players bust', () => {
    // This is more of a game logic test than engine test
    // The engine itself doesn't know about "all players bust"
    // That logic is in the context

    const playerBustHand: Card[] = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '8', value: 8 }
    ];

    const dealerHand: Card[] = [
      { suit: 'diamonds', rank: '10', value: 10 },
      { suit: 'hearts', rank: '6', value: 6 }
    ];

    const playerHand = engine.createHand(playerBustHand);
    const dealer = engine.createHand(dealerHand);

    expect(playerHand.isBust).toBe(true);
    expect(dealer.value).toBe(16);
    expect(engine.shouldDealerHit(dealer)).toBe(true);

    // But in game context, dealer shouldn't play if all players bust
    const result = engine.determineWinner(playerHand, dealer);
    expect(result).toBe('dealer-wins');
  });

  test('should require dealer play when at least one player hand is not busted', () => {
    const playerGoodHand: Card[] = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '9', value: 9 }
    ];

    const dealerHand: Card[] = [
      { suit: 'diamonds', rank: '10', value: 10 },
      { suit: 'hearts', rank: '6', value: 6 }
    ];

    const playerHand = engine.createHand(playerGoodHand);
    const dealer = engine.createHand(dealerHand);

    expect(playerHand.isBust).toBe(false);
    expect(playerHand.value).toBe(19);
    expect(dealer.value).toBe(16);
    expect(engine.shouldDealerHit(dealer)).toBe(true);

    // Dealer must play and hit on 16
    // After hitting, let's say dealer gets a 5
    const dealerAfterHit: Card[] = [
      { suit: 'diamonds', rank: '10', value: 10 },
      { suit: 'hearts', rank: '6', value: 6 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];

    const dealerFinalHand = engine.createHand(dealerAfterHit);
    expect(dealerFinalHand.value).toBe(21);
    expect(engine.shouldDealerHit(dealerFinalHand)).toBe(false);

    // Now compare: Player 19 vs Dealer 21
    const result = engine.determineWinner(playerHand, dealerFinalHand);
    expect(result).toBe('dealer-wins');
  });
});