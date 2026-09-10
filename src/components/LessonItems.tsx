"use client";

import { useMemo, useState } from "react";
import {
  FillBlankItem,
  FlashcardItem,
  LessonItem,
  McqItem,
  NarrativeItem,
} from "@/lib/types";
import { FeedbackPanel } from "./FeedbackPanel";

export function LessonItemView({
  item,
  onResolved,
}: {
  item: LessonItem;
  onResolved: (correct: boolean) => void;
}) {
  switch (item.type) {
    case "flashcard":
      return <Flashcard item={item} onResolved={onResolved} />;
    case "fillblank":
      return <FillBlank item={item} onResolved={onResolved} />;
    case "narrative":
      return <Narrative item={item} onResolved={onResolved} />;
    case "mcq":
      return <Mcq item={item} onResolved={onResolved} />;
  }
}

function Flashcard({
  item,
  onResolved,
}: {
  item: FlashcardItem;
  onResolved: (c: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [selfGrade, setSelfGrade] = useState<boolean | null>(null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="group w-full perspective"
      >
        <div
          className={`relative min-h-[220px] w-full rounded-3xl border-4 border-white p-6 text-left shadow-xl transition-transform duration-500 ${
            flipped
              ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
              : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
          }`}
        >
          <div className="mb-3 text-xs font-black uppercase tracking-widest opacity-80">
            {flipped ? "Answer" : "Tap to flip"} · Flashcard
          </div>
          <div className="text-xl font-black leading-snug sm:text-2xl">
            {flipped ? item.back : item.front}
          </div>
        </div>
      </button>
      {flipped && !done && (
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-primary"
            onClick={() => {
              setDone(true);
              setSelfGrade(true);
              onResolved(true);
            }}
          >
            Got it (+XP)
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setDone(true);
              setSelfGrade(false);
              onResolved(false);
            }}
          >
            Review again later
          </button>
        </div>
      )}
      {done && selfGrade !== null && (
        <FeedbackPanel
          correct={selfGrade}
          explanation={
            selfGrade
              ? "Marked as known — flashcards reward honest self-checks. Spaced review beats rereading."
              : "Queued for review — honest self-grades keep Adaptive Review honest. Spaced review beats rereading."
          }
        />
      )}
    </div>
  );
}

function Mcq({
  item,
  onResolved,
}: {
  item: McqItem;
  onResolved: (c: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === item.correctIndex;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-800 sm:text-2xl">{item.question}</h2>
      <div className="grid gap-2">
        {item.options.map((opt, i) => {
          let cls =
            "rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-left font-semibold text-slate-700 transition hover:border-emerald-300";
          if (picked !== null) {
            if (i === item.correctIndex) cls = "rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-left font-semibold text-emerald-900";
            else if (i === picked) cls = "rounded-2xl border-2 border-rose-400 bg-rose-50 px-4 py-3 text-left font-semibold text-rose-900";
            else cls += " opacity-60";
          }
          return (
            <button
              key={i}
              disabled={picked !== null}
              className={cls}
              onClick={() => {
                setPicked(i);
                onResolved(i === item.correctIndex);
              }}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && <FeedbackPanel correct={correct} explanation={item.explanation} />}
    </div>
  );
}

function FillBlank({
  item,
  onResolved,
}: {
  item: FillBlankItem;
  onResolved: (c: boolean) => void;
}) {
  const parts = useMemo(() => item.sentence.split("___"), [item.sentence]);
  const [values, setValues] = useState<string[]>(() => item.blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.]/g, "")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ");

  const acceptedFor = (b: FillBlankItem["blanks"][number]) =>
    [b.answer, ...(b.alternatives || [])].map(norm);

  const blankCorrect = (i: number) => {
    const v = norm(values[i] || "");
    return acceptedFor(item.blanks[i]).includes(v);
  };

  const allCorrect = checked && item.blanks.every((_, i) => blankCorrect(i));

  const rejectionDetail = () => {
    return item.blanks
      .map((b, i) => {
        if (blankCorrect(i)) return null;
        const entered = (values[i] || "").trim() || "(empty)";
        const accepted = [b.answer, ...(b.alternatives || [])];
        let note = `Blank ${i + 1}: you entered "${entered}"; accepted: ${accepted.join(", ")}.`;
        if (norm(entered) === "computerized" && norm(b.answer) === "unencrypted") {
          note +=
            ' Tip: "computerized" is common statutory language for the data system — this blank wants the encryption-status word (unencrypted / unredacted).';
        }
        return note;
      })
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold uppercase tracking-wide text-violet-600">{item.prompt}</p>
      <div className="rounded-3xl border-2 border-violet-100 bg-violet-50/50 p-5 text-lg font-semibold leading-relaxed text-slate-800">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < item.blanks.length && (
              <input
                className={`mx-1 inline-block w-36 rounded-xl border-2 bg-white px-2 py-1 text-center font-bold outline-none sm:w-44 ${
                  checked
                    ? blankCorrect(i)
                      ? "border-emerald-400 text-emerald-800"
                      : "border-rose-400 text-rose-800"
                    : "border-violet-300 text-violet-800 focus:border-violet-500"
                }`}
                value={values[i]}
                disabled={checked}
                placeholder="…"
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
              />
            )}
          </span>
        ))}
      </div>
      {!checked && (
        <button
          className="btn-primary"
          onClick={() => {
            setChecked(true);
            const ok = item.blanks.every((_, i) => blankCorrect(i));
            onResolved(ok);
          }}
        >
          Check answers
        </button>
      )}
      {checked && (
        <FeedbackPanel
          correct={!!allCorrect}
          explanation={
            allCorrect ? item.explanation : `${item.explanation} ${rejectionDetail()}`
          }
        />
      )}
    </div>
  );
}

function Narrative({
  item,
  onResolved,
}: {
  item: NarrativeItem;
  onResolved: (c: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const totalStory = item.story.length;

  if (step < totalStory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{item.emoji}</span>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-rose-500">
              Case file · {step + 1}/{totalStory}
            </div>
            <h2 className="text-2xl font-black text-slate-800">{item.title}</h2>
          </div>
        </div>
        <p className="rounded-3xl border-2 border-rose-100 bg-white p-5 text-lg leading-relaxed text-slate-700 shadow-sm">
          {item.story[step]}
        </p>
        <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
          {step === totalStory - 1 ? "See takeaway" : "Continue"}
        </button>
      </div>
    );
  }

  if (step === totalStory) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-amber-300 to-orange-400 p-5 text-slate-900 shadow-lg">
          <div className="text-xs font-black uppercase tracking-widest">Takeaway</div>
          <p className="mt-2 text-lg font-bold">{item.takeaway}</p>
        </div>
        <button className="btn-primary" onClick={() => setStep(totalStory + 1)}>
          Quick check →
        </button>
      </div>
    );
  }

  const q = item.quiz;
  const correct = picked === q.correctIndex;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-800">{q.question}</h2>
      <div className="grid gap-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            disabled={picked !== null}
            className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
              picked === null
                ? "border-slate-200 bg-white hover:border-emerald-300"
                : i === q.correctIndex
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : i === picked
                    ? "border-rose-400 bg-rose-50"
                    : "border-slate-100 opacity-50"
            }`}
            onClick={() => {
              setPicked(i);
              onResolved(i === q.correctIndex);
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {picked !== null && <FeedbackPanel correct={correct} explanation={q.explanation} />}
    </div>
  );
}
