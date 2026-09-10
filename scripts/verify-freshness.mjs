/**
 * Verify two Adaptive sessions back-to-back produce different question sets.
 * Run: node --experimental-vm-modules scripts/verify-freshness.mjs
 * Uses tsx if available for TS path aliases; else spawns npx tsx on a tiny runner.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const runner = join("/workspace/breachgym", "scripts", "_freshness_runner.ts");
writeFileSync(
  runner,
  `
import { defaultProfile } from "../src/lib/storage";
import { buildAdaptiveSession } from "../src/lib/adaptive";
import { commitSessionMeta } from "../src/lib/sessionSeed";
import { deriveDifficulty } from "../src/lib/difficulty";
import { bumpMastery, emptyMastery } from "../src/lib/adaptive";

function idsOf(session: { cards: { id: string }[] }) {
  return session.cards.map((c) => c.id).sort().join("|");
}

let profile = defaultProfile("FreshnessTester");
// Seed some weak mastery so adaptive path (not only cold-start) engages on second pass
profile.totalAttempts = 12;
profile.totalCorrect = 5;
profile.topicMastery = {
  "ag-threshold": { ...emptyMastery(), correct: 1, incorrect: 4, mastery: 35, consecutiveWrong: 2, easiness: 1.5 },
  "sequencing": { ...emptyMastery(), correct: 0, incorrect: 3, mastery: 28, consecutiveWrong: 3, easiness: 1.4 },
  "timing-discovery": { ...emptyMastery(), correct: 2, incorrect: 2, mastery: 55, consecutiveWrong: 0, easiness: 2.2 },
};
profile.stateMastery = {
  CT: { ...emptyMastery(), correct: 0, incorrect: 2, mastery: 30, consecutiveWrong: 2, easiness: 1.5 },
  MD: { ...emptyMastery(), correct: 1, incorrect: 2, mastery: 40, consecutiveWrong: 1, easiness: 1.8 },
  CA: { ...emptyMastery(), correct: 2, incorrect: 1, mastery: 60, consecutiveWrong: 0, easiness: 2.3 },
};

const s1 = buildAdaptiveSession(profile, { size: 6 }, "seed-alpha-111");
profile = commitSessionMeta(profile, s1.seed, s1.fingerprints);
const s2 = buildAdaptiveSession(profile, { size: 6 }, "seed-beta-222");

const id1 = idsOf(s1);
const id2 = idsOf(s2);
const overlap = s1.cards.filter((c) => s2.cards.some((d) => d.id === c.id)).length;

console.log("Session 1 ids:", s1.cards.map((c) => c.id).join(", "));
console.log("Session 2 ids:", s2.cards.map((c) => c.id).join(", "));
console.log("Difficulty (weak profile):", deriveDifficulty(profile), "/", s1.difficultyLabel);
console.log("Sources s1:", s1.cards.map((c) => c.source).join(", "));
console.log("Overlap count:", overlap);

if (id1 === id2) {
  console.error("FAIL: identical question sets across two seeds");
  process.exit(1);
}
if (s1.cards.length < 5 || s2.cards.length < 5) {
  console.error("FAIL: session too short", s1.cards.length, s2.cards.length);
  process.exit(1);
}

// Difficulty rises with mastery
let strong = defaultProfile("Strong");
strong.totalAttempts = 40;
strong.totalCorrect = 36;
strong.adaptiveSessionsCompleted = 5;
for (const t of ["ag-threshold","sequencing","timing-discovery","timing-determination","risk-of-harm","pi-definition","encryption-harbor","multi-state-matrix","access-vs-acquisition","owner-maintainer"]) {
  strong.topicMastery[t] = { ...emptyMastery(), correct: 8, incorrect: 1, mastery: 88, consecutiveWrong: 0, easiness: 2.8 };
}
const dWeak = deriveDifficulty(profile);
const dStrong = deriveDifficulty(strong);
console.log("Difficulty weak→strong:", dWeak, "→", dStrong);
const order = ["novice","working","advanced","seam-surgeon"];
if (order.indexOf(dStrong) < order.indexOf(dWeak)) {
  console.error("FAIL: difficulty did not rise with mastery");
  process.exit(1);
}

console.log("OK: freshness + difficulty checks passed");
`
);

const r = spawnSync(
  "npx",
  ["--yes", "tsx", runner],
  { cwd: "/workspace/breachgym", encoding: "utf8", env: { ...process.env } }
);
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
try { unlinkSync(runner); } catch {}
process.exit(r.status ?? 1);
