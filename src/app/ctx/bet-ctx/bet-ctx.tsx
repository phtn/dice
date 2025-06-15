"use client";

import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { quart, quartCurve } from "./helpers";

interface BetProviderProps {
  children: ReactNode;
}

interface BetCtxValues {
  betAmount: number;
  setBet: (amount: number) => void;
  x: number;
  multiplier: number;
  setMult: (x: number) => void;
  setX: Dispatch<SetStateAction<number>>;
  curve: number;
}

const BetCtx = createContext<BetCtxValues | null>(null);

const BetCtxProvider = ({ children }: BetProviderProps) => {
  const [betAmount, setBetAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [x, setX] = useState(50);

  const curve = useMemo(() => quartCurve(x), [x]);

  const setBet = useCallback((amount: number) => {
    setBetAmount((prev) => (amount < 1 ? amount * prev : amount + prev));
  }, []);

  const setMult = useCallback((current: number) => {
    setMultiplier(quart(current));
    setX(current);
  }, []);

  const value = useMemo(
    () => ({
      x,
      setX,
      curve,
      setBet,
      setMult,
      betAmount,
      multiplier,
    }),
    [curve, betAmount, setBet, x, multiplier, setMult],
  );
  return <BetCtx value={value}>{children}</BetCtx>;
};

const useBetCtx = () => {
  const ctx = useContext(BetCtx);
  if (!ctx) throw new Error("BetCtxProvider is missing");
  return ctx;
};

export { BetCtx, BetCtxProvider, useBetCtx };
interface PointsInRangeProps {
  x: number;
}

export const staticCurve = ({ x }: PointsInRangeProps) => {
  // pointInRange =
  switch (x) {
    case 2:
      return 1.02;
    case 10:
      return 1.1;
    case 20:
      return 1.2375;
    case 30:
      return 1.41;
    case 40:
      return 1.65;
    case 50:
      return 2.0;
    case 60:
      return 2.475;
    case 70:
      return 3.3;
    case 80:
      return 4.95;
    case 90:
      return 9.9;
    case 97:
      return 33;
    case 98:
      return 45;
    case 99:
      return 99.0;
  }
};
