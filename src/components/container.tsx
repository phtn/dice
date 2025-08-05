import { type PropsWithChildren } from "react";

export const Container = ({ children }: PropsWithChildren) => (
  <main className="md:container mx-auto overflow-x-hidden grid grid-rows py-2 items-start justify-items-center min-h-[94vh] p-4 gap-6 font-[family-name:var(--font-geist-sans)]">
    {children}
  </main>
);
