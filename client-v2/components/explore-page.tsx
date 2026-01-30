"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StakingModal from "@/components/staking-modal";
import Image from "next/image";
import { MapPin, Trophy, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useAccount, useReadContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";
import { formatEther } from "viem";
import { destinationsById } from "@/lib/destinations";
import { AnimatePresence, motion } from "framer-motion";

// Dynamically import leaflet to avoid SSR issues
let L: any = null;

// Dynamic imports for react-leaflet components - with proper loading states
const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-cyan-400">Loading map...</div>
  }
);
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// Custom icon creation function
// Custom icon creation function with avant-garde animations
const createCustomIcon = (difficulty: string, isStaked = false, isActive = false): L.DivIcon | null => {
  if (typeof window === "undefined" || !L) return null;

  const colors: Record<string, string> = {
    Easy: "#00D4FF",   // Cyan
    Medium: "#FF9500", // Orange
    Hard: "#FF003C"    // Cyber Red
  };

  const color = colors[difficulty] || "#00D4FF";
  const size = isActive ? 48 : isStaked ? 40 : 32;

  // Pulse animation for active/high-tier items
  const pulseHtml = isActive ? `
    <div class="absolute inset-0 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
    <div class="absolute -inset-2 rounded-full animate-pulse opacity-10" style="background-color: ${color}"></div>
  ` : '';

  return L.divIcon({
    html: `
      <div class="relative group flex items-center justify-center w-full h-full">
        ${pulseHtml}
        <div class="relative rounded-full border-2 border-white/80 flex items-center justify-center transition-all duration-500 ease-out transform group-hover:scale-110 group-hover:shadow-[0_0_20px_${color}]" 
             style="background-color: ${isStaked ? "#1a1a1a" : "#050505"}; width: ${size}px; height: ${size}px; box-shadow: 0 0 10px ${color}80; border-color: ${isActive ? "#fff" : color};">
          
          <!-- Inner Ring -->
          <div class="absolute inset-1 rounded-full border border-white/20"></div>
          
          <!-- Icon -->
          <svg viewBox="0 0 24 24" class="text-white relative z-10" fill="currentColor" style="width: ${size * 0.4}px; height: ${size * 0.4}px; color: ${isActive ? "#fff" : color};">
            ${isActive
        ? '<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>'
        : isStaked
          ? '<path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>'
          : '<path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>'
      }
          </svg>
        </div>
        
        <!-- Hover Label -->
        <div class="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/90 text-white text-[10px] px-3 py-1 border border-white/10 tracking-widest uppercase font-mono whitespace-nowrap z-50 pointer-events-none backdrop-blur-md">
          TARGET_LOCKED
        </div>
      </div>
    `,
    className: "custom-marker focus:outline-none",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Map styling component with z-index fix
function MapStyle(): null {
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
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: none !important;
      }
      .leaflet-control-zoom-in, .leaflet-control-zoom-out {
        background: #000 !important; 
        border: 1px solid #333 !important; 
        color: #fff !important;
        border-radius: 0 !important;
        margin-bottom: 4px !important;
        transition: all 0.2s !important;
      }
      .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
        background: #222 !important;
        border-color: #fff !important;
        color: #00D4FF !important;
      }
      .leaflet-control-attribution {
        display: none !important;
      }
      .leaflet-popup-content-wrapper { 
        background: rgba(10, 10, 10, 0.95) !important; 
        border: 1px solid #333 !important; 
        border-radius: 0px !important; 
        color: #e5e5e5 !important; 
        backdrop-filter: blur(10px);
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.8) !important;
      }
      .leaflet-popup-tip { 
        background: #0a0a0a !important; 
        border: 1px solid #333 !important; 
      }
      .leaflet-popup-close-button {
        color: #666 !important;
      }
      .leaflet-popup-close-button:hover {
        color: #fff !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [map]);

  return null;
}

import type { StaticImageData } from "next/image";

interface Destination {
  id: string;
  name: string;
  image: string | StaticImageData;
  rewardPool: number;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  coordinates: { lat: number; lng: number };
  participants?: number;
  estimatedTime?: string;
  tags?: string[];
}

// Controller for map movements
function MapController({ selectedId, destinations }: { selectedId: string | null, destinations: Destination[] }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    if (selectedId) {
      const dest = destinations.find(d => d.id === selectedId);
      if (dest) {
        map.flyTo([dest.coordinates.lat, dest.coordinates.lng], 6, {
          animate: true,
          duration: 2.0,
          easeLinearity: 0.25
        });
      }
    }
  }, [selectedId, destinations, map]);

  return null;
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const { address } = useAccount();
  const contract = useWanderifyContract();

  // Fetch user commitment data
  const { data: commitmentData } = useReadContract({
    ...contract,
    functionName: "commitments",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const destinationIds = [1, 2, 3, 4, 5, 6, 7, 8];

  const destinationQueries = destinationIds.map((id) => ({
    id: id.toString(),
    name: useReadContract({
      ...contract,
      functionName: "destinationNames",
      args: [BigInt(id)],
    }),
    pool: useReadContract({
      ...contract,
      functionName: "locationPools",
      args: [BigInt(id)],
    }),
    placeValue: useReadContract({
      ...contract,
      functionName: "placeValues",
      args: [BigInt(id)],
    }),
  }));

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
  }, []);

  // Fetch destinations data only after hydration
  useEffect(() => {
    if (!mounted) return; // Wait for hydration

    const fetchDestinations = async () => {
      setLoading(true);
      const destinationsData: Destination[] = [];

      for (let i = 0; i < destinationIds.length; i++) {
        const destId = destinationIds[i];
        const staticData = destinationsById[destId.toString()];

        if (!staticData) continue;

        const nameQuery = destinationQueries[i].name;
        const poolQuery = destinationQueries[i].pool;

        // Use contract name if available, fallback to static data
        const contractName = nameQuery.data as string;
        const name = (contractName && contractName.trim() !== "")
          ? contractName
          : staticData.name;

        // Use contract pool if available, fallback to 0
        const pool = poolQuery.data as bigint;
        const poolAmount = pool || BigInt(0);

        const destination: Destination = {
          id: destId.toString(),
          name,
          description: staticData.description,
          image: staticData.image,
          coordinates: staticData.coordinates,
          difficulty: staticData.difficulty as "Easy" | "Medium" | "Hard",
          rewardPool: poolAmount ? parseFloat(formatEther(poolAmount)) : 0,
          participants: Math.floor(Math.random() * 30) + 5,
          estimatedTime: staticData.estimatedTime,
          tags: staticData.tags,
        };

        destinationsData.push(destination);
      }

      setDestinations(destinationsData);
      setLoading(false);
    };

    // Check if queries are done loading (success or error)
    const allQueriesSettled = destinationQueries.every(
      (queries) => !queries.name.isLoading && !queries.pool.isLoading
    );

    // Also add a timeout fallback - if queries take too long, use static data
    const timeoutId = setTimeout(() => {
      if (loading && destinations.length === 0) {
        console.log("Contract queries timed out, using static data");
        const staticDestinations = Object.values(destinationsById).map(d => ({
          ...d,
          rewardPool: 0,
          participants: Math.floor(Math.random() * 30) + 5,
        }));
        setDestinations(staticDestinations);
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    if (allQueriesSettled) {
      fetchDestinations();
    }

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mounted,
    loading,
    destinations.length,
    JSON.stringify(destinationQueries.map(q => ({ n: q.name.isLoading, p: q.pool.isLoading })))
  ]);

  // Process commitment data
  const commitment = commitmentData as
    | { destinationId: bigint; amountInPool: bigint; isProcessed: boolean }
    | undefined;

  const isAnyQuestStaked = commitment && commitment.amountInPool > BigInt(0) && !commitment.isProcessed;
  const activeQuestId = isAnyQuestStaked ? commitment.destinationId.toString() : null;

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Easy": return "text-[#00D4FF] border-[#00D4FF]";
      case "Medium": return "text-[#FF9500] border-[#FF9500]";
      case "Hard": return "text-[#FF4D94] border-[#FF4D94]";
      default: return "text-[#666666] border-[#666666]";
    }
  };

  const getStatusBadge = (destination: Destination): JSX.Element => {
    if (activeQuestId === destination.id) {
      return <Badge className="bg-white text-black font-bold rounded-none uppercase tracking-widest text-[10px] border-none">Active</Badge>;
    }
    return <Badge className="bg-black/50 backdrop-blur-sm text-white border border-white/20 font-bold rounded-none uppercase tracking-widest text-[10px]">Ready</Badge>;
  };

  const filteredDestinations = filterDifficulty === "all"
    ? destinations
    : destinations.filter(dest => dest.difficulty === filterDifficulty);

  const mapCenter: [number, number] = [23, 78];

  // Prevent hydration mismatch - show loading until fully mounted and ready
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-6 flex items-center justify-center">
        <div className="text-[#00D4FF] font-pixel text-xl">Loading destinations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 font-mono text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-2">Explore [ ZONES ]</h1>
            <p className="text-gray-500 text-xs tracking-wider">Discover decentralized nodes and start your journey.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
            {/* Godlike Difficulty Filter */}
            <div className="flex items-center space-x-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Difficulty_Mod:</span>
              <div className="flex bg-white/5 border border-white/10 p-1 relative">
                {(["all", "Easy", "Medium", "Hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterDifficulty(level)}
                    className={`relative z-10 px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors duration-300 ${filterDifficulty === level ? "text-black font-bold" : "text-gray-500 hover:text-white"
                      }`}
                  >
                    {filterDifficulty === level && (
                      <motion.div
                        layoutId="difficulty-highlight"
                        className="absolute inset-0 bg-white"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{level === "all" ? "ALL" : level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Godlike View Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">View_Mode:</span>
              <div className="flex bg-white/5 border border-white/10 p-1 relative">
                <button
                  onClick={() => setViewMode("map")}
                  className={`relative z-10 px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors duration-300 flex items-center ${viewMode === "map" ? "text-black font-bold" : "text-gray-500 hover:text-white"
                    }`}
                >
                  {viewMode === "map" && (
                    <motion.div
                      layoutId="view-highlight"
                      className="absolute inset-0 bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    MAP
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`relative z-10 px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors duration-300 flex items-center ${viewMode === "list" ? "text-black font-bold" : "text-gray-500 hover:text-white"
                    }`}
                >
                  {viewMode === "list" && (
                    <motion.div
                      layoutId="view-highlight"
                      className="absolute inset-0 bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">GRID</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with AnimatePresence */}
        <AnimatePresence mode="wait">
          {viewMode === "map" ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {mapReady ? (
                <div
                  className="relative bg-white/5 border border-white/10 overflow-hidden h-[650px] group shadow-[0_0_50px_-20px_rgba(255,255,255,0.1)]"
                  style={{ zIndex: 1 }}
                >
                  {/* Sci-Fi HUD Overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Corner Brackets - Animated */}
                    <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-white/20 opacity-50"></div>
                    <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-white/20 opacity-50"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-white/20 opacity-50"></div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-white/20 opacity-50"></div>

                    {/* Animated Scanline */}
                    <motion.div
                      className="absolute left-0 right-0 h-[2px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      animate={{ top: ["-10%", "110%"] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/10 rounded-full flex items-center justify-center opacity-50">
                      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                    </div>

                    {/* Status Text overlay */}
                    <div className="absolute top-6 right-6 font-mono text-[10px] text-white/50 space-y-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        SYSTEM: ONLINE
                      </div>
                      <div>SAT-LINK: CONNECTED</div>
                      <div>LAT: {mapCenter[0].toFixed(4)}</div>
                      <div>LNG: {mapCenter[1].toFixed(4)}</div>
                    </div>

                    {/* Bottom Scroller */}
                    <div className="absolute bottom-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/30 tracking-[0.5em] font-mono">
                      SCANNING SECTOR 07
                    </div>
                  </div>
                  <MapContainer
                    center={mapCenter}
                    zoom={5}
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                  >
                    <MapStyle />
                    <MapController selectedId={selectedDestinationId} destinations={destinations} />
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {filteredDestinations.map((destination) => {
                      const icon = createCustomIcon(
                        destination.difficulty,
                        isAnyQuestStaked && activeQuestId !== destination.id,
                        activeQuestId === destination.id
                      );

                      if (!icon) return null;

                      return (
                        <Marker
                          key={destination.id}
                          position={[destination.coordinates.lat, destination.coordinates.lng]}
                          icon={icon}
                          eventHandlers={{
                            click: () => {
                              if (!isAnyQuestStaked || activeQuestId === destination.id) {
                                setSelectedDestinationId(destination.id);
                              }
                            },
                          }}
                        >
                          <Popup>
                            <div className="min-w-[200px] font-mono">
                              <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
                                <h3 className="font-bold text-white uppercase tracking-widest">{destination.name}</h3>
                                {getStatusBadge(destination)}
                              </div>
                              <p className="text-xs text-gray-400 mb-4">{destination.description}</p>
                              <div className="flex items-center justify-between text-[10px] mb-4 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-bold">{destination.rewardPool} TMON</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <span>{destination.participants} NODES</span>
                                </div>
                              </div>
                              {activeQuestId === destination.id ? (
                                <Button size="sm" className="w-full bg-white text-black hover:bg-gray-200 font-bold tracking-widest uppercase rounded-none">
                                  [ VIEW ]
                                </Button>
                              ) : isAnyQuestStaked ? (
                                <Button disabled size="sm" className="w-full bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed font-bold tracking-widest uppercase rounded-none">
                                  LOCKED
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="w-full bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-bold tracking-widest uppercase rounded-none"
                                  onClick={() => setSelectedDestinationId(destination.id)}
                                >
                                  [ ENTER ]
                                </Button>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDestinations.map((destination) => (
                    <Card
                      key={destination.id}
                      className={`cursor-pointer transition-all duration-300 hover:border-white/30 border-white/10 bg-white/5 rounded-none group ${isAnyQuestStaked && activeQuestId !== destination.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                        }`}
                      onClick={() => {
                        if (!isAnyQuestStaked || activeQuestId === destination.id) {
                          setSelectedDestinationId(destination.id);
                        }
                      }}
                    >
                      <CardHeader className="p-0">
                        <div className="relative h-48 overflow-hidden">
                          <Image src={destination.image} alt={destination.name} fill className="object-cover brightness-75 group-hover:brightness-110 group-hover:scale-110 transition-all duration-700 ease-in-out" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                          <div className="absolute top-3 right-3">{getStatusBadge(destination)}</div>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-black text-white border border-white/20 font-bold rounded-none uppercase tracking-widest text-[10px]">
                              {destination.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5">
                        <CardTitle className="font-bold text-lg mb-2 text-white uppercase tracking-widest">{destination.name}</CardTitle>
                        <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed h-8">{destination.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-6">
                          {destination.tags?.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-[10px] uppercase tracking-widest text-gray-500 border border-white/10 px-2 py-1">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs mb-4 pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-3 h-3 text-white" />
                            <span className="text-white font-bold tracking-widest">{destination.rewardPool} TMON</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Users className="w-3 h-3" />
                            <span className="tracking-widest">{destination.participants}</span>
                          </div>
                        </div>

                        {/* Staking Notice */}
                        <p className="text-[10px] text-gray-600 mb-4 text-center tracking-widest uppercase">
                    // Requires 15+ Days Stake
                        </p>

                        {/* Action Button */}
                        {activeQuestId === destination.id ? (
                          <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold tracking-widest uppercase rounded-none">
                            Resume Quest
                          </Button>
                        ) : isAnyQuestStaked ? (
                          <Button disabled className="w-full bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed font-bold tracking-widest uppercase rounded-none">
                            Unavailable
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-colors font-bold tracking-widest uppercase rounded-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDestinationId(destination.id);
                            }}
                          >
                            Initialize
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Fixed Modal with proper z-index positioning */}

            </motion.div>
          )}
        </AnimatePresence>

        {selectedDestinationId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
              onClick={() => setSelectedDestinationId(null)}
            />
            <div className="relative z-[10000] max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <StakingModal
                destinationId={selectedDestinationId}
                onClose={() => setSelectedDestinationId(null)}
                onAcceptQuest={(amount: number) => {
                  console.log(`Accepted quest for destination ${selectedDestinationId} with ${amount} TMON`);
                  setSelectedDestinationId(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
