"use client";

import { Label as LabelPrimitive } from "@radix-ui/react-label";

import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(
        "text-foreground text-sm leading-4 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
