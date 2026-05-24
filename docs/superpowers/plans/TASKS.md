# Visurena — Per-Phase Task Tracker

> Master checklist for subagent-driven execution. Each task is checked off as a subagent
> completes it (with review between tasks). Detailed, step-by-step instructions live in the
> per-phase plan files; this file is the high-level map + status.
>
> - Design source of truth: [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) (§3 build order)
> - Phase 0 + 1 detailed plan: [`2026-05-23-foundation-and-redesign.md`](./2026-05-23-foundation-and-redesign.md)

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · 📄 = has a detailed plan · 📝 = plan still to be written

**Current focus:** 🎯 Phase 1 (the redesigned homepage). Phase 0 foundation done ✅.

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

- [ ] 1.1 Jewel design tokens (palette, section accents, motion)
- [ ] 1.2 Tailwind preset + jewel fonts wired into `apps/web`
- [ ] 1.3 Content types + local content loader/selectors (`core`)
- [ ] 1.4 Seed local content (`content-local/stories.json`) + web adapter
- [ ] 1.5 `ThemeProvider` (section/item accent resolution)
- [ ] 1.6 `NebulaBackground` (CSS/SVG, reduced-motion aware)
- [ ] 1.7 App shell wiring (persistent nebula + theme in `_app`)
- [ ] 1.8 Chrome: `TopStatusBar`, `Header` nav, `Footer`
- [ ] 1.9 Content components: `Hero`, `ContentCard`, `CardRow`, `NewsletterCTA`
- [ ] 1.10 Assemble the homepage in The Studio design
- [ ] 1.11 Build + responsive + reduced-motion QA; update change log

## Phase 1b — Section + detail pages 📝  (no backend)
Plan to be written: `2026-05-23-redesign-section-detail-pages.md`

- [ ] 1b.1 Stories section page (latest + trending + genre shelves)
- [ ] 1b.2 Movies / Music / Games "coming soon" section pages
- [ ] 1b.3 Research section + article page
- [ ] 1b.4 Story detail / reader (chapters) with **per-item immersion** (`itemAccent`)
- [ ] 1b.5 Movie / Music / Game detail pages
- [ ] 1b.6 `TrendingList`, `ShelfCard`, `Reader` components + tests

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
