"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addXp,
  clearProfile,
  defaultProfile,
  loadProfile,
  markAdaptiveSessionComplete,
  markExerciseComplete,
  markItemComplete,
  markLessonComplete,
  newlyUnlockedBadges,
  recordAttempt,
  recordAttempts,
  recordSessionFreshness,
  saveProfile,
  touchStreak,
} from "@/lib/storage";
import { DEMO_ADVANCED_PREREQS } from "@/data/modules";
import { UserProfile } from "@/lib/types";

type AttemptInput = {
  correct: boolean;
  topic?: string;
  topics?: string[];
  states?: string[];
  xp?: number;
  itemId?: string;
};

type ProfileApi = {
  profile: UserProfile | null;
  ready: boolean;
  justUnlocked: string[];
  clearUnlocks: () => void;
  startDemo: (name: string) => void;
  skipToAdvanced: () => void;
  reset: () => void;
  gainXp: (amount: number) => void;
  attempt: (opts: AttemptInput) => void;
  /** Batch record per-row / per-state attempts in one persist pass. */
  attempts: (rows: AttemptInput[]) => void;
  completeItem: (itemId: string) => void;
  completeLesson: (moduleId: string) => void;
  completeExercise: (exerciseId: string, bonusXp: number) => void;
  completeAdaptiveSession: (bonusXp?: number) => void;
  /** Persist session seed + fingerprints so the next visit is fresh. */
  rememberSession: (seed: string, fingerprints: string[]) => void;
};

const ProfileContext = createContext<ProfileApi | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<string[]>([]);

  useEffect(() => {
    // Client-only: localStorage is unavailable during SSR / first paint.
    try {
      setProfile(loadProfile());
    } catch {
      setProfile(null);
    } finally {
      setReady(true);
    }
  }, []);

  const persist = useCallback((next: UserProfile) => {
    setProfile(next);
    saveProfile(next);
  }, []);

  const startDemo = useCallback(
    (name: string) => {
      const p = touchStreak(defaultProfile(name || "Associate"));
      persist(p);
    },
    [persist]
  );

  const reset = useCallback(() => {
    clearProfile();
    setProfile(null);
    setJustUnlocked([]);
  }, []);

  const apply = useCallback((fn: (p: UserProfile) => UserProfile) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const beforeBadges = prev.badges;
      const next = fn(prev);
      const unlocked = newlyUnlockedBadges(beforeBadges, next.badges);
      if (unlocked.length) setJustUnlocked(unlocked);
      saveProfile(next);
      return next;
    });
  }, []);

  const skipToAdvanced = useCallback(() => {
    apply((p) => {
      let next = { ...p, completedLessons: [...p.completedLessons] };
      for (const id of DEMO_ADVANCED_PREREQS) {
        next = markLessonComplete(next, id);
      }
      return next;
    });
  }, [apply]);

  const gainXp = useCallback(
    (amount: number) => apply((p) => addXp(p, amount)),
    [apply]
  );

  const attempt = useCallback(
    (opts: AttemptInput) => {
      apply((p) => {
        let next = recordAttempt(p, opts);
        if (opts.xp && opts.xp > 0)
          next = addXp(
            next,
            opts.correct ? opts.xp : Math.max(2, Math.floor(opts.xp * 0.2))
          );
        return next;
      });
    },
    [apply]
  );

  const attempts = useCallback(
    (rows: AttemptInput[]) => {
      if (!rows.length) return;
      apply((p) => {
        let next = recordAttempts(
          p,
          rows.map(({ correct, topic, topics, states, itemId }) => ({
            correct,
            topic,
            topics,
            states,
            itemId,
          }))
        );
        for (const opts of rows) {
          if (opts.xp && opts.xp > 0) {
            next = addXp(
              next,
              opts.correct ? opts.xp : Math.max(2, Math.floor(opts.xp * 0.2))
            );
          }
        }
        return next;
      });
    },
    [apply]
  );

  const completeItem = useCallback(
    (itemId: string) => apply((p) => markItemComplete(p, itemId)),
    [apply]
  );

  const completeLesson = useCallback(
    (moduleId: string) => apply((p) => markLessonComplete(addXp(p, 40), moduleId)),
    [apply]
  );

  const completeExercise = useCallback(
    (exerciseId: string, bonusXp: number) =>
      apply((p) => markExerciseComplete(addXp(p, bonusXp), exerciseId)),
    [apply]
  );

  const completeAdaptiveSession = useCallback(
    (bonusXp = 30) =>
      apply((p) => markAdaptiveSessionComplete(addXp(p, bonusXp))),
    [apply]
  );

  const rememberSession = useCallback(
    (seed: string, fingerprints: string[]) =>
      apply((p) => recordSessionFreshness(p, seed, fingerprints)),
    [apply]
  );

  const clearUnlocks = useCallback(() => setJustUnlocked([]), []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      justUnlocked,
      clearUnlocks,
      startDemo,
      skipToAdvanced,
      reset,
      gainXp,
      attempt,
      attempts,
      completeItem,
      completeLesson,
      completeExercise,
      completeAdaptiveSession,
      rememberSession,
    }),
    [
      profile,
      ready,
      justUnlocked,
      clearUnlocks,
      startDemo,
      skipToAdvanced,
      reset,
      gainXp,
      attempt,
      attempts,
      completeItem,
      completeLesson,
      completeExercise,
      completeAdaptiveSession,
      rememberSession,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileApi {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}

/** Shared loading / redirect gate so pages never sit on eternal "Loading…" when unauthenticated. */
export function ProfileGate({ children }: { children: ReactNode }) {
  const { profile, ready } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile) router.replace("/");
  }, [ready, profile, router]);

  if (!ready) {
    return (
      <main className="shell-aubergine flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="shell-aubergine mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-semibold text-ivory">No demo profile found</p>
        <p className="text-sm text-muted">Redirecting to the start screen…</p>
        <Link href="/" className="btn-copper-outline">
          Enter BreachGym
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}
