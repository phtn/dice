"use client";

import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { BlackjackEngine, Card, Hand } from "../blackjack-ctx";
import { IconName } from "@/lib/icons";

export interface CustomCard extends Card {
  icon: IconName;
}
interface StudioProviderProps {
  children: ReactNode;
}

interface StudioCtxValues {
  createDealerHand: VoidFunction;
  setDealerUpCard: Dispatch<SetStateAction<CustomCard | undefined>>;
  dealerHand: Hand | null;
  dealerUpCard: CustomCard | undefined;
  createPlayerHand: VoidFunction;
  playerHand: Hand | null;
  playerFirstCard: CustomCard | undefined;
  playerSecondCard: CustomCard | undefined;
  setPlayerFirstCard: Dispatch<SetStateAction<CustomCard | undefined>>;
  setPlayerSecondCard: Dispatch<SetStateAction<CustomCard | undefined>>;
}

const StudioCtx = createContext<StudioCtxValues | null>(null);

const StudioCtxProvider = ({ children }: StudioProviderProps) => {
  const [dealerUpCard, setDealerUpCard] = useState<CustomCard>();
  const [playerFirstCard, setPlayerFirstCard] = useState<CustomCard>();
  const [playerSecondCard, setPlayerSecondCard] = useState<CustomCard>();
  const [dealerHand, setDealerHand] = useState<Hand | null>(null);
  const [playerHand, setPlayerHand] = useState<Hand | null>(null);

  const engineRef = useRef(new BlackjackEngine(8));
  const engine = engineRef.current;

  const dealtDealerUpCard = engine.dealCard(dealerUpCard);
  const dealtPlayerFirstCard = engine.dealCard(playerFirstCard);
  const dealtPlayerSecondCard = engine.dealCard(playerSecondCard);

  const createPlayerHand = useCallback(() => {
    if (dealtPlayerFirstCard && dealtPlayerSecondCard) {
      setPlayerHand(
        engine.createHand([dealtPlayerFirstCard, dealtPlayerSecondCard]),
      );
    }
  }, [dealtPlayerFirstCard, dealtPlayerSecondCard, engine]);

  const createDealerHand = useCallback(() => {
    const newDealearHand =
      dealtDealerUpCard && engine.createHand([dealtDealerUpCard]);
    setDealerHand(newDealearHand);
  }, [dealtDealerUpCard, engine]);

  const value = useMemo(
    () => ({
      createDealerHand,
      setDealerUpCard,
      dealerHand,
      dealerUpCard,
      playerHand,
      playerFirstCard,
      playerSecondCard,
      setPlayerFirstCard,
      setPlayerSecondCard,
      createPlayerHand,
    }),
    [
      createDealerHand,
      setDealerUpCard,
      dealerHand,
      dealerUpCard,
      playerHand,
      playerFirstCard,
      playerSecondCard,
      setPlayerFirstCard,
      setPlayerSecondCard,
      createPlayerHand,
    ],
  );
  return <StudioCtx value={value}>{children}</StudioCtx>;
};

const useStudioCtx = () => {
  const ctx = useContext(StudioCtx);
  if (!ctx) throw new Error("StudioCtxProvider is missing");
  return ctx;
};

