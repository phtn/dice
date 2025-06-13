import { Dispatch, SetStateAction } from "react";

export const asyncFn =
  <T, R>(fn: (params: T) => Promise<R>, set: Dispatch<SetStateAction<R>>) =>
  () =>
  async (params: T) =>
    set(await fn(params));
