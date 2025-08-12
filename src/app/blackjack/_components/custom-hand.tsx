import {
  getBaseStrategy,
  getAdvancedStrategy,
  BaseStrategyAction,
  BaseStrategyConfidence,
  AdvancedStrategyAction,
  AdvancedStrategyConfidence,
} from "@/components/blackjack/strategy-guide";
import { Button } from "@/components/ui/button";
import { Hand, Card } from "@/ctx/blackjack-ctx";
import { CardRank } from "@/ctx/blackjack-ctx/types";
import { CustomCard } from "@/ctx/studio/studio-ctx";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useState, useCallback, useMemo } from "react";
import { PlayingCard } from "./playing-card";
import { Icon } from "@/lib/icons";
import { DeckContent } from "./studio";

export interface CustomHand {
  id: number;
  firstCard: CustomCard | undefined;
  secondCard: CustomCard | undefined;
  thirdCard?: CustomCard | undefined;
  fourthCard?: CustomCard | undefined;
  fifthCard?: CustomCard | undefined;
  sixthCard?: CustomCard | undefined;
}

// Convert CustomCard to Card type for strategy functions
export const convertCustomCardToCard = (customCard: CustomCard): Card => {
  // Use the existing properties from CustomCard instead of parsing the icon
  const rank = customCard.rank;
  const suit = customCard.suit as "hearts" | "diamonds" | "clubs" | "spades";

  // Calculate proper blackjack value
  let value: number;
  if (rank === "A") {
    value = 11; // Ace high initially (will be adjusted in hand calculation)
  } else if (["J", "Q", "K"].includes(rank)) {
    value = 10;
  } else {
    value = parseInt(rank);
  }

  return {
    rank: rank as CardRank,
    suit,
    value,
  };
};

// Create a Hand object from multiple cards
export const createHandFromCards = (
  ...customCards: (CustomCard | undefined)[]
): Hand | null => {
  const validCards = customCards.filter(
    (card): card is CustomCard => card !== undefined,
  );
  if (validCards.length < 2) return null;

  const cards = validCards.map(convertCustomCardToCard);

  // Count aces and calculate base value (aces as 1)
  let aceCount = 0;
  let baseValue = 0;

  cards.forEach((card) => {
    if (card.rank === "A") {
      aceCount++;
      baseValue += 1; // Count ace as 1 initially
    } else {
      baseValue += card.value;
    }
  });

  // Calculate low value (all aces as 1)
  const lowValue = baseValue;

  // Calculate high value (one ace as 11 if possible)
  let highValue = baseValue;
  let isSoft = false;

  if (aceCount > 0 && baseValue + 10 <= 21) {
    highValue = baseValue + 10; // One ace as 11
    isSoft = true;
  }

  // The actual hand value is the high value if it doesn't bust, otherwise low value
  const value = highValue <= 21 ? highValue : lowValue;
  const isBust = value > 21;
  const isBlackjack = value === 21 && cards.length === 2;

  return {
    cards,
    value: isSoft ? highValue : value,
    lowValue,
    highValue,
    isBlackjack,
    isBust,
    isSoft,
  };
};

interface PlayerRowProps {
  hand: CustomHand;
  dealerUpCard: CustomCard | undefined;
  getRemainingCards: () => Record<string, number>;
  onUpdateHand: (
    handId: number,
    updates: Partial<Omit<CustomHand, "id">>,
  ) => void;
  onRemoveHand: (handId: number) => void;
}

