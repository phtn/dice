#!/usr/bin/env node

/**
 * Simple test runner for our blackjack game engine
 * This runs the tests without requiring complex Jest configuration
 */

const { BlackjackEngine } = require('./src/ctx/blackjack-ctx/game-engine.ts');

// Simple test framework
let testCount = 0;
let passCount = 0;
let failCount = 0;

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

function test(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failCount++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value, but got ${actual}`);
      }
    },
    toMatch: (pattern) => {
      if (!pattern.test(actual)) {
        throw new Error(`Expected ${actual} to match ${pattern}`);
      }
    },
    toThrow: (expectedMessage) => {
      try {
        actual();
        throw new Error(`Expected function to throw, but it didn't`);
      } catch (error) {
        if (expectedMessage && !error.message.includes(expectedMessage)) {
          throw new Error(`Expected error message to contain "${expectedMessage}", but got "${error.message}"`);
        }
      }
    }
  };
}

function beforeEach(fn) {
  // Simple implementation - just call the function
  fn();
}

// Run the basic tests
console.log('🎲 Running Blackjack Game Engine Tests\n');

// Test 1: Basic initialization
describe('BlackjackEngine - Initialization', () => {
  let engine;
  
  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should initialize with 52 cards', () => {
    expect(engine.getTotalCards()).toBe(52);
    expect(engine.getRemainingCards()).toBe(52);
    expect(engine.getUsedCards()).toBe(0);
  });

  test('should deal cards correctly', () => {
    const card = engine.dealCard();
    expect(card).toBeTruthy();
    expect(engine.getRemainingCards()).toBe(51);
    expect(engine.getUsedCards()).toBe(1);
  });
});

// Test 2: Hand calculations
describe('BlackjackEngine - Hand Calculations', () => {
  let engine;
  
  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should calculate simple hand values', () => {
    const cards = [
      { suit: 'hearts', rank: '7', value: 7 },
      { suit: 'spades', rank: '5', value: 5 }
    ];
    
    const hand = engine.createHand(cards);
    expect(hand.value).toBe(12);
    expect(hand.isSoft).toBe(false);
    expect(hand.isBlackjack).toBe(false);
    expect(hand.isBust).toBe(false);
  });

  test('should detect blackjack', () => {
    const cards = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: 'K', value: 10 }
    ];
    
    const hand = engine.createHand(cards);
    expect(hand.value).toBe(21);
    expect(hand.isBlackjack).toBe(true);
    expect(hand.isSoft).toBe(true);
  });

  test('should detect bust', () => {
    const cards = [
      { suit: 'hearts', rank: 'K', value: 10 },
      { suit: 'spades', rank: 'Q', value: 10 },
      { suit: 'clubs', rank: '5', value: 5 }
    ];
    
    const hand = engine.createHand(cards);
    expect(hand.value).toBe(25);
    expect(hand.isBust).toBe(true);
  });
});

// Test 3: Dealer rules
describe('BlackjackEngine - Dealer Rules', () => {
  let engine;
  
  beforeEach(() => {
    engine = new BlackjackEngine(1);
  });

  test('should hit on 16', () => {
    const cards = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '6', value: 6 }
    ];
    const hand = engine.createHand(cards);
    expect(engine.shouldDealerHit(hand)).toBe(true);
  });

  test('should stand on hard 17', () => {
    const cards = [
      { suit: 'hearts', rank: '10', value: 10 },
      { suit: 'spades', rank: '7', value: 7 }
    ];
    const hand = engine.createHand(cards);
    expect(engine.shouldDealerHit(hand)).toBe(false);
  });

  test('should hit on soft 17', () => {
    const cards = [
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'spades', rank: '6', value: 6 }
    ];
    const hand = engine.createHand(cards);
    expect(hand.isSoft).toBe(true);
    expect(engine.shouldDealerHit(hand)).toBe(true);
  });
});

// Print results
console.log('\n📊 Test Results:');
console.log(`Total tests: ${testCount}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log(`\n💥 ${failCount} test(s) failed!`);
  process.exit(1);
}