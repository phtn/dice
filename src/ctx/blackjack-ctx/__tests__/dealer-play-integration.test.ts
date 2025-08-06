import { describe, it, expect, beforeEach } from 'bun:test';
import { BlackjackEngine } from '../game-engine';

describe('Dealer Play Integration', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  it('should simulate dealer stopping at 17 when player has 20', () => {
    // Set up a controlled deck where dealer will get exactly 17
    // We need to manipulate the deck to ensure predictable results
    
    // Create a scenario where:
    // - Player stands with 20
    // - Dealer starts with 10, 6 (16 total)
    // - Dealer draws A (can be 1 or 11, should be 1 to make 17)
    
    const dealerStartingHand = engine.createHand([
      { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
      { suit: 'clubs' as const, rank: '6' as const, value: 6 }
    ]);
    
    expect(dealerStartingHand.value).toBe(16);
    expect(engine.shouldDealerHit(dealerStartingHand)).toBe(true);
    
    // Dealer draws an Ace (should count as 1 to avoid bust)
    const dealerFinalHand = engine.createHand([
      { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
      { suit: 'clubs' as const, rank: '6' as const, value: 6 },
      { suit: 'hearts' as const, rank: 'A' as const, value: 1 }
    ]);
    
    expect(dealerFinalHand.value).toBe(17);
    expect(engine.shouldDealerHit(dealerFinalHand)).toBe(false);
  });

  it('should simulate dealer busting when trying to improve', () => {
    // Dealer has 16, draws a high card and busts
    const dealerStartingHand = engine.createHand([
      { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
      { suit: 'clubs' as const, rank: '6' as const, value: 6 }
    ]);
    
    expect(dealerStartingHand.value).toBe(16);
    expect(engine.shouldDealerHit(dealerStartingHand)).toBe(true);
    
    // Dealer draws a 10 and busts
    const dealerBustHand = engine.createHand([
      { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
      { suit: 'clubs' as const, rank: '6' as const, value: 6 },
      { suit: 'hearts' as const, rank: 'K' as const, value: 10 }
    ]);
    
    expect(dealerBustHand.value).toBe(26);
    expect(dealerBustHand.isBust).toBe(true);
    expect(engine.shouldDealerHit(dealerBustHand)).toBe(false); // Should not hit when busted
  });

  it('should verify ace handling in dealer play', () => {
    // Test soft 17 scenario
    const softSeventeen = engine.createHand([
      { suit: 'hearts' as const, rank: 'A' as const, value: 11 },
      { suit: 'clubs' as const, rank: '6' as const, value: 6 }
    ]);
    
    expect(softSeventeen.value).toBe(17);
    expect(softSeventeen.isSoft).toBe(true);
    expect(engine.shouldDealerHit(softSeventeen)).toBe(true); // Must hit soft 17
    
    // If dealer draws a small card on soft 17
    const softEighteen = engine.createHand([
      { suit: 'hearts' as const, rank: 'A' as const, value: 11 },
      { suit: 'clubs' as const, rank: '6' as const, value: 6 },
      { suit: 'spades' as const, rank: 'A' as const, value: 1 }
    ]);
    
    expect(softEighteen.value).toBe(18);
    expect(engine.shouldDealerHit(softEighteen)).toBe(false); // Must stand on 18
  });

  it('should test the exact scenario user reported', () => {
    // User stands with some value, dealer should stop at 17+ regardless
    const playerHand = engine.createHand([
      { suit: 'hearts' as const, rank: 'K' as const, value: 10 },
      { suit: 'spades' as const, rank: '10' as const, value: 10 }
    ]);
    expect(playerHand.value).toBe(20);

    // Dealer scenarios that should all result in standing
    const dealerScenarios = [
      { value: 17, shouldHit: false },
      { value: 18, shouldHit: false },
      { value: 19, shouldHit: false },
      { value: 20, shouldHit: false },
      { value: 21, shouldHit: false }
    ];

    dealerScenarios.forEach(scenario => {
      const dealerHand = engine.createHand([
        { suit: 'diamonds' as const, rank: '10' as const, value: 10 },
        { suit: 'clubs' as const, rank: (scenario.value - 10).toString() as '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A', value: scenario.value - 10 }
      ]);
      
      expect(dealerHand.value).toBe(scenario.value);
      expect(engine.shouldDealerHit(dealerHand)).toBe(scenario.shouldHit);
      
      // Verify winner determination
      const result = engine.determineWinner(playerHand, dealerHand);
      if (scenario.value < 20) {
        expect(result).toBe('player-wins');
      } else if (scenario.value === 20) {
        expect(result).toBe('push');
      } else {
        expect(result).toBe('dealer-wins');
      }
    });
  });
});