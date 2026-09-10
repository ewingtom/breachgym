"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", emoji: "🏠" },
  { href: "/adaptive", label: "Adaptive", emoji: "🧠" },
  { href: "/progress", label: "Progress", emoji: "📊" },
  { href: "/badges", label: "Badges", emoji: "🏅" },
];

/** Normalize for trailingSlash / basePath-safe comparisons (usePathname omits basePath). */
function normalizePath(p: string) {
  if (!p) return "/";
  const trimmed = p.replace(/\/+$/, "");
  return trimmed || "/";
}

export function Nav() {
  const path = normalizePath(usePathname() || "/");
  return (
    <nav className="sticky top-0 z-40 border-b-2 border-emerald-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-black tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg shadow-md shadow-emerald-200">
            🛡️
          </span>
          <span className="text-lg text-slate-800">
            Breach<span className="text-emerald-600">Gym</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const href = normalizePath(l.href);
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
                  active
                    ? l.href === "/adaptive"
                      ? "bg-fuchsia-500 text-white shadow-md shadow-fuchsia-200"
                      : "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                <span className="mr-1 hidden sm:inline">{l.emoji}</span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
