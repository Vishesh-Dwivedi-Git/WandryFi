/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Coins, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { ScrollReveal } from "@/components/scroll-reveal"
import { useGame } from "@/contexts/game-context"
import Link from "next/link"

export default function StakePage() {
  const { userStakes, userProfile } = useGame()

  const getTimeRemaining = (stake: any) => {
    if (stake.status !== "active") return null

    const now = Date.now()
    const endTime = stake.timestamp + stake.timeLimit
    const remaining = endTime - now

    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      case "expired":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "expired":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Use game context data instead of localStorage directly
  const totalStaked = userProfile?.totalStaked || 0
  const activeStakes = userStakes.filter((stake) => stake.status === "active")
  const completedStakes = userStakes.filter((stake) => stake.status === "completed")

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">WANDRIFY</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="text-gray-300 hover:text-purple-400 transition-colors">
              Explore
            </Link>
            <Link href="/stake" className="text-purple-400 font-medium">
              Stake
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-purple-400 transition-colors">
              Leaderboard
            </Link>
          </nav>
          <WalletConnect />
        </div>
      </header>

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-center mb-8 text-white">
              Your <span className="text-purple-400">Stakes</span>
            </h1>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Track your active adventures and manage your staked positions
            </p>
          </ScrollReveal>

          {/* Stats Overview */}
          <ScrollReveal delay={0.2}>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Coins className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-heading font-bold text-card-foreground">
                    {totalStaked.toFixed(3)} ETH
                  </div>
                  <div className="text-gray-300">Total Staked</div>
                </CardContent>
              </Card>

              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-heading font-bold text-card-foreground">{activeStakes.length}</div>
                  <div className="text-gray-300">Active Adventures</div>
                </CardContent>
              </Card>

              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-heading font-bold text-card-foreground">{completedStakes.length}</div>
                  <div className="text-gray-300">Completed</div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>

          {/* Stakes List */}
          {userStakes.length > 0 ? (
            <div className="space-y-4">
              {userStakes.map((stake, index) => (
                <ScrollReveal key={`${stake.placeId}-${stake.timestamp}`} delay={index * 0.1}>
                  <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-heading font-bold text-card-foreground mb-2">
                            {stake.placeName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <div className="flex items-center space-x-1">
                              <Coins className="h-4 w-4" />
                              <span>{stake.amount} ETH</span>
                            </div>
                            {stake.status === "active" && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{getTimeRemaining(stake)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getStatusColor(stake.status)}`}
                        >
                          {getStatusIcon(stake.status)}
                          <span className="capitalize">{stake.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          Difficulty: <span className="text-card-foreground font-medium">{stake.difficulty}</span>
                        </div>
                        {stake.status === "active" && (
                          <Link
                            href={`/navigate/${stake.placeId}`}
                            className="px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
                          >
                            Navigate
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold text-card-foreground mb-2">No Stakes Yet</h3>
                  <p className="text-gray-300 mb-6">
                    Start your adventure by exploring and staking on mysterious destinations
                  </p>
                  <Link
                    href="/explore"
                    className="inline-flex items-center px-6 py-3 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
                  >
                    Explore Destinations
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  )
}
