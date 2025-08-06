# Player Hit Bug Fix

## Problem
When a player clicked "Hit" and reached exactly 21, the game was incorrectly applying dealer rules:
- Player would automatically stop playing (like dealer stops at 17+)
- Game would auto-advance to next hand or dealer play
- Player lost control and couldn't choose to stand or continue

## Root Cause
Two bugs in the hit logic:

### Bug 1: Auto-advance on 21
```typescript
// WRONG - Auto-advances on both bust AND 21
if (newHand.isBust || newHand.value === 21) {
  // Move to next hand or dealer play
}
```

### Bug 2: Excluding 21 from playable hands
```typescript
// WRONG - Excludes hands with exactly 21
if (!hand.isBlackjack && hand.value < 21 && !hand.isBust) {
  return i; // Hand is playable
}
```

## Solution

### Fix 1: Only auto-advance on bust
```typescript
// CORRECT - Only auto-advances on bust
if (newHand.isBust) {
  // Move to next hand or dealer play only when busted
}
```

### Fix 2: Allow 21 to remain playable
```typescript
// CORRECT - Allows hands with 21 to continue playing
if (!hand.isBlackjack && !hand.isBust) {
  return i; // Hand is playable (including 21)
}
```

## Correct Blackjack Behavior

### Player Rules:
- **Can hit on any value < 21**
- **Can hit on exactly 21** (will bust, but it's their choice)
- **Cannot hit when busted** (>21)
- **Cannot hit on blackjack** (automatic win)

### Dealer Rules:
- **Must hit on 16 or less**
- **Must hit on soft 17**
- **Must stand on hard 17+**
- **No choice involved** (automatic)

## Impact
This fix ensures:
- Players maintain full control over their hands
- No automatic game advancement on 21
- Proper distinction between player and dealer rules
- Standard blackjack gameplay experience

## Testing
- ✅ Player can hit with 21 (and bust if they choose)
- ✅ Player only auto-advances on actual bust
- ✅ Blackjack still ends immediately (correct)
- ✅ Dealer rules remain unchanged (correct)