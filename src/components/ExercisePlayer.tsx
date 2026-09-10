"use client";

import { useMemo, useState } from "react";
import {
  AcquisitionExercise,
  Exercise,
  NotificationTriggerExercise,
  PiMatrixExercise,
  SafeHarborExercise,
  StateCode,
} from "@/lib/types";
import { STATE_MAP } from "@/data/states";
import { FeedbackPanel } from "./FeedbackPanel";

/** One scored row/state/check from an exercise for adaptive mastery. */
export type ExerciseRowResult = {
  correct: boolean;
  topic?: string;
  topics?: string[];
  states?: string[];
  itemId: string;
};

export type ExerciseFinishResult = {
  correct: number;
  total: number;
  rows: ExerciseRowResult[];
};

export function ExercisePlayer({
  exercise,
  onFinished,
}: {
  exercise: Exercise;
  onFinished: (score: ExerciseFinishResult) => void;
}) {
  switch (exercise.type) {
    case "notification-trigger":
      return <NotifyExercise ex={exercise} onFinished={onFinished} />;
    case "pi-matrix":
      return <PiExercise ex={exercise} onFinished={onFinished} />;
    case "safe-harbor":
      return <HarborExercise ex={exercise} onFinished={onFinished} />;
    case "acquisition-analysis":
      return <AcquireExercise ex={exercise} onFinished={onFinished} />;
    default:
      return (
        <p className="font-bold text-rose-700">
          Unknown exercise type. Return to the dashboard and reopen the drill.
        </p>
      );
  }
}

