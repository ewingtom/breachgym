/**
 * Procedural question factory — templates × jurisdictions × difficulty.
 * Static GitHub Pages friendly: no paid LLM. Optional aiGenerate stub behind a flag.
 */

import { STATES, STATE_MAP } from "@/data/states";
import {
  DifficultyLevel,
  deriveDifficulty,
  difficultyXpMultiplier,
} from "@/lib/difficulty";
import { pickN, pickOne, Rng, rngFromSeedString, seededShuffle, weightedPick } from "@/lib/rng";
import { fingerprintPayload, isRecentlySeen } from "@/lib/sessionSeed";
import { TopicId } from "@/lib/topics";
import {
  FillBlankItem,
  LessonItem,
  McqItem,
  StateCode,
  StateLaw,
  UserProfile,
} from "@/lib/types";

/** Feature flag — unused by default; stub for a future LLM hook. */
export const ENABLE_AI_GENERATE = false;

export type GeneratedMcq = McqItem & {
  source: "generated";
  fingerprint: string;
  moduleId?: string;
};

export type FactoryOpts = {
  seed: string;
  profile: UserProfile;
  size?: number;
  difficulty?: DifficultyLevel;
  /** Prefer these topics when generating (adaptive weakness). */
  preferTopics?: string[];
  /** Prefer these states (adaptive weakness). */
  preferStates?: string[];
  /** Hard topic filter if set. */
  topics?: string[];
  /** Hard state filter if set. */
  states?: string[];
};

type AgBucket = "none" | "no-floor" | "50" | "250" | "500" | "1000";

type ClockKind = "discovery" | "determination" | "expedient" | "mixed";

type SeqKind = "ag-before" | "police-before" | "ag-after" | "concurrent" | "none";

function classifyAg(s: StateLaw): AgBucket {
  const t = `${s.agThreshold} ${s.quirks.join(" ")}`.toLowerCase();
  if (
    /no (general |direct |mandatory )?ag|no ag notification|often no ag|no classic.*ag|no ag notice currently/.test(
      t
    ) &&
    !/whenever|no .*floor|no headcount|no resident headcount|no classic 500/.test(t)
  ) {
    if (/no (general |direct |mandatory )?ag|often no ag|no ag notification requirement/.test(t)) {
      return "none";
    }
  }
  if (
    /no (resident )?headcount|no .*floor|whenever|whenever (ct |nh |.*)?residents|whenever individual|when (ny |.*)?residents affected|whenever notice is required|commonly taught without a high headcount|no classic 500\+ private-sector/.test(
      t
    )
  ) {
    return "no-floor";
  }
  if (/\b50\b/.test(t) && /district|dc|oag/.test(t)) return "50";
  if (/250/.test(t)) return "250";
  if (/1,?000|1000/.test(t)) return "1000";
  if (/500/.test(t)) return "500";
  if (/whenever|no .*minimum|no .*floor/.test(t)) return "no-floor";
  return "none";
}

function classifyClock(s: StateLaw): { kind: ClockKind; days: number | null } {
  const t = s.individualTimeline.toLowerCase();
  const dayMatch = t.match(/(\d+)\s*(calendar\s*)?days?/);
  const days = dayMatch ? Number(dayMatch[1]) : null;
  const discovery = /discovery|discovered|after discovery/.test(t);
  const determination = /determination|after (a )?determination|determines? a (security )?breach/.test(
    t
  );
  if (discovery && !determination) return { kind: "discovery", days };
  if (determination && !discovery) return { kind: "determination", days };
  if (discovery && determination) return { kind: "mixed", days };
  if (days != null) return { kind: "expedient", days };
  return { kind: "expedient", days: null };
}

function classifySeq(s: StateLaw): SeqKind {
  const t = `${s.agThreshold} ${s.agTimeline} ${s.quirks.join(" ")}`.toLowerCase();
  if (s.code === "NJ" || /state police before|police before/.test(t)) {
    return "police-before";
  }
  if (
    s.code === "MD" ||
    s.code === "NH" ||
    /before notifying individuals|ag-before|prior to individual|ag (notice )?before individual|before individual notices/.test(
      t
    )
  ) {
    return "ag-before";
  }
  if (/after (giving )?consumer notice|after consumer|5 business days after/.test(t)) {
    return "ag-after";
  }
  if (/not later than the time notice|same time|concurrent|alongside/.test(t)) {
    return "concurrent";
  }
  return "none";
}

/** Parallel full-sentence AG teaching labels (similar length by design). */
const AG_LABEL: Record<AgBucket, string> = {
  none: "No general Attorney General notice is required under the core private-sector teaching for this state",
  "no-floor":
    "Attorney General notice is taught whenever residents are notified, with no resident headcount floor",
  "50": "Attorney General or OAG notice is commonly taught once about 50 or more residents are affected",
  "250": "Attorney General notice is commonly taught once about 250 or more residents are affected",
  "500": "Attorney General notice is commonly taught once about 500 or more residents are affected",
  "1000":
    "Attorney General notice is commonly taught once about 1,000 or more residents are affected",
};

