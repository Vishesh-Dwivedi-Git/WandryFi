import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Press_Start_2P, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Wanderify - Travel to Earn",
  description: "Discover a New World. Connect Your Compass.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${pixelFont.variable} ${serifFont.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
