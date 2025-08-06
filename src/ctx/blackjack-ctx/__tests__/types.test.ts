import { Card, Hand, GameState, GameResult, GameStats, PlayerHand } from '../types';

describe('Blackjack Types', () => {
  describe('Card Type', () => {
    test('should accept valid card properties', () => {
      const card: Card = {
        suit: 'hearts',
        rank: 'A',
        value: 11
      };
      
      expect(card.suit).toBe('hearts');
      expect(card.rank).toBe('A');
      expect(card.value).toBe(11);
    });

    test('should accept all valid suits', () => {
      const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
      
      suits.forEach(suit => {
        const card: Card = { suit, rank: 'A', value: 11 };
        expect(card.suit).toBe(suit);
      });
    });

    test('should accept all valid ranks', () => {
      const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      
      ranks.forEach(rank => {
        const card: Card = { suit: 'hearts', rank, value: 10 };
        expect(card.rank).toBe(rank);
      });
    });
  });

  describe('Hand Type', () => {
    test('should accept valid hand properties', () => {
      const hand: Hand = {
        cards: [
          { suit: 'hearts', rank: 'A', value: 11 },
          { suit: 'spades', rank: 'K', value: 10 }
        ],
        value: 21,
        isBlackjack: true,
        isBust: false,
        isSoft: true
      };
      
      expect(hand.cards).toHaveLength(2);
      expect(hand.value).toBe(21);
      expect(hand.isBlackjack).toBe(true);
      expect(hand.isBust).toBe(false);
      expect(hand.isSoft).toBe(true);
    });
  });

  describe('PlayerHand Type', () => {
    test('should extend Hand with additional properties', () => {
      const playerHand: PlayerHand = {
        id: 'hand-1',
        cards: [
          { suit: 'hearts', rank: '10', value: 10 },
          { suit: 'spades', rank: '9', value: 9 }
        ],
        value: 19,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        betAmount: 100,
        isActive: true,
        result: 'player-wins'
      };
      
      expect(playerHand.id).toBe('hand-1');
      expect(playerHand.betAmount).toBe(100);
      expect(playerHand.isActive).toBe(true);
      expect(playerHand.result).toBe('player-wins');
      // Should also have all Hand properties
      expect(playerHand.cards).toHaveLength(2);
      expect(playerHand.value).toBe(19);
    });
  });

  describe('GameState Type', () => {
    test('should accept all valid game states', () => {
      const states: GameState[] = ['betting', 'dealing', 'player-turn', 'dealer-turn', 'game-over'];
      
      states.forEach(state => {
        const gameState: GameState = state;
        expect(gameState).toBe(state);
      });
    });
  });

  describe('GameResult Type', () => {
    test('should accept all valid game results', () => {
      const results: GameResult[] = [
        'player-wins',
        'dealer-wins', 
        'push',
        'player-blackjack',
        'dealer-blackjack',
        null
      ];
      
      results.forEach(result => {
        const gameResult: GameResult = result;
        expect(gameResult).toBe(result);
      });
    });
  });

  describe('GameStats Type', () => {
    test('should accept valid stats properties', () => {
      const stats: GameStats = {
        gamesPlayed: 10,
        gamesWon: 6,
        gamesLost: 3,
        pushes: 1,
        blackjacks: 2,
        totalWinnings: 150
      };
      
      expect(stats.gamesPlayed).toBe(10);
      expect(stats.gamesWon).toBe(6);
      expect(stats.gamesLost).toBe(3);
      expect(stats.pushes).toBe(1);
      expect(stats.blackjacks).toBe(2);
      expect(stats.totalWinnings).toBe(150);
    });

    test('should calculate win rate correctly', () => {
      const stats: GameStats = {
        gamesPlayed: 100,
        gamesWon: 45,
        gamesLost: 50,
        pushes: 5,
        blackjacks: 8,
        totalWinnings: -50
      };
      
      const winRate = (stats.gamesWon / stats.gamesPlayed) * 100;
      expect(winRate).toBe(45);
      
      // Verify totals add up
      expect(stats.gamesWon + stats.gamesLost + stats.pushes).toBe(stats.gamesPlayed);
    });
  });
});