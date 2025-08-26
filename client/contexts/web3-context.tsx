/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAccount, useBalance, useChainId, useDisconnect, useSendTransaction, useSwitchChain } from "wagmi"
import { parseEther, formatEther } from "viem"

interface Web3ContextType {
  account: string | null
  balance: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  sendTransaction: (to: string, value: string) => Promise<string>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected, isConnecting } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, error: txError, isPending: isTxPending } = useSendTransaction()

  const disconnectWallet = () => {
    disconnect()
  }

  const switchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId })
    } catch (err: any) {
      throw new Error(`Failed to switch to chain ${targetChainId}: ${err.message}`)
    }
  }

  const sendTransactionWrapper = async (to: string, value: string): Promise<string> => {
    try {
      if (!address) {
        throw new Error("Wallet not connected")
      }

      const hash = await sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(value),
      })

      return hash
    } catch (err: any) {
      throw new Error(`Transaction failed: ${err.message}`)
    }
  }

  const value: Web3ContextType = {
    account: address || null,
    balance: balanceData ? formatEther(balanceData.value) : null,
    chainId: chainId || null,
    isConnected,
    isConnecting,
    error: txError?.message || null,
    disconnectWallet,
    switchNetwork,
    sendTransaction: sendTransactionWrapper,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