const DISTRACTOR_PAD_PHRASES = [
  ", which is a common but incorrect training shortcut on multi-state drills",
  " under a single national rule that does not exist in BreachGym teaching",
  " without mapping each affected state's statute, clock, and regulator path",
  ", treating every jurisdiction as if it copied California's notice model",
  " even though the teaching chart requires a jurisdiction-specific analysis",
  ", collapsing distinct statutory families into one oversimplified answer",
  " while ignoring sequencing, thresholds, and clock-start differences across states",
  ", which would mishandle resident geography and Attorney General filing gates",
];

/**
 * Pad distractors so the correct answer is not systematically the longest.
 * Aims for a similar length band (roughly ±20%), and often makes one
 * plausible distractor slightly longer than the correct option.
 * No-ops for already-tight clusters (e.g. "30 days" / "45 days").
 */
export function balanceOptionLengths(
  options: string[],
  correctIndex: number,
  rng?: Rng
): string[] {
  if (options.length < 3 || correctIndex < 0 || correctIndex >= options.length) {
    return [...options];
  }
  const out = options.map((o) => o.trim());
  const rand: Rng = rng ?? (() => Math.random());
  const lengths = out.map((s) => s.length);
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);
  const mean = lengths.reduce((a, n) => a + n, 0) / lengths.length;
  const correctLen = lengths[correctIndex];

  // Short numeric / stub clusters are already length-fair (e.g. day counts).
  if (maxLen <= 28 && maxLen - minLen <= 10) {
    return out;
  }
  // Already balanced: correct not uniquely longest, and band is tight.
  const maxOther = Math.max(...lengths.filter((_, i) => i !== correctIndex));
  if (correctLen <= maxOther && maxLen - minLen <= Math.max(16, mean * 0.25)) {
    return out;
  }

  const distractorIndices = out
    .map((_, i) => i)
    .filter((i) => i !== correctIndex);

  const makeDistractorLonger = rand() < 0.55;
  const longIdx =
    distractorIndices[Math.floor(rand() * distractorIndices.length)];

  const targetBase = Math.max(
    48,
    Math.round(correctLen * 0.92),
    Math.round(mean * 1.05)
  );

  function padTo(text: string, target: number): string {
    let s = text;
    let guard = 0;
    while (s.length < target && guard < 10) {
      const phrase =
        DISTRACTOR_PAD_PHRASES[Math.floor(rand() * DISTRACTOR_PAD_PHRASES.length)];
      let next: string;
      if (s.endsWith(".")) {
        next = s.slice(0, -1) + phrase + ".";
      } else {
        next = s + phrase;
      }
      if (next === out[correctIndex] || out.includes(next)) {
        next = s + " in this multi-state fact pattern";
      }
      s = next;
      guard += 1;
    }
    return s;
  }

  for (const i of distractorIndices) {
    const target =
      makeDistractorLonger && i === longIdx
        ? Math.round(correctLen * (1.06 + rand() * 0.14))
        : Math.round(targetBase * (0.88 + rand() * 0.18));
    if (out[i].length < target * 0.85) {
      out[i] = padTo(out[i], target);
    }
  }

  // Final pass: correct must not remain uniquely longest by a wide margin.
  const refreshedOther = Math.max(
    ...out.map((s) => s.length).filter((_, i) => i !== correctIndex)
  );
  if (out[correctIndex].length > refreshedOther) {
    for (const i of distractorIndices) {
      const floor = Math.round(out[correctIndex].length * (0.95 + rand() * 0.12));
      if (out[i].length < floor) {
        out[i] = padTo(out[i], floor);
      }
    }
  }

  return out;
}

function stateWeight(code: string, profile: UserProfile, prefer: Set<string>): number {
  let w = 1;
  if (prefer.has(code)) w += 4;
  const st = profile.stateMastery?.[code];
  if (st) {
    const attempts = st.correct + st.incorrect;
    if (attempts > 0) {
      w += Math.max(0, (80 - st.mastery) / 20);
      w += st.consecutiveWrong * 0.8;
    }
  }
  return w;
}

function pickStates(
  rng: Rng,
  profile: UserProfile,
  preferStates: string[],
  n: number,
  filter?: (s: StateLaw) => boolean
): StateLaw[] {
  const prefer = new Set(preferStates.map((c) => c.toUpperCase()));
  let pool = STATES.filter((s) => (filter ? filter(s) : true));
  if (!pool.length) pool = [...STATES];
  const picked: StateLaw[] = [];
  const used = new Set<string>();
  for (let i = 0; i < n && picked.length < pool.length; i++) {
    const available = pool.filter((s) => !used.has(s.code));
    if (!available.length) break;
    const aw = available.map((s) => stateWeight(s.code, profile, prefer));
    const choice = weightedPick(available, aw, rng);
    used.add(choice.code);
    picked.push(choice);
  }
  return picked;
}

