"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { divIcon } from "leaflet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, Coins } from "lucide-react"
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

// Custom marker icons for different categories
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
      // Fit map to show all places
      const bounds = places.map((place) => [place.coordinates.lat, place.coordinates.lng] as [number, number])
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [places, map])

  return null
}

export default function ExploreMap({ places, onPlaceSelect }: ExploreMapProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

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

  // Center of India for initial view
  const indiaCenter: [number, number] = [20.5937, 78.9629]

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={indiaCenter}
        zoom={5}
        className="w-full h-full ancient-map"
        style={{
          filter: "sepia(20%) contrast(1.1) brightness(0.9)",
          background: "#2c1810",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController places={places} />

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

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2 text-xs">
        <h4 className="font-semibold text-foreground">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span>🏛️</span>
            <span>Ancient</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔮</span>
            <span>Mystical</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚀</span>
            <span>Futuristic</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👑</span>
            <span>Legendary</span>
          </div>
        </div>
      </div>
    </div>
  )
}