function Shell({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function NotifyExercise({
  ex,
  onFinished,
}: {
  ex: NotificationTriggerExercise;
  onFinished: (s: ExerciseFinishResult) => void;
}) {
  const [guesses, setGuesses] = useState<Partial<Record<StateCode, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let correct = 0;
    for (const s of ex.states) {
      if (guesses[s] === ex.answers[s]) correct++;
    }
    return { correct, total: ex.states.length };
  }, [guesses, ex]);

  return (
    <Shell title={ex.title} emoji={ex.emoji}>
      <p className="text-slate-600">{ex.subtitle}</p>
      <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
        {ex.clientEmail}
      </div>
      <p className="text-sm font-semibold text-slate-500">{ex.factPattern}</p>
      <p className="font-bold text-slate-800">
        For each state: Notify now, or investigate/document first (notice not automatic)? Teaching key — &quot;Not automatic&quot; is not a clean no-notice.
      </p>
      <div className="grid gap-2">
        {ex.states.map((code) => {
          const st = STATE_MAP[code];
          return (
            <div
              key={code}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-emerald-100 bg-white px-4 py-3"
            >
              <div>
                <div className="font-black text-slate-800">
                  {st.name} <span className="text-slate-400">({code})</span>
                </div>
                <div className="text-xs text-slate-500">{st.statuteHint}</div>
              </div>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    disabled={submitted}
                    onClick={() => setGuesses((g) => ({ ...g, [code]: val }))}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                      guesses[code] === val
                        ? val
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {val ? "Notify" : "Investigate first"}
                  </button>
                ))}
              </div>
              {submitted && (
                <div className="w-full text-sm">
                  <span className={guesses[code] === ex.answers[code] ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                    {guesses[code] === ex.answers[code] ? "✓" : "✗"} Key:{" "}
                    {ex.answers[code] ? "Notify" : "Investigate/document first (notice not automatic)"}
                  </span>
                  <p className="mt-1 text-slate-600">{ex.explanations[code] || ""}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!submitted ? (
        <button
          className="btn-primary"
          disabled={ex.states.some((s) => guesses[s] === undefined)}
          onClick={() => {
            setSubmitted(true);
            const rows: ExerciseRowResult[] = ex.states.map((s) => ({
              correct: guesses[s] === ex.answers[s],
              topic: ex.topic,
              topics: ex.topics,
              states: [s],
              itemId: `ex-${ex.id}:${s}`,
            }));
            const correct = rows.filter((r) => r.correct).length;
            onFinished({ correct, total: ex.states.length, rows });
          }}
        >
          Submit matrix
        </button>
      ) : (
        <FeedbackPanel
          correct={score.correct === score.total}
          explanation={`Score ${score.correct}/${score.total}. Risk/misuse states reward investigation and documentation — "investigate first" is not a clean no-notice while access cannot be ruled out. Confirmed theft usually still means notify.`}
        />
      )}
    </Shell>
  );
}

function HarborExercise({
  ex,
  onFinished,
}: {
  ex: SafeHarborExercise;
  onFinished: (s: ExerciseFinishResult) => void;
}) {
  const [guesses, setGuesses] = useState<Partial<Record<StateCode, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(() => {
    let correct = 0;
    for (const s of ex.states) if (guesses[s] === ex.answers[s]) correct++;
    return { correct, total: ex.states.length };
  }, [guesses, ex]);

  return (
    <Shell title={ex.title} emoji={ex.emoji}>
      <p className="rounded-3xl border-2 border-sky-100 bg-sky-50 p-4 text-slate-700">{ex.scenario}</p>
      <p className="font-bold">Does encryption safe harbor likely apply? (Yes = harbor / No = still in play)</p>
      <div className="grid gap-2">
        {ex.states.map((code) => (
          <div key={code} className="rounded-2xl border-2 border-sky-100 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-black">{STATE_MAP[code].name}</div>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    disabled={submitted}
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      guesses[code] === val
                        ? "bg-sky-500 text-white"
                        : "bg-slate-100"
                    }`}
                    onClick={() => setGuesses((g) => ({ ...g, [code]: val }))}
                  >
                    {val ? "Harbor yes" : "Harbor no"}
                  </button>
                ))}
              </div>
            </div>
            {submitted && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-bold">
                  {guesses[code] === ex.answers[code] ? "✓" : "✗"}{" "}
                  {ex.answers[code] ? "Harbor likely" : "No full harbor"}
                </span>{" "}
                — {ex.explanations[code] || ""}
              </p>
            )}
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          className="btn-primary"
          disabled={ex.states.some((s) => guesses[s] === undefined)}
          onClick={() => {
            setSubmitted(true);
            const rows: ExerciseRowResult[] = ex.states.map((s) => ({
              correct: guesses[s] === ex.answers[s],
              topic: ex.topic,
              topics: ex.topics,
              states: [s],
              itemId: `ex-${ex.id}:${s}`,
            }));
            const correct = rows.filter((r) => r.correct).length;
            onFinished({ correct, total: ex.states.length, rows });
          }}
        >
          Check harbors
        </button>
      ) : (
        <FeedbackPanel
          correct={score.correct === score.total}
          explanation={`Score ${score.correct}/${score.total}. Harbor tracks the data that was actually encrypted — and whether keys traveled with it.`}
        />
      )}
    </Shell>
  );
}

function PiExercise({
  ex,
  onFinished,
}: {
  ex: PiMatrixExercise;
  onFinished: (s: ExerciseFinishResult) => void;
}) {
  const [selected, setSelected] = useState<Record<string, number[]>>({});
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  const toggle = (state: StateCode, idx: number) => {
    setSelected((prev) => {
      const cur = prev[state] || [];
      return {
        ...prev,
        [state]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx].sort(),
      };
    });
  };

  const matrixScore = () => {
    let correct = 0;
    const total = ex.states.length;
    for (const s of ex.states) {
      const a = (selected[s] || []).slice().sort().join(",");
      const b = (ex.triggers[s] || []).slice().sort().join(",");
      if (a === b) correct++;
    }
    return { correct, total };
  };

  const analysisScore = () => {
    const correctChoices = ex.analysisChoices.filter((c) => c.correct).map((c) => c.id);
    let correct = 0;
    for (const id of correctChoices) if (choices[id]) correct++;
    for (const c of ex.analysisChoices) {
      if (!c.correct && choices[c.id]) correct -= 1;
    }
    return {
      correct: Math.max(0, correct),
      total: correctChoices.length,
    };
  };

  return (
    <Shell title={ex.title} emoji={ex.emoji}>
      <p className="rounded-3xl bg-violet-50 border-2 border-violet-100 p-4 text-slate-700">{ex.scenario}</p>
      {phase === 1 && (
        <>
          <p className="font-bold">
            Select which field indices most clearly put each state&apos;s PI definition in play (teaching key). Select none if classic PI likely not triggered — a password hash is fact-dependent, not an automatic fire.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            {ex.fields.map((f, i) => (
              <span key={i} className="rounded-full bg-slate-100 px-2 py-1">
                {i}: {f}
              </span>
            ))}
          </div>
          {ex.states.map((code) => (
            <div key={code} className="rounded-2xl border-2 border-violet-100 bg-white p-3">
              <div className="mb-2 font-black">{STATE_MAP[code].name}</div>
              <div className="flex flex-wrap gap-2">
                {ex.fields.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => toggle(code, i)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      (selected[code] || []).includes(i)
                        ? "bg-violet-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i}: {f}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-primary" onClick={() => setPhase(2)}>
            Continue to analysis
          </button>
        </>
      )}
      {phase >= 2 && (
        <>
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm">
            <div className="font-black">Teaching key — fields in play</div>
            {ex.states.map((code) => (
              <div key={code}>
                {code}:{" "}
                {(ex.triggers[code] || []).length
                  ? (ex.triggers[code] || []).map((i) => ex.fields[i]).join(", ")
                  : "no automatic fire on these facts (hash/credentials may still be fact-dependent)"}
              </div>
            ))}
          </div>
          <p className="font-bold">Select all accurate analysis statements:</p>
          {ex.analysisChoices.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-3"
            >
              <input
                type="checkbox"
                disabled={phase === 3}
                checked={!!choices[c.id]}
                onChange={(e) => setChoices((ch) => ({ ...ch, [c.id]: e.target.checked }))}
                className="mt-1"
              />
              <span className="font-semibold text-slate-700">{c.text}</span>
            </label>
          ))}
          {phase === 2 && (
            <button
              className="btn-primary"
              onClick={() => {
                setPhase(3);
                const m = matrixScore();
                const a = analysisScore();
                const rows: ExerciseRowResult[] = [];
                for (const s of ex.states) {
                  const got = (selected[s] || []).slice().sort().join(",");
                  const key = (ex.triggers[s] || []).slice().sort().join(",");
                  rows.push({
                    correct: got === key,
                    topic: ex.topic,
                    topics: ex.topics,
                    states: [s],
                    itemId: `ex-${ex.id}:matrix:${s}`,
                  });
                }
                for (const c of ex.analysisChoices) {
                  const picked = !!choices[c.id];
                  rows.push({
                    correct: picked === c.correct,
                    topic: ex.topic,
                    topics: ex.topics,
                    states: ex.states,
                    itemId: `ex-${ex.id}:analysis:${c.id}`,
                  });
                }
                onFinished({
                  correct: m.correct + a.correct,
                  total: m.total + a.total,
                  rows,
                });
              }}
            >
              Submit analysis
            </button>
          )}
          {phase === 3 && (
            <div className="space-y-2">
              {ex.analysisChoices.map((c) => (
                <FeedbackPanel key={c.id} correct={c.correct} explanation={c.explanation} />
              ))}
            </div>
          )}
        </>
      )}
    </Shell>
  );
}

function AcquireExercise({
  ex,
  onFinished,
}: {
  ex: AcquisitionExercise;
  onFinished: (s: ExerciseFinishResult) => void;
}) {
  const [p1, setP1] = useState<number | null>(null);
  const [p2, setP2] = useState<number | null>(null);
  const done = p1 !== null && (!ex.followUp || p2 !== null);

  return (
    <Shell title={ex.title} emoji={ex.emoji}>
      <p className="rounded-3xl border-2 border-amber-100 bg-amber-50 p-4 text-slate-700">{ex.scenario}</p>
      <h2 className="text-lg font-black">{ex.question}</h2>
      <div className="grid gap-2">
        {ex.options.map((o, i) => (
          <button
            key={i}
            disabled={p1 !== null}
            className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
              p1 === null
                ? "border-slate-200 bg-white"
                : i === ex.correctIndex
                  ? "border-emerald-500 bg-emerald-50"
                  : i === p1
                    ? "border-rose-400 bg-rose-50"
                    : "opacity-50"
            }`}
            onClick={() => setP1(i)}
          >
            {o}
          </button>
        ))}
      </div>
      {p1 !== null && <FeedbackPanel correct={p1 === ex.correctIndex} explanation={ex.explanation} />}
      {p1 !== null && ex.followUp && (
        <>
          <h2 className="text-lg font-black">{ex.followUp.question}</h2>
          <div className="grid gap-2">
            {ex.followUp.options.map((o, i) => (
              <button
                key={i}
                disabled={p2 !== null}
                className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
                  p2 === null
                    ? "border-slate-200 bg-white"
                    : i === ex.followUp!.correctIndex
                      ? "border-emerald-500 bg-emerald-50"
                      : i === p2
                        ? "border-rose-400 bg-rose-50"
                        : "opacity-50"
                }`}
                onClick={() => {
                  setP2(i);
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {p2 !== null && (
            <FeedbackPanel
              correct={p2 === ex.followUp.correctIndex}
              explanation={ex.followUp.explanation}
            />
          )}
        </>
      )}
      {done && (
        <button
          className="btn-primary"
          onClick={() => {
            const rows: ExerciseRowResult[] = [
              {
                correct: p1 === ex.correctIndex,
                topic: ex.topic,
                topics: ex.topics,
                itemId: `ex-${ex.id}`,
              },
            ];
            if (ex.followUp) {
              rows.push({
                correct: p2 === ex.followUp.correctIndex,
                topic: ex.topic,
                topics: ex.topics,
                itemId: `ex-${ex.id}-fu`,
              });
            }
            onFinished({
              correct: rows.filter((r) => r.correct).length,
              total: rows.length,
              rows,
            });
          }}
        >
          Finish exercise
        </button>
      )}
    </Shell>
  );
}
