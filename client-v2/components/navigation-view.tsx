"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Navigation, Target, MapPin, Loader2, AlertCircle } from "lucide-react"
import { useWanderfy } from "@/contexts/wanderify-context"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface NavigationViewProps {
  onClose: () => void
}

interface UserLocation {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
  heading?: number
  speed?: number
}

interface QuestDestination {
  id: string
  name: string
  lat: number
  lng: number
  stakeAmount: number
  image: string
  timeRemaining: number
  status: "in-progress" | "ready-for-checkin"
}

// ✅ Utility function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

// ✅ Minimalist Custom icons
const createUserIcon = (heading?: number) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute inset-0 w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
        <div class="relative w-8 h-8 bg-cyan-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center" ${heading !== undefined ? `style="transform: rotate(${heading}deg)"` : ''}>
          <div class="w-3 h-3 bg-black rounded-full"></div>
          ${heading !== undefined ? '<div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-black"></div>' : ''}
        </div>
      </div>
    `,
    className: "user-location-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

const createDestinationIcon = (isActive: boolean = false, distance?: number) => {
  let color = '#ef4444'; // red by default
  if (distance && distance <= 100) color = '#10b981'; // green
  else if (distance && distance <= 500) color = '#f59e0b'; // amber
  
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="relative w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${isActive ? 'animate-pulse' : ''}" style="background-color: ${color}">
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
          </svg>
        </div>
        ${distance !== undefined ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">${Math.round(distance)}m</div>` : ''}
      </div>
    `,
    className: "destination-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

// ✅ Location Tracker
function LocationTracker({ 
  onLocationUpdate, 
  onError 
}: { 
  onLocationUpdate: (location: UserLocation) => void;
  onError: (error: string) => void;
}) {
  const map = useMap()

  useEffect(() => {
    let watchId: number | null = null

    const startTracking = () => {
      if (!navigator.geolocation) {
        onError("Geolocation is not supported by this browser.")
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 10,
            timestamp: position.timestamp,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          }
          onLocationUpdate(location)
          onError("")
        },
        (error) => {
          let errorMessage = "Location error: "
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access denied by user"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information unavailable"
              break
            case error.TIMEOUT:
              errorMessage += "Location request timed out"
              break
            default:
              errorMessage += "An unknown error occurred"
              break
          }
          onError(errorMessage)
          
          // Fallback to default location (Bangalore)
          onLocationUpdate({
            lat: 12.9716,
            lng: 77.5946,
            accuracy: 1000,
            timestamp: Date.now()
          })
        },
        options
      )
    }

    startTracking()

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [map, onLocationUpdate, onError])

  return null
}

// ✅ Navigation Controller
function NavigationController({ 
  userLocation, 
  activeDestination, 
  onDistanceUpdate 
}: { 
  userLocation: UserLocation | null
  activeDestination: QuestDestination | null
  onDistanceUpdate: (distance: number) => void 
}) {
  const map = useMap()

  useEffect(() => {
    if (userLocation && activeDestination) {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        activeDestination.lat, 
        activeDestination.lng
      )
      onDistanceUpdate(distance)

      const mapCenter = map.getCenter()
      const centerDistance = calculateDistance(
        mapCenter.lat, 
        mapCenter.lng, 
        userLocation.lat, 
        userLocation.lng
      )

      if (centerDistance > 100) {
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [activeDestination.lat, activeDestination.lng]
        ])
        map.flyToBounds(bounds, { 
          padding: [80, 80],
          maxZoom: 16,
          duration: 1.5
        })
      }
    } else if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1 })
    }
  }, [userLocation, activeDestination, map, onDistanceUpdate])

  return null
}

export default function NavigationView({ onClose }: NavigationViewProps) {
  const { activeQuests, stakedQuests, completeQuest, isQuestStaked } = useWanderfy()
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState<string>("")
  const [selectedDestination, setSelectedDestination] = useState<QuestDestination | null>(null)
  const [fullScreenQuest, setFullScreenQuest] = useState<QuestDestination | null>(null)
  const [distanceToDestination, setDistanceToDestination] = useState<number>(Infinity)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)

  // ✅ ONLY show destinations that are staked
  const questDestinations: QuestDestination[] = activeQuests
    .filter(
      quest =>
        isQuestStaked(quest.destinationId) &&
        (quest.status === "in-progress" || quest.status === "ready-for-checkin")
    )
    .map((quest, index) => {
      const coordinates = {
        "1": { lat: 13.3428, lng: 77.1234 }, // Nrupatunga Betta
        "3": { lat: 15.3350, lng: 76.4600 }, // Hampi Ruins  
        "4": { lat: 12.3375, lng: 75.8069 }, // Coorg Coffee Plantations
        "2": { lat: 13.2846, lng: 77.0436 }, // Mystic Falls
        "5": { lat: 14.5492, lng: 74.3200 }, // Gokarna Beach Trek
        "6": { lat: 13.3931, lng: 75.7208 }, // Mullayanagiri Peak
        "7": { lat: 14.2290, lng: 74.8131 }, // Jog Falls
        "8": { lat: 15.9149, lng: 75.6767 }, // Badami Caves
        "9": { lat: 15.2593, lng: 74.6253 }, // Dandeli Wildlife Sanctuary
        "10": { lat: 12.2897, lng: 77.1711 }, // Shivanasamudra Falls
      }

      const coords = coordinates[quest.destinationId as keyof typeof coordinates] || 
                     { lat: 12.9716 + (index * 0.1), lng: 77.5946 + (index * 0.1) }

      return {
        id: quest.id,
        name: quest.destinationName,
        lat: coords.lat,
        lng: coords.lng,
        stakeAmount: quest.stakeAmount,
        image: quest.image,
        timeRemaining: quest.timeRemaining,
        status: quest.status as "in-progress" | "ready-for-checkin"
      }
    })

  const handleLocationUpdate = useCallback((location: UserLocation) => {
    setUserLocation(location)
  }, [])

  const handleLocationError = useCallback((error: string) => {
    setLocationError(error)
  }, [])

  const handleDistanceUpdate = useCallback((distance: number) => {
    setDistanceToDestination(distance)
  }, [])

  const handleQuestSelect = useCallback((quest: QuestDestination) => {
    setSelectedDestination(quest)
    setFullScreenQuest(quest)
  }, [])

  const handleCheckIn = async () => {
    if (!fullScreenQuest || distanceToDestination > 50) return

    setCheckingIn(true)
    
    setTimeout(() => {
      setIsCheckedIn(true)
      completeQuest(fullScreenQuest.id)
      
      setTimeout(() => {
        setCheckingIn(false)
        setFullScreenQuest(null)
        setSelectedDestination(null)
        setIsCheckedIn(false)
        onClose()
      }, 2000)
    }, 1500)
  }

  const canCheckIn = distanceToDestination <= 50 && fullScreenQuest && !checkingIn && !isCheckedIn

  const getDistanceToQuest = (quest: QuestDestination): number => {
    if (!userLocation) return Infinity
    return calculateDistance(userLocation.lat, userLocation.lng, quest.lat, quest.lng)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* ✅ Clean Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black border-b border-cyan-400">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="font-pixel text-xl text-cyan-400">
              {fullScreenQuest ? `Navigate to ${fullScreenQuest.name}` : "Staked Quests Navigation"}
            </h1>
            {userLocation && (
              <div className="flex items-center space-x-2 text-xs bg-zinc-900 border border-cyan-400 rounded px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-cyan-400">GPS ACTIVE</span>
                {userLocation.accuracy && (
                  <span className="text-gray-400">±{Math.round(userLocation.accuracy)}m</span>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (fullScreenQuest) {
                setFullScreenQuest(null)
                setSelectedDestination(null)
              } else {
                onClose()
              }
            }}
            className="text-cyan-400 hover:text-white hover:bg-zinc-900 border border-cyan-400"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Error Banner */}
        {locationError && (
          <div className="px-4 pb-2">
            <div className="bg-red-900 border border-red-500 rounded p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{locationError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pt-16 h-full flex">
        {/* Sidebar */}
        {!fullScreenQuest && (
          <div className="w-80 bg-black border-r border-zinc-800 overflow-y-auto">
            <div className="p-4">
              <h2 className="font-pixel text-lg text-cyan-400 mb-2">STAKED QUESTS</h2>
              <p className="text-xs text-gray-400 mb-4">Only destinations you have staked appear here</p>
              
              {questDestinations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No staked quests available</p>
                  <p className="text-zinc-600 text-xs mt-1">Stake a quest from the Explore page</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questDestinations.map((quest) => {
                    const distance = getDistanceToQuest(quest)
                    return (
                      <Card 
                        key={quest.id} 
                        className="cursor-pointer hover:border-cyan-400 transition-colors bg-zinc-900 border-zinc-700"
                        onClick={() => handleQuestSelect(quest)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-pixel text-sm text-white truncate">{quest.name}</h3>
                            <div className="flex space-x-1">
                              <Badge className="bg-blue-600 text-white text-xs">STAKED</Badge>
                              <Badge className={quest.status === "ready-for-checkin" ? "bg-green-600 text-white" : "bg-amber-600 text-white"}>
                                {quest.status === "ready-for-checkin" ? "READY" : "IN PROGRESS"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span className="text-orange-400 font-bold">{quest.stakeAmount} WNDR</span>
                            <span>{quest.timeRemaining}% remaining</span>
                          </div>

                          {userLocation && (
                            <div className="flex items-center justify-between text-xs mb-3">
                              <span className="flex items-center text-cyan-400">
                                <Target className="w-3 h-3 mr-1" />
                                {distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`} away
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                distance <= 100 ? 'bg-green-600 text-white' :
                                distance <= 500 ? 'bg-amber-600 text-white' :
                                'bg-red-600 text-white'
                              }`}>
                                {distance <= 100 ? 'VERY CLOSE' : distance <= 500 ? 'NEARBY' : 'FAR'}
                              </span>
                            </div>
                          )}

                          <Button 
                            size="sm" 
                            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-bold"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuestSelect(quest)
                            }}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            NAVIGATE TO QUEST
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          {userLocation ? (
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={13} 
              style={{ height: "100%", width: "100%" }}
              zoomControl={!fullScreenQuest}
              className="z-0"
              maxZoom={18}
              minZoom={8}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={18}
              />

              <LocationTracker 
                onLocationUpdate={handleLocationUpdate}
                onError={handleLocationError}
              />

              <NavigationController 
                userLocation={userLocation}
                activeDestination={fullScreenQuest}
                onDistanceUpdate={handleDistanceUpdate}
              />

              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={createUserIcon(userLocation.heading)}
              >
                <Popup>
                  <div className="text-center bg-black text-cyan-400 p-2 rounded">
                    <p className="font-pixel text-sm mb-1">YOUR LOCATION</p>
                    <p className="text-xs text-gray-300">Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
                    {userLocation.speed && (
                      <p className="text-xs text-gray-300">Speed: {Math.round(userLocation.speed * 3.6)} km/h</p>
                    )}
                    <p className="text-xs text-gray-500">Updated: {new Date(userLocation.timestamp).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>

              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={Math.min(userLocation.accuracy, 100)}
                pathOptions={{
                  color: "#22d3ee",
                  fillColor: "#22d3ee",
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: "3, 3"
                }}
              />

              {questDestinations.map((quest) => {
                const distance = getDistanceToQuest(quest)
                return (
                  <Marker
                    key={quest.id}
                    position={[quest.lat, quest.lng]}
                    icon={createDestinationIcon(quest.id === fullScreenQuest?.id, distance)}
                    eventHandlers={{
                      click: () => {
                        if (!fullScreenQuest) {
                          handleQuestSelect(quest)
                        }
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-center bg-black text-white p-3 rounded">
                        <h3 className="font-pixel text-sm mb-2 text-cyan-400">{quest.name}</h3>
                        <Badge className="bg-blue-600 text-white mb-2">STAKED QUEST</Badge>
                        <p className="text-xs text-orange-400 mb-1">Staked: {quest.stakeAmount} WNDR</p>
                        <p className="text-xs text-gray-300 mb-2">
                          Distance: {distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`}
                        </p>
                        {!fullScreenQuest && (
                          <Button 
                            size="sm"
                            className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold"
                            onClick={() => handleQuestSelect(quest)}
                          >
                            Navigate Here
                          </Button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {fullScreenQuest && (
                <>
                  <Circle
                    center={[fullScreenQuest.lat, fullScreenQuest.lng]}
                    radius={50}
                    pathOptions={{
                      color: canCheckIn ? "#10b981" : "#ef4444",
                      fillColor: canCheckIn ? "#10b981" : "#ef4444",
                      fillOpacity: canCheckIn ? 0.2 : 0.1,
                      weight: 3,
                      dashArray: "8, 4"
                    }}
                  />
                  <Circle
                    center={[fullScreenQuest.lat, fullScreenQuest.lng]}
                    radius={100}
                    pathOptions={{
                      color: "#f59e0b",
                      fillColor: "transparent",
                      weight: 2,
                      dashArray: "12, 8",
                      opacity: 0.6
                    }}
                  />
                </>
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-cyan-400 text-lg">Loading your location...</p>
                <p className="text-gray-400 text-sm mt-2">Please allow location access when prompted</p>
              </div>
            </div>
          )}

          {/* Navigation Info Panel */}
          {fullScreenQuest && userLocation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <Card className="bg-black border border-cyan-400 min-w-[300px]">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Badge className="bg-blue-600 text-white mb-2">STAKED QUEST</Badge>
                    <h3 className="font-pixel text-lg text-cyan-400 mb-2">{fullScreenQuest.name}</h3>
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1 text-cyan-400">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">
                          {distanceToDestination < 1000 
                            ? `${Math.round(distanceToDestination)}m away` 
                            : `${(distanceToDestination/1000).toFixed(2)}km away`
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-orange-400">
                        <MapPin className="w-4 h-4" />
                        <span>{fullScreenQuest.stakeAmount} WNDR</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    {isCheckedIn ? (
                      <div className="text-green-400 font-pixel">
                        <div className="text-2xl mb-1">🎉</div>
                        STAKED QUEST COMPLETED!
                      </div>
                    ) : checkingIn ? (
                      <div className="text-amber-400 font-pixel flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        CHECKING IN...
                      </div>
                    ) : distanceToDestination <= 50 ? (
                      <div className="text-green-400 font-pixel">
                        <div className="text-lg mb-1">✓</div>
                        WITHIN CHECK-IN RANGE!
                      </div>
                    ) : distanceToDestination <= 100 ? (
                      <p className="text-amber-400 font-pixel">ALMOST THERE! GET CLOSER</p>
                    ) : (
                      <p className="text-gray-400">Navigate to within 50m to check in</p>
                    )}
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn}
                    size="lg"
                    className={`font-pixel px-8 py-4 text-lg font-bold ${
                      isCheckedIn
                        ? "bg-green-600 text-white"
                        : canCheckIn
                        ? "bg-cyan-400 hover:bg-cyan-500 text-black"
                        : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    {checkingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        CHECKING IN...
                      </>
                    ) : isCheckedIn ? (
                      "CHECKED IN ✓"
                    ) : canCheckIn ? (
                      "CHECK IN NOW"
                    ) : (
                      `GET ${Math.round(distanceToDestination - 50)}M CLOSER`
                    )}
                  </Button>

                  {!isCheckedIn && !checkingIn && distanceToDestination > 50 && distanceToDestination < 200 && (
                    <div className="mt-3">
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, (200 - distanceToDestination) / 150 * 100))}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Approaching staked destination...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
