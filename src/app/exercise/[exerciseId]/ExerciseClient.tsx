"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { BadgeUnlockToast, Celebration } from "@/components/Celebration";
import { Disclaimer } from "@/components/Disclaimer";
import { ProfileGate, useProfile } from "@/hooks/useProfile";
import { EXERCISE_MAP } from "@/data/exercises";

function ExerciseContent() {
  const params = useParams();
  const exerciseId = String(params.exerciseId || "");
  const exercise = EXERCISE_MAP[exerciseId];
  const { attempts, completeExercise, justUnlocked, clearUnlocks } = useProfile();
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const scored = useRef(false);

  if (!exercise) {
    return (
      <main className="mx-auto max-w-lg p-10 text-center">
        <p className="font-black">Exercise not found</p>
        <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
          Back
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Nav />
      <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
      <Celebration
        show={celebrate}
        kind="complete"
        title="Drill complete!"
        subtitle={score ? `${score.correct}/${score.total} teaching checks` : undefined}
        onClose={() => setCelebrate(false)}
      />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-emerald-600">
          ← Dashboard
        </Link>
        <div className="card">
          <ExercisePlayer
            exercise={exercise}
            onFinished={(s) => {
              if (scored.current) return;
              scored.current = true;
              setScore({ correct: s.correct, total: s.total });
              setDone(true);
              setCelebrate(true);
              const ratio = s.total ? s.correct / s.total : 0;
              const rowXp = Math.max(
                2,
                Math.round((exercise.xp * Math.max(0.4, ratio)) / Math.max(1, s.rows.length))
              );
              // Per-state / per-check mastery — not one binary ratio for all states
              attempts(
                s.rows.map((row) => ({
                  correct: row.correct,
                  topic: row.topic ?? exercise.topic,
                  topics: row.topics ?? exercise.topics,
                  states: row.states,
                  itemId: row.itemId,
                  xp: rowXp,
                }))
              );
              completeExercise(exercise.id, 25);
            }}
          />
        </div>
        {done && score && (
          <div className="card flex flex-wrap items-center justify-between gap-3 border-emerald-200 bg-emerald-50">
            <div>
              <div className="font-black text-emerald-900">
                Score {score.correct}/{score.total}
              </div>
              <p className="text-sm text-emerald-800">
                Re-read the teaching explanations above — that&apos;s the learning.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost text-sm" onClick={() => window.location.reload()}>
                Retry
              </button>
              <Link href="/dashboard" className="btn-primary text-sm">
                Skill tree
              </Link>
              <Link href="/progress" className="btn-secondary text-sm">
                Progress
              </Link>
            </div>
          </div>
        )}
        <Disclaimer compact />
      </main>
    </div>
  );
}

export default function ExerciseClient() {
  return (
    <ProfileGate>
      <ExerciseContent />
    </ProfileGate>
  );
}
