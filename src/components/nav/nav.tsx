"use client";
import Link from "next/link";
import { WalletConnector } from "../wallet/connector";
import { TopUpLink } from "./top-up-link";
import { NavLogo } from "./nav-logo";
import { Icon } from "@/lib/icons";

export const Navbar = () => {
  return (
    <div className="flex justify-center w-screen overflow-hidden">
      <div className="h-14 flex justify-between rounded-md m-1 px-2 md:px-4 items-center w-full">
        <NavLogo />
        <div className="flex items-center space-x-8 text-zinc-400 font-space tracking-tight">
          <Link href={"/"}>
            <Icon
              name="g-dice"
              className="size-6 dark:text-zinc-300 rotate-12"
            />
            <span className="text-sm hidden md:flex">D♦CE</span>
          </Link>
          <Link href={"/blackjack"}>
            <Icon
              name="g-ace-spades"
              className="size-6 dark:text-zinc-300 rotate-12"
            />
            <span className="text-sm hidden md:flex">BL♠CK</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 md:space-x-6">
          <TopUpLink />
          <WalletConnector />
        </div>
      </div>
    </div>
  );
};
