"use client";

import { createContext, useMemo, useContext, type ReactNode } from "react";
import { BetCtxProvider } from "./bet-ctx";
import { RNGCtxProvider } from "./rng-ctx";
import { AccountCtxProvider } from "./acc-ctx";
import { BlackjackCtxProvider } from "./blackjack-ctx";
import WagmiContext from "./wagmi";
import { StudioCtxProvider } from "./studio";
import { ToneCtxProvider } from "./tone-ctx";

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
      <ToneCtxProvider>
        <WagmiContext cookies={""}>
          <AccountCtxProvider>
            <RNGCtxProvider>
              <BetCtxProvider>
                <BlackjackCtxProvider>
                  <StudioCtxProvider>{children}</StudioCtxProvider>
                </BlackjackCtxProvider>
              </BetCtxProvider>
            </RNGCtxProvider>
          </AccountCtxProvider>
        </WagmiContext>
      </ToneCtxProvider>
    </ProvidersCtx>
  );
};

const useProvidersCtx = () => {
  const ctx = useContext(ProvidersCtx);
  if (!ctx) throw new Error("ProvidersCtxProvider is missing");
  return ctx;
};

export { ProvidersCtx, ProvidersCtxProvider, useProvidersCtx };
