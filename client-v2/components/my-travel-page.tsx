"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JSX } from "react/jsx-runtime";
import { useAccount, useReadContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";
import { formatEther, zeroAddress } from "viem";
import { destinationsById } from "@/lib/destinations";
import { Skeleton } from "@/components/ui/skeleton";

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

const MIN_STAKE_DURATION_SECS = 15 * 24 * 60 * 60; // must match MIN_STAKE_DURATION
const CLAIM_WINDOW_SECS = 24 * 60 * 60; // 1 day claim window after travel date

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "border-white/10 bg-white/5 text-gray-400";
    case "rare":
      return "border-white/20 bg-white/10 text-white";
    case "legendary":
      return "border-white/40 bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]";
    default:
      return "border-white/5 bg-transparent text-gray-600";
  }
};

const getPixelIcon = (icon: string) => {
  const iconMap: Record<string, JSX.Element> = {
    waterfall: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect
          x="12"
          y="4"
          width="8"
          height="24"
          fill="currentColor"
          className="text-blue-400"
        />
        <rect
          x="8"
          y="8"
          width="4"
          height="16"
          fill="currentColor"
          className="text-blue-300"
        />
        <rect
          x="20"
          y="8"
          width="4"
          height="16"
          fill="currentColor"
          className="text-blue-300"
        />
        <rect
          x="4"
          y="24"
          width="24"
          height="4"
          fill="currentColor"
          className="text-blue-500"
        />
      </svg>
    ),
    temple: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect
          x="4"
          y="20"
          width="24"
          height="8"
          fill="currentColor"
          className="text-neon-gold"
        />
        <rect
          x="8"
          y="12"
          width="16"
          height="8"
          fill="currentColor"
          className="text-neon-gold"
        />
        <rect
          x="12"
          y="4"
          width="8"
          height="8"
          fill="currentColor"
          className="text-neon-gold"
        />
        <rect
          x="14"
          y="2"
          width="4"
          height="2"
          fill="currentColor"
          className="text-neon-gold"
        />
      </svg>
    ),
    coral: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect
          x="8"
          y="16"
          width="4"
          height="12"
          fill="currentColor"
          className="text-pink-400"
        />
        <rect
          x="20"
          y="12"
          width="4"
          height="16"
          fill="currentColor"
          className="text-orange-400"
        />
        <rect
          x="14"
          y="8"
          width="4"
          height="20"
          fill="currentColor"
          className="text-red-400"
        />
        <rect
          x="4"
          y="24"
          width="24"
          height="4"
          fill="currentColor"
          className="text-blue-400"
        />
      </svg>
    ),
    ruins: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect
          x="4"
          y="20"
          width="6"
          height="8"
          fill="currentColor"
          className="text-gray-400"
        />
        <rect
          x="12"
          y="16"
          width="8"
          height="12"
          fill="currentColor"
          className="text-gray-400"
        />
        <rect
          x="22"
          y="18"
          width="6"
          height="10"
          fill="currentColor"
          className="text-gray-400"
        />
        <rect
          x="8"
          y="12"
          width="4"
          height="4"
          fill="currentColor"
          className="text-gray-300"
        />
      </svg>
    ),
    snowflake: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect
          x="14"
          y="4"
          width="4"
          height="24"
          fill="currentColor"
          className="text-blue-200"
        />
        <rect
          x="4"
          y="14"
          width="24"
          height="4"
          fill="currentColor"
          className="text-blue-200"
        />
        <rect
          x="8"
          y="8"
          width="16"
          height="2"
          fill="currentColor"
          className="text-blue-200"
          transform="rotate(45 16 16)"
        />
        <rect
          x="8"
          y="22"
          width="16"
          height="2"
          fill="currentColor"
          className="text-blue-200"
          transform="rotate(-45 16 16)"
        />
      </svg>
    ),
    volcano: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect
          x="8"
          y="16"
          width="16"
          height="12"
          fill="currentColor"
          className="text-red-600"
        />
        <rect
          x="12"
          y="8"
          width="8"
          height="8"
          fill="currentColor"
          className="text-red-500"
        />
        <rect
          x="14"
          y="4"
          width="4"
          height="4"
          fill="currentColor"
          className="text-orange-400"
        />
        <rect
          x="16"
          y="2"
          width="2"
          height="2"
          fill="currentColor"
          className="text-yellow-400"
        />
      </svg>
    ),
  };
  return iconMap[icon] || iconMap.ruins;
};

