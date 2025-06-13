import {
  getRandSeedPair,
  getRandWithPrecision,
  SeedPair,
} from "@/app/utils/rng";
import { generateId } from "ai";
import { Dispatch, SetStateAction, useCallback, useState } from "react";

interface RandWithPrecise {
  seed: SeedPair;
  range?: number[];
}
export const useRNG = () => {
  const [cS, setCS] = useState<string>("");
  const [sS, setSS] = useState<string>("");
  const [nonce, setNonce] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);
  const [spN, setSPN] = useState<number | null>(null);

  const generateSeeds = useCallback(() => {
    setCS(generateId());
    setSS(generateId());
    setNonce((prev) => prev++);
  }, []);

  const setSeedPair = useCallback(() => asyncFn(getRandSeedPair, setSPN), []);
  const rollDice = useCallback(async (params: RandWithPrecise) => {
    const n = await getRandWithPrecision(
      params.seed,
      params.range?.[0] ?? 0,
      params.range?.[1] ?? 99.99,
    );
    setResult(n);
    setNonce((prev) => prev + 1);
  }, []);

  return { rollDice, result, setSeedPair, spN, generateSeeds, cS, sS, nonce };
};

export const asyncFn =
  <T, R>(
    fn: (params: T) => Promise<R>,
    set: Dispatch<SetStateAction<R | null>>,
  ) =>
  () =>
  async (params: T) =>
    set(await fn(params));

// 126
// 12 20
// 73 20
// 27 100
