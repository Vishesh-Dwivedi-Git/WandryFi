"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useWanderfy } from "@/contexts/wanderify-context"
import type { JSX } from "react/jsx-runtime"

interface ActiveQuest {
  id: string
  destinationName: string
  stakeAmount: number
  timeRemaining: number // percentage
  image: string
  status: "in-progress" | "ready-for-checkin"
}

interface Trophy {
  id: string
  locationName: string
  icon: string
  dateEarned: string
  rarity: "common" | "rare" | "legendary"
}

interface MyTravelPageProps {
  onNavigationView: (show: boolean) => void
}

const MyTravelPage = ({ onNavigationView }: MyTravelPageProps) => {
  const [activeTab, setActiveTab] = useState<"active-quests" | "trophy-case">("active-quests")
  const { activeQuests, trophies } = useWanderfy()

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-green-400 bg-green-400/10"
      case "rare":
        return "border-neon-gold bg-neon-gold/10"
      case "legendary":
        return "border-neon-magenta bg-neon-magenta/10"
      default:
        return "border-border bg-muted/10"
    }
  }

  const getPixelIcon = (icon: string) => {
    const iconMap: Record<string, JSX.Element> = {
      waterfall: (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="12" y="4" width="8" height="24" fill="currentColor" className="text-blue-400" />
          <rect x="8" y="8" width="4" height="16" fill="currentColor" className="text-blue-300" />
          <rect x="20" y="8" width="4" height="16" fill="currentColor" className="text-blue-300" />
          <rect x="4" y="24" width="24" height="4" fill="currentColor" className="text-blue-500" />
        </svg>
      ),
      temple: (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="4" y="20" width="24" height="8" fill="currentColor" className="text-neon-gold" />
          <rect x="8" y="12" width="16" height="8" fill="currentColor" className="text-neon-gold" />
          <rect x="12" y="4" width="8" height="8" fill="currentColor" className="text-neon-gold" />
          <rect x="14" y="2" width="4" height="2" fill="currentColor" className="text-neon-gold" />
        </svg>
      ),
      coral: (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="8" y="16" width="4" height="12" fill="currentColor" className="text-pink-400" />
          <rect x="20" y="12" width="4" height="16" fill="currentColor" className="text-orange-400" />
          <rect x="14" y="8" width="4" height="20" fill="currentColor" className="text-red-400" />
          <rect x="4" y="24" width="24" height="4" fill="currentColor" className="text-blue-400" />
        </svg>
      ),
      ruins: (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="4" y="20" width="6" height="8" fill="currentColor" className="text-gray-400" />
          <rect x="12" y="16" width="8" height="12" fill="currentColor" className="text-gray-400" />
          <rect x="22" y="18" width="6" height="10" fill="currentColor" className="text-gray-400" />
          <rect x="8" y="12" width="4" height="4" fill="currentColor" className="text-gray-300" />
        </svg>
      ),
      snowflake: (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="14" y="4" width="4" height="24" fill="currentColor" className="text-blue-200" />
          <rect x="4" y="14" width="24" height="4" fill="currentColor" className="text-blue-200" />
          <rect
            x="8"
            y="8"
            width="16"
            height="2"
            fill="currentColor"
            className="text-blue-200"
            transform="rotate(45 16 16)"
          />
          <rect
            x="8"
            y="22"
            width="16"
            height="2"
            fill="currentColor"
            className="text-blue-200"
            transform="rotate(-45 16 16)"
          />
        </svg>
      ),
      volcano: (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="8" y="16" width="16" height="12" fill="currentColor" className="text-red-600" />
          <rect x="12" y="8" width="8" height="8" fill="currentColor" className="text-red-500" />
          <rect x="14" y="4" width="4" height="4" fill="currentColor" className="text-orange-400" />
          <rect x="16" y="2" width="2" height="2" fill="currentColor" className="text-yellow-400" />
        </svg>
      ),
    }
    return iconMap[icon] || iconMap.ruins
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="font-pixel text-3xl text-neon-cyan mb-8 text-center">My Travel</h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === "active-quests" ? "default" : "ghost"}
              onClick={() => setActiveTab("active-quests")}
              className={cn(
                "font-pixel text-sm px-6 py-2",
                activeTab === "active-quests" ? "bg-neon-cyan text-background" : "",
              )}
            >
              Active Quests
            </Button>
            <Button
              variant={activeTab === "trophy-case" ? "default" : "ghost"}
              onClick={() => setActiveTab("trophy-case")}
              className={cn(
                "font-pixel text-sm px-6 py-2",
                activeTab === "trophy-case" ? "bg-neon-cyan text-background" : "",
              )}
            >
              Trophy Case
            </Button>
          </div>
        </div>

        {/* Active Quests Tab */}
        {activeTab === "active-quests" && (
          <div className="space-y-6">
            {activeQuests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active quests. Start exploring to begin your journey!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeQuests.map((quest) => (
                  <Card
                    key={quest.id}
                    className="bg-card border border-border hover:border-neon-cyan/50 transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={quest.image || "/placeholder.svg"}
                          alt={quest.destinationName}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-pixel text-lg text-foreground mb-4">{quest.destinationName}</h3>

                        <div className="space-y-4">
                          {/* Stake Amount */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Staked:</span>
                            <span className="font-pixel text-neon-gold">{quest.stakeAmount} WNDR</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Time Remaining:</span>
                              <span className="text-sm text-foreground">{quest.timeRemaining}%</span>
                            </div>
                            <Progress value={quest.timeRemaining} className="h-2" />
                          </div>

                          {/* Action Button */}
                          <Button
                            onClick={() => onNavigationView(true)}
                            disabled={quest.status !== "ready-for-checkin"}
                            className={cn(
                              "w-full font-pixel py-3",
                              quest.status === "ready-for-checkin"
                                ? "bg-neon-magenta text-background hover:bg-neon-magenta/90 glow-magenta"
                                : "bg-muted text-muted-foreground cursor-not-allowed",
                            )}
                          >
                            {quest.status === "ready-for-checkin" ? "Begin Final Approach" : "Quest in Progress"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trophy Case Tab */}
        {activeTab === "trophy-case" && (
          <div className="space-y-6">
            {trophies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No trophies earned yet. Complete quests to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trophies.map((trophy) => (
                  <div
                    key={trophy.id}
                    className={cn(
                      "aspect-square rounded-lg border-2 p-4 flex flex-col items-center justify-center group hover:scale-105 transition-all duration-300",
                      getRarityColor(trophy.rarity),
                    )}
                  >
                    {/* Trophy Icon */}
                    <div className="w-12 h-12 mb-2">{getPixelIcon(trophy.icon)}</div>

                    {/* Trophy Info */}
                    <div className="text-center">
                      <p className="font-pixel text-xs text-foreground mb-1 line-clamp-2">{trophy.locationName}</p>
                      <p className="text-xs text-muted-foreground">{trophy.dateEarned}</p>
                    </div>

                    {/* Rarity Indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          trophy.rarity === "common" && "bg-green-400",
                          trophy.rarity === "rare" && "bg-neon-gold",
                          trophy.rarity === "legendary" && "bg-neon-magenta",
                        )}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trophy Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="font-pixel text-2xl text-neon-cyan">{trophies.length}</div>
                <div className="text-sm text-muted-foreground">Total Badges</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="font-pixel text-2xl text-neon-gold">
                  {trophies.filter((t) => t.rarity === "rare" || t.rarity === "legendary").length}
                </div>
                <div className="text-sm text-muted-foreground">Rare+ Badges</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="font-pixel text-2xl text-neon-magenta">
                  {trophies.filter((t) => t.rarity === "legendary").length}
                </div>
                <div className="text-sm text-muted-foreground">Legendary</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTravelPage
