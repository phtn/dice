# Blackjack Game Engine Tests

This directory contains comprehensive tests for the blackjack game engine and context.

## Test Files

### `game-engine.test.ts`
Tests the core game engine functionality:
- **Deck Management**: Card dealing, shuffling, multi-deck support
- **Hand Calculation**: Value calculation, soft/hard hands, blackjack detection
- **Dealer Logic**: Hit/stand rules, soft 17 handling
- **Winner Determination**: All possible game outcomes
- **Split Functionality**: Pair detection and splitting logic
- **Card Display**: Formatting and display utilities

### `blackjack-ctx.test.tsx`
Tests the React context and game state management:
- **State Management**: Game state transitions, betting, hand management
- **User Actions**: Hit, stand, split, double down functionality
- **Game Flow**: Complete game cycles from betting to resolution
- **Statistics**: Game stats tracking and updates
- **Error Handling**: Context provider requirements

### `types.test.ts`
Tests TypeScript type definitions:
- **Type Safety**: Ensures all types accept valid values
- **Interface Compliance**: Verifies type structure requirements
- **Type Relationships**: Tests type extensions and relationships

## Running Tests

### Prerequisites
First, install the test dependencies:
```bash
chmod +x add-test-deps.sh
./add-test-deps.sh
```

### Run All Tests
```bash
bun test
```

### Run Specific Test File
```bash
bun test game-engine.test.ts
bun test blackjack-ctx.test.tsx
bun test types.test.ts
```

### Run Tests in Watch Mode
```bash
bun test --watch
```

### Generate Coverage Report
```bash
bun test --coverage
```

## Test Coverage

The tests aim to cover:
- ✅ **Deck Management**: 100% coverage of card dealing and shuffling
- ✅ **Hand Calculation**: All possible hand combinations and edge cases
- ✅ **Game Rules**: Complete blackjack rule implementation
- ✅ **Split Logic**: All splitting scenarios and restrictions
- ✅ **Dealer AI**: Proper dealer behavior according to casino rules
- ✅ **State Management**: React context state transitions
- ✅ **User Interactions**: All player actions and their effects
- ✅ **Error Handling**: Edge cases and error conditions

## Key Test Scenarios

### Game Engine Tests
1. **Basic Hand Values**: Simple card combinations
2. **Ace Handling**: Soft/hard ace calculations in various scenarios
3. **Blackjack Detection**: Natural 21 with two cards
4. **Bust Detection**: Hands over 21
5. **Dealer Rules**: Hit on 16, stand on 17, hit soft 17
6. **Split Validation**: Pairs vs non-pairs, card count restrictions
7. **Winner Logic**: All possible game outcomes and edge cases

### Context Tests
1. **Game Initialization**: Proper default state setup
2. **Betting Flow**: Bet placement and validation
3. **Game Progression**: State transitions through complete games
4. **Action Validation**: Button enabling/disabling based on game state
5. **Statistics Tracking**: Accurate game result recording
6. **Auto-Reset**: Automatic return to betting phase

### Integration Scenarios
1. **Complete Game Cycles**: From bet to resolution
2. **Multi-Hand Games**: Split hand management
3. **Edge Cases**: Blackjacks, busts, pushes
4. **Error Recovery**: Invalid actions and state corrections

## Mock Strategy

The tests use minimal mocking:
- **Account Context**: Mocked to provide consistent balance
- **Random Elements**: Game engine uses deterministic card dealing for testing
- **Timers**: Fast-forwarded for dealer play sequences

## Assertions

Tests verify:
- **State Correctness**: Game state matches expected values
- **Rule Compliance**: All blackjack rules properly implemented
- **UI Behavior**: Buttons and displays respond correctly
- **Data Integrity**: Statistics and counts remain accurate
- **Performance**: No memory leaks or infinite loops

## Future Test Enhancements

Potential additions:
- **Performance Tests**: Large deck operations
- **Stress Tests**: Many consecutive games
- **Edge Case Discovery**: Fuzzing with random inputs
- **Visual Regression**: UI component rendering tests
- **Accessibility Tests**: Screen reader and keyboard navigation