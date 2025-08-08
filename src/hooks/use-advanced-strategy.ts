import { useMemo } from 'react';
import { getAdvancedStrategy, getBaseStrategy } from '@/components/blackjack/strategy-guide';
import type { Card, Hand } from '@/ctx/blackjack-ctx/types';

interface UseAdvancedStrategyProps {
  playerHand?: Hand;
  dealerUpCard?: Card;
  remainingCardsByRank?: Record<string, number>;
  canDoubleDown?: boolean;
  canSplit?: boolean;
}

export const useAdvancedStrategy = ({
  playerHand,
  dealerUpCard,
  remainingCardsByRank,
  canDoubleDown = true,
  canSplit = false
}: UseAdvancedStrategyProps) => {
  const strategy = useMemo(() => {
    if (!playerHand || !dealerUpCard) {
      return null;
    }

    // If we have remaining cards data, use advanced strategy
    if (remainingCardsByRank) {
      console.log('Using advanced strategy with remaining cards:', remainingCardsByRank);
      return getAdvancedStrategy(
        playerHand,
        dealerUpCard,
        remainingCardsByRank,
        canDoubleDown,
        canSplit
      );
    }

    // Otherwise fall back to basic strategy
    console.log('Falling back to basic strategy - no remaining cards data');
    return getBaseStrategy(playerHand, dealerUpCard, canDoubleDown, canSplit);
  }, [playerHand, dealerUpCard, remainingCardsByRank, canDoubleDown, canSplit]);

  const trueCount = useMemo(() => {
    if (!remainingCardsByRank) return 0;

    const totalRemaining = Object.values(remainingCardsByRank).reduce((sum, count) => sum + count, 0);
    const decksRemaining = totalRemaining / 52;
    
    const lowCards = (remainingCardsByRank['2'] || 0) + (remainingCardsByRank['3'] || 0) + 
                     (remainingCardsByRank['4'] || 0) + (remainingCardsByRank['5'] || 0) + 
                     (remainingCardsByRank['6'] || 0);
    const highCards = (remainingCardsByRank['10'] || 0) + (remainingCardsByRank['J'] || 0) + 
                      (remainingCardsByRank['Q'] || 0) + (remainingCardsByRank['K'] || 0) + 
                      (remainingCardsByRank['A'] || 0);
    
    const expectedLowCards = decksRemaining * 20;
    const expectedHighCards = decksRemaining * 20;
    const runningCount = (highCards - expectedHighCards) - (lowCards - expectedLowCards);
    
    return decksRemaining > 0 ? runningCount / decksRemaining : 0;
  }, [remainingCardsByRank]);

  const deckComposition = useMemo(() => {
    if (!remainingCardsByRank) return null;

    const totalRemaining = Object.values(remainingCardsByRank).reduce((sum, count) => sum + count, 0);
    
    return {
      tenValuePercentage: (Object.entries(remainingCardsByRank)
        .filter(([rank]) => ['10', 'J', 'Q', 'K'].includes(rank))
        .reduce((sum, [, count]) => sum + count, 0) / totalRemaining) * 100,
      
      acePercentage: ((remainingCardsByRank['A'] || 0) / totalRemaining) * 100,
      
      lowCardPercentage: (Object.entries(remainingCardsByRank)
        .filter(([rank]) => ['2', '3', '4', '5', '6'].includes(rank))
        .reduce((sum, [, count]) => sum + count, 0) / totalRemaining) * 100,
      
      totalRemaining,
      decksRemaining: totalRemaining / 52
    };
  }, [remainingCardsByRank]);

  const isCountFavorable = trueCount >= 2;
  const isCountUnfavorable = trueCount <= -2;
  const shouldTakeInsurance = trueCount >= 3 && dealerUpCard?.rank === 'A';

  return {
    strategy,
    trueCount,
    deckComposition,
    isCountFavorable,
    isCountUnfavorable,
    shouldTakeInsurance,
    hasAdvancedData: !!remainingCardsByRank
  };
};