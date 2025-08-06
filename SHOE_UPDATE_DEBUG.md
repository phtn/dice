# Shoe Component Update Issue - Debug Guide

## Problem
The shoe component stops updating when cards are dealt, showing stale card counts and progress bar.

## Root Cause
The issue occurs because:

1. **Engine Internal State**: The BlackjackEngine tracks cards internally (`this.deck`, `this.usedCards`)
2. **React State Disconnect**: React doesn't know when engine internal state changes
3. **Missing Dependencies**: `useMemo` and `useCallback` hooks need React state dependencies to trigger re-renders

## Solution Applied
Added React state dependencies to card counting hooks:

```typescript
// BEFORE (broken)
const remainingCards = useMemo(() => engine.getRemainingCards(), [engine]);
const usedCards = useMemo(() => engine.getUsedCards(), [engine]);

// AFTER (working)
const remainingCards = useMemo(() => engine.getRemainingCards(), [engine, playerHands, dealerHand]);
const usedCards = useMemo(() => engine.getUsedCards(), [engine, playerHands, dealerHand]);
```

## Why This Works
- **Cards are dealt** → `playerHands` and `dealerHand` React state changes
- **Dependencies trigger** → `useMemo` recalculates values
- **Engine methods called** → Returns current internal state
- **Components re-render** → Shoe shows updated values

## Debug Steps
If the issue persists:

1. **Check Console**: Look for any errors in browser console
2. **Verify Engine State**: Add temporary logging:
   ```typescript
   const remainingCards = useMemo(() => {
     const count = engine.getRemainingCards();
     console.log('Remaining cards:', count);
     return count;
   }, [engine, playerHands, dealerHand]);
   ```

3. **Check Dependencies**: Ensure all card counting hooks have proper dependencies
4. **Test Card Dealing**: Start a game and watch console/shoe component

## Expected Behavior
- **Start game**: Shoe shows 52 cards remaining (1 deck)
- **Deal 4 cards**: Shoe shows 48 cards remaining
- **Progress bar**: Updates to show ~7.7% used
- **Card counts**: Individual rank counts decrease

## Files Affected
- `src/ctx/blackjack-ctx/blackjack-ctx.tsx` - Added dependencies
- `src/app/blackjack/_components/shoe-card.tsx` - Should now update properly