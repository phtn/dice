# Split Winner Bug Analysis

## Potential Issues Identified

### 1. State Timing Issues
The bug might occur when:
- Player splits a hand
- Plays the first split hand (hits/stands)
- Moves to second split hand
- The second hand's winner determination uses stale state

### 2. Active Hand Index Problems
- After splitting, the active hand index might not correctly track which hand is being played
- When transitioning between split hands, the index might be off by one

### 3. Hand Result Assignment
- Results might be assigned to the wrong hands due to array index issues
- The `processGameEnd` function might use outdated hand information

## Specific Scenarios to Test

### Scenario 1: Second Split Hand Gets 21
1. Player splits 8s
2. First hand: 8 + 5 = 13, player stands
3. Second hand: 8 + 3 = 11, player hits and gets 10 = 21
4. Dealer has 20
5. Expected: First hand loses, second hand wins
6. Bug: Second hand might show as losing

### Scenario 2: State Update Timing
1. Player splits
2. Hits on second hand to get exactly 21
3. `processGameEnd()` is called immediately
4. But `playerHands` state might still have old values
5. Winner determination uses wrong hand values

## Potential Fixes

### Fix 1: Pass Current Hands to processGameEnd
- Modify `processGameEnd` to accept current hands as parameter
- Ensure it always uses the most up-to-date hand information

### Fix 2: Fix moveToNextHand State Issues
- Modify `moveToNextHand` to accept current hands
- Prevent stale state from affecting hand transitions

### Fix 3: Ensure Proper Hand Indexing
- Verify that active hand index correctly tracks split hands
- Fix any off-by-one errors in hand transitions

## Testing Strategy
1. Create integration tests that simulate the exact React component flow
2. Test split scenarios with different outcomes
3. Verify that hand results are assigned to correct hands
4. Test timing-sensitive scenarios where state updates matter