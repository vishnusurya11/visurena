# Visurena

A cinematic creative-studio platform — **Stories, Movies, Music, Games** — with a dark,
jewel-toned editorial design and a subtle animated nebula-gas background. Built React-first
in a monorepo so a future mobile app can reuse the design language and logic.

> 📐 **Design & architecture:** see [ARCHITECTURE.md](ARCHITECTURE.md) (the living source of
> truth) and the build plans in [docs/superpowers/plans/](docs/superpowers/plans/).
> The per-phase task tracker is [docs/superpowers/plans/TASKS.md](docs/superpowers/plans/TASKS.md).

## 🧱 Monorepo layout (pnpm + Turborepo)

```
visurena/
├─ apps/
│  └─ web/              # Next.js site (Pages Router, static export)
├─ packages/
│  ├─ design-tokens/    # jewel palette, section accents, motion, Tailwind preset
│  ├─ ui/               # shared React components (nebula, theme, chrome, cards)
│  ├─ core/             # content types + content selectors (framework-agnostic)
│  └─ config/           # shared tsconfig base
├─ content-local/       # local JSON content for dev (real content lives in S3 later)
├─ infrastructure/      # AWS deploy (S3 + CloudFront)
└─ docs/                # guides, architecture plans
```

## 🚀 Quick Start

**Prerequisites:** Node 18+ and pnpm (via Corepack).

```bash
# one-time: enable pnpm
corepack enable && corepack prepare pnpm@9 --activate

# from the repo root
pnpm install

# run the web app
pnpm --filter @visurena/web dev
# → open http://localhost:3000
```

Stop the dev server with `Ctrl-C`. If you see stale errors after big changes,
delete the cache and restart: `rm -rf apps/web/.next && pnpm --filter @visurena/web dev`.

## 🧪 Tests

```bash
# all packages
pnpm test

# a single package
pnpm --filter @visurena/ui test
pnpm --filter @visurena/web test
```

## 📦 Build (static export)

```bash
pnpm --filter @visurena/web build
# static site is emitted to apps/web/out/
```

## 🎨 The design system

- **Palette (jewel):** amber = Stories, emerald = Movies, ruby = Music, amethyst = Games, on near-black.
- **Background:** one persistent CSS/SVG **nebula-gas** layer (`@visurena/ui` `NebulaBackground`),
  section-tinted via `ThemeProvider`, honoring `prefers-reduced-motion`.
- **Type:** Fraunces (display) · Spectral (body) · JetBrains Mono (labels).
- Tokens live in `@visurena/design-tokens` and are consumed by Tailwind via a shared preset.

## 🚀 Deployment

Static export → **AWS S3 + CloudFront**. See [infrastructure/](infrastructure/) and the
deploy scripts. Deployment of the redesign is wired up as the redesign branches merge.

## 📋 Status

Redesign in progress on branch `redesign/foundation`:
- ✅ **Phase 0** — monorepo foundation (pnpm + Turborepo, shared packages, test tooling)
- ✅ **Phase 1** — homepage rebuilt in "The Studio" jewel design + nebula background; section pages rethemed
- ⏭️ Next: Phase 1b (section/detail pages + story reader), then content infra (S3 + DynamoDB), auth (Cognito), engagement, search — see [ARCHITECTURE.md](ARCHITECTURE.md) §3.
