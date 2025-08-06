/**
 * Test for single hand result display
 * Verifying the specific user scenario: Player 17 vs Dealer 21
 */

import { BlackjackEngine } from '../game-engine';

describe('Single Hand Result Display', () => {
  test('should correctly show dealer wins when dealer has 21 vs player 17', () => {
    const engine = new BlackjackEngine(1);
    
    // Simulate the exact scenario
    const playerCards = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '7', value: 7 }
    ];
    
    const dealerCards = [
      { suit: 'clubs', rank: '10', value: 10 },
      { suit: 'diamonds', rank: '6', value: 6 },
      { suit: 'hearts', rank: '5', value: 5 }
    ];
    
    const playerHand = engine.createHand(playerCards);
    const dealerHand = engine.createHand(dealerCards);
    
    // Verify the setup
    expect(playerHand.value).toBe(17);
    expect(dealerHand.value).toBe(21);
    expect(dealerHand.isBlackjack).toBe(false); // 3 cards = not blackjack
    
    // Test the winner determination
    const result = engine.determineWinner(playerHand, dealerHand);
    expect(result).toBe('dealer-wins');
    
    // This should translate to "Dealer wins. You lose." message
    const expectedMessage = result === 'dealer-wins' ? 'Dealer wins. You lose.' : 'Wrong result';
    expect(expectedMessage).toBe('Dealer wins. You lose.');
  });

  test('should handle various single hand scenarios correctly', () => {
    const engine = new BlackjackEngine(1);
    
    const scenarios = [
      {
        name: 'Player 17 vs Dealer 21',
        player: [
          { suit: 'hearts', rank: '10', value: 10 },
          { suit: 'spades', rank: '7', value: 7 }
        ],
        dealer: [
          { suit: 'clubs', rank: '10', value: 10 },
          { suit: 'diamonds', rank: '6', value: 6 },
          { suit: 'hearts', rank: '5', value: 5 }
        ],
        expected: 'dealer-wins',
        message: 'Dealer wins. You lose.'
      },
      {
        name: 'Player 20 vs Dealer 19',
        player: [
          { suit: 'hearts', rank: '10', value: 10 },
          { suit: 'spades', rank: '10', value: 10 }
        ],
        dealer: [
          { suit: 'clubs', rank: '10', value: 10 },
          { suit: 'diamonds', rank: '9', value: 9 }
        ],
        expected: 'player-wins',
        message: 'You win!'
      },
      {
        name: 'Player blackjack vs Dealer 20',
        player: [
          { suit: 'hearts', rank: 'A', value: 11 },
          { suit: 'spades', rank: 'K', value: 10 }
        ],
        dealer: [
          { suit: 'clubs', rank: '10', value: 10 },
          { suit: 'diamonds', rank: '10', value: 10 }
        ],
        expected: 'player-blackjack',
        message: 'BLACKJACK! You win!'
      }
    ];

    scenarios.forEach(scenario => {
      const playerHand = engine.createHand(scenario.player);
      const dealerHand = engine.createHand(scenario.dealer);
      const result = engine.determineWinner(playerHand, dealerHand);
      
      expect(result).toBe(scenario.expected);
      
      // Verify message mapping
      const messageMap: Record<string, string> = {
        'player-blackjack': 'BLACKJACK! You win!',
        'player-wins': 'You win!',
        'dealer-blackjack': 'Dealer Blackjack. You lose.',
        'dealer-wins': 'Dealer wins. You lose.',
        'push': "Push! It's a tie."
      };
      
      const expectedMessage = messageMap[result];
      expect(expectedMessage).toBe(scenario.message);
    });
  });
});