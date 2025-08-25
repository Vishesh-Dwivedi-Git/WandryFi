"use client"

import { ReactNode } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/lib/wagmi-config"
import { Web3Provider } from "@/contexts/web3-context"
import { GameProvider } from "@/contexts/game-context"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"


const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <Web3Provider>
            <GameProvider>{children}</GameProvider>
          </Web3Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
