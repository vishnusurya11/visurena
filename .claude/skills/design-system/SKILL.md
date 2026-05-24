---
name: design-system
description: >-
  Build and maintain Visurena's cross-platform design system: a single source of
  truth in design tokens compiled to BOTH web (Next.js + Tailwind v4 + shadcn/ui)
  AND mobile (React Native + Expo + NativeWind). Use whenever you set up or change
  design tokens, theming, dark mode, a color system, a modular type/spacing/radius/
  elevation/motion scale, multi-brand or multi-vertical theming (per-vertical
  accents), a component library shared across web+mobile, Tailwind v4 @theme inline,
  shadcn theming, NativeWind / React Native Reusables tokens, OKLCH colors, or Style
  Dictionary token compilation. Trigger on phrases like "design tokens", "set up a
  design system", "theme the app", "dark mode colors", "brand accents per vertical",
  "share styles between web and the mobile app", "token pipeline". DEFER one-off
  component styling to ui-styling, and the nuts-and-bolts of Tailwind v4 + shadcn
  dark-mode wiring to tailwind-theme-builder; this skill owns the SYSTEM (tokens,
  tiers, cross-platform pipeline), not individual screens.
---

# Visurena Design System

Builds the **single source of truth** for how Visurena looks and feels — across the
website and the mobile app — and keeps it consistent. The output is a token pipeline,
not a pile of one-off styles.

**North star:** Visurena is an AI-powered entertainment hub (movies / music / games /
stories / tournaments). House style = **charcoal premium dark, slightly animated,
dynamic + optimized, award-winning.** Default to that. The deep web-craft standard
lives at `../modern-web-design/references/award-winning-playbook.md` — read it when
the work is "make this feel world-class," not just "wire the tokens."

## The one rule that prevents chaos

**Design once as tokens; let web and mobile consume the same tokens.** Never hand-pick
a hex in a component, never fork a component per platform or per vertical. If you find
yourself typing a color/size/duration literal in a component, stop — it belongs in a
token. This is WHY the system exists: change a token once, both platforms update, every
theme and vertical stays in sync, and contrast guarantees hold everywhere.

## Core workflow

Follow in order. Don't skip tiers; don't skip platforms.

1. **Establish the token tiers** (see `references/tokens.md`).
   - **Primitive** → named by look (`charcoal-900`, `amber-500`, `space-4`). The raw palette.
   - **Semantic** → named by intent (`color-bg-base`, `color-text-primary`, `color-accent`).
     Aliases a primitive. This is the layer components and themes actually touch.
   - **Component** → named by part (`button-primary-bg`). Aliases **semantic only**.
   - WHY: themes (dark, per-vertical) swap what semantic points at, without touching
     thousands of component references. Pointing a component straight at a primitive
     breaks theming — don't.

2. **Author tokens as DTCG/W3C JSON** with `$value` / `$type` / `$description`, aliases
   via `{group.token}`, colors in **OKLCH**. See `references/tokens.md`.

3. **Set the foundations as tokens** — spacing (8px base), modular type scale, radius,
   elevation (surface ramp + shadow), motion (durations/easings + reduced-motion),
   breakpoints, icon sizes. See `references/foundations.md`.

4. **Compile with Style Dictionary v4** → web `css/variables` (with
   `outputReferences: true` so runtime `var()` theming works) + native
   `javascript/es6` & `typescript/es6-declarations`. See `references/tokens.md`.

5. **Wire theming.** Light/dark via `.dark` class + Tailwind v4 `@theme inline`; adopt
   shadcn `background`/`foreground` + `accent` semantic pairs; per-vertical accent swap
   via `[data-vertical="..."]` (web) / `vars()` (mobile). Keep semantic names fixed —
   only swap the primitive the accent points to. See `references/theming.md`.

6. **Wire the platforms in parallel.** shadcn/ui on web, React Native Reusables on
   mobile, both fed by the same tokens, with **identical component names / variants /
   props**. See `references/cross-platform.md`.

7. **Bake in accessibility.** Every surface/foreground pair ≥ 4.5:1 (≥ 3:1 for large
   text & UI) in **all** themes and verticals; focus ring ≥ 3:1; touch targets ≥ 44px;
   `color-scheme` set. Don't eyeball contrast — verify it. See `references/foundations.md`.

## Routing table

| You're working on… | Read |
|---|---|
| Token format, tiers, naming, OKLCH, Style Dictionary config | `references/tokens.md` |
| Light/dark, shadcn pairs, per-vertical accents | `references/theming.md` |
| Spacing, type, radius, elevation, motion, breakpoints, icons | `references/foundations.md` |
| Monorepo layout, web+mobile pipeline, library choice | `references/cross-platform.md` |
| Make a specific screen feel award-winning | `../modern-web-design/references/award-winning-playbook.md` |

## When to hand off (don't duplicate these skills)

- **One-off component styling / building a single shadcn component** → `ui-styling`.
- **Tailwind v4 + shadcn dark-mode wiring details, install, troubleshooting** →
  `tailwind-theme-builder`. (This skill decides the token *system*; that skill wires
  the Tailwind/shadcn plumbing.)
- **Picking palettes, font pairings, style direction** → `ui-ux-pro-max`.
- **Aesthetic standard & the playbook** → `frontend-design`, `modern-web-design`.
- **Implementing motion** → `motion-framer`, `gsap-scrolltrigger`. (This skill defines
  motion *tokens*; those skills animate with them.)

## Do / Don't

- **Do** name semantic tokens for WHY (`color-text-muted`), not hue (`color-gray-400`).
  WHY: the name survives a palette change; the hue won't.
- **Don't** put a raw value in a component or a second source of truth (a `colors.ts`
  next to the tokens). One source, always.
- **Do** keep one disciplined accent per surface; build elevation from lighter surfaces
  + subtle shadow, not from louder colors.
- **Don't** use pure black (`#000`). Charcoal premium dark = background OKLCH ~0.16,
  elevated card ~0.20, near-white text ~0.96.
- **Do** ship a token change to both platforms in the same pass and re-verify contrast.
- **Don't** fork components per vertical — swap the accent primitive instead.
