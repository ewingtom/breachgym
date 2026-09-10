import { TOPIC_IDS } from "@/lib/topics";
import { UserProfile } from "@/lib/types";

export type DifficultyLevel = "novice" | "working" | "advanced" | "seam-surgeon";

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  novice: "Novice",
  working: "Working",
  advanced: "Advanced",
  "seam-surgeon": "Seam-surgeon",
};

function hasHistory(profile: UserProfile): boolean {
  const items = Object.values(profile.itemMastery || {});
  const topics = Object.values(profile.topicMastery || {});
  return (
    items.some((s) => s.correct + s.incorrect > 0) ||
    topics.some((s) => s.correct + s.incorrect > 0) ||
    profile.totalAttempts > 0
  );
}

/**
 * Derive session difficulty from topic/state mastery + volume.
 * Higher → multi-state seams, sequencing traps, clock races, AG threshold traps.
 * Lower → single-concept with clearer stems.
 */
export function deriveDifficulty(profile: UserProfile): DifficultyLevel {
  if (!hasHistory(profile) && profile.totalAttempts < 4) {
    // Cold start still lands on Working — Adaptive already seeds hard; novice is for early weak mastery.
    return "working";
  }

  const topicStats = TOPIC_IDS.map((t) => profile.topicMastery?.[t]).filter(Boolean);
  const stateStats = Object.values(profile.stateMastery || {});
  const all = [...topicStats, ...stateStats];

  if (!all.length) return "working";

  const avgMastery =
    all.reduce((s, st) => s + (st?.mastery ?? 50), 0) / Math.max(1, all.length);
  const weakCount = all.filter((st) => (st?.mastery ?? 50) < 65).length;
  const strongCount = all.filter((st) => (st?.mastery ?? 50) >= 80).length;
  const sessions = profile.adaptiveSessionsCompleted || 0;
  const attempts = profile.totalAttempts || 0;

  if (avgMastery < 52 || (weakCount >= 4 && avgMastery < 60)) {
    return "novice";
  }
  if (avgMastery >= 82 && strongCount >= 5 && sessions >= 3 && attempts >= 30) {
    return "seam-surgeon";
  }
  if (avgMastery >= 70 && (sessions >= 2 || attempts >= 18)) {
    return "advanced";
  }
  return "working";
}

export function difficultyXpMultiplier(level: DifficultyLevel): number {
  switch (level) {
    case "novice":
      return 0.9;
    case "working":
      return 1;
    case "advanced":
      return 1.15;
    case "seam-surgeon":
      return 1.3;
  }
}
