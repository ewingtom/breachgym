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
        <p className="font-medium text-miss">
          Unknown exercise type. Return to the dashboard and reopen the drill.
        </p>
      );
  }
}

function Shell({
  title,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h1 className="font-serif-brand text-2xl text-ink sm:text-3xl">{title}</h1>
      {children}
    </div>
  );
}

function SelectChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-sm px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border border-copper bg-[rgba(184,115,51,0.1)] text-ink"
          : "border border-[var(--hairline-light)] bg-ivory text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
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
      <p className="text-muted">{ex.subtitle}</p>
      <div className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-4 font-mono text-sm leading-relaxed text-ink whitespace-pre-wrap">
        {ex.clientEmail}
      </div>
      <p className="text-sm text-muted">{ex.factPattern}</p>
      <p className="font-medium text-ink">
        For each state: Notify now, or investigate/document first (notice not automatic)? Teaching
        key — &quot;Not automatic&quot; is not a clean no-notice.
      </p>
      <div className="grid gap-2">
        {ex.states.map((code) => {
          const st = STATE_MAP[code];
          return (
            <div
              key={code}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[var(--hairline-light)] bg-ivory px-4 py-3"
            >
              <div>
                <div className="font-medium text-ink">
                  {st.name} <span className="text-muted">({code})</span>
                </div>
                <div className="text-xs text-muted">{st.statuteHint}</div>
              </div>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <SelectChip
                    key={String(val)}
                    disabled={submitted}
                    active={guesses[code] === val}
                    onClick={() => setGuesses((g) => ({ ...g, [code]: val }))}
                  >
                    {val ? "Notify" : "Investigate first"}
                  </SelectChip>
                ))}
              </div>
              {submitted && (
                <div className="w-full text-sm">
                  <span
                    className={
                      guesses[code] === ex.answers[code]
                        ? "font-medium text-ok"
                        : "font-medium text-miss"
                    }
                  >
                    {guesses[code] === ex.answers[code] ? "✓" : "✗"} Key:{" "}
                    {ex.answers[code]
                      ? "Notify"
                      : "Investigate/document first (notice not automatic)"}
                  </span>
                  <p className="mt-1 text-muted">{ex.explanations[code] || ""}</p>
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
      <p className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-4 text-ink">
        {ex.scenario}
      </p>
      <p className="font-medium text-ink">
        Does encryption safe harbor likely apply? (Yes = harbor / No = still in play)
      </p>
      <div className="grid gap-2">
        {ex.states.map((code) => (
          <div
            key={code}
            className="rounded-sm border border-[var(--hairline-light)] bg-ivory px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium text-ink">{STATE_MAP[code].name}</div>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <SelectChip
                    key={String(val)}
                    disabled={submitted}
                    active={guesses[code] === val}
                    onClick={() => setGuesses((g) => ({ ...g, [code]: val }))}
                  >
                    {val ? "Harbor yes" : "Harbor no"}
                  </SelectChip>
                ))}
              </div>
            </div>
            {submitted && (
              <p className="mt-2 text-sm text-muted">
                <span className="font-medium text-ink">
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
      <p className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-4 text-ink">
        {ex.scenario}
      </p>
      {phase === 1 && (
        <>
          <p className="font-medium text-ink">
            Select which field indices most clearly put each state&apos;s PI definition in play
            (teaching key). Select none if classic PI likely not triggered — a password hash is
            fact-dependent, not an automatic fire.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {ex.fields.map((f, i) => (
              <span
                key={i}
                className="rounded-sm border border-[var(--hairline-light)] px-2 py-1"
              >
                {i}: {f}
              </span>
            ))}
          </div>
          {ex.states.map((code) => (
            <div
              key={code}
              className="rounded-sm border border-[var(--hairline-light)] bg-ivory p-3"
            >
              <div className="mb-2 font-medium text-ink">{STATE_MAP[code].name}</div>
              <div className="flex flex-wrap gap-2">
                {ex.fields.map((f, i) => (
                  <SelectChip
                    key={i}
                    active={(selected[code] || []).includes(i)}
                    onClick={() => toggle(code, i)}
                  >
                    {i}: {f}
                  </SelectChip>
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
          <div className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-3 text-sm">
            <div className="label-caps mb-2">Teaching key — fields in play</div>
            {ex.states.map((code) => (
              <div key={code} className="text-ink">
                {code}:{" "}
                {(ex.triggers[code] || []).length
                  ? (ex.triggers[code] || []).map((i) => ex.fields[i]).join(", ")
                  : "no automatic fire on these facts (hash/credentials may still be fact-dependent)"}
              </div>
            ))}
          </div>
          <p className="font-medium text-ink">Select all accurate analysis statements:</p>
          {ex.analysisChoices.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-start gap-3 rounded-sm border border-[var(--hairline-light)] bg-ivory p-3"
            >
              <input
                type="checkbox"
                disabled={phase === 3}
                checked={!!choices[c.id]}
                onChange={(e) => setChoices((ch) => ({ ...ch, [c.id]: e.target.checked }))}
                className="mt-1 accent-[var(--copper)]"
              />
              <span className="text-sm font-medium text-ink">{c.text}</span>
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
      <p className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-4 text-ink">
        {ex.scenario}
      </p>
      <h2 className="font-serif-brand text-lg text-ink">{ex.question}</h2>
      <div className="grid gap-2">
        {ex.options.map((o, i) => {
          let cls = "choice";
          if (p1 !== null) {
            if (i === ex.correctIndex) cls = "choice choice-correct";
            else if (i === p1) cls = "choice choice-miss";
            else cls += " opacity-50";
          }
          return (
            <button
              key={i}
              disabled={p1 !== null}
              className={cls}
              onClick={() => setP1(i)}
            >
              {o}
            </button>
          );
        })}
      </div>
      {p1 !== null && (
        <FeedbackPanel correct={p1 === ex.correctIndex} explanation={ex.explanation} />
      )}
      {p1 !== null && ex.followUp && (
        <>
          <h2 className="font-serif-brand text-lg text-ink">{ex.followUp.question}</h2>
          <div className="grid gap-2">
            {ex.followUp.options.map((o, i) => {
              let cls = "choice";
              if (p2 !== null) {
                if (i === ex.followUp!.correctIndex) cls = "choice choice-correct";
                else if (i === p2) cls = "choice choice-miss";
                else cls += " opacity-50";
              }
              return (
                <button
                  key={i}
                  disabled={p2 !== null}
                  className={cls}
                  onClick={() => setP2(i)}
                >
                  {o}
                </button>
              );
            })}
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