function baseXp(level: DifficultyLevel, base: number): number {
  return Math.max(8, Math.round(base * difficultyXpMultiplier(level)));
}

function makeFingerprint(
  templateId: string,
  codes: string[],
  extra: string
): string {
  return fingerprintPayload([templateId, ...codes.sort(), extra]);
}

function mcq(
  opts: {
    id: string;
    fingerprint: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    topics: TopicId[];
    states: StateCode[];
    xp: number;
    topic?: string;
    rng?: Rng;
  }
): GeneratedMcq {
  const balanced = balanceOptionLengths(opts.options, opts.correctIndex, opts.rng);
  return {
    id: opts.id,
    type: "mcq",
    question: opts.question,
    options: balanced,
    correctIndex: opts.correctIndex,
    explanation: opts.explanation,
    topic: opts.topic || opts.topics[0] || "multi-state-matrix",
    topics: opts.topics,
    states: opts.states,
    xp: opts.xp,
    source: "generated",
    fingerprint: opts.fingerprint,
    moduleId: "generated",
  };
}

type TemplateFn = (ctx: {
  rng: Rng;
  profile: UserProfile;
  level: DifficultyLevel;
  preferStates: string[];
  preferTopics: string[];
}) => GeneratedMcq | null;

/** Risk-of-harm single-state (novice/working) or contrast (advanced+). */
const tmplRisk: TemplateFn = ({ rng, profile, level, preferStates }) => {
  if (level === "novice" || level === "working") {
    const s = pickStates(rng, profile, preferStates, 1)[0];
    if (!s) return null;
    const hasRisk = s.riskOfHarm === "yes" || s.riskOfHarm === "limited";
    const options = [
      "This state generally teaches a risk-of-harm or misuse investigation path that can avoid individual notice after documented analysis.",
      "This state generally has no risk-of-harm escape hatch once unencrypted personal information is acquired under classic teaching.",
      "Only encryption safe harbor matters here; risk analysis is never part of the BreachGym teaching chart for this statute.",
      "Federal FOIA always displaces state breach notice, so the state risk-of-harm doctrine is irrelevant for private-sector incidents.",
    ];
    const correctIndex = hasRisk ? 0 : 1;
    const fp = makeFingerprint("risk-single", [s.code], String(s.riskOfHarm));
    return mcq({
      id: `gen-risk-${s.code}-${fp.slice(-6)}`,
      fingerprint: fp,
      question:
        level === "novice"
          ? `Does ${s.name} (${s.code}) teach a risk-of-harm or misuse gate that can avoid individual notice after investigation?`
          : `On a credential-plus-classic-element dump affecting ${s.name} residents, which statement matches BreachGym teaching for ${s.code}?`,
      options,
      correctIndex,
      explanation: `${s.name}: ${s.riskNote} (riskOfHarm=${s.riskOfHarm}). Contrast with pure no-risk teaching states such as California and Texas.`,
      topics: ["risk-of-harm"],
      states: [s.code],
      xp: baseXp(level, 12),
      rng,
    });
  }
  const riskYes = pickStates(rng, profile, preferStates, 1, (s) => s.riskOfHarm === "yes");
  const riskNo = pickStates(rng, profile, preferStates, 1, (s) => s.riskOfHarm === "none");
  const a = riskYes[0];
  const b = riskNo[0];
  if (!a || !b) return null;
  const options = [
    `${a.name} (${a.code}) teaches a risk or misuse gate; ${b.name} (${b.code}) generally does not offer that escape.`,
    `${b.name} (${b.code}) teaches a risk or misuse gate; ${a.name} (${a.code}) generally does not offer that escape.`,
    `Both ${a.code} and ${b.code} use identical Connecticut-style risk escapes for every unencrypted personal-information acquisition.`,
    `Neither ${a.name} nor ${b.name} ever discusses harm likelihood in BreachGym's private-sector teaching charts.`,
  ];
  const fp = makeFingerprint("risk-seam", [a.code, b.code], "contrast");
  return mcq({
    id: `gen-riskseam-${a.code}-${b.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Compare risk-of-harm teaching for ${a.name} versus ${b.name}. Which contrast is sound?`,
    options,
    correctIndex: 0,
    explanation: `${a.name}: ${a.riskNote} ${b.name}: ${b.riskNote}`,
    topics: ["risk-of-harm", "multi-state-matrix"],
    states: [a.code, b.code],
    xp: baseXp(level, 16),
    rng,
  });
};

