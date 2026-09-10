import { Module } from "@/lib/types";

export const MODULES: Module[] = [
  {
    id: "foundations",
    title: "Foundations",
    subtitle: "Owner/maintainer, access vs acquisition, and the multi-state matrix",
    emoji: "🧱",
    color: "from-ink to-aubergine",
    order: 1,
    exerciseId: "acquisition-snooping",
    lessonItems: [
      {
        id: "f-flash-owner",
        type: "flashcard",
        front: "Owner/licensee vs maintainer — duty split",
        back: "Most statutes put the primary resident-notice duty on the entity that owns or licenses the PI. A vendor that maintains PI for others must usually notify the owner/licensee promptly (often without unreasonable delay) so the owner can notify residents. Do not treat 'we are only the processor' as automatic no-duty — and do not assume the vendor letters the residents unless the contract or statute says so. Florida-style framing can also reach entities that acquire, maintain, store, or use PI more directly.",
        topic: "foundations",
        topics: ["owner-maintainer", "access-vs-acquisition"],
        states: ["FL", "CT", "IL", "TX"],
        xp: 12,
      },
      {
        id: "f-mcq-owner-vendor",
        type: "mcq",
        question:
          "A SaaS HR vendor hosts payroll files (name+SSN) for Midland Retail. Attackers exfiltrate Midland's files from the vendor. Midland owns the PI; the vendor maintains it. Best first-cut duty map?",
        options: [
          "Only the vendor must notify every resident; Midland has no statute role because it outsourced hosting",
          "Vendor generally notifies Midland promptly; Midland (owner/licensee) generally drives resident notice under applicable state statutes — contracts may add vendor notice obligations but do not erase the statutory owner pattern",
          "Neither notifies anyone until a federal agency orders it",
          "Only Florida residents matter because the vendor's servers are in AWS us-east-1",
        ],
        correctIndex: 1,
        explanation:
          "Associate trap: outsourcing hosting does not delete Midland's owner/licensee notice posture. Start with owner vs maintainer, then map resident geography.",
        topic: "foundations",
        topics: ["owner-maintainer"],
        states: ["FL", "IL", "TX", "GA"],
        xp: 18,
      },
      {
        id: "f-flash-access",
        type: "flashcard",
        front: "Access vs acquisition — why the verb matters",
        back: "Many statutes turn on unauthorized 'acquisition' of PI. New York's SHIELD teaching stresses whether private information was accessed or acquired — a 'view' is not automatically the same as exfiltration, but access-based compromise still requires careful mapping. Connecticut, Florida, and others also use acquisition-linked definitions paired with risk analyses. Never collapse every log-in anomaly into 'breach everywhere' — and never ignore confirmed access to unencrypted PI.",
        topic: "foundations",
        topics: ["access-vs-acquisition"],
        states: ["NY", "CT", "FL"],
        xp: 12,
      },
      {
        id: "f-mcq-access-ny",
        type: "mcq",
        question:
          "Insider opens a shared drive folder with NY residents' name+SSN, screenshots three files to a personal phone, and emails them off-network. Which framing is most associate-ready?",
        options: [
          "No notice analysis is needed because the insider was an employee with a badge",
          "Treat as unauthorized acquisition/access of private information for NY SHIELD analysis (and run the multi-state matrix for other residents) — insider status does not sanitize exfiltration",
          "Only acquisition by foreign APTs counts under any US state statute",
          "Screenshots are never personal information because they are images",
        ],
        correctIndex: 1,
        explanation:
          "Insider misuse that takes PI off-system is a classic acquisition/access fact pattern. Authorization boundaries and what left the environment drive the analysis.",
        topic: "foundations",
        topics: ["access-vs-acquisition"],
        states: ["NY", "NJ", "PA"],
        xp: 18,
      },
      {
        id: "f-mcq-matrix",
        type: "mcq",
        question: "Client email: 'We had an incident. Just follow California and we'll be fine for everyone else.' Your response?",
        options: [
          "Agree — California is always the strictest on every axis",
          "Reject: map residents across all affected jurisdictions, then apply each state's PI definition, acquisition/access verb, encryption harbor, risk test (if any), clocks, AG/regulator thresholds, and sequencing",
          "Wait 90 days so every numbered clock expires together",
          "Notify only if the CEO is a California resident",
        ],
        correctIndex: 1,
        explanation:
          "CA is often strict on some axes (e.g., no general risk escape; SB-446 individual clock) but not every axis (AG sequencing, thresholds, PI expansions differ). One incident → many rulebooks.",
        topic: "foundations",
        topics: ["multi-state-matrix"],
        states: ["CA", "TX", "FL", "OH", "DC"],
        xp: 18,
      },
      {
        id: "f-fill-trigger",
        type: "fillblank",
        prompt:
          "Core trigger pattern (Blank 1 = acquisition/access verb family; Blank 2 = encryption-status filter; Blank 3 = who the statute protects).",
        sentence:
          "Most statutes ask whether there was unauthorized ___ of ___ personal information of a state ___ .",
        blanks: [
          {
            id: "b1",
            answer: "acquisition",
            alternatives: ["access", "acquisition/access", "acquisition or access"],
          },
          {
            id: "b2",
            answer: "unencrypted",
            alternatives: [
              "unencrypted/unredacted",
              "unredacted",
              "nonencrypted",
              "non-encrypted",
              "plaintext",
              "cleartext",
            ],
          },
          { id: "b3", answer: "resident", alternatives: ["residents"] },
        ],
        explanation:
          "Exact verbs differ (access vs acquisition), but the teaching pattern is unauthorized acquisition/access of covered unencrypted PI of a resident — then apply exceptions, harbors, and risk tests. Do not stop at the slogan.",
        topic: "foundations",
        topics: ["access-vs-acquisition", "encryption-harbor"],
        xp: 16,
      },
      {
        id: "f-mcq-ga-fl-coverage",
        type: "mcq",
        question:
          "Coverage seam: Georgia vs Florida for a commercial data holder that is not a classic 'information broker.' Best teaching contrast?",
        options: [
          "Identical — both use the same acquire/maintain/store/use covered-entity frame and 500 AG path",
          "Florida teaching often reaches entities that acquire/maintain/store/use PI; Georgia private-sector teaching often centers on information brokers/data collectors, with generally no private-sector AG notice and a very high CRA threshold — do not import FL coverage into GA",
          "Georgia always requires AG notice at 50 residents like DC",
          "Florida never covers maintainers",
        ],
        correctIndex: 1,
        explanation:
          "Who is covered is a first-order trap. GA broker/collector culture ≠ FL acquire/maintain/store/use culture. Open the matrix before drafting letters.",
        topic: "foundations",
        topics: ["owner-maintainer", "multi-state-matrix"],
        states: ["GA", "FL"],
        xp: 20,
      },
      {
        id: "f-mcq-risk-families",
        type: "mcq",
        question:
          "Public bucket exposed name+SSN for four hours. Logs show only your IR team's test fetch; third-party download cannot be ruled out. Residents in CA/IL/GA and CT/MI/AZ. First-cut doctrinal split?",
        options: [
          "One national skip: clean-enough logs mean no notice anywhere",
          "Non-risk / acquisition-oriented teaching (CA/IL/GA) generally pushes toward notice for unencrypted name+SSN exposure; risk-assessment states (CT/MI/AZ) require investigate-and-document — not an automatic no-notice while download cannot be ruled out",
          "Only Arizona ever requires notice on bucket exposures",
          "Risk states always require notice faster than California",
        ],
        correctIndex: 1,
        explanation:
          "Foundations must teach the risk vs no-risk family split on Day 1. Same facts → different analytical paths. Ambiguous access is investigate-first in risk states, not 'skip forever.'",
        topic: "foundations",
        topics: ["risk-of-harm", "multi-state-matrix", "access-vs-acquisition"],
        states: ["CA", "IL", "GA", "CT", "MI", "AZ"],
        xp: 20,
      },
      {
        id: "f-mcq-clock-start",
        type: "mcq",
        question:
          "Discovery Day 0; you determine a breach on Day 12. Which statement about clock-start events is correct?",
        options: [
          "All numbered individual clocks start on Day 0 because discovery is universal",
          "Discovery-family outer bounds (e.g., CA/WA/NY teaching) count from Day 0; determination-family outer bounds (e.g., FL/CO/TX teaching) count from Day 12 — investigation quality affects when determination clocks begin",
          "Texas's individual clock always starts at discovery, never determination",
          "Clock-start events only matter for CRA notice",
        ],
        correctIndex: 1,
        explanation:
          "Clock-start events are a Foundations-level trap. Do not run every state from Discovery Day 0.",
        topic: "foundations",
        topics: ["timing-discovery", "timing-determination"],
        states: ["CA", "WA", "NY", "FL", "CO", "TX"],
        xp: 20,
      },
      {
        id: "f-narr-equifax",
        type: "narrative",
        title: "Equifax (2017) — orchestration, not definitions",
        emoji: "📉",
        story: [
          "Attackers exploited a web-app vulnerability and exfiltrated massive volumes of consumer data — names, SSNs, birth dates, addresses, and in some cases driver's license and credit data.",
          "For associates, the definitional question (is name+SSN personal information?) is rarely the hard part once classic identity fields are confirmed stolen.",
          "The real work is multi-state orchestration: resident geography, regulator thresholds, sequencing, content/method quirks, and remediation — under compressed clocks.",
        ],
        takeaway:
          "Classic identity data + confirmed exfiltration ≈ multi-state notice marathon. Foundations train the matrix, not 'what is a breach' flashcards.",
        quiz: {
          question: "Why is Equifax still useful training for state notice laws?",
          options: [
            "Because only one state's law applied",
            "Because it featured classic PI elements most state definitions treat as covered — shifting the hard work to timelines, regulators, and multi-state orchestration",
            "Because the data was only public LinkedIn profiles",
            "Because encryption safe harbor clearly applied to all records",
          ],
          correctIndex: 1,
          explanation:
            "Name paired with SSN sits at the common core of US state PI definitions. Equifax teaches scale and orchestration after the easy definitional call.",
        },
        topic: "foundations",
        topics: ["pi-definition", "multi-state-matrix"],
        xp: 20,
      },
      {
        id: "f-mcq-pi-combo",
        type: "mcq",
        question:
          "Export contains email, home address, and phone — no SSN, DL, account+access code, biometrics, or credentials. Classic TX/CT-style PI definitions?",
        options: [
          "Always a notice lock in every state because contact data is 'personal'",
          "Often insufficient for classic statutes that need a listed sensitive element paired with name/identifier — still check expansive states separately for their listed elements",
          "Only Maryland cares about addresses",
          "Automatically health information under every statute",
        ],
        correctIndex: 1,
        explanation:
          "Contact fields alone usually miss classic PI combinations. Expansive states still need their listed sensitive elements (credentials, medical, biometrics, etc.).",
        topic: "foundations",
        topics: ["pi-definition"],
        states: ["TX", "CT", "VA", "OH"],
        xp: 16,
      },
      {
        id: "f-flash-disclaimer",
        type: "flashcard",
        front: "Training rule you keep forever",
        back: "BreachGym is educational only — not legal advice. Thresholds, clocks, and definitions move. Confirm live primary sources before counseling clients. Soft teaching keys (CA SB-446, NY 30-day discovery outer bound, CT AG no-threshold, NJ risk + State Police, MD AG-before) are high-yield contrasts, not opinion letters.",
        topic: "foundations",
        topics: ["multi-state-matrix"],
        xp: 8,
      },
    ],
  },
  {
    id: "personal-information",
    title: "Personal Information Elements",
    subtitle: "What combinations count as PI",
    emoji: "🧬",
    color: "from-ink to-aubergine",
    order: 2,
    unlockAfter: "foundations",
    exerciseId: "pi-field-matrix",
    lessonItems: [
      {
        id: "pi-flash-1",
        type: "flashcard",
        front: "California PI — big expansions to remember",
        back: "Beyond name+SSN/DL/account+access: medical/health insurance info, unique biometrics, and username/email + password or security Q&A that permits online account access. (Civ. Code § 1798.82 family.)",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["CA"],
        xp: 10,
      },
      {
        id: "pi-flash-2",
        type: "flashcard",
        front: "New York SHIELD Act 'private information'",
        back: "SHIELD expanded covered data: classic identifiers plus medical information, health insurance information, biometrics, and username/email + password or security question/answer. Think broader than old-school financial-only lists.",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["NY"],
        xp: 10,
      },
      {
        id: "pi-flash-3",
        type: "flashcard",
        front: "Colorado wrinkle",
        back: "Colorado's definition can reach certain credential and account+code combinations even when the fact pattern doesn't look like classic name+SSN. Always check CO when credentials leak.",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["CO"],
        xp: 10,
      },
      {
        id: "pi-mcq-1",
        type: "mcq",
        question: "Name + email + home address only (no SSN/DL/account+access/biometrics/credentials). Classic TX/CT-style statutes?",
        options: [
          "Always a breach notice lock in every state",
          "Often insufficient for classic 'personal information' definitions that need a sensitive data element",
          "Only Maryland cares about addresses",
          "Automatically health information",
        ],
        correctIndex: 1,
        explanation:
          "Contact data alone usually is not enough for classic statutes. Expansive states still need their listed sensitive elements (credentials, medical, biometrics, etc.).",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["TX", "CT"],
        xp: 15,
      },
      {
        id: "pi-fill-1",
        type: "fillblank",
        prompt: "Credential combo teaching phrase",
        sentence:
          "In CA, NY, and CO, a ___ or email address plus a ___ (or security Q&A) that permits account access can be covered.",
        blanks: [
          { id: "b1", answer: "username", alternatives: ["user name"] },
          { id: "b2", answer: "password", alternatives: ["passcode"] },
        ],
        explanation:
          "Credential combinations are a major modern expansion beyond name+SSN.",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["CA", "NY", "CO"],
        xp: 15,
      },
      {
        id: "pi-mcq-2",
        type: "mcq",
        question: "Payroll export for IL residents includes name + fingerprint templates used for timeclocks (no SSN). Associate-ready call?",
        options: [
          "Biometrics never appear in Illinois breach PI concepts — skip IL",
          "Unique biometric data is in-play for Illinois PI breach concepts — treat biometric fields as covered elements and continue the matrix",
          "Only paper records are regulated in Illinois",
          "Illinois has no breach statute",
        ],
        correctIndex: 1,
        explanation:
          "Illinois PIPA includes biometric data in personal information concepts — and Illinois is famous for biometric privacy culture generally.",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["IL"],
        xp: 15,
      },
      {
        id: "pi-flash-il-creds",
        type: "flashcard",
        front: "Illinois credential combo",
        back: "Illinois PI highlights also include username/email + password or security question/answer — treat credential leaks as in-play for IL, not only biometrics and classic name+SSN.",
        topic: "personal-information",
        topics: ["pi-definition"],
        states: ["IL"],
        xp: 10,
      },
      {
        id: "pi-narr-capitalone",
        type: "narrative",
        title: "Capital One (2019)",
        emoji: "☁️",
        story: [
          "A misconfigured cloud firewall / WAF situation allowed an attacker to access data stored in the cloud — credit card applications and customer information for a huge population.",
          "The case is a staple cloud-misconfiguration teaching story: buckets, roles, and metadata matter as much as 'did someone phish a password?'",
          "PI lesson: application data often mixes names with SSNs, bank info, and government IDs — the definitional analysis is rarely the hard part once those fields are present.",
        ],
        takeaway:
          "Cloud misconfig + rich onboarding data = multi-state PI bingo. Focus drills on scope, encryption, and who is a resident of where.",
        quiz: {
          question: "Capital One is especially useful to illustrate…",
          options: [
            "That only on-premises databases can be breached",
            "How cloud misconfiguration can expose classic PI fields at scale",
            "That email addresses alone always require AG notice",
            "That Texas does not have a breach statute",
          ],
          correctIndex: 1,
          explanation:
            "Cloud shared-responsibility failures are modern breach bread-and-butter.",
        },
        topic: "personal-information",
        topics: ["pi-definition"],
        xp: 20,
      },
    ],
  },
  {
    id: "risk-of-harm",
    title: "Risk of Harm",
    subtitle: "When investigation changes the notice answer",
    emoji: "⚖️",
    color: "from-ink to-aubergine",
    order: 3,
    unlockAfter: "personal-information",
    exerciseId: "risk-harm-email",
    lessonItems: [
      {
        id: "r-flash-1",
        type: "flashcard",
        front: "Risk-of-harm states (BreachGym set)",
        back: "Risk/misuse-oriented examples: CT, FL, CO, WA, VA, MD, NJ, plus less-taught cousins AK (AG-noticed no-harm), MI, AZ, AL, ID, AR, IA, and many others. Some bake risk into the breach definition (OH/HI/SC). MA uses substantial-risk-of-ID-theft/fraud framing. Contrast with generally non-risk / acquisition-oriented teaching for classic unencrypted PI: CA, IL, GA (and often TX).",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["CT", "FL", "CO", "WA", "VA", "MD", "NJ"],
        xp: 10,
      },
      {
        id: "r-flash-2",
        type: "flashcard",
        front: "Connecticut in one sentence",
        back: "Poster-child risk state: after investigation, notice is generally not required if the breach will not likely result in harm (misuse / identity theft / fraud). Exposure alone is not the whole analysis — document the investigation.",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["CT"],
        xp: 10,
      },
      {
        id: "r-flash-nj",
        type: "flashcard",
        front: "New Jersey risk / misuse standard",
        back: "NJ is risk/misuse-oriented: notice is not required if the business establishes that misuse of the PI is not reasonably possible. Document that determination and retain it for 5 years. Also: notify State Police before customer notice.",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["NJ"],
        xp: 10,
      },
      {
        id: "r-flash-ma",
        type: "flashcard",
        front: "Massachusetts substantial-risk framing",
        back: "MA notice teaching centers on unauthorized acquisition/use that creates a substantial risk of identity theft or fraud — risk-adjacent, paired with strict encryption / WISP culture.",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["MA"],
        xp: 10,
      },
      {
        id: "r-mcq-1",
        type: "mcq",
        question: "Unencrypted name+SSN confirmed downloaded by an attacker. California vs Connecticut?",
        options: [
          "Both clearly skip notice due to 'no harm yet'",
          "CA: generally notify; CT: risk analysis still required but on these facts misuse possibility is high → practically notify",
          "Only CT requires notice; CA never does",
          "Neither statute covers SSNs",
        ],
        correctIndex: 1,
        explanation:
          "CA lacks a general risk escape hatch. CT requires risk analysis — but confirmed attacker theft of SSN usually flunks that analysis fast.",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["CA", "CT"],
        xp: 15,
      },
      {
        id: "r-fill-1",
        type: "fillblank",
        prompt: "Florida's teaching hook",
        sentence:
          "Florida asks whether there is a reasonable likelihood personal information has been or will be ___.",
        blanks: [{ id: "b1", answer: "misused", alternatives: ["misuse"] }],
        explanation:
          "Document the investigation. Risk statutes reward rigorous facts, not vibes.",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["FL"],
        xp: 15,
      },
      {
        id: "r-mcq-2",
        type: "mcq",
        question: "Virginia breach-notice risk framing (distinct from VCDPA) is closest to…",
        options: [
          "Identity theft / fraud oriented belief about harm after unauthorized acquisition",
          "Strict liability for any email typo regardless of data elements",
          "Paper mail theft only — electronic incidents are excluded",
          "Federal FOIA disclosure standards",
        ],
        correctIndex: 0,
        explanation:
          "VA's breach notice statute is taught as risk/identity-theft oriented — and is distinct from VCDPA privacy law.",
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        states: ["VA"],
        xp: 15,
      },
      {
        id: "r-narr-target",
        type: "narrative",
        title: "Target (2013)",
        emoji: "🛒",
        story: [
          "Attackers used vendor credentials / network pathways to reach point-of-sale environments and steal payment card data at enormous scale during the holiday season.",
          "The incident reshaped retailer cybersecurity expectations and showed how payment data + customer records create cascading contractual, card-brand, and state-notice issues.",
          "Risk lesson: when criminals clearly obtained payment data, risk-of-harm arguments collapse — the strategic work becomes timing, regulators, and consumer trust.",
        ],
        takeaway:
          "Risk statutes are not 'get out of notice free' cards when exfiltration and misuse potential are obvious.",
        quiz: {
          question: "In a Target-like confirmed card-data theft, risk-of-harm states usually…",
          options: [
            "Still easily excuse all notice",
            "Still generally require notice because misuse is reasonably likely",
            "Apply only to paper receipts",
            "Are preempted by PCI forever",
          ],
          correctIndex: 1,
          explanation:
            "Risk analysis cuts both ways — it can excuse low-risk edge cases and confirm notice in clear theft cases.",
        },
        topic: "risk-of-harm",
        topics: ["risk-of-harm"],
        xp: 20,
      },
    ],
  },
  {
    id: "safe-harbors",
    title: "Safe Harbors",
    subtitle: "Encryption and when it actually saves you",
    emoji: "🛡️",
    color: "from-ink to-aubergine",
    order: 4,
    unlockAfter: "risk-of-harm",
    exerciseId: "encrypted-laptop",
    lessonItems: [
      {
        id: "s-flash-1",
        type: "flashcard",
        front: "Encryption safe harbor — the shared idea",
        back: "If PI is encrypted (or otherwise rendered unreadable) AND the encryption key / means to decrypt was not acquired, most states do not treat that data set as a notice-triggering breach.",
        topic: "safe-harbors",
        topics: ["encryption-harbor"],
        xp: 10,
      },
      {
        id: "s-flash-2",
        type: "flashcard",
        front: "Massachusetts angle",
        back: "MA is famous for encryption expectations (and 201 CMR 17.00 WISP culture). A lost laptop with strong full-disk encryption and no key compromise is the canonical safe-harbor hypo — process failures can still be a separate problem.",
        topic: "safe-harbors",
        topics: ["encryption-harbor"],
        states: ["MA"],
        xp: 10,
      },
      {
        id: "s-mcq-1",
        type: "mcq",
        question: "Encrypted DB columns, but plaintext replica in a search index was stolen. Safe harbor?",
        options: [
          "Yes for everything because the 'primary' DB was encrypted",
          "No complete harbor — plaintext copies still carry notice risk for those records",
          "Only Texas cares about replicas",
          "Safe harbor doubles if you used two vendors",
        ],
        correctIndex: 1,
        explanation:
          "Encryption protects the ciphertext you actually encrypted. Shadow copies and indexes are perennial gotchas.",
        topic: "safe-harbors",
        topics: ["encryption-harbor"],
        xp: 15,
      },
      {
        id: "s-fill-1",
        type: "fillblank",
        prompt: "Key rule",
        sentence:
          "Safe harbor usually fails if the attacker also obtained the ___ needed to decrypt the data.",
        blanks: [
          { id: "b1", answer: "key", alternatives: ["keys", "passphrase", "password", "encryption key"] },
        ],
        explanation:
          "Device + sticky note with password is not a safe harbor bedtime story.",
        topic: "safe-harbors",
        topics: ["encryption-harbor"],
        xp: 15,
      },
      {
        id: "s-narr-change",
        type: "narrative",
        title: "Change Healthcare (2024)",
        emoji: "🏥",
        story: [
          "A ransomware attack on a major healthcare clearinghouse disrupted claims and exposed sensitive data concerns across the health ecosystem.",
          "It became a modern lesson in third-party concentration risk: when critical vendors go down — or are breached — hundreds of covered entities scramble on notice, contracting, and continuity.",
          "Safe harbor angle: ransomware encrypting *your systems* is not the same as *your data having been protected by encryption before theft*. Exfiltration analysis still rules.",
        ],
        takeaway:
          "Vendor ransomware ≠ automatic safe harbor. Ask what data left, in what form, and who the residents are.",
        quiz: {
          question: "Ransomware on a vendor means…",
          options: [
            "Automatic encryption safe harbor for all customers",
            "You must still analyze acquisition/exfiltration and data form (encrypted at rest vs stolen plaintext)",
            "Only HIPAA matters; state law never applies to health data",
            "Notice is illegal",
          ],
          correctIndex: 1,
          explanation:
            "Separate 'systems locked by ransomware' from 'was PI acquired unencrypted.'",
        },
        topic: "safe-harbors",
        topics: ["encryption-harbor"],
        xp: 20,
      },
      {
        id: "s-mcq-2",
        type: "mcq",
        question: "Stolen FileVault laptop, strong passphrase not compromised, name+SSN on disk. Teaching answer across CA/NY/MA/IL/VA?",
        options: [
          "Safe harbor likely applies to that encrypted volume",
          "Every state still requires newspaper notice within 24h",
          "Only if the laptop was pink",
          "Safe harbor never exists anywhere",
        ],
        correctIndex: 0,
        explanation:
          "This is the clean hypo. Messy realities (cloud sync plaintext, browser sessions, keyloggers) can still complicate real advice.",
        topic: "safe-harbors",
        topics: ["encryption-harbor"],
        states: ["CA", "NY", "MA", "IL", "VA"],
        xp: 15,
      },
    ],
  },
  {
    id: "timing-recipients",
    title: "Timing & Recipients",
    subtitle: "Clocks, AGs, and CRAs — which clock starts when?",
    emoji: "⏱️",
    color: "from-ink to-aubergine",
    order: 5,
    unlockAfter: "safe-harbors",
    exerciseId: "timeline-race-day25",
    exerciseIds: ["timeline-race-day25", "sequencing-md-nj", "ag-threshold-trap"],
    lessonItems: [
      {
        id: "t-flash-1",
        type: "flashcard",
        front: "Two timeline families",
        back: "Open-textured 'most expedient / without unreasonable delay' (e.g., IL, VA, NJ…) vs numbered outer bounds. California is NOT only in the open-textured family: individual notice within 30 calendar days of discovery/notification (SB-446 / 2026). NY also has expedient + in any event within 30 days after discovery. Other contrasts: FL/WA/CO ~30 (determination or discovery), MD ~45 discovery, TX/CT ~60 determination/discovery — verify live.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        xp: 10,
      },
      {
        id: "t-flash-2",
        type: "flashcard",
        front: "Sequencing wrinkles: MD AG & NJ State Police",
        back: "Maryland: notify the Attorney General *before* notifying individuals. New Jersey: notify State Police *before* customer notice. Both are multi-state project-management traps — put regulator/police notice on the critical path before consumer letters.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["MD", "NJ"],
        xp: 10,
      },
      {
        id: "t-flash-3",
        type: "flashcard",
        front: "AG thresholds (BreachGym cheatsheet)",
        back: "Examples: CA sample notice if >500 CA residents *notified* (then AG within 15 days after consumer notice); IL >500; TX ≥250; FL/CO/WA 500+; NM >1,000 notified; VA often >1000. No-minimum AG cousins: CT/VT/ME and NH (RSA 359-C:20 — AG whenever notice required; 1,000 is CRA/substitute-notice economics, not an AG gate). Thresholds change — confirm before filing.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        xp: 10,
      },
      {
        id: "t-flash-ca-30",
        type: "flashcard",
        front: "California individual + AG clocks (SB-446 / 2026)",
        back: "Individuals: within 30 calendar days of discovery/notification (LE/scope carveouts may briefly apply). If >500 CA residents are notified → AG sample notice within 15 calendar days AFTER consumer notice. Do not file CA only under the old open-textured 'most expedient' family.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["CA"],
        xp: 10,
      },
      {
        id: "t-flash-ny-30",
        type: "flashcard",
        front: "New York 30-day discovery outer bound",
        back: "GBL §899-aa (Dec 2024 amendment): individual and maintainer notice must be most expedient / without unreasonable delay, and in any event within 30 days after discovery (law-enforcement delay only).",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["NY"],
        xp: 10,
      },
      {
        id: "t-flash-clocks",
        type: "flashcard",
        front: "Discovery clock vs determination clock",
        back: "Discovery-clock states (e.g., WA ~30 days after discovery; MD ~45 after discovery/notification; NY ≤30 after discovery; CA ≤30 after discovery/notification) start when you learn of the incident. Determination-clock states (e.g., FL/CO ~30; TX individual commonly ≤60 / AG commonly ≤30 after determination) start when you determine a breach occurred — investigation quality matters for when that clock begins; do not treat the start event as automatic on Day 0.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        xp: 10,
      },
      {
        id: "t-flash-tx-ag",
        type: "flashcard",
        front: "Texas AG timing (≥250)",
        back: "When ≥250 Texas residents are affected, AG notice is commonly taught as soon as practicable and not later than 30 days after the entity determines a breach occurred. Separate from the individual ~60-day determination outer bound. Treat the start event as determination — investigation quality affects when that clock begins; verify live.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["TX"],
        xp: 10,
      },
      {
        id: "t-mcq-1",
        type: "mcq",
        question: "Florida individual notice outer bound often taught as…",
        options: [
          "30 days after determination (expeditiously as practicable, with limited extensions)",
          "18 months",
          "Same day as discovery always",
          "Only after criminal sentencing",
        ],
        correctIndex: 0,
        explanation:
          "FL's 30-day determination clock is a high-yield contrast with discovery-clock states and with CA's 30-day discovery/notification individual clock (plus CA's AG-after-consumer sequencing).",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["FL"],
        xp: 15,
      },
      {
        id: "t-fill-1",
        type: "fillblank",
        prompt: "Texas AG threshold",
        sentence: "Texas AG notice is commonly taught as applying at ___ or more Texas residents.",
        blanks: [{ id: "b1", answer: "250", alternatives: ["two hundred fifty"] }],
        explanation: "250 is a memorable TX contrast vs the many 500+ states.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["TX"],
        xp: 15,
      },
      {
        id: "t-mcq-2",
        type: "mcq",
        question: "Recipient map beyond individuals and AGs — when do major CRAs typically enter?",
        options: [
          "When resident counts cross statutory CRA triggers (often 1,000+ in many states; confirm each statute — GA teaching is much higher)",
          "Only after a federal indictment",
          "Only if the entity has a FCRA furnishership agreement",
          "CRAs are never part of state breach notice statutes",
        ],
        correctIndex: 0,
        explanation:
          "CRA notice (and sometimes sector regulators / other agencies) is part of the recipient map.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        xp: 15,
      },
      {
        id: "t-mcq-3",
        type: "mcq",
        question: "Washington outer bound commonly drilled as…",
        options: [
          "No later than 30 days after discovery (with exceptions)",
          "Five years",
          "Only leap days",
          "Instantaneous telepathy",
        ],
        correctIndex: 0,
        explanation:
          "WA pairs a risk analysis with a concrete timing expectation — great exam contrast with determination-clock states (FL/CO/TX).",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold"],
        states: ["WA"],
        xp: 15,
      },
      {
        id: "t-mcq-clock-family",
        type: "mcq",
        question:
          "Discovery Day 0. You determine a breach on Day 12. Which statement about clock families is correct?",
        options: [
          "FL's individual outer bound runs from Day 0 because all clocks are discovery clocks",
          "CA/WA/NY individual outer bounds are discovery-family (count from Day 0); FL/CO/TX individual outer bounds are determination-family (count from Day 12)",
          "TX's 60-day individual clock always starts at discovery, never determination",
          "CT's 60-day clock starts only after AG notice is filed",
        ],
        correctIndex: 1,
        explanation:
          "Seam drill: discovery clocks (CA ≤30 discovery/notification; WA ≤30 discovery; NY ≤30 after discovery; CT ≤60 discovery) vs determination clocks (FL ≤30 after determination; CO ≤30 after determination; TX ≤60 after determination). Same facts → different start dates.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["CA", "WA", "NY", "FL", "CO", "TX", "CT"],
        xp: 20,
      },
      {
        id: "t-mcq-ca-ag15",
        type: "mcq",
        question:
          "CA SB-446 sequencing: you notified 612 CA residents on Day 18. When is the AG sample due?",
        options: [
          "Anytime before consumer notice, because AG always comes first in CA",
          "Within 15 calendar days AFTER consumer notice (Day 18 + 15), because >500 CA residents were notified",
          "Only if ≥250 CA residents — same as Texas",
          "Never — California has no AG notice path",
        ],
        correctIndex: 1,
        explanation:
          "Contrast: CA AG sample is AFTER consumer notice when >500 CA residents are notified (15-day post-notice clock). Do not import Maryland's AG-before-individuals rule into California.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["CA"],
        xp: 20,
      },
      {
        id: "t-mcq-ct-ag-trap",
        type: "mcq",
        question:
          "You will notify 180 CT residents, 600 CA residents, and 300 TX residents. Which AG map is right?",
        options: [
          "Only CA and TX — CT needs 500+ like 'most states'",
          "CT yes (no headcount minimum whenever residents are notified); CA yes (>500 notified); TX yes (≥250)",
          "Only TX, because 250 is the universal AG floor",
          "None until 1,000 nationwide",
        ],
        correctIndex: 1,
        explanation:
          "Trap: stuffing CT into the 500+ AG bucket. Connecticut AG notice whenever CT residents are notified — no resident headcount minimum. CA >500 notified; TX ≥250.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        states: ["CT", "CA", "TX"],
        xp: 20,
      },
      {
        id: "t-flash-strictest",
        type: "flashcard",
        front: "Multi-state strictest-clock rule",
        back: "Plan the IR timeline to the shortest applicable fixed outer bound among affected states. Example: CA/WA/NY discovery ≤30 often forces an earlier consumer-notice target than TX's ≤60-after-determination individual clock — even when determination lands mid-investigation.",
        topic: "timing",
        topics: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
        xp: 10,
      },
    ],
  },
  {
    id: "multi-state",
    title: "Multi-State Scenarios",
    subtitle: "50-state + DC matrix thinking — seams that trip associates",
    emoji: "🗺️",
    color: "from-ink to-aubergine",
    order: 6,
    unlockAfter: "timing-recipients",
    exerciseId: "multi-state-matrix",
    exerciseIds: [
      "multi-state-matrix",
      "public-bucket-risk-seam",
      "credential-only-dump",
      "medical-only-fields",
      "ag-threshold-trap",
      "midwest-45-day-race",
      "plains-carolinas-ag-map",
    ],
    lessonItems: [
      {
        id: "m-flash-1",
        type: "flashcard",
        front: "Build the matrix columns (all 51 jurisdictions)",
        back: "Residents by state/DC → PI triggered? → Acquisition/access? → Encryption harbor? → Risk test apply/result? → Individual deadline family → AG/regulator? → Sequencing? → CRA? → Content/method quirks. Never answer with one 'national' rule.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        xp: 10,
      },
      {
        id: "m-mcq-1",
        type: "mcq",
        question:
          "Confirmed phishing exfiltration of payroll (name, SSN, bank+routing) for residents in CA, TX, FL, CT, OH, and AK. First-cut notice map?",
        options: [
          "Nobody — phishing is excluded everywhere",
          "Likely notice across the board; risk/material-risk states (FL/CT/OH/AK) still light up because misuse / ID-theft risk is reasonably clear on these facts",
          "Only CT and AK, because risk states are 'stricter' on notice",
          "Only notify if the CEO is a resident",
        ],
        correctIndex: 1,
        explanation:
          "Contrast: CA/TX lack a general risk escape for classic unencrypted PI acquisition. FL/CT/AK/OH are risk-oriented — but confirmed attacker theft of SSN/bank data usually flunks those analyses fast. Same facts → different doctrinal paths → same practical notice outcome here.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["CA", "TX", "FL", "CT", "OH", "AK"],
        xp: 20,
      },
      {
        id: "m-mcq-public-bucket",
        type: "mcq",
        question:
          "Public S3 bucket exposed name+SSN for 6 hours; only your team's test fetch is logged; third-party download cannot be ruled out. Residents in CA, GA, IL vs CT, MI, AZ, ID. Best associate framing?",
        options: [
          "One national answer: everyone skips notice because logs are 'clean enough'",
          "Non-risk / acquisition-oriented states (e.g., CA/GA/IL teaching) generally push toward notice on unencrypted name+SSN exposure; risk-assessment states (CT/MI/AZ/ID) require investigate-and-document — not a clean automatic no-notice while download cannot be ruled out",
          "Only Idaho ever requires notice",
          "Risk states always require notice faster than California",
        ],
        correctIndex: 1,
        explanation:
          "This is the risk vs no-risk seam. CA/IL/GA generally do not offer a CT-style escape once unencrypted PI is in a security-system breach/exposure pattern. CT/MI/AZ/ID demand a documented harm/misuse analysis — ambiguous access is investigate-first, not 'skip forever.'",
        topic: "multi-state",
        topics: ["multi-state-matrix", "risk-of-harm"],
        states: ["CA", "GA", "IL", "CT", "MI", "AZ", "ID"],
        xp: 20,
      },
      {
        id: "m-mcq-45-day",
        type: "mcq",
        question:
          "Discovery Day 0 for a clear notice event. Which cluster shares a ~45-day individual outer-bound teaching family?",
        options: [
          "Only California and Washington",
          "Examples: AL, AZ, IN, NM, OH, OR, RI, TN, VT, WI (and MD's 45-day discovery family) — contrast with CA/WA/NY/ME ~30 and CT/DE/LA/SD/TX ~60",
          "Every state is exactly 72 hours",
          "Only Wyoming and Montana",
        ],
        correctIndex: 1,
        explanation:
          "Do not over-index on CA/NY/TX/FL. Mid-size 45-day states are high-yield for multi-state planning — OH/AZ/WI/OR/RI and peers often force the calendar even when larger states feel 'familiar.'",
        topic: "multi-state",
        topics: ["multi-state-matrix", "timing-discovery", "timing-determination"],
        states: ["AL", "AZ", "IN", "NM", "OH", "OR", "RI", "TN", "VT", "WI", "MD"],
        xp: 20,
      },
      {
        id: "m-mcq-ag-low",
        type: "mcq",
        question:
          "AG / regulator threshold trap: 80 residents each in DC, VT, CT, ME vs 80 in WI, OH, MS. Who is most likely on the regulator-notice critical path?",
        options: [
          "Only Wisconsin — Midwest states always file first",
          "DC (AG path often taught at 50+), plus VT/CT/ME (AG/regulator whenever residents are notified / no classic 500 headcount) — WI/OH/MS often have no general commercial AG filing at that size",
          "All six equally at 80 residents because 'AG always at 500'",
          "None until 10,000 nationwide",
        ],
        correctIndex: 1,
        explanation:
          "Contrast DC's unusually low ~50 AG threshold and no-minimum AG states (CT/VT/ME teaching) with no-general-AG states (WI/OH/MS teaching). Headcount arithmetic is jurisdiction-specific.",
        topic: "multi-state",
        topics: ["multi-state-matrix", "ag-threshold"],
        states: ["DC", "VT", "CT", "ME", "WI", "OH", "MS"],
        xp: 20,
      },
      {
        id: "m-fill-1",
        type: "fillblank",
        prompt: "Sequencing cousins",
        sentence:
          "Maryland requires ___ notice before individuals; New Jersey requires State Police before customers; New Hampshire requires AG whenever individuals must be notified (no ___ AG floor — that number is CRA/substitute-notice economics).",
        blanks: [
          { id: "b1", answer: "AG", alternatives: ["attorney general", "Maryland AG"] },
          { id: "b2", answer: "1000", alternatives: ["1,000", "one thousand", "1k"] },
        ],
        explanation:
          "MD and NJ are always-on sequencing traps; NH is an AG-whenever / AG-before cousin without a 1,000 AG gate. Put regulator/police notice on the critical path before consumer email blasts.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["MD", "NJ", "NH"],
        xp: 15,
      },
      {
        id: "m-mcq-ak-exception",
        type: "mcq",
        question:
          "Alaska no-harm path — what extra step distinguishes AK from a casual 'we decided no harm' email?",
        options: [
          "Nothing — vibes are enough",
          "After appropriate investigation, provide written notice to the Alaska AG, document the no-likelihood-of-harm determination, and retain documentation (commonly taught as 5 years)",
          "Only call California's AG",
          "Publish the determination on the front page of a newspaper",
        ],
        correctIndex: 1,
        explanation:
          "Alaska's risk exception is not informal. Written AG notice + durable documentation is the teaching wrinkle — contrast with states that allow internal-only no-harm memos.",
        topic: "multi-state",
        topics: ["multi-state-matrix", "risk-of-harm"],
        states: ["AK"],
        xp: 20,
      },
      {
        id: "m-mcq-ia-seq",
        type: "mcq",
        question:
          "Iowa AG sequencing vs Maryland: you will notify 600 IA residents. Best teaching contrast?",
        options: [
          "Iowa AG must be notified before any consumer letter, exactly like Maryland",
          "Iowa: when >500 residents are notified, written AG Consumer Protection notice is commonly taught within 5 business days AFTER consumer notice — opposite sequencing instinct from Maryland's AG-before-individuals rule",
          "Iowa never has AG notice",
          "Iowa and Maryland are identical clocks",
        ],
        correctIndex: 1,
        explanation:
          "Sequencing seams matter as much as day-counts. IA post-consumer AG clock ≠ MD pre-consumer AG clock ≠ CA AG sample 15 days after consumer notice when >500 CA residents notified.",
        topic: "multi-state",
        topics: ["multi-state-matrix", "sequencing"],
        states: ["IA", "MD", "CA"],
        xp: 20,
      },
      {
        id: "m-flash-nd",
        type: "flashcard",
        front: "North Dakota PI breadth trap",
        back: "ND is often taught with an unusually broad personal information list (elements beyond classic name+SSN/DL/account — e.g., DOB / maiden-name style teaching points). A hypo that 'misses' TX-classic PI can still fire ND. Always open the matrix — do not assume classic-only definitions nationwide.",
        topic: "multi-state",
        topics: ["multi-state-matrix", "pi-definition"],
        states: ["ND", "TX"],
        xp: 10,
      },
      {
        id: "m-mcq-ga-broker",
        type: "mcq",
        question:
          "Georgia coverage / regulator contrast vs Florida in a vendor incident?",
        options: [
          "Identical — both use the same 'covered entity acquire/maintain/store/use' framing and 500 AG threshold",
          "Georgia teaching often centers on information brokers/data collectors, generally no private-sector AG notice, and CRA notice at a very high 10,000+ threshold; Florida uses broader acquire/maintain/store/use covered-entity framing plus 500+ DLA notice and a 30-day determination clock",
          "Georgia always requires AG notice at 50 residents like DC",
          "Florida never covers maintainers",
        ],
        correctIndex: 1,
        explanation:
          "Less-taught coverage gates and CRA/AG thresholds are associate tripwires. GA ≠ FL even when both are 'Southeast.'",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["GA", "FL"],
        xp: 20,
      },
      {
        id: "m-narr-moveit",
        type: "narrative",
        title: "MOVEit (2023)",
        emoji: "📦",
        story: [
          "A vulnerability in widely used managed-file-transfer software (MOVEit Transfer) led to mass exploitation and cascading downstream disclosures across governments, banks, benefits admins, and corporations.",
          "Associates saw the nightmare scenario: your client may be a controller, a vendor, or a customer's customer — notice duties and contractual flow-downs multiply across all 50 states + DC.",
          "Multi-state lesson: shared vendor incidents create staggered discovery dates, messy resident counts from Anchorage to Providence, and pressure to keep matrices living documents — including mid-size 45-day and no-AG states, not only CA/NY/TX/FL.",
        ],
        takeaway:
          "Vendor-platform incidents are matrix warfare across 51 jurisdictions. Track discovery clocks per entity and data set.",
        quiz: {
          question: "MOVEit-style events are hard because…",
          options: [
            "Only one company ever uses the software",
            "Cascading vendor relationships multiply who must analyze notice duties and when clocks start in every affected state/DC",
            "State laws do not apply to file transfer tools",
            "SSNs are never in file transfers",
          ],
          correctIndex: 1,
          explanation:
            "Discovery, ownership, and residency get messy in supply-chain breaches — and mid-size states still have clocks.",
        },
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        xp: 20,
      },
      {
        id: "m-mcq-2",
        type: "mcq",
        question:
          "Mountain / Plains mix: UT (AG + Cyber Center at 500+), WY (often no AG), ND (AG at 250+, broad PI). Why rotate drills through these?",
        options: [
          "They never apply if California residents exist",
          "Associates over-index on coastal mega-states and miss threshold, PI-breadth, and no-AG seams that change the regulator map and definitional analysis",
          "Only oil companies care about these statutes",
          "They all share California's 30-day SB-446 clock",
        ],
        correctIndex: 1,
        explanation:
          "Equal teaching weight means UT/WY/ND (and peers) appear in hard hypos — not as trivia footnotes.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["UT", "WY", "ND"],
        xp: 15,
      },
      {
        id: "m-mcq-la-sd",
        type: "mcq",
        question:
          "Louisiana vs South Dakota timing/AG contrast after discovery Day 0 of a clear notice event:",
        options: [
          "Both are discovery ≤30 clocks with AG at 500+ only",
          "Both commonly taught with ~60-day outer bounds; LA AG notice is tied to resident notice (often with a short post-consumer package timing teaching point), while SD AG is commonly taught at >250 residents — related clocks, different regulator math",
          "Only Louisiana ever requires AG notice in the United States",
          "South Dakota has no breach statute",
        ],
        correctIndex: 1,
        explanation:
          "LA and SD sit in the ~60-day family with TX/CT/DE cousins, but AG thresholds and package content differ. Do not collapse '60-day states' into one filing checklist.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["LA", "SD", "TX", "CT", "DE"],
        xp: 20,
      },
      {
        id: "m-mcq-pa-ok-mo",
        type: "mcq",
        question:
          "AG threshold cluster: PA (>500), OK (500+ teaching), MO (>1,000). Partner says '500 is universal.' Best reply?",
        options: [
          "Agree — file every AG at 500 nationwide",
          "Disagree — Pennsylvania and Oklahoma often sit near the 500 band, but Missouri's AG teaching commonly starts above 1,000; other states use 250, 50 (DC), or no minimum (CT/VT/ME)",
          "Missouri never has an AG path",
          "Oklahoma always requires AG before individuals like Maryland",
        ],
        correctIndex: 1,
        explanation:
          "Threshold seams across PA/OK/MO (and DC/CT/TX/OR) are associate traps. Open the matrix instead of recycling a '500' meme.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["PA", "OK", "MO", "DC", "CT", "TX", "OR"],
        xp: 20,
      },
      {
        id: "m-flash-mt-ne-nc",
        type: "flashcard",
        front: "MT / NE / NC — low-headcount AG cousins",
        back: "Montana, Nebraska, and North Carolina are commonly taught with AG/Consumer Protection notice when residents are notified — without a high classic 500+ floor. Contrast with no-general-AG states (e.g., WI/OH/MS) and high CRA-only states (e.g., GA at 10,000+). Equal weight: plains and Carolinas change the regulator map.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["MT", "NE", "NC", "WI", "OH", "MS", "GA"],
        xp: 10,
      },
      {
        id: "m-mcq-nm-ag",
        type: "mcq",
        question:
          "New Mexico AG threshold (§57-12C-10 teaching): you will notify 800 NM residents about a confirmed breach. Partner asks whether AG notice is automatic because NM is a 'low/no floor' state. Best reply?",
        options: [
          "Yes — New Mexico AG notice has no headcount floor, exactly like Connecticut",
          "No — New Mexico AG notice is commonly taught when >1,000 New Mexico residents are notified; 800 alone does not trip that AG gate (still map individual notice and other recipients)",
          "New Mexico never has an AG path",
          "File New Mexico AG only if California AG is also filing",
        ],
        correctIndex: 1,
        explanation:
          "Do not recycle NH/CT no-minimum memes onto New Mexico. NM AG teaching keys off >1,000 residents notified.",
        topic: "multi-state",
        topics: ["multi-state-matrix", "ag-threshold"],
        states: ["NM", "CT", "NH"],
        xp: 20,
      },
      {
        id: "m-flash-mn-cra",
        type: "flashcard",
        front: "Minnesota CRA quirk (often no AG)",
        back: "Minnesota is commonly taught with no general AG filing for private-sector breaches, but CRA notice at 500+ residents — often with a notably tight CRA timing teaching point (e.g., 48-hour style charts). Contrast: CRA work without an AG twin.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["MN"],
        xp: 10,
      },
      {
        id: "m-mcq-vt-prelim",
        type: "mcq",
        question:
          "Vermont AG preliminary quirk: discovery Day 0 of a clear notice event affecting VT residents. Which timing seam is highest-yield?",
        options: [
          "Vermont never requires AG notice under 500 residents",
          "Vermont AG notice has no headcount minimum, and preliminary AG notice is commonly taught within 14 business days of discovery — diary that early AG touch even while the individual ≤45-day package is still in draft",
          "Vermont AG notice always waits until day 45 with individuals",
          "Vermont follows only California's 15-day after-consumer AG sample rule",
        ],
        correctIndex: 1,
        explanation:
          "VT pairs no-minimum AG with a 14-business-day preliminary AG teaching path. Do not bury it under CT/ME 'no minimum' slogans alone.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["VT"],
        xp: 20,
      },
      {
        id: "m-flash-wy-wv",
        type: "flashcard",
        front: "WY / WV — no-AG cousins with different PI hooks",
        back: "Wyoming and West Virginia are commonly taught without a general commercial AG filing. Still open the matrix: WY often reaches credential / shared-secret elements; WV stays closer to classic name+SSN/DL/account pairing with identity-theft/fraud risk framing. No AG ≠ no analysis.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["WY", "WV"],
        xp: 10,
      },
      {
        id: "m-fill-ia-cra-contrast",
        type: "fillblank",
        prompt: "Iowa AG post-notice clock",
        sentence:
          "Iowa: when >___ residents are notified, written AG Consumer Protection notice is commonly taught within ___ business days AFTER consumer notice.",
        blanks: [
          { id: "b1", answer: "500", alternatives: ["five hundred"] },
          { id: "b2", answer: "5", alternatives: ["five"] },
        ],
        explanation:
          "IA's 5-business-day post-consumer AG clock is the sequencing opposite of Maryland's AG-before-individuals rule — and a cousin contrast to NH's AG-whenever path.",
        topic: "multi-state",
        topics: ["multi-state-matrix"],
        states: ["IA", "MD", "NH"],
        xp: 15,
      },
    ],
  },
  {
    id: "capstone",
    title: "Capstone Drills",
    subtitle: "Associate-level seams across all 50 + DC",
    emoji: "🎓",
    color: "from-ink to-aubergine",
    order: 7,
    unlockAfter: "multi-state",
    exerciseId: "capstone-mixed",
    exerciseIds: [
      "capstone-mixed",
      "sticky-note-harbor",
      "timeline-race-day25",
      "sequencing-md-nj",
      "strictest-clock-plan",
    ],
    lessonItems: [
      {
        id: "c-mcq-1",
        type: "mcq",
        question: "Highest-yield risk-contrast set for training (not the only one)?",
        options: [
          "CA/IL/GA (generally no risk escape for classic unencrypted PI acquisition) vs CT/AK/MI/AZ (documented no-harm / misuse / substantial-loss analyses)",
          "Only Wyoming vs Only Montana forever",
          "Maritime law vs space law",
          "Font size vs line height",
        ],
        correctIndex: 0,
        explanation:
          "CA vs CT remains classic — but AK (AG-noticed no-harm), MI (substantial loss/ID theft), and AZ (substantial economic loss) keep associates from treating 'risk states' as identical.",
        topic: "capstone",
        topics: ["multi-state-matrix"],
        states: ["CA", "IL", "GA", "CT", "AK", "MI", "AZ"],
        xp: 20,
      },
      {
        id: "c-mcq-clock-race",
        type: "mcq",
        question:
          "Multi-state IR plan: affected residents in WA (≤30 discovery), OR (≤45 discovery), TX (≤60 after determination), and KY (expedient / risk-in-definition). Which planning rule is sound?",
        options: [
          "Ignore WA because Oregon's 45-day clock is 'close enough'",
          "Plan to the shortest applicable fixed outer bound among affected states — WA's ≤30 discovery clock typically forces the earliest consumer-notice target here; still map KY's risk-in-definition and TX's determination family separately",
          "Always wait for Texas's day 60",
          "Only Kentucky matters because it is expedient",
        ],
        correctIndex: 1,
        explanation:
          "Strictest-clock rule: shortest fixed deadline among affected jurisdictions drives the plan. Expedient-only states still need prompt action — they do not license waiting out a neighbor's longer numeric clock.",
        topic: "capstone",
        topics: ["multi-state-matrix", "timing-discovery", "timing-determination"],
        states: ["WA", "OR", "TX", "KY"],
        xp: 20,
      },
      {
        id: "c-mcq-2",
        type: "mcq",
        question: "Fastest way to look silly in a multi-state update email?",
        options: [
          "Confusing Virginia breach notice with VCDPA privacy obligations — or assuming every Southeast state copies Florida's DLA 500+ / 30-day determination model",
          "Listing resident counts by jurisdiction",
          "Flagging MD AG sequencing and NH's AG-whenever / AG-before path (no 1,000 AG floor)",
          "Noting encryption status and key custody",
        ],
        correctIndex: 0,
        explanation:
          "VCDPA ≠ Va. breach notice. GA/SC/TN/AL are not FL clones. Separate workstreams; open the matrix.",
        topic: "capstone",
        topics: ["multi-state-matrix"],
        states: ["VA", "FL", "GA", "SC", "TN", "AL"],
        xp: 15,
      },
      {
        id: "c-mcq-creds",
        type: "mcq",
        question:
          "Credential-only dump: email + password hashes that may permit account access; no name/SSN/DL. Which statement is most accurate?",
        options: [
          "Every state fires identically because passwords are always PI",
          "Credential expansions commonly fire in places like CA/NY/CO/IL/WA/NJ/DE/AZ/OR/AL — while classic-only teaching states (e.g., TX/KS/ID/KY) may miss unless other elements appear; hashed credentials can be fact-dependent — investigate, do not bluff a national yes/no",
          "Only Texas requires notice for passwords",
          "No state ever covers credentials without an SSN",
        ],
        correctIndex: 1,
        explanation:
          "PI definition seams are the point. Credential-only hypos split the map; crypto posture can still soft-pedal 'automatic fire' even in expansion states.",
        topic: "capstone",
        topics: ["multi-state-matrix", "pi-definition"],
        states: ["CA", "NY", "CO", "IL", "WA", "NJ", "DE", "AZ", "OR", "AL", "TX", "KS", "ID", "KY"],
        xp: 20,
      },
      {
        id: "c-fill-1",
        type: "fillblank",
        prompt: "Capstone mantra",
        sentence:
          "Encrypt the data, protect the ___, investigate ___, then map each ___ rulebook (all 50 + DC).",
        blanks: [
          { id: "b1", answer: "key", alternatives: ["keys"] },
          { id: "b2", answer: "acquisition", alternatives: ["exfiltration", "access"] },
          { id: "b3", answer: "state", alternatives: ["state's", "jurisdiction", "jurisdiction's"] },
        ],
        explanation: "That's the associate-ready mental model — coast-to-coast, not CA-only.",
        topic: "capstone",
        topics: ["multi-state-matrix"],
        xp: 20,
      },
      {
        id: "c-mcq-mn-cra",
        type: "mcq",
        question:
          "Minnesota CRA teaching contrast: 600 MN residents clearly in scope, no general AG filing in the usual private-sector teaching. What still bites?",
        options: [
          "Nothing — no AG means no regulator work",
          "Minnesota's CRA notice path at 500+ is often taught with an unusually tight timing expectation — regulator work is not only 'AG letters'",
          "Only California CRAs matter",
          "Wait 90 days so CRA duties expire",
        ],
        correctIndex: 1,
        explanation:
          "No-AG states are not no-work states. MN CRA timing is a classic less-taught tripwire beside GA's 10,000+ CRA threshold.",
        topic: "capstone",
        topics: ["multi-state-matrix"],
        states: ["MN", "GA"],
        xp: 20,
      },
      {
        id: "c-mcq-3",
        type: "mcq",
        question: "Demo disclaimer you should remember forever:",
        options: [
          "BreachGym is educational only — not legal advice; verify current statutes before advising clients",
          "This app replaces your bar license",
          "localStorage is a court filing system",
          "Emoji badges are admissible stipulations",
        ],
        correctIndex: 0,
        explanation:
          "Laws change across 51 jurisdictions. This is a training gym, not an opinion letter.",
        topic: "capstone",
        topics: ["multi-state-matrix"],
        xp: 10,
      },
      {
        id: "c-flash-1",
        type: "flashcard",
        front: "Who is covered? (pattern recognition)",
        back: "Start with: who owns/licenses the PI and who maintains it for others. Some statutes still use a 'conducts business' gate; others reach owners/licensees/maintainers of resident PI more directly. Florida-style framing can reach acquire/maintain/store/use; Georgia teaching often emphasizes information brokers/data collectors. Always read the actual statute.",
        topic: "capstone",
        topics: ["multi-state-matrix"],
        states: ["FL", "GA", "CT"],
        xp: 10,
      },
      {
        id: "c-flash-hi-sc",
        type: "flashcard",
        front: "Risk baked into the definition (HI / SC / OH cousins)",
        back: "Some jurisdictions embed risk in the breach definition itself (e.g., Hawaii's reasonably-likely illegal use + risk of harm; South Carolina material-risk / likely illegal use teaching; Ohio material risk of ID theft/fraud). That is related to — but not identical to — CT/FL-style post-acquisition investigate-then-maybe-skip analyses. Do not collapse them into one 'risk state' meme.",
        topic: "capstone",
        topics: ["multi-state-matrix", "risk-of-harm"],
        states: ["HI", "SC", "OH", "CT", "FL"],
        xp: 10,
      },
    ],
  },
];


