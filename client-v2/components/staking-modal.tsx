"use client";

import { useState } from "react"; // Set default travel date to 2 days from now for testing (instead of 17 days)

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, CalendarIcon } from "lucide-react";
import { useWanderfy } from "@/contexts/wanderify-context";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useWanderifyContract } from "@/lib/contract";
import { parseEther } from "viem";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { destinationsById } from "@/lib/destinations";

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
  const [travelDate, setTravelDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { acceptQuest } = useWanderfy();
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Set default travel date to 17 days from now (to ensure > 15 days requirement)
  const defaultTravelDate = new Date();
  defaultTravelDate.setDate(defaultTravelDate.getDate() + 16);

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
    if (amount > 0 && travelDate) {
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

            // Get correct coordinates from centralized destination data
            const destinationData = destinationsById[destinationId];
            const correctCoordinates = destinationData?.coordinates || {
              lat: 0,
              lng: 0, // Fallback to {0,0} for unknown destinations
            };

            console.log("=== STAKING MODAL DEBUG ===");
            console.log("Destination ID:", destinationId);
            console.log("Destination Data:", destinationData);
            console.log("Correct Coordinates:", correctCoordinates);
            console.log("============================");

            acceptQuest(
              {
                id: destinationId,
                name: (destinationName as string) || "Unknown",
                image: destinationData?.image || "/placeholder.svg",
                rewardPool: locationPool
                  ? Math.round(
                      parseFloat(
                        (Number(locationPool as bigint) / 1e18).toString()
                      )
                    )
                  : 0,
                difficulty: destinationData?.difficulty || "Medium",
                description:
                  destinationData?.description || "Destination from contract",
                coordinates: {
                  x: correctCoordinates.lng, // Convert lng to x
                  y: correctCoordinates.lat, // Convert lat to y
                },
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
              Stake ETH to prove you will visit this destination. (Testing mode
              - shorter dates allowed)
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
                <span>
                  Travel to the destination coordinates (Testing mode)
                </span>
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

          {/* Travel Date Picker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-pixel text-sm text-foreground">
                Travel Date
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTravelDate(defaultTravelDate)}
                className="text-xs text-neon-cyan hover:text-neon-cyan/80 font-pixel"
              >
                Quick Select (2 days - Testing)
              </Button>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-muted border-border focus:border-neon-cyan hover:border-neon-cyan/50 transition-colors",
                    !travelDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-neon-cyan" />
                  {travelDate ? (
                    <span className="text-foreground">
                      {format(travelDate, "PPP")}
                    </span>
                  ) : (
                    <span>Pick a travel date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-card border-border shadow-lg"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={travelDate}
                  onSelect={(date) => {
                    setTravelDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => {
                    // COMMENTED OUT FOR TESTING: Must be at least 15 days in future
                    // const today = new Date();
                    // const minDate = new Date(today);
                    // minDate.setDate(today.getDate() + 15);
                    // return date < minDate;
                    return false; // Allow all future dates for testing
                  }}
                  initialFocus
                  className="bg-card border-border"
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption:
                      "flex justify-center pt-1 relative items-center font-pixel text-neon-cyan",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-transparent p-0 hover:bg-neon-cyan/20 text-neon-cyan border border-transparent hover:border-neon-cyan/50",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                      "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] font-pixel",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-neon-cyan/20 hover:text-neon-cyan font-pixel",
                    day_selected:
                      "bg-neon-cyan text-background hover:bg-neon-cyan/90 hover:text-background focus:bg-neon-cyan focus:text-background",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-2">
              {/* COMMENTED OUT FOR TESTING: Must be at least 15 days from today to complete the quest. */}
              Select any future date for testing purposes.
              {travelDate && (
                <span className="text-neon-cyan ml-1">
                  Selected:{" "}
                  {Math.ceil(
                    (travelDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days from now
                </span>
              )}
            </p>
          </div>

          {/* Accept Quest Button */}
          <Button
            onClick={handleAcceptQuest}
            disabled={
              !stakeAmount ||
              Number.parseFloat(stakeAmount) < 10 ||
              !travelDate ||
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
