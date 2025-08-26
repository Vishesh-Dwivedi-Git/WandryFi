"use client"

export default function LeaderboardPage() {
  const leaderboardData = [
    { rank: 1, address: "0x789...def", score: 2450, badge: "🏆" },
    { rank: 2, address: "0x456...ghi", score: 2100, badge: "🥈" },
    { rank: 3, address: "0x123...abc", score: 1850, badge: "🥉" },
    { rank: 4, address: "0x321...jkl", score: 1600, badge: "" },
    { rank: 5, address: "0x654...mno", score: 1400, badge: "" },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-pixel text-3xl text-neon-cyan mb-8 text-center">Leaderboard</h1>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border">
            <div className="grid grid-cols-4 gap-4 font-pixel text-sm text-muted-foreground">
              <div>Rank</div>
              <div>Explorer</div>
              <div>Score</div>
              <div>Badge</div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {leaderboardData.map((player) => (
              <div key={player.rank} className="px-6 py-4 hover:bg-muted/30 transition-colors duration-200">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-pixel text-lg">
                    <span className={player.rank <= 3 ? "text-neon-gold" : "text-foreground"}>#{player.rank}</span>
                  </div>
                  <div className="font-mono text-sm text-muted-foreground">{player.address}</div>
                  <div className="font-pixel text-neon-cyan">{player.score.toLocaleString()} WNDR</div>
                  <div className="text-2xl">{player.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
