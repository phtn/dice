import type { SeedPair } from "./types";

// Pure function to generate random integer from seed
const getRandSeed = async (seed: string, maxValue: number): Promise<number> => {
  const hash: ArrayBuffer = await hashSeed(seed);
  const hashInt: number = bytesToInt(hash);
  return Math.abs(hashInt % maxValue);
};

// Pure function to generate random double from seed pair
const getRandSeedPair = async (pair: SeedPair): Promise<number> => {
  const seed: string = `${pair.cS}|${pair.sS}|${pair.nonce}`;
  const maxInt: number = 2147483647; // 4 bytes signed max
  const randomInt: number = await getRandSeed(seed, maxInt);
  return Number(randomInt) / Number(maxInt);
};

// Pure function to convert bytes to integer
const bytesToInt = (byteArray: ArrayBuffer): number => {
  if (byteArray.byteLength < 4) {
    throw new Error("Byte array must be at least 4 bytes long.");
  }
  const intArray: number[] = Array.from(new Uint8Array(byteArray));
  return (
    (intArray[0] << 24) | (intArray[1] << 16) | (intArray[2] << 8) | intArray[3]
  );
};

// Pure function to hash seed
const hashSeed = async (seed: string): Promise<ArrayBuffer> => {
  const encoder: TextEncoder = new TextEncoder();
  const data: Uint8Array = encoder.encode(seed);
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-512", data);
  return hashBuffer;
};

// Pure function to generate random float in custom range
const getRandInRange = async (
  seedPair: SeedPair,
  min: number = 0,
  max: number = 100,
): Promise<number> => {
  const randomDouble: number = await getRandSeedPair(seedPair);
  return min + randomDouble * (max - min);
};

// Pure function specifically for 0 to 99.99 range
const getRandRange = async (seedPair: SeedPair): Promise<number> => {
  return getRandInRange(seedPair, 0, 99.99);
};

// Pure function for precise decimal control (e.g., 2 decimal places)
const getRandWithPrecision = async (
  seedPair: SeedPair,
  min: number,
  max: number,
  decimalPlaces: number = 2,
): Promise<number> => {
  const randomDouble: number = await getRandSeedPair(seedPair);
  const result: number = min + randomDouble * (max - min);
  return Number(result.toFixed(decimalPlaces));
};

// Export all functions for use
export {
  hashSeed,
  bytesToInt,
  getRandSeed,
  getRandRange,
  getRandInRange,
  getRandSeedPair,
  getRandWithPrecision,
  type SeedPair,
};
