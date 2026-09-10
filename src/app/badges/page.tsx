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
    <div className="min-h-screen pb-16">
      <Nav />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <header>
          <h1 className="text-3xl font-black text-slate-900">Badges</h1>
          <p className="text-slate-500">
            {profile.badges.length} / {BADGES.length} unlocked · keep drilling to collect them all
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const on = unlocked.has(b.id);
            return (
              <div
                key={b.id}
                className={`card relative overflow-hidden ${
                  on ? "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50" : "opacity-70 grayscale"
                }`}
              >
                <div className="text-4xl">{on ? b.emoji : "🔒"}</div>
                <h2 className="mt-2 text-lg font-black text-slate-800">{b.name}</h2>
                <p className="text-sm text-slate-600">{b.description}</p>
                <div className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">
                  {on ? "Unlocked" : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/dashboard" className="btn-primary inline-flex">
          Back to gym
        </Link>
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
