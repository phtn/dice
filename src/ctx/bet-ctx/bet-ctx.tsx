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
import { quart } from "./helpers";
import { useAccountCtx } from "@/ctx/acc-ctx";
import { GameType } from "../rng-ctx/types";

interface BetProviderProps {
  children: ReactNode;
}
interface BetCtxValues {
  betAmount: number;
  setBet: (type: BetAmountMulticand) => void;
  x: number;
  multiplier: number;
  setMult: (current: number, game: GameType) => void;
  setX: Dispatch<SetStateAction<number>>;
  curve: number;
  autoplayCount: number;
  setAutoplayCount: Dispatch<SetStateAction<number>>;
  isAutoplaying: boolean;
  setIsAutoplaying: Dispatch<SetStateAction<boolean>>;
  onSetGameType: (type: GameType) => void;
  gameType: GameType;
}

const BetCtx = createContext<BetCtxValues | null>(null);

export type BetAmountMulticand = "zero" | "half" | "2x" | "max";

export const AUTOPLAYS = 100;
const BetCtxProvider = ({ children }: BetProviderProps) => {
  const [gameType, setGameType] = useState<GameType>("dice");
  const [betAmount, setBetAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [x, setX] = useState(50);
  const [autoplayCount, setAutoplayCount] = useState(AUTOPLAYS);
  const [isAutoplaying, setIsAutoplaying] = useState(false);

  const { balance } = useAccountCtx();

  const onSetGameType = useCallback((type: GameType) => setGameType(type), []);

  const curve = useMemo(() => quart(x), [x]);

  const setBet = useCallback(
    (type: BetAmountMulticand) => {
      switch (type) {
        case "half":
          setBetAmount((prev) => (prev <= 1.99 ? 0 : prev / 2));
          break;
        case "2x":
          setBetAmount((prev) => (prev === 0 ? 2 : prev * 2));
          break;
        case "max":
          setBetAmount(balance?.amount ?? 0);
          break;
        default:
          setBetAmount(0);
      }
    },
    [balance?.amount],
  );

  const setMult = useCallback((current: number, game: GameType) => {
    setMultiplier(() =>
      game === "dice" ? quart(current) : current / 11.2 + 1,
    );
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
      autoplayCount,
      isAutoplaying,
      setAutoplayCount,
      setIsAutoplaying,
      onSetGameType,
      gameType,
    }),
    [
      curve,
      betAmount,
      setBet,
      x,
      multiplier,
      setMult,
      autoplayCount,
      isAutoplaying,
      setAutoplayCount,
      setIsAutoplaying,
      onSetGameType,
      gameType,
    ],
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
