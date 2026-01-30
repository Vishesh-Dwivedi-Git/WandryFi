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
  Sword,
} from "lucide-react";
import { useWanderfy } from "@/contexts/wanderify-context";
import dynamic from "next/dynamic";
import { useAccount, useWriteContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";

let L: any = null;

// Dynamic imports with proper loading states for hydration safety
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-cyan-400">Loading map...</div>
  }
);
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface Destination {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  coordinates: { lat: number; lng: number };
  xpReward?: number;
}

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

// Distance calculation using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Radius of Earth in meters
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

// Create user avatar icon
const createUserIcon = (heading?: number): L.DivIcon | null => {
  if (typeof window === "undefined" || !L) return null;

  const rotationStyle = heading !== undefined ? `transform: rotate(${heading}deg);` : "";
  const directionIndicator = heading !== undefined
    ? `<div class="absolute -top-1 left-1/2 transform -translate-x-1/2">
         <div class="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-yellow-400"></div>
       </div>`
    : "";

  return L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute inset-0 w-12 h-12 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
        <div class="relative w-12 h-12 bg-cyan-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden" style="${rotationStyle}">
          <div class="w-10 h-10 relative">
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-orange-400 rounded-full border border-orange-600 shadow-inner">
              <div class="absolute top-1.5 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div class="absolute top-1.5 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border-b border-black rounded-full"></div>
              <div class="absolute top-0.5 left-1 w-2 h-2 bg-orange-200 rounded-full opacity-60"></div>
            </div>
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-4 bg-green-500 rounded border border-green-700 shadow-inner">
              <div class="absolute top-0 left-0.5 w-2 h-1.5 bg-green-300 rounded opacity-60"></div>
            </div>
          </div>
          ${directionIndicator}
        </div>
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

// Create destination marker icon
const createDestinationIcon = (distance: number): L.DivIcon | null => {
  if (typeof window === "undefined" || !L) return null;

  let bgColor = "#dc2626"; // red
  let status = "FAR";
  let statusIcon = "🔴";

  if (distance <= 50) {
    bgColor = "#16a34a"; // green
    status = "READY";
    statusIcon = "✅";
  } else if (distance <= 100) {
    bgColor = "#ea580c"; // orange
    status = "CLOSE";
    statusIcon = "🟡";
  } else if (distance <= 500) {
    bgColor = "#2563eb"; // blue
    status = "NEAR";
    statusIcon = "🔵";
  }

  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-14 h-14 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative overflow-hidden" style="background-color: ${bgColor}">
          <div class="relative">
            <div class="w-6 h-8 mx-auto rounded-t border border-yellow-600 relative" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)">
              <div class="absolute top-0.5 left-0.5 w-0.5 h-4 bg-yellow-600 rounded"></div>
              <div class="absolute top-0.5 right-0.5 w-0.5 h-4 bg-yellow-600 rounded"></div>
              <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <div class="absolute top-0 left-0 w-2 h-3 bg-yellow-200 rounded opacity-50"></div>
            </div>
            <div class="w-7 h-2 rounded border border-yellow-600" style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%)">
              <div class="w-2 h-1 bg-yellow-200 rounded opacity-60"></div>
            </div>
          </div>
        </div>
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

// Real-time location tracker component
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

          // Auto-center map to show both user and destination
          const userLat = location.lat;
          const userLng = location.lng;
          const destLat = destination.coordinates?.lat;
          const destLng = destination.coordinates?.lng;

          if (userLat && userLng && destLat && destLng) {
            const bounds = L.latLngBounds([
              [userLat, userLng],
              [destLat, destLng],
            ]);
            map.fitBounds(bounds, {
              padding: [60, 60],
              maxZoom: 16,
              animate: true,
              duration: 1.0,
            });
          }
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

