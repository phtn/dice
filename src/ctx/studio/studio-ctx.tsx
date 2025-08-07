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
];

export { StudioCtx, StudioCtxProvider, useStudioCtx };