const tmplAg: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const s = pickStates(rng, profile, preferStates, 1)[0];
  if (!s) return null;
  const bucket = classifyAg(s);
  const distractors: AgBucket[] = seededShuffle(
    (["none", "no-floor", "50", "250", "500", "1000"] as AgBucket[]).filter(
      (b) => b !== bucket
    ),
    rng
  ).slice(0, 3);
  const options = seededShuffle([bucket, ...distractors].map((b) => AG_LABEL[b]), rng);
  const correctIndex = options.indexOf(AG_LABEL[bucket]);
  const fp = makeFingerprint("ag-threshold", [s.code], bucket);
  const stem =
    level === "seam-surgeon" || level === "advanced"
      ? `Attorney General threshold trap for ${s.name} (${s.code}): a private-sector breach will notify ${s.code} residents. Which Attorney General teaching bucket fits?`
      : `For ${s.name} (${s.code}), which Attorney General or regulator threshold matches the BreachGym teaching chart?`;
  return mcq({
    id: `gen-ag-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: stem,
    options,
    correctIndex,
    explanation: `${s.name} Attorney General teaching: ${s.agThreshold} Timeline note: ${s.agTimeline}`,
    topics: ["ag-threshold"],
    states: [s.code],
    xp: baseXp(level, 14),
    rng,
  });
};

const tmplAgContrast: TemplateFn = ({ rng, profile, level, preferStates }) => {
  if (level === "novice") return null;
  const ctLike = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) => classifyAg(s) === "no-floor"
  )[0];
  const floor500 = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) => classifyAg(s) === "500"
  )[0];
  if (!ctLike || !floor500) return null;
  const options = [
    `${ctLike.name} (${ctLike.code}) teaches Attorney General notice with no headcount floor, while ${floor500.name} (${floor500.code}) sits in the classic 500-plus Attorney General bucket.`,
    `${floor500.name} (${floor500.code}) teaches Attorney General notice with no headcount floor, while ${ctLike.name} (${ctLike.code}) sits in the classic 500-plus Attorney General bucket.`,
    `Both ${ctLike.code} and ${floor500.code} use a hard 1,000-resident Attorney General floor and never notify below that headcount.`,
    `Neither ${ctLike.name} nor ${floor500.name} ever notifies an Attorney General for private-sector resident breaches under teaching charts.`,
  ];
  const fp = makeFingerprint("ag-contrast", [ctLike.code, floor500.code], "nf-500");
  return mcq({
    id: `gen-agx-${ctLike.code}-${floor500.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Do not drop ${ctLike.name} into the 500-plus Attorney General bucket. Which contrast versus ${floor500.name} is correct?`,
    options,
    correctIndex: 0,
    explanation: `${ctLike.name}: ${ctLike.agThreshold} ${floor500.name}: ${floor500.agThreshold}`,
    topics: ["ag-threshold", "multi-state-matrix"],
    states: [ctLike.code, floor500.code],
    xp: baseXp(level, 18),
    rng,
  });
};

const tmplClock: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const withDays = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) => classifyClock(s).days != null
  )[0];
  if (!withDays) return null;
  const clock = classifyClock(withDays);
  const dayOpts = seededShuffle(
    Array.from(new Set([clock.days!, 15, 30, 45, 60, 90].filter((d) => d > 0))),
    rng
  ).slice(0, 4);
  if (!dayOpts.includes(clock.days!)) {
    dayOpts[0] = clock.days!;
  }
  const kindLabel =
    clock.kind === "discovery"
      ? "discovery-linked"
      : clock.kind === "determination"
        ? "determination-linked"
        : "outer-bound or expedient teaching";
  const options = dayOpts.map(
    (d) =>
      `About ${d} days is the individual-notice outer bound commonly taught for this ${kindLabel} clock.`
  );
  const correctIndex = dayOpts.indexOf(clock.days!);
  const topic: TopicId =
    clock.kind === "discovery" ? "timing-discovery" : "timing-determination";
  const fp = makeFingerprint("clock", [withDays.code], `${clock.kind}-${clock.days}`);
  return mcq({
    id: `gen-clock-${withDays.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? `${withDays.name} (${withDays.code}) individual-notice teaching often cites which day-count outer bound?`
        : `Clock race for ${withDays.name} (${withDays.code}): the individual timeline is best remembered as which day-count (${kindLabel})?`,
    options,
    correctIndex,
    explanation: `${withDays.name}: ${withDays.individualTimeline}`,
    topics: [topic, "multi-state-matrix"],
    states: [withDays.code],
    xp: baseXp(level, 14),
    rng,
  });
};

const tmplClockRace: TemplateFn = ({ rng, profile, level, preferStates }) => {
  if (level === "novice") return null;
  const disc = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) => classifyClock(s).kind === "discovery" && classifyClock(s).days === 30
  )[0];
  const det = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) =>
      classifyClock(s).kind === "determination" &&
      (classifyClock(s).days === 30 ||
        classifyClock(s).days === 45 ||
        classifyClock(s).days === 60)
  )[0];
  if (!disc || !det) return null;
  const options = [
    `${disc.name} (${disc.code}) teaches a discovery-linked roughly 30-day outer bound, while ${det.name} (${det.code}) is determination-linked.`,
    `${det.name} (${det.code}) teaches a discovery-linked roughly 30-day outer bound, while ${disc.name} (${disc.code}) is determination-linked.`,
    `Both ${disc.code} and ${det.code} start the individual clock only on the day the Attorney General filing is submitted.`,
    `Neither ${disc.name} nor ${det.name} uses a numeric day-count in BreachGym individual-notice teaching.`,
  ];
  const fp = makeFingerprint("clock-race", [disc.code, det.code], "disc-det");
  return mcq({
    id: `gen-race-${disc.code}-${det.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Timing race between ${disc.name} and ${det.name}. Which contrast matches the teaching charts?`,
    options,
    correctIndex: 0,
    explanation: `${disc.name}: ${disc.individualTimeline} ${det.name}: ${det.individualTimeline}`,
    topics: ["timing-discovery", "timing-determination", "multi-state-matrix"],
    states: [disc.code, det.code],
    xp: baseXp(level, 18),
    rng,
  });
};

