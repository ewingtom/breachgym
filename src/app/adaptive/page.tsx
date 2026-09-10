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
      <div className="page-limestone pb-16">
        <Nav />
        <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
        <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
          <div className="space-y-4">
            <p className="label-caps text-copper">Adaptive</p>
            <h1 className="font-serif-brand text-3xl text-ink">Session complete</h1>
            <p className="text-muted">
              {results.filter((r) => r.correct).length}/{results.length} correct · mastery updated
              client-side (heuristic, not ML).
            </p>
            {improved.length > 0 && (
              <div className="border-t border-[var(--hairline-light)] pt-3 text-sm">
                <div className="label-caps">Improved</div>
                <ul className="mt-2 space-y-1">
                  {improved.map((r) => (
                    <li key={r.topic} className="text-ink">
                      {labelForTopic(r.topic)}: {r.before} → {r.after}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stillWeak.length > 0 && (
              <div className="border-t border-[var(--hairline-light)] pt-3 text-sm">
                <div className="label-caps">Still weak</div>
                <ul className="mt-2 space-y-2">
                  {stillWeak.map((r) => (
                    <li key={r.topic} className="flex items-center justify-between gap-2">
                      <span className="text-ink">
                        {r.label} · mastery {r.mastery}
                      </span>
                      <Link
                        href={`/adaptive?topic=${encodeURIComponent(r.topic)}`}
                        className="link-copper text-xs"
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
            <div className="flex flex-wrap gap-2 pt-2">
              <button className="btn-primary" onClick={startSession}>
                Another session
              </button>
              <Link href="/progress" className="btn-secondary">
                Progress
              </Link>
              <Link href="/dashboard" className="btn-ghost">
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
    <div className="page-limestone pb-16">
      <Nav />
      <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
      <Celebration
        show={celebrate}
        kind="correct"
        title="Locked in"
        subtitle="+XP · mastery updated"
        onClose={() => setCelebrate(false)}
      />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
            ← Dashboard
          </Link>
          <div className="label-caps text-copper">Adaptive Review</div>
        </div>

        <div className="border-b border-[var(--hairline-light)] pb-4">
          <p className="text-sm font-medium text-ink">{session.reason}</p>
          <p className="mt-2 text-xs text-muted">
            Wrong answers raise topic/state priority; correct answers raise mastery and space items
            out. Client-side heuristics — no backend ML.
          </p>
          {!hasAdaptiveHistory(profile) && (
            <p className="mt-2 text-xs text-muted">
              Cold start: hard multi-state sampler (not Foundations trivia).
            </p>
          )}
          {(topicParam || stateParam) && (
            <p className="mt-2 text-xs font-semibold text-copper">
              Filter: {topicParam ? labelForTopic(topicParam) : ""}
              {topicParam && stateParam ? " · " : ""}
              {stateParam || ""}
            </p>
          )}
        </div>

        {(weakT.length > 0 || weakS.length > 0) && idx === 0 && !resolved && (
          <ul className="space-y-1 text-xs text-muted">
            {weakT.slice(0, 3).map((t) => (
              <li key={t.topic}>
                Weak topic: {t.label} ({t.mastery})
              </li>
            ))}
            {weakS.slice(0, 3).map((s) => (
              <li key={s.code}>
                Weak state: {s.code} ({s.mastery})
              </li>
            ))}
          </ul>
        )}

        <div>
          <div className="meter-track">
            <div className="meter-fill meter-fill-copper" style={{ width: `${Math.min(100, progressPct)}%` }} />
          </div>
          <p className="mt-2 label-caps">
            Item {Math.min(idx + 1, total)} / {total}
            {card?.source === "drill-snippet" ? " · drill snippet" : ""}
          </p>
        </div>

        {card && (
          <div className="rounded-sm border border-[var(--hairline-light)] bg-ivory p-5">
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
                  className="btn-primary"
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
                  {idx + 1 >= total ? "Finish" : "Continue"}
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
        <main className="page-limestone flex min-h-screen items-center justify-center text-sm text-muted">
          Loading session…
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