export const MODULE_MAP = Object.fromEntries(
  MODULES.map((m) => [m.id, m])
) as Record<string, Module>;

/** All practical drills linked to a module (primary + extras). */
export function moduleExerciseIds(mod: Module | string): string[] {
  const m = typeof mod === "string" ? MODULE_MAP[mod] : mod;
  if (!m) return [];
  const ids = [...(m.exerciseIds ?? [])];
  if (m.exerciseId && !ids.includes(m.exerciseId)) ids.unshift(m.exerciseId);
  return ids;
}


/** Single source of truth for lesson item totals (dashboard + player). */
export function lessonItemCount(mod: Module | string): number {
  const m = typeof mod === "string" ? MODULE_MAP[mod] : mod;
  return m?.lessonItems.length ?? 0;
}

export function getModule(id: string) {
  return MODULE_MAP[id];
}

export function isModuleUnlocked(
  moduleId: string,
  completedLessons: string[]
): boolean {
  const mod = MODULE_MAP[moduleId];
  if (!mod) return false;
  if (!mod.unlockAfter) return true;
  return completedLessons.includes(mod.unlockAfter);
}

/** Human-readable unlock gate for locked modules (dashboard / lesson). */
export function unlockRequirement(moduleId: string): string | null {
  const mod = MODULE_MAP[moduleId];
  if (!mod?.unlockAfter) return null;
  const prev = MODULE_MAP[mod.unlockAfter];
  return prev ? `Complete "${prev.title}" to unlock lessons` : `Complete prior module to unlock`;
}

/** Modules completed by "Skip to advanced practice (demo)" — unlocks Multi-State. */
export const DEMO_ADVANCED_PREREQS = [
  "foundations",
  "personal-information",
  "risk-of-harm",
  "safe-harbors",
  "timing-recipients",
] as const;
