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

    interface ProcessedLeaderboardPlayer {
      rank: number;
      address: `0x${string}`;
      score: number;
      badge: string;
    }

    return (users as RawLeaderboardResult["users"])
      .map(
        (
          userAddress: `0x${string}`,
          index: number
        ): ProcessedLeaderboardPlayer => ({
          rank: index + 1,
          address: userAddress,
          score: parseFloat(formatEther(profits[index] as bigint)),
          badge: badges[index] || "",
        })
      )
      .sort(
        (a: ProcessedLeaderboardPlayer, b: ProcessedLeaderboardPlayer) =>
          b.score - a.score
      );
  }, [leaderboardResult]);

  // 3. Find the current user's data within the processed leaderboard.
  const currentUserData = useMemo(() => {
    if (!connectedAddress || !processedLeaderboardData.length) {
      return null;
    }
    // Find the player entry that matches the connected wallet address
    return processedLeaderboardData.find(
      (player) =>
        player.address.toLowerCase() === connectedAddress.toLowerCase()
    );
  }, [connectedAddress, processedLeaderboardData]);

  // Helper component for rendering a player row to avoid repetition
  const PlayerRow = ({ player }: { player: LeaderboardPlayer }) => (
    <div className="grid grid-cols-4 gap-4 items-center">
      <div className="font-mono text-lg font-bold">
        <span
          className={player.rank <= 3 ? "text-white" : "text-gray-500"}
        >
          {player.rank <= 3 ? `[ 0${player.rank} ]` : `#${player.rank}`}
        </span>
      </div>
      <div className="font-mono text-sm text-gray-400 truncate tracking-wider">
        {player.address}
      </div>
      <div className="font-mono text-white font-bold tracking-widest text-right pr-8">
        {player.score.toLocaleString()} <span className="text-gray-600 text-xs">WNDR</span>
      </div>
      <div className="text-xl flex justify-center grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">{player.badge}</div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 font-mono text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-2">Network [ RANKING ]</h1>
            <p className="text-gray-500 text-xs tracking-wider">Global consensus participation metrics.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Total Participants</div>
            <div className="text-2xl font-bold text-white">{processedLeaderboardData.length}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/10">
            <div className="grid grid-cols-4 gap-4 font-bold text-[10px] uppercase tracking-widest text-gray-500">
              <div>Rank</div>
              <div>Node Address</div>
              <div className="text-right pr-8">Contribution Score</div>
              <div className="text-center">Status</div>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading
              ? // 4. Show a loading skeleton while data is being fetched
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <Skeleton className="h-6 w-10 bg-white/10 rounded-none" />
                    <Skeleton className="h-6 w-32 bg-white/10 rounded-none" />
                    <Skeleton className="h-6 w-24 bg-white/10 rounded-none" />
                    <Skeleton className="h-6 w-8 bg-white/10 rounded-none" />
                  </div>
                </div>
              ))
              : // 5. Map over the PROCESSED data, not the hardcoded array
              processedLeaderboardData.map((player) => (
                <div
                  key={player.address}
                  className="px-6 py-4 hover:bg-white/5 transition-colors duration-200"
                >
                  <PlayerRow player={player} />
                </div>
              ))}
          </div>

          {/* 6. Display the current user's rank at the bottom if they are connected and in the list */}
          {connectedAddress && currentUserData && (
            <div className="px-6 py-6 bg-white text-black border-t border-white/20">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="font-mono text-lg font-bold">
                  <span className="text-black">{`[ 0${currentUserData.rank} ]`}</span>
                </div>
                <div className="font-mono text-sm text-black truncate tracking-wider font-bold">
                  {currentUserData.address} <span className="ml-2 text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded-none">YOU</span>
                </div>
                <div className="font-mono text-black font-bold tracking-widest text-right pr-8">
                  {currentUserData.score.toLocaleString()} <span className="text-gray-600 text-xs">WNDR</span>
                </div>
                <div className="text-xl flex justify-center">{currentUserData.badge}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
