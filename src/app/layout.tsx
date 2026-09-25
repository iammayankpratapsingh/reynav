// Root layout: html shell, global styles and providers.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const script = Dancing_Script({ subsets: ["latin"], variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  title: "REYNAV — AI growth for local businesses",
  description: "Connect your website, Google Business Profile and booking system to find growth opportunities.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