export const deckOfCards: CustomCard[] = [
  { suit: "diamonds", rank: "A", value: 1, icon: "g-ace-diamonds" },
  { suit: "diamonds", rank: "2", value: 2, icon: "g-2-diamonds" },
  { suit: "diamonds", rank: "3", value: 3, icon: "g-3-diamonds" },
  { suit: "diamonds", rank: "4", value: 4, icon: "g-4-diamonds" },
  { suit: "diamonds", rank: "5", value: 5, icon: "g-5-diamonds" },
  { suit: "diamonds", rank: "6", value: 6, icon: "g-6-diamonds" },
  { suit: "diamonds", rank: "7", value: 7, icon: "g-7-diamonds" },
  { suit: "diamonds", rank: "8", value: 8, icon: "g-8-diamonds" },
  { suit: "diamonds", rank: "9", value: 9, icon: "g-9-diamonds" },
  { suit: "diamonds", rank: "10", value: 10, icon: "g-10-diamonds" },
  { suit: "diamonds", rank: "J", value: 10, icon: "g-j-diamonds" },
  { suit: "diamonds", rank: "Q", value: 10, icon: "g-q-diamonds" },
  { suit: "diamonds", rank: "K", value: 10, icon: "g-k-diamonds" },
  { suit: "clubs", rank: "A", value: 1, icon: "g-ace-clubs" },
  { suit: "clubs", rank: "2", value: 2, icon: "g-2-clubs" },
  { suit: "clubs", rank: "3", value: 3, icon: "g-3-clubs" },
  { suit: "clubs", rank: "4", value: 4, icon: "g-4-clubs" },
  { suit: "clubs", rank: "5", value: 5, icon: "g-5-clubs" },
  { suit: "clubs", rank: "6", value: 6, icon: "g-6-clubs" },
  { suit: "clubs", rank: "7", value: 7, icon: "g-7-clubs" },
  { suit: "clubs", rank: "8", value: 8, icon: "g-8-clubs" },
  { suit: "clubs", rank: "9", value: 9, icon: "g-9-clubs" },
  { suit: "clubs", rank: "10", value: 10, icon: "g-10-clubs" },
  { suit: "clubs", rank: "J", value: 10, icon: "g-j-clubs" },
  { suit: "clubs", rank: "Q", value: 10, icon: "g-q-clubs" },
  { suit: "clubs", rank: "K", value: 10, icon: "g-k-clubs" },
  { suit: "hearts", rank: "A", value: 1, icon: "g-ace-clubs" },
  { suit: "hearts", rank: "2", value: 2, icon: "g-2-clubs" },
  { suit: "hearts", rank: "3", value: 3, icon: "g-3-clubs" },
  { suit: "hearts", rank: "4", value: 4, icon: "g-4-clubs" },
  { suit: "hearts", rank: "5", value: 5, icon: "g-5-clubs" },
  { suit: "hearts", rank: "6", value: 6, icon: "g-6-clubs" },
  { suit: "hearts", rank: "7", value: 7, icon: "g-7-clubs" },
  { suit: "hearts", rank: "8", value: 8, icon: "g-8-clubs" },
  { suit: "hearts", rank: "9", value: 9, icon: "g-9-clubs" },
  { suit: "hearts", rank: "10", value: 10, icon: "g-10-clubs" },
  { suit: "hearts", rank: "J", value: 10, icon: "g-j-clubs" },
  { suit: "hearts", rank: "Q", value: 10, icon: "g-q-clubs" },
  { suit: "hearts", rank: "K", value: 10, icon: "g-k-clubs" },
  { suit: "spades", rank: "A", value: 1, icon: "g-ace-clubs" },
  { suit: "spades", rank: "2", value: 2, icon: "g-2-clubs" },
  { suit: "spades", rank: "3", value: 3, icon: "g-3-clubs" },
  { suit: "spades", rank: "4", value: 4, icon: "g-4-clubs" },
  { suit: "spades", rank: "5", value: 5, icon: "g-5-clubs" },
  { suit: "spades", rank: "6", value: 6, icon: "g-6-clubs" },
  { suit: "spades", rank: "7", value: 7, icon: "g-7-clubs" },
  { suit: "spades", rank: "8", value: 8, icon: "g-8-clubs" },
  { suit: "spades", rank: "9", value: 9, icon: "g-9-clubs" },
  { suit: "spades", rank: "10", value: 10, icon: "g-10-clubs" },
  { suit: "spades", rank: "J", value: 10, icon: "g-j-clubs" },
  { suit: "spades", rank: "Q", value: 10, icon: "g-q-clubs" },
  { suit: "spades", rank: "K", value: 10, icon: "g-k-clubs" },
];

export { StudioCtx, StudioCtxProvider, useStudioCtx };
