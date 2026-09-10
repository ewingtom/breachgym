"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Disclaimer } from "@/components/Disclaimer";
import { useProfile } from "@/hooks/useProfile";
import { STATES } from "@/data/states";
import { MODULES } from "@/data/modules";

export default function LandingPage() {
  const { profile, ready, startDemo } = useProfile();
  const router = useRouter();
  const [name, setName] = useState("Alex Associate");

  useEffect(() => {
    if (ready && profile) router.replace("/dashboard");
  }, [ready, profile, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-black">Loading BreachGym…</div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-10">
      <header className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-4xl shadow-xl shadow-emerald-200 animate-wiggle">
          🛡️
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Breach<span className="text-emerald-500">Gym</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-600 text-balance">
          Bite-sized, Duolingo-bright drills for associates learning US state data breach
          notification laws — PI elements, risk-of-harm, encryption harbors, timelines, and
          multi-state matrices.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { e: "⚡", t: "Micro-lessons", d: "Flashcards, fill-in-the-blank, famous breach case files" },
          { e: "🧪", t: "Practical drills", d: "Client emails, PI matrices, lost laptops, insider snooping" },
          { e: "🏅", t: "XP & badges", d: "Streaks, mastery by state/topic, celebration unlocks" },
        ].map((x) => (
          <div key={x.t} className="card text-center">
            <div className="text-3xl">{x.e}</div>
            <div className="mt-2 font-black text-slate-800">{x.t}</div>
            <p className="mt-1 text-sm text-slate-500">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="card mx-auto w-full max-w-md space-y-4 text-center">
        <h2 className="text-xl font-black text-slate-800">Continue as associate</h2>
        <p className="text-sm text-slate-500">No real auth — progress saves in localStorage on this browser.</p>
        <input
          className="w-full rounded-2xl border-2 border-emerald-200 px-4 py-3 text-center font-bold outline-none focus:border-emerald-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
        />
        <button
          className="btn-primary w-full"
          onClick={() => {
            startDemo(name.trim() || "Associate");
            router.push("/dashboard");
          }}
        >
          Enter the gym →
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-black text-slate-800">States in this demo</h3>
          <p className="mt-2 text-sm text-slate-600">
            {STATES.map((s) => s.name).join(" · ")} ({STATES.length})
          </p>
        </div>
        <div className="card">
          <h3 className="font-black text-slate-800">Modules</h3>
          <p className="mt-2 text-sm text-slate-600">
            {MODULES.map((m) => m.title).join(" → ")}
          </p>
        </div>
      </section>

      <Disclaimer />
    </main>
  );
}
