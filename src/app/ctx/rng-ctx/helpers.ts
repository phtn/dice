export const fetchServerSeed = async (): Promise<string> => {
  const res = await fetch("/api/seed", {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });
  const data = (await res.json()) as { sS: string };
  return data.sS ?? "";
};
