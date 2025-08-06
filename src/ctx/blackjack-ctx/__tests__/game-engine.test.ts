import { BlackjackEngine } from '../game-engine';
import { Card } from '../types';

describe('BlackjackEngine', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  describe('Deck Management', () => {
    test('should initialize with correct number of cards', () => {
      expect(engine.getTotalCards()).toBe(52);
      expect(engine.getRemainingCards()).toBe(52);
      expect(engine.getUsedCards()).toBe(0);
    });

    test('should handle multiple decks correctly', () => {
      const multiDeckEngine = new BlackjackEngine(6);
      expect(multiDeckEngine.getTotalCards()).toBe(312); // 6 * 52
      expect(multiDeckEngine.getRemainingCards()).toBe(312);
    });

    test('should deal cards and update counts', () => {
      const initialRemaining = engine.getRemainingCards();
      const card = engine.dealCard();
      
      expect(card).toBeTruthy();
      expect(engine.getRemainingCards()).toBe(initialRemaining - 1);
      expect(engine.getUsedCards()).toBe(1);
    });

    test('should shuffle deck when low on cards', () => {
      // Deal most of the deck
      for (let i = 0; i < 40; i++) {
        engine.dealCard();
      }
      
      const remainingBefore = engine.getRemainingCards();
      expect(remainingBefore).toBeLessThan(13); // Less than 25% of 52
      
      // Next deal should trigger shuffle
      engine.dealCard();
      expect(engine.getRemainingCards()).toBeGreaterThan(remainingBefore);
    });

    test('should track card counts by rank', () => {
      const usedByRank = engine.getUsedCardsByRank();
      const remainingByRank = engine.getRemainingCardsByRank();
      
      // Initially no cards used
      expect(usedByRank['A']).toBe(0);
      expect(remainingByRank['A']).toBe(4); // 4 aces in single deck
      
      // Deal some cards
      for (let i = 0; i < 10; i++) {
        engine.dealCard();
      }
      
      const newUsedByRank = engine.getUsedCardsByRank();
      const newRemainingByRank = engine.getRemainingCardsByRank();
      
      // Should have some cards used now
      const totalUsed = Object.values(newUsedByRank).reduce((sum, count) => sum + count, 0);
      expect(totalUsed).toBe(10);
      
      // Remaining + used should equal total for each rank
      Object.keys(newUsedByRank).forEach(rank => {
        expect(newUsedByRank[rank] + newRemainingByRank[rank]).toBe(4);
      });
    });
  });

  describe('Hand Calculation', () => {
    test('should calculate simple hand values correctly', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '7', value: 7 },
        { suit: 'spades', rank: '5', value: 5 }
      ];
      
      const hand = engine.createHand(cards);
      expect(hand.value).toBe(12);
      expect(hand.isSoft).toBe(false);
      expect(hand.isBlackjack).toBe(false);
      expect(hand.isBust).toBe(false);
    });

    test('should handle aces as 11 when possible', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: '9', value: 9 }
      ];
      
      const hand = engine.createHand(cards);
      expect(hand.value).toBe(20);
      expect(hand.isSoft).toBe(true);
      expect(hand.isBlackjack).toBe(false);
    });

    test('should handle aces as 1 when 11 would bust', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: '9', value: 9 },
        { suit: 'clubs', rank: '5', value: 5 }
      ];
      
      const hand = engine.createHand(cards);
      expect(hand.value).toBe(15); // A=1, 9, 5
      expect(hand.isSoft).toBe(false);
      expect(hand.isBust).toBe(false);
    });

    test('should detect blackjack correctly', () => {
      const blackjackHand: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: 'K', value: 10 }
      ];
      
      const hand = engine.createHand(blackjackHand);
      expect(hand.value).toBe(21);
      expect(hand.isBlackjack).toBe(true);
      expect(hand.isSoft).toBe(true);
    });

    test('should detect bust correctly', () => {
      const bustHand: Card[] = [
        { suit: 'hearts', rank: 'K', value: 10 },
        { suit: 'spades', rank: 'Q', value: 10 },
        { suit: 'clubs', rank: '5', value: 5 }
      ];
      
      const hand = engine.createHand(bustHand);
      expect(hand.value).toBe(25);
      expect(hand.isBust).toBe(true);
    });

    test('should handle multiple aces correctly', () => {
      const multipleAces: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: 'A', value: 11 },
        { suit: 'clubs', rank: '9', value: 9 }
      ];
      
      const hand = engine.createHand(multipleAces);
      expect(hand.value).toBe(21); // A=11, A=1, 9
      expect(hand.isSoft).toBe(true);
    });
  });

  describe('Dealer Logic', () => {
    test('should hit on 16 or less', () => {
      const hand16: Card[] = [
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'spades', rank: '6', value: 6 }
      ];
      
      const hand = engine.createHand(hand16);
      expect(engine.shouldDealerHit(hand)).toBe(true);
    });

    test('should stand on hard 17 or more', () => {
      const hand17: Card[] = [
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'spades', rank: '7', value: 7 }
      ];
      
      const hand = engine.createHand(hand17);
      expect(engine.shouldDealerHit(hand)).toBe(false);
    });

    test('should hit on soft 17', () => {
      const softHand17: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: '6', value: 6 }
      ];
      
      const hand = engine.createHand(softHand17);
      expect(hand.value).toBe(17);
      expect(hand.isSoft).toBe(true);
      expect(engine.shouldDealerHit(hand)).toBe(true);
    });

    test('should stand on soft 18 or more', () => {
      const softHand18: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: '7', value: 7 }
      ];
      
      const hand = engine.createHand(softHand18);
      expect(hand.value).toBe(18);
      expect(hand.isSoft).toBe(true);
      expect(engine.shouldDealerHit(hand)).toBe(false);
    });
  });

  describe('Winner Determination', () => {
    test('should detect player blackjack win', () => {
      const playerBlackjack: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: 'K', value: 10 }
      ];
      const dealerHand: Card[] = [
        { suit: 'clubs', rank: '10', value: 10 },
        { suit: 'diamonds', rank: '9', value: 9 }
      ];
      
      const playerHand = engine.createHand(playerBlackjack);
      const dealer = engine.createHand(dealerHand);
      
      expect(engine.determineWinner(playerHand, dealer)).toBe('player-blackjack');
    });

    test('should detect dealer blackjack win', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'spades', rank: '9', value: 9 }
      ];
      const dealerBlackjack: Card[] = [
        { suit: 'clubs', rank: 'A', value: 11 },
        { suit: 'diamonds', rank: 'Q', value: 10 }
      ];
      
      const player = engine.createHand(playerHand);
      const dealer = engine.createHand(dealerBlackjack);
      
      expect(engine.determineWinner(player, dealer)).toBe('dealer-blackjack');
    });

    test('should detect push with both blackjacks', () => {
      const blackjackHand: Card[] = [
        { suit: 'hearts', rank: 'A', value: 11 },
        { suit: 'spades', rank: 'K', value: 10 }
      ];
      const dealerBlackjack: Card[] = [
        { suit: 'clubs', rank: 'A', value: 11 },
        { suit: 'diamonds', rank: 'Q', value: 10 }
      ];
      
      const player = engine.createHand(blackjackHand);
      const dealer = engine.createHand(dealerBlackjack);
      
      expect(engine.determineWinner(player, dealer)).toBe('push');
    });

    test('should detect player bust', () => {
      const playerBust: Card[] = [
        { suit: 'hearts', rank: 'K', value: 10 },
        { suit: 'spades', rank: 'Q', value: 10 },
        { suit: 'clubs', rank: '5', value: 5 }
      ];
      const dealerHand: Card[] = [
        { suit: 'diamonds', rank: '10', value: 10 },
        { suit: 'hearts', rank: '7', value: 7 }
      ];
      
      const player = engine.createHand(playerBust);
      const dealer = engine.createHand(dealerHand);
      
      expect(engine.determineWinner(player, dealer)).toBe('dealer-wins');
    });

    test('should detect dealer bust', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'spades', rank: '9', value: 9 }
      ];
      const dealerBust: Card[] = [
        { suit: 'clubs', rank: 'K', value: 10 },
        { suit: 'diamonds', rank: 'Q', value: 10 },
        { suit: 'hearts', rank: '5', value: 5 }
      ];
      
      const player = engine.createHand(playerHand);
      const dealer = engine.createHand(dealerBust);
      
      expect(engine.determineWinner(player, dealer)).toBe('player-wins');
    });

    test('should compare values when neither busts', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'spades', rank: '9', value: 9 }
      ];
      const dealerHand: Card[] = [
        { suit: 'clubs', rank: '10', value: 10 },
        { suit: 'diamonds', rank: '7', value: 7 }
      ];
      
      const player = engine.createHand(playerHand); // 19
      const dealer = engine.createHand(dealerHand); // 17
      
      expect(engine.determineWinner(player, dealer)).toBe('player-wins');
    });

    test('should detect push with equal values', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', value: 10 },
        { suit: 'spades', rank: '8', value: 8 }
      ];
      const dealerHand: Card[] = [
        { suit: 'clubs', rank: '9', value: 9 },
        { suit: 'diamonds', rank: '9', value: 9 }
      ];
      
      const player = engine.createHand(playerHand); // 18
      const dealer = engine.createHand(dealerHand); // 18
      
      expect(engine.determineWinner(player, dealer)).toBe('push');
    });
  });

  describe('Split Functionality', () => {
    test('should detect splittable hands', () => {
      const pairHand: Card[] = [
        { suit: 'hearts', rank: '8', value: 8 },
        { suit: 'spades', rank: '8', value: 8 }
      ];
      
      const hand = engine.createHand(pairHand);
      expect(engine.canSplit(hand)).toBe(true);
    });

    test('should reject non-pairs for splitting', () => {
      const nonPairHand: Card[] = [
        { suit: 'hearts', rank: '8', value: 8 },
        { suit: 'spades', rank: '7', value: 7 }
      ];
      
      const hand = engine.createHand(nonPairHand);
      expect(engine.canSplit(hand)).toBe(false);
    });

    test('should reject hands with more than 2 cards', () => {
      const threeCardHand: Card[] = [
        { suit: 'hearts', rank: '8', value: 8 },
        { suit: 'spades', rank: '8', value: 8 },
        { suit: 'clubs', rank: '5', value: 5 }
      ];
      
      const hand = engine.createHand(threeCardHand);
      expect(engine.canSplit(hand)).toBe(false);
    });

    test('should split hand correctly', () => {
      const pairHand: Card[] = [
        { suit: 'hearts', rank: '8', value: 8 },
        { suit: 'spades', rank: '8', value: 8 }
      ];
      
      const hand = engine.createHand(pairHand);
      const { hand1, hand2 } = engine.splitHand(hand);
      
      expect(hand1.cards.length).toBe(1);
      expect(hand2.cards.length).toBe(1);
      expect(hand1.cards[0].rank).toBe('8');
      expect(hand2.cards[0].rank).toBe('8');
      expect(hand1.value).toBe(8);
      expect(hand2.value).toBe(8);
    });

    test('should throw error when trying to split non-splittable hand', () => {
      const nonPairHand: Card[] = [
        { suit: 'hearts', rank: '8', value: 8 },
        { suit: 'spades', rank: '7', value: 7 }
      ];
      
      const hand = engine.createHand(nonPairHand);
      expect(() => engine.splitHand(hand)).toThrow('Cannot split this hand');
    });
  });

  describe('Card Display', () => {
    test('should format card display correctly', () => {
      const card: Card = { suit: 'hearts', rank: 'A', value: 11 };
      expect(engine.getCardDisplay(card)).toBe('A♥');
      
      const card2: Card = { suit: 'spades', rank: 'K', value: 10 };
      expect(engine.getCardDisplay(card2)).toBe('K♠');
      
      const card3: Card = { suit: 'diamonds', rank: '10', value: 10 };
      expect(engine.getCardDisplay(card3)).toBe('10♦');
      
      const card4: Card = { suit: 'clubs', rank: '7', value: 7 };
      expect(engine.getCardDisplay(card4)).toBe('7♣');
    });
  });

  describe('Deck Count Management', () => {
    test('should change deck count correctly', () => {
      expect(engine.getDeckCount()).toBe(1);
      expect(engine.getTotalCards()).toBe(52);
      
      engine.setDeckCount(6);
      expect(engine.getDeckCount()).toBe(6);
      expect(engine.getTotalCards()).toBe(312);
      expect(engine.getRemainingCards()).toBe(312);
      expect(engine.getUsedCards()).toBe(0);
    });

    test('should maintain card count accuracy after deck change', () => {
      engine.setDeckCount(2);
      
      // Deal some cards
      for (let i = 0; i < 10; i++) {
        engine.dealCard();
      }
      
      expect(engine.getUsedCards()).toBe(10);
      expect(engine.getRemainingCards()).toBe(94); // 104 - 10
      
      // Change deck count should reset
      engine.setDeckCount(4);
      expect(engine.getUsedCards()).toBe(0);
      expect(engine.getRemainingCards()).toBe(208); // 4 * 52
    });
  });
});