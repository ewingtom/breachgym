"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { LessonItemView } from "@/components/LessonItems";
import { Celebration, BadgeUnlockToast } from "@/components/Celebration";
import { ProfileGate, useProfile } from "@/hooks/useProfile";
import { getModule, isModuleUnlocked, moduleExerciseIds, unlockRequirement } from "@/data/modules";
import { EXERCISE_MAP } from "@/data/exercises";
import { Disclaimer } from "@/components/Disclaimer";
import {
  AdaptiveCard,
  canonicalMasteryItemId,
  interleaveForModule,
  itemTopics,
  moduleRelatedTopics,
} from "@/lib/adaptive";

function LessonContent() {
  const params = useParams();
  const moduleId = String(params.moduleId || "");
  const mod = getModule(moduleId);
  const { profile, attempt, completeItem, completeLesson, justUnlocked, clearUnlocks } =
    useProfile();
  const [idx, setIdx] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [finished, setFinished] = useState(false);
  const [interleaved, setInterleaved] = useState<AdaptiveCard[]>([]);

  // Reset player state when the route module changes (avoids stale idx / wrong totals).
  // Freeze interleaved review cards for this lesson visit so mastery bumps mid-lesson
  // do not reshuffle the queue.
  useEffect(() => {
    setIdx(0);
    setResolved(false);
    setFinished(false);
    setShowCelebrate(false);
    if (profile && mod) {
      setInterleaved(interleaveForModule(profile, mod.id, moduleRelatedTopics(mod.id)));
    } else {
      setInterleaved([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reseat on module change
  }, [moduleId]);

  const items = useMemo(() => {
    const baseItems = mod?.lessonItems ?? [];
    if (!interleaved.length) return baseItems;
    const out = [...baseItems];
    const insertAt = Math.min(2, Math.max(0, out.length - 1));
    const tagged = interleaved.map((c) => ({
      ...c,
      question: `🔁 Review · ${c.question}`,
    }));
    out.splice(insertAt, 0, ...tagged);
    return out;
  }, [mod, interleaved]);
  const total = items.length;
  const safeIdx = total > 0 ? Math.min(idx, total - 1) : 0;
  const item = items[safeIdx];
  const progressPct = total
    ? Math.round(((safeIdx + (resolved ? 1 : 0)) / total) * 100)
    : 0;

  const locked = useMemo(() => {
    if (!profile || !mod) return true;
    return !isModuleUnlocked(mod.id, profile.completedLessons);
  }, [profile, mod]);

  if (!mod) {
    return (
      <main className="mx-auto max-w-lg p-10 text-center">
        <p className="font-black">Module not found</p>
        <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
          Back
        </Link>
      </main>
    );
  }

  if (locked) {
    const req = unlockRequirement(mod.id);
    const drills = moduleExerciseIds(mod)
      .map((id) => EXERCISE_MAP[id])
      .filter(Boolean);
    return (
      <main className="mx-auto max-w-lg space-y-4 p-10 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="text-xl font-black text-slate-800">{mod.emoji} {mod.title}</h1>
        <p className="font-bold text-slate-700">
          {req || "Finish the previous module to unlock lessons."}
        </p>
        <p className="text-sm text-slate-500">
          Lessons stay gated in order. You can still open practice drills below (or use
          &quot;Skip to advanced practice&quot; on the dashboard).
        </p>
        {drills.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs font-black uppercase tracking-wide text-violet-600">
              Practice drills
            </p>
            {drills.map((ex) => (
              <Link key={ex.id} href={`/exercise/${ex.id}`} className="btn-secondary text-sm">
                {ex.emoji} {ex.title}
              </Link>
            ))}
          </div>
        )}
        <Link href="/dashboard" className="btn-primary inline-flex">
          Dashboard
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Nav />
      <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
      <Celebration
        show={showCelebrate}
        kind="correct"
        title="Nice!"
        subtitle={`+XP · keep the streak alive`}
        onClose={() => setShowCelebrate(false)}
      />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-emerald-600">
            ← Dashboard
          </Link>
          <div className="text-sm font-black text-slate-700">
            {mod.emoji} {mod.title}
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Item {Math.min(safeIdx + 1, total)} / {total}
        </p>

        {!finished && item && (
          <div className="card">
            <LessonItemView
              key={item.id}
              item={item}
              onResolved={(correct) => {
                if (resolved) return;
                setResolved(true);
                attempt({
                  correct,
                  topic: item.topic,
                  topics: itemTopics(item),
                  states: "states" in item ? item.states : undefined,
                  xp: item.xp,
                  // Match adaptive lessonToCards() ids (__quiz / __fb) for shared mastery space
                  itemId: canonicalMasteryItemId(item),
                });
                completeItem(item.id);
                if (correct) setShowCelebrate(true);
              }}
            />
            {resolved && (
              <div className="mt-6 flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (safeIdx + 1 >= total) {
                      completeLesson(mod.id);
                      setFinished(true);
                    } else {
                      setIdx(safeIdx + 1);
                      setResolved(false);
                    }
                  }}
                >
                  {safeIdx + 1 >= total ? "Complete module" : "Next"}
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="card space-y-4 text-center">
            <div className="text-5xl">🎉</div>
            <h1 className="text-3xl font-black text-slate-900">Module complete!</h1>
            <p className="text-slate-600">
              You cleared <strong>{mod.title}</strong>. Bonus XP applied.{" "}
              {moduleExerciseIds(mod).length
                ? "Ready for the practical drill(s)?"
                : "Check the skill tree for what's next."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {moduleExerciseIds(mod).map((id) => {
                const ex = EXERCISE_MAP[id];
                if (!ex) return null;
                return (
                  <Link key={id} href={`/exercise/${id}`} className="btn-secondary">
                    {ex.emoji} {ex.title}
                  </Link>
                );
              })}
              <Link href="/dashboard" className="btn-primary">
                Back to map
              </Link>
            </div>
          </div>
        )}

        <Disclaimer compact />
      </main>
    </div>
  );
}

export default function LessonClient() {
  return (
    <ProfileGate>
      <LessonContent />
    </ProfileGate>
  );
}
