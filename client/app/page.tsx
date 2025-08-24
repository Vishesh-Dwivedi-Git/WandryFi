"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Trophy, Coins, Users } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { ScrollReveal } from "@/components/scroll-reveal"
import CosmosHero from "@/components/cosmos-hero"
import Link from "next/link"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.classList.add("dark")
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black">
      {/* Updated Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <MapPin className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WANDRIFY</h1>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/explore"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
            >
              Explore
            </Link>
            <Link
              href="/stake"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
            >
              Stake
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
            >
              Leaderboard
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:block text-sm text-gray-400">New to Web3? try our guide →</div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <CosmosHero />

      {/* Updated Features Section */}
      <section className="py-32 px-6 relative bg-black">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">How It Works</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Experience the future of travel through blockchain-powered adventures
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ScrollReveal delay={0.2}>
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Stake & Choose</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Select your dream destination in India and stake ETH. Higher stakes unlock premium locations and
                    bigger rewards from the community pool.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Navigate & Explore</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Use our advanced navigation system with real-time tracking to reach your destination within the time
                    limit. Every second counts in this epic race!
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Win or Lose</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Reach your destination to claim massive rewards from the community pool. Fail, and your stake feeds
                    the pool for other adventurers.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 relative bg-gradient-to-br from-black via-purple-950/20 to-black">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-900/50 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-4">2.4K</div>
                <div className="text-gray-400 text-lg">Active Travelers</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-900/50 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4">1.2K</div>
                <div className="text-gray-400 text-lg">ETH Staked</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-900/50 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-green-400 mb-4">28</div>
                <div className="text-gray-400 text-lg">Destinations</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-900/50 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-4">87%</div>
                <div className="text-gray-400 text-lg">Success Rate</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative bg-black">
        <div className="container mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
              Ready for Your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Epic Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of adventurers exploring India&apos;s most incredible destinations. Your next legendary
              adventure is just one stake away.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Users className="mr-3 h-5 w-5" />
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white px-8 py-4 rounded-full transition-all duration-300 bg-transparent"
                >
                  <Trophy className="mr-3 h-5 w-5" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16 px-6 bg-black">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <MapPin className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Wandrify</span>
          </div>
          <p className="text-gray-400 text-lg">Explore India. Stake Smart. Win Big.</p>
        </div>
      </footer>
    </div>
  )
}
