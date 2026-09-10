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
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  const emoji = kind === "badge" ? "🏅" : kind === "complete" ? "🎉" : "✨";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/45 px-4 pt-24 backdrop-blur-[2px]">
      <div className="animate-bounce-in pointer-events-auto rounded-3xl border-4 border-emerald-700 bg-white px-6 py-5 text-center shadow-2xl shadow-slate-900/30">
        <div className="text-4xl">{emoji}</div>
        <div className="mt-1 text-xl font-black text-slate-900">{title}</div>
        {subtitle && (
          <div className="mt-1 text-sm font-bold text-slate-700">{subtitle}</div>
        )}
        <button
          onClick={onClose}
          className="mt-3 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          Nice!
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
      title={`Badge unlocked: ${badge?.name ?? "New badge"}`}
      subtitle={badge ? `${badge.emoji} ${badge.description}` : undefined}
      onClose={onClear}
    />
  );
}
