import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, sepolia, hardhat, localhost } from "wagmi/chains"

// Define custom localhost chain for Anvil/Hardhat
const anvilChain = {
  ...localhost,
  id: 31337,
  name: "Anvil",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
}

export const wagmiConfig = getDefaultConfig({
  appName: "WANDRIFY - Web3 Travel Staking",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id",
  chains: [mainnet, sepolia, anvilChain, hardhat],
  ssr: true,
})