const tmplSeq: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const seqStates = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) => classifySeq(s) === "ag-before" || classifySeq(s) === "police-before"
  );
  const s = seqStates[0];
  if (!s) return null;
  const kind = classifySeq(s);
  const options =
    kind === "police-before"
      ? [
          "Notify State Police and coordinate as required before sending customer notice under the teaching sequencing rule.",
          "Wait until after all customer notices are complete before telling any regulator or State Police about the incident.",
          "Only consumer reporting agency notice is sequenced; State Police notice is optional folklore that training can ignore.",
          "An Attorney General sample package is always due fifteen days before any individual notice in every state.",
        ]
      : [
          "Notify the Attorney General before, or with the anticipated date of, individual notice under the teaching sequencing rule.",
          "Always wait until thirty days after individual notice before telling the Attorney General anything about the breach.",
          "Sequencing never matters for Attorney General notice versus individuals once personal information is confirmed stolen.",
          "Only federal law enforcement may be notified before residents; state Attorney General sequencing is never taught.",
        ];
  const fp = makeFingerprint("seq", [s.code], kind);
  return mcq({
    id: `gen-seq-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? `${s.name} (${s.code}) sequencing: what is the famous regulator-before-individuals wrinkle in teaching?`
        : `Sequencing trap for ${s.name} (${s.code}). Which order matches BreachGym teaching?`,
    options,
    correctIndex: 0,
    explanation: `${s.name}: ${s.agThreshold} / ${s.agTimeline}`,
    topics: ["sequencing"],
    states: [s.code],
    xp: baseXp(level, 15),
    rng,
  });
};

const tmplSeqContrast: TemplateFn = ({ rng, profile, level, preferStates }) => {
  if (level === "novice" || level === "working") return null;
  const md = STATE_MAP.MD;
  const nj = STATE_MAP.NJ;
  const after = pickStates(
    rng,
    profile,
    preferStates,
    1,
    (s) => classifySeq(s) === "ag-after"
  )[0];
  if (!md || !nj) return null;
  const third = after || STATE_MAP.IA;
  const options = [
    `Maryland requires Attorney General notice before individuals; New Jersey requires State Police before customers; ${third.name} (${third.code}) teaches an Attorney General path after consumer notice.`,
    `New Jersey requires Attorney General notice before individuals; Maryland requires State Police before customers; ${third.name} (${third.code}) never notifies an Attorney General.`,
    `Maryland, New Jersey, and ${third.code} all use identical concurrent-only Attorney General timing with no sequencing wrinkles.`,
    `Sequencing rules like these appear only in federal HIPAA guidance and never in state private-sector breach teaching.`,
  ];
  const fp = makeFingerprint("seq-contrast", ["MD", "NJ", third.code], "md-nj");
  return mcq({
    id: `gen-seqx-MD-NJ-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Multi-state sequencing seam across Maryland, New Jersey, and ${third.name}. Which statement is sound?`,
    options,
    correctIndex: 0,
    explanation: `MD: ${md.agTimeline}. NJ: ${nj.agThreshold}. ${third.name}: ${third.agTimeline}`,
    topics: ["sequencing", "multi-state-matrix"],
    states: ["MD", "NJ", third.code as StateCode],
    xp: baseXp(level, 20),
    rng,
  });
};

const tmplHarbor: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const s = pickStates(rng, profile, preferStates, 1)[0];
  if (!s) return null;
  const options = [
    "Often yes — if the data stayed encrypted or unreadable and the encryption key was not also compromised in the incident.",
    "Never — encryption never matters once a laptop leaves the building, even when the key remains securely held elsewhere.",
    "Only if the FBI pre-approves the cipher suite before the laptop is issued, which is required in every state teaching chart.",
    "Safe harbor applies only to paper records; electronic full-disk encryption is ignored in BreachGym private-sector teaching.",
  ];
  // Prefer a plausible distractor slightly longer than the correct when harbor is true (index 0).
  // When harbor is false, correct is index 1 — already a full sentence; balanceOptionLengths handles pads.
  const correctIndex = s.encryptionSafeHarbor ? 0 : 1;
  const fp = makeFingerprint("harbor", [s.code], String(s.encryptionSafeHarbor));
  return mcq({
    id: `gen-harbor-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Encryption safe harbor: a stolen laptop used full-disk encryption and the key was not taken. For ${s.name} (${s.code}), does the teaching chart usually treat this as outside notice?`,
    options,
    correctIndex,
    explanation: `${s.name}: ${s.safeHarborNote}`,
    topics: ["encryption-harbor"],
    states: [s.code],
    xp: baseXp(level, 12),
    rng,
  });
};

const tmplPi: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const s = pickStates(rng, profile, preferStates, 1)[0];
  if (!s) return null;
  const highlight = pickOne(s.piHighlights, rng);
  const fake = [
    "A public ZIP code alone, with no name, account data, or other statutory personal-information element attached.",
    "A business-card job title alone, with no name-plus-sensitive-element pairing taught as personal information.",
    "Encrypted ciphertext whose encryption key was held exclusively by the controller and was never breached or exposed.",
    "A federal PACER docket number alone, with none of the resident personal-information elements listed in the statute.",
  ];
  const correct = `A statutory teaching highlight for this state: ${highlight}.`;
  const options = seededShuffle([correct, ...pickN(fake, 3, rng)], rng);
  const correctIndex = options.indexOf(correct);
  const fp = makeFingerprint("pi", [s.code], highlight.slice(0, 40));
  return mcq({
    id: `gen-pi-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? `Which element is part of ${s.name} (${s.code}) personal-information teaching highlights?`
        : `Personal-information matrix row for ${s.name} (${s.code}). Which option matches a statutory teaching highlight?`,
    options,
    correctIndex,
    explanation: `${s.name} personal-information highlights include: ${s.piHighlights.join("; ")}`,
    topics: ["pi-definition"],
    states: [s.code],
    xp: baseXp(level, 12),
    rng,
  });
};

