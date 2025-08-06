# Dealer Hitting Bug Investigation

## Expected Behavior
The dealer should follow these rules:
1. **Must hit on 16 or less**
2. **Must stand on hard 17 or higher**
3. **Must hit on soft 17** (Ace + 6)
4. **Must stand on soft 18 or higher**

## Current Implementation Analysis

### Game Engine Logic ✅
The `shouldDealerHit()` function is correct:
```typescript
shouldDealerHit(dealerHand: Hand): boolean {
  if (dealerHand.value < 17) return true;
  if (dealerHand.value === 17 && dealerHand.isSoft) return true; // Dealer hits soft 17
  return false;
}
```

### Dealer Play Logic ✅
The recursive dealer play function is also correct:
```typescript
const playDealerRecursive = (currentDealerHand: Hand) => {
  if (engine.shouldDealerHit(currentDealerHand)) {
    // Draw card and continue
  } else {
    // Stop and process game end
    processGameEnd(currentDealerHand);
  }
};
```

## Possible Issues to Check

### 1. Hand Value Calculation Bug
- Check if `createHand()` is calculating values correctly
- Verify Ace handling (soft vs hard)
- Ensure bust detection works properly

### 2. Visual vs Logic Disconnect
- The dealer might be stopping logically but continuing visually
- Check if `setDealerHand()` updates are causing confusion
- Verify the UI is showing the correct final dealer hand

### 3. Timing Issues
- React state updates are asynchronous
- Multiple `setTimeout` calls might be overlapping
- Check if the recursive function is being called multiple times

### 4. Deck Manipulation
- If cards are being forced/manipulated for testing
- Verify the deck has proper cards available

## Debugging Steps

1. **Add Console Logs**:
```typescript
const playDealerRecursive = (currentDealerHand: Hand) => {
  console.log('Dealer hand:', currentDealerHand.value, 'Should hit:', engine.shouldDealerHit(currentDealerHand));
  
  if (engine.shouldDealerHit(currentDealerHand)) {
    // ... draw card
  } else {
    console.log('Dealer stops at:', currentDealerHand.value);
    processGameEnd(currentDealerHand);
  }
};
```

2. **Check Hand Creation**:
```typescript
const newHand = engine.createHand(newCards);
console.log('New dealer hand:', newHand.value, 'isSoft:', newHand.isSoft, 'isBust:', newHand.isBust);
```

3. **Verify Game State**:
- Check if `gameState` is properly set to 'dealer-turn'
- Ensure no other logic is interfering

## Test Scenario
To reproduce the bug:
1. Player stands with 20
2. Dealer starts with 16 (e.g., 10 + 6)
3. Dealer draws 5 to make 21
4. **Expected**: Dealer stops, shows "Dealer wins"
5. **Reported**: Dealer continues hitting until bust

## Next Steps
If the logic is correct but the behavior is wrong, the issue is likely:
- UI not reflecting the correct game state
- Multiple dealer play functions running simultaneously
- State update timing causing confusion
- Browser/React development mode causing double execution