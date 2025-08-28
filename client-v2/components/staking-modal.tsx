"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useWanderfy } from "@/contexts/wanderify-context";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";
import { parseEther } from "viem";

interface StakingModalProps {
  destinationId: string;
  onClose: () => void;
  onAcceptQuest: (amount: number) => void;
}

export default function StakingModal({
  destinationId,
  onClose,
  onAcceptQuest,
}: StakingModalProps) {
  const [stakeAmount, setStakeAmount] = useState("");
  const { acceptQuest } = useWanderfy();
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const contract = useWanderifyContract();

  const { data: commitment } = useReadContract({
    ...contract,
    functionName: "commitments",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Fetch destination data from contract
  const { data: destinationName } = useReadContract({
    ...contract,
    functionName: "destinationNames",
    args: [BigInt(destinationId)],
  });

  const { data: locationPool } = useReadContract({
    ...contract,
    functionName: "locationPools",
    args: [BigInt(destinationId)],
  });

  const commitmentData =
    commitment && Array.isArray(commitment)
      ? {
          user: commitment[0] as string,
          amountInPool: commitment[1] as bigint,
          travelDate: commitment[2] as bigint,
          destinationId: commitment[3] as bigint,
          isProcessed: commitment[4] as boolean,
        }
      : undefined;

  const isAlreadyStaked =
    commitmentData &&
    commitmentData.amountInPool > 0 &&
    !commitmentData.isProcessed;

  const handleAcceptQuest = () => {
    const amount = Number.parseFloat(stakeAmount);
    if (amount > 0) {
      const travelDate = new Date();
      travelDate.setDate(travelDate.getDate() + 17); // Set to 17 days to ensure > 15 days requirement
      const travelDateInSeconds = Math.floor(travelDate.getTime() / 1000);

      writeContract(
        {
          ...contract,
          functionName: "stake",
          args: [BigInt(destinationId), BigInt(travelDateInSeconds)],
          value: parseEther(stakeAmount),
        },
        {
          onSuccess: (hash) => {
            toast.success("Transaction Sent!", {
              description: `Tx hash: ${hash}`,
            });
            acceptQuest(
              {
                id: destinationId,
                name: (destinationName as string) || "Unknown",
                image: "/placeholder.svg",
                rewardPool: locationPool
                  ? Math.round(
                      parseFloat(
                        (Number(locationPool as bigint) / 1e18).toString()
                      )
                    )
                  : 0,
                difficulty: "Medium" as const,
                description: "Destination from contract",
                coordinates: { lat: 0, lng: 0 },
              },
              amount
            );
            onAcceptQuest(amount);
            onClose();
          },
          onError: (error) => {
            toast.error("Transaction Failed", {
              description: error.message,
            });
          },
        }
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-neon-gold";
      case "Hard":
        return "text-neon-magenta";
      default:
        return "text-foreground";
    }
  };

  if (!(destinationName as string)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-neon-cyan font-pixel">
            Loading destination...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-pixel text-xl text-neon-cyan">Quest Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Destination Info */}
          <div className="mb-6">
            <h3 className="font-pixel text-2xl text-foreground mb-4">
              {(destinationName as string) || "Loading..."}
            </h3>
            <p className="text-muted-foreground mb-4">
              Stake ETH to prove you will visit this destination within 15 days.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Current Pool
                </div>
                <div className="font-pixel text-lg text-neon-gold">
                  {locationPool
                    ? `${(Number(locationPool as bigint) / 1e18).toFixed(
                        4
                      )} ETH`
                    : "0 ETH"}
                </div>
              </div>
            </div>
          </div>

          {/* Quest Requirements */}
          <div className="mb-6">
            <h4 className="font-pixel text-lg text-foreground mb-3">
              Quest Requirements
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                <span>Travel to the destination coordinates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                <span>Complete the check-in process</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                <span>Submit proof of visit</span>
              </div>
            </div>
          </div>

          {/* Stake Input */}
          <div className="mb-6">
            <Label
              htmlFor="stake-amount"
              className="font-pixel text-sm text-foreground mb-2 block"
            >
              Stake Amount (WNDR)
            </Label>
            <Input
              id="stake-amount"
              type="number"
              placeholder="Enter amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="bg-muted border-border focus:border-neon-cyan"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Minimum stake: 10 WNDR. Higher stakes increase potential rewards.
            </p>
          </div>

          {/* Accept Quest Button */}
          <Button
            onClick={handleAcceptQuest}
            disabled={
              !stakeAmount ||
              Number.parseFloat(stakeAmount) < 10 ||
              Boolean(isPending) ||
              Boolean(isAlreadyStaked)
            }
            className="w-full font-pixel text-lg py-6 bg-neon-cyan text-background hover:bg-neon-cyan/90 glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? "Staking..."
              : isAlreadyStaked
              ? "Already Staked"
              : "Accept Quest"}
          </Button>
        </div>
      </div>
    </div>
  );
}
