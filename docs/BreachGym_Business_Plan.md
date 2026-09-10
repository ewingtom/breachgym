# BreachGym — Business Plan

**Audience:** Managing Partners · Privacy / Cyber / Litigation Practice Group Leaders · CMO / Business Development · Professional Development / Talent · Firm General Counsel

**Product:** Micro-learning platform for U.S. state data breach notification law (50 states + D.C.)

**Status:** Working Next.js prototype with curriculum, drills, badges, and progress tracking

**Educational disclaimer:** BreachGym is a training tool. It is **not legal advice**. Content may simplify or lag statutory amendments. Associates must verify current primary sources before counseling clients.

---

## 1. Executive Summary

BreachGym is a Duolingo-style micro-learning “jungle gym” that trains law firm associates to reason across **all 50 U.S. states plus the District of Columbia** on data breach notification—PI definitions, risk-of-harm postures, encryption safe harbors, timing families, AG/regulator thresholds and sequencing, and multi-state “seam” contrasts that trip junior lawyers in live matters.

Firms already buy CLE hours, maintain 50-state charts, and staff privacy/cyber partners who carry disproportionate load when associates cannot triage a multi-state notice matrix. BreachGym does not replace partner judgment or primary-source research. It builds **muscle memory** so associates arrive at client calls and war rooms with sharper instincts, faster matrix thinking, and fewer avoidable misses on mid-size jurisdictions.

**What decision-makers get from a pilot:**

- Measurable associate upskilling on high-stakes, practice-area-specific legislation
- Dynamic drills (client-email matrices, PI field maps, clock races, AG traps)—not static memos
- Retention and training ROI framed in PD language: completion, accuracy by topic/state, time-on-task, before/after scenario rubrics
- Client-facing readiness: associates who can speak knowledgeably about *why* CA, NY, CT, MD, NJ, and less-taught plains/Carolinas states diverge

**Ask:** Run a **4–6 week pilot** with **20–40 privacy/cyber associates**, **10–15 minutes/day**, with success criteria and a go/no-go review for firm SSO/LMS integration.

---

## 2. Problem

### Multi-state breach advice is high-stakes

A single vendor incident can implicate residents in dozens of jurisdictions. Notice analysis is not “California plus a few peers.” Associates must map, for each affected state:

- What counts as personal / private information (credentials, medical, biometrics, combinations)
- Whether acquisition or access triggers duties—and whether a risk-of-harm path exists
- Whether encryption (and key compromise) creates a safe harbor
- Individual vs AG/CRA clocks, thresholds, and sequencing quirks
- Owner/licensee vs maintainer patterns

Missed seams become partner fire drills, delayed advice, uneven quality across offices, and—at worst—client exposure on regulator timing.

### CLE and static memos do not build muscle memory

Annual CLE and email “updates” raise awareness. They do not train:

- Rapid contrast judgments (risk vs no-risk public-bucket hypos; 30 vs 45 vs 60-day families)
- Strictest-clock IR planning across a resident matrix
- Client-email discipline under time pressure

Associates remember what they *practice*. Most firms do not give them a safe place to fail and retry before the matter arrives.

### Uneven associate readiness creates risk and partner load

In privacy/cyber and adjacent litigation groups, readiness is uneven by class year, office, and prior matter exposure. Partners re-teach the same traps (MD AG-before, NJ State Police-before, CT no-threshold AG, CA SB-446 sequencing, NY 30-day discovery outer bound, plains-state AG bands). That is expensive partner time and a poor talent signal for rising associates who want stretch work and client contact.

**Bottom line for leadership:** The gap is not “lack of a chart.” The gap is **lack of deliberate, measurable practice** on the seams that drive real advice quality.

---

## 3. Solution — BreachGym

BreachGym is a **micro-learning jungle gym**: short sessions that mix flashcards, narrative case files, MCQs, fill-in-the-blanks, and practical drills that look like associate work product (client-email notice matrices, PI field maps, encryption harbor calls, insider vs external acquisition analysis, hard multi-state seam drills).

### Core product (current prototype)

