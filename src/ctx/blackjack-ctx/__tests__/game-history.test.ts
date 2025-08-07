import { describe, it, expect, beforeEach } from 'bun:test';
import { GameHistoryManager } from '../game-history';
import { PlayerHand, Hand, GameResult } from '../types';

// Mock localStorage for testing
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: function (key: string) {
    return this.store[key] || null;
  },
  setItem: function (key: string, value: string) {
    this.store[key] = value;
  },
  removeItem: function (key: string) {
    delete this.store[key];
  },
  clear: function () {
    this.store = {};
  }
};

// Mock both localStorage and window for testing
// @ts-expect-error - Mocking localStorage for testing
global.localStorage = localStorageMock;
// @ts-expect-error - Mocking window for testing
global.window = { localStorage: localStorageMock };

describe('Game History Manager', () => {
  beforeEach(() => {
    // Clear localStorage mock and history before each test
    localStorageMock.clear();
    GameHistoryManager.clearHistory();
  });

  it('should save and retrieve game history', () => {

    // Create mock hands
    const playerHands: PlayerHand[] = [
      {
        id: '1',
        cards: [
          { suit: 'hearts', rank: 'K', value: 10 },
          { suit: 'spades', rank: 'A', value: 11 }
        ],
        value: 21,
        betAmount: 100,
        isBlackjack: true,
        isBust: false,
        isSoft: true,
        isActive: false,
        result: 'player-blackjack'
      }
    ];

    const dealerHand: Hand = {
      cards: [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'clubs', rank: '9', value: 9 }
      ],
      value: 19,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    const overallResult: GameResult = 'player-blackjack';
    const totalWinAmount = 250; // 100 bet + 150 blackjack bonus

    // Save the game
    GameHistoryManager.saveGame(playerHands, dealerHand, overallResult, totalWinAmount);

    // Retrieve history
    const history = GameHistoryManager.getHistory();

    expect(history.length).toBe(1);
    expect(history[0].overallResult).toBe('player-blackjack');
    expect(history[0].totalBetAmount).toBe(100);
    expect(history[0].totalWinAmount).toBe(250);
    expect(history[0].netWinnings).toBe(150);
    expect(history[0].playerHands[0].isBlackjack).toBe(true);
    expect(history[0].dealerHand.value).toBe(19);
  });

  it('should calculate statistics correctly', () => {

    // Save multiple games
    const games = [
      {
        playerHands: [{
          id: '1',
          cards: [{ suit: 'hearts' as const, rank: 'K' as const, value: 10 }, { suit: 'spades' as const, rank: 'A' as const, value: 11 }],
          value: 21,
          betAmount: 100,
          isBlackjack: true,
          isBust: false,
          isSoft: true,
          isActive: false,
          result: 'player-blackjack' as GameResult
        }],
        dealerHand: {
          cards: [{ suit: 'diamonds' as const, rank: '10' as const, value: 10 }, { suit: 'clubs' as const, rank: '9' as const, value: 9 }],
          value: 19,
          isBlackjack: false,
          isBust: false,
          isSoft: false
        },
        overallResult: 'player-blackjack' as GameResult,
        totalWinAmount: 250
      },
      {
        playerHands: [{
          id: '1',
          cards: [{ suit: 'hearts' as const, rank: '10' as const, value: 10 }, { suit: 'spades' as const, rank: '8' as const, value: 8 }],
          value: 18,
          betAmount: 50,
          isBlackjack: false,
          isBust: false,
          isSoft: false,
          isActive: false,
          result: 'dealer-wins' as GameResult
        }],
        dealerHand: {
          cards: [{ suit: 'diamonds' as const, rank: '10' as const, value: 10 }, { suit: 'clubs' as const, rank: '9' as const, value: 9 }],
          value: 19,
          isBlackjack: false,
          isBust: false,
          isSoft: false
        },
        overallResult: 'dealer-wins' as GameResult,
        totalWinAmount: 0
      }
    ];

    games.forEach(game => {
      GameHistoryManager.saveGame(
        game.playerHands as PlayerHand[],
        game.dealerHand,
        game.overallResult,
        game.totalWinAmount
      );
    });

    const stats = GameHistoryManager.getStats();

    expect(stats.totalGames).toBe(2);
    expect(stats.totalWins).toBe(1);
    expect(stats.totalLosses).toBe(1);
    expect(stats.totalBlackjacks).toBe(1);
    expect(stats.totalWinnings).toBe(100); // 150 - 50
    expect(stats.winRate).toBe(50);
  });

  it('should export and import history', () => {

    // Save a game
    const playerHands: PlayerHand[] = [{
      id: '1',
      cards: [{ suit: 'hearts' as const, rank: 'K' as const, value: 10 }, { suit: 'spades' as const, rank: 'Q' as const, value: 10 }],
      value: 20,
      betAmount: 100,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
      isActive: false,
      result: 'player-wins'
    }];

    const dealerHand: Hand = {
      cards: [{ suit: 'diamonds' as const, rank: '10' as const, value: 10 }, { suit: 'clubs' as const, rank: '8' as const, value: 8 }],
      value: 18,
      isBlackjack: false,
      isBust: false,
      isSoft: false
    };

    GameHistoryManager.saveGame(playerHands, dealerHand, 'player-wins', 200);

    // Export history
    const exported = GameHistoryManager.exportHistory();
    expect(exported).toContain('player-wins');
    expect(exported).toContain('200');

    // Clear and import
    GameHistoryManager.clearHistory();
    expect(GameHistoryManager.getHistory().length).toBe(0);

    const imported = GameHistoryManager.importHistory(exported);
    expect(imported).toBe(true);
    expect(GameHistoryManager.getHistory().length).toBe(1);
  });

  it('should limit history to maximum entries', () => {

    // Save more than MAX_ENTRIES games
    for (let i = 0; i < 105; i++) {
      const playerHands: PlayerHand[] = [{
        id: '1',
        cards: [{ suit: 'hearts' as const, rank: 'K' as const, value: 10 }, { suit: 'spades' as const, rank: 'Q' as const, value: 10 }],
        value: 20,
        betAmount: 10,
        isBlackjack: false,
        isBust: false,
        isSoft: false,
        isActive: false,
        result: 'player-wins'
      }];

      const dealerHand: Hand = {
        cards: [{ suit: 'diamonds' as const, rank: '10' as const, value: 10 }, { suit: 'clubs' as const, rank: '8' as const, value: 8 }],
        value: 18,
        isBlackjack: false,
        isBust: false,
        isSoft: false
      };

      GameHistoryManager.saveGame(playerHands, dealerHand, 'player-wins', 20);
    }

    const history = GameHistoryManager.getHistory();
    expect(history.length).toBe(100); // Should be limited to MAX_ENTRIES
  });

  it('should format display strings correctly', () => {
    const card = { suit: 'hearts' as const, rank: 'A' as const, value: 11 };
    const formatted = GameHistoryManager.formatCardDisplay(card);
    expect(formatted).toBe('A♥');

    const cards = [
      { suit: 'hearts' as const, rank: 'A' as const, value: 11 },
      { suit: 'spades' as const, rank: 'K' as const, value: 10 }
    ];
    const handFormatted = GameHistoryManager.formatHandDisplay(cards);
    expect(handFormatted).toBe('A♥ K♠');

    const timestamp = new Date('2024-01-01T12:00:00Z').getTime();
    const timeFormatted = GameHistoryManager.formatTimestamp(timestamp);
    expect(timeFormatted).toContain('2024');

    const resultMessage = GameHistoryManager.getResultMessage('player-blackjack');
    expect(resultMessage).toBe('BLACKJACK! You win!');
  });
});