export const PlayerCustomHand = ({
  hand,
  dealerUpCard,
  getRemainingCards,
  onUpdateHand,
  onRemoveHand,
}: PlayerRowProps) => {
  const [showFirstDeck, setShowFirstDeck] = useState(false);
  const [showSecondDeck, setShowSecondDeck] = useState(false);
  const handleFirstCardSelect = useCallback(
    (card: CustomCard) => {
      onUpdateHand(hand.id, { firstCard: card });
      setShowFirstDeck((prev) => !prev);
    },
    [hand.id, onUpdateHand, setShowFirstDeck],
  );

  const handleSecondCardSelect = useCallback(
    (card: CustomCard) => {
      onUpdateHand(hand.id, { secondCard: card });
      setShowSecondDeck((prev) => !prev);
    },
    [hand.id, onUpdateHand, setShowSecondDeck],
  );

  // Get all cards in order for this hand
  const getAllHandCards = useCallback(() => {
    return [
      hand.firstCard,
      hand.secondCard,
      hand.thirdCard,
      hand.fourthCard,
      hand.fifthCard,
      hand.sixthCard,
    ].filter((card): card is CustomCard => card !== undefined);
  }, [hand]);

  // Calculate current hand value
  const currentHandValue = useMemo(() => {
    const cards = getAllHandCards();
    if (cards.length < 2) return null;
    return createHandFromCards(...cards);
  }, [getAllHandCards]);

  // Check if we can add more cards (not busted and not 21)
  const canAddMoreCards = useMemo(() => {
    if (!currentHandValue) return true;
    return currentHandValue.value < 21;
  }, [currentHandValue]);

  // Get the next available card slot
  const getNextCardSlot = useCallback(() => {
    if (!hand.thirdCard) return "thirdCard";
    if (!hand.fourthCard) return "fourthCard";
    if (!hand.fifthCard) return "fifthCard";
    if (!hand.sixthCard) return "sixthCard";
    return null;
  }, [hand]);

  // Add a card to the next available slot
  const addCard = useCallback(
    (card: CustomCard) => {
      const nextSlot = getNextCardSlot();
      if (nextSlot && canAddMoreCards) {
        onUpdateHand(hand.id, { [nextSlot]: card });
      }
    },
    [getNextCardSlot, canAddMoreCards, onUpdateHand, hand.id],
  );

  // Remove the last card
  const removeLastCard = useCallback(() => {
    if (hand.sixthCard) {
      onUpdateHand(hand.id, { sixthCard: undefined });
    } else if (hand.fifthCard) {
      onUpdateHand(hand.id, { fifthCard: undefined });
    } else if (hand.fourthCard) {
      onUpdateHand(hand.id, { fourthCard: undefined });
    } else if (hand.thirdCard) {
      onUpdateHand(hand.id, { thirdCard: undefined });
    }
  }, [hand, onUpdateHand]);

  const handleRemove = useCallback(() => {
    onRemoveHand(hand.id);
  }, [hand.id, onRemoveHand]);

  // Calculate strategies for this hand
  const strategies = useMemo(() => {
    if (!hand.firstCard || !hand.secondCard || !dealerUpCard) {
      return null;
    }

    const allCards = getAllHandCards();
    const playerHand = createHandFromCards(...allCards);
    const dealerCard = convertCustomCardToCard(dealerUpCard);

    if (!playerHand) return null;

    const baseStrategy = getBaseStrategy(playerHand, dealerCard, true, true);

    // For advanced strategy, we need remaining cards data from studio
    const remainingCardsByRank = getRemainingCards();
    const advancedStrategy = getAdvancedStrategy(
      playerHand,
      dealerCard,
      remainingCardsByRank,
      true,
      true,
    );

    return {
      playerHand,
      dealerCard,
      baseStrategy,
      advancedStrategy,
    };
  }, [getAllHandCards, dealerUpCard, getRemainingCards, hand]);

  return (
    <div className="col-span-6 p-1 gap-1 flex rounded-lg bg-zinc-800/10 relative">
      {hand.id > 1 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          className="absolute z-100 top-0 px-1.5 h-6 rounded-lg right-0 text-red-100/50 hover:text-red-100 hover:bg-zinc-800/15"
        >
          <Icon name="clear" className="w-4 h-4" />
        </Button>
      )}
      <div className="flex min-w-40 items-start">
        <div className="space-y-1 w-full">
          <CustomHandHeader id={hand.id} handValue={currentHandValue} />

          {strategies && (
            <div className="space-y-1">
              <div className="flex items-center px-1 py-1 rounded-sm gap-1 bg-zinc-800/80">
                <span className="text-xs text-neutral-300">Basic</span>
                <BaseStrategyAction strategy={strategies.baseStrategy} />
                <BaseStrategyConfidence strategy={strategies.baseStrategy} />
              </div>
              <div className="flex items-center px-1 py-1 rounded-sm gap-1 bg-zinc-800/80">
                <span className="text-xs text-indigo-300">Plus+</span>
                <AdvancedStrategyAction
                  strategy={strategies.advancedStrategy}
                />
                <AdvancedStrategyConfidence
                  strategy={strategies.advancedStrategy}
                />
              </div>
            </div>
          )}

          {/* Debug info - remove this after testing */}
          {!strategies && hand.firstCard && hand.secondCard && dealerUpCard && (
            <div className="text-xs text-red-400">
              Strategy calculation failed
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col px-2 space-y-2">
        {/* Cards Display */}
        <div className="flex items-center">
          {/* First Card */}
          <Popover open={showFirstDeck} onOpenChange={setShowFirstDeck}>
            <PopoverTrigger>
              <div className="h-20 w-14 flex items-center justify-center cursor-pointer flex-shrink-0 rounded-sm bg-zinc-200/20 hover:bg-zinc-200/40 hover:border-zinc-200/50 transition-all duration-300 z-10">
                {hand.firstCard ? (
                  <PlayingCard
                    card={hand.firstCard}
                    className="h-20 w-14 p-1 rounded-[3px] hover:bg-zinc-200 hover:border-zinc-400/30 border-zinc-300/50 border-[0.33px]"
                  />
                ) : (
                  <Icon name="g-card-deal" className="h-14 w-10 shrink-0" />
                )}
              </div>
            </PopoverTrigger>
            <DeckContent selectFn={handleFirstCardSelect} />
          </Popover>

          {/* Second Card */}
          <Popover open={showSecondDeck} onOpenChange={setShowSecondDeck}>
            <PopoverTrigger>
              <div
                className={cn(
                  "h-20 w-14 flex-shrink-0 flex items-center justify-center rounded-sm bg-zinc-200/20 hover:bg-zinc-400 hover:border-zinc-400/30 z-20",
                  { "-ml-7": hand.thirdCard, "ml-2": !hand.thirdCard },
                )}
              >
                {hand.secondCard ? (
                  <PlayingCard
                    card={hand.secondCard}
                    className="h-20 w-14 p-1 rounded-[3px] hover:bg-zinc-200 hover:border-zinc-400/30 border-zinc-300/50 border-[0.33px]"
                  />
                ) : (
                  <Icon name="g-card-deal" className="h-14 w-10 shrink-0" />
                )}
              </div>
            </PopoverTrigger>
            <DeckContent selectFn={handleSecondCardSelect} />
          </Popover>

          {/* Additional Cards */}
          {[
            hand.thirdCard,
            hand.fourthCard,
            hand.fifthCard,
            hand.sixthCard,
          ].map((card, index) => {
            const cardSlots = [
              "thirdCard",
              "fourthCard",
              "fifthCard",
              "sixthCard",
            ];
            const currentSlot = cardSlots[index];
            const isNextAvailableSlot = getNextCardSlot() === currentSlot;

            return (
              <div
                key={index}
                className={cn(
                  "relative h-20 w-14 flex-shrink-0 flex items-center justify-center rounded-sm transition-all duration-300",
                  {
                    "-ml-6": card, // Only overlap when there's an actual card
                    "ml-2": !card && isNextAvailableSlot, // Normal spacing for add button
                  },
                )}
                style={{ zIndex: 20 + index }}
              >
                {card ? (
                  <div className="relative group/card">
                    <PlayingCard
                      card={card}
                      className="h-20 w-14 p-1 rounded-[3px] border-transparent border-[0.33px]"
                    />
                    {hand.firstCard &&
                      hand.secondCard &&
                      getAllHandCards().length > 2 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={removeLastCard}
                          className="absolute z-100 -top-2 -right-2 opacity-80 group-hover/card:opacity-100 size-4 flex items-center justify-center rounded-full aspect-square bg-zinc-800 text-red-100"
                        >
                          <Icon name="clear" className="size-3" />
                        </Button>
                      )}
                  </div>
                ) : isNextAvailableSlot &&
                  hand.firstCard &&
                  hand.secondCard &&
                  canAddMoreCards ? (
                  <Popover>
                    <PopoverTrigger className="cursor-pointer">
                      <div className="h-20 w-14 flex-shrink-0 flex items-center justify-center border-[0.5px] border-emerald-300/60 hover:border-emerald-300 rounded-sm bg-emerald-300/30 group">
                        <Icon
                          name="add"
                          className="h-8 w-4 shrink-0 group-hover:text-emerald-50"
                        />
                      </div>
                    </PopoverTrigger>
                    <DeckContent selectFn={addCard} />
                  </Popover>
                ) : null}
              </div>
            );
          })}
          <div className="hidden text-xs text-neutral-400">
            {currentHandValue?.isBust
              ? "BUSTED"
              : currentHandValue?.value === 21
                ? "21"
                : `${getAllHandCards().length} cards`}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CustomHandHeaderProps {
  id: number;
  handValue: Hand | null;
}

const CustomHandHeader = ({ id, handValue }: CustomHandHeaderProps) => {
  const getHandDisplayValue = () => {
    if (!handValue) return `H${id}`;

    if (handValue.isSoft && handValue.lowValue !== handValue.highValue) {
      return `${handValue.lowValue}/${handValue.highValue}`;
    }

    if (handValue.value === 21) {
      return `${handValue.value} 21`;
    }

    return handValue.value.toString();
  };

  const getValueTextColor = () => {
    if (handValue?.isBust) return "text-red-100";
    if (handValue?.value === 21) return "text-orange-300";
    return "text-emerald-200";
  };

  return (
    <div className="text-base px-1 font-sans flex font-bold text-white rounded-sm bg-zinc-800/50 tracking-tighter">
      <span className="font-normal">P</span>
      <span className="font-bold font-sans text-orange-300">{id}</span>
      <span className="font-thin px-1">/</span>
      <span className={cn("flex items-center gap-1", getValueTextColor())}>
        {handValue?.isBust && <Icon name="bust" className="size-4" />}
        {getHandDisplayValue()}
      </span>
    </div>
  );
};
