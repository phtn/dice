export interface SeedPair {
  nonce: number;
  cS: string;
  sS: string;
}

export interface RandWithPrecise {
  seedPair: SeedPair;
  range?: number[];
}

export interface ServerSeed {
  sS: string;
}
