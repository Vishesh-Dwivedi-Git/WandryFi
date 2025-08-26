"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import ExplorePage from "@/components/explore-page"
import LeaderboardPage from "@/components/leaderboard-page"
import MyTravelPage from "@/components/my-travel-page"
import NavigationView from "@/components/navigation-view"

export type PageType = "explore" | "leaderboard" | "my-travel"

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageType>("explore")
  const [showNavigationView, setShowNavigationView] = useState(false)

  const handleNavigationView = (show: boolean) => {
    setShowNavigationView(show)
  }

  if (showNavigationView) {
    return <NavigationView onClose={() => setShowNavigationView(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="pt-16">
        {currentPage === "explore" && <ExplorePage />}
        {currentPage === "leaderboard" && <LeaderboardPage />}
        {currentPage === "my-travel" && <MyTravelPage onNavigationView={handleNavigationView} />}
      </main>
    </div>
  )
}
