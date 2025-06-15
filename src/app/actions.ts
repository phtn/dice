"use server";

import { cookies } from "next/headers";
import { UserAccount } from "./ctx/acc-ctx/types";

export const setAccount = async (account: UserAccount) => {
  const store = await cookies();
  const s = JSON.stringify(account);
  store.set("fair-dice-account", s);
};
export const getAccount = async (): Promise<UserAccount> => {
  const store = await cookies();
  const account = store.get("fair-dice-account")?.value;
  return account && JSON.parse(account);
};
