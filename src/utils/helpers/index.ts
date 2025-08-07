import type { Dispatch, ReactElement, SetStateAction } from "react";

export const asyncFn =
  <T, R>(fn: (params: T) => Promise<R>, set: Dispatch<SetStateAction<R>>) =>
  () =>
  async (params: T) =>
    set(await fn(params));

export const opts = (...args: (ReactElement | null)[]) => {
  return new Map([
    [true, args[0]],
    [false, args[1]],
  ]);
};
