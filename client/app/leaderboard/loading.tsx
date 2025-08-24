export default function Loading() {
  return (
    <div className="min-h-screen bg-background ancient-texture flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Hall of Legends...</p>
      </div>
    </div>
  )
}
