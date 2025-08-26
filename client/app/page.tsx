"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Trophy, Coins } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import Link from "next/link"
import { AnimatedCharacter } from "@/components/AnimatedCtar"
import Header from "@/components/Header"



export default function LandingPage() {
  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [])

  return (
    <div className="min-h-screen bg-background ancient-texture">
      {/* Header */}
      <Header />

      {/* Hero Section with 3D Character */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 1.5, 5], fov: 60 }}>
            <Suspense fallback={null}>
              <Environment preset="sunset" />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

              <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
                <AnimatedCharacter />
              </Float>

              <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
               
              </Float>

              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h1 className="text-6xl md:text-8xl font-heading font-bold mb-6 text-foreground">
              <span className="text-accent">WandryFi</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Embark on a journey through mystical lands with stunning 3D visuals and interactive adventures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="sketch-border bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="sketch-border bg-transparent">
                Learn More
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-center mb-16 text-foreground">
              How It Works
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ScrollReveal delay={0.2}>
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
                    <Coins className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4 text-card-foreground">Stake Your Coins</h3>
                  <p className="text-muted-foreground">
                    Choose a mystical destination and stake your ETH. The more you stake, the greater your potential
                    rewards.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4 text-card-foreground">Explore & Navigate</h3>
                  <p className="text-muted-foreground">
                    Use our ancient maps to navigate to your chosen destination within the time limit.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <Card className="sketch-border ancient-texture border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4 text-card-foreground">Earn Rewards</h3>
                  <p className="text-muted-foreground">
                    Successfully reach your destination to earn rewards. Fail, and your stake goes to the community
                    pool.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-4xl md:text-6xl font-heading font-bold text-accent mb-2">1.2K</div>
                <div className="text-muted-foreground">Active Explorers</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-heading font-bold text-accent mb-2">847</div>
                <div className="text-muted-foreground">ETH Staked</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-heading font-bold text-accent mb-2">156</div>
                <div className="text-muted-foreground">Destinations</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-heading font-bold text-accent mb-2">92%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8 text-foreground">
              Ready for Your <span className="text-accent">Adventure?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of explorers on epic journeys across mystical lands. Your next adventure awaits.
            </p>
            <Link href="/explore">
              <Button size="lg" className="sketch-border bg-accent hover:bg-accent/90 text-accent-foreground">
                Begin Exploration
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MapPin className="h-6 w-6 text-accent" />
            <span className="text-xl font-heading font-bold">WandryFi</span>
          </div>
          <p className="text-muted-foreground">Explore the unknown. Stake your future. Earn your legend.</p>
        </div>
      </footer>
    </div>
  )
}