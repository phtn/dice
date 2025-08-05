"use client";

import { ResultsRow } from "@/components/main/results-row";
import { ControlRow } from "@/components/main";
import { SliderRow } from "@/components/main/slider-row";
import { ParamsRow } from "@/components/main/params-row";
import { Container } from "@/components/container";

export const Content = () => {
  return (
    <Container>
      <ResultsRow />
      <SliderRow />
      <ParamsRow />
      <ControlRow />
    </Container>
  );
};
