import { type ClassName } from "@/app/types";
import { type ReactNode } from "react";
import { HyperCard } from "./card";

export interface StatCardProps {
  label?: ReactNode;
  value?: number | string;
  className?: ClassName;
  children?: ReactNode;
}
export const StatCard = ({
  label,
  value,
  className,
  children,
}: StatCardProps) => {
  return (
    <HyperCard className={className}>
      <div className="text-right text-xs tracking-wide font-light text-gray-400 uppercase whitespace-nowrap">
        {label}
      </div>
      {children}
      <div className={`text-lg text-right text-primary-foreground`}>
        {value}
      </div>
    </HyperCard>
  );
};
