# Shoe Card Real-time Update Fix

## Problem
The shoe-card component was not updating in real-time as cards were dealt:
- Progress bar stopped working
- Card counts by rank weren't updating
- Remaining/used card counts were stale

## Root Cause
During previous optimizations, I incorrectly removed dependencies from the `useMemo` and `useCallback` hooks that calculate card counting values:

```typescript
// WRONG - Missing dependencies
const remainingCards = useMemo(() => engine.getRemainingCards(), [engine]);
const usedCards = useMemo(() => engine.getUsedCards(), [engine]);
const getRemainingCardsByRank = useCallback(() => engine.getRemainingCardsByRank(), [engine]);
```

### Why This Broke Updates:
1. **Cards are dealt** → `playerHands` and `dealerHand` state changes
2. **useMemo doesn't re-run** → Because it only depends on `engine` (which doesn't change)
3. **Shoe component gets stale values** → Shows old card counts
4. **Progress bar doesn't update** → Based on stale `usedCards`/`totalCards`

## Solution
Restored the necessary dependencies so these values update when cards are dealt:

```typescript
// CORRECT - Includes all necessary dependencies
const remainingCards = useMemo(() => engine.getRemainingCards(), [engine, playerHands, dealerHand]);
const totalCards = useMemo(() => engine.getTotalCards(), [engine, deckCount]);
const usedCards = useMemo(() => engine.getUsedCards(), [engine, playerHands, dealerHand]);
const getRemainingCardsByRank = useCallback(() => engine.getRemainingCardsByRank(), [engine, playerHands, dealerHand]);
const getUsedCardsByRank = useCallback(() => engine.getUsedCardsByRank(), [engine, playerHands, dealerHand]);
```

## Dependencies Explained

### `playerHands` and `dealerHand`:
- **Why needed**: Card counting functions need to know which cards have been dealt
- **When they change**: Every time a card is dealt to player or dealer
- **Effect**: Triggers recalculation of remaining/used cards

### `deckCount`:
- **Why needed**: Total cards depends on number of decks
- **When it changes**: When player changes deck count setting
- **Effect**: Updates total available cards

### `engine`:
- **Why needed**: Contains the core logic for card counting
- **When it changes**: Rarely (only on deck shuffle/reset)
- **Effect**: Ensures we're using the current engine instance

## Shoe Card Components Affected

### Real-time Updates Now Work For:
1. **Progress Bar** - Shows correct percentage of cards used
2. **Total/Remaining/Used Cards** - Updates as cards are dealt
3. **Card Counts by Rank** - Shows accurate remaining cards per rank (A, 2-6, 7-9, 10-K)
4. **Color Coding** - Cards change color as they become scarce
5. **Penetration Warning** - Shows when deck is running low

## Performance Considerations
- These calculations are lightweight (just counting cards)
- `useMemo` prevents unnecessary recalculations when other state changes
- Only recalculates when cards are actually dealt or deck settings change
- No performance impact on gameplay

## Testing
To verify the fix:
1. Start a game and watch the shoe card
2. Deal cards (hit/stand) and observe:
   - Progress bar should advance
   - Remaining cards should decrease
   - Used cards should increase
   - Individual card counts should update
   - Colors should change as cards become scarce