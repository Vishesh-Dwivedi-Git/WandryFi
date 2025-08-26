"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Destination {
  id: string
  name: string
  image: string
  rewardPool: number
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  coordinates: { x: number; y: number }
}

interface ActiveQuest {
  id: string
  destinationName: string
  stakeAmount: number
  timeRemaining: number
  image: string
  status: "in-progress" | "ready-for-checkin"
  destinationId: string
}

interface Trophy {
  id: string
  locationName: string
  icon: string
  dateEarned: string
  rarity: "common" | "rare" | "legendary"
  destinationId: string
}

interface WanderfyContextType {
  activeQuests: ActiveQuest[]
  trophies: Trophy[]
  acceptQuest: (destination: Destination, stakeAmount: number) => void
  completeQuest: (questId: string) => void
  isQuestActive: (destinationId: string) => boolean
}

const WanderfyContext = createContext<WanderfyContextType | undefined>(undefined)

export function WanderfyProvider({ children }: { children: ReactNode }) {
  const [activeQuests, setActiveQuests] = useState<ActiveQuest[]>([
    {
      id: "1",
      destinationName: "Nrupatunga Betta",
      stakeAmount: 500,
      timeRemaining: 75,
      image: "/mountain-peak-sunset.png",
      status: "in-progress",
      destinationId: "1",
    },
    {
      id: "2",
      destinationName: "Crystal Caves",
      stakeAmount: 750,
      timeRemaining: 25,
      image: "/crystal-cave-glowing.png",
      status: "ready-for-checkin",
      destinationId: "3",
    },
    {
      id: "3",
      destinationName: "Desert Oasis",
      stakeAmount: 200,
      timeRemaining: 90,
      image: "/desert-oasis-palm-trees.png",
      status: "in-progress",
      destinationId: "4",
    },
  ])

  const [trophies, setTrophies] = useState<Trophy[]>([
    {
      id: "1",
      locationName: "Mystic Falls",
      icon: "waterfall",
      dateEarned: "2024-01-15",
      rarity: "rare",
      destinationId: "2",
    },
    {
      id: "2",
      locationName: "Sky Temple",
      icon: "temple",
      dateEarned: "2024-01-10",
      rarity: "legendary",
      destinationId: "5",
    },
    {
      id: "3",
      locationName: "Coral Gardens",
      icon: "coral",
      dateEarned: "2024-01-05",
      rarity: "common",
      destinationId: "6",
    },
    {
      id: "4",
      locationName: "Ancient Ruins",
      icon: "ruins",
      dateEarned: "2023-12-28",
      rarity: "rare",
      destinationId: "7",
    },
    {
      id: "5",
      locationName: "Frozen Lake",
      icon: "snowflake",
      dateEarned: "2023-12-20",
      rarity: "common",
      destinationId: "8",
    },
    {
      id: "6",
      locationName: "Volcano Peak",
      icon: "volcano",
      dateEarned: "2023-12-15",
      rarity: "legendary",
      destinationId: "9",
    },
  ])

  const acceptQuest = (destination: Destination, stakeAmount: number) => {
    const newQuest: ActiveQuest = {
      id: Date.now().toString(),
      destinationName: destination.name,
      stakeAmount,
      timeRemaining: 100,
      image: destination.image,
      status: "in-progress",
      destinationId: destination.id,
    }

    setActiveQuests((prev) => [...prev, newQuest])
  }

  const completeQuest = (questId: string) => {
    const quest = activeQuests.find((q) => q.id === questId)
    if (!quest) return

    // Remove from active quests
    setActiveQuests((prev) => prev.filter((q) => q.id !== questId))

    // Add to trophies
    const newTrophy: Trophy = {
      id: Date.now().toString(),
      locationName: quest.destinationName,
      icon: getIconForDestination(quest.destinationName),
      dateEarned: new Date().toISOString().split("T")[0],
      rarity: getRarityForDifficulty(quest.stakeAmount),
      destinationId: quest.destinationId,
    }

    setTrophies((prev) => [newTrophy, ...prev])
  }

  const isQuestActive = (destinationId: string) => {
    return activeQuests.some((quest) => quest.destinationId === destinationId)
  }

  const getIconForDestination = (name: string): string => {
    const iconMap: Record<string, string> = {
      "Nrupatunga Betta": "mountain",
      "Crystal Caves": "crystal",
      "Desert Oasis": "oasis",
      "Mystic Falls": "waterfall",
      "Sky Temple": "temple",
      "Coral Gardens": "coral",
    }
    return iconMap[name] || "ruins"
  }

  const getRarityForDifficulty = (stakeAmount: number): "common" | "rare" | "legendary" => {
    if (stakeAmount >= 750) return "legendary"
    if (stakeAmount >= 400) return "rare"
    return "common"
  }

  return (
    <WanderfyContext.Provider
      value={{
        activeQuests,
        trophies,
        acceptQuest,
        completeQuest,
        isQuestActive,
      }}
    >
      {children}
    </WanderfyContext.Provider>
  )
}

export function useWanderfy() {
  const context = useContext(WanderfyContext)
  if (context === undefined) {
    throw new Error("useWanderfy must be used within a WanderfyProvider")
  }
  return context
}
