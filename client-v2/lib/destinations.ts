export interface Destination {
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

export const destinations: Destination[] = [
  {
    id: "0",
    name: "Crystal Caves",
    image: "/crystal-cave-glowing.png",
    rewardPool: 1500,
    difficulty: "Medium",
    description:
      "A luminous cavern filled with giant, glowing crystals that pulse with a soft, ethereal light.",
    coordinates: { lat: 27.1751, lng: 78.0421 },
    participants: 15,
    estimatedTime: "3 days",
    tags: ["Cave", "Adventure", "Luminous"],
  },
  {
    id: "1",
    name: "Coral Reef City",
    image: "/coral-reef-underwater-colorful.png",
    rewardPool: 1200,
    difficulty: "Easy",
    description:
      "A vibrant underwater metropolis built within a massive, colorful coral reef, teeming with exotic marine life.",
    coordinates: { lat: -20.4333, lng: 148.7 },
    participants: 25,
    estimatedTime: "2 days",
    tags: ["Underwater", "City", "Marine Life"],
  },
  {
    id: "2",
    name: "Floating Temples of Aeridor",
    image: "/temple-clouds-floating.png",
    rewardPool: 2500,
    difficulty: "Hard",
    description:
      "Ancient temples that float amongst the clouds, held aloft by mysterious forces and guarded by wind spirits.",
    coordinates: { lat: 27.9881, lng: 86.925 },
    participants: 8,
    estimatedTime: "5 days",
    tags: ["Temples", "Floating", "Ancient"],
  },
  {
    id: "3",
    name: "Sunset Peak",
    image: "/mountain-peak-sunset.png",
    rewardPool: 1800,
    difficulty: "Medium",
    description:
      "A towering mountain peak that offers breathtaking panoramic views of the world, especially at sunset.",
    coordinates: { lat: 45.8326, lng: 6.8652 },
    participants: 18,
    estimatedTime: "2 days",
    tags: ["Mountain", "Sunset", "Views"],
  },
  {
    id: "4",
    name: "Whispering Waterfalls",
    image: "/waterfall-forest-mist.png",
    rewardPool: 1100,
    difficulty: "Easy",
    description:
      "A serene forest sanctuary where waterfalls cascade into crystal-clear pools, surrounded by lush, mist-covered flora.",
    coordinates: { lat: -13.1631, lng: -72.545 },
    participants: 30,
    estimatedTime: "1 day",
    tags: ["Waterfall", "Forest", "Serene"],
  },
  {
    id: "5",
    name: "Oasis of the Golden Sands",
    image: "/desert-oasis-palm-trees.png",
    rewardPool: 2000,
    difficulty: "Hard",
    description:
      "A hidden oasis in the heart of a vast desert, with golden sands, lush palm trees, and a spring of life-giving water.",
    coordinates: { lat: 29.9792, lng: 31.1342 },
    participants: 12,
    estimatedTime: "4 days",
    tags: ["Desert", "Oasis", "Hidden"],
  },
];

export const destinationsById: Record<string, Destination> =
  destinations.reduce((acc, dest) => {
    acc[dest.id] = dest;
    return acc;
  }, {} as Record<string, Destination>);
