# BreachGym

Duolingo-style micro-learning for law firm associates studying **US state data breach notification laws** across **all 50 states + D.C.**

Bright, bite-sized lessons + practical drills. Progress, XP, streaks, and badges persist in **localStorage** (client-side demo — no real auth, no paid APIs).

> **Educational disclaimer:** BreachGym is a training prototype only. It is **not legal advice**. Statutes change; always verify current primary sources before counseling clients.

## Quick start

```bash
cd /workspace/breachgym
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local production build (no basePath):

```bash
npm run build
# static files land in out/ — serve with any static host, e.g.:
npx serve out
```

GitHub Pages static export (with `/breachgym` basePath):

```bash
npm run export
# or: GITHUB_PAGES=true npm run build
```

## Stack

- Next.js 14 (App Router, static `output: 'export'`)
- TypeScript
- Tailwind CSS
- Client-side only (`localStorage`)

## Product tour

1. **Landing** — Continue as associate (demo profile).
2. **Dashboard** — Skill-tree module map, XP, streak, daily goal, and a first-class **Adaptive Review** entry (modules may link **multiple** practical drills).
3. **Lesson player** — Flashcards, fill-in-the-blank, MCQs, narrative case files (Equifax, Capital One, Target, Change Healthcare, MOVEit).
4. **Exercise player** — Client-email notice matrices, PI field maps, encryption safe-harbor calls, insider vs external acquisition analysis, and **hard multi-state seam drills**.
5. **Badges** — PI Spotter, Risk Analyst, Safe Harbor Scout, Multi-State Ranger, streak/XP badges, and more.
6. **Progress** — Accuracy + heuristic mastery by topic/state, with **Train this** → Adaptive Review.


## Adaptive learning

Client-side only (no backend / ML API). After each graded attempt, BreachGym updates:

- **Item mastery** — correct/incorrect counts, `lastSeen`, `consecutiveWrong`, SM-2-ish **easiness**, and a 0–100 **mastery** score
- **Topic mastery** — fine tags such as `pi-definition`, `risk-of-harm`, `encryption-harbor`, `timing-discovery`, `timing-determination`, `ag-threshold`, `sequencing`, `access-vs-acquisition`, `owner-maintainer`, `multi-state-matrix`
- **State mastery** — same fields per jurisdiction touched by the item

**Priority heuristic:** wrong answers and low mastery raise review priority; strong / recent items sink. Spaced boost grows with days since `lastSeen` scaled by easiness.

**Adaptive Review / Weak Spot Workout** (`/adaptive`):

- Bright entry on the dashboard and in the nav
- Builds a 5–8 item session from weakest topics/states (lesson MCQs, narrative quizzes, fill-blank recognition, and acquisition-drill snippets)
- Cold start (no history): hard multi-state sampler — not Foundations trivia
- Progress page **Train this** links open a filtered workout
- Module lessons may interleave 1–2 review cards when related topics are weak
- XP and badges still apply; **Weak-Spot Grinder** unlocks after 3 adaptive sessions

## Modules

1. Foundations  
2. Personal Information Elements  
3. Risk of Harm  
4. Safe Harbors  
5. Timing & Recipients (clock families, AG sequencing, threshold traps)  
6. Multi-State Scenarios (**harder seam drills** across large *and* less-taught jurisdictions)  
7. Capstone Drills (strictest-clock planning, credential/medical splits, harbor failures)

### Harder multi-state seam drills (associate training)

Drills force **contrasts between jurisdictions**, not definition trivia alone:

- Risk vs no-risk public-bucket hypos (CA/IL/GA vs CT/MI/AZ/ID/AR…)
- Credential-only and medical-only definition splits
- Discovery vs determination clock races; 30 / 45 / 60-day families (including OH/AZ/WI/OR/ME/VT/LA/SD…)
- AG threshold traps (CT/VT/ME/DC no- or low-minimum vs 250 / 500 / 1,000 bands; plains & Carolinas map)
- Regulator sequencing (MD AG-before, NJ State Police-before, NH AG-whenever / AG-before with no 1,000 AG floor, CA AG-after-consumer sample)
- Encryption harbor failure when the key/passphrase is acquired too
- Strictest-clock IR planning across all 50 + DC

## Jurisdictions covered (51)

All **50 U.S. states + the District of Columbia**, with high-level fields for PI highlights, risk-of-harm posture, encryption harbor, individual timeline family, AG/regulator thresholds & sequencing quirks, and distinctive wrinkles.

Teaching contrasts include: PI data elements, risk-of-harm vs non-risk (and risk-in-definition cousins), encryption safe harbor, individual/AG/CRA timing & thresholds, owner/licensee/maintainer patterns, and mid-size state clocks that associates often under-weight.

## Scripts

| Command          | Purpose                                              |
|------------------|------------------------------------------------------|
| `npm run dev`    | Local development                                    |
| `npm run build`  | Static export to `out/` (no basePath)                |
| `npm run export` | Static export with `GITHUB_PAGES=true` (`/breachgym`)|
| `npm run lint`   | ESLint                                               |

> `npm start` is unused for static hosting — there is no Node server after export.

## Deploy to GitHub Pages

The repo ships with `.github/workflows/deploy-pages.yml`:

1. Push to `main` (or run the workflow manually).
2. The workflow builds with `GITHUB_PAGES=true npm run build`, uploads `out/`, and deploys via `actions/deploy-pages`.
3. In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Site URL will be `https://<owner>.github.io/breachgym/` (repo name must match `basePath` `/breachgym`).

Local preview of the Pages build:

```bash
GITHUB_PAGES=true npm run build
npx serve out
# open the `/breachgym/` path when basePath is set
```

Notes:

- `basePath` / `assetPrefix` are `/breachgym` only when `GITHUB_PAGES=true`; local `npm run build` / `npm run dev` use an empty basePath.
- Dynamic routes (`/lesson/[moduleId]`, `/exercise/[exerciseId]`) are pre-rendered via `generateStaticParams`.
- Progress, XP, streaks, and badges still use **localStorage** in the browser — no server required.
- Do not use `next/image` optimization on Pages (`images.unoptimized` is set).

## Known gaps / intentional limits

- Demo content is conceptually accurate for training but **not** a citation citator; pinpoint cites are avoided where unstable.
- Thresholds/timelines are taught as **high-yield contrasts** — confirm live before filing.
- Secondary charts sometimes disagree (especially numeric deadlines); the app uses soft wording where ambiguous and keeps fixed teaching keys already established for CA SB-446, NY’s 30-day discovery outer bound, CT AG no-threshold, NJ risk + State Police, and MD AG-before.
- No server sync, multi-device accounts, or LMS gradebook.
- Ransomware / healthcare matters may also implicate HIPAA and contracts — out of scope except as narrative context.
