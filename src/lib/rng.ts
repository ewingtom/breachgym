/**
 * Seeded PRNG helpers for deterministic-but-fresh session shuffles.
 * Mulberry32 — tiny, good enough for UI ordering (not crypto).
 */

export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFromSeedString(seed: string): Rng {
  return mulberry32(hashString(seed) || 1);
}

/** Fisher–Yates shuffle using provided RNG (mutates a copy). */
export function seededShuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickOne<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

export function pickN<T>(arr: T[], n: number, rng: Rng): T[] {
  return seededShuffle(arr, rng).slice(0, Math.min(n, arr.length));
}

/** Weighted pick — weights must be >= 0; falls back to uniform if all zero. */
export function weightedPick<T>(items: T[], weights: number[], rng: Rng): T {
  const n = Math.min(items.length, weights.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.max(0, weights[i]);
  if (sum <= 0) return pickOne(items.slice(0, n), rng);
  let r = rng() * sum;
  for (let i = 0; i < n; i++) {
    r -= Math.max(0, weights[i]);
    if (r <= 0) return items[i];
  }
  return items[n - 1];
}
