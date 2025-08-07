"use client";
import Link from "next/link";
import { WalletConnector } from "../wallet/connector";
import { TopUpLink } from "./top-up-link";
import { NavLogo } from "./nav-logo";
import { Icon, IconName } from "@/lib/icons";
import { useCallback, useMemo } from "react";
import { HyperList } from "../hyper/list";

type CardSuit = "♦" | "♠" | "♥";
interface INavItem {
  href: string;
  label: string;
  icon: IconName;
  suits: CardSuit[];
}
export const Navbar = () => {
  const nav_items = useMemo(
    () =>
      [
        { href: "/", label: "dice", icon: "g-dice", suits: ["♦"] },
        {
          href: "/blackjack",
          label: "blackjack",
          icon: "g-ace-spades",
          suits: ["♠", "♥"],
        },
      ] as INavItem[],
    [],
  );

  return (
    <div className="flex justify-center w-screen overflow-hidden">
      <div className="h-14 flex justify-between rounded-md m-1 px-2 md:px-4 items-center w-full">
        <NavLogo />
        {/*<div className="flex items-center space-x-8 md:space-x-16 text-zinc-400 font-space tracking-tight">*/}
        <HyperList
          data={nav_items}
          component={NavItem}
          container="flex items-center space-x-8 md:space-x-16 text-zinc-400 font-space tracking-tight"
          direction="right"
        />

        {/*</div>*/}
        <div className="flex items-center space-x-2 md:space-x-6">
          <TopUpLink />
          <WalletConnector />
        </div>
      </div>
    </div>
  );
};
const VOWELS = ["a", "e", "i", "o", "u"];
const NavItem = (item: INavItem) => {
  const vowels = useMemo(
    () => item.label.split("").filter((v) => VOWELS.includes(v)),
    [item.label],
  );
  const Label = useCallback(
    () => (
      <span className="text-sm md:text-base uppercase hidden md:flex">
        {item.label.split("").map((c, i) =>
          vowels.includes(c) ? (
            <span key={i} className="-mx-0.5 text-six-nine">
              {item.suits[vowels.indexOf(c)] ?? c}
            </span>
          ) : (
            <span key={i}>{c}</span>
          ),
        )}
      </span>
    ),
    [item, vowels],
  );

  return (
    <Link href={item.href}>
      <div className="flex items-center space-x-1">
        <Icon
          name={item.icon}
          className="size-6 dark:text-zinc-100 rotate-12"
        />
        <Label />
      </div>
    </Link>
  );
};
