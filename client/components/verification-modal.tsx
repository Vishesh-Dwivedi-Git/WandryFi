"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Camera, MapPin, Clock, Trophy, Sparkles } from "lucide-react"
import { useGame } from "@/contexts/game-context"

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

interface UserStake {
  placeId: string
  placeName: string
  amount: string
  timestamp: number
  timeLimit: number
  coordinates: { lat: number; lng: number }
  txHash: string
  status: "active" | "completed" | "failed" | "expired"
}

interface VerificationModalProps {
  place: Place
  userStake: UserStake
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function VerificationModal({ place, userStake, isOpen, onClose, onSuccess }: VerificationModalProps) {
  const [verificationStep, setVerificationStep] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const { completeAdventure, calculateReward, calculateExperience } = useGame()

  const verificationSteps = [
    "Scanning location coordinates...",
    "Analyzing environmental markers...",
    "Verifying ancient energy signatures...",
    "Confirming arrival at destination...",
    "Processing reward calculation...",
  ]

  useEffect(() => {
    if (isVerifying) {
      const interval = setInterval(() => {
        setVerificationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(async () => {
              await completeAdventure(userStake.txHash, true)
              setIsVerifying(false)
              onSuccess()
            }, 1000)
            return 100
          }
          return prev + 2
        })
      }, 100)

      const stepInterval = setInterval(() => {
        setVerificationStep((prev) => {
          if (prev >= verificationSteps.length - 1) {
            clearInterval(stepInterval)
            return prev
          }
          return prev + 1
        })
      }, 1000)

      return () => {
        clearInterval(interval)
        clearInterval(stepInterval)
      }
    }
  }, [isVerifying, onSuccess, verificationSteps.length, completeAdventure, userStake.txHash])

  const handleStartVerification = () => {
    setIsVerifying(true)
    setVerificationProgress(0)
    setVerificationStep(0)
  }

  const rewardAmount = calculateReward(userStake, place, true).toFixed(3)
  const experienceGained = calculateExperience(userStake, place, true)
  const profit = (Number.parseFloat(rewardAmount) - Number.parseFloat(userStake.amount)).toFixed(3)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sketch-border bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-card-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-accent" />
            Arrival Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Place Info */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={place.image || "/placeholder.svg"}
                alt={place.name}
                className="w-full h-full object-cover rounded-full border-4 border-accent"
              />
              <div className="absolute -bottom-2 -right-2 bg-accent rounded-full p-2">
                <CheckCircle className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-heading font-bold text-card-foreground">{place.name}</h3>
            <Badge
              className={`${
                place.difficulty === "Easy"
                  ? "bg-green-500/20 text-green-700 border-green-500/30"
                  : place.difficulty === "Medium"
                    ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                    : place.difficulty === "Hard"
                      ? "bg-orange-500/20 text-orange-700 border-orange-500/30"
                      : "bg-red-500/20 text-red-700 border-red-500/30"
              } border mt-2`}
            >
              {place.difficulty} Difficulty
            </Badge>
          </div>

          {!isVerifying && verificationProgress === 0 && (
            <>
              {/* Verification Instructions */}
              <div className="p-4 bg-secondary/10 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-4 w-4 text-accent" />
                  <span className="font-medium text-sm">Verification Process</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our ancient sensors will verify your arrival at {place.name}. This process uses mystical energy
                  signatures and location coordinates to confirm your presence.
                </p>
              </div>

              {/* Reward Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
                  <div className="text-sm font-medium">{userStake.amount} ETH</div>
                  <div className="text-xs text-muted-foreground">Staked</div>
                </div>
                <div className="text-center p-3 bg-accent/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                  <div className="text-sm font-medium">{rewardAmount} ETH</div>
                  <div className="text-xs text-muted-foreground">Total Reward</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Sparkles className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-green-600">+{profit} ETH Profit</div>
                  <div className="text-xs text-green-600">Congratulations!</div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Trophy className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-purple-600">+{experienceGained} XP</div>
                  <div className="text-xs text-purple-600">Experience Gained</div>
                </div>
              </div>

              <Button
                onClick={handleStartVerification}
                className="w-full sketch-border bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Start Verification Process
              </Button>
            </>
          )}

          {isVerifying && (
            <>
              {/* Verification Progress */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-accent mb-2">
                    {Math.round(verificationProgress)}%
                  </div>
                  <Progress value={verificationProgress} className="h-3" />
                </div>

                <div className="p-4 bg-secondary/10 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                    <span className="font-medium text-sm">Verification in Progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{verificationSteps[verificationStep]}</p>
                </div>

                {/* Mystical Animation */}
                <div className="text-center py-8">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto bg-accent/10 rounded-full animate-ping"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-accent animate-bounce" />
                  </div>
                </div>
              </div>
            </>
          )}

          {verificationProgress === 100 && !isVerifying && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-green-600 mb-2">Verification Complete!</h3>
              <p className="text-muted-foreground">Your arrival has been confirmed. Rewards are being processed...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
