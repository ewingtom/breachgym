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
    <div className="space-y-3 border-b border-[var(--hairline-light)] pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 text-sm">
        <div className="flex flex-wrap gap-6">
          <div>
            <div className="label-caps">Total XP</div>
            <div className="mt-0.5 font-serif-brand text-xl text-ink">{xp.toLocaleString()}</div>
          </div>
          <div>
            <div className="label-caps">Streak</div>
            <div className="mt-0.5 font-serif-brand text-xl text-ink">
              {streak} day{streak === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-muted">
          {met
            ? overflow > 0
              ? `Daily goal met · +${overflow} XP`
              : "Daily goal met"
            : `${displayXp} / ${dailyGoal} XP today`}
        </div>
      </div>
      <div className="meter-track">
        <div
          className={`meter-fill ${met ? "meter-fill-copper" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
