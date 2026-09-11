/**
 * Assert generated MCQs do not systematically make the correct answer longest.
 * Fail if ≥70% of a sample has the correct option uniquely longest.
 * Run: npm run verify:mcq-balance
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runner = join(root, "scripts", "_mcq_balance_runner.ts");
writeFileSync(
  runner,
  `
import { defaultProfile } from "../src/lib/storage";
import { generateQuestionPool, balanceOptionLengths } from "../src/lib/questionFactory";

function uniquelyLongest(options: string[], correctIndex: number): boolean {
  const lens = options.map((o) => o.length);
  const c = lens[correctIndex];
  return lens.every((l, i) => i === correctIndex || l < c);
}

const demo = balanceOptionLengths(
  [
    "Short wrong",
    "This is the correct analytical answer that explains the full multi-state teaching rule in one sentence.",
    "Also short",
    "Tiny",
  ],
  1,
  () => 0.42
);
const demoLong = uniquelyLongest(demo, 1);
console.log("Helper demo lengths:", demo.map((o) => o.length), "correct uniquely longest?", demoLong);
if (demoLong) {
  console.error("FAIL: balanceOptionLengths left correct uniquely longest");
  process.exit(1);
}

let profile = defaultProfile("BalanceTester");
profile.totalAttempts = 20;
profile.totalCorrect = 10;

const seeds = [
  "bal-a-1", "bal-b-2", "bal-c-3", "bal-d-4", "bal-e-5",
  "bal-f-6", "bal-g-7", "bal-h-8", "bal-i-9", "bal-j-10",
];
const levels = ["novice", "working", "advanced", "seam-surgeon"] as const;

const sample: { id: string; uniquelyLongest: boolean; lens: number[]; question: string; options: string[] }[] = [];

for (const seed of seeds) {
  for (const difficulty of levels) {
    const pool = generateQuestionPool({
      seed: seed + ":" + difficulty,
      profile,
      size: 8,
      difficulty,
    });
    for (const card of pool) {
      if (card.options.length < 3) continue;
      sample.push({
        id: card.id,
        uniquelyLongest: uniquelyLongest(card.options, card.correctIndex),
        lens: card.options.map((o) => o.length),
        question: card.question,
        options: card.options,
      });
    }
  }
}

const n = sample.length;
const bad = sample.filter((s) => s.uniquelyLongest).length;
const rate = n ? bad / n : 1;
console.log("Sample size:", n);
console.log("Correct uniquely longest:", bad, "(" + (rate * 100).toFixed(1) + "%)");
console.log("Difficulty labels covered:", levels.join(", "));

const ex = sample.find((s) => !s.uniquelyLongest) || sample[0];
if (ex) {
  console.log("BEFORE/AFTER-STYLE EXAMPLE (generated item):");
  console.log("Q:", ex.question);
  ex.options.forEach((o, i) => console.log("  [" + o.length + " chars]", o));
  console.log("correct uniquely longest?", ex.uniquelyLongest);
}

if (n < 40) {
  console.error("FAIL: sample too small", n);
  process.exit(1);
}
if (rate >= 0.7) {
  console.error("FAIL: correct answer uniquely longest in ≥70% of sample");
  process.exit(1);
}
if (rate > 0.4) {
  console.warn("WARN: uniquely-longest rate above 40%:", (rate * 100).toFixed(1) + "%");
}

console.log("OK: mcq length-balance checks passed");
`
);

const r = spawnSync("npx", ["--yes", "tsx", runner], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env },
});
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
try {
  unlinkSync(runner);
} catch {}
process.exit(r.status ?? 1);
