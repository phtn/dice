"use client";

import { ResultsRow } from "@/components/main/results-row";
import { RNGCtxProvider } from "./ctx/rng-ctx";
import { ControlRow, SeedRow } from "@/components/main";
import { PropsWithChildren } from "react";
import { SliderRow } from "@/components/main/slider-row";
import { BetCtxProvider } from "./ctx/b-ctx";

export const Content = () => {
  return (
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
  );
};

const Container = ({ children }: PropsWithChildren) => (
  <main className="grid grid-rows-[30px_1fr_1fr] py-24 border items-center justify-items-center min-h-screen p-8 gap-6 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    {children}
  </main>
);
