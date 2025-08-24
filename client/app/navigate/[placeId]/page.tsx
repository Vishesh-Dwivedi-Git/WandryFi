"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Navigation, Clock, Target, CheckCircle, AlertTriangle, Compass } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { AncientExplorer } from "@/components/ancient-explorer"
import { InteractiveMap } from "@/components/interactive-map"
import { VerificationModal } from "@/components/verification-modal"
import Link from "next/link"

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

const SAMPLE_PLACES: Place[] = [
  {
    id: "1",
    name: "The Crystal Caverns of Zephyr",
    description: "Ancient crystalline formations that pulse with otherworldly energy.",
    difficulty: "Medium",
    timeLimit: 6,
    minStake: 0.1,
    maxReward: 2.5,
    currentStakes: 12.4,
    successRate: 78,
    image: "/crystal-cavern-glowing-ancient.png",
    coordinates: { lat: 40.7128, lng: -74.006 },
    category: "Mystical",
  },
  {
    id: "2",
    name: "Skyforge Observatory",
    description: "A floating observatory among the clouds where ancient astronomers once studied the stars.",
    difficulty: "Hard",
    timeLimit: 8,
    minStake: 0.25,
    maxReward: 3.2,
    currentStakes: 8.7,
    successRate: 65,
    image: "/floating-observatory-clouds-ancient-astronomy.png",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    category: "Ancient",
  },
  {
    id: "3",
    name: "Neon Ruins of Neo-Babylon",
    description: "Cyberpunk ruins where ancient technology meets futuristic decay.",
    difficulty: "Legendary",
    timeLimit: 12,
    minStake: 0.5,
    maxReward: 5.0,
    currentStakes: 23.1,
    successRate: 42,
    image: "/cyberpunk-ruins-neon-ancient-futuristic.png",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    category: "Futuristic",
  },
  {
    id: "4",
    name: "The Whispering Sands",
    description: "Desert dunes that shift and change, hiding ancient secrets beneath.",
    difficulty: "Easy",
    timeLimit: 4,
    minStake: 0.05,
    maxReward: 1.8,
    currentStakes: 5.2,
    successRate: 89,
    image: "/desert-temple-buried.png",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    category: "Ancient",
  },
  {
    id: "5",
    name: "Ethereal Gardens of Lumina",
    description: "Floating gardens where bioluminescent plants create pathways of light.",
    difficulty: "Medium",
    timeLimit: 5,
    minStake: 0.15,
    maxReward: 2.2,
    currentStakes: 9.8,
    successRate: 72,
    image: "/bioluminescent-floating-gardens.png",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    category: "Mystical",
  },
  {
    id: "6",
    name: "The Quantum Labyrinth",
    description: "A maze that exists in multiple dimensions simultaneously.",
    difficulty: "Legendary",
    timeLimit: 10,
    minStake: 0.75,
    maxReward: 6.0,
    currentStakes: 15.6,
    successRate: 38,
    image: "/quantum-labyrinth.png",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    category: "Futuristic",
  },
]

