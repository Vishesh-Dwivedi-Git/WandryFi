export interface LeaderboardEntry {
  address: string;
  displayName: string;
  totalEarned: number;
  totalStaked: number;
  adventuresCompleted: number;
  successRate: number;
  favoriteCategory: string;
  level: number;
  achievements: string[];
}

export const mockLeaderboardData = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
    displayName: "AncientSeeker",
    totalEarned: 47.8,
    totalStaked: 23.2,
    adventuresCompleted: 156,
    successRate: 94,
    favoriteCategory: "Legendary",
    level: 42,
    achievements: [
      "First Explorer",
      "Legend Hunter",
      "Perfect Streak",
      "Master Navigator",
    ],
  },
  {
    address: "0x8ba1f109551bD432803012645Hac136c30C6213",
    displayName: "MysticWanderer",
    totalEarned: 38.4,
    totalStaked: 19.7,
    adventuresCompleted: 134,
    successRate: 89,
    favoriteCategory: "Mystical",
    level: 38,
    achievements: ["Mystic Master", "Speed Runner", "Risk Taker"],
  },
];
