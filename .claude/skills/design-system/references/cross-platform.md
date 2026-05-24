# Cross-platform — architecture, monorepo, the pipeline

How one token source drives both the Next.js website and the Expo mobile app, and which
component strategy to pick.

## Contents
- [The architecture decision](#the-architecture-decision)
- [When to use Tamagui instead](#when-to-use-tamagui-instead)
- [Monorepo layout](#monorepo-layout)
- [The step-by-step pipeline](#the-step-by-step-pipeline)
- [Keeping components in lockstep](#keeping-components-in-lockstep)
- [Do / Don't](#do--dont)
- [Sources](#sources)

## The architecture decision

**Recommended: token-aligned parallel component libraries.**

- **Web** → **shadcn/ui** (Radix + Tailwind v4). You own the component source.
- **Mobile** → **React Native Reusables** ("shadcn for React Native", built on NativeWind
  + RN primitives). Same philosophy, same naming.
- **Both** consume **one** token source (`packages/tokens`).

WHY this over a single universal codebase: each platform gets idiomatic, best-in-class
components and native performance, while the **token layer** — the thing that actually
determines whether the brand looks consistent — stays unified. You accept two thin
component layers in exchange for zero compromise on platform feel. For a charcoal-premium,
award-winning bar, that's the right trade: the look is carried by tokens, not by sharing
a `<Button>` implementation.

The cost is real: you maintain two component trees. Mitigate it by keeping names,
variants, props, and Tailwind class names **identical** across platforms (see below) so
the two trees stay mentally "the same component."

## When to use Tamagui instead

**Tamagui** is the universal alternative: one component + styling system that renders to
both web and native from a single codebase, with a compiler for performance and its own
token/theme system.

Choose Tamagui when:
- A small team must ship near-identical UI to web + native with **minimum duplication**,
  and is willing to standardize entirely on Tamagui's component + theme model.
- You want truly write-once components and can live without shadcn/ui's ecosystem.

Stay with the parallel approach (default) when:
- You want shadcn/ui on web specifically (its ecosystem, copy-paste ownership, the
  award-winning web playbook leans on it), and idiomatic RN on mobile.
- The team already knows Tailwind/shadcn and wants the lowest learning curve.

Either way, **tokens stay the source of truth** — Tamagui's theme can be fed from the
same DTCG tokens. The decision is about *components*, not about *tokens*.

## Monorepo layout

pnpm workspaces + Turborepo. `packages/tokens` builds first; both apps depend on its
output.

```
visurena/
├─ pnpm-workspace.yaml
├─ turbo.json
├─ packages/
│  └─ tokens/
│     ├─ tokens/                     # DTCG JSON source (color, spacing, motion, …)
│     │  ├─ color.json
│     │  ├─ spacing.json
│     │  ├─ typography.json
│     │  ├─ radius.json
│     │  ├─ elevation.json
│     │  └─ motion.json
│     ├─ style-dictionary.config.js
│     ├─ package.json                # name: "@visurena/tokens", build script
│     └─ build/                      # generated — do not edit
│        ├─ web/tokens.css           # css/variables, outputReferences:true
│        └─ native/tokens.ts (+ .d.ts)
└─ apps/
   ├─ web/                           # Next.js + Tailwind v4 + shadcn/ui
   │  ├─ app/globals.css             # @import tokens.css; :root/.dark; @theme inline
   │  └─ deps: next-themes, lucide-react
   └─ mobile/                        # Expo + React Native
      ├─ lib/theme.ts                # vars() per mode from tokens.ts
      └─ deps: nativewind, react-native-reusables, lucide-react-native
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```
```jsonc
// turbo.json (excerpt) — apps build after tokens
{ "tasks": { "build": { "dependsOn": ["^build"] } } }
```

## The step-by-step pipeline

1. **Author tokens** in `packages/tokens/tokens/**/*.json` (DTCG, OKLCH colors,
   primitive→semantic→component). See `tokens.md`.
2. **Build tokens**: `pnpm --filter @visurena/tokens build` → `build/web/tokens.css`
   (with `outputReferences: true`) + `build/native/tokens.ts`. See `tokens.md`.
3. **Web wiring**: `@import "@visurena/tokens/build/web/tokens.css"` in `globals.css`,
   map primitives → shadcn semantic pairs in `:root`/`.dark`, expose via `@theme inline`,
   add `[data-vertical]` accent overrides. See `theming.md`. Install shadcn/ui +
   next-themes — for that wiring/troubleshooting, defer to `tailwind-theme-builder`.
4. **Mobile wiring**: import `tokens.ts`, build `vars()` themes per mode, apply at root
   with `useColorScheme()`, wrap verticals to override `--accent`. Install React Native
   Reusables. See `theming.md`.
5. **Build components in parallel** with identical APIs (next section).
6. **Verify a11y** across the mode × vertical matrix. See `foundations.md`.
7. **Iterate** by editing tokens only; rebuild; both apps pick up changes. Commit JSON
   source; let CI rebuild `build/`.

## Keeping components in lockstep

The two component trees only stay coherent if you enforce sameness:

- **Same component names**: `Button`, `Card`, `Badge`, `Sheet` on both.
- **Same variants/props**: `variant="primary" | "secondary" | "ghost"`, `size="sm" | "md"
  | "lg"`. A web prop must exist on mobile and mean the same thing.
- **Same class names** where possible: `bg-accent text-accent-foreground rounded-lg` reads
  identically in shadcn and React Native Reusables (NativeWind).
- **Same token references** — both pull `--accent`, `--background`, `space-*`, never a
  literal.

WHY: when an engineer learns the `<Button>` on web, they already know it on mobile. The
duplication becomes mechanical, not cognitive.

```tsx
// web: apps/web/components/ui/button.tsx (shadcn)        — variants: primary|secondary|ghost
// mobile: apps/mobile/components/ui/button.tsx (RNR)     — SAME variant names + props
// both render: bg-primary text-primary-foreground rounded-button
```

## Do / Don't

- **Do** build `packages/tokens` before either app (Turborepo `^build` handles ordering).
- **Don't** duplicate the palette into an app — apps import token output, never redefine.
- **Do** mirror component names/variants/props exactly across platforms.
- **Don't** reach for Tamagui just to avoid two component files — only switch if you're
  committing to its full model; tokens stay the real unifier either way.
- **Do** re-run the token build + a11y check on every token change, before merging.

## Sources

- React Native Reusables — https://reactnativereusables.com/
- NativeWind themes — https://www.nativewind.dev/docs/guides/themes
- shadcn + Tailwind v4 — https://ui.shadcn.com/docs/tailwind-v4
- Style Dictionary — https://styledictionary.com/info/dtcg/
- Spotify Encore (cross-platform design system reference) — https://spotify.design/
