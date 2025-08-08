import {
  getAdvancedStrategy,
  getBaseStrategy,
} from "@/components/blackjack/strategy-guide";
import { Button } from "@/components/ui/button";
import { Card as CardComp, CardContent, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx/blackjack-ctx";
import type { Card, CardRank, CardSuit, Hand } from "@/ctx/blackjack-ctx/types";
import { useStudioCtx } from "@/ctx/studio";
import { CustomCard, deckOfCards } from "@/ctx/studio/studio-ctx";
import { Icon, IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PlayerHand {
  id: number;
  firstCard: CustomCard | undefined;
  secondCard: CustomCard | undefined;
}

// Convert CustomCard to Card type for strategy functions
const convertCustomCardToCard = (customCard: CustomCard): Card => {
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

// Create a Hand object from two cards
const createHandFromCards = (
  firstCard: CustomCard | undefined,
  secondCard: CustomCard | undefined,
): Hand | null => {
  if (!firstCard || !secondCard) return null;

  const cards = [
    convertCustomCardToCard(firstCard),
    convertCustomCardToCard(secondCard),
  ];

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
  hand: PlayerHand;
  dealerUpCard: CustomCard | undefined;
  getRemainingCards: () => Record<string, number>;
  onUpdateHand: (
    handId: number,
    updates: Partial<Omit<PlayerHand, "id">>,
  ) => void;
  onRemoveHand: (handId: number) => void;
}

const PlayerRow = ({
  hand,
  dealerUpCard,
  getRemainingCards,
  onUpdateHand,
  onRemoveHand,
}: PlayerRowProps) => {
  const handleFirstCardSelect = useCallback(
    (card: CustomCard) => () => {
      onUpdateHand(hand.id, { firstCard: card });
    },
    [hand.id, onUpdateHand],
  );

  const handleSecondCardSelect = useCallback(
    (card: CustomCard) => () => {
      onUpdateHand(hand.id, { secondCard: card });
    },
    [hand.id, onUpdateHand],
  );

  const handleRemove = useCallback(() => {
    onRemoveHand(hand.id);
  }, [hand.id, onRemoveHand]);

  // Calculate strategies for this hand
  const strategies = useMemo(() => {
    if (!hand.firstCard || !hand.secondCard || !dealerUpCard) {
      return null;
    }

    const playerHand = createHandFromCards(hand.firstCard, hand.secondCard);
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
  }, [hand.firstCard, hand.secondCard, dealerUpCard, getRemainingCards]);

  return (
    <div className="relative grid grid-cols-4 space-x-4 my-4 min-h-1/7 rounded-lg border bg-zinc-700/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-space font-bold tracking-tighter">
            P{hand.id}
          </h2>
          <p className="text-sm text-gray-300 font-sans tracking-tight">
            {strategies?.playerHand
              ? strategies.playerHand.isSoft &&
                strategies.playerHand.lowValue !==
                  strategies.playerHand.highValue
                ? `Value: ${strategies.playerHand.lowValue}/${strategies.playerHand.highValue} (Soft)`
                : `Value: ${strategies.playerHand.value}${strategies.playerHand.isSoft ? " (Soft)" : ""}`
              : `Hand ${hand.id}`}
          </p>
        </div>
        {hand.id > 1 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="absolute top-1 right-1 text-red-300 hover:text-red-300 hover:bg-red-500/10"
          >
            <Icon name="clear" className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger>
            <div className="h-[6.25rem] w-20 flex items-center justify-center border rounded-lg bg-zinc-300/10 hover:bg-zinc-300/20 transition-colors">
              {hand.firstCard ? (
                <Icon
                  name={hand.firstCard.icon}
                  className="h-28 w-24 shrink-0"
                />
              ) : (
                <Icon name="g-card-draw" className="h-16 w-12 shrink-0" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            // align="center"
            side="bottom"
            className="w-full bg-zinc-900/40 border-none backdrop-blur-lg"
          >
            <div className="grid grid-cols-13 gap-1 max-w-md">
              {deckOfCards.map((c) => (
                <CardItem
                  key={c.icon}
                  icon={c.icon}
                  suit={c.suit}
                  fn={handleFirstCardSelect(c)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger>
            <div className="h-[6.25rem] w-20 flex items-center justify-center border rounded-lg bg-zinc-300/10 hover:bg-zinc-300/20 transition-colors">
              {hand.secondCard ? (
                <Icon
                  name={hand.secondCard.icon}
                  className="h-28 w-24 shrink-0"
                />
              ) : (
                <Icon name="g-card-draw" className="h-16 w-12 shrink-0" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full">
            <div className="grid grid-cols-13 gap-1 max-w-md">
              {deckOfCards.map((c) => (
                <CardItem
                  key={c.icon}
                  icon={c.icon}
                  suit={c.suit}
                  fn={handleSecondCardSelect(c)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Strategy Display */}
      {strategies && (
        <div className="col-span-4 mt-4 pt-4 border-t border-zinc-600">
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Strategy */}
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-xs font-bold text-neutral-300 mb-2">
                BASIC STRATEGY
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "px-2 py-1 rounded text-xs font-bold",
                    strategies.baseStrategy.action.includes("HIT")
                      ? "bg-red-500/20 text-red-300"
                      : strategies.baseStrategy.action.includes("STAND")
                        ? "bg-green-500/20 text-green-300"
                        : strategies.baseStrategy.action.includes("DOUBLE")
                          ? "bg-yellow-500/20 text-yellow-300"
                          : strategies.baseStrategy.action.includes("SPLIT")
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-neutral-500/20 text-neutral-300",
                  )}
                >
                  {strategies.baseStrategy.action}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    strategies.baseStrategy.confidence === "high"
                      ? "text-green-400"
                      : strategies.baseStrategy.confidence === "medium"
                        ? "text-yellow-400"
                        : "text-red-400",
                  )}
                >
                  {strategies.baseStrategy.confidence.toUpperCase()}
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                {strategies.baseStrategy.description}
              </div>
            </div>

            {/* Advanced Strategy */}
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-xs font-bold text-neutral-300 mb-2">
                ADVANCED STRATEGY
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "px-2 py-1 rounded text-xs font-bold",
                    strategies.advancedStrategy.action.includes("HIT")
                      ? "bg-red-500/20 text-red-300"
                      : strategies.advancedStrategy.action.includes("STAND")
                        ? "bg-green-500/20 text-green-300"
                        : strategies.advancedStrategy.action.includes("DOUBLE")
                          ? "bg-yellow-500/20 text-yellow-300"
                          : strategies.advancedStrategy.action.includes("SPLIT")
                            ? "bg-blue-500/20 text-blue-300"
                            : strategies.advancedStrategy.action.includes(
                                  "INSURANCE",
                                )
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-neutral-500/20 text-neutral-300",
                  )}
                >
                  {strategies.advancedStrategy.action}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    strategies.advancedStrategy.confidence === "high"
                      ? "text-green-400"
                      : strategies.advancedStrategy.confidence === "medium"
                        ? "text-yellow-400"
                        : "text-red-400",
                  )}
                >
                  {strategies.advancedStrategy.confidence.toUpperCase()}
                </div>
                <div
                  className={cn(
                    "text-xs px-1 py-0.5 rounded",
                    strategies.advancedStrategy.countInfluence === "positive"
                      ? "bg-green-500/20 text-green-300"
                      : strategies.advancedStrategy.countInfluence ===
                          "negative"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-neutral-500/20 text-neutral-300",
                  )}
                >
                  {strategies.advancedStrategy.countInfluence}
                </div>
              </div>
              <div className="text-xs text-neutral-400 mb-1">
                {strategies.advancedStrategy.description}
              </div>
              {strategies.advancedStrategy.deviation && (
                <div className="text-xs text-orange-300 bg-orange-500/10 p-1 rounded">
                  <strong>Deviation:</strong>{" "}
                  {strategies.advancedStrategy.deviation}
                </div>
              )}
            </div>
          </div>

          {/* Hand Summary */}
          <div className="mt-2 text-xs text-neutral-500 bg-zinc-800/20 p-2 rounded">
            <strong>Hand:</strong>{" "}
            {strategies.playerHand.cards
              .map((card) => `${card.rank}${card.suit.charAt(0).toUpperCase()}`)
              .join(", ")}
            (
            {strategies.playerHand.isSoft &&
            strategies.playerHand.lowValue !== strategies.playerHand.highValue
              ? `${strategies.playerHand.lowValue}/${strategies.playerHand.highValue} Soft`
              : `${strategies.playerHand.value} ${strategies.playerHand.isSoft ? "Soft" : "Hard"}`}
            ) vs Dealer {strategies.dealerCard.rank}
          </div>
        </div>
      )}
    </div>
  );
};

export const Studio = () => {
  const { setDealerUpCard, dealerUpCard } = useStudioCtx();
  const blackjackCtx = useBlackjackCtx();

  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([
    { id: 1, firstCard: undefined, secondCard: undefined },
  ]);

  // Track studio cards for engine synchronization
  const [, setStudioCards] = useState<CustomCard[]>([]);

  // Update studio cards and sync with engine whenever selections change
  useEffect(() => {
    const currentCards: CustomCard[] = [];

    if (dealerUpCard) {
      currentCards.push(dealerUpCard);
    }

    playerHands.forEach((hand) => {
      if (hand.firstCard) currentCards.push(hand.firstCard);
      if (hand.secondCard) currentCards.push(hand.secondCard);
    });

    // Only sync if we're in betting state
    if (blackjackCtx.gameState === "betting") {
      // Reset deck first to clear any previous studio cards
      blackjackCtx.shuffleDeck();

      // Deal each studio card to the engine
      currentCards.forEach((customCard) => {
        const engineCard = convertCustomCardToCard(customCard);
        blackjackCtx.dealSpecificCard(engineCard);
      });
    }

    setStudioCards(currentCards);
  }, [dealerUpCard, playerHands, blackjackCtx]);

  // Create a simulated remaining cards calculation based on studio selections
  const getStudioRemainingCards = useCallback(() => {
    // Start with the actual remaining cards from the blackjack engine
    const actualRemaining = blackjackCtx.getRemainingCardsByRank();
    const studioRemaining = { ...actualRemaining };

    // Remove the cards that are "dealt" in the studio
    const allStudioCards: CustomCard[] = [];

    // Add dealer up card if selected
    if (dealerUpCard) {
      allStudioCards.push(dealerUpCard);
    }

    // Add all player cards
    playerHands.forEach((hand) => {
      if (hand.firstCard) allStudioCards.push(hand.firstCard);
      if (hand.secondCard) allStudioCards.push(hand.secondCard);
    });

    // Subtract studio cards from remaining count
    allStudioCards.forEach((customCard) => {
      const rank = customCard.rank;
      if (studioRemaining[rank] > 0) {
        studioRemaining[rank]--;
      }
    });

    return studioRemaining;
  }, [dealerUpCard, playerHands, blackjackCtx]);

  const selectDealerCard = useCallback(
    (item: CustomCard) => () => setDealerUpCard(item),
    [setDealerUpCard],
  );

  const addPlayerHand = useCallback(() => {
    setPlayerHands((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((h) => h.id)) + 1,
        firstCard: undefined,
        secondCard: undefined,
      },
    ]);
  }, []);

  const updatePlayerHand = useCallback(
    (handId: number, updates: Partial<Omit<PlayerHand, "id">>) => {
      setPlayerHands((prev) =>
        prev.map((hand) =>
          hand.id === handId ? { ...hand, ...updates } : hand,
        ),
      );
    },
    [],
  );

  const removePlayerHand = useCallback((handId: number) => {
    setPlayerHands((prev) => prev.filter((hand) => hand.id !== handId));
  }, []);

  const resetStudio = useCallback(() => {
    setDealerUpCard(undefined);
    setPlayerHands([{ id: 1, firstCard: undefined, secondCard: undefined }]);
  }, [setDealerUpCard]);

  const [showGuide, setShowGuide] = useState(false);
  const toggleGuide = useCallback(() => setShowGuide((prev) => !prev), []);

  return (
    <CardComp className="h-[calc(100vh-64px)] portrait:min-h-[calc(100vh-64px)] py-0 lg:col-span-5 bg-poker-dark border-transparent rounded-b-3xl">
      <div className="px-2 flex items-center justify-between md:px-4">
        <CardTitle className="text-sm border border-border/20 rounded-sm p-px font-medium text-neutral-300 tracking-wider">
          <span>STRATEGY STUDIO</span>
        </CardTitle>
        <Button variant="secondary" onClick={resetStudio}>
          Reset Studio
        </Button>
      </div>
      <CardContent className="bg-poker-light border border-white/10 h-full rounded-[1.75rem] overflow-y-auto">
        {/* Dealer Section */}
        <div className="grid grid-cols-4 space-x-4 my-4 min-h-1/7 rounded-lg border bg-zinc-700/5 p-4">
          <div className="">
            <h2 className="text-lg font-space font-bold tracking-tighter">
              DEALER
            </h2>
            <p className="text-sm text-gray-300 font-sans tracking-tight">
              Up Card
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger>
                <div className="h-[6.25rem] w-20 flex items-center justify-center border rounded-lg bg-zinc-300/10 hover:bg-zinc-300/20 transition-colors">
                  {dealerUpCard ? (
                    <Icon
                      name={dealerUpCard.icon}
                      className="h-28 w-24 shrink-0"
                    />
                  ) : (
                    <Icon name="g-card-draw" className="h-28 w-24 shrink-0" />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full">
                <div className="grid grid-cols-13 gap-1 max-w-md">
                  {deckOfCards.map((c) => (
                    <CardItem
                      key={c.icon}
                      icon={c.icon}
                      suit={c.suit}
                      fn={selectDealerCard(c)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="h-[6.25rem] w-28 flex items-center justify-center border border-blue-900 rounded-lg bg-blue-800/60">
              <div className="text-xs text-blue-200 text-center w-[4.5rem]">
                Hidden
                <br />
                Card
              </div>
            </div>
          </div>
        </div>

        {/* Player Hands */}
        {playerHands.map((hand) => (
          <PlayerRow
            key={hand.id}
            hand={hand}
            dealerUpCard={dealerUpCard}
            getRemainingCards={getStudioRemainingCards}
            onUpdateHand={updatePlayerHand}
            onRemoveHand={removePlayerHand}
          />
        ))}

        {/* Add Player Hand Button */}
        <div className="my-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={addPlayerHand}
            className=" hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors"
          >
            <Icon name="add-circle" className="size-5" />
            Add Player Hand
          </Button>
          <Button
            onClick={toggleGuide}
            variant="ghost"
            className="tracking-tighter"
          >
            How to use ?
          </Button>
        </div>

        {/* Studio Instructions */}
        <div
          className={cn("mt-6 p-4 bg-zinc-800 flex-col rounded-lg hidden", {
            flex: showGuide,
          })}
        >
          <h3 className="text-sm font-bold text-neutral-300 mb-2">
            How to Use Strategy Studio:
          </h3>
          <div className="text-xs text-neutral-400 space-y-1">
            <p>• Click on cards to select from the deck</p>
            <p>• Set up dealer up card and player hands</p>
            <p>• Use with Strategy Guide to analyze scenarios</p>
            <p>• Add multiple player hands to test splits</p>
            <p>• Remove hands with the trash icon (except first hand)</p>
            <p>• Reset to clear all selections</p>
          </div>
        </div>
      </CardContent>
    </CardComp>
  );
};

interface CardItemProps {
  suit: CardSuit;
  icon: IconName;
  fn: VoidFunction;
}
const CardItem = ({ fn, icon, suit }: CardItemProps) => {
  return (
    <button
      onClick={fn}
      key={icon}
      className={cn(
        "bg-red-500 w-8 h-10 hover:opacity-80 cursor-pointer rounded-sm flex items-center justify-center transition-colors",
        {
          "bg-zinc-900": suit === "clubs" || suit === "spades",
        },
      )}
    >
      <Icon solid name={icon} className="size-12 text-white shrink-0" />
    </button>
  );
};
