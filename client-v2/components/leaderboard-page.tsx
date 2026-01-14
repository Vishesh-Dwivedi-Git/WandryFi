"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";
import { formatEther } from "viem";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardPlayer {
  rank: number;
  address: `0x${string}`;
  score: number;
  badge: string;
}

export default function LeaderboardPage() {
  const { address: connectedAddress } = useAccount();
  const contract = useWanderifyContract();

  // 1. Fetch the leaderboard data. The result will be a tuple: [address[], bigint[]]
  const { data: leaderboardResult, isLoading } = useReadContract({
    ...contract,
    functionName: "getLeaderboard",
  });
  console.log("______________CONTRACT READ");
  console.log(leaderboardResult);
  // 2. Process the fetched data into the structure your UI expects.
  //    useMemo ensures this only recalculates when the contract data changes.
  const processedLeaderboardData = useMemo(() => {
    if (!leaderboardResult) {
      return [];
    }

    const [users, profits] = Array.isArray(leaderboardResult)
      ? leaderboardResult
      : [[], []];
    const badges = ["🏆", "🥈", "🥉"];
    console.log(leaderboardResult);
    interface RawLeaderboardResult {
      users: `0x${string}`[];
      profits: bigint[];
    }

    return (users as RawLeaderboardResult["users"])
      .map(
        (
          userAddress: `0x${string}`,
          index: number
        ): LeaderboardPlayer => ({
          rank: index + 1,
          address: userAddress,
          score: parseFloat(formatEther(profits[index] as bigint)),
          badge: badges[index] || "",
        })
      )
      .sort(
        (a: LeaderboardPlayer, b: LeaderboardPlayer) =>
          b.score - a.score
      );
  }, [leaderboardResult]);

  // 3. Find the current user's data within the processed leaderboard.
  const currentUserData = useMemo((): LeaderboardPlayer | null => {
    if (!connectedAddress || !processedLeaderboardData.length) {
      return null;
    }
    // Find the player entry that matches the connected wallet address
    const found = processedLeaderboardData.find(
      (player) =>
        player.address.toLowerCase() === connectedAddress.toLowerCase()
    );
    return found || null;
  }, [connectedAddress, processedLeaderboardData]);

  // Helper component for rendering a player row to avoid repetition
  const PlayerRow = ({ player }: { player: LeaderboardPlayer }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
      <div className="font-pixel text-base sm:text-lg">
        <span
          className={player.rank <= 3 ? "text-neon-gold" : "text-foreground"}
        >
          #{player.rank}
        </span>
        {/* Show badge inline on mobile */}
        <span className="sm:hidden ml-2 text-xl">{player.badge}</span>
      </div>
      <div className="hidden sm:block font-mono text-sm text-muted-foreground truncate">
        {player.address}
      </div>
      <div className="font-pixel text-neon-cyan text-sm sm:text-base">
        {player.score.toLocaleString()} <span className="hidden sm:inline">WNDR</span>
      </div>
      <div className="hidden sm:block text-2xl">{player.badge}</div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl sm:text-4xl text-white tracking-tight">
              Global Ranking
            </h1>
            <div className="text-neon-cyan font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] opacity-70 mt-1">
              LIVE_DATA_FEED::ACTIVE
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Deco Lines */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent opacity-50" />

          <div className="bg-white/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 font-mono text-[10px] sm:text-xs text-neon-cyan tracking-widest uppercase">
              <div>// Rank</div>
              <div className="hidden sm:block">// Explorer</div>
              <div>// Score</div>
              <div className="hidden sm:block">// Badge</div>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 sm:px-6 py-4 sm:py-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                    <Skeleton className="h-5 sm:h-6 w-10 bg-white/10" />
                    <Skeleton className="hidden sm:block h-6 w-32 bg-white/10" />
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-24 bg-white/10" />
                    <Skeleton className="hidden sm:block h-6 w-8 bg-white/10" />
                  </div>
                </div>
              ))
              : processedLeaderboardData.map((player) => (
                <div
                  key={player.address}
                  className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-white/5 transition-colors duration-200 group"
                >
                  <PlayerRow player={player} />
                </div>
              ))}
          </div>

          {connectedAddress && currentUserData && (
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-neon-cyan/10 border-t border-neon-cyan/30 relative">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-neon-cyan" />
              <PlayerRow player={currentUserData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
