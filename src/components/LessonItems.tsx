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
      <button type="button" onClick={() => setFlipped((f) => !f)} className="w-full text-left">
        <div className="min-h-[200px] w-full rounded-sm border border-[var(--hairline-light)] bg-limestone p-6">
          <div className="label-caps mb-3">{flipped ? "Answer" : "Tap to reveal"} · Flashcard</div>
          <div className="font-serif-brand text-xl leading-snug text-ink sm:text-2xl">
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
            Got it
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setDone(true);
              setSelfGrade(false);
              onResolved(false);
            }}
          >
            Review later
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
      <h2 className="font-serif-brand text-xl text-ink sm:text-2xl">{item.question}</h2>
      <div className="grid gap-2">
        {item.options.map((opt, i) => {
          let cls = "choice";
          if (picked !== null) {
            if (i === item.correctIndex) cls = "choice choice-correct";
            else if (i === picked) cls = "choice choice-miss";
            else cls += " opacity-50";
          } else if (picked === i) {
            cls += " choice-selected";
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
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-xs text-muted">
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
      <p className="label-caps">{item.prompt}</p>
      <div className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-5 text-lg leading-relaxed text-ink">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < item.blanks.length && (
              <input
                className={`mx-1 inline-block w-36 rounded-sm border bg-ivory px-2 py-1 text-center text-base outline-none sm:w-44 ${
                  checked
                    ? blankCorrect(i)
                      ? "border-ok text-ok"
                      : "border-miss text-miss"
                    : "border-[var(--hairline-light)] text-ink focus:border-copper"
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
        <div>
          <div className="label-caps">
            Case file · {step + 1}/{totalStory}
          </div>
          <h2 className="mt-1 font-serif-brand text-2xl text-ink">{item.title}</h2>
        </div>
        <p className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-5 text-lg leading-relaxed text-ink">
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
        <div className="rounded-sm border border-[var(--hairline-light)] bg-limestone p-5">
          <div className="label-caps">Takeaway</div>
          <p className="mt-2 text-lg font-medium text-ink">{item.takeaway}</p>
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
      <h2 className="font-serif-brand text-xl text-ink">{q.question}</h2>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let cls = "choice";
          if (picked !== null) {
            if (i === q.correctIndex) cls = "choice choice-correct";
            else if (i === picked) cls = "choice choice-miss";
            else cls += " opacity-50";
          }
          return (
            <button
              key={i}
              disabled={picked !== null}
              className={cls}
              onClick={() => {
                setPicked(i);
                onResolved(i === q.correctIndex);
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && <FeedbackPanel correct={correct} explanation={q.explanation} />}
    </div>
  );
}
