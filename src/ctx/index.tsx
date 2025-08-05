"use client";

import { createContext, useMemo, useContext, type ReactNode } from "react";
import { BetCtxProvider } from "./bet-ctx";
import { RNGCtxProvider } from "./rng-ctx";
import { AccountCtxProvider } from "./acc-ctx";
import { BlackjackCtxProvider } from "./blackjack-ctx";

interface ProvidersProviderProps {
  children: ReactNode;
}

interface ProvidersCtxValues {
  on: boolean;
}

const ProvidersCtx = createContext<ProvidersCtxValues | null>(null);

const ProvidersCtxProvider = ({ children }: ProvidersProviderProps) => {
  const value = useMemo(
    () => ({
      on: false,
    }),
    [],
  );
  return (
    <ProvidersCtx value={value}>
      <AccountCtxProvider>
        <RNGCtxProvider>
          <BetCtxProvider>
            <BlackjackCtxProvider>{children}</BlackjackCtxProvider>
          </BetCtxProvider>
        </RNGCtxProvider>
      </AccountCtxProvider>
    </ProvidersCtx>
  );
};

const useProvidersCtx = () => {
  const ctx = useContext(ProvidersCtx);
  if (!ctx) throw new Error("ProvidersCtxProvider is missing");
  return ctx;
};

export { ProvidersCtx, ProvidersCtxProvider, useProvidersCtx };
