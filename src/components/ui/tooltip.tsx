"use client";

import {
  TooltipArrow,
  type TooltipContentProps,
  TooltipPortal,
  type TooltipTriggerProps,
  Provider,
  Root,
} from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof Provider>) {
  return (
    <Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof Root>) {
  return (
    <Provider>
      <Root data-slot="tooltip" {...props} />
    </Provider>
  );
}

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipTrigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  showArrow = false,
  children,
  ...props
}: TooltipContentProps & {
  showArrow?: boolean;
}) {
  return (
    <TooltipPortal>
      <TooltipContent
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-70 rounded-md border px-3 py-1.5 text-sm",
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipArrow className="fill-popover -my-px drop-shadow-[0_1px_0_var(--border)]" />
        )}
      </TooltipContent>
    </TooltipPortal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