| Capability | What associates experience |
|---|---|
| **Curriculum modules** | Foundations → PI Elements → Risk of Harm → Safe Harbors → Timing & Recipients → Multi-State Scenarios → Capstone |
| **Lesson formats** | Flashcards, fill-in-the-blank, MCQs, narrative case files (e.g., Equifax, Capital One, Target, Change Healthcare, MOVEit-style teaching contexts) |
| **Practical drills** | Client-email / table / matrix exercises; encryption harbor failure when keys travel with data; risk vs no-risk seams; credential-only and medical-only definition splits |
| **Hard multi-state seams** | Discovery vs determination clock races; AG threshold traps (no-/low-minimum vs 250/500/1,000 bands); regulator sequencing (MD, NJ, NH, CA AG-after-consumer sample); strictest-clock planning across 51 jurisdictions |
| **Mastery loop** | XP, streaks, daily goals, badges (PI Spotter, Risk Analyst, Safe Harbor Scout, Multi-State Ranger, Seam Surgeon, Capstone Counsel, streak/XP badges) |
| **Visibility** | Progress views: accuracy by topic and state; weak-area hints |
| **Coverage** | **51 jurisdictions** (50 states + D.C.) with high-yield teaching fields—not a citator |
| **Stack** | Next.js (App Router), TypeScript, Tailwind; client-side progress in localStorage for the demo |

### Design principles that match firm needs

1. **Practice-area relevance** — Built for privacy/cyber associates, not generic compliance trivia.
2. **Dynamic, not static** — Drills force contrasts; charts alone do not.
3. **Seam-focused difficulty** — Coastal mega-states *and* less-taught mid-size jurisdictions that associates under-weight.
4. **Honest educational posture** — Prominent disclaimer; soft wording where secondary charts disagree; “verify live before filing.”
5. **Bite-sized habit** — Designed for ~10–15 minutes/day so PD can schedule without killing billable capacity.

BreachGym is the gym. The partner remains the coach. Primary sources remain the rulebook.

---

## 4. Why This Practice Area / Why Now

State breach notification is a **core associate skill** for privacy, cybersecurity counseling, incident response, and related litigation/regulatory work. Demand for multi-state readiness is rising because:

- **California SB-446 / 2026 framing** tightens individual timing (taught as a ~30-day discovery/notification family) and AG sample sequencing after consumer notice when thresholds are met—associates who still treat CA as open-textured-only will mis-diary matters.
- **New York amendments and SHIELD teaching points** (including a 30-day discovery outer bound and access vs acquisition framing) raise the cost of “expedient only” mental models.
- **Multi-state IR pressure** from vendor-platform and ransomware-adjacent incidents routinely forces 20–51 jurisdiction matrices under compressed clocks.
- Mid-market and AmLaw clients expect counsel who can explain *why* CT/MI/AZ differ from CA/IL/GA on risk, why MD and NJ sequence differently, and why plains/Carolinas AG thresholds are not a single “500” checklist line.

Firms that systematize associate readiness here reduce partner load and strengthen BD conversations with security-conscious clients—without waiting for the next mega-matter to be the training ground.

*Note: Statutory detail above reflects BreachGym’s teaching curriculum framing. Always verify current law; the platform itself is training, not an opinion letter.*

---

## 5. Value for Decision-Makers

### Professional Development / Talent

- Structured, trackable upskilling between matters—not one-off CLE
- Badges and module completion support competency narratives for reviews and secondments
- Retention signal: associates see investment in skills that unlock client-facing work
- Fits existing PD calendars (short daily sessions; pilot cohort model)

### Practice Group Leaders (Privacy / Cyber / Litigation)

- Raises the floor on associate matrix quality before partner review
- Standardizes teaching of high-yield traps across offices and classes
- Creates a shared language for feedback (“your AG sequencing on MD/NJ was soft; re-run Timing module”)
- Frees partner hours currently spent re-teaching foundations

### Risk / Quality / Firm GC

- Reduces avoidable process misses in training context (clock families, threshold traps, harbor key-compromise)
- Documented training participation supports quality narratives (without claiming malpractice immunity)
- Clear educational disclaimer and “verify primary sources” culture—aligned with risk posture
- Content update path (roadmap) addresses currency risk explicitly

### CMO / Business Development / Client-facing readiness

- Associates who can speak crisply on multi-state notice strategy improve pitch and IR kickoff credibility
- Pilot metrics give BD a concrete “how we train our bench” story—without fabricating outcome claims
- Differentiates the firm’s talent story vs “we have a 50-state chart on the intranet”

### Managing Partners

- Training ROI framed in measurable proxies (completion, accuracy lift, time-to-competency), not vanity engagement
- Modest pilot scope and clear go/no-go criteria before enterprise spend
- Aligns talent, quality, and client readiness in one practice-critical domain

---

## 6. Learning Outcomes & Measurement

### Intended learning outcomes

Associates who complete the core path should be able to:

