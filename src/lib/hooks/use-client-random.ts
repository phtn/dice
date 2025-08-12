"use client";

import { useEffect, useState } from "react";

export const useClientRandom = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const random = (min: number, max: number, decimals: number = 0): number => {
    if (!isClient) {
      // Return a consistent value during SSR
      return decimals === 0 ? Math.floor((min + max) / 2) : Number(((min + max) / 2).toFixed(decimals));
    }
    const value = Math.random() * (max - min) + min;
    return decimals === 0 ? Math.floor(value) : Number(value.toFixed(decimals));
  };

  return { random, isClient };
};