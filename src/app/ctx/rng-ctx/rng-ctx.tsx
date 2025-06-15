"use client";

import { asyncFn } from "@/app/utils/helpers";
import { getRandSeedPair, getRandWithPrecision } from "@/app/utils/rng";
import { RandWithPrecise, SeedPair } from "@/app/utils/rng/types";
import { generateId } from "ai";
import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { fetchServerSeed } from "./helpers";
import { Result } from "./types";

interface RNGProviderProps {
  children: ReactNode;
}

interface RNGCtxValues {
  cS: string;
  sS: string;
  nonce: number;
  result: number;
  spN: number;
  generateSeeds: VoidFunction;
  setSeedPair: () => (pair: SeedPair) => Promise<void>;
  rollDice: (
    params: RandWithPrecise,
    callback: (result: number) => void,
  ) => Promise<void>;
  seedPair: SeedPair;
  results: Result[];
  setResults: Dispatch<SetStateAction<Result[]>>;
}

const RNGCtx = createContext<RNGCtxValues | null>(null);

const RNGCtxProvider = ({ children }: RNGProviderProps) => {
  const [cS, setCS] = useState<string>("");
  const [sS, setSS] = useState<string>("");
  const [nonce, setNonce] = useState<number>(0);

  const [result, setResult] = useState<number>(0);
  const [results, setResults] = useState<Result[]>([]);
  const [spN, setSPN] = useState<number>(0);

  const generateSeeds = useCallback(() => {
    fetchServerSeed().then(setSS).catch(console.error);
    setNonce((prev) => prev + 1);
    setCS(generateId());
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSeedPair = useCallback(asyncFn(getRandSeedPair, setSPN), []);
  const seedPair = useMemo(() => ({ cS, sS, nonce }), [cS, sS, nonce]);

  const rollDice = useCallback(
    async (params: RandWithPrecise, callback: (result: number) => void) => {
      const n = await getRandWithPrecision(
        params.seedPair,
        params.range?.[0] ?? 0,
        params.range?.[1] ?? 99.99,
      );
      setResult(n);
      setNonce((prev) => prev++);
      callback(n); // Execute the callback with the result
    },
    [],
  );

  useEffect(() => {
    if (sS === "") {
      fetchServerSeed().then(setSS).catch(console.error);
    }
    if (!cS) setCS(generateId());
  }, [sS, cS]);

  const value = useMemo(
    () => ({
      cS,
      sS,
      spN,
      nonce,
      result,
      results,
      rollDice,
      seedPair,
      setResults,
      setSeedPair,
      generateSeeds,
    }),
    [
      cS,
      sS,
      spN,
      nonce,
      result,
      results,
      rollDice,
      seedPair,
      setResults,
      setSeedPair,
      generateSeeds,
    ],
  );
  return <RNGCtx value={value}>{children}</RNGCtx>;
};

const useRNGCtx = () => {
  const ctx = useContext(RNGCtx);
  if (!ctx) throw new Error("RNGCtxProvider is missing");
  return ctx;
};

export { RNGCtx, RNGCtxProvider, useRNGCtx };
