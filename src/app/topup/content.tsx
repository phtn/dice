"use client";

import { Container } from "@/components/container";
import { Burst } from "@/components/hyper/burst";

export const Content = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Container>
        <div className="size-96 border flex items-center justify-center">
          <Burst shouldAnimate={true} duration={1500} speed={120} count={150}>
            <div className="size-72">YO</div>
          </Burst>
        </div>
      </Container>
    </div>
  );
};
