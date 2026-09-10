import { MasteryStat, UserProfile } from "./types";
import { BADGES } from "@/data/badges";
import { MODULES } from "@/data/modules";
import { EXERCISES } from "@/data/exercises";
import { bumpMastery, emptyMastery, resolveTopics } from "./adaptive";
import { commitSessionMeta } from "./sessionSeed";

const KEY = "breachgym_profile_v1";

export function defaultProfile(name = "Associate"): UserProfile {
  const today = todayKey();
  return {
    name,
    startedAt: new Date().toISOString(),
    xp: 0,
    streak: 0,
    lastActiveDate: "",
    dailyGoal: 50,
    dailyXp: 0,
    dailyXpDate: today,
    completedLessons: [],
    completedItems: [],
    completedExercises: [],
    badges: [],
    attemptsByTopic: {},
    attemptsByState: {},
    itemMastery: {},
    topicMastery: {},
    stateMastery: {},
    totalCorrect: 0,
    totalAttempts: 0,
    adaptiveSessionsCompleted: 0,
    lastSessionSeeds: [],
    seenFingerprints: [],
  };
}

export function todayKey(): string {
  // User lives in America/New_York
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function yesterdayKey(): string {
  const d = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const day = Number(parts.find((p) => p.type === "day")!.value);
  const noonUtcGuess = new Date(Date.UTC(y, m - 1, day, 17, 0, 0)); // ~ET midday
  noonUtcGuess.setUTCDate(noonUtcGuess.getUTCDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(noonUtcGuess);
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return normalizeProfile(parsed);
  } catch {
    return null;
  }
}

function normalizeProfile(p: UserProfile): UserProfile {
  const today = todayKey();
  if (p.dailyXpDate !== today) {
    p.dailyXp = 0;
    p.dailyXpDate = today;
  }
  p.itemMastery = p.itemMastery || {};
  p.topicMastery = p.topicMastery || {};
  p.stateMastery = p.stateMastery || {};
  p.adaptiveSessionsCompleted = p.adaptiveSessionsCompleted || 0;
  p.attemptsByTopic = p.attemptsByTopic || {};
  p.attemptsByState = p.attemptsByState || {};
  p.lastSessionSeeds = p.lastSessionSeeds || [];
  p.seenFingerprints = p.seenFingerprints || [];
  return p;
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function touchStreak(profile: UserProfile): UserProfile {
  const today = todayKey();
  const yday = yesterdayKey();
  if (profile.lastActiveDate === today) return profile;
  if (profile.lastActiveDate === yday) {
    profile.streak = (profile.streak || 0) + 1;
  } else if (!profile.lastActiveDate) {
    profile.streak = 1;
  } else {
    profile.streak = 1;
  }
  profile.lastActiveDate = today;
  return profile;
}

export function addXp(profile: UserProfile, amount: number): UserProfile {
  profile = touchStreak({ ...profile });
  const today = todayKey();
  if (profile.dailyXpDate !== today) {
    profile.dailyXp = 0;
    profile.dailyXpDate = today;
  }
  profile.xp += amount;
  profile.dailyXp += amount;
  return evaluateBadges(profile);
}

export type AttemptOpts = {
  correct: boolean;
  topic?: string;
  topics?: string[];
  states?: string[];
  itemId?: string;
};

export function recordAttempt(profile: UserProfile, opts: AttemptOpts): UserProfile {
  const next = normalizeProfile({ ...profile });
  next.totalAttempts += 1;
  if (opts.correct) next.totalCorrect += 1;

  const fineTopics = resolveTopics({
    topic: opts.topic,
    topics: opts.topics,
    id: opts.itemId,
  });

  // Legacy coarse topic counters (badges)
  const coarseList = [opts.topic, ...fineTopics].filter(Boolean) as string[];
  const uniqueTopics = Array.from(new Set(coarseList));
  for (const topic of uniqueTopics) {
    const t = next.attemptsByTopic[topic] || { correct: 0, total: 0 };
    t.total += 1;
    if (opts.correct) t.correct += 1;
    next.attemptsByTopic = { ...next.attemptsByTopic, [topic]: { ...t } };
  }

  if (opts.states) {
    const map = { ...next.attemptsByState };
    for (const s of opts.states) {
      const st = map[s] || { correct: 0, total: 0 };
      st.total += 1;
      if (opts.correct) st.correct += 1;
      map[s] = st;
    }
    next.attemptsByState = map;
  }

  // Adaptive mastery maps
  if (opts.itemId) {
    next.itemMastery = {
      ...next.itemMastery,
      [opts.itemId]: bumpMastery(next.itemMastery[opts.itemId], opts.correct),
    };
  }
  const topicMastery: Record<string, MasteryStat> = { ...next.topicMastery };
  for (const t of fineTopics) {
    topicMastery[t] = bumpMastery(topicMastery[t], opts.correct);
  }
  next.topicMastery = topicMastery;

  if (opts.states?.length) {
    const stateMastery: Record<string, MasteryStat> = { ...next.stateMastery };
    for (const s of opts.states) {
      stateMastery[s] = bumpMastery(stateMastery[s], opts.correct);
    }
    next.stateMastery = stateMastery;
  }

  return evaluateBadges(next);
}

/** Apply several row/state attempts in one persist pass (exercise matrices). */
export function recordAttempts(profile: UserProfile, rows: AttemptOpts[]): UserProfile {
  let next = profile;
  for (const opts of rows) {
    next = recordAttempt(next, opts);
  }
  return next;
}

export function markAdaptiveSessionComplete(profile: UserProfile): UserProfile {
  return evaluateBadges({
    ...profile,
    adaptiveSessionsCompleted: (profile.adaptiveSessionsCompleted || 0) + 1,
  });
}

/** Persist session seed + item fingerprints after building a fresh Adaptive / Practice set. */
export function recordSessionFreshness(
  profile: UserProfile,
  seed: string,
  fingerprints: string[]
): UserProfile {
  return normalizeProfile(commitSessionMeta(profile, seed, fingerprints));
}


export function markItemComplete(profile: UserProfile, itemId: string): UserProfile {
  if (profile.completedItems.includes(itemId)) return profile;
  return {
    ...profile,
    completedItems: [...profile.completedItems, itemId],
  };
}

export function markLessonComplete(profile: UserProfile, moduleId: string): UserProfile {
  if (profile.completedLessons.includes(moduleId)) return evaluateBadges(profile);
  return evaluateBadges({
    ...profile,
    completedLessons: [...profile.completedLessons, moduleId],
  });
}

export function markExerciseComplete(
  profile: UserProfile,
  exerciseId: string
): UserProfile {
  if (profile.completedExercises.includes(exerciseId)) return evaluateBadges(profile);
  return evaluateBadges({
    ...profile,
    completedExercises: [...profile.completedExercises, exerciseId],
  });
}

function unlock(profile: UserProfile, id: string): UserProfile {
  if (profile.badges.includes(id)) return profile;
  return { ...profile, badges: [...profile.badges, id] };
}

export function evaluateBadges(profile: UserProfile): UserProfile {
  let p = { ...profile, badges: [...profile.badges] };

  if (p.completedLessons.includes("foundations")) p = unlock(p, "first-steps");
  if (p.completedLessons.includes("capstone")) p = unlock(p, "capstone-counsel");
  if (p.completedExercises.includes("multi-state-matrix"))
    p = unlock(p, "multi-state-ranger");
  if (p.completedLessons.includes("multi-state")) p = unlock(p, "fifty-state-scout");
  {
    const seamIds = [
      "public-bucket-risk-seam",
      "credential-only-dump",
      "timeline-race-day25",
      "ag-threshold-trap",
      "sequencing-md-nj",
      "sticky-note-harbor",
    ];
    if (seamIds.filter((id) => p.completedExercises.includes(id)).length >= 4)
      p = unlock(p, "seam-surgeon");
  }
  if (p.completedExercises.includes("acquisition-snooping"))
    p = unlock(p, "employee-vs-external");
  if (p.completedExercises.includes("encrypted-laptop") || p.completedExercises.includes("capstone-mixed"))
    p = unlock(p, "safe-harbor-scout");
  if (p.completedExercises.includes("pi-field-matrix") && p.completedLessons.includes("personal-information")) {
    const pi =
      p.attemptsByTopic["personal-information"] || p.attemptsByTopic["pi-definition"];
    if (pi && pi.total >= 5 && pi.correct / pi.total >= 0.8) p = unlock(p, "pi-spotter");
  }
  if (p.completedExercises.includes("risk-harm-email") && p.completedLessons.includes("risk-of-harm")) {
    p = unlock(p, "risk-analyst");
  }
  if (p.completedLessons.includes("timing-recipients")) {
    const t = p.attemptsByTopic["timing"] || p.attemptsByTopic["timing-discovery"];
    if (t && t.total >= 4 && t.correct / t.total >= 0.75) p = unlock(p, "timeline-tamer");
    else p = unlock(p, "timeline-tamer");
  }
  if (p.streak >= 3) p = unlock(p, "streak-3");
  if (p.streak >= 7) p = unlock(p, "streak-7");
  if (p.xp >= 500) p = unlock(p, "xp-500");
  if (p.xp >= 1000) p = unlock(p, "xp-1000");
  if (p.totalAttempts >= 20 && p.totalCorrect / p.totalAttempts >= 0.85)
    p = unlock(p, "accuracy-ace");
  if ((p.adaptiveSessionsCompleted || 0) >= 3) p = unlock(p, "adaptive-grinder");

  const narrativeIds = MODULES.flatMap((m) =>
    m.lessonItems.filter((i) => i.type === "narrative").map((i) => i.id)
  );
  if (narrativeIds.length && narrativeIds.every((id) => p.completedItems.includes(id)))
    p = unlock(p, "narrative-nerd");

  void BADGES.length;
  void EXERCISES.length;
  void emptyMastery;

  return p;
}

export function newlyUnlockedBadges(
  before: string[],
  after: string[]
): string[] {
  return after.filter((id) => !before.includes(id));
}
