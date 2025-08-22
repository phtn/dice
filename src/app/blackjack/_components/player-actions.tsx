import { Button } from "@/components/ui/button";
import { type IconName, Icon } from "@/lib/icons";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ClassName } from "@/app/types";

type PlayerActionName = "Hit" | "Stand" | "Double Down" | "Split" | "Insurance";

export interface IPlayerAction {
  name: PlayerActionName;
  actionFn: VoidFunction;
  disabled?: boolean;
  style?: ClassName;
  icon?: IconName;
  label?: ReactNode;
}
export const PlayerAction = ({
  name,
  actionFn,
  disabled,
  style,
  icon,
  label,
}: IPlayerAction) => {
  return (
    <div className={cn("flex flex-col justify-center", { hidden: disabled })}>
      <Button
        size="xl"
        onClick={actionFn}
        disabled={disabled}
        className={cn(
          "relative h-10 max-w-[4rem] px-0.5 flex flex-col items-center justify-center",
          "",
          "border border-orange-100/60 rounded-md ",
          "bg-stone-200/40 hover:bg-stone-100/80",
          "font-bold tracking-tighter text-white text-lg",
          "group/btn transition-all duration-300 active:scale-95",
          { hidden: disabled },
        )}
      >
        <div
          className={cn(
            "flex flex-col h-9 w-[45px] items-center justify-center leading-none",
            "rounded-[4.5px] group-hover/btn:rounded-sm",
            "transition-all duration-300",
            style,
          )}
        >
          {icon ? <Icon name={icon} className="size-5" /> : (label ?? name)}
        </div>
      </Button>
      <p className="text-[6px] text-center tracking-tighter uppercase mt-1">
        {name}
      </p>
    </div>
  );
};

/*
<Button
            size="xl"
            onClick={hit}
            disabled={!canDoubleDown}
            className={cn(
              "h-11 max-w-[4rem] px-0.5 flex flex-col items-center justify-center",
              "font-bold tracking-tighter relative",
              "bg-stone-200/10 border-1.5 border-orange-100/60",
              "rounded-md hover:rounded-xs",
              "text-white text-lg hover:bg-stone-300/10",
              "group/btn inset-shadow-[0_0.5px_rgb(255_255_255/0.20)]",
              "transition-all duration-300 active:scale-95",
            )}
          >
            <div
              className={cn(
                "flex flex-col h-10 w-[3.5rem] border-[0.33px] border-hit/20 group-hover/btn:border-emerald-100/60 items-center justify-center leading-none",
                "group-hover/btn:rounded-[1px]",
                "transition-all duration-300",
                "space-y-1 rounded-sm bg-hit",
              )}
            >
              <Icon solid name="add" className="size-3.5" />
              <div className="text-[6px] font-bold uppercase leading-none -tracking-widest text-white">
                hit
              </div>
            </div>
          </Button>
          <Button
            size="xl"
            onClick={stand}
            disabled={!canStand}
            className={cn(
              "h-11 max-w-[4rem] px-0.5 flex flex-col items-center justify-center",
              "font-bold tracking-tighter relative",
              "bg-stone-200/10 border-1.5 border-orange-100/60",
              "rounded-md hover:rounded-xs",
              "text-white text-lg hover:bg-stone-300/10",
              "group/btn inset-shadow-[0_0.5px_rgb(255_255_255/0.20)]",
              "transition-all duration-300 active:scale-95",
            )}
          >
            <div
              className={cn(
                "flex flex-col h-10 w-[3.5rem] border-[0.33px] border-stand/20 group-hover/btn:border-rose-100/60 items-center justify-center leading-none",
                "group-hover/btn:rounded-[1px]",
                "transition-all duration-300",
                "space-y-1 rounded-sm bg-stand",
              )}
            >
              <Icon solid name="stand" className="size-3.5" />
              <div className="text-[6px] font-bold uppercase leading-none -tracking-widest text-white">
                stand
              </div>
            </div>
          </Button>
          {canSplit && (
                      <Button
                        size="xl"
                        onClick={split}
                        disabled={gameState !== "player-turn" && canSplit}
                        className={cn(
                          "h-11 max-w-[4rem] px-0.5 flex flex-col items-center justify-center",
                          "font-bold tracking-tighter relative",
                          "bg-stone-200/10 border-1.5 border-orange-100/60",
                          "rounded-md hover:rounded-xs",
                          "text-white text-lg hover:bg-stone-300/10",
                          "group/btn inset-shadow-[0_0.5px_rgb(255_255_255/0.20)]",
                          "transition-all duration-300 active:scale-95",
                        )}
                      >
                        <div
                          className={cn(
                            "flex flex-col h-10 w-[3.5rem] border-[0.33px] border-split/20 group-hover/btn:border-rose-100/60 items-center justify-center leading-none",
                            "group-hover/btn:rounded-[1px]",
                            "transition-all duration-300",
                            "space-y-1 rounded-sm bg-indigo-500",
                          )}
                        >
                          <Icon solid name="asterisk" className="size-3.5" />
                          <div className="text-[6px] font-bold uppercase leading-none -tracking-widest text-white">
                            SPLIT
                          </div>
                        </div>
                      </Button>
                    )}
*/
