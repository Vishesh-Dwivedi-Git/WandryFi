"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Target,
  MapPin,
  Loader2,
  Trophy,
  Zap,
  Navigation,
  Star,
  Shield,
  Sword,
} from "lucide-react";
import { useWanderfy } from "@/contexts/wanderify-context";
import dynamic from "next/dynamic";
import { Destination, destinations } from "@/lib/destinations";

let L: any = null;

// Dynamic imports
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface NavigationViewProps {
  destination: Destination;
  onClose: () => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  heading?: number;
  speed?: number;
}

// Distance calculation
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 🎮 COMPACT 3D CARTOON AVATAR
const createUserIcon = (heading?: number): L.DivIcon | null => {
  if (typeof window === "undefined" || !L) return null;

  return L.divIcon({
    html: `
      <div class="relative">
        <!-- Outer glow ring -->
        <div class="absolute inset-0 w-12 h-12 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
        
        <!-- Main avatar container -->
        <div class="relative w-12 h-12 bg-cyan-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden" ${
          heading !== undefined
            ? `style="transform: rotate(${heading}deg)"`
            : ""
        }>
          
          <!-- 3D Cartoon Avatar -->
          <div class="w-10 h-10 relative">
            <!-- Head (3D effect) -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-orange-400 rounded-full border border-orange-600 shadow-inner">
              <!-- Eyes -->
              <div class="absolute top-1.5 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div class="absolute top-1.5 right-1 w-1 h-1 bg-black rounded-full"></div>
              <!-- Smile -->
              <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-b border-black rounded-full"></div>
              <!-- 3D highlight -->
              <div class="absolute top-0.5 left-1 w-2 h-2 bg-orange-200 rounded-full opacity-60"></div>
            </div>
            
            <!-- Body (3D effect) -->
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-4 bg-green-500 rounded border border-green-700 shadow-inner">
              <!-- 3D highlight -->
              <div class="absolute top-0 left-0.5 w-2 h-1.5 bg-green-300 rounded opacity-60"></div>
            </div>
          </div>
          
          <!-- Direction indicator -->
          ${
            heading !== undefined
              ? `
            <div class="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div class="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-yellow-400"></div>
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Player label -->
        <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-cyan-400 text-xs px-1 py-0.5 rounded border border-cyan-400 font-mono whitespace-nowrap">
          PLAYER
        </div>
      </div>
    `,
    className: "user-location-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// 🎯 COMPACT 3D DESTINATION ICON
const createDestinationIcon = (distance: number): L.DivIcon | null => {
  if (typeof window === "undefined" || !L) return null;

  let bgColor = "#dc2626";
  let borderColor = "#fca5a5";
  let status = "FAR";
  let statusIcon = "🔴";

  if (distance <= 50) {
    bgColor = "#16a34a";
    borderColor = "#86efac";
    status = "READY";
    statusIcon = "✅";
  } else if (distance <= 100) {
    bgColor = "#ea580c";
    borderColor = "#fdba74";
    status = "CLOSE";
    statusIcon = "🟡";
  } else if (distance <= 500) {
    bgColor = "#2563eb";
    borderColor = "#93c5fd";
    status = "NEAR";
    statusIcon = "🔵";
  }

  return L.divIcon({
    html: `
      <div class="relative">
        <!-- Main quest marker -->
        <div class="w-14 h-14 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative overflow-hidden" style="background-color: ${bgColor}">
          
          <!-- 3D Temple/Castle -->
          <div class="relative">
            <!-- Main tower (3D effect) -->
            <div class="w-6 h-8 mx-auto rounded-t border border-yellow-600 relative" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)">
              <!-- Tower details -->
              <div class="absolute top-0.5 left-0.5 w-0.5 h-4 bg-yellow-600 rounded"></div>
              <div class="absolute top-0.5 right-0.5 w-0.5 h-4 bg-yellow-600 rounded"></div>
              <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <!-- 3D highlight -->
              <div class="absolute top-0 left-0 w-2 h-3 bg-yellow-200 rounded opacity-50"></div>
            </div>
            <!-- Base (3D effect) -->
            <div class="w-7 h-2 rounded border border-yellow-600" style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%)">
              <div class="w-2 h-1 bg-yellow-200 rounded opacity-50"></div>
            </div>
          </div>
        </div>
        
        <!-- Compact status display -->
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded border border-cyan-400 text-xs font-mono">
          <div class="text-center whitespace-nowrap">
            <div class="text-cyan-400 font-bold">${Math.round(distance)}m</div>
            <div class="text-white">${statusIcon} ${status}</div>
          </div>
        </div>
      </div>
    `,
    className: "destination-marker",
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
};

// Real-time tracker
function RealTimeLocationTracker({
  destination,
  onLocationUpdate,
  onError,
}: {
  destination: Destination;
  onLocationUpdate: (location: UserLocation) => void;
  onError: (error: string) => void;
}): null {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    if (typeof window === "undefined" || !map) return;

    let watchId: number | null = null;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000,
    };

    const startTracking = () => {
      if (!navigator.geolocation) {
        onError("GPS not available");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 10,
            timestamp: position.timestamp,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };
          onLocationUpdate(location);
          onError("");

          // Auto-center map
          const bounds = L.latLngBounds([
            [location.lat, location.lng],
            [destination.lat, destination.lng],
          ]);
          map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 16,
            animate: true,
            duration: 1.0,
          });
        },
        (error) => {
          onError(error.message);
        },
        options
      );
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map, destination, onLocationUpdate, onError]);

  return null;
}

// Clean dark map styling for normal tiles
function DarkMapStyle(): null {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container {
        background: #000000 !important;
        font-family: 'Courier New', monospace !important;
      }
      
      .leaflet-tile {
        filter: brightness(0.6) contrast(1.2) !important;
      }
      
      .leaflet-control {
        background: #1a1a1a !important;
        border: 1px solid #06b6d4 !important;
        border-radius: 4px !important;
      }
      
      .leaflet-control-zoom a {
        background: #06b6d4 !important;
        color: #000000 !important;
        font-weight: bold !important;
        border-radius: 2px !important;
        margin: 1px !important;
      }
      
      .leaflet-control-zoom a:hover {
        background: #0891b2 !important;
      }
      
      .leaflet-popup-content-wrapper {
        background: #000000 !important;
        border: 1px solid #06b6d4 !important;
        border-radius: 4px !important;
        color: #ffffff !important;
      }
      
      .leaflet-popup-tip {
        background: #000000 !important;
        border: 1px solid #06b6d4 !important;
      }
      
      .leaflet-control-attribution {
        background: rgba(0, 0, 0, 0.8) !important;
        border: 1px solid #06b6d4 !important;
        color: #06b6d4 !important;
        font-family: 'Courier New', monospace !important;
        font-size: 10px !important;
      }
      
      .leaflet-control-attribution a {
        color: #06b6d4 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [map]);

  return null;
}

export default function NavigationView({
  destination,
  onClose,
}: NavigationViewProps) {
  const { completeQuest } = useWanderfy();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [distanceToTarget, setDistanceToTarget] = useState<number>(Infinity);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load Leaflet dynamically
    if (typeof window !== "undefined" && !L) {
      import("leaflet").then((leaflet) => {
        L = leaflet.default;
        // Fix Leaflet icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        // Import leaflet CSS dynamically
        import("leaflet/dist/leaflet.css");
      });
    }
    requestLocation(); // Auto-start GPS
  }, []);

  useEffect(() => {
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        destination.lat,
        destination.lng
      );
      setDistanceToTarget(distance);
    }
  }, [userLocation, destination]);

  const requestLocation = useCallback(() => {
    setIsRequestingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("GPS not supported");
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 10,
          timestamp: position.timestamp,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };
        setUserLocation(location);
        setIsRequestingLocation(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsRequestingLocation(false);
        // Fallback location
        setUserLocation({
          lat: 12.9716,
          lng: 77.5946,
          accuracy: 1000,
          timestamp: Date.now(),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleCheckIn = async () => {
    if (distanceToTarget > 50) return;

    setCheckingIn(true);

    setTimeout(() => {
      setIsCheckedIn(true);
      completeQuest(destination.id);

      setTimeout(() => {
        setCheckingIn(false);
        setIsCheckedIn(false);
        onClose();
      }, 3000);
    }, 2000);
  };

  const canCheckIn = distanceToTarget <= 50 && !checkingIn && !isCheckedIn;
  const isInRange = distanceToTarget <= 50;
  const isClose = distanceToTarget <= 100;
  const isNearby = distanceToTarget <= 500;

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Sword className="w-full h-full text-cyan-400 animate-spin" />
          </div>
          <p className="text-cyan-400 text-2xl font-mono font-bold">
            LOADING QUEST
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black font-mono">
      {/* Header - Fixed positioning */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-black border-b border-cyan-400 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-4">
            <h1 className="font-bold text-xl text-cyan-400">
              QUEST: {destination.name}
            </h1>
            <Badge className="bg-orange-600 text-black font-bold px-3 py-1 text-xs">
              {destination.difficulty.toUpperCase()}
            </Badge>

            {userLocation && (
              <div className="flex items-center space-x-2 text-xs bg-zinc-900 border border-cyan-400 rounded px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-cyan-400 font-bold">GPS</span>
                <span className="text-white">
                  ±{Math.round(userLocation.accuracy)}m
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cyan-400 hover:text-white hover:bg-zinc-900 border border-cyan-400 font-bold"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Status Bar - Fixed positioning, no overlap */}
      {userLocation && (
        <div className="fixed top-16 left-0 right-0 z-20 bg-black border-b border-cyan-400 p-4">
          <div
            className={`rounded border ${
              isInRange
                ? "bg-green-900 border-green-500"
                : isClose
                ? "bg-orange-900 border-orange-500"
                : isNearby
                ? "bg-blue-900 border-blue-500"
                : "bg-red-900 border-red-500"
            } p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Target
                  className={`w-6 h-6 ${
                    isInRange
                      ? "text-green-400"
                      : isClose
                      ? "text-orange-400"
                      : isNearby
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
                />
                <div>
                  <p
                    className={`font-bold text-lg ${
                      isInRange
                        ? "text-green-400"
                        : isClose
                        ? "text-orange-400"
                        : isNearby
                        ? "text-blue-400"
                        : "text-red-400"
                    }`}
                  >
                    {distanceToTarget < 1000
                      ? `${Math.round(distanceToTarget)}m AWAY`
                      : `${(distanceToTarget / 1000).toFixed(2)}km AWAY`}
                  </p>
                  <p className="text-sm text-white font-bold">
                    {isInRange
                      ? "CHECK-IN AVAILABLE"
                      : isClose
                      ? "ALMOST THERE"
                      : isNearby
                      ? "APPROACHING"
                      : "NAVIGATE TO TARGET"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm">
                  +{destination.xpReward}XP
                </div>
                <p className="text-xs text-white mt-1 font-bold">REWARD</p>
              </div>
            </div>

            {/* Progress bar - contained within status bar */}
            <div className="w-full bg-black rounded h-3 border border-cyan-400">
              <div
                className={`h-full rounded transition-all duration-500 ${
                  isInRange
                    ? "bg-green-500"
                    : isClose
                    ? "bg-orange-500"
                    : isNearby
                    ? "bg-blue-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.max(
                    5,
                    Math.min(100, (1000 - distanceToTarget) / 10)
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Properly positioned */}
      <div
        className={`fixed left-0 ${
          userLocation ? "top-40" : "top-16"
        } bottom-0 w-80 bg-black border-r border-cyan-400 overflow-y-auto z-10`}
      >
        <div className="p-4">
          <div className="mb-6">
            <h2 className="font-bold text-xl text-cyan-400 mb-3">
              QUEST DETAILS
            </h2>
            <div className="bg-zinc-900 rounded border border-cyan-400 p-4">
              <h3 className="font-bold text-lg text-white mb-2">
                {destination.name}
              </h3>
              <p className="text-sm text-white mb-3">
                {destination.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold text-sm">
                    DIFFICULTY:
                  </span>
                  <Badge className="bg-orange-600 text-black font-bold text-xs">
                    {destination.difficulty.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold text-sm">
                    XP REWARD:
                  </span>
                  <span className="text-yellow-500 font-bold">
                    +{destination.xpReward}XP
                  </span>
                </div>

                {userLocation && (
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold text-sm">
                      DISTANCE:
                    </span>
                    <span className="text-white font-bold">
                      {distanceToTarget < 1000
                        ? `${Math.round(distanceToTarget)}m`
                        : `${(distanceToTarget / 1000).toFixed(2)}km`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Check-in Button */}
          {isInRange && (
            <div className="mb-6">
              <Button
                onClick={handleCheckIn}
                disabled={checkingIn}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    CHECKING IN...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    COMPLETE QUEST
                  </>
                )}
              </Button>
            </div>
          )}

          {/* GPS Status */}
          {!userLocation && (
            <div className="bg-orange-900 border border-orange-500 rounded p-4">
              <p className="text-orange-400 font-bold text-sm mb-3">
                GPS REQUIRED
              </p>
              <Button
                onClick={requestLocation}
                disabled={isRequestingLocation}
                className="w-full bg-cyan-400 text-black font-bold"
              >
                {isRequestingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ACTIVATING...
                  </>
                ) : (
                  "ACTIVATE GPS"
                )}
              </Button>
            </div>
          )}

          {locationError && (
            <div className="mt-4 bg-red-900 border border-red-500 rounded p-4">
              <p className="text-red-400 font-bold text-sm">{locationError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Normal Map with Dark Theme - Properly positioned */}
      <div
        className={`fixed left-80 ${
          userLocation ? "top-40" : "top-16"
        } right-0 bottom-0`}
      >
        {userLocation ? (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            zoomControl={true}
          >
            <DarkMapStyle />

            {/* Normal OpenStreetMap tiles with dark theme */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <RealTimeLocationTracker
              destination={destination}
              onLocationUpdate={setUserLocation}
              onError={setLocationError}
            />

            {/* User marker */}
            {createUserIcon(userLocation.heading) && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createUserIcon(userLocation.heading)!}
              >
                <Popup>
                  <div className="p-3 text-center font-mono">
                    <p className="text-cyan-400 font-bold mb-2">
                      YOUR LOCATION
                    </p>
                    <p className="text-sm text-white">
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </p>
                    {userLocation.speed && (
                      <p className="text-sm text-white">
                        Speed: {Math.round(userLocation.speed * 3.6)} km/h
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Accuracy circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={Math.min(userLocation.accuracy, 50)}
              pathOptions={{
                color: "#06b6d4",
                fillColor: "#06b6d4",
                fillOpacity: 0.2,
                weight: 2,
              }}
            />

            {/* Quest destination */}
            {createDestinationIcon(distanceToTarget) && (
              <Marker
                position={[destination.lat, destination.lng]}
                icon={createDestinationIcon(distanceToTarget)!}
              >
                <Popup>
                  <div className="p-4 text-center font-mono">
                    <h3 className="text-cyan-400 font-bold text-lg mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-sm text-white mb-3">
                      {destination.description}
                    </p>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <Badge className="bg-orange-600 text-black font-bold text-xs">
                        {destination.difficulty}
                      </Badge>
                      <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                        +{destination.xpReward}XP
                      </div>
                    </div>
                    <p className="text-cyan-400 font-bold">
                      Distance:{" "}
                      {distanceToTarget < 1000
                        ? `${Math.round(distanceToTarget)}m`
                        : `${(distanceToTarget / 1000).toFixed(1)}km`}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Quest path line */}
            <Polyline
              positions={[
                [userLocation.lat, userLocation.lng],
                [destination.lat, destination.lng],
              ]}
              pathOptions={{
                color: "#06b6d4",
                weight: 3,
                opacity: 1,
              }}
            />

            {/* Check-in zone */}
            <Circle
              center={[destination.lat, destination.lng]}
              radius={50}
              pathOptions={{
                color: isInRange ? "#16a34a" : "#dc2626",
                fillColor: isInRange ? "#16a34a" : "#dc2626",
                fillOpacity: isInRange ? 0.3 : 0.1,
                weight: 3,
              }}
            />

            {/* Approach zone */}
            <Circle
              center={[destination.lat, destination.lng]}
              radius={100}
              pathOptions={{
                color: "#ea580c",
                fillColor: "transparent",
                weight: 2,
                opacity: 0.8,
              }}
            />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-400 text-2xl font-bold mb-2">
                QUEST AWAITS
              </p>
              <p className="text-white text-lg font-bold mb-6">
                Activate GPS to begin
              </p>
              <Button
                onClick={requestLocation}
                disabled={isRequestingLocation}
                size="lg"
                className="bg-cyan-400 text-black font-bold px-6 py-3"
              >
                {isRequestingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    INITIALIZING...
                  </>
                ) : (
                  "START QUEST"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {isCheckedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <Card className="bg-green-900 border-2 border-green-500 max-w-lg mx-4">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-bold text-2xl text-green-400 mb-3">
                QUEST COMPLETED!
              </h2>
              <p className="text-green-300 font-bold text-lg mb-4">
                {destination.name} Conquered!
              </p>

              <div className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-lg mb-4">
                +{destination.xpReward}XP EARNED!
              </div>

              <div className="text-sm text-white mt-4 font-bold">
                Returning in 3 seconds...
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
