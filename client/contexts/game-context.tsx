/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useWeb3 } from "./web3-context"

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
  difficulty: ReactNode
  placeId: string
  placeName: string
  amount: string
  timestamp: number
  timeLimit: number
  coordinates: { lat: number; lng: number }
  txHash: string
  status: "active" | "completed" | "failed" | "expired"
  rewardAmount?: number
  experienceGained?: number
}

interface UserProfile {
  address: string
  displayName: string
  level: number
  experience: number
  totalEarned: number
  totalStaked: number
  adventuresCompleted: number
  adventuresFailed: number
  successRate: number
  achievements: string[]
  favoriteCategory: string
  longestStreak: number
  currentStreak: number
  joinedDate: string
}

interface CommunityPool {
  totalAmount: number
  contributionsFromFees: number
  contributionsFromFailures: number
  lastUpdated: number
}

interface GameContextType {
  userProfile: UserProfile | null
  userStakes: UserStake[]
  communityPool: CommunityPool
  createStake: (place: Place, amount: string, txHash: string) => Promise<void>
  completeAdventure: (stakeId: string, success: boolean) => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => void
  calculateReward: (stake: UserStake, place: Place, success: boolean) => number
  calculateExperience: (stake: UserStake, place: Place, success: boolean) => number
  checkAchievements: (profile: UserProfile) => string[]
  getLeaderboard: () => UserProfile[]
  isLoading: boolean
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

interface GameProviderProps {
  children: ReactNode
}

export function GameProvider({ children }: GameProviderProps) {
  const { account, isConnected } = useWeb3()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const [communityPool, setCommunityPool] = useState<CommunityPool>({
    totalAmount: 156.7,
    contributionsFromFees: 89.2,
    contributionsFromFailures: 67.5,
    lastUpdated: Date.now(),
  })
  const [isLoading, setIsLoading] = useState(false)

  // Initialize user profile when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      initializeUserProfile(account)
      loadUserStakes(account)
    } else {
      setUserProfile(null)
      setUserStakes([])
    }
  }, [isConnected, account])

  // Auto-update expired stakes
  useEffect(() => {
    const interval = setInterval(() => {
      updateExpiredStakes()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [userStakes])

  const initializeUserProfile = (address: string) => {
    const existingProfile = localStorage.getItem(`profile_${address}`)

    if (existingProfile) {
      const profile = JSON.parse(existingProfile)
      setUserProfile(profile)
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        address,
        displayName: `Explorer${address.slice(-4)}`,
        level: 1,
        experience: 0,
        totalEarned: 0,
        totalStaked: 0,
        adventuresCompleted: 0,
        adventuresFailed: 0,
        successRate: 0,
        achievements: ["First Steps"],
        favoriteCategory: "Ancient",
        longestStreak: 0,
        currentStreak: 0,
        joinedDate: new Date().toISOString(),
      }

      setUserProfile(newProfile)
      localStorage.setItem(`profile_${address}`, JSON.stringify(newProfile))
    }
  }

  const loadUserStakes = (address: string) => {
    const stakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
    const userSpecificStakes = stakes.filter(
      (stake: UserStake) => localStorage.getItem(`stake_owner_${stake.txHash}`) === address,
    )
    setUserStakes(userSpecificStakes)
  }

  const updateExpiredStakes = () => {
    if (!account) return

    const stakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
    const now = Date.now()
    let hasUpdates = false

    const updatedStakes = stakes.map((stake: UserStake) => {
      if (stake.status === "active" && now > stake.timestamp + stake.timeLimit) {
        hasUpdates = true

        // Add failed stake amount to community pool
        const failedAmount = Number.parseFloat(stake.amount)
        setCommunityPool((prev) => ({
          ...prev,
          totalAmount: prev.totalAmount + failedAmount,
          contributionsFromFailures: prev.contributionsFromFailures + failedAmount,
          lastUpdated: Date.now(),
        }))

        // Update user profile for failed adventure
        if (userProfile && localStorage.getItem(`stake_owner_${stake.txHash}`) === account) {
          const updatedProfile = {
            ...userProfile,
            adventuresFailed: userProfile.adventuresFailed + 1,
            currentStreak: 0,
            successRate: Math.round(
              (userProfile.adventuresCompleted / (userProfile.adventuresCompleted + userProfile.adventuresFailed + 1)) *
                100,
            ),
          }
          setUserProfile(updatedProfile)
          localStorage.setItem(`profile_${account}`, JSON.stringify(updatedProfile))
        }

        return { ...stake, status: "expired" as const }
      }
      return stake
    })

    if (hasUpdates) {
      localStorage.setItem("userStakes", JSON.stringify(updatedStakes))
      loadUserStakes(account)

      // Update community pool in localStorage
      localStorage.setItem("communityPool", JSON.stringify(communityPool))
    }
  }

  const createStake = async (place: Place, amount: string, txHash: string) => {
    if (!account || !userProfile) return

    setIsLoading(true)

    try {
      const stakeAmount = Number.parseFloat(amount)

      // Calculate transaction fee (2% of stake)
      const transactionFee = stakeAmount * 0.02

      // Add fee to community pool
      setCommunityPool((prev) => ({
        ...prev,
        totalAmount: prev.totalAmount + transactionFee,
        contributionsFromFees: prev.contributionsFromFees + transactionFee,
        lastUpdated: Date.now(),
      }))

      const newStake: UserStake = {
        placeId: place.id,
        placeName: place.name,
        amount,
        timestamp: Date.now(),
        timeLimit: place.timeLimit * 60 * 60 * 1000, // Convert to milliseconds
        coordinates: place.coordinates,
        txHash,
        status: "active",
        difficulty: undefined
      }

      // Save stake
      const existingStakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
      existingStakes.push(newStake)
      localStorage.setItem("userStakes", JSON.stringify(existingStakes))

      // Mark stake ownership
      localStorage.setItem(`stake_owner_${txHash}`, account)

      // Update user profile
      const updatedProfile = {
        ...userProfile,
        totalStaked: userProfile.totalStaked + stakeAmount,
      }
      setUserProfile(updatedProfile)
      localStorage.setItem(`profile_${account}`, JSON.stringify(updatedProfile))

      // Update local state
      setUserStakes((prev) => [...prev, newStake])

      // Update community pool in localStorage
      localStorage.setItem("communityPool", JSON.stringify(communityPool))
    } finally {
      setIsLoading(false)
    }
  }

  const completeAdventure = async (stakeId: string, success: boolean) => {
    if (!account || !userProfile) return

    setIsLoading(true)

    try {
      const stakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
      const stakeIndex = stakes.findIndex(
        (s: UserStake) => s.txHash === stakeId && localStorage.getItem(`stake_owner_${s.txHash}`) === account,
      )

      if (stakeIndex === -1) return

      const stake = stakes[stakeIndex]
      const place = getPlaceById(stake.placeId)
      if (!place) return

      const rewardAmount = calculateReward(stake, place, success)
      const experienceGained = calculateExperience(stake, place, success)

      // Update stake
      stakes[stakeIndex] = {
        ...stake,
        status: success ? "completed" : "failed",
        rewardAmount,
        experienceGained,
      }

      localStorage.setItem("userStakes", JSON.stringify(stakes))

      // Update user profile
      const newExperience = userProfile.experience + experienceGained
      const newLevel = calculateLevel(newExperience)
      const newStreak = success ? userProfile.currentStreak + 1 : 0

      const updatedProfile: UserProfile = {
        ...userProfile,
        level: newLevel,
        experience: newExperience,
        totalEarned: success ? userProfile.totalEarned + rewardAmount : userProfile.totalEarned,
        adventuresCompleted: success ? userProfile.adventuresCompleted + 1 : userProfile.adventuresCompleted,
        adventuresFailed: success ? userProfile.adventuresFailed : userProfile.adventuresFailed + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(userProfile.longestStreak, newStreak),
        successRate: Math.round(
          ((success ? userProfile.adventuresCompleted + 1 : userProfile.adventuresCompleted) /
            (userProfile.adventuresCompleted + userProfile.adventuresFailed + 1)) *
            100,
        ),
      }

      // Check for new achievements
      const newAchievements = checkAchievements(updatedProfile)
      if (newAchievements.length > 0) {
        updatedProfile.achievements = [...new Set([...updatedProfile.achievements, ...newAchievements])]
      }

      setUserProfile(updatedProfile)
      localStorage.setItem(`profile_${account}`, JSON.stringify(updatedProfile))

      // If failed, add stake to community pool
      if (!success) {
        const failedAmount = Number.parseFloat(stake.amount)
        setCommunityPool((prev) => ({
          ...prev,
          totalAmount: prev.totalAmount + failedAmount,
          contributionsFromFailures: prev.contributionsFromFailures + failedAmount,
          lastUpdated: Date.now(),
        }))
        localStorage.setItem("communityPool", JSON.stringify(communityPool))
      }

      // Update local state
      loadUserStakes(account)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateReward = (stake: UserStake, place: Place, success: boolean): number => {
    if (!success) return 0

    const baseAmount = Number.parseFloat(stake.amount)
    const multiplier = place.maxReward

    // Add bonus based on difficulty
    const difficultyBonus =
      {
        Easy: 1.0,
        Medium: 1.1,
        Hard: 1.2,
        Legendary: 1.3,
      }[place.difficulty] || 1.0

    // Add time bonus (completed early gets bonus)
    const timeUsed = Date.now() - stake.timestamp
    const timeLimit = stake.timeLimit
    const timeBonus = timeUsed < timeLimit * 0.5 ? 1.1 : timeUsed < timeLimit * 0.8 ? 1.05 : 1.0

    return baseAmount * multiplier * difficultyBonus * timeBonus
  }

  const calculateExperience = (stake: UserStake, place: Place, success: boolean): number => {
    const baseExp =
      {
        Easy: 100,
        Medium: 200,
        Hard: 350,
        Legendary: 500,
      }[place.difficulty] || 100

    const successMultiplier = success ? 1.0 : 0.3 // Still get some exp for trying
    const stakeMultiplier = Math.min(Number.parseFloat(stake.amount) * 10, 50) // More stake = more exp (capped)

    return Math.round(baseExp * successMultiplier + stakeMultiplier)
  }

  const calculateLevel = (experience: number): number => {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1
  }

  const checkAchievements = (profile: UserProfile): string[] => {
    const newAchievements: string[] = []

    // Experience-based achievements
    if (profile.experience >= 1000 && !profile.achievements.includes("Explorer")) {
      newAchievements.push("Explorer")
    }
    if (profile.experience >= 5000 && !profile.achievements.includes("Veteran")) {
      newAchievements.push("Veteran")
    }
    if (profile.experience >= 15000 && !profile.achievements.includes("Master")) {
      newAchievements.push("Master")
    }

    // Adventure-based achievements
    if (profile.adventuresCompleted >= 10 && !profile.achievements.includes("Adventurer")) {
      newAchievements.push("Adventurer")
    }
    if (profile.adventuresCompleted >= 50 && !profile.achievements.includes("Seasoned Explorer")) {
      newAchievements.push("Seasoned Explorer")
    }
    if (profile.adventuresCompleted >= 100 && !profile.achievements.includes("Legend")) {
      newAchievements.push("Legend")
    }

    // Streak-based achievements
    if (profile.longestStreak >= 5 && !profile.achievements.includes("Lucky Streak")) {
      newAchievements.push("Lucky Streak")
    }
    if (profile.longestStreak >= 10 && !profile.achievements.includes("Unstoppable")) {
      newAchievements.push("Unstoppable")
    }
    if (profile.longestStreak >= 20 && !profile.achievements.includes("Perfect Streak")) {
      newAchievements.push("Perfect Streak")
    }

    // Earning-based achievements
    if (profile.totalEarned >= 10 && !profile.achievements.includes("High Roller")) {
      newAchievements.push("High Roller")
    }
    if (profile.totalEarned >= 50 && !profile.achievements.includes("Wealthy Explorer")) {
      newAchievements.push("Wealthy Explorer")
    }

    // Success rate achievements
    if (
      profile.successRate >= 90 &&
      profile.adventuresCompleted >= 10 &&
      !profile.achievements.includes("Precision Master")
    ) {
      newAchievements.push("Precision Master")
    }

    return newAchievements
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile || !account) return

    const updatedProfile = { ...userProfile, ...updates }
    setUserProfile(updatedProfile)
    localStorage.setItem(`profile_${account}`, JSON.stringify(updatedProfile))
  }

  const getLeaderboard = (): UserProfile[] => {
    const profiles: UserProfile[] = []

    // Get all profiles from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("profile_")) {
        try {
          const profile = JSON.parse(localStorage.getItem(key) || "")
          profiles.push(profile)
        } catch (e) {
          // Skip invalid profiles
          console.log(e)
        }
      }
    }

    // Sort by total earned (descending)
    return profiles.sort((a, b) => b.totalEarned - a.totalEarned)
  }

  const getPlaceById = (id: string): Place | null => {
    const places: Place[] = [
      {
        id: "1",
        name: "The Mystic Caves of Ajanta",
        description:
          "Ancient Buddhist cave temples carved into volcanic rock, where monks once meditated in eternal silence.",
        difficulty: "Medium",
        timeLimit: 6,
        minStake: 0.1,
        maxReward: 2.5,
        currentStakes: 12.4,
        successRate: 78,
        image: "/ancient-buddhist-caves.png",
        coordinates: { lat: 20.5519, lng: 75.7033 },
        category: "Ancient",
      },
      {
        id: "2",
        name: "The Golden Temple of Amritsar",
        description: "A sacred Sikh shrine surrounded by the holy Amrit Sarovar.",
        difficulty: "Easy",
        timeLimit: 4,
        minStake: 0.05,
        maxReward: 1.8,
        currentStakes: 8.7,
        successRate: 89,
        image: "/golden-temple-amritsar.png",
        coordinates: { lat: 31.62, lng: 74.8765 },
        category: "Mystical",
      },
      {
        id: "3",
        name: "The Floating Palace of Udaipur",
        description: "A majestic palace that appears to float on Lake Pichola.",
        difficulty: "Medium",
        timeLimit: 5,
        minStake: 0.15,
        maxReward: 2.2,
        currentStakes: 15.3,
        successRate: 72,
        image: "/udaipur-palace-floating-lake-pichola-royal-chambers.png",
        coordinates: { lat: 24.5854, lng: 73.7125 },
        category: "Ancient",
      },
      {
        id: "4",
        name: "The Cyber Ruins of Bangalore",
        description: "Where ancient temples meet modern technology in India's Silicon Valley.",
        difficulty: "Hard",
        timeLimit: 8,
        minStake: 0.25,
        maxReward: 3.2,
        currentStakes: 23.1,
        successRate: 65,
        image: "/bangalore-cyber-ruins.png",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        category: "Futuristic",
      },
      {
        id: "5",
        name: "The Himalayan Monastery of Ladakh",
        description: "A remote monastery perched on impossible cliffs where monks guard ancient secrets.",
        difficulty: "Legendary",
        timeLimit: 12,
        minStake: 0.5,
        maxReward: 5.0,
        currentStakes: 18.9,
        successRate: 42,
        image: "/ladakh-monastery-cliffs.png",
        coordinates: { lat: 34.1526, lng: 77.5771 },
        category: "Legendary",
      },
      {
        id: "6",
        name: "The Backwater Labyrinths of Kerala",
        description: "Navigate the mystical network of canals and lagoons where ancient spice traders once sailed.",
        difficulty: "Medium",
        timeLimit: 6,
        minStake: 0.12,
        maxReward: 2.3,
        currentStakes: 11.7,
        successRate: 75,
        image: "/kerala-backwaters.png",
        coordinates: { lat: 9.4981, lng: 76.3388 },
        category: "Mystical",
      },
      {
        id: "7",
        name: "The Desert Fortress of Jaisalmer",
        description: "A golden sandstone citadel rising from the Thar Desert like a mirage.",
        difficulty: "Hard",
        timeLimit: 7,
        minStake: 0.2,
        maxReward: 2.8,
        currentStakes: 16.4,
        successRate: 58,
        image: "/jaisalmer-fortress.png",
        coordinates: { lat: 26.9157, lng: 70.9083 },
        category: "Ancient",
      },
      {
        id: "8",
        name: "The Sacred Ghats of Varanasi",
        description: "Ancient stone steps leading to the holy Ganges where souls seek liberation.",
        difficulty: "Medium",
        timeLimit: 5,
        minStake: 0.08,
        maxReward: 2.0,
        currentStakes: 9.2,
        successRate: 81,
        image: "/varanasi-ghats-ganges.png",
        coordinates: { lat: 25.3176, lng: 82.9739 },
        category: "Mystical",
      },
      {
        id: "9",
        name: "The Quantum Labs of Hyderabad",
        description: "Where ancient Nizami architecture houses cutting-edge quantum research.",
        difficulty: "Legendary",
        timeLimit: 10,
        minStake: 0.4,
        maxReward: 4.5,
        currentStakes: 21.8,
        successRate: 38,
        image: "/hyderabad-charminar-quantum-labs.png",
        coordinates: { lat: 17.385, lng: 78.4867 },
        category: "Futuristic",
      },
      {
        id: "10",
        name: "The Tiger Temples of Madhya Pradesh",
        description: "Ancient temples hidden deep in tiger reserves where nature and spirituality converge.",
        difficulty: "Hard",
        timeLimit: 9,
        minStake: 0.3,
        maxReward: 3.5,
        currentStakes: 14.6,
        successRate: 52,
        image: "/madhya-pradesh-tiger-temples.png",
        coordinates: { lat: 22.7196, lng: 75.8577 },
        category: "Ancient",
      },
    ]

    return places.find((p) => p.id === id) || null
  }

  const value: GameContextType = {
    userProfile,
    userStakes,
    communityPool,
    createStake,
    completeAdventure,
    updateUserProfile,
    calculateReward,
    calculateExperience,
    checkAchievements,
    getLeaderboard,
    isLoading,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
