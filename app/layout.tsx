import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { pickLang } from "@/lib/copy";
import "./globals.css";

export const metadata: Metadata = {
  title: "bitbaum sign-in",
  description: "One sign-in for bitbaum apps. Each app sees a different, unlinkable identifier.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = pickLang((await headers()).get("accept-language"));
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
