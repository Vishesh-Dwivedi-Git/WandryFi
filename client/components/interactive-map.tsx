"use client"

import { useEffect, useRef } from "react"
import { MapPin, Navigation } from "lucide-react"

interface InteractiveMapProps {
  destination: { lat: number; lng: number }
  userLocation: { lat: number; lng: number } | null
  placeName: string
  onLocationUpdate?: (location: { lat: number; lng: number }) => void
}

export function InteractiveMap({ destination, userLocation, placeName, onLocationUpdate }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const destinationMarkerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map centered on destination
        mapInstanceRef.current = L.map(mapRef.current).setView([destination.lat, destination.lng], 13)

        // Add ancient-themed tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          className: "ancient-map-tiles",
        }).addTo(mapInstanceRef.current)

        // Add destination marker
        const destinationIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 bg-accent rounded-full border-2 border-accent-foreground shadow-lg">
                   <svg class="w-4 h-4 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                   </svg>
                 </div>`,
          className: "ancient-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        destinationMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destinationIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<div class="text-center p-2"><strong>${placeName}</strong><br/>Your destination awaits!</div>`)

        // Add user location marker if available
        if (userLocation) {
          updateUserMarker(L, userLocation)
        }
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [destination, placeName])

  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      const updateUserLocation = async () => {
        const L = (await import("leaflet")).default
        updateUserMarker(L, userLocation)
      }
      updateUserLocation()
    }
  }, [userLocation])

  const updateUserMarker = (L: any, location: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current)
    }

    // Create user location icon
    const userIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
               <div class="w-2 h-2 bg-white rounded-full"></div>
             </div>`,
      className: "user-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    // Add user marker
    userMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup("<div class='text-center p-2'><strong>You are here</strong></div>")

    // Draw route line
    const routeLine = L.polyline(
      [
        [location.lat, location.lng],
        [destination.lat, destination.lng],
      ],
      {
        color: "#ffb74d",
        weight: 3,
        opacity: 0.7,
        dashArray: "10, 10",
      },
    ).addTo(mapInstanceRef.current)

    // Fit map to show both markers
    const group = L.featureGroup([userMarkerRef.current, destinationMarkerRef.current, routeLine])
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map overlay with ancient styling */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="font-medium">{placeName}</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 text-sm mt-1">
            <Navigation className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Tracking your location</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent" style={{ borderTop: "2px dashed #ffb74d" }}></div>
            <span>Route</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!userLocation && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Locating your position...</p>
          </div>
        </div>
      )}

      {/* CSS for ancient map styling */}
      <style jsx global>{`
        .ancient-map-tiles {
          filter: sepia(0.3) contrast(1.2) brightness(0.9);
        }
        .ancient-marker {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        .user-marker {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        .leaflet-popup-content-wrapper {
          background: rgba(249, 245, 241, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #d7d2cb;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: rgba(249, 245, 241, 0.95);
          border: 1px solid #d7d2cb;
        }
      `}</style>
    </div>
  )
}
