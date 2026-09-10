"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { LessonItemView } from "@/components/LessonItems";
import { BadgeUnlockToast, Celebration } from "@/components/Celebration";
import { Disclaimer } from "@/components/Disclaimer";
import { ProfileGate, useProfile } from "@/hooks/useProfile";
import {
  AdaptiveCard,
  buildAdaptiveSession,
  hasAdaptiveHistory,
  weakStates,
  weakTopics,
} from "@/lib/adaptive";
import { labelForTopic } from "@/lib/topics";

function AdaptiveInner() {
  const search = useSearchParams();
  const topicParam = search.get("topic") || undefined;
  const stateParam = search.get("state") || undefined;
  const {
    profile,
    attempt,
    completeItem,
    completeAdaptiveSession,
    justUnlocked,
    clearUnlocks,
  } = useProfile();

  const filter = useMemo(
    () => ({
      topics: topicParam ? [topicParam] : undefined,
      states: stateParam ? [stateParam] : undefined,
      size: 6,
    }),
    [topicParam, stateParam]
  );

  const [sessionKey, setSessionKey] = useState(0);
  const [session, setSession] = useState<ReturnType<typeof buildAdaptiveSession> | null>(null);
  const [idx, setIdx] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [beforeSnap, setBeforeSnap] = useState<Record<string, number>>({});
  const [results, setResults] = useState<{ id: string; correct: boolean; topics: string[] }[]>(
    []
  );

  useEffect(() => {
    if (!profile) return;
    const snap: Record<string, number> = {};
    for (const t of Object.keys(profile.topicMastery || {})) {
      snap[t] = profile.topicMastery[t].mastery;
    }
    setBeforeSnap(snap);
    setSession(buildAdaptiveSession(profile, filter));
    setIdx(0);
    setResolved(false);
    setFinished(false);
    setResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit sessionKey / filter restart only
  }, [sessionKey, topicParam, stateParam]);

  if (!profile || !session) return null;

  const cards = session.cards;
  const total = cards.length;
  const card: AdaptiveCard | undefined = cards[idx];
  const progressPct = total ? Math.round(((idx + (resolved ? 1 : 0)) / total) * 100) : 0;

  const startSession = () => {
    setSessionKey((k) => k + 1);
  };

  const weakT = weakTopics(profile, 5);
  const weakS = weakStates(profile, 5);

  if (finished) {
    const stillWeak = weakTopics(profile, 5);
    const improved = Object.entries(profile.topicMastery || {})
      .map(([topic, stat]) => ({
        topic,
        before: beforeSnap[topic] ?? 50,
        after: stat.mastery,
      }))
      .filter((r) => r.after > r.before)
      .sort((a, b) => b.after - a.after - (b.before - a.before))
      .slice(0, 5);

    return (
      <div className="min-h-screen pb-16">
        <Nav />
        <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
        <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          <div className="card space-y-4 text-center">
            <div className="text-5xl">🧠</div>
            <h1 className="text-3xl font-black text-slate-900">Workout complete</h1>
            <p className="text-slate-600">
              {results.filter((r) => r.correct).length}/{results.length} correct · mastery updated
              client-side (heuristic, not ML).
            </p>
            {improved.length > 0 && (
              <div className="rounded-2xl bg-emerald-50 p-3 text-left text-sm">
                <div className="font-black text-emerald-800">Improved</div>
                <ul className="mt-1 space-y-1">
                  {improved.map((r) => (
                    <li key={r.topic} className="font-semibold text-emerald-900">
                      {labelForTopic(r.topic)}: {r.before} → {r.after}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stillWeak.length > 0 && (
              <div className="rounded-2xl bg-rose-50 p-3 text-left text-sm">
                <div className="font-black text-rose-800">Still weak</div>
                <ul className="mt-1 space-y-1">
                  {stillWeak.map((r) => (
                    <li key={r.topic} className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-rose-900">
                        {r.label} · mastery {r.mastery}
                      </span>
                      <Link
                        href={`/adaptive?topic=${encodeURIComponent(r.topic)}`}
                        className="text-xs font-black text-rose-700 underline"
                        onClick={() => {
                          setFinished(false);
                          setSessionKey((k) => k + 1);
                          setIdx(0);
                          setResolved(false);
                          setResults([]);
                        }}
                      >
                        Train this
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button className="btn-coral" onClick={startSession}>
                Another workout
              </button>
              <Link href="/progress" className="btn-secondary">
                Progress
              </Link>
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            </div>
          </div>
          <Disclaimer />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Nav />
      <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
      <Celebration
        show={celebrate}
        kind="correct"
        title="Locked in"
        subtitle="+XP · mastery updated"
        onClose={() => setCelebrate(false)}
      />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-emerald-600">
            ← Dashboard
          </Link>
          <div className="text-sm font-black text-slate-700">🧠 Adaptive Review</div>
        </div>

        <div className="card border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-violet-50">
          <div className="text-xs font-black uppercase tracking-wide text-fuchsia-700">
            Weak Spot Workout
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-700">{session.reason}</p>
          <p className="mt-2 text-xs text-slate-500">
            Scoring: wrong answers raise topic/state priority and cut easiness; correct answers raise
            mastery and space items out. All client-side heuristics — no backend ML.
          </p>
          {!hasAdaptiveHistory(profile) && (
            <p className="mt-2 text-xs font-bold text-violet-700">
              Cold start: hard multi-state sampler (not Foundations trivia).
            </p>
          )}
          {(topicParam || stateParam) && (
            <p className="mt-2 text-xs font-bold text-fuchsia-800">
              Filter: {topicParam ? labelForTopic(topicParam) : ""}
              {topicParam && stateParam ? " · " : ""}
              {stateParam || ""}
            </p>
          )}
        </div>

        {(weakT.length > 0 || weakS.length > 0) && idx === 0 && !resolved && (
          <div className="grid gap-2 sm:grid-cols-2">
            {weakT.slice(0, 3).map((t) => (
              <div key={t.topic} className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">
                Weak topic: {t.label} ({t.mastery})
              </div>
            ))}
            {weakS.slice(0, 3).map((s) => (
              <div key={s.code} className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                Weak state: {s.code} ({s.mastery})
              </div>
            ))}
          </div>
        )}

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-500 transition-all"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Item {Math.min(idx + 1, total)} / {total}
          {card?.source === "drill-snippet" ? " · drill snippet" : ""}
        </p>

        {card && (
          <div className="card">
            <LessonItemView
              key={`${sessionKey}-${card.id}`}
              item={card}
              onResolved={(correct) => {
                if (resolved) return;
                setResolved(true);
                const topics = card.topics || [];
                attempt({
                  correct,
                  topic: card.topic,
                  topics,
                  states: card.states,
                  xp: card.xp,
                  itemId: card.id,
                });
                completeItem(card.id);
                setResults((r) => [...r, { id: card.id, correct, topics }]);
                if (correct) setCelebrate(true);
              }}
            />
            {resolved && (
              <div className="mt-6 flex justify-end">
                <button
                  className="btn-coral"
                  onClick={() => {
                    if (idx + 1 >= total) {
                      completeAdaptiveSession(30);
                      setFinished(true);
                    } else {
                      setIdx(idx + 1);
                      setResolved(false);
                    }
                  }}
                >
                  {idx + 1 >= total ? "Finish workout" : "Next"}
                </button>
              </div>
            )}
          </div>
        )}

        <Disclaimer compact />
      </main>
    </div>
  );
}

function AdaptiveContent() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center font-black text-fuchsia-600">
          Loading workout…
        </main>
      }
    >
      <AdaptiveInner />
    </Suspense>
  );
}

export default function AdaptivePage() {
  return (
    <ProfileGate>
      <AdaptiveContent />
    </ProfileGate>
  );
}
