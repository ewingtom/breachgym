"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

export default function LandingPage() {
  const { profile, ready, startDemo } = useProfile();
  const router = useRouter();
  const [name, setName] = useState("Alex Associate");

  useEffect(() => {
    if (ready && profile) router.replace("/dashboard");
  }, [ready, profile, router]);

  if (!ready) {
    return (
      <main className="shell-aubergine flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted">Loading…</div>
      </main>
    );
  }

  return (
    <main className="shell-aubergine flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        <h1 className="font-serif-brand text-5xl tracking-tight text-ivory sm:text-6xl">
          BreachGym
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted text-balance">
          State breach-notice drills for associates — quiet, precise, adaptive.
        </p>

        <div className="mt-14 w-full space-y-4">
          <input
            className="w-full rounded-sm border border-[var(--hairline-dark)] bg-aubergine-raised px-4 py-3 text-center text-sm text-ivory outline-none placeholder:text-muted focus:border-copper/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            aria-label="Display name"
          />
          <button
            className="btn-copper-outline w-full"
            onClick={() => {
              startDemo(name.trim() || "Associate");
              router.push("/dashboard");
            }}
          >
            Continue as associate
          </button>
        </div>

        <p className="mt-16 max-w-xs text-[11px] leading-relaxed text-muted/80">
          Educational demo · progress stays in this browser · not legal advice.
        </p>
      </div>
    </main>
  );
}
