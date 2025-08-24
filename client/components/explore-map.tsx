"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet"
import { divIcon } from "leaflet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Star, Clock, Coins, Maximize2, Minimize2, Trophy } from "lucide-react"
import "leaflet/dist/leaflet.css"

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

interface ExploreMapProps {
  places: Place[]
  onPlaceSelect: (place: Place) => void
}

// Custom marker icons
const createCustomIcon = (category: string, difficulty: string) => {
  const getColor = () => {
    switch (difficulty) {
      case "Easy":
        return "#22c55e"
      case "Medium":
        return "#eab308"
      case "Hard":
        return "#f97316"
      case "Legendary":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getSymbol = () => {
    switch (category) {
      case "Ancient":
        return "🏛️"
      case "Mystical":
        return "🔮"
      case "Futuristic":
        return "🚀"
      case "Legendary":
        return "👑"
      default:
        return "📍"
    }
  }

  return divIcon({
    html: `
      <div style="
        background: ${getColor()};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transform: rotate(-45deg);
      ">
        <span style="transform: rotate(45deg);">${getSymbol()}</span>
      </div>
    `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

function MapController({ places }: { places: Place[] }) {
  const map = useMap()

  useEffect(() => {
    if (places.length > 0) {
      const bounds = places.map((place) => [place.coordinates.lat, place.coordinates.lng] as [number, number])
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [places, map])

  return null
}

export default function ExploreMap({ places, onPlaceSelect }: ExploreMapProps) {
  const mapRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const indiaCenter: [number, number] = [20.5937, 78.9629]

  // Simple gamification: connect places with quest path
  const questPath = places.map((p) => [p.coordinates.lat, p.coordinates.lng])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isFullscreen])

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
    <div
      className={`w-full transition-all duration-500 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-background" // Increased z-index and added background
          : "h-full relative"
      }`}
    >
      <MapContainer
        ref={mapRef}
        center={indiaCenter}
        zoom={5}
        className={`w-full transition-all duration-500 ${
          isFullscreen ? "h-screen" : "h-full" // Explicit height for fullscreen
        } ancient-map`}
        style={{
          filter: darkMode ? "sepia(20%) contrast(1.1) brightness(0.8)" : "none",
          background: darkMode ? "#1a1a1a" : "#f5f5f5",
        }}
      >
        <TileLayer
          url={
            darkMode
              ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapController places={places} />

        {/* Quest Path */}
        {questPath.length > 1 && (
          <Polyline
            positions={questPath}
            color={darkMode ? "#00ffcc" : "#0077ff"}
            weight={3}
            opacity={0.7}
            dashArray="10,6"
          />
        )}

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.coordinates.lat, place.coordinates.lng]}
            icon={createCustomIcon(place.category, place.difficulty)}
          >
            <Popup className="ancient-popup" maxWidth={300}>
              <div className="p-2 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-lg text-foreground leading-tight">{place.name}</h3>
                  <div className="flex items-center gap-1 bg-background/80 rounded-full px-2 py-1">
                    <Star className="h-3 w-3 text-accent fill-current" />
                    <span className="text-xs font-medium">{place.successRate}%</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>

                <div className="flex gap-2 flex-wrap">
                  <Badge className={`${getDifficultyColor(place.difficulty)} border text-xs`}>{place.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {place.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-accent" />
                    <span>{place.timeLimit}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-accent" />
                    <span>{place.minStake} ETH</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Reward: up to {place.maxReward}x</div>
                  <div>{place.currentStakes} ETH staked</div>
                </div>

                <Button
                  onClick={() => onPlaceSelect(place)}
                  size="sm"
                  className="w-full sketch-border bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Stake & Explore
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
        {" "}
        {/* Added z-index */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-background/90 backdrop-blur-sm hover:bg-background" // Better visibility
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm p-2 rounded-md">
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          <span className="text-xs text-foreground">Dark Mode</span>
        </div>
      </div>

      {/* Gamification Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-400" />
        <span className="text-xs font-semibold text-foreground">XP: {places.length * 50} / 1000</span>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            style={{ width: `${(places.length * 50) / 10}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
