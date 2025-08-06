import { Icon } from "@/lib/icons";
import Link from "next/link";

export const TopUpLink = () => {
  return (
    <div className="flex items-center justify-center aspect-square font-space rounded-full md:bg-zinc-800/40 bg-zinc-800/10 backdrop-blur-3xl h-9 md:pe-1.5 md:px-2.5 md:space-x-2">
      <div className="size-6 aspect-square rounded-full relative hidden md:flex items-center justify-center">
        <Icon
          name="arrow-right"
          className="absolute text-lime-100 blur-xs size-6 md:size-8 -rotate-45 md:-bottom-0.5"
        />
        <Icon
          name="arrow-right"
          className="absolute text-lime-100 size-5 md:size-6 -rotate-45 bottom-1 md:bottom-0"
        />
      </div>
      <Link
        href={"/topup"}
        className="font-semibold font-redhat text-secondary-foreground text-xs md:text-sm"
      >
        <div className="relative flex items-center justify-center md:hidden">
          <Icon name="g-money" className="absolute size-6 text-emerald-100" />
          <Icon
            name="g-money"
            className="absolute size-5 text-emerald-200 blur-xs"
          />
        </div>
        <span className="hidden md:flex">top-up</span>
      </Link>
    </div>
  );
};
