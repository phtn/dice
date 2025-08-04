import { getAccount } from "@/app/actions";
import { Balance, UserAccount } from "./types";

export const fetchBalance = async () => {
  const account = await getAccount();
  const res = await fetch("/api/account/balance", {
    method: "POST",
    headers: {
      accept: "application/json",
      contentType: "application/json",
      "x-directive": "get",
    },
    body: JSON.stringify(account),
  });
  const data = (await res.json()) as UserAccount;
  return data.balance;
};

export const updateBalance = async (
  amount: number,
): Promise<{ message: string }> => {
  const response = await fetch("/api/account/balance", {
    method: "POST",
    headers: {
      accept: "application/json",
      contentType: "application/json",
      "x-directive": "set",
    },
    body: JSON.stringify({ currencyCode: "PHP", fractionalDigits: 2, amount }),
  });
  return await response.json();
};

export const fetchAccount = async (): Promise<Balance> => {
  const res = await fetch("/api/account/balance", {
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });
  const data = (await res.json()) as Balance;
  return data;
};
