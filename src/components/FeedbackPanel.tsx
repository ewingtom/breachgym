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
      className={`mt-4 rounded-sm border px-4 py-3 text-sm leading-relaxed ${
        correct
          ? "border-[var(--ok)]/30 bg-[var(--ok-soft)] text-ink"
          : "border-[var(--miss)]/30 bg-[var(--miss-soft)] text-ink"
      }`}
    >
      <div className={`mb-1 text-xs font-semibold uppercase tracking-[0.12em] ${correct ? "text-ok" : "text-miss"}`}>
        {correct ? "Correct" : "Not quite"}
      </div>
      <p className="font-medium text-ink">{summary}</p>
      {detail ? (
        <details className="group mt-2">
          <summary
            className={`cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink [&::-webkit-details-marker]:hidden`}
          >
            <span className="inline-flex items-center gap-1">
              <span className="transition group-open:rotate-90">▸</span>
              More detail
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
        </details>
      ) : null}
    </div>
  );
}