1. Map an incident to a **resident-by-jurisdiction matrix** (PI, acquisition/access, risk, encryption, timing, AG/CRA)
2. Spot **definition seams** (credential-only, medical-only, biometrics expansions) without collapsing the map
3. Distinguish **risk vs no-risk** (and risk-in-definition) postures and document investigation-first habits
4. Call **encryption safe harbor** outcomes—including key/passphrase compromise failures
5. Apply **clock families** (≈30 / 45 / 60 and expedient-only) and the **strictest-clock** planning rule
6. Navigate **AG threshold and sequencing traps** (including less-taught jurisdictions)
7. Draft sharper **client-facing summaries** of notice strategy under partner supervision

### Pilot metrics framework (proposed)

| Metric | What it measures | How collected (pilot) |
|---|---|---|
| **Activation & habit** | % of cohort with ≥3 sessions/week; median streak | Product analytics / progress export |
| **Completion** | Modules + seam drills finished in 4–6 weeks | Module/exercise completion flags |
| **Accuracy by topic** | Foundations, PI, Risk, Harbor, Timing, Multi-state, Capstone | Item-level correctness / XP by topic |
| **Accuracy by state cluster** | Coastal mega-states vs mid-size / plains / Carolinas teaching sets | State-tagged item performance |
| **Weak-area closure** | Reduction in flagged weak topics over weeks 1→4 | Progress “weak area” snapshots |
| **Time-to-competency proxy** | Days to ≥80% rolling accuracy on Timing + Multi-state | Derived from session logs |
| **Before/after scenario rubric** | Partner-scored 15–20 min hypo at kickoff vs week 5–6 | Rubric (matrix completeness, seam callouts, client-email clarity) scored 1–5 |
| **Qualitative** | Associate confidence & partner load perception | Short pulse survey (no fabricated benchmarks) |

**Hypothetical example (illustrative only—not a claim about expected results):** If 30 associates average 12 minutes/day for 5 weeks (~30 hours cohort-wide of deliberate practice) and partner-scored rubric medians rise from 2.5 → 3.5 on a 5-point scale, the firm has a concrete competency signal to weigh against pilot cost. Actual results will vary; the point of the pilot is to *measure*, not to assume.

---

## 7. Pilot Proposal

| Element | Proposal |
|---|---|
| **Cohort** | 20–40 associates in privacy/cyber (and adjacent IR/litigation as capacity allows) |
| **Duration** | 4–6 weeks |
| **Cadence** | 10–15 minutes/day, 4–5 days/week (PD-endorsed; practice group nudge) |
| **Path** | Foundations through Timing required; Multi-State + Capstone strongly encouraged; seam drills mandatory for “complete” status |
| **Sponsorship** | Practice Group Leader + PD lead; optional GC observer for risk posture |
| **Kickoff** | 30-minute intro + baseline scenario rubric |
| **Midpoint** | Week 3 weak-area review; partner office hours optional |
| **Close** | After scenario + metrics readout + go/no-go for SSO/LMS phase |

### Success criteria (example—tune with the firm)

Pilot is a **success** if, by the end of week 6:

1. **≥70%** of enrolled associates complete Foundations → Timing
2. **≥50%** complete at least one hard multi-state seam drill set
3. Cohort median accuracy on Timing & Multi-state items shows **clear lift** vs week-1 baseline (directionally upward; threshold set at kickoff)
4. Partner-scored before/after rubric improves for a majority of scored participants
5. No material risk/compliance objections to disclaimer posture or content process

Failure modes that still produce learning: low adoption (process fix), content gaps (update backlog), or rubric flatness (curriculum redesign)—all cheaper to discover in a pilot than after firm-wide rollout.

---

## 8. Product Roadmap

Phased so firms can buy the gym without waiting for every enterprise feature.

| Phase | Deliverable | Firm value |
|---|---|---|
| **0 — Prototype (now)** | Next.js micro-learning; 51 jurisdictions; lessons + seam drills; badges; local progress; educational disclaimer | Hands-on evaluation; pilot content |
| **1 — Firm pilot pack** | Cohort onboarding; progress export for PD; facilitator guide; baseline/after rubric templates | Measurable pilot without full IT lift |
| **2 — Firm SSO / LMS** | SSO (SAML/OIDC), roster sync, optional SCORM/xAPI or LTI-style completion signals | Fits enterprise learning stack; audit-friendly completion |
| **3 — Matter-type scenarios** | Playbooks by incident pattern (vendor SaaS export, ransomware-adjacent, insider snooping, credential dump) with jurisdiction mixes | Closer to live IR workflows |
| **4 — Admin analytics** | Practice-group dashboards: completion, accuracy heatmaps by topic/state, weak-area alerts | PD and practice leadership visibility |
| **5 — Content update SLA** | Documented review cadence for high-change jurisdictions (e.g., CA/NY/FL/CT teaching keys); change log for firm counsel | Currency risk mitigation |

