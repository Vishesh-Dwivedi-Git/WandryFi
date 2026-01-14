// Static destination data with coordinates
export interface Destination {
  id: string;
  name: string;
  image: string;
  coordinates: { lat: number; lng: number };
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  estimatedTime?: string;
  tags?: string[];
  xpReward?: number; // Added xpReward to match usage in components
}

export const destinationsById: Record<string, Destination> = {
  "1": {
    id: "1",
    name: "Crystal Cave",
    image: "/crystal-cave-glowing.png",
    coordinates: { lat: 28.6139, lng: 77.209 }, // Delhi area
    difficulty: "Medium",
    description: "Explore the mystical crystal caves hidden in the mountains",
    estimatedTime: "2 days",
    tags: ["Adventure", "Nature", "Mystical"],
  },
  "2": {
    id: "2",
    name: "Mountain Peak",
    image: "/mountain-peak-sunset.png",
    coordinates: { lat: 27.9881, lng: 86.925 }, // Everest region
    difficulty: "Hard",
    description: "Conquer the highest peaks and witness breathtaking views",
    estimatedTime: "5 days",
    tags: ["Adventure", "Extreme", "Scenic"],
  },
  "3": {
    id: "3",
    name: "Coral Reef",
    image: "/coral-reef-underwater-colorful.png",
    coordinates: { lat: 11.6234, lng: 92.7265 }, // Andaman Islands
    difficulty: "Easy",
    description: "Dive into vibrant coral reefs teeming with marine life",
    estimatedTime: "1 day",
    tags: ["Water", "Marine", "Relaxing"],
  },
  "4": {
    id: "4",
    name: "Temple in Clouds",
    image: "/temple-clouds-floating.png",
    coordinates: { lat: 27.1751, lng: 88.2637 }, // Darjeeling area
    difficulty: "Medium",
    description: "Visit ancient temples shrouded in mystical clouds",
    estimatedTime: "3 days",
    tags: ["Spiritual", "Ancient", "Mystical"],
  },
  "5": {
    id: "5",
    name: "Desert Oasis",
    image: "/desert-oasis-palm-trees.png",
    coordinates: { lat: 26.9124, lng: 70.9128 }, // Thar Desert
    difficulty: "Medium",
    description: "Discover hidden oases in the vast desert landscape",
    estimatedTime: "2 days",
    tags: ["Desert", "Adventure", "Unique"],
  },
  "6": {
    id: "6",
    name: "LNMIIT Jaipur",
    image: "/placeholder.jpg",
    coordinates: { lat: 26.93377, lng: 75.9236 }, // Correct LNMIIT coordinates
    difficulty: "Easy",
    description: "Visit the prestigious LNMIIT campus in Jaipur",
    estimatedTime: "1 day",
    tags: ["Education", "Technology", "Modern"],
  },
  "7": {
    id: "7",
    name: "Waterfall Paradise",
    image: "/waterfall-forest-mist.png",
    coordinates: { lat: 11.4062, lng: 76.6947 }, // Western Ghats
    difficulty: "Easy",
    description: "Experience majestic waterfalls surrounded by lush forests",
    estimatedTime: "2 days",
    tags: ["Water", "Nature", "Peaceful"],
  },
};

// Export individual destination lookup function
export const getDestinationById = (id: string) => {
  return destinationsById[id];
};

// Export all destinations as array
export const allDestinations = Object.values(destinationsById);