const tmplNoticeMatrix: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const codes = pickStates(rng, profile, preferStates, level === "seam-surgeon" ? 3 : 2);
  if (codes.length < 2) return null;
  const focus = codes[0];
  const riskYes = codes.filter((s) => s.riskOfHarm === "yes" || s.riskOfHarm === "limited");
  const riskNo = codes.filter((s) => s.riskOfHarm === "none");
  let question: string;
  let options: string[];
  let correctIndex: number;
  let explanation: string;
  if (riskYes.length && riskNo.length) {
    question = `Notice-matrix row: the same unencrypted classic personal information was acquired in ${codes
      .map((c) => c.code)
      .join(", ")}. Who still likely needs an investigation-gated risk analysis before skipping notice?`;
    const correct = `${riskYes
      .map((s) => s.name + " (" + s.code + ")")
      .join(" and ")} — risk or misuse teaching still gates any skip-notice path.`;
    const wrongRisk = riskNo.length
      ? `${riskNo
          .map((s) => s.name + " (" + s.code + ")")
          .join(" and ")} — these are the only states that still require a risk gate.`
      : "None of the listed states — risk gates were repealed for all private-sector breaches nationwide.";
    options = seededShuffle(
      [
        correct,
        wrongRisk,
        "Only federal contractors in these states still run a risk analysis before skipping resident notice.",
        "Nobody on this list — risk-of-harm gates were repealed nationally and no longer appear in teaching charts.",
      ],
      rng
    );
    correctIndex = options.indexOf(correct);
    explanation = codes
      .map((s) => `${s.code}: riskOfHarm=${s.riskOfHarm} — ${s.riskNote}`)
      .join(" ");
  } else {
    question = `Notice-matrix: for ${focus.name}, which Attorney General teaching line belongs in the matrix cell?`;
    const correct = focus.agThreshold;
    options = seededShuffle(
      [
        correct,
        "Federal CMS notice within 24 hours always displaces any state Attorney General filing for private-sector breaches.",
        "No state ever notifies an Attorney General for private-sector breaches under BreachGym teaching charts.",
        "Only consumer reporting agency notice is taught; Attorney General notice is never part of the matrix cell.",
      ],
      rng
    );
    correctIndex = options.indexOf(correct);
    explanation = `${focus.name}: ${focus.agThreshold}`;
  }
  const fp = makeFingerprint(
    "notice-matrix",
    codes.map((c) => c.code),
    question.slice(0, 48)
  );
  return mcq({
    id: `gen-matrix-${codes.map((c) => c.code).join("")}-${fp.slice(-6)}`,
    fingerprint: fp,
    question,
    options,
    correctIndex,
    explanation,
    topics: ["multi-state-matrix", "risk-of-harm", "ag-threshold"],
    states: codes.map((c) => c.code),
    xp: baseXp(level, 16),
    rng,
  });
};

