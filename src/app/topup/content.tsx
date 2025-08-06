"use client";

import { Container } from "@/components/container";
import { HyperBurst } from "@/components/hyper/burst";

export const Content = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Container>
        <HyperBurst />
      </Container>
    </div>
  );
};
