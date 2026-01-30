"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";

// Local Destination interface matching navigation-view.tsx and my-travel-page.tsx
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
import ExplorePage from "@/components/explore-page";
import LeaderboardPage from "@/components/leaderboard-page";
import MyTravelPage from "@/components/my-travel-page";
import NavigationView from "@/components/navigation-view";

export type PageType = "explore" | "leaderboard" | "my-travel";

interface MainAppProps {
  onBackToLanding?: () => void;
}

export default function MainApp({ onBackToLanding }: MainAppProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("explore");
  const [showNavigationView, setShowNavigationView] = useState(false);
  const [activeDestination, setActiveDestination] =
    useState<Destination | null>(null);

  const handleNavigationView = (show: boolean, destination?: Destination) => {
    if (show && destination) {
      setActiveDestination(destination);
    } else {
      setActiveDestination(null);
    }
    setShowNavigationView(show);
  };

  if (showNavigationView && activeDestination) {
    return (
      <NavigationView
        destination={activeDestination}
        onClose={() => handleNavigationView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-white selection:text-black overflow-x-hidden relative">
      {/* Background Grid - faint texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogoClick={onBackToLanding}
      />
      <main className="pt-24 relative z-10 px-6 container mx-auto">
        {currentPage === "explore" && <ExplorePage />}
        {currentPage === "leaderboard" && <LeaderboardPage />}
        {currentPage === "my-travel" && (
          <MyTravelPage onNavigationView={handleNavigationView} />
        )}
      </main>
    </div>
  );
}
