"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Nav } from "@/components/Nav";
import { XpBar } from "@/components/XpBar";
import { Disclaimer } from "@/components/Disclaimer";
import { ProfileGate, useProfile } from "@/hooks/useProfile";
import { MODULES } from "@/data/modules";
import { STATES } from "@/data/states";
import { EXERCISES } from "@/data/exercises";
import {
  hasAdaptiveHistory,
  weakStates as adaptiveWeakStates,
  weakTopics as adaptiveWeakTopics,
} from "@/lib/adaptive";
import { labelForTopic } from "@/lib/topics";

function ProgressContent() {
  const { profile } = useProfile();

  const weakTopics = useMemo(() => {
    if (!profile) return [] as { topic: string; label: string; mastery: number }[];
    const adaptive = adaptiveWeakTopics(profile, 8);
    if (adaptive.length) {
      return adaptive.map((t) => ({
        topic: t.topic,
        label: t.label,
        mastery: t.mastery,
      }));
    }
    return Object.entries(profile.attemptsByTopic)
      .map(([topic, v]) => ({
        topic,
        label: labelForTopic(topic),
        mastery: v.total ? Math.round((v.correct / v.total) * 100) : 50,
        total: v.total,
        accuracy: v.total ? v.correct / v.total : 0,
      }))
      .filter((t) => t.total >= 3 && t.accuracy < 0.8)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5)
      .map(({ topic, label, mastery }) => ({ topic, label, mastery }));
  }, [profile]);

  const weakStates = useMemo(() => {
    if (!profile) return [] as { code: string; mastery: number }[];
    const adaptive = adaptiveWeakStates(profile, 8);
    if (adaptive.length) {
      return adaptive.map((t) => ({
        code: t.code,
        mastery: t.mastery,
      }));
    }
    return Object.entries(profile.attemptsByState)
      .map(([code, v]) => ({
        code,
        mastery: v.total ? Math.round((v.correct / v.total) * 100) : 50,
        total: v.total,
        accuracy: v.total ? v.correct / v.total : 0,
      }))
      .filter((t) => t.total >= 2 && t.accuracy < 0.8)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 6)
      .map(({ code, mastery }) => ({ code, mastery }));
  }, [profile]);

  if (!profile) return null;

  const hasHistory = hasAdaptiveHistory(profile);

  const overall =
    profile.totalAttempts > 0
      ? Math.round((profile.totalCorrect / profile.totalAttempts) * 100)
      : 0;

  return (
    <div className="page-limestone pb-16">
      <Nav />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <header>
          <h1 className="font-serif-brand text-3xl text-ink">Progress</h1>
          <p className="mt-2 text-sm text-muted">
            Accuracy, weak areas, and mastery. Mastery is a client-side heuristic used by Adaptive
            Review.
          </p>
        </header>

        <XpBar
          xp={profile.xp}
          dailyXp={profile.dailyXp}
          dailyGoal={profile.dailyGoal}
          streak={profile.streak}
        />

        {!hasHistory && (
          <p className="text-sm text-muted">
            No miss history yet — Adaptive Review will seed a hard multi-state sampler.
          </p>
        )}

        <div className="grid gap-6 border-y border-[var(--hairline-light)] py-5 sm:grid-cols-3">
          <Stat label="Overall accuracy" value={`${overall}%`} />
          <Stat
            label="Modules cleared"
            value={`${profile.completedLessons.length}/${MODULES.length}`}
          />
          <Stat
            label="Exercises cleared"
            value={`${profile.completedExercises.length}/${EXERCISES.length}`}
          />
        </div>

        <section>
          <h2 className="font-serif-brand text-lg text-ink">Accuracy by topic</h2>
          <div className="mt-3 space-y-3">
            {Object.keys(profile.attemptsByTopic).length === 0 && (
              <p className="text-sm text-muted">Complete a few items to unlock topic stats.</p>
            )}
            {Object.entries(profile.attemptsByTopic).map(([topic, v]) => {
              const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
              return (
                <BarRow key={topic} label={topic} pct={pct} detail={`${v.correct}/${v.total}`} />
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-serif-brand text-lg text-ink">Accuracy by state</h2>
          <ul className="mt-3 divide-y divide-[var(--hairline-light)] border-y border-[var(--hairline-light)]">
            {STATES.map((s) => {
              const v = profile.attemptsByState[s.code];
              const pct = v?.total ? Math.round((v.correct / v.total) * 100) : null;
              return (
                <li
                  key={s.code}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-ink">
                    {s.code} · {s.name}
                  </span>
                  <span className="text-muted">{pct === null ? "—" : `${pct}%`}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="font-serif-brand text-lg text-ink">Weak topics</h2>
            {weakTopics.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No weak topics yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {weakTopics.map((t) => (
                  <li key={t.topic} className="flex items-center justify-between gap-2">
                    <span className="text-ink">
                      {t.label} — {t.mastery}
                    </span>
                    <Link
                      href={`/adaptive?topic=${encodeURIComponent(t.topic)}`}
                      className="link-copper shrink-0 text-xs"
                    >
                      Train weak spots
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-serif-brand text-lg text-ink">Weak states</h2>
            {weakStates.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No weak states yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {weakStates.map((t) => (
                  <li key={t.code} className="flex items-center justify-between gap-2">
                    <span className="text-ink">
                      {t.code} — {t.mastery}
                    </span>
                    <Link
                      href={`/adaptive?state=${encodeURIComponent(t.code)}`}
                      className="link-copper shrink-0 text-xs"
                    >
                      Train weak spots
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/adaptive" className="link-copper text-sm">
            Train weak spots →
          </Link>
          <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
            Dashboard
          </Link>
        </div>
        <Disclaimer />
      </main>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <ProfileGate>
      <ProgressContent />
    </ProfileGate>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-caps">{label}</div>
      <div className="mt-1 font-serif-brand text-2xl text-ink">{value}</div>
    </div>
  );
}

function BarRow({
  label,
  pct,
  detail,
}: {
  label: string;
  pct: number;
  detail: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span className="uppercase tracking-[0.08em]">{label}</span>
        <span>
          {pct}% · {detail}
        </span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
