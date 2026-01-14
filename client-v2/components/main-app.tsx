"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import ExplorePage from "@/components/explore-page";
import LeaderboardPage from "@/components/leaderboard-page";
import MyTravelPage from "@/components/my-travel-page";
import NavigationView from "@/components/navigation-view";
import { Destination } from "@/lib/destinations";

export type PageType = "explore" | "leaderboard" | "my-travel";

export default function MainApp() {
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
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans selection:bg-neon-cyan/30">
      {/* Global FX Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-scanlines opacity-[0.05]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-80" />

        {/* Ambient Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-neon-cyan/5 rounded-full blur-[150px] animate-pulse-glow opacity-30" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12">
          {currentPage === "explore" && <ExplorePage />}
          {currentPage === "leaderboard" && <LeaderboardPage />}
          {currentPage === "my-travel" && (
            <MyTravelPage onNavigationView={handleNavigationView} />
          )}
        </main>
      </div>
    </div>
  );
}
