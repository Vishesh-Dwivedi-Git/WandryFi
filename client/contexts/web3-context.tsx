"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface Web3ContextType {
  account: string | null
  balance: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connectWallet: (walletType: string) => Promise<void>
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
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          await updateBalance(accounts[0])
          await updateChainId()
        }
      }
    } catch (err) {
      console.error("Failed to check connection:", err)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(Number.parseInt(chainId, 16))
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const updateBalance = async (address: string) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        // Convert from wei to ETH
        const ethBalance = (Number.parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
        setBalance(ethBalance)
      }
    } catch (err) {
      console.error("Failed to get balance:", err)
    }
  }

  const updateChainId = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(Number.parseInt(chainId, 16))
      }
    } catch (err) {
      console.error("Failed to get chain ID:", err)
    }
  }

  const connectWallet = async (walletType: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window === "undefined") {
        throw new Error("Window is not available")
      }

      let provider = null

      switch (walletType) {
        case "metamask":
          if (!window.ethereum) {
            throw new Error("MetaMask is not installed")
          }
          provider = window.ethereum
          break
        case "walletconnect":
          // For WalletConnect, you'd typically use a library like @walletconnect/web3-provider
          throw new Error("WalletConnect integration requires additional setup")
        case "coinbase":
          // For Coinbase Wallet, you'd use their SDK
          throw new Error("Coinbase Wallet integration requires additional setup")
        default:
          throw new Error("Unsupported wallet type")
      }

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        await updateBalance(accounts[0])
        await updateChainId()
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
      console.error("Wallet connection error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
    setChainId(null)
    setIsConnected(false)
    setError(null)
  }

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
      }
    } catch (err: any) {
      if (err.code === 4902) {
        // Network not added to wallet
        setError("Please add this network to your wallet")
      } else {
        setError("Failed to switch network")
      }
      throw err
    }
  }

  const sendTransaction = async (to: string, value: string): Promise<string> => {
    try {
      if (!account || typeof window === "undefined" || !window.ethereum) {
        throw new Error("Wallet not connected")
      }

      const transactionParameters = {
        to,
        from: account,
        value: `0x${(Number.parseFloat(value) * Math.pow(10, 18)).toString(16)}`, // Convert ETH to wei
      }

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })

      return txHash
    } catch (err: any) {
      setError(err.message || "Transaction failed")
      throw err
    }
  }

  const value: Web3ContextType = {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
