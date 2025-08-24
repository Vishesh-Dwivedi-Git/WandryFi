"use client"

import { useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Coins, Star, Search, Map, List } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { AncientExplorer } from "@/components/ancient-explorer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { PlaceStakeModal } from "@/components/place-stake-modal"
import dynamic from "next/dynamic"
import Link from "next/link"

const ExploreMap = dynamic(() => import("@/components/explore-map"), { ssr: false })

interface Place {
  id: string
  name: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard" | "Legendary"
  timeLimit: number // in hours
  minStake: number // in ETH
  maxReward: number // multiplier
  currentStakes: number
  successRate: number
  image: string
  coordinates: { lat: number; lng: number }
  category: "Ancient" | "Mystical" | "Futuristic" | "Legendary"
}

const INDIAN_PLACES: Place[] = [
  {
    id: "1",
    name: "The Mystic Caves of Ajanta",
    description:
      "Ancient Buddhist cave temples carved into volcanic rock, where monks once meditated in eternal silence. Navigate the sacred chambers to unlock ancient wisdom.",
    difficulty: "Medium",
    timeLimit: 6,
    minStake: 0.1,
    maxReward: 2.5,
    currentStakes: 12.4,
    successRate: 78,
    image: "/ancient-buddhist-caves.png",
    coordinates: { lat: 20.5519, lng: 75.7033 }, // Ajanta Caves, Maharashtra
    category: "Ancient",
  },
  {
    id: "2",
    name: "The Golden Temple of Amritsar",
    description:
      "A sacred Sikh shrine surrounded by the holy Amrit Sarovar. Seek the divine light that emanates from the golden dome at dawn.",
    difficulty: "Easy",
    timeLimit: 4,
    minStake: 0.05,
    maxReward: 1.8,
    currentStakes: 8.7,
    successRate: 89,
    image: "/golden-temple-amritsar.png",
    coordinates: { lat: 31.62, lng: 74.8765 }, // Golden Temple, Amritsar
    category: "Mystical",
  },
  {
    id: "3",
    name: "The Floating Palace of Udaipur",
    description:
      "A majestic palace that appears to float on Lake Pichola. Navigate the royal chambers where ancient maharajas once ruled from their aquatic fortress.",
    difficulty: "Medium",
    timeLimit: 5,
    minStake: 0.15,
    maxReward: 2.2,
    currentStakes: 15.3,
    successRate: 72,
    image: "/udaipur-palace-floating-lake-pichola-royal-chambers.png",
    coordinates: { lat: 24.5854, lng: 73.7125 }, // Lake Palace, Udaipur
    category: "Ancient",
  },
  {
    id: "4",
    name: "The Cyber Ruins of Bangalore",
    description:
      "Where ancient temples meet modern technology in India's Silicon Valley. Decode the digital mantras hidden in the quantum servers of tech giants.",
    difficulty: "Hard",
    timeLimit: 8,
    minStake: 0.25,
    maxReward: 3.2,
    currentStakes: 23.1,
    successRate: 65,
    image: "/bangalore-cyber-ruins.png",
    coordinates: { lat: 12.9716, lng: 77.5946 }, // Bangalore, Karnataka
    category: "Futuristic",
  },
  {
    id: "5",
    name: "The Himalayan Monastery of Ladakh",
    description:
      "A remote monastery perched on impossible cliffs where monks guard ancient secrets. Reach the summit before the mountain spirits awaken.",
    difficulty: "Legendary",
    timeLimit: 12,
    minStake: 0.5,
    maxReward: 5.0,
    currentStakes: 18.9,
    successRate: 42,
    image: "/ladakh-monastery-cliffs.png",
    coordinates: { lat: 34.1526, lng: 77.5771 }, // Leh, Ladakh
    category: "Legendary",
  },
  {
    id: "6",
    name: "The Backwater Labyrinths of Kerala",
    description:
      "Navigate the mystical network of canals and lagoons where ancient spice traders once sailed. Follow the whispers of the coconut palms to find the hidden treasure.",
    difficulty: "Medium",
    timeLimit: 6,
    minStake: 0.12,
    maxReward: 2.3,
    currentStakes: 11.7,
    successRate: 75,
    image: "/kerala-backwaters.png",
    coordinates: { lat: 9.4981, lng: 76.3388 }, // Alleppey, Kerala
    category: "Mystical",
  },
  {
    id: "7",
    name: "The Desert Fortress of Jaisalmer",
    description:
      "A golden sandstone citadel rising from the Thar Desert like a mirage. Navigate the maze of narrow alleys before the desert winds erase your path.",
    difficulty: "Hard",
    timeLimit: 7,
    minStake: 0.2,
    maxReward: 2.8,
    currentStakes: 16.4,
    successRate: 58,
    image: "/jaisalmer-fortress.png",
    coordinates: { lat: 26.9157, lng: 70.9083 }, // Jaisalmer, Rajasthan
    category: "Ancient",
  },
  {
    id: "8",
    name: "The Sacred Ghats of Varanasi",
    description:
      "Ancient stone steps leading to the holy Ganges where souls seek liberation. Navigate the spiritual energy that flows through the eternal city.",
    difficulty: "Medium",
    timeLimit: 5,
    minStake: 0.08,
    maxReward: 2.0,
    currentStakes: 9.2,
    successRate: 81,
    image: "/varanasi-ghats-ganges.png",
    coordinates: { lat: 25.3176, lng: 82.9739 }, // Varanasi, Uttar Pradesh
    category: "Mystical",
  },
  {
    id: "9",
    name: "The Quantum Labs of Hyderabad",
    description:
      "Where ancient Nizami architecture houses cutting-edge quantum research. Decode the algorithms hidden in the geometric patterns of Charminar.",
    difficulty: "Legendary",
    timeLimit: 10,
    minStake: 0.4,
    maxReward: 4.5,
    currentStakes: 21.8,
    successRate: 38,
    image: "/hyderabad-charminar-quantum-labs.png",
    coordinates: { lat: 17.385, lng: 78.4867 }, // Hyderabad, Telangana
    category: "Futuristic",
  },
  {
    id: "10",
    name: "The Tiger Temples of Madhya Pradesh",
    description:
      "Ancient temples hidden deep in tiger reserves where nature and spirituality converge. Navigate the jungle paths while avoiding the guardian spirits.",
    difficulty: "Hard",
    timeLimit: 9,
    minStake: 0.3,
    maxReward: 3.5,
    currentStakes: 14.6,
    successRate: 52,
    image: "/madhya-pradesh-tiger-temples.png",
    coordinates: { lat: 22.7196, lng: 75.8577 }, // Madhya Pradesh (Central location)
    category: "Ancient",
  },
]

