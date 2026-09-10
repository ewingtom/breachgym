"use client";

function splitSummary(explanation: string): { summary: string; detail: string | null } {
  const trimmed = explanation.trim();
  const match = trimmed.match(/^(.+?[.!?])(\s+[\s\S]+)?$/);
  if (!match) {
    return { summary: trimmed, detail: null };
  }
  const summary = match[1].trim();
  const detail = match[2]?.trim() || null;
  // Keep short single-sentence explanations flat (no accordion noise).
  if (!detail || detail.length < 40) {
    return { summary: trimmed, detail: null };
  }
  return { summary, detail };
}

export function FeedbackPanel({
  correct,
  explanation,
}: {
  correct: boolean;
  explanation: string;
}) {
  const { summary, detail } = splitSummary(explanation);

  return (
    <div
      className={`mt-4 rounded-2xl border-2 px-4 py-3 text-sm leading-relaxed ${
        correct
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : "border-rose-300 bg-rose-50 text-rose-950"
      }`}
    >
      <div className="mb-1 font-black">{correct ? "Correct! 🎉" : "Not quite — here's why"}</div>
      <p className="font-semibold">{summary}</p>
      {detail ? (
        <details className="mt-2 group">
          <summary
            className={`cursor-pointer list-none text-xs font-bold uppercase tracking-wide opacity-70 hover:opacity-100 [&::-webkit-details-marker]:hidden ${
              correct ? "text-emerald-800" : "text-rose-800"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <span className="transition group-open:rotate-90">▸</span>
              More detail
            </span>
          </summary>
          <p className={`mt-2 text-sm leading-relaxed opacity-80 ${correct ? "text-emerald-900" : "text-rose-900"}`}>
            {detail}
          </p>
        </details>
      ) : null}
    </div>
  );
}
