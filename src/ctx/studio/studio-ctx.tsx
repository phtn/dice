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
}

const StudioCtx = createContext<StudioCtxValues | null>(null);

const StudioCtxProvider = ({ children }: StudioProviderProps) => {
  const [dealerUpCard, setDealerUpCard] = useState<CustomCard>();
  const [dealerHand, setDealerHand] = useState<Hand | null>(null);

  const engineRef = useRef(new BlackjackEngine(8));
  const engine = engineRef.current;

  const dealtDealerUpCard = engine.dealCard(dealerUpCard);

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
    }),
    [createDealerHand, setDealerUpCard, dealerHand, dealerUpCard],
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
];

export { StudioCtx, StudioCtxProvider, useStudioCtx };
