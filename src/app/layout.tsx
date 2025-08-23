import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Red_Hat_Display,
} from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/nav";
import { ProvidersCtxProvider } from "@/ctx";
import { type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ToneCtxProvider } from "@/ctx/tone-ctx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const redhat = Red_Hat_Display({
  variable: "--font-redhat",
  subsets: ["latin"],
});
export const viewport: Viewport = {
  userScalable: false,
  initialScale: 1,
  maximumScale: 1,
};
export const metadata: Metadata = {
  title: "BET69.ph",
  description: "Provably Fair Demo",
  icons: ["/69-icon.svg"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${redhat.variable} ${space.variable} ${geistSans.variable} ${geistMono.variable} antialiased dark:bg-zinc-950 bg-zinc-950`}
      >
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <ProvidersCtxProvider>
            <Navbar />
            <ToneCtxProvider>{children}</ToneCtxProvider>
          </ProvidersCtxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
