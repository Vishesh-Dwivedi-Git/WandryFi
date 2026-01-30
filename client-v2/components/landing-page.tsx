"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { createTimeline, stagger } from "animejs";
import HeroGlobe from "@/components/hero-globe";
import BracketButton from "@/components/ui/bracket-button";
import { ArrowRight, Terminal } from "lucide-react";

interface LandingPageProps {
  onConnect: () => void;
}

export default function LandingPage({ onConnect }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  // Animation refs
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Anime.js entry animation for technical lines
    const timeline = createTimeline({
      defaults: {
        ease: 'easeOutExpo',
        duration: 2000,
      }
    });

    timeline
      .add('.tech-line', {
        width: ['0%', '100%'],
        opacity: [0, 0.3],
        delay: stagger(200, { start: 500 }),
      })
      .add('.tech-number', {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(100),
      }, '-=1500');

  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-white selection:text-black overflow-x-hidden relative">

      {/* Background Grid - faint texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference"
      >
        <div className="flex gap-6 text-xs font-mono tracking-widest text-gray-500">
          <span className="hover:text-white cursor-pointer transition-colors">// DOCS</span>
          <span className="hover:text-white cursor-pointer transition-colors">// BLOG</span>
          <span className="hover:text-white cursor-pointer transition-colors">// DISCORD</span>
        </div>

        <div className="font-sans font-bold text-xl tracking-tighter flex items-center gap-2">
          <span className="text-white">Wanderify</span><span className="text-gray-600">Network.</span>
        </div>

        <div className="flex gap-4">
          <BracketButton variant="secondary" onClick={() => window.open('https://github.com', '_blank')}>
            open [GITHUB]
          </BracketButton>
          <BracketButton onClick={onConnect}>
            join [TESTNET]
          </BracketButton>
        </div>
      </motion.nav>

      {/* Main Hero Section */}
      <main className="relative z-10 pt-32 min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 relative z-20 space-y-12">

            {/* Number Indicator */}
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white/10 to-transparent select-none font-mono"
              >
                01
              </motion.div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] uppercase"
                >
                  Decentralized
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] uppercase text-gray-400"
                >
                  Edge Network
                </motion.h1>
              </div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="max-w-md text-gray-400 font-mono text-sm leading-relaxed border-l border-white/20 pl-6"
            >
              Optimized to facilitate the deployment and running of performant, geo-aware decentralized web and edge services.
              <br /><br />
              <span className="text-white/60">latency: 12ms // nodes: 4,204 // status: active</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap gap-4 pt-8"
            >
              <button
                className="group relative px-8 py-4 border border-white/20 hover:bg-white hover:text-black transition-all duration-300 text-xs font-mono tracking-widest uppercase overflow-hidden"
                onClick={onConnect}
              >
                <span className="relative z-10">Travel</span>
                <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out origin-left" />
              </button>

              <button
                className="px-8 py-4 bg-transparent border border-white/20 text-white/50 hover:text-white hover:border-white transition-all duration-300 text-xs font-mono tracking-widest uppercase"
              >
                Whitepaper
              </button>
            </motion.div>

          </div>

          {/* Right Column: Globe Visualization */}
          <div className="lg:col-span-5 h-[600px] relative flex items-center justify-center">

            {/* Technical Circles/Guides around globe */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] border border-white/5 rounded-full animate-pulse-slow" />
              <div className="w-[600px] h-[600px] border border-white/5 rounded-full" />
              <div className="absolute top-0 bottom-0 w-[1px] bg-white/5" />
              <div className="absolute left-0 right-0 h-[1px] bg-white/5" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full h-full relative z-10"
            >
              <HeroGlobe height={600} />
            </motion.div>
          </div>

        </div>

        {/* Bottom Technical Indicators */}
        <div className="absolute bottom-12 w-full px-12 hidden md:flex justify-between items-end pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent tech-line" />
            <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>

          <div className="font-mono text-[10px] text-gray-600 tracking-[0.2em] w-full text-center border-t border-white/5 py-4 mt-8">
              /// PHASE 3 PREVIEW, DETAILS AVAILABLE HERE //////// TESTNET PHASE 3 PREVIEW ////////
          </div>

          <div className="flex flex-col gap-2 items-end">
            <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent tech-line" />
            <span className="font-mono text-xs text-white/20">02</span>
          </div>
        </div>

      </main>

    </div>
  );
}

