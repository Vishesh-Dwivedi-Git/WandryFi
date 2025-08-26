// components/ScrollContent.tsx
"use client"

import { Scroll } from "@react-three/drei"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ScrollContent() {
  return (
    <Scroll html>
      <div className="pointer-events-none absolute inset-0">
        {/* Top-right stats HUD */}
        <div className="pointer-events-auto absolute right-6 top-6 flex flex-col items-end gap-2">
          <div className="rounded-2xl bg-black/40 px-4 py-2 text-sm text-white backdrop-blur">
            <span className="opacity-80">Active Explorers:</span>{" "}
            <strong>1,247</strong>
          </div>
          <div className="rounded-2xl bg-black/40 px-4 py-2 text-sm text-white backdrop-blur">
            <span className="opacity-80">ETH Staked:</span>{" "}
            <strong>847</strong>
          </div>
        </div>

        {/* Mid-page tagline */}
        <div className="pointer-events-auto absolute left-1/2 top-[120vh] w-[min(92vw,900px)] -translate-x-1/2 text-center text-white">
          <h2 className="mb-3 text-4xl font-bold md:text-6xl">Chart your orbit.</h2>
          <p className="mx-auto max-w-2xl text-lg opacity-80">
            Stake on destinations, race the clock, and earn cosmic rewards. Miss your mark, and your stake
            fuels the explorer pool.
          </p>
        </div>

        {/* Bottom page CTA above Earth */}
        <div className="pointer-events-auto absolute bottom-20 left-1/2 w-[min(92vw,900px)] -translate-x-1/2 text-center text-white">
          <h3 className="mb-4 text-3xl font-semibold md:text-5xl">
            Ready for your <span className="text-accent">adventure?</span>
          </h3>
          <Link href="/explore">
            <Button size="lg" className="sketch-border bg-accent text-accent-foreground hover:bg-accent/90">
              Begin Exploration
            </Button>
          </Link>
        </div>
      </div>
    </Scroll>
  )
}