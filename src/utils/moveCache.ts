// Simple cache for storing evaluated positions
const positionCache = new Map<string, number>();

export function getCachedEvaluation(fen: string): number | undefined {
  return positionCache.get(fen);
}

export function cacheEvaluation(fen: string, score: number): void {
  // Limit cache size to prevent memory issues
  if (positionCache.size > 10000) {
    // Clear half of the cache when it gets too large
    const entries = Array.from(positionCache.entries());
    entries.slice(5000).forEach(([key]) => positionCache.delete(key));
  }
  positionCache.set(fen, score);
}