// Dark map styling component with z-index fixes
function DarkMapStyle(): null {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container {
        background: #050505 !important;
        font-family: 'Courier New', monospace !important;
        z-index: 1 !important;
      }
      .leaflet-tile {
        filter: sepia(100%) hue-rotate(180deg) brightness(0.8) contrast(1.2) saturate(3) !important;
        opacity: 0.8 !important;
      }
      .leaflet-control {
        background: #1a1a1a !important;
        border: 1px solid #06b6d4 !important;
        border-radius: 4px !important;
        z-index: 10 !important;
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
        z-index: 1000 !important;
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

export default function NavigationView({ destination, onClose }: NavigationViewProps) {
  const { completeQuest } = useWanderfy();
  const { address } = useAccount();
  const contract = useWanderifyContract();
  const { writeContract } = useWriteContract();

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [distanceToTarget, setDistanceToTarget] = useState<number>(Infinity);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setMounted(true);

    // Load Leaflet CSS and JS only on client side
    if (typeof window !== "undefined") {
      // Load CSS via CDN to avoid hydration issues
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!L) {
        import("leaflet").then((leaflet) => {
          L = leaflet.default;
          // Fix default marker icons
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
          setMapReady(true);
        });
      } else {
        setMapReady(true);
      }

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
    requestLocation();
  }, []);

  useEffect(() => {
    if (userLocation && destination.coordinates) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        destination.coordinates.lat,
        destination.coordinates.lng
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
        // Fallback location for testing
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
    console.log("========================================");
    console.log("🎯 handleCheckIn called");
    console.log("📍 User Location:", userLocation);
    console.log("🗺️ Destination:", destination);
    console.log("📏 Distance to Target:", distanceToTarget);
    console.log("✅ Is in range (<50m):", distanceToTarget <= 50);

    if (distanceToTarget > 50) {
      console.log("❌ Distance > 50m, aborting check-in");
      return;
    }
    if (!address) {
      setLocationError("Please connect your wallet");
      return;
    }
    if (!userLocation) {
      setLocationError("GPS location not available");
      return;
    }

    setCheckingIn(true);

    try {
      const requestBody = {
        walletAddress: address,
        destinationId: destination.id,
        userLat: userLocation.lat,
        userLon: userLocation.lng,
      };

      console.log("📤 Sending to API:", requestBody);

      // Use environment variable for backend URL, fallback to localhost for development
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      console.log("🔗 API URL:", backendUrl + "/api/verify");

      // Call backend verification service
      const response = await fetch(`${backendUrl}/api/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "7987",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Error response:", errorData);
        throw new Error(errorData.error || "Verification failed");
      }

      const { signature } = await response.json();
      console.log("✅ Got signature:", signature);

      // Call smart contract checkIn function
      await writeContract({
        ...contract,
        functionName: "checkIn",
        args: [signature],
      });

      // Complete quest in context
      completeQuest(destination.id);

      setIsCheckedIn(true);
      setTimeout(() => {
        setCheckingIn(false);
        setIsCheckedIn(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("❌ Check-in failed:", error);
      setLocationError(error instanceof Error ? error.message : "Check-in failed");
      setCheckingIn(false);
    }
    console.log("========================================");
  };

  const isInRange = distanceToTarget <= 50;
  const isClose = distanceToTarget <= 100;
  const isNearby = distanceToTarget <= 500;

  // Prevent hydration mismatch - show loading until fully mounted and ready
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Sword className="w-full h-full text-cyan-400 animate-spin" />
          </div>
          <p className="text-cyan-400 text-2xl font-mono font-bold">LOADING QUEST</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] font-mono text-[#E0E0E0]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#050505] border-b border-white/10 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-4">
            <h1 className="font-bold text-xl text-white tracking-widest uppercase">QUEST: {destination.name}</h1>
            <Badge className="bg-white text-black font-bold px-3 py-1 text-xs tracking-wider border-none">
              {destination.difficulty.toUpperCase()}
            </Badge>
            {userLocation && (
              <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/10 rounded px-3 py-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400 font-bold">GPS</span>
                <span className="text-white">±{Math.round(userLocation.accuracy)}m</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-white hover:bg-white/5 border border-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {userLocation && (
        <div className="fixed top-16 left-0 right-0 z-20 bg-[#050505]/90 border-b border-white/10 p-4 backdrop-blur-sm">
          <div className={`rounded border p-4 transition-colors duration-500 ${isInRange ? "bg-green-500/10 border-green-500/50" :
            isClose ? "bg-orange-500/10 border-orange-500/50" :
              isNearby ? "bg-blue-500/10 border-blue-500/50" :
                "bg-white/5 border-white/10"
            }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Target className={`w-6 h-6 ${isInRange ? "text-green-500" :
                  isClose ? "text-orange-500" :
                    isNearby ? "text-blue-500" :
                      "text-gray-500"
                  }`} />
                <div>
                  <p className={`font-bold text-lg tracking-widest ${isInRange ? "text-green-500" :
                    isClose ? "text-orange-500" :
                      isNearby ? "text-blue-500" :
                        "text-white"
                    }`}>
                    {distanceToTarget < 1000
                      ? `${Math.round(distanceToTarget)}m`
                      : `${(distanceToTarget / 1000).toFixed(2)}km`}
                  </p>
                  <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                    {isInRange ? "CHECK-IN AVAILABLE" :
                      isClose ? "ALMOST THERE" :
                        isNearby ? "APPROACHING" :
                          "NAVIGATE TO TARGET"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/10 text-white border border-white/20 px-3 py-1 font-bold text-sm tracking-widest">
                  +{destination.xpReward || 100}XP
                </div>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">REWARD</p>
              </div>
            </div>
            <div className="w-full bg-white/5 h-1">
              <div
                className={`h-full transition-all duration-500 ${isInRange ? "bg-green-500" :
                  isClose ? "bg-orange-500" :
                    isNearby ? "bg-blue-500" :
                      "bg-white/20"
                  }`}
                style={{
                  width: `${Math.max(5, Math.min(100, (1000 - distanceToTarget) / 10))}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 ${userLocation ? "top-40" : "top-16"} bottom-0 w-80 bg-[#050505] border-r border-white/10 overflow-y-auto z-10`}>
        <div className="p-6">
          <div className="mb-8">
            <h2 className="font-bold text-xs text-gray-500 mb-4 tracking-widest uppercase border-b border-white/10 pb-2">MISSION INTEL</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-white mb-2">{destination.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{destination.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 border-l border-white/20">
                  <span className="text-[10px] text-gray-500 block mb-1 tracking-widest">DIFFICULTY</span>
                  <span className="text-white font-bold text-sm">{destination.difficulty}</span>
                </div>
                <div className="bg-white/5 p-3 border-l border-white/20">
                  <span className="text-[10px] text-gray-500 block mb-1 tracking-widest">REWARD</span>
                  <span className="text-white font-bold text-sm">+{destination.xpReward || 100}XP</span>
                </div>
              </div>

              {userLocation && (
                <div className="bg-white/5 p-3 border-l border-white/20">
                  <span className="text-[10px] text-gray-500 block mb-1 tracking-widest">DISTANCE</span>
                  <span className="text-white font-bold text-sm">
                    {distanceToTarget < 1000
                      ? `${Math.round(distanceToTarget)}m`
                      : `${(distanceToTarget / 1000).toFixed(2)}km`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Check-in Button */}
          {isInRange && (
            <div className="mb-6">
              <Button
                onClick={handleCheckIn}
                disabled={checkingIn}
                size="lg"
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 tracking-widest uppercase rounded-none"
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    [ CLAIM REWARD ]
                  </>
                )}
              </Button>
            </div>
          )}

          {/* GPS Status */}
          {!userLocation && (
            <div className="bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-gray-400 text-xs mb-4 tracking-widest">SIGNAL LOST</p>
              <Button
                onClick={requestLocation}
                disabled={isRequestingLocation}
                className="w-full bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-bold tracking-widest uppercase rounded-none"
              >
                {isRequestingLocation ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    SEARCHING...
                  </>
                ) : (
                  "ESTABLISH UPLINK"
                )}
              </Button>
            </div>
          )}

          {locationError && (
            <div className="mt-4 p-4 border-l-2 border-red-500 bg-red-500/10">
              <p className="text-red-400 text-xs font-mono">{locationError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Map View - Only render when fully ready to prevent hydration issues */}
      <div
        className={`fixed left-80 ${userLocation ? "top-40" : "top-16"} right-0 bottom-0`}
        style={{ zIndex: 1 }}
      >
        {userLocation && mapReady ? (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%", zIndex: 1 }}
            className="z-0"
            zoomControl={true}
          >
            <DarkMapStyle />
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
                    <p className="text-cyan-400 font-bold mb-2">YOUR LOCATION</p>
                    <p className="text-sm text-white">Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
                    {userLocation.speed && (
                      <p className="text-sm text-white">Speed: {Math.round(userLocation.speed * 3.6)} km/h</p>
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

            {/* Destination marker */}
            {createDestinationIcon(distanceToTarget) && destination.coordinates && (
              <Marker
                position={[destination.coordinates.lat, destination.coordinates.lng]}
                icon={createDestinationIcon(distanceToTarget)!}
              >
                <Popup>
                  <div className="p-4 text-center font-mono">
                    <h3 className="text-cyan-400 font-bold text-lg mb-2">{destination.name}</h3>
                    <p className="text-sm text-white mb-3">{destination.description}</p>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <Badge className="bg-orange-600 text-black font-bold text-xs">
                        {destination.difficulty}
                      </Badge>
                      <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                        +{destination.xpReward || 100}XP
                      </div>
                    </div>
                    <p className="text-cyan-400 font-bold">
                      Distance: {distanceToTarget < 1000
                        ? `${Math.round(distanceToTarget)}m`
                        : `${(distanceToTarget / 1000).toFixed(1)}km`}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Path line */}
            {destination.coordinates && (
              <Polyline
                positions={[
                  [userLocation.lat, userLocation.lng],
                  [destination.coordinates.lat, destination.coordinates.lng],
                ]}
                pathOptions={{
                  color: "#06b6d4",
                  weight: 3,
                  opacity: 1,
                }}
              />
            )}

            {/* Check-in zone (50m) */}
            {destination.coordinates && (
              <Circle
                center={[destination.coordinates.lat, destination.coordinates.lng]}
                radius={50}
                pathOptions={{
                  color: isInRange ? "#16a34a" : "#dc2626",
                  fillColor: isInRange ? "#16a34a" : "#dc2626",
                  fillOpacity: isInRange ? 0.3 : 0.1,
                  weight: 3,
                }}
              />
            )}

            {/* Approach zone (100m) */}
            {destination.coordinates && (
              <Circle
                center={[destination.coordinates.lat, destination.coordinates.lng]}
                radius={100}
                pathOptions={{
                  color: "#ea580c",
                  fillColor: "transparent",
                  weight: 2,
                  opacity: 0.8,
                }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-400 text-2xl font-bold mb-2">QUEST AWAITS</p>
              <p className="text-white text-lg font-bold mb-6">
                {!userLocation ? "Activate GPS to begin" : "Loading map..."}
              </p>
              {!userLocation && (
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
              )}
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
              <h2 className="font-bold text-2xl text-green-400 mb-3">QUEST COMPLETED!</h2>
              <p className="text-green-300 font-bold text-lg mb-4">{destination.name} Conquered!</p>
              <div className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-lg mb-4">
                +{destination.xpReward || 100}XP EARNED!
              </div>
              <div className="text-sm text-white mt-4 font-bold">Returning in 3 seconds...</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
