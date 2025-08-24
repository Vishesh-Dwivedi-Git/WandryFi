"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Globe, ArrowDown } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import Link from "next/link"

export function ImmersiveHeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/10"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      <div className="absolute inset-0 opacity-20" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-neon/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="mb-12">
            <div className="relative">
              <h1 className="text-8xl md:text-[12rem] font-heading font-black mb-8 bg-gradient-to-r from-primary via-accent to-neon bg-clip-text text-transparent leading-none">
                Wandrify
              </h1>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon rounded-full animate-ping opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent rounded-full animate-pulse" />
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary" />
              <div className="mx-4 px-6 py-2 glass-card neon-border rounded-full">
                <span className="text-accent font-semibold text-lg">Web3 Travel Gaming</span>
              </div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>

          <div className="mb-16 max-w-5xl mx-auto">
            <p className="text-2xl md:text-4xl text-muted-foreground mb-8 leading-relaxed font-light">
              Embark on <span className="text-accent font-semibold">legendary adventures</span> across India&apos;s most
              mystical destinations.
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground/80 leading-relaxed">
              <span className="text-primary font-semibold">Stake your ETH</span> •
              <span className="text-accent font-semibold"> Reach your destination</span> •
              <span className="text-neon font-semibold"> Claim epic rewards</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
            <Link href="/explore">
              <Button
                size="lg"
                className="glass-card neon-border hover:neon-glow transition-all duration-500 text-xl px-12 py-6 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <Zap className="mr-3 h-6 w-6 relative z-10" />
                <span className="relative z-10">Begin Adventure</span>
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="glass-card border-primary/50 hover:border-primary hover:purple-glow transition-all duration-500 text-xl px-12 py-6 bg-transparent group"
            >
              <Globe className="mr-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
              Explore Destinations
            </Button>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center text-muted-foreground/60">
              <span className="text-sm mb-2">Discover More</span>
              <ArrowDown className="h-5 w-5" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