export default function NavigatePage() {
  const params = useParams()
  const router = useRouter()
  const placeId = params.placeId as string

  const [place, setPlace] = useState<Place | null>(null)
  const [userStake, setUserStake] = useState<UserStake | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [isNearDestination, setIsNearDestination] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Find the place
    const foundPlace = SAMPLE_PLACES.find((p) => p.id === placeId)
    if (!foundPlace) {
      router.push("/explore")
      return
    }
    setPlace(foundPlace)

    // Find user's stake for this place
    const stakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
    const stake = stakes.find((s: UserStake) => s.placeId === placeId && s.status === "active")
    if (!stake) {
      router.push("/stake")
      return
    }
    setUserStake(stake)

    // Start location tracking
    startLocationTracking()

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [placeId, router])

  useEffect(() => {
    if (!userStake) return

    const updateTimer = () => {
      const now = Date.now()
      const endTime = userStake.timestamp + userStake.timeLimit
      const remaining = endTime - now

      if (remaining <= 0) {
        setTimeRemaining("Expired")
        // Update stake status to expired
        const stakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
        const updatedStakes = stakes.map((s: UserStake) =>
          s.placeId === placeId && s.timestamp === userStake.timestamp ? { ...s, status: "expired" } : s,
        )
        localStorage.setItem("userStakes", JSON.stringify(updatedStakes))
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)

      // Calculate progress (time-based)
      const totalTime = userStake.timeLimit
      const elapsed = now - userStake.timestamp
      const timeProgress = Math.min((elapsed / totalTime) * 100, 100)
      setProgress(timeProgress)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [userStake, placeId])

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })
      setLocationError(null)

      if (place) {
        const dist = calculateDistance(latitude, longitude, place.coordinates.lat, place.coordinates.lng)
        setDistance(dist)

        // Check if user is near destination (within 100 meters for demo)
        if (dist < 0.1) {
          setIsNearDestination(true)
        }
      }
    }

    const error = (err: GeolocationPositionError) => {
      setLocationError(`Location error: ${err.message}`)
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(success, error, options)

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(success, error, options)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleVerifyArrival = () => {
    setShowVerification(true)
  }

  const handleVerificationSuccess = () => {
    if (!userStake) return

    // Update stake status to completed
    const stakes = JSON.parse(localStorage.getItem("userStakes") || "[]")
    const updatedStakes = stakes.map((s: UserStake) =>
      s.placeId === placeId && s.timestamp === userStake.timestamp ? { ...s, status: "completed" } : s,
    )
    localStorage.setItem("userStakes", JSON.stringify(updatedStakes))

    // Redirect to success page or stakes page
    router.push("/stake?success=true")
  }

  if (!place || !userStake) {
    return (
      <div className="min-h-screen bg-background ancient-texture flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    )
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
            <Link href="/explore" className="text-muted-foreground hover:text-accent transition-colors">
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

      <div className="pt-20">
        {/* 3D Scene Header */}
        <div className="relative h-32 overflow-hidden">
          <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
            <Suspense fallback={null}>
              <Environment preset="dawn" />
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} />

              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
                <AncientExplorer position={[0, -0.5, 0]} />
              </Float>

              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
            </Suspense>
          </Canvas>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Mission Info */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-heading text-card-foreground">{place.name}</CardTitle>
                    <Badge
                      className={`${
                        place.difficulty === "Easy"
                          ? "bg-green-500/20 text-green-700 border-green-500/30"
                          : place.difficulty === "Medium"
                            ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                            : place.difficulty === "Hard"
                              ? "bg-orange-500/20 text-orange-700 border-orange-500/30"
                              : "bg-red-500/20 text-red-700 border-red-500/30"
                      } border`}
                    >
                      {place.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{place.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-secondary/20 rounded-lg">
                      <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
                      <div className="text-sm font-medium">{timeRemaining}</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/20 rounded-lg">
                      <Target className="h-5 w-5 text-accent mx-auto mb-1" />
                      <div className="text-sm font-medium">
                        {distance ? `${distance.toFixed(2)} km` : "Calculating..."}
                      </div>
                      <div className="text-xs text-muted-foreground">Distance</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/20 rounded-lg">
                      <Navigation className="h-5 w-5 text-accent mx-auto mb-1" />
                      <div className="text-sm font-medium">{userStake.amount} ETH</div>
                      <div className="text-xs text-muted-foreground">Staked</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/20 rounded-lg">
                      <Compass className="h-5 w-5 text-accent mx-auto mb-1" />
                      <div className="text-sm font-medium">
                        {(Number.parseFloat(userStake.amount) * place.maxReward).toFixed(3)}
                      </div>
                      <div className="text-xs text-muted-foreground">Potential ETH</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-card-foreground">Mission Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Time Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {locationError ? (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">{locationError}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Location tracking active</span>
                      </div>
                    )}

                    {isNearDestination && (
                      <Button
                        onClick={handleVerifyArrival}
                        className="w-full sketch-border bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Verify Arrival
                      </Button>
                    )}

                    {!isNearDestination && distance !== null && (
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Navigation className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-sm text-blue-600">
                          {distance > 1 ? `${distance.toFixed(1)} km to go` : `${(distance * 1000).toFixed(0)}m to go`}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Interactive Map */}
          <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-card-foreground">Ancient Navigation Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <InteractiveMap
                  destination={place.coordinates}
                  userLocation={userLocation}
                  placeName={place.name}
                  onLocationUpdate={setUserLocation}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <VerificationModal
          place={place}
          userStake={userStake}
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  )
}
