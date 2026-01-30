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
    { id: "explore", label: "Explore" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "my-travel", label: "My Travel" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center mix-blend-difference text-gray-300">
      <div className="flex gap-8 text-xs font-mono tracking-widest text-gray-500 hidden md:flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "hover:text-white cursor-pointer transition-colors uppercase",
              currentPage === item.id ? "text-white" : ""
            )}
          >
            {currentPage === item.id ? `[ ${item.label} ]` : `// ${item.label}`}
          </button>
        ))}
      </div>

      <div className="font-sans font-bold text-xl tracking-tighter flex items-center gap-2">
        <span className="text-white">Wanderify</span><span className="text-gray-600">Network.</span>
      </div>

      <div className="flex items-center space-x-4">
        <ConnectWalletButton />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 p-4 flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "text-xs font-mono uppercase tracking-widest",
              currentPage === item.id ? "text-white" : "text-gray-600"
            )}
          >
            {currentPage === item.id ? `[${item.label}]` : item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
