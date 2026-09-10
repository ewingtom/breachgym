"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/adaptive", label: "Adaptive" },
  { href: "/progress", label: "Progress" },
  { href: "/badges", label: "Badges" },
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
    <nav className="topbar-aubergine sticky top-0 z-40">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="font-serif-brand text-lg tracking-tight text-ivory"
        >
          BreachGym
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          {links.map((l) => {
            const href = normalizePath(l.href);
            const active = path === href || path.startsWith(href + "/");
            const isAdaptive = l.href === "/adaptive";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2 py-1 text-sm transition ${
                  active
                    ? isAdaptive
                      ? "text-copper"
                      : "text-ivory"
                    : "text-muted hover:text-ivory/80"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
