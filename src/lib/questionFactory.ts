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
    // GA, ID, etc. — but catch false positives for "no floor"
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

const AG_LABEL: Record<AgBucket, string> = {
  none: "No general AG notice in the core teaching",
  "no-floor": "AG whenever residents are notified (no headcount floor)",
  "50": "AG / OAG around 50+ residents",
  "250": "AG around 250+ residents",
  "500": "AG around 500+ residents",
  "1000": "AG around 1,000+ residents",
};

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
  const weights = pool.map((s) => stateWeight(s.code, profile, prefer));
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
  void weights;
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
  }
): GeneratedMcq {
  return {
    id: opts.id,
    type: "mcq",
    question: opts.question,
    options: opts.options,
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
      "Generally has a risk / misuse investigation path that can avoid individual notice",
      "Generally no risk-of-harm escape hatch once unencrypted PI is acquired (classic teaching)",
      "Only encryption safe harbor matters — risk analysis is never taught",
      "Federal FOIA always displaces state notice",
    ];
    const correctIndex = hasRisk ? 0 : 1;
    const fp = makeFingerprint("risk-single", [s.code], String(s.riskOfHarm));
    return mcq({
      id: `gen-risk-${s.code}-${fp.slice(-6)}`,
      fingerprint: fp,
      question:
        level === "novice"
          ? `Does ${s.name} (${s.code}) teach a risk-of-harm / misuse gate that can avoid individual notice?`
          : `On a credential + classic-element dump affecting ${s.name} residents, which statement matches BreachGym teaching for ${s.code}?`,
      options,
      correctIndex,
      explanation: `${s.name}: ${s.riskNote} (riskOfHarm=${s.riskOfHarm}). Contrast with pure no-risk states like CA/TX teaching.`,
      topics: ["risk-of-harm"],
      states: [s.code],
      xp: baseXp(level, 12),
    });
  }
  // Advanced+: contrast two states
  const riskYes = pickStates(rng, profile, preferStates, 1, (s) => s.riskOfHarm === "yes");
  const riskNo = pickStates(rng, profile, preferStates, 1, (s) => s.riskOfHarm === "none");
  const a = riskYes[0];
  const b = riskNo[0];
  if (!a || !b) return null;
  const options = [
    `${a.code} has a risk/misuse gate; ${b.code} generally does not`,
    `${b.code} has a risk/misuse gate; ${a.code} generally does not`,
    `Both ${a.code} and ${b.code} use identical CT-style risk escapes`,
    `Neither statute ever discusses harm likelihood`,
  ];
  const fp = makeFingerprint("risk-seam", [a.code, b.code], "contrast");
  return mcq({
    id: `gen-riskseam-${a.code}-${b.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Risk seam: ${a.name} vs ${b.name}. Which contrast is sound?`,
    options,
    correctIndex: 0,
    explanation: `${a.name}: ${a.riskNote} ${b.name}: ${b.riskNote}`,
    topics: ["risk-of-harm", "multi-state-matrix"],
    states: [a.code, b.code],
    xp: baseXp(level, 16),
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
      ? `AG threshold trap — ${s.name} (${s.code}). A private-sector breach will notify ${s.code} residents. Which AG teaching bucket fits?`
      : `For ${s.name} (${s.code}), which AG / regulator threshold matches the teaching chart?`;
  return mcq({
    id: `gen-ag-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: stem,
    options,
    correctIndex,
    explanation: `${s.name} AG: ${s.agThreshold} Timeline note: ${s.agTimeline}`,
    topics: ["ag-threshold"],
    states: [s.code],
    xp: baseXp(level, 14),
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
    `${ctLike.code}: AG with no headcount floor · ${floor500.code}: classic 500+ AG bucket`,
    `${floor500.code}: AG with no headcount floor · ${ctLike.code}: classic 500+ AG bucket`,
    `Both use a hard 1,000 AG floor only`,
    `Neither ever notifies an AG`,
  ];
  const fp = makeFingerprint("ag-contrast", [ctLike.code, floor500.code], "nf-500");
  return mcq({
    id: `gen-agx-${ctLike.code}-${floor500.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Do not drop ${ctLike.name} into the 500+ AG bucket. Which contrast is correct vs ${floor500.name}?`,
    options,
    correctIndex: 0,
    explanation: `${ctLike.name}: ${ctLike.agThreshold} ${floor500.name}: ${floor500.agThreshold}`,
    topics: ["ag-threshold", "multi-state-matrix"],
    states: [ctLike.code, floor500.code],
    xp: baseXp(level, 18),
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
    Array.from(
      new Set(
        [clock.days!, 15, 30, 45, 60, 90].filter((d) => d > 0)
      )
    ),
    rng
  ).slice(0, 4);
  if (!dayOpts.includes(clock.days!)) {
    dayOpts[0] = clock.days!;
  }
  const options = dayOpts.map((d) => `${d} days`);
  const correctIndex = options.indexOf(`${clock.days} days`);
  const kindLabel =
    clock.kind === "discovery"
      ? "discovery-linked"
      : clock.kind === "determination"
        ? "determination-linked"
        : "outer-bound / expedient teaching";
  const topic: TopicId =
    clock.kind === "discovery" ? "timing-discovery" : "timing-determination";
  const fp = makeFingerprint("clock", [withDays.code], `${clock.kind}-${clock.days}`);
  return mcq({
    id: `gen-clock-${withDays.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? `${withDays.name} (${withDays.code}) individual-notice teaching often cites which day-count outer bound?`
        : `Clock race — ${withDays.name} (${withDays.code}). The individual timeline is best remembered as which day-count (${kindLabel})?`,
    options,
    correctIndex,
    explanation: `${withDays.name}: ${withDays.individualTimeline}`,
    topics: [topic, "multi-state-matrix"],
    states: [withDays.code],
    xp: baseXp(level, 14),
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
      (classifyClock(s).days === 30 || classifyClock(s).days === 45 || classifyClock(s).days === 60)
  )[0];
  if (!disc || !det) return null;
  const options = [
    `${disc.code} teaches a discovery-linked ~30-day outer bound; ${det.code} is determination-linked`,
    `${det.code} teaches a discovery-linked ~30-day outer bound; ${disc.code} is determination-linked`,
    `Both start the clock only on AG filing day`,
    `Neither statute uses a numeric day-count in teaching`,
  ];
  const fp = makeFingerprint("clock-race", [disc.code, det.code], "disc-det");
  return mcq({
    id: `gen-race-${disc.code}-${det.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Timing race: ${disc.name} vs ${det.name}. Which contrast matches the charts?`,
    options,
    correctIndex: 0,
    explanation: `${disc.name}: ${disc.individualTimeline} ${det.name}: ${det.individualTimeline}`,
    topics: ["timing-discovery", "timing-determination", "multi-state-matrix"],
    states: [disc.code, det.code],
    xp: baseXp(level, 18),
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
          "Notify State Police (and coordinate as required) before customer notice",
          "Wait until after all customer notices to tell any regulator",
          "Only CRA notice is sequenced; police notice is optional folklore",
          "AG sample is due 15 days before any individual notice always",
        ]
      : [
          "Notify the AG before (or with anticipated date of) individual notice",
          "Always wait until 30 days after individual notice to tell the AG",
          "Sequencing never matters for AG vs individuals",
          "Only federal LE can be notified before residents",
        ];
  const fp = makeFingerprint("seq", [s.code], kind);
  return mcq({
    id: `gen-seq-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? `${s.name} (${s.code}) sequencing: what is the famous regulator-before-individuals wrinkle?`
        : `Sequencing trap — ${s.name} (${s.code}). Which order matches teaching?`,
    options,
    correctIndex: 0,
    explanation: `${s.name}: ${s.agThreshold} / ${s.agTimeline}`,
    topics: ["sequencing"],
    states: [s.code],
    xp: baseXp(level, 15),
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
    `MD: AG before individuals · NJ: State Police before customers · ${third.code}: AG path after consumer notice (teaching contrast)`,
    `NJ: AG before individuals · MD: State Police before customers · ${third.code}: never notifies AG`,
    `All three use identical concurrent-only AG timing`,
    `Sequencing is only a federal HIPAA rule`,
  ];
  const fp = makeFingerprint("seq-contrast", ["MD", "NJ", third.code], "md-nj");
  return mcq({
    id: `gen-seqx-MD-NJ-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Multi-state sequencing seam (MD / NJ / ${third.code}). Which statement is sound?`,
    options,
    correctIndex: 0,
    explanation: `MD: ${md.agTimeline}. NJ: ${nj.agThreshold}. ${third.name}: ${third.agTimeline}`,
    topics: ["sequencing", "multi-state-matrix"],
    states: ["MD", "NJ", third.code as StateCode],
    xp: baseXp(level, 20),
  });
};

const tmplHarbor: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const s = pickStates(rng, profile, preferStates, 1)[0];
  if (!s) return null;
  const options = [
    "Often yes — if data stays encrypted/unreadable and the key was not also compromised",
    "Never — encryption never matters once a laptop leaves the building",
    "Only if the FBI pre-approves the cipher suite",
    "Safe harbor applies only to paper records",
  ];
  const correctIndex = s.encryptionSafeHarbor ? 0 : 1;
  const fp = makeFingerprint("harbor", [s.code], String(s.encryptionSafeHarbor));
  return mcq({
    id: `gen-harbor-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question: `Encryption safe harbor — stolen laptop, full-disk encryption, key not taken. For ${s.name} (${s.code}), does the teaching chart usually treat this as outside notice?`,
    options,
    correctIndex,
    explanation: `${s.name}: ${s.safeHarborNote}`,
    topics: ["encryption-harbor"],
    states: [s.code],
    xp: baseXp(level, 12),
  });
};

const tmplPi: TemplateFn = ({ rng, profile, level, preferStates }) => {
  const s = pickStates(rng, profile, preferStates, 1)[0];
  if (!s) return null;
  const highlight = pickOne(s.piHighlights, rng);
  const fake = [
    "Only a public ZIP code with no name or account data",
    "Business card title alone with no statutory element",
    "Encrypted ciphertext with the key held exclusively by the controller and never breached",
    "Federal PACER docket number with no resident PI elements",
  ];
  const options = seededShuffle([`Likely in play: ${highlight}`, ...pickN(fake, 3, rng)], rng);
  const correctIndex = options.findIndex((o) => o.startsWith("Likely in play:"));
  const fp = makeFingerprint("pi", [s.code], highlight.slice(0, 40));
  return mcq({
    id: `gen-pi-${s.code}-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? `Which element is part of ${s.name} (${s.code}) PI teaching highlights?`
        : `PI matrix row — ${s.name} (${s.code}). Which option matches a statutory teaching highlight?`,
    options,
    correctIndex,
    explanation: `${s.name} PI highlights include: ${s.piHighlights.join("; ")}`,
    topics: ["pi-definition"],
    states: [s.code],
    xp: baseXp(level, 12),
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
    question = `Notice-matrix row: same unencrypted classic PI acquired in ${codes
      .map((c) => c.code)
      .join(", ")}. Who still likely needs an investigation-gated risk analysis before skipping notice?`;
    options = seededShuffle(
      [
        riskYes.map((s) => s.code).join(" / "),
        riskNo.map((s) => s.code).join(" / ") || "None of them",
        "Only federal contractors",
        "Nobody — risk gates were repealed nationally",
      ],
      rng
    );
    correctIndex = options.indexOf(riskYes.map((s) => s.code).join(" / "));
    explanation = codes
      .map((s) => `${s.code}: riskOfHarm=${s.riskOfHarm} — ${s.riskNote}`)
      .join(" ");
  } else {
    question = `Notice-matrix: for ${focus.name}, which AG teaching line belongs in the matrix cell?`;
    options = seededShuffle(
      [
        focus.agThreshold,
        "Federal CMS notice within 24 hours always",
        "No state ever notifies an AG for private-sector breaches",
        "Only CRA notice; AG notice is never taught",
      ],
      rng
    );
    correctIndex = options.indexOf(focus.agThreshold);
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
  });
};

const tmplAccess: TemplateFn = ({ rng, profile, level }) => {
  const options = [
    "Access (viewing) vs acquisition (taking/copying) can diverge by statute — do not assume every 'accessed' event is automatic acquisition notice",
    "Access and acquisition are always identical in every US state statute",
    "Only HIPAA defines access; state laws ignore the distinction",
    "Acquisition never matters if the employee was authorized yesterday",
  ];
  const fp = makeFingerprint("access", ["XX"], String(Math.floor(rng() * 4)));
  void profile;
  return mcq({
    id: `gen-access-${fp.slice(-6)}`,
    fingerprint: fp,
    question:
      level === "novice"
        ? "Foundations: which statement about access vs acquisition is the safer training rule?"
        : "Employee snooping on a CRM vs an external actor exporting a CSV — which teaching contrast holds?",
    options,
    correctIndex: 0,
    explanation:
      "BreachGym Foundations: access vs acquisition is a recurring multi-state seam (especially NY SHIELD teaching). Always check the statute's verb and facts.",
    topics: ["access-vs-acquisition"],
    states: [],
    xp: baseXp(level, 10),
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

  // Weight templates toward preferred weak topics
  const preferSet = new Set(preferTopics.map((t) => t.toLowerCase()));
  const out: GeneratedMcq[] = [];
  const seenFp = new Set<string>();

  for (let attempt = 0; attempt < target * 3 && out.length < target; attempt++) {
    const weights = allowed.map((t) => {
      let w = 1;
      if (t.topics.some((x) => preferSet.has(x))) w += 3;
      // Higher difficulty: prefer multi-state / trap templates
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
  // Occasionally inject a fill-blank for timing modules
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
  // Foundations-friendly: keep first narrative/flashcard block order soft-stable
  if (items.length <= 2) return seededShuffle(items, rng);
  const head = items[0];
  const rest = seededShuffle(items.slice(1), rng);
  return [head, ...rest];
}

export function fingerprintOfGenerated(card: { fingerprint?: string; id: string }): string {
  return card.fingerprint || fingerprintPayload([card.id]);
}
