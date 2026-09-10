"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { XpBar } from "@/components/XpBar";
import { Disclaimer } from "@/components/Disclaimer";
import { BadgeUnlockToast } from "@/components/Celebration";
import { ProfileGate, useProfile } from "@/hooks/useProfile";
import {
  MODULES,
  lessonItemCount,
  isModuleUnlocked,
  moduleExerciseIds,
  unlockRequirement,
  DEMO_ADVANCED_PREREQS,
  MODULE_MAP,
} from "@/data/modules";
import { EXERCISE_MAP } from "@/data/exercises";
import { hasAdaptiveHistory, weakTopics } from "@/lib/adaptive";

function DashboardContent() {
  const { profile, justUnlocked, clearUnlocks, reset, skipToAdvanced } = useProfile();
  const router = useRouter();
  if (!profile) return null;

  const nextModule =
    MODULES.find(
      (m) =>
        isModuleUnlocked(m.id, profile.completedLessons) &&
        !profile.completedLessons.includes(m.id)
    ) || MODULES.find((m) => !profile.completedLessons.includes(m.id));

  const advancedUnlocked = isModuleUnlocked("multi-state", profile.completedLessons);
  const canSkipDemo = !advancedUnlocked;
  const weak = weakTopics(profile, 3);
  const cold = !hasAdaptiveHistory(profile);

  return (
    <div className="min-h-screen pb-16">
      <Nav />
      <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              Welcome back
            </p>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              {profile.name}&apos;s skill tree
            </h1>
          </div>
          <button
            className="text-xs font-bold text-slate-400 underline hover:text-rose-500"
            onClick={() => {
              reset();
              router.push("/");
            }}
          >
            Reset demo profile
          </button>
        </header>

        <XpBar
          xp={profile.xp}
          dailyXp={profile.dailyXp}
          dailyGoal={profile.dailyGoal}
          streak={profile.streak}
        />


        <Link
          href="/adaptive"
          className="card flex items-center justify-between gap-4 border-2 border-fuchsia-300 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-200 transition hover:scale-[1.01]"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 text-3xl backdrop-blur">
              🧠
            </span>
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-fuchsia-100">
                First-class · Adaptive
              </div>
              <div className="text-xl font-black sm:text-2xl">Adaptive Review</div>
              <div className="text-sm text-fuchsia-100">
                {cold
                  ? "Cold start: hard multi-state sampler (clocks, AG traps, risk seams)"
                  : weak.length
                    ? `Based on your misses in ${weak.map((w) => w.label).join(", ")}`
                    : "Spaced review of your lowest-mastery topics"}
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-2xl bg-white px-4 py-2 text-sm font-black text-fuchsia-700 shadow">
            Train
          </span>
        </Link>


        {canSkipDemo && (
          <div className="card flex flex-col gap-3 border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-violet-600">
                Demo shortcut
              </div>
              <h2 className="text-lg font-black text-slate-800">
                Skip to advanced practice
              </h2>
              <p className="text-sm text-slate-600">
                Marks {DEMO_ADVANCED_PREREQS.map((id) => MODULE_MAP[id]?.title).filter(Boolean).join(" → ")}{" "}
                complete so Multi-State unlocks. Practice drills stay available on locked modules anytime.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary shrink-0 text-sm"
              onClick={() => skipToAdvanced()}
            >
              Skip to advanced practice (demo)
            </button>
          </div>
        )}

        {nextModule && (
          <Link
            href={`/lesson/${nextModule.id}`}
            className="card flex items-center justify-between gap-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-lime-50 transition hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{nextModule.emoji}</span>
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-emerald-600">
                  Continue learning
                </div>
                <div className="text-xl font-black text-slate-800">{nextModule.title}</div>
                <div className="text-sm text-slate-500">{nextModule.subtitle}</div>
              </div>
            </div>
            <span className="btn-primary shrink-0">Go</span>
          </Link>
        )}

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-black text-slate-800">Module map</h2>
            <p className="text-xs font-semibold text-slate-500">
              Lessons unlock in order · Practice drills available even when locked
            </p>
          </div>
          <div className="relative space-y-4">
            {MODULES.map((m, idx) => {
              const unlocked = isModuleUnlocked(m.id, profile.completedLessons);
              const done = profile.completedLessons.includes(m.id);
              const exIds = moduleExerciseIds(m);
              const exList = exIds.map((id) => EXERCISE_MAP[id]).filter(Boolean);
              const exDone =
                exIds.length === 0 ||
                exIds.every((id) => profile.completedExercises.includes(id));
              const itemCount = lessonItemCount(m);
              const req = !unlocked ? unlockRequirement(m.id) : null;
              return (
                <div key={m.id} className="relative">
                  {idx < MODULES.length - 1 && (
                    <div className="absolute left-8 top-16 h-[calc(100%+1rem)] w-1 bg-gradient-to-b from-emerald-300 to-violet-300 opacity-60" />
                  )}
                  <div
                    className={`card relative flex flex-col gap-3 border-2 sm:flex-row sm:items-center sm:justify-between ${
                      done
                        ? "border-emerald-300"
                        : unlocked
                          ? "border-violet-200"
                          : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br text-3xl text-white shadow-lg ${m.color} ${
                          !unlocked && !done ? "opacity-80" : ""
                        }`}
                      >
                        {done ? "✅" : unlocked ? m.emoji : "🔒"}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Module {m.order}
                          {done ? " · Mastered" : unlocked ? " · Unlocked" : " · Locked"}
                        </div>
                        <h3 className="text-xl font-black text-slate-800">{m.title}</h3>
                        <p className="text-sm text-slate-500">{m.subtitle}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {itemCount} lesson items
                          {exList.length
                            ? ` · ${exList.length} drill${exList.length > 1 ? "s" : ""}`
                            : ""}
                          {exList.length && exDone ? " ✓" : ""}
                        </p>
                        {req && (
                          <p className="mt-1 text-xs font-bold text-amber-700">
                            🔒 {req}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {unlocked ? (
                        <Link href={`/lesson/${m.id}`} className="btn-primary text-sm">
                          {done ? "Review" : "Learn"}
                        </Link>
                      ) : (
                        <span
                          className="btn-ghost cursor-not-allowed text-sm opacity-60"
                          title={req || "Locked"}
                        >
                          🔒 Lessons locked
                        </span>
                      )}
                      {exList.map((ex) => (
                        <Link
                          key={ex.id}
                          href={`/exercise/${ex.id}`}
                          className={`text-sm ${
                            unlocked ? "btn-secondary" : "btn-ghost border border-violet-200"
                          }`}
                          title={
                            unlocked
                              ? ex.title
                              : "Practice drill — available while lessons stay locked"
                          }
                        >
                          {!unlocked ? "Practice · " : ""}
                          {profile.completedExercises.includes(ex.id)
                            ? `Redo: ${ex.emoji}`
                            : ex.emoji}{" "}
                          {ex.title.length > 24
                            ? ex.title.slice(0, 22) + "…"
                            : ex.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProfileGate>
      <DashboardContent />
    </ProfileGate>
  );
}
