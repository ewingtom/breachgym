export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-center text-xs text-slate-500">
        Curriculum version: Sep 2026 — educational demo; verify primary sources. Not legal advice.
      </p>
    );
  }
  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong className="font-extrabold">Educational disclaimer:</strong> BreachGym is a training
      prototype for learning concepts in US state data breach notification laws. It is{" "}
      <em>not legal advice</em>, may simplify or lag statutory amendments, and must not be relied on
      for client counseling. Always verify current statutes, regulations, and case law.
      <p className="mt-2 text-xs font-semibold text-amber-800/90">
        Curriculum version: Sep 2026 — educational demo; verify primary sources.
      </p>
    </div>
  );
}
