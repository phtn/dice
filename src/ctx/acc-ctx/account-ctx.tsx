"use client";

import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Balance } from "./types";
import { fetchBalance } from "./helpers";
import { setAccount } from "@/app/actions";
import { generateId } from "ai";

interface AccountProviderProps {
  children: ReactNode;
}

interface AccountCtxValues {
  balance: Balance | undefined;
  getBalance: () => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
}

const AccountCtx = createContext<AccountCtxValues | null>(null);

const AccountCtxProvider = ({ children }: AccountProviderProps) => {
  const [balance, setBalance] = useState<Balance>({
    amount: 0,
    currencyCode: "USD",
    fractionalDigits: 2,
  });

  const updateBalance = useCallback(
    async (amount: number) => {
      const currentBal = { ...balance, amount };
      await setAccount({ id: generateId(), balance: currentBal });
      setBalance(currentBal);
    },
    [balance],
  );

  const getBalance = useCallback(async () => {
    const bal = await fetchBalance();
    setBalance(bal);
  }, []);

  useEffect(() => {
    getBalance().catch(console.error);
  }, [getBalance]);

  const value = useMemo(
    () => ({
      balance,
      getBalance,
      updateBalance,
    }),
    [balance, getBalance, updateBalance],
  );
  return <AccountCtx value={value}>{children}</AccountCtx>;
};

const useAccountCtx = () => {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("AccountCtxProvider is missing");
  return ctx;
};

export { AccountCtx, AccountCtxProvider, useAccountCtx };
