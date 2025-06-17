"use client";

import { ResultsRow } from "@/components/main/results-row";
import { RNGCtxProvider } from "./ctx/rng-ctx";
import { ControlRow } from "@/components/main";
import { PropsWithChildren } from "react";
import { SliderRow } from "@/components/main/slider-row";
import { BetCtxProvider } from "./ctx/bet-ctx";
import { AccountCtxProvider } from "./ctx/acc-ctx/account-ctx";
import { ParamsRow } from "@/components/main/params-row";

export const Content = () => {
  return (
    <AccountCtxProvider>
      <RNGCtxProvider>
        <BetCtxProvider>
          <Container>
            <ResultsRow />
            <SliderRow />
            <ParamsRow />
            <ControlRow />
          </Container>
        </BetCtxProvider>
      </RNGCtxProvider>
    </AccountCtxProvider>
  );
};

const Container = ({ children }: PropsWithChildren) => (
  <main className="md:container mx-auto overflow-x-hidden grid grid-rows py-2 items-start justify-items-center min-h-screen p-4 gap-6 font-[family-name:var(--font-geist-sans)]">
    {children}
  </main>
);
