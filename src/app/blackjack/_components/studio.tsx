import { Button } from "@/components/ui/button";
import { Card as CardComp, CardContent, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudioCtx } from "@/ctx/studio";
import { CustomCard, deckOfCards } from "@/ctx/studio/studio-ctx";
import { Icon } from "@/lib/icons";
import { useCallback } from "react";

export const Studio = () => {
  const { setDealerUpCard, dealerUpCard } = useStudioCtx();

  const handleCardSelect = useCallback(
    (item: CustomCard) => () => setDealerUpCard(item),
    [setDealerUpCard],
  );

  return (
    <CardComp className="h-[calc(100vh-64px)] portrait:min-h-[calc(100vh-64px)] py-0 lg:col-span-5 bg-poker-dark border-transparent rounded-b-3xl">
      <div className="px-2 flex items-center justify-between md:px-4">
        <CardTitle className="text-sm border border-border/20 rounded-sm p-px font-medium text-neutral-300 tracking-wider">
          <span>STRATEGY STUDI0</span>
        </CardTitle>
        <Button variant="secondary">New Game</Button>
      </div>
      <CardContent className="bg-poker-light border border-white/10 h-full rounded-[1.75rem]">
        <div className="grid grid-cols-4 space-x-4 my-4 min-h-1/7 rounded-lg border bg-zinc-700/5 p-4">
          <div className="">
            <h2 className="text-lg font-space font-bold tracking-tighter">
              DEALER
            </h2>
            <p className="text-sm text-gray-300 font-sans tracking-tight">
              100%
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Popover>
              <PopoverTrigger>
                <div className="h-[6.25rem] w-20 flex items-center justify-center border rounded-lg bg-zinc-300/10">
                  {dealerUpCard ? (
                    <Icon
                      name={dealerUpCard.icon}
                      className="h-28 w-24 shrink-0"
                    />
                  ) : (
                    <Icon name="g-card-draw" className="h-28 w-24 shrink-0" />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="">
                <div className="flex items-center space-x-2">
                  {deckOfCards.map((c) => (
                    <button
                      onClick={handleCardSelect(c)}
                      key={c.icon}
                      className="bg-red-500 w-[2rem] h-10 rounded-sm flex items-center justify-center"
                    >
                      <Icon
                        solid
                        name={c.icon}
                        className="size-12 text-white shrink-0"
                      />
                    </button>
                  ))}
                  <div className="bg-red-500 w-[2rem] h-10 rounded-sm flex items-center justify-center">
                    <Icon
                      solid
                      name="g-ace-diamonds"
                      className="size-12 text-white shrink-0"
                    />
                  </div>
                  <div className="bg-red-500 w-[2rem] h-10 rounded-sm flex items-center justify-center">
                    <Icon
                      solid
                      name="g-ace-spades"
                      className="size-12 text-white shrink-0"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="h-[6.25rem] w-20 flex items-center justify-center border border-blue-900 rounded-lg bg-blue-800/60">
              {/*<Icon name="g-card-draw" className="h-28 w-24 shrink-0" />*/}
            </div>
          </div>
        </div>
      </CardContent>
    </CardComp>
  );
};
