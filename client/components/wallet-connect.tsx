"use client"

import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown, AlertCircle, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/contexts/web3-context"

export function WalletConnect() {
  const {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3()

  // Ethereum mainnet chain ID
  const ETHEREUM_MAINNET_CHAIN_ID = 1

  const handleConnect = async (walletType: string) => {
    try {
      await connectWallet(walletType)
    } catch (err) {
      console.error("Connection failed:", err)
    }
  }

  const handleSwitchToMainnet = async () => {
    try {
      await switchNetwork(ETHEREUM_MAINNET_CHAIN_ID)
    } catch (err) {
      console.error("Network switch failed:", err)
    }
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
    }
  }

  if (error) {
    return (
      <Alert className="max-w-sm">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isConnecting) {
    return (
      <Button disabled className="sketch-border bg-accent/50">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        {/* Network indicator */}
        {chainId !== ETHEREUM_MAINNET_CHAIN_ID && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchToMainnet}
            className="sketch-border bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20"
          >
            Wrong Network
          </Button>
        )}

        {/* Wallet info dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sketch-border bg-card/50 backdrop-blur-sm">
              <Wallet className="h-4 w-4 mr-2" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">{balance ? `${balance} ETH` : "Loading..."}</span>
                <span className="text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
              <div className="flex flex-col">
                <span>Copy Address</span>
                <span className="text-xs text-muted-foreground">{account}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-destructive">
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="sketch-border bg-accent hover:bg-accent/90 text-accent-foreground">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleConnect("metamask")} className="cursor-pointer">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-2 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            MetaMask
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleConnect("walletconnect")} className="cursor-pointer" disabled>
          <div className="flex items-center opacity-50">
            <div className="w-6 h-6 mr-2 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">W</span>
            </div>
            WalletConnect (Coming Soon)
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleConnect("coinbase")} className="cursor-pointer" disabled>
          <div className="flex items-center opacity-50">
            <div className="w-6 h-6 mr-2 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            Coinbase Wallet (Coming Soon)
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
