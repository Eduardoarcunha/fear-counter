import type { Metadata } from "next";
import "./globals.css";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata: Metadata = {
  title: "Daggerheart Fear Counter",
  description: "Minimal, scary fear tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cinzel.className}>{children}</body>
    </html>
  );
}
