# Bust Card Display Fix

## Problem
When a player clicked "Hit" and busted, the final card that caused the bust was not being displayed. The game would immediately show "Dealer wins" without showing the busting card, making it confusing for the player.

## Root Cause
In the `hit` function, when a player busted, the code immediately executed the next game logic:
```typescript
if (newHand.isBust) {
  // Immediately move to next hand or end game
  setActiveHandIndex(nextPlayableIndex);
  // OR
  processGameEnd();
  // OR  
  dealerPlay();
}
```

This didn't give React time to render the updated `playerHands` state with the busting card before the game state changed.

## Solution
Added a 1-second delay (similar to dealer play) to allow the UI to display the busting card:

```typescript
if (newHand.isBust) {
  // Add delay to show the busting card before proceeding
  setTimeout(() => {
    // Move to next hand or end game logic here
  }, 1000); // 1 second delay to show the busting card
}
```

## User Experience Improvement
### Before Fix:
1. Player clicks "Hit"
2. Card is dealt but not shown
3. Game immediately shows "Dealer wins"
4. Player is confused about what card caused the bust

### After Fix:
1. Player clicks "Hit" 
2. Busting card is displayed for 1 second
3. Player can see exactly what card caused the bust
4. Game then proceeds to show "Dealer wins"

## Consistency
This fix makes the player bust behavior consistent with:
- Dealer play (which has delays between cards)
- Other game transitions (which have visual delays)
- Standard casino blackjack experience (where you see all cards)

## Technical Details
- Uses `setTimeout` with 1000ms delay
- Maintains all existing game logic
- Only affects the timing of when the next action occurs
- Does not change any game rules or outcomes