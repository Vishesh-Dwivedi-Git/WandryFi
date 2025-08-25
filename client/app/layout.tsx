import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"   // ✅ Add this
import Providers from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WANDRIFY - Web3 Travel Staking",
  description: "Decentralized travel staking platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
