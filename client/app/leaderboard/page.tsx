// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client"

import { useState, Suspense, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Crown, Star, Coins, MapPin, Target, TrendingUp, Award, Zap } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { AncientExplorer } from "@/components/ancient-explorer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { useWeb3 } from "@/contexts/web3-context"
import { useGame } from "@/contexts/game-context"
import Link from "next/link"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LeaderboardEntry {
  address: string
  displayName: string
  totalEarned: number
  totalStaked: number
  adventuresCompleted: number
  successRate: number
  favoriteCategory: string
  level: number
  achievements: string[]
}

export default function LeaderboardPage() {
  const [selectedTab, setSelectedTab] = useState("earnings")
  const { account } = useWeb3()
  const { userProfile, getLeaderboard } = useGame()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    const realLeaderboard = getLeaderboard()

    // Add mock data if needed for demonstration
    const mockEntries = [
      {
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
        displayName: "AncientSeeker",
        totalEarned: 47.8,
        totalStaked: 23.2,
        adventuresCompleted: 156,
        successRate: 94,
        favoriteCategory: "Legendary",
        level: 42,
        achievements: ["First Explorer", "Legend Hunter", "Perfect Streak", "Master Navigator"],
      },
      {
        address: "0x8ba1f109551bD432803012645Hac136c30C6213",
        displayName: "MysticWanderer",
        totalEarned: 38.4,
        totalStaked: 19.7,
        adventuresCompleted: 134,
        successRate: 89,
        favoriteCategory: "Mystical",
        level: 38,
        achievements: ["Mystic Master", "Speed Runner", "Risk Taker"],
      },
    ]

    // Combine real and mock data, prioritizing real data
    const combinedLeaderboard = [
      ...realLeaderboard,
      ...mockEntries.filter(
        (mock) => !realLeaderboard.some((real) => real.address.toLowerCase() === mock.address.toLowerCase()),
      ),
    ]

    setLeaderboard(combinedLeaderboard)
  }, [getLeaderboard])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 40) return "text-purple-500"
    if (level >= 30) return "text-red-500"
    if (level >= 20) return "text-orange-500"
    if (level >= 10) return "text-blue-500"
    return "text-green-500"
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Ancient":
        return "🏛️"
      case "Mystical":
        return "✨"
      case "Futuristic":
        return "🚀"
      case "Legendary":
        return "⚡"
      default:
        return "🗺️"
    }
  }

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (selectedTab) {
      case "earnings":
        return b.totalEarned - a.totalEarned
      case "adventures":
        return b.adventuresCompleted - a.adventuresCompleted
      case "success":
        return b.successRate - a.successRate
      case "stakes":
        return b.totalStaked - a.totalStaked
      default:
        return b.totalEarned - a.totalEarned
    }
  })

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
            <Link href="/stake" className="text-gray-300 hover:text-purple-400 transition-colors">
              Stake
            </Link>
            <Link href="/leaderboard" className="text-purple-400 font-medium">
              Leaderboard
            </Link>
          </nav>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section with 3D */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden mt-20">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />

              <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
                <AncientExplorer position={[0, -1, 0]} />
              </Float>

              {/* Floating trophies */}
              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
                <mesh position={[-2, 1, 0]}>
                  <cylinderGeometry args={[0.3, 0.2, 0.6]} />
                  <meshStandardMaterial color="#ffb74d" metalness={0.8} roughness={0.2} />
                </mesh>
              </Float>

              <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
                <mesh position={[2, 0.5, 0]}>
                  <octahedronGeometry args={[0.4]} />
                  <meshStandardMaterial color="#6b4f3a" metalness={0.6} roughness={0.3} />
                </mesh>
              </Float>

              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 text-white">
              Hall of <span className="text-purple-400">Legends</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Discover the greatest explorers and their legendary achievements across the ancient realms
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* User Stats Card */}
        {account && userProfile && (
          <ScrollReveal>
            <Card className="sketch-border bg-black/50 border-gray-800/50 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Your Explorer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-purple-400 mb-1">
                      #{leaderboard.findIndex((p) => p.address.toLowerCase() === account.toLowerCase()) + 1 || "N/A"}
                    </div>
                    <div className="text-sm text-gray-300">Global Rank</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-heading font-bold mb-1 ${getLevelColor(userProfile.level)}`}>
                      Lv.{userProfile.level}
                    </div>
                    <div className="text-sm text-gray-300">
                      {userProfile.experience}/{userProfile.level * userProfile.level * 100} XP
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-purple-400 mb-1">
                      {userProfile.totalEarned.toFixed(1)} ETH
                    </div>
                    <div className="text-sm text-gray-300">Total Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-purple-400 mb-1">
                      {userProfile.successRate}%
                    </div>
                    <div className="text-sm text-gray-300">Success Rate</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Experience Progress</span>
                    <span>
                      {userProfile.experience}/{userProfile.level * userProfile.level * 100} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/20 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(userProfile.experience / (userProfile.level * userProfile.level * 100)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {userProfile.achievements.map((achievement) => (
                    <Badge key={achievement} variant="outline" className="bg-purple-400/10 border-purple-400/30">
                      <Star className="h-3 w-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Leaderboard */}
        <ScrollReveal delay={0.2}>
          <Card className="sketch-border bg-black/50 border-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-white flex items-center gap-2">
                <Trophy className="h-6 w-6 text-purple-400" />
                Explorer Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="earnings" className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span className="hidden sm:inline">Earnings</span>
                  </TabsTrigger>
                  <TabsTrigger value="adventures" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Adventures</span>
                  </TabsTrigger>
                  <TabsTrigger value="success" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Success</span>
                  </TabsTrigger>
                  <TabsTrigger value="stakes" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Stakes</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  {sortedLeaderboard.slice(0, 50).map((entry, index) => (
                    <div
                      key={entry.address}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:bg-gray-800/10 ${
                        index < 3
                          ? "bg-purple-400/5 border-purple-400/20"
                          : account?.toLowerCase() === entry.address.toLowerCase()
                            ? "bg-blue-500/5 border-blue-500/20"
                            : "bg-gray-800/5 border-gray-800/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10">{getRankIcon(index + 1)}</div>

                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-400/20 text-purple-400 font-bold">
                            {entry.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{entry.displayName}</span>
                            <Badge variant="outline" className={`text-xs ${getLevelColor(entry.level)} border-current`}>
                              Lv.{entry.level}
                            </Badge>
                            <span className="text-lg">{getCategoryIcon(entry.favoriteCategory)}</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {selectedTab === "earnings" && (
                          <>
                            <div className="font-bold text-purple-400">{entry.totalEarned.toFixed(2)} ETH</div>
                            <div className="text-sm text-gray-300">Total Earned</div>
                          </>
                        )}
                        {selectedTab === "adventures" && (
                          <>
                            <div className="font-bold text-purple-400">{entry.adventuresCompleted}</div>
                            <div className="text-sm text-gray-300">Completed</div>
                          </>
                        )}
                        {selectedTab === "success" && (
                          <>
                            <div className="font-bold text-purple-400">{entry.successRate}%</div>
                            <div className="text-sm text-gray-300">Success Rate</div>
                          </>
                        )}
                        {selectedTab === "stakes" && (
                          <>
                            <div className="font-bold text-purple-400">{entry.totalStaked.toFixed(2)} ETH</div>
                            <div className="text-sm text-gray-300">Total Staked</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Achievement Showcase */}
        <ScrollReveal delay={0.4}>
          <Card className="sketch-border bg-black/50 border-gray-800/50 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                Legendary Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/10 rounded-lg">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="font-bold text-white">First Steps</div>
                  <div className="text-sm text-gray-300">Join Ancient Voyager</div>
                </div>
                <div className="text-center p-4 bg-gray-800/10 rounded-lg">
                  <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-bold text-white">Legend Hunter</div>
                  <div className="text-sm text-gray-300">Complete 100 adventures</div>
                </div>
                <div className="text-center p-4 bg-gray-800/10 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-white">Perfect Streak</div>
                  <div className="text-sm text-gray-300">Win 20 adventures in a row</div>
                </div>
                <div className="text-center p-4 bg-gray-800/10 rounded-lg">
                  <Coins className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="font-bold text-white">High Roller</div>
                  <div className="text-sm text-gray-300">Earn over 10 ETH total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  )
}
