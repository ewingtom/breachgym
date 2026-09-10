"use client";

import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Disclaimer } from "@/components/Disclaimer";
import { ProfileGate, useProfile } from "@/hooks/useProfile";
import { BADGES } from "@/data/badges";

function BadgesContent() {
  const { profile } = useProfile();
  if (!profile) return null;

  const unlocked = new Set(profile.badges);

  return (
    <div className="page-limestone pb-16">
      <Nav />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <header>
          <h1 className="font-serif-brand text-3xl text-ink">Badges</h1>
          <p className="mt-2 text-sm text-muted">
            {profile.badges.length} / {BADGES.length} unlocked
          </p>
        </header>
        <ul className="divide-y divide-[var(--hairline-light)] border-y border-[var(--hairline-light)]">
          {BADGES.map((b) => {
            const on = unlocked.has(b.id);
            return (
              <li key={b.id} className={`py-4 ${on ? "" : "opacity-50"}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h2 className="font-serif-brand text-lg text-ink">{b.name}</h2>
                    <p className="mt-0.5 text-sm text-muted">{b.description}</p>
                  </div>
                  <span className="label-caps shrink-0">{on ? "Unlocked" : "Locked"}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-4">
          <Link href="/adaptive" className="link-copper text-sm">
            Train weak spots →
          </Link>
          <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
            Dashboard
          </Link>
        </div>
        <Disclaimer />
      </main>
    </div>
  );
}

export default function BadgesPage() {
  return (
    <ProfileGate>
      <BadgesContent />
    </ProfileGate>
  );
}
