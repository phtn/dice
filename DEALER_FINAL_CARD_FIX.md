# Dealer Final Card Bug Fix

## Problem
When a player stands and the dealer draws their final card to reach 21, the game incorrectly shows the player as winning instead of the dealer. This was caused by a timing issue where the dealer's final hand value wasn't being properly used in the winner determination logic.

## Root Cause
The `processGameEnd()` function was using the `dealerHand` from React state, but when called immediately after the dealer draws their final card, the state hadn't been updated yet due to React's asynchronous state updates.

## Solution
Modified the `processGameEnd()` function to accept an optional `currentDealerHand` parameter, allowing the dealer play logic to pass the most up-to-date dealer hand directly.

### Changes Made:

1. **Updated processGameEnd signature:**
```typescript
const processGameEnd = useCallback((currentDealerHand?: Hand) => {
  const dealerHandToUse = currentDealerHand || dealerHand;
  // ... rest of function uses dealerHandToUse
```

2. **Updated dealerPlay to pass current hand:**
```typescript
// Dealer is done (17 or higher), process all hands
processGameEnd(currentDealerHand);
```

3. **Updated immediate blackjack case:**
```typescript
if (newPlayerHand.isBlackjack || newDealerHand.isBlackjack) {
  processGameEnd(newDealerHand);
}
```

## Test Scenario
- Player stands with 20
- Dealer has 16, draws a 5 to make 21
- Game should correctly show dealer wins
- Previously: Showed player wins (using old dealer hand value)
- Now: Shows dealer wins (using current dealer hand value)

## Impact
This fix ensures that:
- Dealer's final card is always counted in winner determination
- Game results are accurate regardless of React state update timing
- All existing functionality remains intact (tests pass)
- Game history saves the correct dealer hand value

The fix is backward compatible and doesn't affect any other game logic.