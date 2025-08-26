"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useWanderfy } from "@/contexts/wanderify-context"

interface NavigationViewProps {
  onClose: () => void
}

export default function NavigationView({ onClose }: NavigationViewProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(true)
  const { activeQuests, completeQuest } = useWanderfy()

  useEffect(() => {
    // Simulate arrival at destination after 3 seconds
    const timer = setTimeout(() => {
      setPulseAnimation(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleCheckIn = () => {
    setIsCheckedIn(true)

    // Find the ready quest and complete it
    const readyQuest = activeQuests.find((q) => q.status === "ready-for-checkin")
    if (readyQuest) {
      completeQuest(readyQuest.id)
    }

    // Simulate check-in process
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation Map */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-neon-cyan) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-neon-cyan) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        ></div>

        {/* Ambient Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-neon-magenta/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* User Avatar (Center) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Avatar Glow */}
            <div className="absolute inset-0 w-16 h-16 bg-neon-cyan rounded-full animate-ping opacity-50"></div>

            {/* Avatar */}
            <div className="relative w-16 h-16 bg-card border-2 border-neon-cyan rounded-lg overflow-hidden glow-cyan">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                {/* Pixel art user avatar */}
                <rect x="0" y="0" width="64" height="64" fill="currentColor" className="text-background" />
                <rect x="16" y="16" width="32" height="32" fill="currentColor" className="text-neon-cyan" />
                <rect x="20" y="20" width="8" height="8" fill="currentColor" className="text-background" />
                <rect x="36" y="20" width="8" height="8" fill="currentColor" className="text-background" />
                <rect x="24" y="32" width="16" height="4" fill="currentColor" className="text-background" />
                <rect x="12" y="12" width="4" height="4" fill="currentColor" className="text-neon-gold" />
                <rect x="48" y="12" width="4" height="4" fill="currentColor" className="text-neon-gold" />
                <rect x="12" y="48" width="4" height="4" fill="currentColor" className="text-neon-magenta" />
                <rect x="48" y="48" width="4" height="4" fill="currentColor" className="text-neon-magenta" />
              </svg>
            </div>

            {/* Direction Indicator */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="font-pixel text-xs text-neon-cyan">YOU</div>
            </div>
          </div>
        </div>

        {/* Destination Point */}
        <div className="absolute top-1/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Destination Pulse */}
            <div
              className={`absolute inset-0 w-12 h-12 bg-neon-magenta rounded-full ${
                pulseAnimation ? "animate-ping" : "animate-pulse-glow"
              } opacity-75`}
            ></div>

            {/* Destination Circle */}
            <div className="relative w-12 h-12 bg-neon-magenta rounded-full border-2 border-background flex items-center justify-center glow-magenta">
              <div className="w-4 h-4 bg-background rounded-full"></div>
            </div>

            {/* Destination Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="font-pixel text-xs text-neon-magenta">DESTINATION</div>
            </div>
          </div>
        </div>

        {/* Navigation Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-neon-cyan)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-neon-magenta)" stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Animated Navigation Line */}
          <line
            x1="50%"
            y1="50%"
            x2="66.66%"
            y2="25%"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeDasharray="10,5"
            filter="url(#glow)"
            className="animate-pulse"
          >
            <animate attributeName="stroke-dashoffset" values="0;-15" dur="2s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Distance and Direction Info */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-6 py-3">
            <div className="text-center">
              <div className="font-pixel text-lg text-neon-cyan mb-1">Crystal Caves</div>
              <div className="text-sm text-muted-foreground">Distance: 2.3 km • Direction: NE</div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            {!isCheckedIn ? (
              <div className="font-pixel text-sm text-neon-gold animate-pulse">
                {pulseAnimation ? "Navigating to destination..." : "Destination reached!"}
              </div>
            ) : (
              <div className="font-pixel text-sm text-green-400">Check-in successful! Quest completed!</div>
            )}
          </div>
        </div>

        {/* Check-in Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={handleCheckIn}
            disabled={pulseAnimation || isCheckedIn}
            className={`font-pixel text-xl px-12 py-6 transition-all duration-300 ${
              pulseAnimation
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : isCheckedIn
                  ? "bg-green-500 text-background"
                  : "bg-neon-magenta text-background hover:bg-neon-magenta/90 glow-magenta hover:scale-105"
            }`}
          >
            {isCheckedIn ? "CHECKED IN ✓" : pulseAnimation ? "APPROACHING..." : "CHECK-IN"}
          </Button>
        </div>

        {/* Compass Rose */}
        <div className="absolute top-8 right-8">
          <div className="w-16 h-16 opacity-50">
            <svg viewBox="0 0 64 64" className="w-full h-full text-neon-cyan animate-rotate-slow">
              <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="32,8 36,20 32,18 28,20" fill="currentColor" />
              <polygon points="32,56 36,44 32,46 28,44" fill="currentColor" />
              <polygon points="56,32 44,28 46,32 44,36" fill="currentColor" />
              <polygon points="8,32 20,28 18,32 20,36" fill="currentColor" />
              <circle cx="32" cy="32" r="3" fill="currentColor" />
              <text x="32" y="14" textAnchor="middle" className="text-xs font-pixel" fill="currentColor">
                N
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
