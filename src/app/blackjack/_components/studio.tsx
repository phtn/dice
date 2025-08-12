import {
  AdvancedStrategy,
  BaseStrategy,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx/blackjack-ctx";
import type { Card, CardRank, Hand } from "@/ctx/blackjack-ctx/types";
import { useStudioCtx } from "@/ctx/studio";
import { CustomCard, deckOfCards } from "@/ctx/studio/studio-ctx";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayingCard } from "./playing-card";

interface PlayerHand {
  id: number;
  firstCard: CustomCard | undefined;
  secondCard: CustomCard | undefined;
}

interface Strategies {
  playerHand: Hand;
  dealerCard: Card;
  baseStrategy: BaseStrategy;
  advancedStrategy: AdvancedStrategy;
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
    <div className="col-span-6 p-1 flex rounded-lg bg-zinc-800/10 relative">
      {hand.id > 1 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          className="absolute top-0 px-1.5 h-6 rounded-lg right-0 text-red-100/50 hover:text-red-100 hover:bg-zinc-800/15"
        >
          <Icon name="clear" className="w-4 h-4" />
        </Button>
      )}
      <div className="flex w-1/2 items-start justify-between">
        <div>
          <p className="text-base px-1 font-sans font-bold text-emerald-200 rounded-sm bg-zinc-800/50 tracking-tighter">
            <span>P</span>
            <span className="font-thin px-1">/</span>
            <span className="font-bold font-sans text-orange-200">
              {hand.id}
            </span>
          </p>
          <p className="text-sm text-gray-300 font-sans tracking-tight">
            {strategies?.playerHand
              ? strategies.playerHand.isSoft &&
                strategies.playerHand.lowValue !==
                  strategies.playerHand.highValue
                ? `Value: ${strategies.playerHand.lowValue}/${strategies.playerHand.highValue} (Soft)`
                : `Value: ${strategies.playerHand.value}${strategies.playerHand.isSoft ? " (Soft)" : ""}`
              : `Hand ${hand.id}`}
          </p>

          {strategies && (
            <div>
              <div className="flex">
                <BaseStrategyAction strategy={strategies.baseStrategy} />
                <BaseStrategyConfidence strategy={strategies.baseStrategy} />
              </div>
              <div className="flex">
                <AdvancedStrategyAction
                  strategy={strategies.advancedStrategy}
                />
                <AdvancedStrategyConfidence
                  strategy={strategies.advancedStrategy}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Popover open={showFirstDeck} onOpenChange={setShowFirstDeck}>
          <PopoverTrigger>
            <div className="h-20 w-14 flex-shrink-0 flex items-center justify-center rounded-sm bg-zinc-200/20 hover:bg-zinc-200/40 hover:border-zinc-200/50 transition-colors">
              {hand.firstCard ? (
                <PlayingCard
                  card={hand.firstCard}
                  className="h-20 w-14 p-1 rounded-[3px]"
                />
              ) : (
                <Icon name="g-card-deal" className="h-14 w-10 shrink-0" />
              )}
            </div>
          </PopoverTrigger>
          <DeckContent selectFn={handleFirstCardSelect} />
        </Popover>
        <Popover open={showSecondDeck} onOpenChange={setShowSecondDeck}>
          <PopoverTrigger>
            <div className="h-20 w-14 flex-shrink-0 flex items-center justify-center rounded-sm bg-zinc-200/20 hover:bg-zinc-200/40 hover:border-zinc-200/50 transition-colors">
              {hand.secondCard ? (
                <PlayingCard
                  card={hand.secondCard}
                  className="h-20 w-14 p-1 rounded-[3px]"
                />
              ) : (
                <Icon name="g-card-deal" className="h-14 w-10 shrink-0" />
              )}
            </div>
          </PopoverTrigger>
          <DeckContent selectFn={handleSecondCardSelect} />
        </Popover>
      </div>
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
    (item: CustomCard) => {
      setDealerUpCard(item);
      setShowDeck(false);
    },
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
  const [showDeck, setShowDeck] = useState(false);
  const toggleGuide = useCallback(() => setShowGuide((prev) => !prev), []);

  return (
    <CardComp className="h-[calc(100vh-64px)] portrait:min-h-[calc(100vh-64px)] py-0 lg:col-span-6 bg-poker-dark border-transparent rounded-b-3xl">
      <div className="px-2 flex items-center justify-between md:px-4">
        <CardTitle className="text-sm border border-border/20 rounded-sm p-px font-medium text-neutral-300 tracking-wider">
          <span>STRATEGY STUDIO</span>
        </CardTitle>

        <Button variant="secondary" onClick={resetStudio}>
          Reset Studio
        </Button>
      </div>
      <Tabs defaultValue="sim" className="w-full h-full">
        <TabsList className="w-full p-0">
          <TabsTrigger value="sim" title="Simulator">
            Simulator
          </TabsTrigger>
          <TabsTrigger value="counter">Card Counter</TabsTrigger>
        </TabsList>
        <CardContent className="bg-poker-light w-full h-full rounded-sm overflow-y-auto">
          <TabsContent value="sim">
            {/* Dealer Section */}
            <div className="grid grid-cols-12 gap-3 my-4 min-h-1/7 rounded-lg bg-zinc-800/5">
              <div className="col-span-2 flex justify-between w-full p-1 rounded-md bg-zinc-800/40">
                <div>
                  <p className="text-base font-sans font-bold tracking-tighter">
                    D<span className="font-thin px-1">/</span>
                    <span className="font-bold font-sans text-emerald-200">
                      1
                    </span>
                  </p>
                  <p className="text-base font-sans font-bold tracking-tighter">
                    21 - WIN
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 -space-x-1 px-1.5 rounded-sm"
                >
                  <Icon name="add" className="size-3" />
                </Button>
              </div>
              <div className="flex items-center space-x-2 p-1">
                <Popover open={showDeck} onOpenChange={setShowDeck}>
                  <PopoverTrigger>
                    <div className="h-20 w-14 flex-shrink-0 flex items-center justify-center rounded-sm bg-zinc-200/20 hover:bg-zinc-200/40 hover:border-zinc-200/50 transition-colors">
                      {dealerUpCard ? (
                        <PlayingCard
                          card={dealerUpCard}
                          className="h-20 w-14 p-1 rounded-[3px]"
                        />
                      ) : (
                        <Icon
                          name="g-card-deal"
                          className="h-14 w-10 shrink-0"
                        />
                      )}
                    </div>
                  </PopoverTrigger>
                  <DeckContent selectFn={selectDealerCard} />
                </Popover>
                <div className="h-20 w-14 flex-shrink-0 flex items-center justify-center border-[0.5px] border-blue-300/60 rounded-sm bg-blue-300/30">
                  <Icon name="add" className="h-10 w-6 shrink-0" />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-emerald-200"></div>

            {/* Player Hands */}
            <div className="relative grid grid-cols-12 gap-4 my-4 min-h-1/7 ">
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
            </div>
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
                size="sm"
                variant="ghost"
                onClick={toggleGuide}
                className="tracking-tighter flex items-center"
              >
                <Icon name="info-circle" className="size-5 opacity-60" solid />
                <span>How to use</span>
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
          </TabsContent>
        </CardContent>
      </Tabs>
    </CardComp>
  );
};

interface DeckContentProps {
  selectFn: (card: CustomCard) => void;
}
const DeckContent = ({ selectFn }: DeckContentProps) => {
  const onSelect = useCallback(
    (card: CustomCard) => () => {
      selectFn(card);
    },
    [selectFn],
  );
  return (
    <PopoverContent
      align="start"
      className="w-lg flex items-center justify-start bg-zinc-900/30 backdrop-blur-lg border-none"
    >
      <div className="grid grid-cols-13 w-md gap-y-1">
        {deckOfCards.map((card, idx) => (
          <button
            onClick={onSelect(card)}
            key={`${card.rank}_${idx}`}
            className="group"
          >
            <PlayingCard card={card} className="group-hover:bg-zinc-200" />
          </button>
        ))}
      </div>
    </PopoverContent>
  );
};

interface HandStrategyProps {
  strategies: Strategies;
}

export const HandStrategy = ({ strategies }: HandStrategyProps) => (
  <div className="col-span-4 mt-4 pt-4 border-t border-zinc-600">
    <div className="grid grid-cols-2 gap-4">
      {/* Basic Strategy */}
      <div className="bg-zinc-800/30 rounded-lg p-3">
        <div className="text-xs font-bold text-neutral-300 mb-2">
          BASIC STRATEGY
        </div>
        <div className="flex items-center gap-2 mb-2">
          <BaseStrategyAction strategy={strategies.baseStrategy} />
          <BaseStrategyConfidence strategy={strategies.baseStrategy} />
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
              "text-xs px-1 py-0.5 rounded",
              strategies.advancedStrategy.countInfluence === "positive"
                ? "bg-green-500/20 text-green-300"
                : strategies.advancedStrategy.countInfluence === "negative"
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
            <strong>Deviation:</strong> {strategies.advancedStrategy.deviation}
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
);

interface BaseStrategyProps {
  strategy: BaseStrategy;
}
const BaseStrategyAction = ({ strategy }: BaseStrategyProps) => (
  <div
    className={cn(
      "px-2 py-1 rounded text-xs font-bold",
      strategy.action.includes("HIT")
        ? "bg-red-500/20 text-red-300"
        : strategy.action.includes("STAND")
          ? "bg-green-500/20 text-green-300"
          : strategy.action.includes("DOUBLE")
            ? "bg-yellow-500/20 text-yellow-300"
            : strategy.action.includes("SPLIT")
              ? "bg-blue-500/20 text-blue-300"
              : "bg-neutral-500/20 text-neutral-300",
    )}
  >
    {strategy.action}
  </div>
);

const BaseStrategyConfidence = ({ strategy }: BaseStrategyProps) => (
  <div
    className={cn(
      "text-xs",
      strategy.confidence === "high"
        ? "text-green-400"
        : strategy.confidence === "medium"
          ? "text-yellow-400"
          : "text-red-400",
    )}
  >
    {strategy.confidence.toUpperCase()}
  </div>
);
interface AdvancedStrategyProps {
  strategy: AdvancedStrategy;
}
const AdvancedStrategyAction = ({ strategy }: AdvancedStrategyProps) => (
  <div
    className={cn(
      "px-2 py-1 rounded text-xs font-bold",
      strategy.action.includes("HIT")
        ? "bg-red-500/20 text-red-300"
        : strategy.action.includes("STAND")
          ? "bg-green-500/20 text-green-300"
          : strategy.action.includes("DOUBLE")
            ? "bg-yellow-500/20 text-yellow-300"
            : strategy.action.includes("SPLIT")
              ? "bg-blue-500/20 text-blue-300"
              : strategy.action.includes("INSURANCE")
                ? "bg-purple-500/20 text-purple-300"
                : "bg-neutral-500/20 text-neutral-300",
    )}
  >
    {strategy.action}
  </div>
);
const AdvancedStrategyConfidence = ({ strategy }: AdvancedStrategyProps) => (
  <div
    className={cn(
      "text-xs",
      strategy.confidence === "high"
        ? "text-green-400"
        : strategy.confidence === "medium"
          ? "text-yellow-400"
          : "text-red-400",
    )}
  >
    {strategy.confidence.toUpperCase()}
  </div>
);
