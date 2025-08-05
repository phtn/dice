import { type HTMLAttributes, ReactNode } from "react";
import { ClassName } from "@/app/types";
import { cn } from "@/lib/utils";

interface HyperCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: ClassName;
}

export const HyperCard = ({ children, className }: HyperCardProps) => {
  return (
    <div
      className={cn(
        "bg-zinc-700/50 text-card-foreground flex flex-col space-y-2 rounded-xl border border-zinc-600/5 px-3 py-3 shadow-xs relative overflow-hidden group dark:bg-zinc-700/20 inset-shadow-[0_0.5px_rgb(255_255_255/0.20)]",
        className,
      )}
    >
      {children}
    </div>
  );
};
