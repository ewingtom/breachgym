export type StateCode =
  | "AL"
  | "AK"
  | "AZ"
  | "AR"
  | "CA"
  | "CO"
  | "CT"
  | "DE"
  | "DC"
  | "FL"
  | "GA"
  | "HI"
  | "ID"
  | "IL"
  | "IN"
  | "IA"
  | "KS"
  | "KY"
  | "LA"
  | "ME"
  | "MD"
  | "MA"
  | "MI"
  | "MN"
  | "MS"
  | "MO"
  | "MT"
  | "NE"
  | "NV"
  | "NH"
  | "NJ"
  | "NM"
  | "NY"
  | "NC"
  | "ND"
  | "OH"
  | "OK"
  | "OR"
  | "PA"
  | "RI"
  | "SC"
  | "SD"
  | "TN"
  | "TX"
  | "UT"
  | "VT"
  | "VA"
  | "WA"
  | "WV"
  | "WI"
  | "WY";

export interface StateLaw {
  code: StateCode;
  name: string;
  statuteHint: string;
  piHighlights: string[];
  riskOfHarm: "none" | "yes" | "limited";
  riskNote: string;
  encryptionSafeHarbor: boolean;
  safeHarborNote: string;
  individualTimeline: string;
  agThreshold: string;
  agTimeline: string;
  craNote: string;
  whoCovered: string;
  quirks: string[];
}

export type LessonItemType =
  | "flashcard"
  | "fillblank"
  | "narrative"
  | "mcq";

interface LessonItemBase {
  id: string;
  /** Coarse module topic (kept for badges / legacy stats). */
  topic: string;
  /** Fine-grained adaptive tags (preferred for review priority). */
  topics?: string[];
  states?: StateCode[];
  xp: number;
}

export interface FlashcardItem extends LessonItemBase {
  type: "flashcard";
  front: string;
  back: string;
}

export interface FillBlankItem extends LessonItemBase {
  type: "fillblank";
  prompt: string;
  sentence: string;
  blanks: { id: string; answer: string; alternatives?: string[] }[];
  explanation: string;
}

export interface NarrativeItem extends LessonItemBase {
  type: "narrative";
  title: string;
  emoji: string;
  story: string[];
  takeaway: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface McqItem extends LessonItemBase {
  type: "mcq";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type LessonItem =
  | FlashcardItem
  | FillBlankItem
  | NarrativeItem
  | McqItem;

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  order: number;
  unlockAfter?: string;
  lessonItems: LessonItem[];
  /** Primary practical drill (legacy single-link). */
  exerciseId?: string;
  /** Additional practical drills for this module (shown alongside exerciseId). */
  exerciseIds?: string[];
}

export type ExerciseType =
  | "notification-trigger"
  | "pi-matrix"
  | "safe-harbor"
  | "acquisition-analysis";

export interface ExerciseBase {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  type: ExerciseType;
  topic: string;
  topics?: string[];
  moduleId: string;
  xp: number;
}

export interface NotificationTriggerExercise extends ExerciseBase {
  type: "notification-trigger";
  factPattern: string;
  clientEmail: string;
  states: StateCode[];
  answers: Partial<Record<StateCode, boolean>>;
  explanations: Partial<Record<StateCode, string>>;
}

export interface PiMatrixExercise extends ExerciseBase {
  type: "pi-matrix";
  scenario: string;
  fields: string[];
  states: StateCode[];
  // which fields trigger PI for each state (field index arrays)
  triggers: Partial<Record<StateCode, number[]>>;
  analysisChoices: {
    id: string;
    text: string;
    correct: boolean;
    explanation: string;
  }[];
}

export interface SafeHarborExercise extends ExerciseBase {
  type: "safe-harbor";
  scenario: string;
  states: StateCode[];
  answers: Partial<Record<StateCode, boolean>>; // true = safe harbor likely applies
  explanations: Partial<Record<StateCode, string>>;
}

export interface AcquisitionExercise extends ExerciseBase {
  type: "acquisition-analysis";
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  followUp?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export type Exercise =
  | NotificationTriggerExercise
  | PiMatrixExercise
  | SafeHarborExercise
  | AcquisitionExercise;

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: string;
}

/** Per-item / per-topic / per-state mastery stats for adaptive review. */
export interface MasteryStat {
  correct: number;
  incorrect: number;
  lastSeen: string; // ISO
  consecutiveWrong: number;
  /** SM-2-ish easiness factor; higher = stronger (default 2.5). */
  easiness: number;
  /** 0–100 heuristic mastery score. */
  mastery: number;
}

export interface UserProfile {
  name: string;
  startedAt: string;
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyGoal: number;
  dailyXp: number;
  dailyXpDate: string;
  completedLessons: string[]; // moduleIds
  completedItems: string[]; // item ids
  completedExercises: string[];
  badges: string[];
  // accuracy tracking (legacy + adaptive)
  attemptsByTopic: Record<string, { correct: number; total: number }>;
  attemptsByState: Record<string, { correct: number; total: number }>;
  /** Per lesson-item / adaptive-card mastery. */
  itemMastery: Record<string, MasteryStat>;
  /** Fine-grained topic mastery (adaptive tags). */
  topicMastery: Record<string, MasteryStat>;
  /** State mastery with spaced-review fields. */
  stateMastery: Record<string, MasteryStat>;
  totalCorrect: number;
  totalAttempts: number;
  adaptiveSessionsCompleted: number;
  /** Recent Adaptive / Practice session seeds (avoid immediate identical pools). */
  lastSessionSeeds?: string[];
  /** Fingerprints of recently served generated/authored items. */
  seenFingerprints?: string[];
}
