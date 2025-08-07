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
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

export const Studio = () => {
  const { setDealerUpCard, dealerUpCard } = useStudioCtx();

  const handleCardSelect = useCallback(
    (item: CustomCard) => () => setDealerUpCard(item),
    [setDealerUpCard],
  );

  const initialHandState = useMemo(
    () =>
      ({
        handId: 1,
        firstCard: undefined,
        secondCard: undefined,
        setCustomCard: setDealerUpCard,
      }) as PlayerRowProps,
    [setDealerUpCard],
  );

  const [player_hands, setPlayerHands] = useState<PlayerRowProps[]>([
    initialHandState,
  ]);

  const addPlayerRow = useCallback(() => {
    setPlayerHands((prev) => [
      ...prev,
      { ...initialHandState, handId: player_hands.length + 1 },
    ]);
  }, [initialHandState, player_hands]);

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
              <PopoverContent className="w-full">
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
                </div>
              </PopoverContent>
            </Popover>
            <div className="h-[6.25rem] w-20 flex items-center justify-center border border-blue-900 rounded-lg bg-blue-800/60">
              {/*<Icon name="g-card-draw" className="h-28 w-24 shrink-0" />*/}
            </div>
          </div>
        </div>
        {player_hands.map((hand, i) => (
          <PlayerRow key={i} {...hand} />
        ))}
        <div>
          <Button
            variant="ghost"
            onClick={addPlayerRow}
            className="addPlayerRow"
          >
            + Add Player Hand
          </Button>
        </div>
      </CardContent>
    </CardComp>
  );
};

interface PlayerRowProps {
  handId: number;
  firstCard: CustomCard | undefined;
  secondCard: CustomCard | undefined;
  setCustomCard: Dispatch<SetStateAction<CustomCard | undefined>>;
}
const PlayerRow = ({
  handId,
  firstCard,
  secondCard,
  setCustomCard,
}: PlayerRowProps) => {
  const id = useId();
  const handleCardSelect = useCallback(
    (item: CustomCard) => () => setCustomCard(item),
    [setCustomCard],
  );
  return (
    <div className="grid grid-cols-4 space-x-4 my-4 min-h-1/7 rounded-lg border bg-zinc-700/5 p-4">
      <div className="">
        <h2 className="text-lg font-space font-bold tracking-tighter">
          P{handId}
        </h2>
        <p className="text-sm text-gray-300 font-sans tracking-tight">{id}</p>
      </div>
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger>
            <div className="h-[6.25rem] w-20 flex items-center justify-center border rounded-lg bg-zinc-300/10">
              {firstCard ? (
                <Icon name={firstCard.icon} className="h-28 w-24 shrink-0" />
              ) : (
                <Icon name="g-card-draw" className="h-16 w-12 shrink-0" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full">
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
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger>
            <div className="h-[6.25rem] w-20 flex items-center justify-center border rounded-lg bg-zinc-300/10">
              {secondCard ? (
                <Icon name={secondCard.icon} className="h-28 w-24 shrink-0" />
              ) : (
                <Icon name="g-card-draw" className="h-16 w-12 shrink-0" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full">
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
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
