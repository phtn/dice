import { Card, Hand, GameResult, PlayerHand } from './types';

export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  playerHands: {
    cards: Card[];
    value: number;
    betAmount: number;
    result: GameResult;
    isBlackjack: boolean;
    isBust: boolean;
    isSoft: boolean;
  }[];
  dealerHand: {
    cards: Card[];
    value: number;
    isBlackjack: boolean;
    isBust: boolean;
    isSoft: boolean;
  };
  overallResult: GameResult;
  totalBetAmount: number;
  totalWinAmount: number;
  netWinnings: number;
}

export class GameHistoryManager {
  private static readonly STORAGE_KEY = 'blackjack-game-history';
  private static readonly MAX_ENTRIES = 100; // Keep last 100 games

  static saveGame(
    playerHands: PlayerHand[],
    dealerHand: Hand,
    overallResult: GameResult,
    totalWinAmount: number
  ): void {
    const totalBetAmount = playerHands.reduce((sum, hand) => sum + hand.betAmount, 0);
    const netWinnings = totalWinAmount - totalBetAmount;

    const entry: GameHistoryEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      playerHands: playerHands.map(hand => ({
        cards: hand.cards,
        value: hand.value,
        betAmount: hand.betAmount,
        result: hand.result || null,
        isBlackjack: hand.isBlackjack,
        isBust: hand.isBust,
        isSoft: hand.isSoft,
      })),
      dealerHand: {
        cards: dealerHand.cards,
        value: dealerHand.value,
        isBlackjack: dealerHand.isBlackjack,
        isBust: dealerHand.isBust,
        isSoft: dealerHand.isSoft,
      },
      overallResult,
      totalBetAmount,
      totalWinAmount,
      netWinnings,
    };

    const history = this.getHistory();
    history.unshift(entry); // Add to beginning

    // Keep only the most recent entries
    if (history.length > this.MAX_ENTRIES) {
      history.splice(this.MAX_ENTRIES);
    }

    this.saveHistory(history);
  }

  static getHistory(): GameHistoryEntry[] {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading game history:', error);
      return [];
    }
  }

  static clearHistory(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getStats(): {
    totalGames: number;
    totalWins: number;
    totalLosses: number;
    totalPushes: number;
    totalBlackjacks: number;
    totalWinnings: number;
    winRate: number;
    averageWinnings: number;
    biggestWin: number;
    biggestLoss: number;
  } {
    const history = this.getHistory();
    
    let totalWins = 0;
    let totalLosses = 0;
    let totalPushes = 0;
    let totalBlackjacks = 0;
    let totalWinnings = 0;
    let biggestWin = 0;
    let biggestLoss = 0;

    history.forEach(game => {
      totalWinnings += game.netWinnings;
      
      if (game.netWinnings > biggestWin) {
        biggestWin = game.netWinnings;
      }
      if (game.netWinnings < biggestLoss) {
        biggestLoss = game.netWinnings;
      }

      // Count results from individual hands
      game.playerHands.forEach(hand => {
        switch (hand.result) {
          case 'player-wins':
          case 'player-blackjack':
            totalWins++;
            break;
          case 'dealer-wins':
          case 'dealer-blackjack':
            totalLosses++;
            break;
          case 'push':
            totalPushes++;
            break;
        }
        
        if (hand.isBlackjack) {
          totalBlackjacks++;
        }
      });
    });

    const totalHands = totalWins + totalLosses + totalPushes;
    const winRate = totalHands > 0 ? (totalWins / totalHands) * 100 : 0;
    const averageWinnings = history.length > 0 ? totalWinnings / history.length : 0;

    return {
      totalGames: history.length,
      totalWins,
      totalLosses,
      totalPushes,
      totalBlackjacks,
      totalWinnings,
      winRate,
      averageWinnings,
      biggestWin,
      biggestLoss,
    };
  }

  static getRecentGames(count: number = 10): GameHistoryEntry[] {
    return this.getHistory().slice(0, count);
  }

  static exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  static importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.saveHistory(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  private static saveHistory(history: GameHistoryEntry[]): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving game history:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  static formatCardDisplay(card: Card): string {
    const suitSymbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return `${card.rank}${suitSymbols[card.suit]}`;
  }

  static formatHandDisplay(cards: Card[]): string {
    return cards.map(card => this.formatCardDisplay(card)).join(' ');
  }

  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  static getResultMessage(result: GameResult): string {
    switch (result) {
      case 'player-blackjack':
        return 'BLACKJACK! You win!';
      case 'player-wins':
        return 'You win!';
      case 'dealer-blackjack':
        return 'Dealer Blackjack. You lose.';
      case 'dealer-wins':
        return 'Dealer wins. You lose.';
      case 'push':
        return "Push! It's a tie.";
      default:
        return 'Unknown result';
    }
  }
}