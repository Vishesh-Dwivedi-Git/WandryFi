"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StakingModal from "@/components/staking-modal";
import Image from "next/image";
import { MapPin, Trophy, Users, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { useAccount, useReadContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";
import { formatEther } from "viem";

// Dynamically import leaflet and react-leaflet to avoid SSR issues
const L = typeof window !== "undefined" ? require("leaflet") : null;

// Dynamically import react-leaflet components
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

// Type-safe icon creation function
const createCustomIcon = (
  difficulty: string,
  isStaked: boolean = false,
  isActive: boolean = false
): L.DivIcon | null => {
  if (typeof window === "undefined" || !L) return null;

  const colors: Record<string, string> = {
    Easy: "#00D4FF",
    Medium: "#FF9500",
    Hard: "#FF4D94",
  };

  const color = colors[difficulty] || "#00D4FF";
  const size = isActive ? 40 : isStaked ? 36 : 32;

  return L.divIcon({
    html: `
      <div class="relative">
        <div class="relative rounded-full border-2 border-white flex items-center justify-center" 
             style="background-color: ${
               isStaked ? "#666666" : color
             }; width: ${size}px; height: ${size}px;">
          <svg viewBox="0 0 24 24" class="text-white" fill="currentColor" style="width: ${
            size * 0.4
          }px; height: ${size * 0.4}px;">
            ${
              isActive
                ? '<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>'
                : isStaked
                ? '<path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>'
                : '<path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>'
            }
          </svg>
        </div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

// Type-safe MapStyle component
function MapStyle(): null {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container {
        background: #000000 !important;
      }
      .leaflet-tile {
        filter: none !important;
      }
      .leaflet-control {
        background: #000000 !important;
        border: 1px solid #333333 !important;
        border-radius: 4px !important;
      }
      .leaflet-popup-content-wrapper {
        background: #000000 !important;
        border: 1px solid #333333 !important;
        border-radius: 6px !important;
        color: #FFFFFF !important;
      }
      .leaflet-popup-tip {
        background: #000000 !important;
        border: 1px solid #333333 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [map]);

  return null;
}

interface Destination {
  id: string;
  name: string;
  image: string;
  rewardPool: number;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  coordinates: { lat: number; lng: number };
  participants?: number;
  estimatedTime?: string;
  tags?: string[];
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    string | null
  >(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const { address, chainId } = useAccount();

  console.log("=== CHAIN & WALLET STATUS ===");
  console.log("Address:", address);
  console.log("Chain ID:", chainId);
  console.log("Expected Anvil Chain ID: 31337");

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

  console.log(commitmentData);

  // Fetch destination data from contract for known destination IDs
  const destinationIds = [1, 2, 3, 4, 5, 6]; // Include all destinations from contract

  const destinationQueries = destinationIds.map((id) => ({
    id, // Add id for easier debugging
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

  // Fetch all destinations data
  useEffect(() => {
    const fetchDestinations = async () => {
      console.log("=== FETCH DESTINATIONS USEEFFECT TRIGGERED ===");
      setLoading(true);
      try {
        const destinationsData: Destination[] = [];

        console.log("Fetching destinations for IDs:", destinationIds);
        console.log("Number of destinationQueries:", destinationQueries.length);
        console.log("destinationQueries:", destinationQueries);

        for (let i = 0; i < destinationIds.length; i++) {
          const destId = destinationIds[i];
          const nameQuery = destinationQueries[i].name;
          const poolQuery = destinationQueries[i].pool;
          const placeValueQuery = destinationQueries[i].placeValue;

          console.log(`Destination ${destId}:`, {
            nameLoading: nameQuery.isLoading,
            poolLoading: poolQuery.isLoading,
            placeValueLoading: placeValueQuery.isLoading,
            nameData: nameQuery.data,
            nameError: nameQuery.error,
            poolData: poolQuery.data,
            poolError: poolQuery.error,
            placeValueData: placeValueQuery.data,
            placeValueError: placeValueQuery.error,
          });

          // Log errors specifically
          if (nameQuery.error)
            console.error(`Name query error for ${destId}:`, nameQuery.error);
          if (poolQuery.error)
            console.error(`Pool query error for ${destId}:`, poolQuery.error);
          if (placeValueQuery.error)
            console.error(
              `PlaceValue query error for ${destId}:`,
              placeValueQuery.error
            );

          // Skip if any query is still loading
          if (
            nameQuery.isLoading ||
            poolQuery.isLoading ||
            placeValueQuery.isLoading
          ) {
            continue;
          }

          const name = nameQuery.data as string;
          const pool = poolQuery.data as bigint;
          const placeValue = placeValueQuery.data as bigint;

          console.log(`Processing destination ${destId}:`, {
            name,
            pool: pool?.toString(),
            placeValue: placeValue?.toString(),
          });

          // Only include destinations that have names set in the contract
          if (name && name.trim() !== "") {
            // For missing pool/placeValue data, use defaults
            const poolAmount = pool || BigInt(0);
            const placeValueAmount = placeValue || BigInt(0);

            console.log(
              `Creating destination for ${destId} with name: ${name}, pool: ${poolAmount.toString()}, placeValue: ${placeValueAmount.toString()}`
            );

            // Static data for demo - in production this could come from IPFS/metadata
            const staticDestinationData = {
              1: {
                image: "/coral-reef-underwater-colorful.png",
                difficulty: "Medium" as const,
                description:
                  "The bustling financial capital of India, home to Bollywood, diverse cultures, and iconic landmarks like the Gateway of India.",
                coordinates: { lat: 19.076, lng: 72.8777 },
                estimatedTime: "4 days",
                tags: ["City", "Culture", "Bollywood"],
              },
              2: {
                image: "/temple-clouds-floating.png",
                difficulty: "Hard" as const,
                description:
                  "The iconic ivory-white marble mausoleum, a UNESCO World Heritage Site and symbol of eternal love.",
                coordinates: { lat: 27.1751, lng: 78.0421 },
                estimatedTime: "5 days",
                tags: ["Monument", "Heritage", "Historic"],
              },
              3: {
                image: "/waterfall-forest-mist.png",
                difficulty: "Easy" as const,
                description:
                  "The sacred river flowing through the spiritual heart of India, offering purification and enlightenment.",
                coordinates: { lat: 25.3176, lng: 82.9739 },
                estimatedTime: "2 days",
                tags: ["River", "Spiritual", "Sacred"],
              },
              4: {
                image: "/mountain-peak-sunset.png",
                difficulty: "Medium" as const,
                description:
                  "Paradise on Earth with breathtaking landscapes, pristine lakes, and snow-capped mountains.",
                coordinates: { lat: 34.0479, lng: 74.4049 },
                estimatedTime: "3 days",
                tags: ["Mountains", "Lakes", "Paradise"],
              },
              5: {
                image: "/crystal-cave-glowing.png",
                difficulty: "Medium" as const,
                description:
                  "The Detroit of India, a major industrial and cultural hub known for its temples, beaches, and automotive industry.",
                coordinates: { lat: 13.0827, lng: 80.2707 },
                estimatedTime: "3 days",
                tags: ["City", "Industry", "Temples"],
              },
              6: {
                image: "/desert-oasis-palm-trees.png",
                difficulty: "Easy" as const,
                description:
                  "The cultural capital of India, famous for its colonial architecture, museums, and rich literary heritage.",
                coordinates: { lat: 22.5726, lng: 88.3639 },
                estimatedTime: "3 days",
                tags: ["Culture", "History", "Literature"],
              },
            };

            const staticData =
              staticDestinationData[
                destId as keyof typeof staticDestinationData
              ];

            if (staticData) {
              const destination = {
                id: destId.toString(),
                name,
                rewardPool: poolAmount
                  ? Math.round(parseFloat(formatEther(poolAmount)))
                  : 0,
                participants: Math.floor(Math.random() * 30) + 5, // Random for demo
                ...staticData,
              };

              console.log(`Adding destination:`, destination);
              destinationsData.push(destination);
            }
          }
        }

        console.log("Final destinations data:", destinationsData);
        setDestinations(destinationsData);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      } finally {
        setLoading(false);
      }
    };

    // Wait for all queries to be ready
    const allQueriesReady = destinationQueries.every(
      (queries) =>
        !queries.name.isLoading &&
        !queries.pool.isLoading &&
        !queries.placeValue.isLoading
    );

    console.log("All queries ready:", allQueriesReady);

    if (allQueriesReady) {
      fetchDestinations();
    }
  }, [
    destinationQueries
      .map(
        (q) =>
          `${q.name.isLoading}-${q.pool.isLoading}-${q.placeValue.isLoading}`
      )
      .join(","),
  ]);

  useEffect(() => {
    setMounted(true);
    // Import leaflet CSS dynamically
    if (typeof window !== "undefined") {
      import("leaflet/dist/leaflet.css");
    }
  }, []);

  const commitment = commitmentData as
    | { destinationId: bigint; amountInPool: bigint; isProcessed: boolean }
    | undefined;

  const isAnyQuestStaked =
    commitment &&
    commitment.amountInPool > BigInt(0) &&
    !commitment.isProcessed;
  const activeQuestId = isAnyQuestStaked
    ? commitment.destinationId.toString()
    : null;

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Easy":
        return "text-[#00D4FF] border-[#00D4FF]";
      case "Medium":
        return "text-[#FF9500] border-[#FF9500]";
      case "Hard":
        return "text-[#FF4D94] border-[#FF4D94]";
      default:
        return "text-[#666666] border-[#666666]";
    }
  };

  const getStatusBadge = (destination: Destination): JSX.Element => {
    if (activeQuestId === destination.id) {
      return (
        <Badge className="bg-[#FF4D94] text-white font-pixel">
          Active Quest
        </Badge>
      );
    }
    return (
      <Badge className="bg-[#000000] text-[#00D4FF] border border-[#333333] font-pixel">
        Available
      </Badge>
    );
  };

  const filteredDestinations =
    filterDifficulty === "all"
      ? destinations
      : destinations.filter((dest) => dest.difficulty === filterDifficulty);

  const mapCenter: [number, number] = [20, 0]; // Centered more globally

  const selectedDestination = destinations.find(
    (d) => d.id === selectedDestinationId
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-6 flex items-center justify-center">
        <div className="text-[#00D4FF] font-pixel text-xl">
          Loading destinations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="font-pixel text-4xl text-[#00D4FF]">
              Explore Destinations
            </h1>
            <p className="text-[#FFFFFF] mt-2">
              Discover amazing places and start your adventure
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#FFFFFF]">Difficulty:</span>
              <div className="flex bg-[#000000] rounded-lg p-1 border border-[#333333]">
                {(["all", "Easy", "Medium", "Hard"] as const).map((level) => (
                  <Button
                    key={level}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterDifficulty(level)}
                    className={`capitalize font-pixel ${
                      filterDifficulty === level
                        ? "bg-[#00D4FF] text-black hover:bg-[#00B7E6]"
                        : "text-[#FFFFFF] hover:text-[#00D4FF] hover:bg-[#000000]"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#FFFFFF]">View:</span>
              <div className="flex bg-[#000000] rounded-lg p-1 border border-[#333333]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className={
                    viewMode === "map"
                      ? "bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                      : "text-[#FFFFFF] hover:text-[#00D4FF] hover:bg-[#000000] font-pixel"
                  }
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Map
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                      : "text-[#FFFFFF] hover:text-[#00D4FF] hover:bg-[#000000] font-pixel"
                  }
                >
                  Grid
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && mounted && (
          <div className="relative bg-[#000000] border border-[#333333] rounded-lg overflow-hidden h-[650px]">
            <MapContainer
              center={mapCenter}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
              className="z-10"
            >
              <MapStyle />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                    position={[
                      destination.coordinates.lat,
                      destination.coordinates.lng,
                    ]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        if (
                          !isAnyQuestStaked ||
                          activeQuestId === destination.id
                        ) {
                          setSelectedDestinationId(destination.id);
                        }
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-3 bg-[#000000] text-[#FFFFFF]">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-pixel text-lg text-[#00D4FF]">
                            {destination.name}
                          </h3>
                          {getStatusBadge(destination)}
                        </div>
                        <p className="text-sm text-[#FFFFFF] mb-3">
                          {destination.description}
                        </p>
                        <div className="flex items-center justify-between text-xs mb-3">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-3 h-3 text-[#FF9500]" />
                            <span className="text-[#FF9500] font-bold">
                              {destination.rewardPool} ETH Pool
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-3 h-3 text-[#FFFFFF]" />
                            <span className="text-[#FFFFFF]">
                              {destination.participants}
                            </span>
                          </div>
                        </div>
                        {(() => {
                          if (activeQuestId === destination.id) {
                            return (
                              <Button
                                size="sm"
                                className="w-full bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                              >
                                View Quest
                              </Button>
                            );
                          } else if (isAnyQuestStaked) {
                            return (
                              <Button
                                disabled
                                size="sm"
                                className="w-full bg-[#333333] text-[#666666] cursor-not-allowed font-pixel"
                              >
                                Quest Active
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                size="sm"
                                className="w-full bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                                onClick={() =>
                                  setSelectedDestinationId(destination.id)
                                }
                              >
                                Start Quest
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <Card
                key={destination.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 border-[#333333] bg-[#000000] ${
                  isAnyQuestStaked && activeQuestId !== destination.id
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
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(destination)}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`${getDifficultyColor(
                          destination.difficulty
                        )} bg-[#000000] border font-pixel`}
                      >
                        {destination.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <CardTitle className="font-pixel text-lg mb-2 text-[#FFFFFF]">
                    {destination.name}
                  </CardTitle>

                  <p className="text-sm text-[#FFFFFF] mb-4 line-clamp-2">
                    {destination.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {destination.tags?.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-[#000000] text-[#FFFFFF] border border-[#333333] text-xs px-2 py-0 font-pixel"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-[#FF9500]" />
                      <span className="text-[#FF9500] font-bold font-pixel">
                        {destination.rewardPool} ETH Pool
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#FFFFFF]">
                      <Users className="w-4 h-4" />
                      <span className="font-pixel">
                        {destination.participants}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#FFFFFF]">
                      <Clock className="w-4 h-4" />
                      <span className="font-pixel">
                        {destination.estimatedTime}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {(() => {
                    if (activeQuestId === destination.id) {
                      return (
                        <Button className="w-full bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel">
                          View Quest
                        </Button>
                      );
                    } else if (isAnyQuestStaked) {
                      return (
                        <Button
                          disabled
                          className="w-full bg-[#333333] text-[#666666] cursor-not-allowed font-pixel"
                        >
                          Quest Active
                        </Button>
                      );
                    } else {
                      return (
                        <Button
                          className="w-full bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDestinationId(destination.id);
                          }}
                        >
                          Start Quest
                        </Button>
                      );
                    }
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedDestinationId && (
          <StakingModal
            destinationId={selectedDestinationId}
            onClose={() => setSelectedDestinationId(null)}
            onAcceptQuest={(amount: number) => {
              if (selectedDestination) {
                console.log(
                  `Accepted quest for ${selectedDestination.name} with ${amount} WNDR`
                );
              }
              setSelectedDestinationId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