**Explicit non-goals for early phases:** automated legal research citator; generative “opinion letter” drafting; replacement of partner review; HIPAA/GLBA full-domain coverage beyond narrative context.

---

## 9. Competitive Positioning

| Alternative | What it does well | Where BreachGym differs |
|---|---|---|
| **Generic CLE** | Credit hours; broad awareness | CLE rarely builds daily muscle memory or multi-state seam drills with weak-area tracking |
| **Static 50-state charts** | Fast lookup for experienced counsel | Charts do not train judgment under time pressure or test associate recall; BreachGym *uses* chart knowledge as curriculum fuel, then forces practice |
| **Internal wiki / Knowledge management** | Firm-specific nuance; matter history | Wikis are reference, not spaced practice; adoption is uneven; no XP/accuracy loop |
| **Generic corporate compliance LMS modules** | Scalable check-the-box | Wrong altitude for AmLaw associate work product and client-email discipline |
| **Partner apprenticeship alone** | Gold-standard judgment | Unscalable; creates bottlenecks and uneven exposure by office/matter luck |

**Positioning statement:** BreachGym is the deliberate-practice layer between the firm’s charts/wiki and live client work—practice-area-specific, 51-jurisdiction, seam-focused, and measurable for PD.

---

## 10. Commercial Options Sketch

*Illustrative placeholders only. Not market research. Not a quote. Bands are examples for internal discussion.*

| Option | Who it’s for | Illustrative annual band (example) | Includes (example) |
|---|---|---|---|
| **Enterprise pilot** | One practice group, 20–40 seats, 4–6 weeks (+ optional extension) | **Example:** low five figures flat, or mid three figures per seat for the pilot window | Curriculum access, facilitator pack, metrics readout, content as-of pilot start |
| **Per-seat firm license** | Expanding privacy/cyber bench | **Example:** mid–high three figures per associate seat / year | Ongoing access, badge/progress features available in product phase, standard content updates |
| **Practice-group / firm license** | Multi-office privacy/cyber + PD rollout | **Example:** mid five figures to low six figures / year depending on seats and SSO/analytics phase | SSO/LMS roadmap items as scoped, admin analytics, update SLA negotiation |

**Pricing principles (discussion):**

- Charge for **seats + firm features** (SSO, analytics, SLA)—not for “AI magic”
- Pilot priced to remove friction for a go/no-go decision
- Content currency work is a first-class cost; firms that need a formal update SLA should expect that in the enterprise band
- No invented ROI multipliers or “industry average savings” presented as fact

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Mistaken for legal advice** | Persistent educational disclaimer in-product and in firm rollout materials; facilitator script: “training gym, not opinion letter”; no pinpoint reliance culture |
| **Content currency / statutory change** | Soft wording where charts disagree; teaching keys for known high-change areas (e.g., CA SB-446 framing, NY 30-day outer bound); roadmap Content Update SLA; firm counsel review option for enterprise |
| **Adoption / “another portal” fatigue** | 10–15 min/day design; practice group sponsorship; badges tied to review narratives; pilot-sized cohort before firm-wide push |
| **IT / security review** | Prototype is client-side demo today; enterprise path targets SSO and firm-approved hosting; no requirement to paste confidential matter data into drills |
| **Scope creep into HIPAA/sector regimes** | Explicit out-of-scope except narrative context; keep core on state breach notification seams |
| **Partner skepticism of gamification** | Lead with rubric lift and weak-area analytics; XP/badges are habit scaffolding, not the value proposition |

---

## 12. Ask / Next Step

1. **Confirm pilot sponsors** — Practice Group Leader + PD (+ GC observer optional).
2. **Select cohort** — 20–40 privacy/cyber associates; set start date.
3. **Agree success criteria** — Use Section 7 as the baseline; edit thresholds in a 30-minute working session.
4. **Run kickoff** — Baseline scenario rubric + product walkthrough + disclaimer acknowledgment.
5. **Schedule week-6 readout** — Metrics, qualitative pulse, go/no-go on SSO/LMS and commercial path.

BreachGym exists to make associate readiness **visible, practiceable, and improvable**—so partners spend less time re-teaching the matrix, and more time supervising judgment that only experience can finish.

---

*Document version: firm-facing business plan for BreachGym prototype (Next.js micro-learning; 51 jurisdictions; seam drills; badges; progress; educational disclaimer). Illustrative commercial figures are examples only.*
