"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Coins, Star, AlertTriangle, TrendingUp } from "lucide-react"
import { useWeb3 } from "@/contexts/web3-context"
import { useGame } from "@/contexts/game-context"
import { useRouter } from "next/navigation"

interface Place {
  id: string
  name: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard" | "Legendary"
  timeLimit: number
  minStake: number
  maxReward: number
  currentStakes: number
  successRate: number
  image: string
  coordinates: { lat: number; lng: number }
  category: "Ancient" | "Mystical" | "Futuristic" | "Legendary"
}

interface PlaceStakeModalProps {
  place: Place
  isOpen: boolean
  onClose: () => void
}

export function PlaceStakeModal({ place, isOpen, onClose }: PlaceStakeModalProps) {
  const [stakeAmount, setStakeAmount] = useState(place.minStake.toString())
  const [isStaking, setIsStaking] = useState(false)
  const { account, balance, isConnected, sendTransaction } = useWeb3()
  const { createStake, calculateReward, calculateExperience, communityPool } = useGame()
  const router = useRouter()

  const handleStake = async () => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    const amount = Number.parseFloat(stakeAmount)
    if (amount < place.minStake) {
      alert(`Minimum stake is ${place.minStake} ETH`)
      return
    }

    if (balance && amount > Number.parseFloat(balance)) {
      alert("Insufficient balance")
      return
    }

    setIsStaking(true)
    try {
      // In a real app, this would be a smart contract address
      const contractAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"

      const txHash = await sendTransaction(contractAddress, stakeAmount)

      // Create stake using game context
      await createStake(place, stakeAmount, txHash)

      alert("Stake successful! Redirecting to navigation...")
      onClose()
      router.push(`/navigate/${place.id}`)
    } catch (error) {
      console.error("Staking failed:", error)
      alert("Staking failed. Please try again.")
    } finally {
      setIsStaking(false)
    }
  }

  const mockStake = {
    placeId: place.id,
    placeName: place.name,
    amount: stakeAmount,
    timestamp: Date.now(),
    timeLimit: place.timeLimit * 60 * 60 * 1000,
    coordinates: place.coordinates,
    txHash: "mock",
    status: "active" as const,
  }

  const potentialReward = calculateReward(mockStake, place, true).toFixed(3)
  const potentialExperience = calculateExperience(mockStake, place, true)
  const transactionFee = (Number.parseFloat(stakeAmount) * 0.02).toFixed(4)

  const riskLevel =
    place.difficulty === "Easy"
      ? "Low"
      : place.difficulty === "Medium"
        ? "Medium"
        : place.difficulty === "Hard"
          ? "High"
          : "Extreme"

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "Hard":
        return "bg-orange-500/20 text-orange-700 border-orange-500/30"
      case "Legendary":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sketch-border bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-card-foreground">{place.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Place Image and Info */}
          <div className="relative h-48 overflow-hidden rounded-lg">
            <img src={place.image || "/placeholder.svg"} alt={place.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={`${getDifficultyColor(place.difficulty)} border`}>{place.difficulty}</Badge>
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                {place.category}
              </Badge>
            </div>
          </div>

          <p className="text-muted-foreground">{place.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
              <div className="text-sm font-medium">{place.timeLimit}h</div>
              <div className="text-xs text-muted-foreground">Time Limit</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <Star className="h-5 w-5 text-accent mx-auto mb-1" />
              <div className="text-sm font-medium">{place.successRate}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-accent mx-auto mb-1" />
              <div className="text-sm font-medium">{place.maxReward}x</div>
              <div className="text-xs text-muted-foreground">Max Reward</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <Coins className="h-5 w-5 text-accent mx-auto mb-1" />
              <div className="text-sm font-medium">{place.currentStakes}</div>
              <div className="text-xs text-muted-foreground">ETH Staked</div>
            </div>
          </div>

          <Separator />

          {/* Staking Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="stake-amount" className="text-sm font-medium">
                Stake Amount (ETH)
              </Label>
              <Input
                id="stake-amount"
                type="number"
                step="0.01"
                min={place.minStake}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="mt-1 sketch-border bg-background/50"
                placeholder={`Min: ${place.minStake} ETH`}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Min: {place.minStake} ETH</span>
                {balance && <span>Balance: {balance} ETH</span>}
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Community Pool</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Pool: </span>
                  <span className="font-medium text-blue-600">{communityPool.totalAmount.toFixed(2)} ETH</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Transaction Fee: </span>
                  <span className="font-medium text-blue-600">{transactionFee} ETH (2%)</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="p-4 bg-secondary/10 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-accent" />
                <span className="font-medium text-sm">Adventure Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Risk Level: </span>
                  <span
                    className={`font-medium ${riskLevel === "Low" ? "text-green-600" : riskLevel === "Medium" ? "text-yellow-600" : riskLevel === "High" ? "text-orange-600" : "text-red-600"}`}
                  >
                    {riskLevel}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Potential Reward: </span>
                  <span className="font-medium text-accent">{potentialReward} ETH</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Experience Gain: </span>
                  <span className="font-medium text-purple-600">{potentialExperience} XP</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Stake: </span>
                  <span className="font-medium text-foreground">
                    {(Number.parseFloat(stakeAmount) - Number.parseFloat(transactionFee)).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 sketch-border bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleStake}
                disabled={!isConnected || isStaking || Number.parseFloat(stakeAmount) < place.minStake}
                className="flex-1 sketch-border bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isStaking ? "Staking..." : `Stake ${stakeAmount} ETH`}
              </Button>
            </div>

            {!isConnected && (
              <p className="text-center text-sm text-muted-foreground">Connect your wallet to start staking</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
