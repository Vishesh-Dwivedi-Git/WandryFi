"use client";

import GlobeShaderComponent from "@/components/globe-shader";
import { useEffect, useState } from "react";

interface LandingPageProps {
  onConnect: () => void;
}

// Technical UI Components
const CornerMarker = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" className={`absolute text-neon-cyan/40 ${className}`}>
    <path d="M2 2V8M2 2H8" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
);

const AudioVisualizer = () => (
  <div className="flex items-end gap-[2px] h-8 opacity-60">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-neon-cyan animate-audio-bar"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

const SyncStatus = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + Math.floor(Math.random() * 5)));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[9px] tracking-widest text-neon-cyan/80 flex items-center gap-2">
      <span className="animate-pulse">SYNC_NET...</span>
      <div className="w-16 h-1 bg-white/10 relative overflow-hidden">
        <div className="h-full bg-neon-cyan transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
      <span>{Math.min(100, progress)}%</span>
    </div>
  );
};

export default function LandingPage({ onConnect }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black relative flex flex-col overflow-hidden selection:bg-neon-cyan/30 font-sans">

      {/* 1. Cinematic Background & Volumetrics */}
      <div className="fixed inset-0 z-0 bg-[#030303]">
        <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-scanlines opacity-[0.08] pointer-events-none z-50" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] pointer-events-none opacity-90" />
        <div className="absolute top-[-10%] right-[10%] w-[60vw] h-[60vw] bg-neon-cyan/10 rounded-full blur-[150px] animate-pulse-glow opacity-50" />
      </div>

      {/* 2. 3D World Layer */}
      <div className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none">
        <div className="relative w-full h-[60vh] sm:h-[80vh] lg:h-[140vh] lg:w-[140vh] lg:-mr-[10vh] translate-x-[10%] lg:translate-x-[-15%] translate-y-[10vh] lg:translate-y-0 opacity-90 mix-blend-screen transition-transform duration-1000 ease-out">
          <GlobeShaderComponent />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,#030303_100%)] pointer-events-none" />
          {/* Scanner Line */}
          <div className="absolute inset-0 w-full h-[2px] bg-neon-cyan/30 blur-sm animate-[scanline-move_4s_linear_infinite] opacity-50 block lg:hidden" />
        </div>
      </div>

      {/* 3. Glass Interface Layer */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 mx-auto w-full pointer-events-none h-screen">
        <div className="max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center h-full">

          <div className="lg:col-span-7 xl:col-span-6 pointer-events-auto backdrop-blur-2xl backdrop-saturate-200 bg-black/60 border border-white/10 p-6 sm:p-12 lg:p-20 rounded-sm transform transition-all duration-700 hover:border-neon-cyan/30 group animate-fade-up shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">

            {/* Top Security Header */}
            <div className="flex justify-between items-start mb-16 border-b border-white/5 pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">
                  <div className="w-2 h-2 bg-neon-cyan rounded-sm animate-spin" />
                  <span>SECURE_LINK::ESTABLISHED</span>
                </div>
                <SyncStatus />
              </div>
              <AudioVisualizer />
            </div>

            {/* Typography */}
            <h1 className="font-serif text-white mb-6 leading-[0.85] tracking-tight text-[clamp(3.5rem,7vw,8.5rem)] mix-blend-normal drop-shadow-2xl relative z-10 group-hover:animate-pulse transition-all">
              <span className="block hover:text-neon-cyan transition-colors duration-300">Agentic</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 italic block transform translate-x-4">
                Systems_
              </span>
            </h1>

            <p className="font-mono text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mb-12 border-l-2 border-neon-cyan/50 pl-6 tracking-wide uppercase text-justify">
              &gt;&gt; Initializing autonomous protocols... <br />
              &gt;&gt; Neural architecture online. <br />
              &gt;&gt; Welcome to the post-human web.
            </p>

            {/* Gamified Button */}
            <button
              onClick={onConnect}
              className="relative w-full sm:w-auto px-12 py-6 bg-neon-cyan/5 hover:bg-neon-cyan/20 border border-neon-cyan/30 hover:border-neon-cyan text-neon-cyan font-mono text-xs tracking-[0.3em] uppercase transition-all duration-200 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-neon-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative z-10 flex items-center justify-between gap-8">
                <span className="group-hover:animate-glitch">ENTER_TERMINAL</span>
                <span className="w-2 h-2 bg-neon-cyan/50 group-hover:bg-neon-cyan animate-pulse" />
              </div>
            </button>

            {/* Corner Deco */}
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-neon-cyan">
                <path d="M0 0H40V40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* 4. HUD Layer */}
      <div className="fixed inset-0 z-50 pointer-events-none p-6 sm:p-12 mix-blend-difference text-white/70">
        <CornerMarker className="top-8 left-8" />
        <CornerMarker className="top-8 right-8 rotate-90" />
        <CornerMarker className="bottom-8 left-8 -rotate-90" />
        <CornerMarker className="bottom-8 right-8 rotate-180" />

        <div className="absolute bottom-10 left-0 w-full px-16 flex justify-between items-end font-mono text-[9px] tracking-[0.2em] opacity-80 hidden sm:flex">
          <div className="flex gap-16">
            <div className="opacity-50">
              <div className="mb-2">/// GRID_LOCKED</div>
              <div>40.7128 | 74.0060</div>
            </div>
            <div>
              <div className="mb-2 text-neon-cyan">FPS_OVERRIDE</div>
              <div>144.0 HZ</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-2 h-2 ${i > 2 ? 'bg-red-500' : 'bg-neon-cyan'} opacity-80`} />
              ))}
            </div>
            <div>MONAD_HACK // TERMINAL_V3</div>
          </div>
        </div>
      </div>

    </div>
  );
}
