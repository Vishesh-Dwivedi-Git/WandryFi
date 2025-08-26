"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useWanderfy } from "@/contexts/wanderify-context"
import StakingModal from "@/components/staking-modal"

interface Destination {
  id: string
  name: string
  image: string
  rewardPool: number
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  coordinates: { x: number; y: number }
}

const destinations: Destination[] = [
  {
    id: "1",
    name: "Nrupatunga Betta",
    image: "/mountain-peak-sunset.png",
    rewardPool: 500,
    difficulty: "Hard",
    description: "A challenging mountain peak with breathtaking views and ancient ruins.",
    coordinates: { x: 25, y: 35 },
  },
  {
    id: "2",
    name: "Mystic Falls",
    image: "/waterfall-forest-mist.png",
    rewardPool: 350,
    difficulty: "Medium",
    description: "Hidden waterfall deep in the enchanted forest.",
    coordinates: { x: 60, y: 20 },
  },
  {
    id: "3",
    name: "Crystal Caves",
    image: "/crystal-cave-glowing.png",
    rewardPool: 750,
    difficulty: "Hard",
    description: "Underground crystal formations that glow with mysterious energy.",
    coordinates: { x: 80, y: 70 },
  },
  {
    id: "4",
    name: "Desert Oasis",
    image: "/desert-oasis-palm-trees.png",
    rewardPool: 200,
    difficulty: "Easy",
    description: "A peaceful oasis in the vast desert with ancient palm trees.",
    coordinates: { x: 15, y: 80 },
  },
  {
    id: "5",
    name: "Sky Temple",
    image: "/temple-clouds-floating.png",
    rewardPool: 1000,
    difficulty: "Hard",
    description: "A floating temple among the clouds, accessible only to the brave.",
    coordinates: { x: 45, y: 15 },
  },
  {
    id: "6",
    name: "Coral Gardens",
    image: "/coral-reef-underwater-colorful.png",
    rewardPool: 400,
    difficulty: "Medium",
    description: "Vibrant underwater coral gardens teeming with marine life.",
    coordinates: { x: 70, y: 50 },
  },
]

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("list")
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const { isQuestActive } = useWanderfy()

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-pixel text-3xl text-neon-cyan">Explore</h1>

          {/* View Toggle */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">View:</span>
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className={viewMode === "map" ? "bg-neon-cyan text-background" : ""}
              >
                Map View
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-neon-cyan text-background" : ""}
              >
                List View
              </Button>
            </div>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <div className="relative bg-card border border-border rounded-lg overflow-hidden h-[600px]">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background">
              {/* Grid pattern for retro feel */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--color-neon-cyan) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-neon-cyan) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            {/* Destination Markers */}
            {destinations.map((destination) => (
              <button
                key={destination.id}
                onClick={() => setSelectedDestination(destination)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${destination.coordinates.x}%`,
                  top: `${destination.coordinates.y}%`,
                }}
              >
                <div className="relative">
                  {/* Pulsing glow effect */}
                  <div className="absolute inset-0 w-8 h-8 bg-neon-cyan rounded-full animate-ping opacity-75"></div>

                  {/* Main marker */}
                  <div className="relative w-8 h-8 bg-neon-cyan rounded-full border-2 border-background flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-background" fill="currentColor">
                      <rect x="6" y="2" width="4" height="12" />
                      <rect x="2" y="6" width="12" height="4" />
                      <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                      {destination.name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                className={`group cursor-pointer bg-card border transition-all duration-300 hover:scale-105 ${
                  isQuestActive(destination.id)
                    ? "border-neon-gold/50 opacity-75"
                    : "border-border hover:border-neon-cyan/50 hover:glow-cyan/20"
                }`}
                onClick={() => !isQuestActive(destination.id) && setSelectedDestination(destination)}
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-pixel text-lg text-foreground mb-3">{destination.name}</h3>

                    {/* Quest Active Indicator */}
                    {isQuestActive(destination.id) && (
                      <div className="mb-3 px-3 py-1 bg-neon-gold/20 border border-neon-gold rounded-full text-center">
                        <span className="font-pixel text-xs text-neon-gold">QUEST ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reward Pool:</span>
                        <span className="font-pixel text-neon-gold">{destination.rewardPool} WNDR</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Difficulty:</span>
                        <span className={`font-pixel text-sm ${getDifficultyColor(destination.difficulty)}`}>
                          {destination.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{destination.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Staking Modal */}
        {selectedDestination && (
          <StakingModal
            destination={selectedDestination}
            onClose={() => setSelectedDestination(null)}
            onAcceptQuest={(amount) => {
              console.log(`Accepted quest for ${selectedDestination.name} with ${amount} WNDR`)
              setSelectedDestination(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
