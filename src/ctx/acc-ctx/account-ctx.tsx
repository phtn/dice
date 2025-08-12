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
  resetBalance: () => void;
}

const AccountCtx = createContext<AccountCtxValues | null>(null);

const AccountCtxProvider = ({ children }: AccountProviderProps) => {
  const [balance, setBalance] = useState<Balance>({
    amount: 5000,
    currencyCode: "USD",
    fractionalDigits: 2,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  const updateBalance = useCallback(
    async (amount: number) => {
      const newBal = { ...balance, amount: amount };
      await setAccount({ id: generateId(), balance: newBal });
      setBalance(newBal);
    },
    [balance],
  );

  const getBalance = useCallback(async () => {
    const bal = await fetchBalance();
    setBalance(bal);
  }, []);

  const resetBalance = useCallback(() => {
    const resetBal = {
      amount: 5000,
      currencyCode: "USD",
      fractionalDigits: 2,
    };
    setBalance(resetBal);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      getBalance().catch(console.error);
    }
  }, [getBalance, isHydrated]);

  const value = useMemo(
    () => ({
      balance,
      getBalance,
      updateBalance,
      resetBalance,
    }),
    [balance, getBalance, updateBalance, resetBalance],
  );
  return <AccountCtx value={value}>{children}</AccountCtx>;
};

const useAccountCtx = () => {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("AccountCtxProvider is missing");
  return ctx;
};

export { AccountCtx, AccountCtxProvider, useAccountCtx };
