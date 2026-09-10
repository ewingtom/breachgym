"use client";

import { useEffect } from "react";
import { BADGES } from "@/data/badges";

export function Celebration({
  show,
  kind,
  title,
  subtitle,
  onClose,
}: {
  show: boolean;
  kind: "correct" | "badge" | "complete";
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 1800);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  const label = kind === "badge" ? "Badge" : kind === "complete" ? "Complete" : "Noted";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-aubergine/50 px-4 pt-20">
      <div className="animate-fade-in pointer-events-auto w-full max-w-sm rounded-sm border border-[var(--hairline-light)] bg-limestone px-5 py-4 text-center shadow-lg">
        <div className="label-caps text-copper">{label}</div>
        <div className="mt-1 font-serif-brand text-xl text-ink">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-muted">{subtitle}</div>}
        <button onClick={onClose} className="mt-3 text-xs font-semibold text-muted hover:text-ink">
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function BadgeUnlockToast({
  ids,
  onClear,
}: {
  ids: string[];
  onClear: () => void;
}) {
  if (!ids.length) return null;
  const badge = BADGES.find((b) => b.id === ids[0]);
  return (
    <Celebration
      show
      kind="badge"
      title={badge?.name ?? "New badge"}
      subtitle={badge?.description}
      onClose={onClear}
    />
  );
}
