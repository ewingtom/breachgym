import { hashString } from "@/lib/rng";
import { UserProfile } from "@/lib/types";

export const MAX_SESSION_SEEDS = 12;
export const MAX_SEEN_FINGERPRINTS = 180;

/** Unique per Adaptive / Practice visit: timestamp + profile name hash. */
export function createSessionSeed(profileName: string, atMs = Date.now()): string {
  const nameHash = hashString(profileName || "Associate").toString(16);
  return `s${atMs.toString(36)}-${nameHash}`;
}

export function fingerprintPayload(parts: (string | number | undefined | null)[]): string {
  const raw = parts
    .map((p) => (p == null ? "" : String(p)))
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return `fp${hashString(raw).toString(16)}`;
}

export function rememberSessionSeed(
  profile: UserProfile,
  seed: string
): UserProfile {
  const prev = profile.lastSessionSeeds || [];
  const next = [seed, ...prev.filter((s) => s !== seed)].slice(0, MAX_SESSION_SEEDS);
  return { ...profile, lastSessionSeeds: next };
}

export function rememberFingerprints(
  profile: UserProfile,
  fingerprints: string[]
): UserProfile {
  if (!fingerprints.length) return profile;
  const prev = profile.seenFingerprints || [];
  const merged = [...fingerprints, ...prev.filter((f) => !fingerprints.includes(f))];
  return {
    ...profile,
    seenFingerprints: merged.slice(0, MAX_SEEN_FINGERPRINTS),
  };
}

export function isRecentlySeen(
  profile: UserProfile | null | undefined,
  fingerprint: string
): boolean {
  if (!profile?.seenFingerprints?.length) return false;
  return profile.seenFingerprints.includes(fingerprint);
}

/** Persist seed + fingerprints for a freshly built session. */
export function commitSessionMeta(
  profile: UserProfile,
  seed: string,
  fingerprints: string[]
): UserProfile {
  return rememberFingerprints(rememberSessionSeed(profile, seed), fingerprints);
}
