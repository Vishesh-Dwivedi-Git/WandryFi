"use client";

import { cn } from "@/lib/utils";
import type { PageType } from "@/components/main-app";
import ConnectWalletButton from "@/components/wallet/connect-button";

interface NavbarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export default function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const navItems: { id: PageType; label: string }[] = [
    { id: "explore", label: "EXPLORE" },
    { id: "leaderboard", label: "LEADERBOARD" },
    { id: "my-travel", label: "MY TRAVEL" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-4 sm:p-6">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <div className="bg-[#0a0a0a]/60 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-full px-6 sm:px-8 h-16 sm:h-20 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-300 hover:border-neon-cyan/30">

          {/* Gloss Sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />

          {/* Logo Section */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neon-cyan/10 border border-neon-cyan/50 rounded-lg flex items-center justify-center relative overflow-hidden group/logo">
              <div className="absolute inset-0 bg-neon-cyan/20 translate-y-full group-hover/logo:translate-y-0 transition-transform duration-300" />
              <span className="font-pixel text-lg sm:text-xl text-neon-cyan">W</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif text-lg text-white leading-none tracking-tight">Wanderipy</h1>
              <div className="text-[8px] font-mono text-neon-cyan tracking-[0.3em] opacity-70">SYSTEM_ONLINE</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2 bg-black/20 rounded-full p-1 border border-white/5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-mono tracking-widest transition-all duration-300 relative overflow-hidden group/btn",
                  currentPage === item.id
                    ? "text-black font-bold bg-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="relative z-10 flex items-center gap-2">
                  <span>{item.label}</span>
                  {currentPage === item.id && <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
                </div>
              </button>
            ))}
          </div>

          {/* User / Wallet */}
          <div className="flex items-center gap-4 relative z-10">
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden relative z-10">
            <button className="text-white hover:text-neon-cyan p-2 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay (Simple for now) */}
      <div className="md:hidden mt-2 flex justify-center pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "p-3 rounded-xl transition-all",
                currentPage === item.id ? "bg-neon-cyan/20 text-neon-cyan" : "text-gray-400"
              )}
            >
              {item.label.charAt(0)}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
