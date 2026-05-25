# Visurena — Per-Phase Task Tracker

> Master checklist for subagent-driven execution. Each task is checked off as a subagent
> completes it (with review between tasks). Detailed, step-by-step instructions live in the
> per-phase plan files; this file is the high-level map + status.
>
> - Design source of truth: [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) (§3 build order)
> - Phase 0 + 1 detailed plan: [`2026-05-23-foundation-and-redesign.md`](./2026-05-23-foundation-and-redesign.md)

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · 📄 = has a detailed plan · 📝 = plan still to be written

**Current focus:** 🎯 Phase 1b detail pages (story reader + movie/music detail). Section pages done ✅.

---

## Phase 0 — Foundation 📄  (no backend; prerequisite for everything)
Detailed plan: `2026-05-23-foundation-and-redesign.md` (Tasks 1–6)

- [x] 0.1 Safety branch + verify current build is green
- [x] 0.2 pnpm workspace + Turborepo scaffolding at repo root
- [x] 0.3 Move `visurena-next` → `apps/web`; switch to pnpm
- [x] 0.4 Shared config package (`@visurena/config` tsconfig base)
- [x] 0.5 Test tooling (Vitest + React Testing Library) in `apps/web`
- [x] 0.6 Scaffold empty packages: `design-tokens`, `core`, `ui`

## Phase 1 — Redesign + nebula: homepage 📄  (no backend)
Detailed plan: `2026-05-23-foundation-and-redesign.md` (Tasks 7–17)

- [x] 1.1 Jewel design tokens (palette, section accents, motion)
- [x] 1.2 Tailwind preset + jewel fonts wired into `apps/web`
- [x] 1.3 Content types + local content loader/selectors (`core`)
- [x] 1.4 Seed local content (`content-local/stories.json`) + web adapter
- [x] 1.5 `ThemeProvider` (section/item accent resolution)
- [x] 1.6 `NebulaBackground` (CSS/SVG, reduced-motion aware)
- [x] 1.7 App shell wiring (persistent nebula + theme in `_app`)
- [x] 1.8 Chrome: `TopStatusBar`, `Header` nav, `Footer`
- [x] 1.9 Content components: `Hero`, `ContentCard`, `CardRow`, `NewsletterCTA`
- [x] 1.10 Assemble the homepage in The Studio design
- [x] 1.11 Build + responsive + reduced-motion QA; update change log

## Phase 1b — Section + detail pages 📝  (no backend)
Plan to be written: `2026-05-23-redesign-section-detail-pages.md`

- [x] 1b.1 Stories section page (latest + trending + genre shelves)
- [x] 1b.2 Movies / Music section pages (full "The Studio" pages; Games already has playable content)
- [~] 1b.3 Research section page done; article page (`research/[slug]`) still to do
- [~] 1b.4 Story detail page (`stories/[slug]`) live — hero with per-story tint bleed, chapter index, reader's notes, related; dedicated in-page reader (typography controls) still to do
- [ ] 1b.5 Movie / Music / Game detail pages
- [~] 1b.6 Studio motion/atom components shipped in `@visurena/ui` (`VRRowHeader`, `VRPoster`, `VRTilt`, `VRFade`, `VRSplitText`, `VRCounter`, `VRMarquee`, `VRShaderBg`, `VRCursorDot`, `VRScrollProgress`, `VRMagnetic`, `VRStripe`); dedicated `Reader` still to do

## Phase 2 — Content infrastructure on AWS 📝  (backend)
Plan to be written: `phase-2-content-infra.md`

- [ ] 2.1 CDK: private S3 content bucket + CloudFront (OAC)
- [ ] 2.2 CDK: DynamoDB `Content` + `Relations` tables (+ GSIs)
- [ ] 2.3 `item.json` schema + validation in `core`
- [ ] 2.4 `content-sync` Lambda (S3 event → upsert Content + Relations)
- [ ] 2.5 Public index JSON snapshot generation + web reads it (local fallback)
- [ ] 2.6 `scheduler` Lambda + EventBridge (flip works **and** chapters on `publishAt`)
- [ ] 2.7 Migrate sample content to real S3 folders; verify scheduled publish

## Phase 3 — Accounts & login 📝  (backend)
Plan to be written: `phase-3-auth.md`

- [ ] 3.1 CDK: Cognito user pool + app client + hosted domain
- [ ] 3.2 Social IdPs: Google, Apple, Facebook + email/password
- [ ] 3.3 Custom jewel-themed sign-in/up screens (Amplify Auth)
- [ ] 3.4 `Users` table + Cognito post-confirmation trigger (create profile)
- [ ] 3.5 API Gateway + Cognito JWT authorizer
- [ ] 3.6 Web auth state (sign in/out, session, protected actions)

## Phase 4 — Engagement + analytics 📝  (backend)
Plan to be written: `phase-4-engagement.md`

- [ ] 4.1 CDK: DynamoDB `Likes` (+ counter), `Progress`, `Comments`, `Follows`
- [ ] 4.2 Lambda API handlers + routes (like, progress, comment, follow, me)
- [ ] 4.3 Web: like button, continue-reading, comments/ratings, follow UI
- [ ] 4.4 SES notify Lambda on release → followers (Monday newsletter)
- [ ] 4.5 Events: Firehose → S3; emit interactions (incl. anonymous) + consent banner
- [ ] 4.6 Athena tables for content analytics (groundwork)

## Phase 5 — Search 📝
Plan to be written: `phase-5-search.md`

- [ ] 5.1 Generate search-index JSON from `Content`
- [ ] 5.2 Client-side Fuse.js search UI
- [ ] 5.3 (Later) Algolia / OpenSearch Serverless for full-body, ranked search

## Phase 6 — Later 📝
- [ ] 6.1 Expo mobile app (reuses `design-tokens` + `core`)
- [ ] 6.2 Analytics dashboards (QuickSight)
- [ ] 6.3 Optional WebGL nebula upgrade

---

## Progress log
| Date | Phase | Note |
|---|---|---|
| 2026-05-23 | — | Tracker created. Phase 0 + 1 detailed plan ready. Starting execution. |
| 2026-05-23 | 0 | Foundation complete: pnpm+turbo monorepo, app moved to apps/web, config + test tooling + empty packages. Build green, pushed. |
| 2026-05-23 | 1 | Homepage redesign complete: jewel tokens, nebula background, theme immersion plumbing, chrome + cards, homepage from content layer. 16 tests green, build green. |
| 2026-05-23 | 1b | "The Studio" port: full homepage + Stories/Movies/Music/Research section pages from `visurenawebtemp`. 12 studio motion components added to `@visurena/ui`. Added `next` peer dep to `ui` (fixes `next/link` resolution); jsdom IntersectionObserver stub. Static export of 26 pages green, all tests green. |
