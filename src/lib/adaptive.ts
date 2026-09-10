import { MODULES } from "@/data/modules";
import { EXERCISES } from "@/data/exercises";
import { COARSE_TOPIC_MAP, TOPIC_IDS, TopicId, labelForTopic } from "@/lib/topics";
import {
  AcquisitionExercise,
  Exercise,
  LessonItem,
  MasteryStat,
  McqItem,
  NotificationTriggerExercise,
  PiMatrixExercise,
  SafeHarborExercise,
  UserProfile,
} from "@/lib/types";
import { STATE_MAP } from "@/data/states";

export const DEFAULT_EASINESS = 2.5;
export const MIN_EASINESS = 1.3;

export function emptyMastery(now = new Date().toISOString()): MasteryStat {
  return {
    correct: 0,
    incorrect: 0,
    lastSeen: now,
    consecutiveWrong: 0,
    easiness: DEFAULT_EASINESS,
    mastery: 50,
  };
}

/** Derive fine topic tags for any lesson item or exercise. */
export function resolveTopics(opts: {
  topic?: string;
  topics?: string[];
  id?: string;
}): string[] {
  if (opts.topics && opts.topics.length) {
    return Array.from(new Set(opts.topics));
  }
  const coarse = opts.topic || "";
  const mapped = COARSE_TOPIC_MAP[coarse];
  if (mapped) return [...mapped];

  // Heuristic from item id for timing seams
  const id = (opts.id || "").toLowerCase();
  const tags: TopicId[] = [];
  if (/discovery|wa-|ny-|ca-30|ca-ag/.test(id)) tags.push("timing-discovery");
  if (/determin|fl-|tx-|co-/.test(id)) tags.push("timing-determination");
  if (/ag-|threshold/.test(id)) tags.push("ag-threshold");
  if (/seq|md-|nj-|nh-/.test(id)) tags.push("sequencing");
  if (/harbor|encrypt|key/.test(id)) tags.push("encryption-harbor");
  if (/risk|harm/.test(id)) tags.push("risk-of-harm");
  if (/pi-|cred|biometric/.test(id)) tags.push("pi-definition");
  if (/access|acqui|snoop|owner|maintain/.test(id)) {
    tags.push("access-vs-acquisition");
  }
  if (tags.length) return Array.from(new Set(tags));
  return coarse ? [coarse] : ["multi-state-matrix"];
}

export function itemTopics(item: LessonItem): string[] {
  return resolveTopics({ topic: item.topic, topics: item.topics, id: item.id });
}

/**
 * Canonical mastery / adaptive-card id for a lesson item.
 * Narrative quizzes and fill-blanks share the same id space as lessonToCards()
 * (`__quiz` / `__fb`) so lesson attempts space the same Adaptive Review cards.
 */
export function canonicalMasteryItemId(item: LessonItem): string {
  if (item.type === "narrative") return `${item.id}__quiz`;
  if (item.type === "fillblank") return `${item.id}__fb`;
  return item.id;
}

/** Update mastery after an attempt (SM-2-ish heuristic, client-side only). */
export function bumpMastery(stat: MasteryStat | undefined, correct: boolean): MasteryStat {
  const now = new Date().toISOString();
  const prev = stat || emptyMastery(now);
  const next: MasteryStat = { ...prev, lastSeen: now };
  if (correct) {
    next.correct += 1;
    next.consecutiveWrong = 0;
    next.easiness = Math.min(3.0, prev.easiness + 0.1);
  } else {
    next.incorrect += 1;
    next.consecutiveWrong = prev.consecutiveWrong + 1;
    next.easiness = Math.max(MIN_EASINESS, prev.easiness - 0.25 - 0.05 * prev.consecutiveWrong);
  }
  const total = next.correct + next.incorrect;
  const accuracy = total ? next.correct / total : 0.5;
  // Mastery: blend accuracy with easiness and punish consecutive misses
  const streakPenalty = Math.min(40, next.consecutiveWrong * 12);
  let mastery = Math.round(
    accuracy * 70 + ((next.easiness - MIN_EASINESS) / (3 - MIN_EASINESS)) * 30 - streakPenalty
  );
  // Soften early jump: a single correct (or single attempt) cannot exceed ~75
  if (total < 2) {
    mastery = Math.min(mastery, 75);
  }
  next.mastery = Math.max(0, Math.min(100, mastery));
  return next;
}

