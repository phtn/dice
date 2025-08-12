import { Button } from "@/components/ui/button";
import { Card as CardComp, CardContent, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlackjackCtx } from "@/ctx/blackjack-ctx/blackjack-ctx";
import { useStudioCtx } from "@/ctx/studio";
import { CustomCard, deckOfCards } from "@/ctx/studio/studio-ctx";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import {
  convertCustomCardToCard,
  CustomHand,
  PlayerCustomHand,
} from "./custom-hand";
import { PlayingCard } from "./playing-card";

export const Studio = () => {
  const { setDealerUpCard, dealerUpCard } = useStudioCtx();
  const { shuffleDeck, dealSpecificCard, getRemainingCardsByRank } =
    useBlackjackCtx();

  const [playerHands, setPlayerHands] = useState<CustomHand[]>([
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
      if (hand.thirdCard) currentCards.push(hand.thirdCard);
      if (hand.fourthCard) currentCards.push(hand.fourthCard);
      if (hand.fifthCard) currentCards.push(hand.fifthCard);
      if (hand.sixthCard) currentCards.push(hand.sixthCard);
    });

    // Only sync if cards have actually changed
    setStudioCards((prevCards) => {
      const cardsChanged =
        prevCards.length !== currentCards.length ||
        prevCards.some(
          (card, index) =>
            !currentCards[index] ||
            card.rank !== currentCards[index].rank ||
            card.suit !== currentCards[index].suit,
        );

      if (cardsChanged) {
        // Reset deck first to clear any previous studio cards
        shuffleDeck();

        // Deal each studio card to the engine
        currentCards.forEach((customCard) => {
          const engineCard = convertCustomCardToCard(customCard);
          dealSpecificCard(engineCard);
        });
      }

      return currentCards;
    });
  }, [dealerUpCard, playerHands, shuffleDeck, dealSpecificCard]);

  // Create a simulated remaining cards calculation based on studio selections
  const getStudioRemainingCards = useCallback(() => {
    // Start with the actual remaining cards from the blackjack engine
    const actualRemaining = getRemainingCardsByRank();
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
      if (hand.thirdCard) allStudioCards.push(hand.thirdCard);
      if (hand.fourthCard) allStudioCards.push(hand.fourthCard);
      if (hand.fifthCard) allStudioCards.push(hand.fifthCard);
      if (hand.sixthCard) allStudioCards.push(hand.sixthCard);
    });

    // Subtract studio cards from remaining count
    allStudioCards.forEach((customCard) => {
      const rank = customCard.rank;
      if (studioRemaining[rank] > 0) {
        studioRemaining[rank]--;
      }
    });

    return studioRemaining;
  }, [dealerUpCard, playerHands, getRemainingCardsByRank]);

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
    (handId: number, updates: Partial<Omit<CustomHand, "id">>) => {
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
            <div className="grid grid-cols-12 gap-1 my-4 min-h-1/7 rounded-lg bg-zinc-800/5">
              <div className="col-span-3 flex justify-between w-full p-1 rounded-md bg-zinc-800/40">
                <div>
                  <p className="text-base font-sans font-bold tracking-tighter">
                    <span className=" text-pink-200">D</span>
                    <span className="font-thin px-1">/</span>
                    <span className="font-bold font-sans text-sky-200">1</span>
                  </p>
                  <p className="text-base font-sans font-bold tracking-tighter">
                    21 - WIN
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 -space-x-1 px-1.5 bg-zinc-800/50 rounded-sm"
                >
                  <Icon name="add" className="size-3 text-sky-100" />
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
                <PlayerCustomHand
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
export const DeckContent = ({ selectFn }: DeckContentProps) => {
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
            <PlayingCard
              card={card}
              className="group-hover:bg-zinc-200 group-hover:border-zinc-400/30 border-[0.33px] border-transparent"
            />
          </button>
        ))}
      </div>
    </PopoverContent>
  );
};
