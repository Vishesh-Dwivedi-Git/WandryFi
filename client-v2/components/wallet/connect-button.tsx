"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncate(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    // Prefer MetaMask over other injected wallets for stability
    const connector =
      connectors.find((c) => c.id === "io.metamask") ||
      connectors.find((c) => c.id === "injected") ||
      connectors[0];

    try {
      await connect({ connector });
    } catch (err: unknown) {
      console.error("Wallet connection error:", err);
      setError("Connection failed. Try using MetaMask or refresh the page.");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          className="font-pixel text-base px-6 py-2 bg-neon-cyan text-background hover:bg-neon-cyan/90 border-2 border-neon-cyan glow-cyan hover:glow-cyan transition-all duration-300 transform hover:scale-105 rounded-md"
          onClick={handleConnect}
          disabled={isPending}
        >
          {isPending ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && (
          <span className="text-xs text-red-400 max-w-[200px] text-right">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-neon-cyan">
        {truncate(address)}
      </span>
      <button
        className="font-pixel text-xs px-3 py-1 bg-transparent text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/10 rounded-md"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