/** Higher = should surface sooner in Adaptive Review. */
export function reviewPriority(stat: MasteryStat | undefined, nowMs = Date.now()): number {
  if (!stat || stat.correct + stat.incorrect === 0) {
    // Untouched: moderate priority (cold-start sampler handles truly empty profiles)
    return 40;
  }
  const daysSince =
    (nowMs - new Date(stat.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
  const wrongBoost = stat.consecutiveWrong * 35 + stat.incorrect * 8;
  const masteryGap = (100 - stat.mastery) * 0.9;
  const spaced = Math.min(50, daysSince * (4.5 - Math.min(stat.easiness, 3)) * 4);
  return wrongBoost + masteryGap + spaced;
}

export type AdaptiveCard = McqItem & {
  /** Where the card came from for UI copy. */
  source: "lesson" | "drill-snippet" | "cold-start";
  moduleId?: string;
};

function lessonToCards(): AdaptiveCard[] {
  const cards: AdaptiveCard[] = [];
  for (const mod of MODULES) {
    for (const item of mod.lessonItems) {
      if (item.type === "mcq") {
        cards.push({
          ...item,
          topics: itemTopics(item),
          source: "lesson",
          moduleId: mod.id,
        });
      } else if (item.type === "narrative") {
        // Lift narrative quiz into an MCQ card for adaptive sessions
        cards.push({
          id: `${item.id}__quiz`,
          type: "mcq",
          question: `[Case file · ${item.title}] ${item.quiz.question}`,
          options: item.quiz.options,
          correctIndex: item.quiz.correctIndex,
          explanation: item.quiz.explanation,
          topic: item.topic,
          topics: itemTopics(item),
          states: "states" in item ? item.states : undefined,
          xp: Math.max(10, Math.floor(item.xp * 0.75)),
          source: "lesson",
          moduleId: mod.id,
        });
      } else if (item.type === "fillblank") {
        // Convert fill-blank into a recognition MCQ for adaptive workouts
        const joined = item.blanks.map((b) => b.answer).join(" / ");
        const distractors = [
          "public directory data only",
          "encrypted key material exclusively",
          "federal FOIA exemptions",
          "CRA substitute notice alone",
        ];
        const opts = shuffle([joined, ...distractors].slice(0, 4));
        cards.push({
          id: `${item.id}__fb`,
          type: "mcq",
          question: `${item.prompt} — complete: “${item.sentence}”`,
          options: opts,
          correctIndex: opts.indexOf(joined),
          explanation: item.explanation,
          topic: item.topic,
          topics: itemTopics(item),
          states: item.states,
          xp: item.xp,
          source: "lesson",
          moduleId: mod.id,
        });
      }
    }
  }
  return cards;
}

function baseDrillMeta(ex: Exercise) {
  return {
    topic: ex.topic,
    topics: resolveTopics({ topic: ex.topic, topics: ex.topics, id: ex.id }),
    source: "drill-snippet" as const,
    moduleId: ex.moduleId,
  };
}

function drillSnippets(): AdaptiveCard[] {
  const cards: AdaptiveCard[] = [];
  for (const ex of EXERCISES) {
    if (ex.type === "acquisition-analysis") {
      const a = ex as AcquisitionExercise;
      const meta = baseDrillMeta(a);
      cards.push({
        id: `ex-${a.id}`,
        type: "mcq",
        question: `[Drill] ${a.question}`,
        options: a.options,
        correctIndex: a.correctIndex,
        explanation: a.explanation,
        ...meta,
        xp: Math.floor(a.xp * 0.5),
      });
      if (a.followUp) {
        cards.push({
          id: `ex-${a.id}-fu`,
          type: "mcq",
          question: `[Drill follow-up] ${a.followUp.question}`,
          options: a.followUp.options,
          correctIndex: a.followUp.correctIndex,
          explanation: a.followUp.explanation,
          ...meta,
          xp: Math.floor(a.xp * 0.4),
        });
      }
    } else if (ex.type === "notification-trigger") {
      const n = ex as NotificationTriggerExercise;
      const meta = baseDrillMeta(n);
      const ctx = n.factPattern.slice(0, 180);
      for (const code of n.states) {
        const name = STATE_MAP[code]?.name || code;
        const notify = !!n.answers[code];
        cards.push({
          id: `ex-${n.id}:${code}`,
          type: "mcq",
          question: `[Drill · ${n.title}] For ${name} (${code}): Notify now, or investigate/document first? Context: ${ctx}`,
          options: [
            "Notify",
            "Investigate/document first (notice not automatic)",
          ],
          correctIndex: notify ? 0 : 1,
          explanation: n.explanations[code] || n.factPattern,
          ...meta,
          states: [code],
          xp: Math.max(8, Math.floor(n.xp / Math.max(4, n.states.length))),
        });
      }
    } else if (ex.type === "safe-harbor") {
      const h = ex as SafeHarborExercise;
      const meta = baseDrillMeta(h);
      const ctx = h.scenario.slice(0, 180);
      for (const code of h.states) {
        const name = STATE_MAP[code]?.name || code;
        const harbor = !!h.answers[code];
        cards.push({
          id: `ex-${h.id}:${code}`,
          type: "mcq",
          question: `[Drill · ${h.title}] Does encryption safe harbor likely apply in ${name} (${code})? Scenario: ${ctx}`,
          options: ["Harbor yes", "Harbor no / still in play"],
          correctIndex: harbor ? 0 : 1,
          explanation: h.explanations[code] || h.scenario,
          ...meta,
          states: [code],
          xp: Math.max(8, Math.floor(h.xp / Math.max(4, h.states.length))),
        });
      }
    } else if (ex.type === "pi-matrix") {
      const p = ex as PiMatrixExercise;
      const meta = baseDrillMeta(p);
      const fieldList = p.fields.map((f, i) => `${i}:${f}`).join("; ");
      for (const code of p.states) {
        const name = STATE_MAP[code]?.name || code;
        const triggers = p.triggers[code] || [];
        const fires = triggers.length > 0;
        cards.push({
          id: `ex-${p.id}:matrix:${code}`,
          type: "mcq",
          question: `[Drill · ${p.title}] On these facts, do ${name} (${code}) classic PI triggers clearly fire? Fields: ${fieldList}`,
          options: [
            "Yes — PI definition clearly fires",
            "No automatic fire / empty teaching key on these facts",
          ],
          correctIndex: fires ? 0 : 1,
          explanation: fires
            ? `Teaching key fields in play: ${triggers.map((i) => p.fields[i]).join(", ")}.`
            : "Teaching key: no automatic fire on these facts (hashes/credentials may still be fact-dependent).",
          ...meta,
          states: [code],
          xp: Math.max(8, Math.floor(p.xp / Math.max(6, p.states.length + p.analysisChoices.length))),
        });
      }
      for (const c of p.analysisChoices) {
        cards.push({
          id: `ex-${p.id}:analysis:${c.id}`,
          type: "mcq",
          question: `[Drill · ${p.title}] Is this analysis accurate? “${c.text}”`,
          options: ["Accurate", "Not accurate"],
          correctIndex: c.correct ? 0 : 1,
          explanation: c.explanation,
          ...meta,
          states: p.states,
          xp: Math.max(8, Math.floor(p.xp / Math.max(6, p.states.length + p.analysisChoices.length))),
        });
      }
    }
  }
  return cards;
}

let _pool: AdaptiveCard[] | null = null;
export function adaptivePool(): AdaptiveCard[] {
  if (!_pool) _pool = [...lessonToCards(), ...drillSnippets()];
  return _pool;
}

export function hasAdaptiveHistory(profile: UserProfile): boolean {
  const items = Object.values(profile.itemMastery || {});
  const topics = Object.values(profile.topicMastery || {});
  return (
    items.some((s) => s.correct + s.incorrect > 0) ||
    topics.some((s) => s.correct + s.incorrect > 0) ||
    profile.totalAttempts > 0
  );
}

export function weakTopics(
  profile: UserProfile,
  limit = 8
): { topic: string; label: string; mastery: number; priority: number }[] {
  const rows = TOPIC_IDS.map((topic) => {
    const stat = profile.topicMastery?.[topic];
    return {
      topic,
      label: labelForTopic(topic),
      mastery: stat?.mastery ?? 50,
      priority: reviewPriority(stat),
      attempts: (stat?.correct || 0) + (stat?.incorrect || 0),
    };
  })
    .filter((r) => r.attempts >= 1 && r.mastery < 80)
    .sort((a, b) => b.priority - a.priority || a.mastery - b.mastery);
  return rows.slice(0, limit);
}

export function weakStates(
  profile: UserProfile,
  limit = 8
): { code: string; mastery: number; priority: number }[] {
  return Object.entries(profile.stateMastery || {})
    .map(([code, stat]) => ({
      code,
      mastery: stat.mastery,
      priority: reviewPriority(stat),
      attempts: stat.correct + stat.incorrect,
    }))
    .filter((r) => r.attempts >= 1 && r.mastery < 80)
    .sort((a, b) => b.priority - a.priority || a.mastery - b.mastery)
    .slice(0, limit);
}

export type SessionFilter = {
  topics?: string[];
  states?: string[];
  size?: number;
};

/** Cold-start: hard multi-state / timing / PI sampler — not baby Foundations. */
function coldStartSampler(size: number): AdaptiveCard[] {
  const pool = adaptivePool().filter((c) => {
    const tags = c.topics || [];
    const hard =
      tags.includes("multi-state-matrix") ||
      tags.includes("ag-threshold") ||
      tags.includes("timing-discovery") ||
      tags.includes("timing-determination") ||
      tags.includes("sequencing") ||
      tags.includes("risk-of-harm") ||
      tags.includes("pi-definition") ||
      c.moduleId === "multi-state" ||
      c.moduleId === "timing-recipients" ||
      c.moduleId === "capstone";
    // Prefer scored MCQs over converted fill-blanks for cold start
    return hard && !c.id.endsWith("__fb");
  });
  return shuffle(pool).slice(0, size);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a short Adaptive Review / Weak Spot Workout session (5–8 items).
 * Wrong answers raise priority via mastery bumps recorded by the caller.
 */
export function buildAdaptiveSession(
  profile: UserProfile,
  filter: SessionFilter = {}
): { cards: AdaptiveCard[]; reason: string; coldStart: boolean } {
  const size = Math.min(8, Math.max(5, filter.size ?? 6));
  const pool = adaptivePool();

  if (!hasAdaptiveHistory(profile) && !filter.topics?.length && !filter.states?.length) {
    return {
      cards: coldStartSampler(size),
      reason:
        "No miss history yet — seeding a hard multi-state sampler (clocks, AG thresholds, risk seams, PI splits).",
      coldStart: true,
    };
  }

  const topicFilter = filter.topics?.map((t) => t.toLowerCase());
  const stateFilter = filter.states?.map((s) => s.toUpperCase());

  const ranked = pool
    .map((card) => {
      const tags = (card.topics || itemTopics(card)).map((t) => t.toLowerCase());
      const itemStat = profile.itemMastery?.[card.id];
      let score = reviewPriority(itemStat);

      // Boost by weak related topics
      for (const t of tags) {
        score += reviewPriority(profile.topicMastery?.[t]) * 0.35;
      }
      // Boost by weak related states
      for (const s of card.states || []) {
        score += reviewPriority(profile.stateMastery?.[s]) * 0.25;
      }

      if (topicFilter?.length) {
        const hit = tags.some((t) => topicFilter.includes(t));
        if (!hit) score = -1;
        else score += 80;
      }
      if (stateFilter?.length) {
        const hit = (card.states || []).some((s) => stateFilter.includes(s));
        if (!hit && topicFilter?.length) {
          /* keep topic filter */
        } else if (!hit) score = -1;
        else score += 60;
      }
      return { card, score };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score);

  // Take top candidates with light shuffle among near-peers to avoid identical sessions
  const top = ranked.slice(0, Math.min(ranked.length, size * 3));
  const picked = shuffle(top).sort((a, b) => b.score - a.score).slice(0, size);

  const weak = weakTopics(profile, 3).map((w) => w.label);
  const reason =
    topicFilter?.length || stateFilter?.length
      ? `Filtered workout focused on ${[
          ...(topicFilter || []).map(labelForTopic),
          ...(stateFilter || []),
        ].join(", ")}.`
      : weak.length
        ? `Based on your misses in ${weak.join(", ")} — surfacing weak topics/states first.`
        : "Spaced review of items with the lowest mastery / longest gap.";

  // Fallback if filters wiped the pool
  const cards =
    picked.length > 0
      ? picked.map((p) => p.card)
      : coldStartSampler(size);

  return { cards, reason, coldStart: false };
}

/** Optionally interleave 1–2 adaptive review cards into a module lesson. */
export function interleaveForModule(
  profile: UserProfile,
  moduleId: string,
  relatedTopics: string[]
): AdaptiveCard[] {
  if (!hasAdaptiveHistory(profile)) return [];
  const weak = relatedTopics.filter((t) => {
    const m = profile.topicMastery?.[t];
    return m && m.correct + m.incorrect >= 1 && (m.mastery < 75 || m.consecutiveWrong > 0);
  });
  if (!weak.length) return [];
  const { cards } = buildAdaptiveSession(profile, { topics: weak, size: 2 });
  return cards
    .filter((c) => c.moduleId !== moduleId) // don't repeat same module items mid-lesson
    .slice(0, 2)
    .map((c) => ({ ...c, source: "lesson" as const }));
}

export function moduleRelatedTopics(moduleId: string): string[] {
  const map: Record<string, string[]> = {
    foundations: ["access-vs-acquisition", "owner-maintainer", "multi-state-matrix"],
    "personal-information": ["pi-definition"],
    "risk-of-harm": ["risk-of-harm"],
    "safe-harbors": ["encryption-harbor"],
    "timing-recipients": [
      "timing-discovery",
      "timing-determination",
      "ag-threshold",
      "sequencing",
    ],
    "multi-state": ["multi-state-matrix", "risk-of-harm", "ag-threshold", "sequencing"],
    capstone: [
      "multi-state-matrix",
      "encryption-harbor",
      "pi-definition",
      "timing-discovery",
      "timing-determination",
    ],
  };
  return map[moduleId] || [];
}
