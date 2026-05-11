# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code **in this repository specifically**. It deliberately does NOT duplicate the vision, architecture, or roadmap — those live in dedicated documents that other repos in the ecosystem also reference:

- **[BRD.md](BRD.md)** — product vision, scope, phases, success metrics, monetization, data ethics. **Read this first** to understand what ViSuReNa is.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — engineering architecture organized by phase: topology diagrams, contracts, IaC patterns, sequence diagrams, runbooks. **Read this when building or integrating.**
- **Brand:** Aurora Indigo direction locked on 2026-05-09 (nav re-locked v1.2 with medium-noun labels + VR World room). Reference mockups in `apps/web/public/mockups-dark/06-aurora-indigo*.html`. Product-side palette + typography in [BRD.md Appendix D](BRD.md#appendix-d--brand-visual-identity-aurora-indigo-locked-v1). Engineering tokens in [ARCHITECTURE.md § Brand & visual system](ARCHITECTURE.md#brand--visual-system).

If anything in this file conflicts with BRD.md or ARCHITECTURE.md, those documents win — update them, then update this file.

---

## Operational rules

### AWS access

The default AWS CLI profile on this machine is an admin user on account `597088058256`. **Only run read-only AWS CLI commands** (`aws ... describe-*`, `list-*`, `get-*`, `aws ce ...`, `aws s3 ls`, `aws cloudwatch get-metric-*`, etc.).

Anything that creates, modifies, or deletes resources — `aws ec2 stop-instances`, `terminate-instances`, `release-address`, `delete-*`, `create-*`, `put-*`, `update-*`, `s3 rm`, `s3 sync` (writes), `cloudfront create-invalidation`, IAM changes, etc. — **must be confirmed with the user before running**, even when in auto mode. Quote the exact command and the resource ARN/ID it will affect, then wait for explicit approval.

### File organization

**Do not create extra files unless necessary.** This repo has three canonical docs at root: `BRD.md`, `ARCHITECTURE.md`, `CLAUDE.md`. Plus `README.md` as the entry pointer. New planning docs, summary docs, "notes to future self" docs — go INSIDE one of the existing files (in the section that fits), not as new files. When in doubt, edit existing files.

---

## Repo layout (current state)

This is the **platform repo** in the four-repo ViSuReNa ecosystem (see [BRD § 7](BRD.md#7-system-architecture--the-four-repo-system) for the full picture). The Next.js app lives in `apps/web/` — **all `npm` commands must be run from that directory**, not the repo root.

```
visurena/
├── BRD.md                       ← product source of truth
├── ARCHITECTURE.md              ← engineering source of truth
├── CLAUDE.md                    ← this file (in-repo Claude guidance)
├── README.md                    ← short pointer
├── schemas/                     ← cross-repo content contracts (placeholder; populated in Phase 1)
├── apps/
│   └── web/                     ← the Next.js app (renamed from apps/web/ on 2026-05-09)
├── infrastructure/              ← CloudFormation for current S3+CloudFront setup
├── docs/                        ← content-author guides (blog, content schema, DNS)
├── deploy-preview.sh            ← manual deploy helpers
├── quick-deploy.sh
└── .github/workflows/deploy.yaml
```

**Future additions** (Phase 1+, see [ARCHITECTURE § 3](ARCHITECTURE.md#3-phase-1-architecture--recommendation-engine-live)): `schemas/` gets populated with versioned JSON Schemas; `infrastructure/` extends to host IaC for the entire ecosystem (not just the current site); new sibling apps (`apps/ios/`, `apps/android/`, `apps/tv/`, `apps/vr/`) appear in later phases.

---

## Common commands

Run from `apps/web/`:

```bash
npm run dev          # http://localhost:3000
npm run build        # static export to apps/web/out/ (next.config.js has output: 'export')
npm run lint         # next lint
npx tsc --noEmit     # type-check (no dedicated script defined in package.json)
```

Test a production build locally:

```bash
npm run build && npx serve@latest out
```

There is no test suite. The README mentions `npm run type-check` but no such script exists in `package.json` — use `npx tsc --noEmit`.

---

## Architecture: things that aren't obvious from one file

### Static-export only, no SSR
`next.config.js` sets `output: 'export'`, `trailingSlash: true`, and `images.unoptimized: true`. Anything that depends on server runtime (API routes, ISR, `next/image` optimizer, middleware) will not work. All data must be resolvable at build time via `getStaticProps`/`getStaticPaths`.

### Two parallel content sources (transitional)
Today the platform compiles content from two file-based sources at build time:

1. **`apps/web/content-config.json`** — hand-edited JSON; drives the cards on home, `/movies`, `/music`, `/games`, `/story`. Top-level keys: `featured`, `movies`, `music`, `games`, `stories`. YouTube thumbnails referenced directly by video ID.
2. **`apps/web/posts/*.{md,html}`** — blog posts, read at build time by `lib/blog.js` (`getAllPosts`, `getPostBySlug`). Files starting with `_` (e.g. `_template.md`) are skipped. Markdown uses gray-matter front matter; HTML uses `<meta name="title|description|date|image|tags">` tags. Both formats coexist; loader normalizes them into the same shape.

**This is transitional.** In Phase 1 (per ARCHITECTURE.md § 3) both sources migrate to the manifest pattern: `apps/web/lib/content.ts` fetches `https://content.visurena.com/manifest.json` and the per-item content JSONs at build time. Existing file-based readers can coexist with the manifest reader during the cutover.

### Blog rendering pipeline
- `pages/blog/[slug].tsx` is statically generated from `getAllPosts()`.
- Markdown rendered via `marked` with `breaks: true, gfm: true`.
- HTML posts have their `<body>` content injected directly — style with inline CSS.
- **Image comparison sliders** are a hydration trick: authors write `<div class="image-comparison" data-before=… data-after=… data-before-label=… data-after-label=…>` in markdown/HTML, and a `useEffect` in `[slug].tsx` finds those divs after render, mounts a separate React root into each, and renders `components/ImageComparisonSlider`. There is no MDX pipeline.

### Games
Each retro game is its own Pages Router page in `pages/games/*.tsx` that imports a self-contained component from `components/games/*.tsx`. Uses Framer Motion + `components/ResponsiveGameWrapper` + `TouchControls` for mobile. No shared game engine — each component owns its loop and state.

### Theming (Aurora Indigo, locked v1.3)

Brand locked on 2026-05-09. Canonical sources:
- **Product narrative + visual identity:** [BRD.md Appendix D](BRD.md#appendix-d--brand-visual-identity-aurora-indigo-locked-v1)
- **Engineering tokens + per-room override pattern:** [ARCHITECTURE.md § Brand & visual system](ARCHITECTURE.md#brand--visual-system)
- **Reference mockups:** `apps/web/public/mockups-dark/06-aurora-indigo*.html` (home + 6 section pages)

Daily-work quick reference (when editing components or building new surfaces):

**Parent palette (every page):**
- `bg #0A0E2A` · `surface-1 #131A3D` · `surface-2 #1D2552` · `hairline #2A3268`
- `text-high #F0F2FF` · `text-mid #9DA8D9` · `text-muted #5C66A0`
- `accent-parent #6B7DFF` — THE VERB (Search button, links, focus rings — stays the same in every room)

**Per-section accents (the aurora):**
- Home (master room) → `#6B7DFF` (parent indigo) — recommendation/intake hero lives here
- Movies → `#F472B6` (aurora pink) — films, shorts, scenes (Phase 4b/c)
- Music → `#F4C04E` (warm gold) — tracks, EPs, originals (Phase 4a)
- Games → `#B5E853` (electric lime) — browser games (only complete catalog at Phase 0)
- Story → `#2DD4BF` (soft cyan) — chapters, novels, serialized fiction (Phase 3)
- VR World → `#A78BFA` (electric lavender) — immersive (Phase 4d, ~2028)
- Blog → `#C0C8E0` (cool platinum) — build log, transparency, editorial essays (consolidated writing room)

Section accents only fill: section eyebrow, active-nav indicator on that page, ambient hero radial spot, content-card category label, card hover border, section-specific CTA pill. NEVER as a global verb.

**Typography (locked):** Inter 300/400/500/600/700 (display + body) · DM Serif Display italic 400 (sparingly, for hero pull-words + 1-2 pull-quotes per page) · JetBrains Mono 400/500 (all metadata, hex codes, build info).

**Locked nav order (v1.3):** `Home · Movies · Music · Games · Story · VR World · Blog`. Medium-noun labels replace the previous action-verb labels (Watch/Read/Play/Listen). "Home" replaces the Search + For You combo — recommendation lives ON Home as the hero, no separate Search tab. "Blog" is the consolidated writing room (we considered Studio and Journal; Blog reads clearest and aligns with the existing `/blog` route on the live site). "VR World" added per BRD §14 Phase 4d.

**Migration status (Phase 0 cutover, in progress):** the current `apps/web/tailwind.config.js` still uses the old per-section color sprawl (`theme.movies`, `theme.music`, `theme.games`, `theme.story`, `theme.blog`, `theme.vr`, `theme.comfy.*`) and `Layout.tsx` consumes a `pageTheme` prop. These are being replaced by the locked v1.2 semantic tokens + the `data-room` attribute pattern documented in ARCHITECTURE.md § Brand & visual system. Old `pageTheme` values map to new `data-room` values as: `movies`/`music`/`games`/`story`→same, `blog`/`research`→`blog`, `vr`→`vrworld`. Until cutover lands: don't add new entries to the legacy theme objects; new components should consume the locked tokens.

**What to avoid (rules carried from BRD Appendix D §D.7):**
- Flooding the page with a gradient mesh — the controlled aurora is hero-only, single moment.
- Adding an 8th accent. The system has seven rooms (Home + 6 sub-rooms = 7 distinct accents).
- Using a section accent as a global verb (e.g., a pink Search button — wrong; Search is always parent indigo).
- Replacing Inter/DM Serif/JetBrains Mono with Space Grotesk, Geist, or other default-trendy fonts.
- Generic SaaS-landing tropes: logo cloud, testimonial blocks, feature-cards-with-icon grids.

---

## Deployment

Push to `master` or `main` runs `.github/workflows/deploy.yaml`: builds in `apps/web/`, syncs `out/` to S3 (HTML with `max-age=0`, everything else `immutable`), invalidates CloudFront. Required GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

`quick-deploy.sh` and `deploy-preview.sh` at repo root are manual alternatives that require local AWS credentials.

In Phase 1 (per [ARCHITECTURE § 13](ARCHITECTURE.md#3-phase-1-architecture--recommendation-engine-live)) a new workflow `.github/workflows/content-update.yaml` will be added to receive `repository_dispatch[content-published]` events from content-engine repos.

---

## Content authoring quick refs

- New blog post: add `posts/<slug>.md` (front matter required: `title`, `date`, `description`, `image`, `tags`) or `posts/<slug>.html` with the meta tags. Images live in `public/images/` and are referenced as `/images/...`.
- New movie/music/game/story card: edit `content-config.json` — match the existing object shape for that section.
- See `docs/blog-guide.md`, `docs/blog-templates.md`, and `docs/content-management.md` for full schemas.
