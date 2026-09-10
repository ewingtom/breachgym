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
    <div className="min-h-screen pb-16">
      <Nav />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <header>
          <h1 className="text-3xl font-black text-slate-900">Progress & stats</h1>
          <p className="text-slate-500">
            Accuracy, weak areas, and mastery map. Mastery is a client-side heuristic
            (accuracy + easiness − consecutive misses) used by Adaptive Review.
          </p>
        </header>

        <XpBar
          xp={profile.xp}
          dailyXp={profile.dailyXp}
          dailyGoal={profile.dailyGoal}
          streak={profile.streak}
        />

        {!hasHistory && (
          <p className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800">
            No miss history yet — Adaptive Review will seed a hard multi-state sampler.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Overall accuracy" value={`${overall}%`} emoji="🎯" />
          <StatCard
            label="Modules cleared"
            value={`${profile.completedLessons.length}/${MODULES.length}`}
            emoji="📚"
          />
          <StatCard
            label="Exercises cleared"
            value={`${profile.completedExercises.length}/${EXERCISES.length}`}
            emoji="🧪"
          />
        </div>

        <section className="card">
          <h2 className="font-black text-slate-800">Accuracy by topic</h2>
          <div className="mt-3 space-y-2">
            {Object.keys(profile.attemptsByTopic).length === 0 && (
              <p className="text-sm text-slate-500">Complete a few items to unlock topic stats.</p>
            )}
            {Object.entries(profile.attemptsByTopic).map(([topic, v]) => {
              const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
              return (
                <BarRow key={topic} label={topic} pct={pct} detail={`${v.correct}/${v.total}`} />
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2 className="font-black text-slate-800">Accuracy by state</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {STATES.map((s) => {
              const v = profile.attemptsByState[s.code];
              const pct = v?.total ? Math.round((v.correct / v.total) * 100) : null;
              return (
                <div
                  key={s.code}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-bold text-slate-700">
                    {s.code} · {s.name}
                  </span>
                  <span className="font-black text-slate-500">
                    {pct === null ? "—" : `${pct}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="card border-rose-100">
            <h2 className="font-black text-rose-700">Weak topics</h2>
            {weakTopics.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No weak topics yet — miss some questions or keep drilling.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {weakTopics.map((t) => (
                  <li key={t.topic} className="flex items-center justify-between gap-2 font-semibold text-slate-700">
                    <span>
                      {t.label} — mastery {t.mastery}
                    </span>
                    <Link
                      href={`/adaptive?topic=${encodeURIComponent(t.topic)}`}
                      className="shrink-0 rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white"
                    >
                      Train this
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card border-amber-100">
            <h2 className="font-black text-amber-700">Weak states</h2>
            {weakStates.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No weak states yet — none below mastery threshold with enough tries.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {weakStates.map((t) => (
                  <li key={t.code} className="flex items-center justify-between gap-2 font-semibold text-slate-700">
                    <span>
                      {t.code} — mastery {t.mastery}
                    </span>
                    <Link
                      href={`/adaptive?state=${encodeURIComponent(t.code)}`}
                      className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white"
                    >
                      Train this
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href="/adaptive" className="btn-coral inline-flex">
            🧠 Adaptive Review
          </Link>
          <Link href="/dashboard" className="btn-primary inline-flex">
            Keep training
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

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <div className="card flex items-center gap-3">
      <span className="text-3xl">{emoji}</span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
      </div>
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
      <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
        <span>{label}</span>
        <span>
          {pct}% · {detail}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
