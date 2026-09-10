export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-center text-xs text-muted">
        Curriculum version: Sep 2026 — educational demo; verify primary sources. Not legal advice.
      </p>
    );
  }
  return (
    <div className="rounded-sm border border-[var(--hairline-light)] bg-ivory px-4 py-3 text-sm text-ink">
      <strong className="font-semibold">Educational disclaimer:</strong> BreachGym is a training
      prototype for learning concepts in US state data breach notification laws. It is{" "}
      <em>not legal advice</em>, may simplify or lag statutory amendments, and must not be relied on
      for client counseling. Always verify current statutes, regulations, and case law.
      <p className="mt-2 text-xs text-muted">
        Curriculum version: Sep 2026 — educational demo; verify primary sources.
      </p>
    </div>
  );
}