const TrophyCard = ({ tokenId }: { tokenId: bigint }) => {
  const contract = useWanderifyContract();
  const isValidContract =
    !!contract.address && contract.address !== zeroAddress;

  const { data: nftDetailsData, isLoading: isLoadingDetails } = useReadContract(
    {
      ...contract,
      functionName: "getJourneyNFTDetails",
      args: [tokenId],
      query: { enabled: isValidContract },
    }
  );
  // Support both named struct object and tuple array returns
  const nftDetails = (() => {
    if (!nftDetailsData) return undefined;
    const d: any = nftDetailsData as any;
    const destinationName: string | undefined = d?.destinationName ?? d?.[4];
    const rawCompletion = d?.completionDate ?? d?.[1];
    const completionDate: bigint | undefined =
      typeof rawCompletion === "bigint"
        ? rawCompletion
        : rawCompletion != null
          ? BigInt(rawCompletion)
          : undefined;
    if (!destinationName || completionDate == null) return undefined;
    return { destinationName, completionDate } as {
      destinationName: string;
      completionDate: bigint;
    };
  })();

  const { data: tokenUriData, isLoading: isLoadingUri } = useReadContract({
    ...contract,
    functionName: "tokenURI",
    args: [tokenId],
    query: { enabled: isValidContract },
  });
  const tokenUri = tokenUriData as string | undefined;

  const [metadata, setMetadata] = useState<{
    name: string;
    image: string;
    description: string;
    attributes: { trait_type: string; value: string }[];
  } | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tokenUri) {
        if (!isLoadingUri) setIsLoadingMetadata(false);
        return;
      }
      try {
        // Handle ipfs:// and data:application/json;base64 URIs
        if (tokenUri.startsWith("ipfs://")) {
          const url = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
          const res = await fetch(url);
          const data = await res.json();
          setMetadata(data);
        } else if (tokenUri.startsWith("data:application/json;base64,")) {
          const b64 = tokenUri.split(",", 2)[1] || "";
          const json = JSON.parse(atob(b64));
          setMetadata(json);
        } else if (tokenUri.startsWith("data:application/json,")) {
          const json = JSON.parse(tokenUri.split(",", 2)[1] || "{}");
          setMetadata(json);
        } else {
          const res = await fetch(tokenUri);
          const data = await res.json();
          setMetadata(data);
        }
      } catch (e) {
        console.error("Failed to load token metadata:", e);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    load();
  }, [tokenUri, isLoadingUri]);

  if (isLoadingDetails || isLoadingMetadata) {
    return <Skeleton className="aspect-square rounded-lg" />;
  }

  if (!nftDetails) return null;

  const rarity =
    metadata?.attributes
      ?.find((a) => a.trait_type === "Rarity")
      ?.value?.toLowerCase() || "common";
  const icon =
    metadata?.attributes
      ?.find((a) => a.trait_type === "Icon")
      ?.value?.toLowerCase() || "ruins";

  return (
    <div
      className={cn(
        "aspect-square border p-4 flex flex-col items-center justify-center group hover:border-white/50 transition-all duration-300 relative overflow-hidden",
        getRarityColor(rarity)
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="w-12 h-12 mb-4 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
        {metadata?.image ? (
          <img
            src={metadata.image}
            alt={nftDetails.destinationName}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          getPixelIcon(icon)
        )}
      </div>
      <div className="text-center relative z-10">
        <p className="font-bold text-[10px] uppercase tracking-widest mb-1 line-clamp-2">
          {nftDetails.destinationName}
        </p>
        <p className="text-[9px] opacity-60 uppercase tracking-wider">
          {new Date(
            Number(nftDetails.completionDate) * 1000
          ).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

interface MyTravelPageProps {
  onNavigationView: (show: boolean, destination?: Destination) => void;
}

const MyTravelPage = ({ onNavigationView }: MyTravelPageProps) => {
  const [activeTab, setActiveTab] = useState<"active-quests" | "trophy-case">(
    "active-quests"
  );
  const { address } = useAccount();

  const contract = useWanderifyContract();
  const isValidContract =
    !!contract.address && contract.address !== zeroAddress;

  const { data: commitmentData, isLoading: isLoadingCommitment } =
    useReadContract({
      ...contract,
      functionName: "commitments",
      args: [address],
      query: { enabled: !!address && isValidContract, refetchInterval: 5000 }, // keep fresh
    });
  console.log("Commitment Data:", commitmentData);
  const commitment =
    commitmentData && Array.isArray(commitmentData)
      ? {
        user: commitmentData[0] as string,
        amountInPool: commitmentData[1] as bigint,
        travelDate: commitmentData[2] as bigint,
        destinationId: commitmentData[3] as bigint,
        isProcessed: commitmentData[4] as boolean,
      }
      : undefined;

  // On-chain destination name and metadata for the active commitment
  const destinationIdForRead = commitment?.destinationId;
  const { data: destinationNameData } = useReadContract({
    ...contract,
    functionName: "destinationNames",
    args: destinationIdForRead ? [destinationIdForRead] : undefined,
    query: { enabled: !!destinationIdForRead && isValidContract },
  });
  const { data: destinationMetadataUriData } = useReadContract({
    ...contract,
    functionName: "destinationMetadata",
    args: destinationIdForRead ? [destinationIdForRead] : undefined,
    query: { enabled: !!destinationIdForRead && isValidContract },
  });
  const destinationNameOnchain = destinationNameData as string | undefined;
  const destinationMetadataUri = destinationMetadataUriData as
    | string
    | undefined;

  // Fetch destination metadata image (IPFS)
  const [activeDestMetadata, setActiveDestMetadata] = useState<{
    image?: string;
  } | null>(null);
  useEffect(() => {
    if (!destinationMetadataUri) {
      setActiveDestMetadata(null);
      return;
    }
    const url = destinationMetadataUri.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );
    fetch(url)
      .then((r) => r.json())
      .then((j) => setActiveDestMetadata(j))
      .catch(() => setActiveDestMetadata(null));
  }, [destinationMetadataUri]);

  const { data: tokenIdsData, isLoading: isLoadingTokenIds } = useReadContract({
    ...contract,
    functionName: "getUserJourneyNFTs",
    args: [address],
    query: { enabled: !!address && isValidContract },
  });
  const tokenIds = tokenIdsData as bigint[] | undefined;

  const nowSec = Math.floor(Date.now() / 1000);
  const secondsRemaining = commitment
    ? Math.max(0, Number(commitment.travelDate) - nowSec)
    : 0;
  const timeRemainingPct = Math.min(
    100,
    Math.round((secondsRemaining / MIN_STAKE_DURATION_SECS) * 100)
  );

  const activeQuest = (() => {
    try {
      if (!commitment ||
        commitment.user === "0x0000000000000000000000000000000000000000" ||
        commitment.isProcessed) {
        return null;
      }

      // Get destination data for fallback
      const destId = commitment.destinationId?.toString() || "0";
      const destinationData = destinationsById[destId];

      // Handle image - could be from IPFS metadata, static import, or fallback
      let questImage: string = "/placeholder.svg";
      if (activeDestMetadata?.image) {
        questImage = activeDestMetadata.image;
      } else if (destinationData?.image) {
        // Handle StaticImageData from Next.js imports
        questImage = typeof destinationData.image === "string"
          ? destinationData.image
          : destinationData.image.src;
      }

      // Calculate time remaining breakdown
      const travelDateTs = Number(commitment.travelDate);
      const nowTs = Math.floor(Date.now() / 1000);
      const secsRemaining = Math.max(0, travelDateTs - nowTs);

      const days = Math.floor(secsRemaining / 86400);
      const hours = Math.floor((secsRemaining % 86400) / 3600);
      const minutes = Math.floor((secsRemaining % 3600) / 60);

      return {
        id: destId,
        destinationName:
          destinationNameOnchain ||
          destinationData?.name ||
          "Unknown Quest",
        stakeAmount: parseFloat(formatEther(commitment.amountInPool)),
        travelDate: travelDateTs,
        image: questImage,
        status:
          nowTs >= travelDateTs && nowTs <= travelDateTs + CLAIM_WINDOW_SECS
            ? "ready-for-checkin"
            : nowTs > travelDateTs + CLAIM_WINDOW_SECS
              ? "claim-expired"
              : "in-progress",
        timeRemaining: timeRemainingPct,
        daysRemaining: days,
        hoursRemaining: hours,
        minutesRemaining: minutes,
      };
    } catch (error) {
      console.error("Error creating active quest:", error);
      return null;
    }
  })();

  const trophies = Array.isArray(tokenIds)
    ? tokenIds.filter(
      (tokenId): tokenId is bigint =>
        tokenId !== undefined && tokenId !== null
    )
    : [];

  return (
    <div className="min-h-screen p-6 font-mono text-[#E0E0E0]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-2">My Travel [ LOGS ]</h1>
            <p className="text-gray-500 text-xs tracking-wider">Manage your active quests and view your achievements.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-start mb-8 space-x-6">
          <button
            onClick={() => setActiveTab("active-quests")}
            className={cn(
              "text-sm uppercase tracking-widest transition-colors",
              activeTab === "active-quests"
                ? "text-white font-bold border-b border-white pb-1"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {activeTab === "active-quests" ? "[ ACTIVE QUESTS ]" : "ACTIVE QUESTS"}
          </button>
          <button
            onClick={() => setActiveTab("trophy-case")}
            className={cn(
              "text-sm uppercase tracking-widest transition-colors",
              activeTab === "trophy-case"
                ? "text-white font-bold border-b border-white pb-1"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {activeTab === "trophy-case" ? "[ TROPHY CASE ]" : "TROPHY CASE"}
          </button>
        </div>

        {/* Active Quests Tab */}
        {activeTab === "active-quests" && (
          <div className="space-y-6">
            {isLoadingCommitment ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading active quest...</p>
              </div>
            ) : !activeQuest ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No active quests. Start exploring to begin your journey!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[activeQuest].map((quest) => (
                  <Card
                    key={quest.id}
                    className="bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 rounded-none"
                  >
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={quest.image || "/placeholder.svg"}
                          alt={quest.destinationName}
                          className="w-full h-full object-cover grayscale opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={cn(
                            "px-3 py-1 text-[10px] font-bold tracking-widest uppercase border",
                            quest.status === "ready-for-checkin"
                              ? "bg-green-500/20 text-green-400 border-green-500/50"
                              : quest.status === "claim-expired"
                                ? "bg-red-500/20 text-red-400 border-red-500/50"
                                : "bg-black/50 text-white border-white/20 backdrop-blur-sm"
                          )}>
                            {quest.status === "ready-for-checkin"
                              ? "Ready to Claim"
                              : quest.status === "claim-expired"
                                ? "Expired"
                                : "In Progress"}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-white mb-6 uppercase tracking-widest">
                          {quest.destinationName}
                        </h3>

                        <div className="space-y-6">
                          {/* Stake Amount */}
                          <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-xs text-gray-500 uppercase tracking-widest">
                              Staked Amount
                            </span>
                            <span className="font-mono text-white font-bold">
                              {quest.stakeAmount.toFixed(4)} <span className="text-xs text-gray-600">TMON</span>
                            </span>
                          </div>

                          {/* Time Display */}
                          <div className="bg-white/5 border border-white/10 p-4">
                            {quest.status === "ready-for-checkin" ? (
                              <div className="text-center">
                                <p className="text-green-400 font-bold text-sm mb-1 uppercase tracking-wider">Claim Period Active</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest max-w-[200px] mx-auto">
                                  Window open for 24 hours
                                </p>
                              </div>
                            ) : quest.status === "claim-expired" ? (
                              <div className="text-center">
                                <p className="text-red-400 font-bold text-sm mb-1 uppercase tracking-wider">Window Expired</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest max-w-[200px] mx-auto">
                                  Stake forfeited
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Time until claim opens</p>
                                <div className="flex justify-center gap-6">
                                  <div className="text-center">
                                    <div className="font-mono text-2xl text-white font-bold">{quest.daysRemaining}</div>
                                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Days</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-mono text-2xl text-white font-bold">{quest.hoursRemaining}</div>
                                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Hours</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-mono text-2xl text-white font-bold">{quest.minutesRemaining}</div>
                                    <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Mins</div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest border-t border-white/5 pt-2 inline-block px-4">
                                  Target: {new Date(quest.travelDate * 1000).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-2">
                            {quest.status === "ready-for-checkin" ? (
                              <Button
                                onClick={() => {
                                  const destinationData = destinationsById[quest.id];
                                  const correctCoordinates = destinationData?.coordinates || { lat: 0, lng: 0 };

                                  onNavigationView(true, {
                                    id: quest.id,
                                    name: quest.destinationName,
                                    image: quest.image,
                                    rewardPool: 0,
                                    difficulty: destinationData?.difficulty || "Medium",
                                    description: destinationData?.description || `Claim rewards for ${quest.destinationName}`,
                                    coordinates: correctCoordinates,
                                    participants: 1,
                                    estimatedTime: destinationData?.estimatedTime || "15 days",
                                    tags: destinationData?.tags || ["Active", "Quest"],
                                  });
                                }}
                                className="w-full py-6 bg-white text-black hover:bg-gray-200 font-bold tracking-widest uppercase rounded-none"
                              >
                                [ VERIFY LOCATION ]
                              </Button>
                            ) : quest.status === "claim-expired" ? (
                              <Button
                                disabled
                                className="w-full py-6 bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed font-bold tracking-widest uppercase rounded-none"
                              >
                                EXPIRED
                              </Button>
                            ) : (
                              <Button
                                disabled
                                className="w-full py-6 bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed font-bold tracking-widest uppercase rounded-none"
                              >
                                PENDING APPROVAL
                              </Button>
                            )}
                          </div>

                          {/* Info Note */}
                          <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest">
                            // Stake verification protocol v2.0
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trophy Case Tab */}
        {activeTab === "trophy-case" && (
          <div className="space-y-6">
            {isLoadingTokenIds ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xs uppercase tracking-widest">Loading trophies...</p>
              </div>
            ) : trophies.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10">
                <p className="text-gray-500 text-xs uppercase tracking-widest">
                  No trophies earned yet. Complete quests to earn badges.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trophies.map((tokenId: bigint) => (
                  <TrophyCard key={tokenId.toString()} tokenId={tokenId} />
                ))}
              </div>
            )}

            {/* Trophy Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 text-center">
                <div className="font-mono text-2xl text-white font-bold mb-1">
                  {trophies.length}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Total Badges
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 text-center">
                <div className="font-mono text-xl text-gray-300 font-bold mb-1">
                  {/* This would require fetching details for all NFTs, skipping for now for performance */}
                  0
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Rare+
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 text-center">
                <div className="font-mono text-xl text-gray-300 font-bold mb-1">
                  {/* This would require fetching details for all NFTs, skipping for now for performance */}
                  0
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest">Legendary</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTravelPage;
