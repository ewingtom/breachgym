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
    <div className="shell-aubergine min-h-screen pb-16">
      <Nav />
      <BadgeUnlockToast ids={justUnlocked} onClear={clearUnlocks} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="panel-limestone rounded-sm border border-[var(--hairline-dark)] p-6 sm:p-8">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-caps">Welcome back</p>
              <h1 className="mt-1 font-serif-brand text-3xl text-ink sm:text-4xl">
                {profile.name}
              </h1>
            </div>
            <button
              className="text-xs text-muted underline decoration-[var(--hairline-light)] underline-offset-2 hover:text-ink"
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

          <div className="mt-6 space-y-1 border-b border-[var(--hairline-light)] pb-5">
            <Link href="/adaptive" className="link-copper inline-flex items-baseline gap-2 text-sm">
              Adaptive Review
              <span className="text-xs font-normal text-muted">
                {cold
                  ? "· cold-start hard sampler"
                  : weak.length
                    ? `· ${weak.map((w) => w.label).join(", ")}`
                    : "· spaced weak topics"}
              </span>
            </Link>
          </div>

          {canSkipDemo && (
            <div className="mt-5 flex flex-col gap-3 border-b border-[var(--hairline-light)] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label-caps">Demo shortcut</div>
                <p className="mt-1 text-sm text-ink">Skip to advanced practice</p>
                <p className="mt-1 text-xs text-muted">
                  Marks{" "}
                  {DEMO_ADVANCED_PREREQS.map((id) => MODULE_MAP[id]?.title)
                    .filter(Boolean)
                    .join(" → ")}{" "}
                  complete so Multi-State unlocks.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary shrink-0 text-sm"
                onClick={() => skipToAdvanced()}
              >
                Skip (demo)
              </button>
            </div>
          )}

          {nextModule && (
            <Link
              href={`/lesson/${nextModule.id}`}
              className="mt-5 flex items-center justify-between gap-4 border-b border-[var(--hairline-light)] pb-5"
            >
              <div>
                <div className="label-caps">Continue</div>
                <div className="mt-1 font-serif-brand text-xl text-ink">{nextModule.title}</div>
                <div className="text-sm text-muted">{nextModule.subtitle}</div>
              </div>
              <span className="btn-primary shrink-0 text-sm">Continue</span>
            </Link>
          )}

          <section className="mt-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-serif-brand text-lg text-ink">Modules</h2>
              <p className="text-xs text-muted">Lessons unlock in order · drills available anytime</p>
            </div>
            <ul className="divide-y divide-[var(--hairline-light)] border-y border-[var(--hairline-light)]">
              {MODULES.map((m) => {
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
                  <li key={m.id} className="py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="label-caps">
                          Module {m.order}
                          {done ? " · Done" : unlocked ? " · Open" : " · Locked"}
                        </div>
                        <h3 className="mt-0.5 font-serif-brand text-lg text-ink">{m.title}</h3>
                        <p className="text-sm text-muted">{m.subtitle}</p>
                        <p className="mt-1 text-xs text-muted">
                          {itemCount} items
                          {exList.length
                            ? ` · ${exList.length} drill${exList.length > 1 ? "s" : ""}`
                            : ""}
                          {exList.length && exDone ? " · cleared" : ""}
                        </p>
                        {req && <p className="mt-1 text-xs text-muted">{req}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {unlocked ? (
                          <Link href={`/lesson/${m.id}`} className="btn-primary text-sm">
                            {done ? "Review" : "Learn"}
                          </Link>
                        ) : (
                          <span className="btn-ghost cursor-not-allowed text-sm opacity-60" title={req || "Locked"}>
                            Locked
                          </span>
                        )}
                        {exList.map((ex) => (
                          <Link
                            key={ex.id}
                            href={`/exercise/${ex.id}`}
                            className="btn-secondary text-sm"
                            title={
                              unlocked
                                ? ex.title
                                : "Practice drill — available while lessons stay locked"
                            }
                          >
                            {profile.completedExercises.includes(ex.id) ? "Redo · " : ""}
                            {ex.title.length > 28 ? ex.title.slice(0, 26) + "…" : ex.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="mt-8">
            <Disclaimer />
          </div>
        </div>
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
