// app/explore/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWanderfy } from "../contexts/wanderify-context";
import StakingModal from "@/components/staking-modal";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { MapPin, Trophy, Users, Clock } from "lucide-react";
import { useAccount, useContractRead } from "wagmi";
import { ABI, contractAddr } from "../contracts/Wanderify";

// ✅ Clean Solid Marker Icons
const createCustomIcon = (
  difficulty: string,
  isStaked: boolean = false,
  isActive: boolean = false
) => {
  const colors = {
    Easy: "#00D4FF", // Bright cyan
    Medium: "#FF9500", // Orange
    Hard: "#FF4D94", // Pink
  };

  const color = colors[difficulty as keyof typeof colors] || "#00D4FF";
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

interface Destination {
  id: string;
  name: string;
  image: string;
  rewardPool: number;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  coordinates: { x: number; y: number };
  participants?: number;
  estimatedTime?: string;
  tags?: string[];
}

const destinations: Destination[] = [
  {
    id: "1",
    name: "Nrupatunga Betta",
    image: "/api/placeholder/400/250",
    rewardPool: 500,
    difficulty: "Hard",
    description:
      "A challenging mountain peak with breathtaking views and ancient ruins.",
    coordinates: { x: 13.3428, y: 77.1234 },
    participants: 12,
    estimatedTime: "2 days",
    tags: ["Mountain", "Trekking", "Ancient"],
  },
  {
    id: "2",
    name: "Mystic Falls",
    image: "/api/placeholder/400/250",
    rewardPool: 350,
    difficulty: "Medium",
    description:
      "Hidden waterfall deep in the enchanted forest with crystal clear pools.",
    coordinates: { x: 13.2846, y: 77.0436 },
    participants: 8,
    estimatedTime: "1 day",
    tags: ["Waterfall", "Swimming", "Forest"],
  },
  {
    id: "3",
    name: "Hampi Ruins",
    image: "/api/placeholder/400/250",
    rewardPool: 750,
    difficulty: "Medium",
    description:
      "Explore the magnificent ruins of the Vijayanagara Empire, a UNESCO World Heritage Site.",
    coordinates: { x: 15.335, y: 76.46 },
    participants: 25,
    estimatedTime: "3 days",
    tags: ["History", "UNESCO", "Culture"],
  },
  {
    id: "4",
    name: "Coorg Coffee Plantations",
    image: "/api/placeholder/400/250",
    rewardPool: 400,
    difficulty: "Easy",
    description:
      "Scenic coffee plantation tours with aromatic trails and local culture immersion.",
    coordinates: { x: 12.3375, y: 75.8069 },
    participants: 18,
    estimatedTime: "2 days",
    tags: ["Coffee", "Culture", "Scenic"],
  },
  {
    id: "5",
    name: "Gokarna Beach Trek",
    image: "/api/placeholder/400/250",
    rewardPool: 600,
    difficulty: "Medium",
    description:
      "Trek along pristine beaches with hidden coves and sacred temples.",
    coordinates: { x: 14.5492, y: 74.32 },
    participants: 15,
    estimatedTime: "2 days",
    tags: ["Beach", "Temples", "Coastal"],
  },
  {
    id: "6",
    name: "Mullayanagiri Peak",
    image: "/api/placeholder/400/250",
    rewardPool: 800,
    difficulty: "Hard",
    description:
      "Karnataka's highest peak offering panoramic views of the Western Ghats.",
    coordinates: { x: 13.3931, y: 75.7208 },
    participants: 10,
    estimatedTime: "2 days",
    tags: ["Peak", "Highest", "Ghats"],
  },
  {
    id: "7",
    name: "Jog Falls",
    image: "/api/placeholder/400/250",
    rewardPool: 450,
    difficulty: "Easy",
    description:
      "India's second-highest waterfall cascading down in four distinct streams.",
    coordinates: { x: 14.229, y: 74.8131 },
    participants: 22,
    estimatedTime: "1 day",
    tags: ["Waterfall", "Photography", "Monsoon"],
  },
  {
    id: "8",
    name: "Badami Caves",
    image: "/api/placeholder/400/250",
    rewardPool: 550,
    difficulty: "Medium",
    description:
      "Ancient rock-cut cave temples showcasing Chalukyan architecture and art.",
    coordinates: { x: 15.9149, y: 75.6767 },
    participants: 14,
    estimatedTime: "1 day",
    tags: ["Caves", "Ancient", "Architecture"],
  },
  {
    id: "9",
    name: "Dandeli Wildlife Sanctuary",
    image: "/api/placeholder/400/250",
    rewardPool: 700,
    difficulty: "Medium",
    description:
      "Wildlife safari and river rafting adventure in pristine forest ecosystem.",
    coordinates: { x: 15.2593, y: 74.6253 },
    participants: 16,
    estimatedTime: "3 days",
    tags: ["Wildlife", "Safari", "Rafting"],
  },
  {
    id: "10",
    name: "Shivanasamudra Falls",
    image: "/api/placeholder/400/250",
    rewardPool: 300,
    difficulty: "Easy",
    description:
      "Twin waterfalls formed by River Kaveri, perfect for photography enthusiasts.",
    coordinates: { x: 12.2897, y: 77.1711 },
    participants: 20,
    estimatedTime: "1 day",
    tags: ["Twin Falls", "Photography", "River"],
  },
];

// ✅ Clean Map Styling
function MapStyle() {
  const map = useMap();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container {
        background: #000000 !important;
      }
      .leaflet-tile {
        filter: none !important; /* Keep dark map theme */
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
  }, []);

  return null;
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const { isQuestActive, isQuestStaked } = useWanderfy();

  const getDifficultyColor = (difficulty: string) => {
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

  const getStatusBadge = (destination: Destination) => {
    if (isQuestActive(destination.id)) {
      return (
        <Badge className="bg-[#00D4FF] text-black font-pixel">
          Active Quest
        </Badge>
      );
    }
    if (isQuestStaked(destination.id)) {
      return (
        <Badge className="bg-[#666666] text-white font-pixel">Staked</Badge>
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

  const mapCenter: [number, number] = [13.5, 76.0];

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
                {["all", "Easy", "Medium", "Hard"].map((level) => (
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
        {viewMode === "map" && (
          <div className="relative bg-[#000000] border border-[#333333] rounded-lg overflow-hidden h-[650px]">
            <MapContainer
              center={mapCenter}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
              className="z-10"
            >
              <MapStyle />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredDestinations.map((destination) => (
                <Marker
                  key={destination.id}
                  position={[
                    destination.coordinates.x,
                    destination.coordinates.y,
                  ]}
                  icon={createCustomIcon(
                    destination.difficulty,
                    isQuestStaked(destination.id),
                    isQuestActive(destination.id)
                  )}
                  eventHandlers={{
                    click: () =>
                      !isQuestStaked(destination.id) &&
                      setSelectedDestination(destination),
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
                            {destination.rewardPool} WNDR
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-3 h-3 text-[#FFFFFF]" />
                          <span className="text-[#FFFFFF]">
                            {destination.participants}
                          </span>
                        </div>
                      </div>
                      {!isQuestStaked(destination.id) && (
                        <Button
                          size="sm"
                          className="w-full bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                          onClick={() => setSelectedDestination(destination)}
                        >
                          Start Quest
                        </Button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="cursor-pointer transition-all duration-300 hover:scale-105 border-[#333333] bg-[#000000]"
                onClick={() =>
                  !isQuestStaked(destination.id) &&
                  setSelectedDestination(destination)
                }
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
                        {destination.rewardPool} WNDR
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
                  {!isQuestStaked(destination.id) ? (
                    <Button
                      className="w-full bg-[#00D4FF] text-black hover:bg-[#00B7E6] font-pixel"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDestination(destination);
                      }}
                    >
                      {isQuestActive(destination.id)
                        ? "View Quest"
                        : "Start Quest"}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-[#666666] text-[#FFFFFF] cursor-not-allowed font-pixel"
                    >
                      Quest Staked
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedDestination && (
          <StakingModal
            destination={selectedDestination}
            onClose={() => setSelectedDestination(null)}
            onAcceptQuest={(amount) => {
              console.log(
                `Accepted quest for ${selectedDestination.name} with ${amount} WNDR`
              );
              setSelectedDestination(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
