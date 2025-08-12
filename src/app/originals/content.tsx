"use client";

import { Container } from "@/components/container";
import { Icon } from "@/lib/icons";

export const Content = () => {
  return (
    <Container>
      <div className="w-full h-full px-6">
        <div className="h-20 flex items-center text-xl tracking-tighter">
          Originals
        </div>
        <div className="flex flex-col justify-center items-center text-center size-72 border rounded-xl">
          <div className="size-36 aspect-square">
            <Icon solid name="g-roll-dices" className="size-28 text-teal-200" />
            <div className="text-lg h-12 flex items-center justify-center">
              Dice
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
