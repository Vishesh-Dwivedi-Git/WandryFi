import { WalletConnect } from "@/components/wallet-connect";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <MapPin className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">WANDRIFY</h1>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/explore"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/stake"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Stake
          </Link>
          <Link
            href="/leaderboard"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Leaderboard
          </Link>
        </nav>
        <WalletConnect />
      </div>
    </header>
  );
}
