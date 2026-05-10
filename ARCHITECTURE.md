# ViSuReNa — Architecture Document

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Draft — reflects target architecture per [BRD.md](BRD.md) v1.0 |
| **Last updated** | 2026-05-09 |
| **Companion document** | [BRD.md](BRD.md) — this document is the **engineering** counterpart to the BRD's **product** specification. The BRD defines WHAT and WHY; this document defines HOW. |
| **Cross-repo reference** | Other repos in the ecosystem MUST link to this document at the pinned commit they were built against |

> This document is the engineering source of truth for the ViSuReNa system. Read alongside the [BRD](BRD.md). Where the BRD specifies a behavior, this document specifies the implementation. Updates to this document MUST stay in sync with the BRD; if they diverge, raise a PR against both.

---

## Table of contents

0. [Reading guide](#0-reading-guide)
1. [Architectural principles — invariant across phases](#1-architectural-principles--invariant-across-phases)
2. [Phase 0 architecture — Brand & Foundation (current)](#2-phase-0-architecture--brand--foundation-current)
3. [Brand & visual system](#3-brand--visual-system)
4. [Phase 1 architecture — Recommendation Engine Live](#4-phase-1-architecture--recommendation-engine-live)
5. [Phase 2 architecture — Accounts & Refinement](#5-phase-2-architecture--accounts--refinement)
6. [Phase 3 architecture — First Original + Orchestration](#6-phase-3-architecture--first-original--orchestration)
7. [Phase 4 architecture — Multi-medium Expansion](#7-phase-4-architecture--multi-medium-expansion)
8. [Phase 5 architecture — Membership & Monetization](#8-phase-5-architecture--membership--monetization)
9. [Cross-cutting concerns](#9-cross-cutting-concerns)
10. [Component deep-dives](#10-component-deep-dives)
11. [Sequence diagrams reference](#11-sequence-diagrams-reference)
12. [Cost model & growth projections](#12-cost-model--growth-projections)
13. [Disaster recovery & runbooks](#13-disaster-recovery--runbooks)
14. [Appendix — IaC templates](#appendix--iac-templates)

---

## 0. Reading guide

This document is **phase-organized**. Each phase section shows:

1. **Topology diagram** — what exists at end of phase
2. **What's added vs prior phase**
3. **Component contracts** — IAM, API specs, S3 paths, schemas in use
4. **What's deferred to a later phase**

If you're building or integrating today, **start at the phase the platform is currently in** (Phase 0 as of this version), then read forward only as far as you need.

If you're building a content engine, also read Section 10.2 (Content engine integration patterns) and BRD Appendix C (bootstrap checklist).

If you're building orchestration or analytics, read Sections 6 and 10.3–10.4 in addition.

---

## 1. Architectural principles — invariant across phases

These principles MUST hold at every phase. If a design choice violates them, it's wrong.

### 1.1 Single source of truth for shape

**Every data shape used across repos is defined in `visurena-platform/schemas/`.** No engine, surface, or service may invent its own shape. Schema is the contract.

### 1.2 Static-first surfaces

The web surface is a **static export**, served from S3 + CloudFront. No SSR, no per-request rendering. Everything that can be resolved at build time MUST be resolved at build time. Mobile/TV/VR surfaces are runtime-fetching but consume the same manifest+content endpoints.

Implication: **content updates require a rebuild** of the affected surfaces. Acceptable trade-off — rebuild is fast (< 5 min), CDN cache is global, hosting is ~free.

### 1.3 Trust boundaries dictate bucket boundaries

User-generated data lives in a **separate bucket** from public content. Analytics outputs live in a **third bucket**. One IAM mistake should never leak both content and user data.

### 1.4 The platform owns infrastructure

All AWS resources for the entire ecosystem are defined in `visurena-platform/infrastructure/`. Other repos declare their needs in their READMEs and open PRs against the platform repo. **No repo creates AWS resources directly.**

### 1.5 Repos communicate by data, not by code dependency

Engines, orchestration, and analytics communicate by **writing/reading S3 objects**, not by importing each other's code. The only code dependency anywhere is the **schemas** (vendored or submoduled into engines).

### 1.6 Idempotency and replayability

Every automated process (generation, manifest rebuild, analytics jobs) MUST be idempotent: running the same operation twice with the same inputs produces the same result. This makes recovery trivial — if a job fails halfway, just re-run.

### 1.7 Least privilege IAM

Every Lambda, every CI runner, every IAM role has scope limited to its specific bucket prefix and specific operations. No `s3:*` policies, no `Resource: "*"` policies anywhere.

### 1.8 Observability before scale

By Phase 2, every service writes structured logs to CloudWatch with trace IDs that connect across components. We do not wait for problems before adding telemetry.

---

## 2. Phase 0 architecture — Brand & Foundation (current)

### 2.1 Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            END USER                                      │
│                              │                                           │
│                              ▼                                           │
│              ┌─────────────────────────────┐                             │
│              │     visurena.com (CF)        │  ← CloudFront E19J2MV0E1W0DD │
│              └──────────────┬──────────────┘                             │
│                              │                                           │
│                              ▼                                           │
│              ┌─────────────────────────────┐                             │
│              │  s3://visurena.com-...       │  ← static site bucket       │
│              │  (HTML, JS, CSS, images)     │                             │
│              └─────────────────────────────┘                             │
│                                                                          │
│  Build & deploy:                                                         │
│   GitHub push → Actions → next build → s3 sync → CloudFront invalidate   │
│                                                                          │
│  Content sources (compiled in at build time):                            │
│   • apps/web/posts/*.{md,html}      ← blog posts (file-based)       │
│   • apps/web/content-config.json    ← cards (hand-edited)           │
│                                                                          │
│  User data collection:                                                   │
│   • localStorage only (no backend)                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**One repo. One surface. Zero backend.** This is the simplest possible system that proves the brand thesis.

### 2.2 Component inventory

| Component | Location | Purpose |
|---|---|---|
| Static site bucket | `s3://visurena.com-visurena-bucket` | Hosts the built site |
| CloudFront | distribution `E19J2MV0E1W0DD` | CDN, custom domain, HTTPS |
| Route53 zone | `visurena.com.` | DNS |
| GitHub Actions | `.github/workflows/deploy.yaml` | Build & deploy on push to `master`/`main` |

### 2.3 What's added in Phase 0 (vs the legacy starting point)

- **Schemas folder scaffolded** — `schemas/{blog-post,story-chapter,track,film,game,manifest,taste-input}.schema.json` exist as v1.0.0 stubs, even though no engine consumes them yet. Future engines need a target to build against.
- **Brand redesign** — typography, single accent color, restrained editorial-streaming aesthetic. See Phase 0 Frontend Design Spec (separate doc, TBD when mockups settle).
- **Recommendation-intake hero** on the home page. Two-step prompt; saves to `localStorage['visurena.taste-inputs']` as a JSON array. NO backend write yet.
- **Removed:** "Coming Soon" placeholder pages from primary nav.

### 2.4 Contracts in effect at Phase 0

| Contract | Defined where | Consumed where |
|---|---|---|
| Schema files | `visurena-platform/schemas/` | Self-published; no consumers yet |
| Static site URL | `https://visurena.com/` | End users |

### 2.5 What's deferred

- All backend services (deferred to Phase 1)
- Multi-bucket S3 layout (deferred to Phase 1 when first content engine integrates)
- Cross-repo CI/CD coordination (deferred to Phase 1)

---

## 3. Brand & visual system

The brand direction (**Aurora Indigo**) was locked on 2026-05-09. Product-side narrative + reference mockups live in `BRD.md` Appendix D. This section is the **engineering source of truth**: token names, contracts surfaces consume, and the per-section accent override pattern.

### 3.1 Token taxonomy

Two layers, per the design-system convention:

1. **Primitive tokens** — raw color values. Named neutrally (`--color-indigo-500`). Do not consume these directly in components.
2. **Semantic tokens** — role-based aliases (`--color-bg`, `--color-accent-parent`). Components consume these. Theming = remapping semantic tokens to different primitives.

Below: the locked v1 token table. Implementation is CSS custom properties; same names re-map to native variables for ios/android/tv/vr surfaces in later phases.

### 3.2 Parent palette tokens (used on every page)

```css
:root {
  /* Primitive */
  --color-indigo-950: #0A0E2A;
  --color-indigo-900: #131A3D;
  --color-indigo-800: #1D2552;
  --color-indigo-700: #2A3268;
  --color-indigo-500: #6B7DFF;
  --color-text-50:    #F0F2FF;
  --color-text-300:   #9DA8D9;
  --color-text-500:   #5C66A0;

  /* Semantic — parent (page) */
  --color-bg:               var(--color-indigo-950);   /* page background */
  --color-surface-1:        var(--color-indigo-900);   /* cards, nav, panels */
  --color-surface-2:        var(--color-indigo-800);   /* raised surfaces */
  --color-hairline:         var(--color-indigo-700);   /* 1px borders */
  --color-text-high:        var(--color-text-50);      /* primary text */
  --color-text-mid:         var(--color-text-300);     /* secondary text */
  --color-text-muted:       var(--color-text-500);     /* tertiary, build info */
  --color-accent-parent:    var(--color-indigo-500);   /* THE VERB — buttons, links, focus rings */
}
```

### 3.3 Section accent tokens (the aurora)

Seven semantic accents: Home (master, inherits parent indigo) + 6 sub-rooms. Each sub-room accent is used ONLY for that section's eyebrow, active-nav indicator (when on that page), ambient hero radial spot, content card category labels, card hover borders, and section CTAs. Parent accent (`--color-accent-parent`) stays glued to global UI (focus rings, recommendation/search button, link underlines) across all rooms.

```css
:root {
  /* Primitive — section accent palette (the aurora) */
  --color-aurora-indigo:    #6B7DFF; /* Home (master) */
  --color-aurora-pink:      #F472B6; /* Movies */
  --color-aurora-gold:      #F4C04E; /* Music */
  --color-aurora-lime:      #B5E853; /* Games */
  --color-aurora-cyan:      #2DD4BF; /* Story */
  --color-aurora-lavender:  #A78BFA; /* VR World — NEW (added in v1.2 lock) */
  --color-aurora-platinum:  #C0C8E0; /* Blog */

  /* Semantic — section accents */
  --color-accent-home:      var(--color-aurora-indigo);   /* master, inherits parent */
  --color-accent-movies:    var(--color-aurora-pink);
  --color-accent-music:     var(--color-aurora-gold);
  --color-accent-games:     var(--color-aurora-lime);
  --color-accent-story:     var(--color-aurora-cyan);
  --color-accent-vrworld:   var(--color-aurora-lavender);
  --color-accent-blog:      var(--color-aurora-platinum);
}
```

### 3.4 Per-section "room override" pattern

Every page is in exactly one room (Home, Movies, Music, Games, Story, VR World, or Blog). The room sets a single semantic token that components consume:

```css
/* Default (Home — master room) */
:root {
  --color-accent-room: var(--color-accent-home);
}

/* Per-room overrides applied via data-room on <html> or <body> */
html[data-room="movies"]   { --color-accent-room: var(--color-accent-movies); }
html[data-room="music"]    { --color-accent-room: var(--color-accent-music); }
html[data-room="games"]    { --color-accent-room: var(--color-accent-games); }
html[data-room="story"]    { --color-accent-room: var(--color-accent-story); }
html[data-room="vrworld"]  { --color-accent-room: var(--color-accent-vrworld); }
html[data-room="blog"]     { --color-accent-room: var(--color-accent-blog); }
```

Components reference `var(--color-accent-room)` for room-specific UI (eyebrow, active nav, CTA, card hover border) and `var(--color-accent-parent)` for global UI (recommendation/search button, focus rings).

In Next.js: set `data-room="<room>"` on the `<html>` element from the page's `getLayout`/`_document` based on the route. In static export, render it inline at build time.

### 3.5 Typography tokens

```css
:root {
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
  --font-body:    'Inter', system-ui, -apple-system, sans-serif;
  --font-italic:  'DM Serif Display', 'Spectral', Georgia, serif; /* used italic only, sparingly */
  --font-mono:    'JetBrains Mono', 'SF Mono', Menlo, monospace;
}
```

Load Inter (300/400/500/600/700) + DM Serif Display (italic 400) + JetBrains Mono (400/500) via Google Fonts. Treat DM Serif Display as the editorial pull-word voice — used italic only, in the section accent color, for hero emphasis words and one or two pull-quotes per page.

### 3.6 Where these tokens live

- **Web (current):** `apps/web/styles/globals.css` — define both primitive and semantic layers there. Components reference semantic tokens only.
- **Tailwind theme integration:** wire semantic tokens into `tailwind.config.js` under `theme.extend.colors` so utilities like `bg-bg`, `text-high`, `accent-room` work directly. Replace the existing per-section color sprawl in the current Tailwind config (`movies/music/games/story/blog/vr` palette objects) with the locked token set.
- **Future surfaces (ios/android/tv/vr):** mirror the semantic-token names in their native theming systems (Asset Catalog colors on iOS, `colors.xml` on Android, etc.). The names are the contract; primitive values remap freely if a surface has different needs (e.g., higher contrast on TV).

### 3.7 Reference mockups (canonical)

These mockups are the visual source of truth. Match these when implementing or porting to other surfaces:

- Home + color-system showcase: `apps/web/public/mockups-dark/06-aurora-indigo.html`
- Per-room proofs (each in its own section accent):
  - Movies: `06-aurora-indigo-watch.html` (visible label MOVIES; file path retained)
  - Music: `06-aurora-indigo-listen.html` (visible label MUSIC)
  - Games: `06-aurora-indigo-play.html` (visible label GAMES)
  - Story: `06-aurora-indigo-read.html` (visible label STORY)
  - VR World: `06-aurora-indigo-vr-world.html` (NEW)
  - Blog: `06-aurora-indigo-research.html` (visible label BLOG; file path retained for now)

### 3.8 Migration plan (current Tailwind setup → locked system)

The current `apps/web/tailwind.config.js` defines per-section color objects under `colors.theme.{movies,music,games,story,blog,vr}` plus a `comfy.*` blog palette. These are transitional and MUST be replaced as part of the Phase 0 brand cutover:

1. Add the locked semantic tokens to `globals.css` (this section's tables).
2. Extend Tailwind to expose them (`theme.extend.colors`).
3. Sweep components in `apps/web/components/` and `apps/web/pages/` to replace `theme.movies`, `theme.music`, etc. with the new semantic tokens.
4. Replace the current Layout.tsx `pageTheme` prop with the `data-room` attribute pattern.
   4a. Map old `pageTheme` values to new `data-room` values: `movies` (was `movies`), `music` (was `music`), `games` (was `games`), `story` (was `story`), `blog` (was `blog`/`research`; tentatively `studio` in v1.2), `vrworld` (was `vr`). Delete legacy values.
5. Delete the legacy color objects from `tailwind.config.js`.
6. Visual diff against the mockups.

### 3.9 Nav structure (locked v1.3)

Top-nav order, applied across all surfaces:

```
HOME · MOVIES · MUSIC · GAMES · STORY · VR WORLD · BLOG
```

Implementation notes:

- Home is the master room and hosts the recommendation/intake hero. There is no separate "Search" tab — the recommendation entry point lives on Home.
- Active state is signaled by a 1px section-accent underline + brighter text on the current tab. Hover (on non-active tabs) shows a parent-indigo underline.
- Mobile (≤768px): nav collapses to a hamburger menu with the same order. Active room is indicated by the section accent on its row.
- The active accent is read from `var(--color-accent-room)` (set by `data-room` on `<html>`), so the nav's active styling automatically follows the page's room without per-page overrides.

---

## 4. Phase 1 architecture — Recommendation Engine Live

### 4.1 Topology

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              END USER                                       │
│                                │                                            │
│              ┌─────────────────┼─────────────────┐                          │
│              │  POST /api/...  │   GET visurena.com                         │
│              ▼                 │                 ▼                          │
│   ┌─────────────────────┐      │    ┌────────────────────────┐              │
│   │  api.visurena.com   │      │    │   visurena.com (CF)    │              │
│   │  (API Gateway)      │      │    └────────────┬───────────┘              │
│   └──────────┬──────────┘      │                 │                          │
│              │                  │                 ▼                          │
│              ▼                  │    ┌────────────────────────┐              │
│   ┌─────────────────────┐      │    │ s3://visurena.com-...  │              │
│   │  collect Lambda     │      │    │  (static site)         │              │
│   │  (validates + writes)│     │    └────────────────────────┘              │
│   └──────────┬──────────┘      │                                            │
│              │                  │   Build reads at build time:               │
│              ▼                  │    ┌────────────────────────┐              │
│   ┌─────────────────────┐      │◀───│ s3://visurena-content/ │ (NEW)        │
│   │ s3://visurena-data/ │      │    │   manifest.json        │              │
│   │ + DynamoDB index    │      │    │   blog/{...}.json      │              │
│   └─────────────────────┘      │    └────────────────────────┘              │
│                                  │            ▲                              │
│                                  │            │                              │
│                                  │  ┌─────────┴────────────┐                 │
│                                  │  │ manifest-rebuild     │                 │
│                                  │  │ Lambda (S3-triggered)│                 │
│                                  │  └──────────────────────┘                 │
│                                  │            ▲                              │
│                                  │            │ S3:PutObject events          │
│                                  │            │                              │
│                                  │  ┌─────────┴────────────┐                 │
│                                  │  │ visurena-blog-engine │ (FIRST ENGINE)  │
│                                  │  │ (separate repo)      │                 │
│                                  │  └──────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 What's added vs Phase 0

**New AWS resources** (defined in `infrastructure/`):
- `s3://visurena-content/` — public, CloudFront-fronted at `content.visurena.com`
- `s3://visurena-data/` — private, write-only via `collect` Lambda role
- `s3://visurena-analytics/` — provisioned but mostly empty until Phase 2
- `manifest-rebuild` Lambda — S3-event-triggered; rebuilds `manifest.json` on every PutObject
- `collect` Lambda — validates and writes user data
- API Gateway HTTP API at `api.visurena.com` — fronts `collect` Lambda
- DynamoDB table `visurena-recommendations-catalog` — stores the curated catalog of ~500 items with theme/tag indexes
- IAM role `visurena-engine-blog` — `PutObject` to `s3://visurena-content/blog/*` only
- CloudFront distribution `content.visurena.com` — fronts content bucket

**New repo:** `visurena-blog-engine` — first content engine, end-to-end handoff working.

**Migration on platform repo:**
- `apps/web/lib/blog.js` (current file-based reader) → `apps/web/lib/content.ts` (new manifest-driven reader). Both can coexist during the cutover; migrate post types one at a time.
- New workflow `.github/workflows/content-update.yaml` triggered by `repository_dispatch[content-published]`.

### 4.3 Contracts in effect at Phase 1

#### 4.3.1 Data collection API

```
POST https://api.visurena.com/taste-input
Content-Type: application/json

{
  "anonId": "550e8400-e29b-41d4-a716-446655440000",
  "loved": { "title": "Annihilation", "medium": "movie", "year": 2018 },
  "reason": "the way meaning dissolves at the edges",
  "tags": ["sci-fi", "atmospheric"]
}

Response 200:
{ "id": "<uuid>", "submittedAt": "2026-05-09T14:30:00Z" }

Response 400 (schema validation failed):
{ "error": "validation_failed", "details": [...] }
```

```
POST https://api.visurena.com/feedback
Body: per feedback.schema.json
```

```
POST https://api.visurena.com/event
Body: per event.schema.json
```

All endpoints validate request body against the corresponding schema. Failed validation → 400 + structured error.

#### 4.3.2 Content publishing handoff (engine → platform)

See [BRD Section 11.1](BRD.md#111-the-content-publish-flow-t0--t7) for the canonical timeline.

In summary: engine uploads to `s3://visurena-content/{type}/...` → S3 event triggers manifest rebuild → engine sends `repository_dispatch` to platform → platform rebuilds → CloudFront invalidates.

#### 4.3.3 Manifest schema

Per `schemas/manifest.schema.json`. The platform reads this; engines never write to it.

### 4.4 IAM matrix at Phase 1

| Role | Permissions | Used by |
|---|---|---|
| `visurena-engine-blog` | `s3:PutObject`, `s3:GetObject` on `arn:...:visurena-content/blog/*` | `visurena-blog-engine` GitHub Actions (via OIDC) |
| `visurena-collect` | `s3:PutObject` on `arn:...:visurena-data/*`, `dynamodb:PutItem` on the catalog table | `collect` Lambda |
| `visurena-manifest-rebuild` | `s3:ListBucket`, `s3:GetObject`, `s3:PutObject` on `arn:...:visurena-content/*` (excluding `manifest.json` writes — actually, only the manifest itself for write) | `manifest-rebuild` Lambda |
| `visurena-platform-deploy` | `s3:Put*`, `s3:Delete*` on the static site bucket; `cloudfront:CreateInvalidation` | Platform GitHub Actions (existing) |

OIDC federation (instead of long-lived access keys) for all GitHub Actions — Phase 1 hardening priority.

### 4.5 What's deferred

- Accounts (Phase 2)
- ML-based recommendations (Phase 2 or 3+)
- Orchestration (Phase 3)
- Analytics processing pipeline (Phase 2 minimum, full at Phase 3)

---

## 5. Phase 2 architecture — Accounts & Refinement

### 5.1 What's added vs Phase 1

**Accounts:**
- Cognito User Pool `visurena-users` — email magic-link only, no passwords
- DynamoDB table `visurena-accounts` — account metadata, taste profile pointer
- Account-aware versions of `taste-input` and `feedback` (now include `accountId` if present)

**Analytics processing:**
- New repo: `visurena-analytics`
- Athena workgroup `visurena-analytics` querying `s3://visurena-data/` (already exists from earlier setup)
- Scheduled EventBridge Lambda runs daily — reads taste-inputs, computes demand-clusters, writes to `s3://visurena-analytics/demand-clusters/{YYYY-MM-DD}.json`
- Public dashboard data: `s3://visurena-analytics/public/crowd-dashboard.json` — surfaced on the Discover page

**Recommendation refinement:**
- The collect Lambda now also writes a per-user "interest vector" to a DynamoDB GSI on the accounts table, allowing personalized re-ranking on subsequent visits

**Email infrastructure:**
- SES configured for `visurena.com` domain
- Lambda + EventBridge weekly job sending "new picks for you" emails to opted-in users

### 5.2 New components

| Component | Purpose |
|---|---|
| Cognito User Pool | Email magic-link auth |
| `visurena-accounts` DynamoDB table | Account records + taste profile |
| `analytics-daily` Lambda | Reads data bucket, writes analytics outputs |
| Athena workgroup | Ad-hoc and scheduled querying |
| SES domain identity + DKIM | Outbound email |
| `email-weekly` Lambda | Sends weekly digests |

### 5.3 Surface changes

- **Account UI** added to the web surface header
- **Personal taste profile page** — `/profile`, `/profile/inputs`, `/profile/recs`
- **Public crowd dashboard** — `/crowd` (consumes `crowd-dashboard.json` at build time)

### 5.4 What's deferred

- Membership / payments (Phase 5)
- Mobile/TV/VR surfaces (Phase 3+)
- Real-time recommendations (still build-time-fetched manifest until scale demands otherwise)

---

## 6. Phase 3 architecture — First Original + Orchestration

### 6.1 Topology change — orchestration is now active

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   visurena-orchestration  (NEW REPO)                                    │
│   ─────────────────────────                                             │
│   • Release calendar (in S3 + DynamoDB)                                 │
│   • Decides when content goes live                                      │
│   • Owns release-schedule.json                                          │
│   • Triggers engine workflows on a schedule                             │
│                                                                         │
│       ┌───────────────────┐    ┌──────────────────────┐                 │
│       │ EventBridge crons │───▶│ orchestration Lambda │                 │
│       └───────────────────┘    └──────────┬───────────┘                 │
│                                            │                            │
│                                            ▼                            │
│                          ┌─────────────────────────────────┐            │
│                          │ Two writes:                      │            │
│                          │ 1. release-schedule.json (S3)    │            │
│                          │ 2. trigger engine workflow       │            │
│                          │    (gh api dispatch)             │            │
│                          └─────────────────────────────────┘            │
│                                                                         │
│   Manifest rebuild Lambda now CHECKS release-schedule.json:            │
│     - Items in S3 but not yet released → omitted from manifest.json    │
│     - At goLiveAt time → EventBridge fires → manifest re-rebuilt       │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.2 New components

| Component | Purpose |
|---|---|
| `visurena-orchestration` repo | Editorial brain |
| `release-schedule.json` (in S3) | Source of truth for "when does what go live" |
| `release-trigger` EventBridge schedule | Re-runs manifest builder when release dates arrive |
| `commission-engine` Lambda | Triggers content engines via GitHub API based on demand cluster |
| `visurena-story-engine` repo | Second content engine — generates novel chapters |

### 6.3 Surface changes

- **Reading interface** — `/read/{novel-id}/{chapter-num}` with paragraph-level reactions
- **Reaction widget** — structured emoji + tag inputs (not free-text comments — too noisy for editorial use)
- **"What readers wanted" callouts** — each chapter shows themes from previous chapter's feedback that influenced this one

### 6.4 Editorial workflow (new)

```
Phase 2 analytics emit demand-cluster
       │
       ▼
Owner reviews top clusters in dashboard
       │
       ▼
Owner picks one, drafts a novel concept (spine: premise, characters, arcs)
       │
       ▼
Concept committed to s3://visurena-content/story/{novel-id}/meta.json
       │
       ▼
Orchestration commissions Chapter 1 from story-engine
       │
       ▼
Story-engine generates → uploads → manifest rebuild
       │
       ▼
Orchestration sets release date in release-schedule.json
       │
       ▼
At release time → manifest re-rebuilt → site rebuilds → live
       │
       ▼
Readers react → feedback flows to s3://visurena-data/feedback/
       │
       ▼
Analytics processes feedback → emits "feedback themes" for next chapter
       │
       ▼
Owner reviews feedback themes, decides which to incorporate
       │
       ▼
Orchestration commissions Chapter 2 with feedback themes as inputs
       │
       (loop)
```

### 6.5 What's deferred

- Multi-medium beyond text (Phase 4)
- Membership (Phase 5 — opens after first novel completes)
- Mobile app (likely Phase 3+ but not blocking)

---

## 7. Phase 4 architecture — Multi-medium Expansion

### 7.1 What's added per medium

Each medium adds ONE content engine repo plus minor surface work. The infrastructure scales linearly because the manifest pattern already handles N content types.

| Sub-phase | New engine repo | New surface page | New schema | New IAM role |
|---|---|---|---|---|
| 4a Music | `visurena-music-engine` | `/listen/...` | `track.schema.json` (already stubbed) | `visurena-engine-music` |
| 4b Short video | `visurena-film-engine` (shorts) | `/watch/shorts/...` | `film.schema.json` (already stubbed) | `visurena-engine-film` |
| 4c Long film | `visurena-film-engine` (extended) | `/watch/...` | (extends `film.schema.json`) | (existing) |
| 4d VR | `visurena-vr-engine` | New `apps/vr/` surface | new `vr-experience.schema.json` | `visurena-engine-vr` |

### 7.2 Surface scale-out

By 4d, the platform has:
- `apps/web` (Next.js)
- `apps/ios` (React Native or Swift, decided at Phase 3)
- `apps/android` (matching)
- `apps/tv` (Apple TV / Android TV)
- `apps/vr` (Meta Quest / Vision Pro — for 4d)

All consume the same manifest from `content.visurena.com`. Web rebuilds on content update; mobile/TV/VR fetch at runtime with HTTP caching.

### 7.3 Storage scale considerations

Once content volume passes ~10K items:
- Manifest size becomes a concern (~100 KB+ per fetch)
- Migrate to per-type sub-manifests: `manifest-blog.json`, `manifest-story.json`, etc., with a top-level `manifest-index.json`
- Surfaces fetch only the sub-manifests they need

This is deferred until measured pain. Don't pre-optimize.

---

## 8. Phase 5 architecture — Membership & Monetization

### 8.1 What's added

- **Stripe integration** — Stripe Customer Portal for self-service subscription management
- **`visurena-billing` Lambda** — webhook receiver for Stripe events; updates account tier in DynamoDB
- **Tier-aware surfaces** — content gating logic (free tier reads 1 chapter behind front, etc.)
- **Revenue analytics** — added to analytics repo's outputs

### 8.2 Tier enforcement architecture

```
User requests /read/novel-x/chapter-5
       │
       ▼
Surface checks user's tier from /api/me (Lambda + Cognito + DynamoDB)
       │
       ▼
Surface checks chapter's required-tier from manifest.json metadata
       │
       ▼
If user tier ≥ chapter required-tier:
   → Render chapter
Else:
   → Render paywall component with upgrade CTA
```

Critical: **content is still publicly accessible at the S3 layer.** The paywall is enforced at the surface only. This is acceptable for our membership model (we're not protecting "premium content" — we're rewarding paying members with early access to content that becomes free later). Trying to enforce paywalls at the storage layer adds complexity without value at our scale.

### 8.3 What's deferred

- App-store in-app purchases — deferred indefinitely; web-purchased subscription works on mobile via login
- Family / team plans — revisit if data shows demand

---

## 9. Cross-cutting concerns

### 9.1 Schema versioning & migration

**Backward-compatible changes** (new optional fields): bump minor version. Engines can adopt at will.

**Breaking changes** (renames, type changes, new required fields): bump major version. Migration protocol:

1. Platform PR introduces new schema as `{type}.v2.schema.json` alongside `{type}.v1.schema.json`.
2. Surfaces support both versions during the migration window (typically 4 weeks).
3. Each engine PRs its switch to v2 + bumps its pinned schema commit.
4. After all engines on v2: platform PR removes v1 support.

**Manifest itself is versioned.** The `version` field in `manifest.json` matches the manifest schema version. Surfaces check version compatibility before parsing.

### 9.2 Authentication & authorization

| Phase | Surface auth | Service auth | Engine→S3 auth |
|---|---|---|---|
| 0 | None | None | N/A |
| 1 | None | API key (collect Lambda checks request signature) | OIDC federation: GitHub Actions assumes `visurena-engine-{type}` role |
| 2 | Cognito email magic-link | Same | Same |
| 3+ | Same | Same | Same |
| 5 | Same + tier-gated | Same | Same |

**OIDC federation rationale:** no long-lived AWS access keys in any GitHub repo. Each engine's GitHub Actions assumes a scoped IAM role at job start; credentials expire when the job ends. Setup is one-time per repo.

### 9.3 Observability

**Phase 0:** CloudFront access logs to `s3://visurena-cloudfront-logs/`. That's it.

**Phase 1+:** All Lambdas log structured JSON to CloudWatch with:
- `traceId` (UUID per request)
- `phase` (service name)
- `level` (`debug` / `info` / `warn` / `error`)
- `event` (machine-readable event name, e.g., `taste-input.received`)
- domain-specific fields

CloudWatch metric filters extract counts (errors per minute, validation failures per hour). Alarms via SNS to email.

**Phase 2+:** add **Sentry** (free tier) for surface-side errors. Tracing across surface → API → Lambda via the `traceId` header.

**Phase 3+:** add a tiny custom dashboard — internal-only Athena queries over CloudWatch logs and analytics outputs. No QuickSight unless we hit a real visualization wall.

### 9.4 Cost attribution

All AWS resources MUST have these tags:
- `Project=visurena`
- `Component=platform|engine-{type}|orchestration|analytics`
- `Phase=0|1|2|3|4|5`

Cost Explorer with `--group-by TAG:Component` gives clean per-component spend. Catches runaway sub-systems early.

### 9.5 Secrets management

- **GitHub Actions secrets** for repository-scoped secrets (e.g., `VISURENA_PLATFORM_DISPATCH_TOKEN`).
- **AWS Secrets Manager** for runtime secrets accessed by Lambdas (Stripe keys, third-party API keys).
- **Never** in code. Never in `.env` committed to git. Never in CloudFormation parameters as plaintext.

---

## 10. Component deep-dives

### 10.1 manifest-rebuild Lambda

**Trigger:** S3 PutObject events on `s3://visurena-content/` (excluding `manifest.json` itself to avoid recursion)

**Behavior:**
1. List all `s3://visurena-content/**/*.json` (excluding `manifest.json`, `release-schedule.json`)
2. Read `release-schedule.json` (if present); build a set of `{contentId → goLiveAt}`
3. For each content file:
   - Read its JSON, extract `id`, `type`, `publishedAt`, `title`, `tags`
   - Determine `effectivePublishAt = max(publishedAt, goLiveAt)`
   - If `effectivePublishAt > now`: SKIP (not yet released)
   - Else: include in manifest
4. Write the consolidated `manifest.json`
5. Set Cache-Control: `max-age=60` so surfaces pick up updates within ~1 min

**Idempotency:** complete rebuild every time. Concurrent invocations are safe (last-writer-wins; both produce the same content).

**Cost:** ~$0.01/month at expected content volume.

**Failure modes:**
- Lambda timeout if content count > 100K → migrate to per-type sub-manifests (Phase 4)
- Race condition if release-schedule.json is updated mid-rebuild → next S3 event triggers another rebuild; eventual consistency

### 10.2 Content engine integration patterns

Every engine MUST implement the **5-step contract:**

```
1. SCHEMA       Vendor or submodule schemas at pinned commit
2. GENERATE     Engine-specific logic; produces JSON output
3. VALIDATE     ajv-cli (or python-jsonschema) against the schema
4. UPLOAD       aws s3 cp to designated path (per IAM role's prefix)
5. NOTIFY       gh api dispatch to platform repo
```

**Example workflow** (`generate-and-publish.yaml` template):

```yaml
name: Generate and publish
on:
  workflow_dispatch:
    inputs:
      params: { type: string, required: true }

permissions:
  id-token: write   # for OIDC
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { submodules: true }
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::597088058256:role/visurena-engine-blog
          aws-region: us-east-1
      - run: python generate.py --params='${{ inputs.params }}' --out=./out/
      - run: ajv validate -s vendor/visurena-schemas/blog-post.schema.json -d ./out/*.json
      - run: aws s3 cp ./out/ s3://visurena-content/blog/$(date +%Y)/ --recursive
      - run: |
          gh api repos/visurena/visurena-platform/dispatches \
            -f event_type="content-published" \
            -f client_payload='{"type":"blog","triggered_by":"${{ github.run_id }}"}'
        env:
          GH_TOKEN: ${{ secrets.VISURENA_PLATFORM_DISPATCH_TOKEN }}
```

### 10.3 Orchestration release-gate

**Components:**
- `release-schedule.json` in `s3://visurena-content/` — single file; orchestration owns
- `release-trigger` Lambda — runs hourly; checks if any items are due to go live; if yes, re-triggers manifest rebuild and platform dispatch

**Schedule format** (`release-schedule.json`):
```json
{
  "version": "1.0",
  "schedule": [
    {
      "contentId": "novel-x-chapter-05",
      "contentPath": "story/novel-x/chapters/05.json",
      "goLiveAt": "2026-05-15T18:00:00Z",
      "channels": ["web", "mobile"]
    }
  ]
}
```

**Why a separate file (not embedded in content JSON):**
- Editorial decisions (release timing) are decoupled from content (the chapter itself doesn't know when it's released)
- Orchestration can shift release dates without re-uploading content
- Content can exist privately in S3 ahead of release; only orchestration's update reveals it

### 10.4 Analytics processing pipeline

**Inputs:** all of `s3://visurena-data/`.

**Daily processing job** (`analytics-daily` Lambda, EventBridge cron `cron(0 4 * * ? *)`):
1. Query `s3://visurena-data/taste-inputs/` for the last 24h via Athena
2. Cluster taste-inputs by theme tags + reason-text TF-IDF (hand-rolled at first; replace with embeddings + k-means at scale)
3. Identify top N clusters; for each cluster compute size, growth rate, suggested generation prompt
4. Write `s3://visurena-analytics/demand-clusters/{YYYY-MM-DD}.json`
5. Compute aggregated stats; write `s3://visurena-analytics/public/crowd-dashboard.json`

**Per-content feedback rollup** (separate job, runs after each chapter release):
1. Query `s3://visurena-data/feedback/{content-id}/` for all feedback on the new content
2. Aggregate reaction tags, identify top themes, write summary to `s3://visurena-analytics/feedback-summaries/{content-id}.json`
3. This summary becomes input to the NEXT chapter's commission

**Privacy:** all analytics outputs are aggregated. No outputs contain individual `accountId` or `anonId`. Athena queries that touch raw user data run with a separate, more privileged role; their outputs are scrubbed before writing to `visurena-analytics`.

---

## 11. Sequence diagrams reference

### 11.1 Content publish (engine → live)

```
Engine         S3-content      Lambda        Engine      Platform GHA   S3-static  CloudFront  User
  │               │               │             │             │             │           │        │
  │ PutObject     │               │             │             │             │           │        │
  ├──────────────▶│               │             │             │             │           │        │
  │               │ event         │             │             │             │           │        │
  │               ├──────────────▶│             │             │             │           │        │
  │               │               │ rebuild     │             │             │           │        │
  │               │               │ manifest    │             │             │           │        │
  │               │◀──────────────┤             │             │             │           │        │
  │ dispatch      │               │             │             │             │           │        │
  ├──────────────────────────────────────────────────────────▶│             │           │        │
  │               │               │             │             │ build       │           │        │
  │               │               │             │             │ + sync      │           │        │
  │               │               │             │             ├────────────▶│           │        │
  │               │               │             │             │ invalidate  │           │        │
  │               │               │             │             ├────────────────────────▶│        │
  │               │               │             │             │             │           │ GET /  │
  │               │               │             │             │             │           │◀───────┤
  │               │               │             │             │             │           │ html   │
  │               │               │             │             │             │           ├───────▶│
```

### 11.2 Taste input submission

```
User           Surface         API GW          collect Lambda     S3-data     DynamoDB
  │               │               │                  │               │           │
  │ submit form   │               │                  │               │           │
  ├──────────────▶│               │                  │               │           │
  │               │ POST          │                  │               │           │
  │               ├──────────────▶│                  │               │           │
  │               │               │ invoke           │               │           │
  │               │               ├─────────────────▶│               │           │
  │               │               │                  │ validate vs   │           │
  │               │               │                  │ taste-input   │           │
  │               │               │                  │ .schema.json  │           │
  │               │               │                  │ PutObject     │           │
  │               │               │                  ├──────────────▶│           │
  │               │               │                  │ PutItem (idx) │           │
  │               │               │                  ├──────────────────────────▶│
  │               │               │ 200 + id         │               │           │
  │               │◀──────────────┤◀─────────────────┤               │           │
  │ confirmation  │               │                  │               │           │
  │◀──────────────┤               │                  │               │           │
```

### 11.3 Release-gated content (orchestration in play)

```
Engine        S3-content      Lambda(rebuild)   release-schedule.json    Orchestration EventBridge   Platform GHA
  │               │                  │                    │                       │                       │
  │ PutObject     │                  │                    │                       │                       │
  ├──────────────▶│                  │                    │                       │                       │
  │               │ event            │                    │                       │                       │
  │               ├─────────────────▶│ read               │                       │                       │
  │               │                  ├───────────────────▶│                       │                       │
  │               │                  │ contentId not yet  │                       │                       │
  │               │                  │ released → SKIP    │                       │                       │
  │               │                  │ from manifest      │                       │                       │
  │               │                  │                    │                       │                       │
  │     ...time passes until goLiveAt...                  │                       │                       │
  │                                                       │ cron fires ──────────▶│                       │
  │                                                       │                       │ re-trigger manifest   │
  │               │                  │◀──────────────────────────────────────────│                       │
  │               │                  │ rebuild (now includes the content)        │                       │
  │               │                  │ + dispatch ──────────────────────────────────────────────────────▶│
  │                                                                                                       │ build & deploy
```

---

## 12. Cost model & growth projections

### 12.1 Phase-by-phase cost estimate

| Phase | MAUs | Monthly cost | Dominant components |
|---|---|---|---|
| 0 | < 100 | < $1 | Route53 ($0.50), S3 dust |
| 1 | 100–1K | $5–$15 | + Lambda invocations, DynamoDB on-demand, content bucket data transfer |
| 2 | 1K–10K | $20–$80 | + Cognito MAUs ($0.0055 ea above 50K free), SES emails, Athena queries |
| 3 | 10K–100K | $100–$500 | + content storage (per-medium), heavier Lambda invocations |
| 4 | 100K–1M | $1K–$5K | + multi-surface CDN egress, DynamoDB at scale |
| 5 | 1M+ | $5K+ | + Stripe fees (2.9% + 30¢), revenue eclipses cost |

**Free-tier stretches:** Phase 0–1 stays effectively free indefinitely. Phase 2 is mostly free until ~5K MAUs. Phase 3 is when meaningful cost begins.

### 12.2 Cost guardrails

- AWS Budgets alerts at 50% / 80% / 100% of monthly target per phase
- Per-component budgets (split by `Component=` tag)
- S3 lifecycle rules: raw analytics events → 90-day expiry; cold content → Glacier after 1 year
- Lambda concurrency limits set per function (prevents runaway invocations)

---

## 13. Disaster recovery & runbooks

### 13.1 Backups

- **Schemas:** in git (platform repo). RTO: instant.
- **Content (S3):** S3 Versioning ENABLED on `visurena-content/`. Lifecycle: keep all versions for 90 days. RTO: minutes via console.
- **User data (S3):** S3 Versioning ENABLED on `visurena-data/`. Cross-region replication to `us-west-2` (Phase 2+). RTO: minutes.
- **DynamoDB:** Point-in-time recovery enabled on all tables. RTO: hours (PITR restore).

### 13.2 Runbooks

#### A. Static site is down

1. Check CloudFront distribution status in console
2. Check S3 site bucket — does index.html exist?
3. If both healthy → check DNS (`dig visurena.com`)
4. If broken: roll back via re-deploying last known good commit (`gh workflow run deploy.yaml -f ref=<sha>`)

#### B. Content engine published but doesn't appear on site

1. Check manifest in `s3://visurena-content/manifest.json` — is the new item there?
2. If NOT in manifest:
   - Check `release-schedule.json` — is item gated?
   - Check manifest-rebuild Lambda CloudWatch logs for errors
   - Manually invoke manifest-rebuild Lambda
3. If IN manifest but NOT on site:
   - Check platform repo Actions tab — did `repository_dispatch` arrive?
   - If not arrived: manually dispatch (`gh workflow run content-update.yaml`)
   - If arrived but failed: check build logs

#### C. Mass user-data leak suspected

1. Immediately revoke `visurena-collect` Lambda's IAM role
2. Disable API Gateway endpoint
3. Audit S3 access logs for `visurena-data/` for the suspected window
4. Notify affected users within 72h per privacy commitments
5. Forensics + root cause before reactivation

#### D. Schema breaking change accidentally deployed

1. Roll back platform repo to prior commit
2. Engines that already updated to new schema: revert to prior pinned commit
3. Re-run their last successful generation
4. Discuss the migration plan and re-attempt with proper coordination

---

## Appendix — IaC templates

### A.1 `s3://visurena-content/` bucket (CloudFormation snippet)

```yaml
ContentBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: visurena-content
    VersioningConfiguration:
      Status: Enabled
    LifecycleConfiguration:
      Rules:
        - Id: ExpireOldVersions
          Status: Enabled
          NoncurrentVersionExpirationInDays: 90
    PublicAccessBlockConfiguration:
      BlockPublicAcls: true
      BlockPublicPolicy: false   # We use a public read policy via bucket policy
      IgnorePublicAcls: true
      RestrictPublicBuckets: false
    Tags:
      - { Key: Project,   Value: visurena }
      - { Key: Component, Value: platform }
      - { Key: Phase,     Value: '1' }

ContentBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket: !Ref ContentBucket
    PolicyDocument:
      Statement:
        - Effect: Allow
          Principal: '*'
          Action: s3:GetObject
          Resource: !Sub 'arn:aws:s3:::${ContentBucket}/*'
          Condition:
            StringEquals:
              # Only via CloudFront
              'AWS:SourceArn': !Sub 'arn:aws:cloudfront::${AWS::AccountId}:distribution/${ContentDistribution}'
```

### A.2 `manifest-rebuild` Lambda (CloudFormation snippet)

```yaml
ManifestRebuildFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: visurena-manifest-rebuild
    Runtime: python3.12
    Handler: index.handler
    MemorySize: 512
    Timeout: 60
    Role: !GetAtt ManifestRebuildRole.Arn
    Code:
      ZipFile: |
        # see infrastructure/lambdas/manifest-rebuild/
    Environment:
      Variables:
        BUCKET: visurena-content

ManifestRebuildRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal: { Service: lambda.amazonaws.com }
          Action: sts:AssumeRole
    Policies:
      - PolicyName: ManifestAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - s3:ListBucket
              Resource: arn:aws:s3:::visurena-content
            - Effect: Allow
              Action:
                - s3:GetObject
              Resource: arn:aws:s3:::visurena-content/*
            - Effect: Allow
              Action:
                - s3:PutObject
              Resource: arn:aws:s3:::visurena-content/manifest.json

ContentToManifestTrigger:
  Type: AWS::S3::Bucket  # Notification config attached to ContentBucket
  Properties:
    NotificationConfiguration:
      LambdaConfigurations:
        - Event: 's3:ObjectCreated:*'
          Function: !GetAtt ManifestRebuildFunction.Arn
          Filter:
            S3Key:
              Rules:
                - Name: suffix
                  Value: '.json'
```

### A.3 OIDC trust for engine GitHub Actions

```yaml
EngineBlogRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: visurena-engine-blog
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Federated: !Sub 'arn:aws:iam::${AWS::AccountId}:oidc-provider/token.actions.githubusercontent.com'
          Action: sts:AssumeRoleWithWebIdentity
          Condition:
            StringEquals:
              'token.actions.githubusercontent.com:aud': sts.amazonaws.com
            StringLike:
              'token.actions.githubusercontent.com:sub': 'repo:visurena/visurena-blog-engine:*'
    Policies:
      - PolicyName: BlogContentWrite
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action: s3:PutObject
              Resource: arn:aws:s3:::visurena-content/blog/*
```

---

*End of ARCHITECTURE.md v1.0.*