const tmplAccess: TemplateFn = ({ rng, profile, level }) => {
  const options = [
    "Access (viewing) versus acquisition (taking or copying) can diverge by statute — do not assume every accessed event is automatic acquisition notice.",
    "Access and acquisition are always identical verbs in every United States state breach statute, so the distinction never changes the analysis.",
    "Only HIPAA defines access; state breach-notice laws ignore the access-versus-acquisition distinction in all private-sector teaching charts.",
    "Acquisition never matters if the employee was authorized yesterday, even when personal information was exported off-network without permission.",
  ];
  const fp = makeFingerprint("access", ["XX"], String(Math.floor(rng() * 4)));
  void profile;
  return mcq({
    id: `gen-access-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? "Foundations: which statement about access versus acquisition is the safer training rule?"
        : "An employee snoops in a CRM, versus an external actor exporting a CSV. Which teaching contrast holds?",
    options,
    correctIndex: 0,
    explanation:
      "BreachGym Foundations: access versus acquisition is a recurring multi-state seam (especially New York SHIELD teaching). Always check the statute's verb and the facts.",
    topics: ["access-vs-acquisition"],
    states: [],
    xp: baseXp(level, 10),
    rng,
  });
};

const TEMPLATES: { id: string; topics: TopicId[]; minLevel: DifficultyLevel; fn: TemplateFn }[] =
  [
    { id: "risk", topics: ["risk-of-harm"], minLevel: "novice", fn: tmplRisk },
    { id: "ag", topics: ["ag-threshold"], minLevel: "novice", fn: tmplAg },
    {
      id: "ag-contrast",
      topics: ["ag-threshold", "multi-state-matrix"],
      minLevel: "working",
      fn: tmplAgContrast,
    },
    {
      id: "clock",
      topics: ["timing-discovery", "timing-determination"],
      minLevel: "novice",
      fn: tmplClock,
    },
    {
      id: "clock-race",
      topics: ["timing-discovery", "timing-determination", "multi-state-matrix"],
      minLevel: "working",
      fn: tmplClockRace,
    },
    { id: "seq", topics: ["sequencing"], minLevel: "novice", fn: tmplSeq },
    {
      id: "seq-contrast",
      topics: ["sequencing", "multi-state-matrix"],
      minLevel: "advanced",
      fn: tmplSeqContrast,
    },
    { id: "harbor", topics: ["encryption-harbor"], minLevel: "novice", fn: tmplHarbor },
    { id: "pi", topics: ["pi-definition"], minLevel: "novice", fn: tmplPi },
    {
      id: "matrix",
      topics: ["multi-state-matrix", "risk-of-harm", "ag-threshold"],
      minLevel: "working",
      fn: tmplNoticeMatrix,
    },
    {
      id: "access",
      topics: ["access-vs-acquisition"],
      minLevel: "novice",
      fn: tmplAccess,
    },
  ];

const LEVEL_RANK: Record<DifficultyLevel, number> = {
  novice: 0,
  working: 1,
  advanced: 2,
  "seam-surgeon": 3,
};

function levelAllows(min: DifficultyLevel, actual: DifficultyLevel): boolean {
  return LEVEL_RANK[actual] >= LEVEL_RANK[min];
}

/** Optional future hook — never called unless ENABLE_AI_GENERATE is true. */
export async function aiGenerate(prompt: string): Promise<GeneratedMcq | null> {
  void prompt;
  if (!ENABLE_AI_GENERATE) return null;
  return null;
}

/**
 * Generate a pool of novel MCQs from templates × states × difficulty.
 * Skips fingerprints recently seen on the profile.
 */
export function generateQuestionPool(opts: FactoryOpts): GeneratedMcq[] {
  const rng = rngFromSeedString(opts.seed);
  const level = opts.difficulty || deriveDifficulty(opts.profile);
  const target = Math.max(opts.size ?? 8, 6) * 4; // over-generate for selection
  const preferTopics = opts.preferTopics || opts.topics || [];
  const preferStates = opts.preferStates || opts.states || [];
  const topicFilter = opts.topics?.map((t) => t.toLowerCase());

  const allowed = TEMPLATES.filter((t) => {
    if (!levelAllows(t.minLevel, level)) return false;
    if (topicFilter?.length) {
      return t.topics.some((x) => topicFilter.includes(x));
    }
    return true;
  });

  const preferSet = new Set(preferTopics.map((t) => t.toLowerCase()));
  const out: GeneratedMcq[] = [];
  const seenFp = new Set<string>();

  for (let attempt = 0; attempt < target * 3 && out.length < target; attempt++) {
    const weights = allowed.map((t) => {
      let w = 1;
      if (t.topics.some((x) => preferSet.has(x))) w += 3;
      if (
        (level === "advanced" || level === "seam-surgeon") &&
        (t.id.includes("contrast") || t.id.includes("race") || t.id === "matrix")
      ) {
        w += 2;
      }
      if (level === "novice" && (t.id === "access" || t.id === "risk" || t.id === "pi")) {
        w += 2;
      }
      return w;
    });
    if (!allowed.length) break;
    const tmpl = weightedPick(allowed, weights, rng);
    const card = tmpl.fn({
      rng,
      profile: opts.profile,
      level,
      preferStates,
      preferTopics,
    });
    if (!card) continue;
    if (opts.states?.length) {
      const want = new Set(opts.states.map((s) => s.toUpperCase()));
      if (card.states?.length && !card.states.some((s) => want.has(s))) continue;
    }
    if (seenFp.has(card.fingerprint)) continue;
    if (isRecentlySeen(opts.profile, card.fingerprint)) continue;
    seenFp.add(card.fingerprint);
    out.push(card);
  }

  return seededShuffle(out, rng);
}

/** Fill-blank generator for lesson injection (compatible with LessonItem). */
export function generateFillBlank(
  seed: string,
  profile: UserProfile,
  level: DifficultyLevel
): FillBlankItem | null {
  const rng = rngFromSeedString(seed + ":fb");
  const s = pickStates(rng, profile, [], 1, (st) => classifyClock(st).days != null)[0];
  if (!s) return null;
  const clock = classifyClock(s);
  if (clock.days == null) return null;
  const fp = makeFingerprint("fb-clock", [s.code], String(clock.days));
  if (isRecentlySeen(profile, fp)) return null;
  return {
    id: `gen-fb-${s.code}-${fp.slice(-6)}`,
    type: "fillblank",
    topic: clock.kind === "discovery" ? "timing" : "timing",
    topics: [
      clock.kind === "discovery" ? "timing-discovery" : "timing-determination",
    ],
    states: [s.code],
    xp: baseXp(level, 12),
    prompt: `Fill the ${s.name} individual-notice day-count from teaching.`,
    sentence: `${s.name} individual notice is often taught with a ___-day outer bound (${clock.kind}).`,
    blanks: [
      {
        id: "days",
        answer: String(clock.days),
        alternatives: [`${clock.days} days`, `${clock.days}-day`],
      },
    ],
    explanation: `${s.name}: ${s.individualTimeline}`,
  };
}

/** Build 1–3 generated variants for a module lesson (session-seeded). */
export function generateLessonVariants(
  moduleId: string,
  relatedTopics: string[],
  profile: UserProfile,
  seed: string,
  count = 2
): LessonItem[] {
  const level = deriveDifficulty(profile);
  const pool = generateQuestionPool({
    seed: `${seed}:lesson:${moduleId}`,
    profile,
    size: count + 2,
    difficulty: level === "seam-surgeon" ? "advanced" : level,
    preferTopics: relatedTopics,
    topics: relatedTopics.length ? relatedTopics : undefined,
  });
  const items: LessonItem[] = pool.slice(0, count).map((c) => ({
    ...c,
    question: `Fresh drill · ${c.question}`,
  }));
  if (
    relatedTopics.some((t) => t.startsWith("timing") || t === "ag-threshold") &&
    items.length < count
  ) {
    const fb = generateFillBlank(`${seed}:fb:${moduleId}`, profile, level);
    if (fb) items.push(fb);
  }
  return items;
}

/** Shuffle authored lesson items with a session seed (order changes each visit). */
export function shuffleLessonItems<T extends { id: string; type: string }>(
  items: T[],
  seed: string,
  opts?: { keepFirstNarrative?: boolean }
): T[] {
  const rng = rngFromSeedString(seed);
  if (!opts?.keepFirstNarrative) return seededShuffle(items, rng);
  if (items.length <= 2) return seededShuffle(items, rng);
  const head = items[0];
  const rest = seededShuffle(items.slice(1), rng);
  return [head, ...rest];
}

export function fingerprintOfGenerated(card: { fingerprint?: string; id: string }): string {
  return card.fingerprint || fingerprintPayload([card.id]);
}