export default function ExplorePage() {
  const [places] = useState<Place[]>(INDIAN_PLACES)
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(INDIAN_PLACES)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterPlaces(term, selectedDifficulty, selectedCategory)
  }

  const handleDifficultyFilter = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    filterPlaces(searchTerm, difficulty, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterPlaces(searchTerm, selectedDifficulty, category)
  }

  const filterPlaces = (search: string, difficulty: string, category: string) => {
    let filtered = places

    if (search) {
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(search.toLowerCase()) ||
          place.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (difficulty !== "All") {
      filtered = filtered.filter((place) => place.difficulty === difficulty)
    }

    if (category !== "All") {
      filtered = filtered.filter((place) => place.category === category)
    }

    setFilteredPlaces(filtered)
  }

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
    <div className="min-h-screen bg-background ancient-texture">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Ancient Voyager</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="text-accent font-medium">
              Explore
            </Link>
            <Link href="/stake" className="text-muted-foreground hover:text-accent transition-colors">
              Stake
            </Link>
            <Link href="/leaderboard" className="text-muted-foreground hover:text-accent transition-colors">
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
              <Environment preset="forest" />
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} />

              <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
                <AncientExplorer position={[0, -1, 0]} />
              </Float>

              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 text-foreground">
              Explore <span className="text-accent">Incredible India</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Stake your coins and embark on mystical adventures across India's most legendary destinations
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations across India..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 sketch-border bg-card/50 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyFilter(e.target.value)}
                className="px-4 py-2 rounded-md border border-border bg-card/50 backdrop-blur-sm text-foreground"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Legendary">Legendary</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-md border border-border bg-card/50 backdrop-blur-sm text-foreground"
              >
                <option value="All">All Categories</option>
                <option value="Ancient">Ancient</option>
                <option value="Mystical">Mystical</option>
                <option value="Futuristic">Futuristic</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaces.map((place, index) => (
                  <ScrollReveal key={place.id} delay={index * 0.1}>
                    <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={place.image || "/placeholder.svg"}
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className={`${getDifficultyColor(place.difficulty)} border`}>
                              {place.difficulty}
                            </Badge>
                            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                              {place.category}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                              <Star className="h-3 w-3 text-accent fill-current" />
                              <span className="text-xs font-medium">{place.successRate}%</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle className="text-xl font-heading mb-2 text-card-foreground">{place.name}</CardTitle>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{place.description}</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-accent" />
                              <span>{place.timeLimit}h limit</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-accent" />
                              <span>{place.minStake} ETH min</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Reward: up to {place.maxReward}x</span>
                            <span className="text-muted-foreground">{place.currentStakes} ETH staked</span>
                          </div>

                          <Button
                            onClick={() => setSelectedPlace(place)}
                            className="w-full sketch-border bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            Stake & Explore
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <div className="h-[600px] rounded-lg overflow-hidden sketch-border">
                <ExploreMap places={filteredPlaces} onPlaceSelect={setSelectedPlace} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Stake Modal */}
      {selectedPlace && (
        <PlaceStakeModal place={selectedPlace} isOpen={!!selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
    </div>
  )
}
