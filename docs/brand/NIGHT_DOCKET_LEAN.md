# Night Docket (lean) — implemented

Status: **locked and shipped** in the BreachGym UI (Sep 2026).

Direction D from `BRAND_DIRECTIONS.md`, stripped to the quiet desk / quiet lesson grammar (mockups D2 + D4).

## Tokens

| Role | Value |
|------|-------|
| Aubergine canvas | `#120C14` / `#160F1A` |
| Limestone panels | `#F2EDE5` |
| Ivory | `#F7F4EE` |
| Copper (rare) | `#B87333` |
| Ink on limestone | `#1A1518` |
| Muted | `#8A8279` |
| Hairlines | `rgba(26,21,24,0.12)` light · `rgba(247,244,238,0.12)` dark |

## Grammar

1. **Quiet, not busy** — no loud gradients, confetti, XP flames, glassmorphism, or dense gauge grids.
2. **Landing** — aubergine full bleed; serif wordmark; one copper CTA; tiny disclaimer.
3. **Dashboard** — aubergine shell + one limestone content panel; modules as hairline rows; Adaptive as a copper text link.
4. **Lesson / Adaptive / Exercise** — limestone page; thin aubergine top bar; hairline choices; copper on selection + Continue only.
5. **Progress / Badges** — typography lists; copper “Train weak spots”; badges as quiet rows, not sticker walls.
6. **Type** — serif for brand + major titles (`ui-serif` / Iowan / Source Serif / Georgia); sans for UI; tight tracking on small-caps labels.
7. **Nav** — muted links; Adaptive active state in copper.

CSS variables and component utilities live in `src/app/globals.css`. Tailwind brand colors are in `tailwind.config.ts`.
