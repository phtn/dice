"use client";

import { ResultsRow } from "@/components/main/results-row";
import { RNGCtxProvider } from "./ctx/rng-ctx";
import { ControlRow, SeedRow } from "@/components/main";
import { PropsWithChildren } from "react";
import { SliderRow } from "@/components/main/slider-row";
import { BetCtxProvider } from "./ctx/bet-ctx";
import { AccountCtxProvider } from "./ctx/acc-ctx/account-ctx";

export const Content = () => {
  return (
    <AccountCtxProvider>
      <RNGCtxProvider>
        <BetCtxProvider>
          <Container>
            <ResultsRow />
            <SliderRow />
            <SeedRow />
            <ControlRow />
          </Container>
        </BetCtxProvider>
      </RNGCtxProvider>
    </AccountCtxProvider>
  );
};

const Container = ({ children }: PropsWithChildren) => (
  <main className="container mx-auto grid grid-rows-[30px_1fr_1fr] py-20 items-center justify-items-center min-h-screen p-4 gap-6 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    {children}
  </main>
);
