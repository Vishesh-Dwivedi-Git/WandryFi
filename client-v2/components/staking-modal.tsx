"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useWanderfy } from "@/contexts/wanderify-context"

interface Destination {
  id: string
  name: string
  image: string
  rewardPool: number
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  coordinates: { x: number; y: number }
}

interface StakingModalProps {
  destination: Destination
  onClose: () => void
  onAcceptQuest: (amount: number) => void
}

export default function StakingModal({ destination, onClose, onAcceptQuest }: StakingModalProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const { acceptQuest } = useWanderfy()

  const handleAcceptQuest = () => {
    const amount = Number.parseFloat(stakeAmount)
    if (amount > 0) {
      acceptQuest(destination, amount)
      onAcceptQuest(amount)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400"
      case "Medium":
        return "text-neon-gold"
      case "Hard":
        return "text-neon-magenta"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-pixel text-xl text-neon-cyan">Quest Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          <div className="relative overflow-hidden rounded-lg mb-6">
            <img
              src={destination.image || "/placeholder.svg"}
              alt={destination.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>

          {/* Destination Info */}
          <div className="mb-6">
            <h3 className="font-pixel text-2xl text-foreground mb-4">{destination.name}</h3>
            <p className="text-muted-foreground mb-4">{destination.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Reward Pool</div>
                <div className="font-pixel text-lg text-neon-gold">{destination.rewardPool} WNDR</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                <div className={`font-pixel text-lg ${getDifficultyColor(destination.difficulty)}`}>
                  {destination.difficulty}
                </div>
              </div>
            </div>
          </div>

          {/* Quest Requirements */}
          <div className="mb-6">
            <h4 className="font-pixel text-lg text-foreground mb-3">Quest Requirements</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                <span>Travel to the destination coordinates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                <span>Complete the check-in process</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                <span>Submit proof of visit</span>
              </div>
            </div>
          </div>

          {/* Stake Input */}
          <div className="mb-6">
            <Label htmlFor="stake-amount" className="font-pixel text-sm text-foreground mb-2 block">
              Stake Amount (WNDR)
            </Label>
            <Input
              id="stake-amount"
              type="number"
              placeholder="Enter amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="bg-muted border-border focus:border-neon-cyan"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Minimum stake: 10 WNDR. Higher stakes increase potential rewards.
            </p>
          </div>

          {/* Accept Quest Button */}
          <Button
            onClick={handleAcceptQuest}
            disabled={!stakeAmount || Number.parseFloat(stakeAmount) < 10}
            className="w-full font-pixel text-lg py-6 bg-neon-cyan text-background hover:bg-neon-cyan/90 glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accept Quest
          </Button>
        </div>
      </div>
    </div>
  )
}
