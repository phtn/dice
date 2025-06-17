import { ServerSeed } from "@/app/utils/rng/types";

export const fetchServerSeed = async (): Promise<string> => {
  const res = await fetch("/api/seed", {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });
  const data = (await res.json()) as ServerSeed;
  return data.sS ?? "";
};
