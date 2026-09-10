"use client";

export function XpBar({
  xp,
  dailyXp,
  dailyGoal,
  streak,
}: {
  xp: number;
  dailyXp: number;
  dailyGoal: number;
  streak: number;
}) {
  const met = dailyXp >= dailyGoal;
  const overflow = Math.max(0, dailyXp - dailyGoal);
  const displayXp = Math.min(dailyXp, dailyGoal);
  const pct = Math.min(100, Math.round((dailyXp / dailyGoal) * 100));
  return (
    <div className="grid gap-3 rounded-3xl border-2 border-emerald-100 bg-white p-4 shadow-sm sm:grid-cols-3">
      <Stat emoji="💎" label="Total XP" value={xp.toLocaleString()} />
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
        <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-emerald-700">
          <span>Daily goal</span>
          <span>
            {met
              ? overflow > 0
                ? `Met (+${overflow} XP)`
                : "Met ✓"
              : `${displayXp}/${dailyGoal} XP`}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {met && overflow > 0 && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-600">
            Daily goal met · {dailyXp} XP today (goal {dailyGoal})
          </p>
        )}
      </div>
      <Stat emoji="🔥" label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
    </div>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-xl font-black text-slate-800">{value}</div>
      </div>
    </div>
  );
}
