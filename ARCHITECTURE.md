# Visurena — Architecture & Design Document

> **Living document.** This is the single source of truth for Visurena's architecture.
> Update it (relevant section + decisions table §2 + change log §13) in the *same* change
> whenever an architecture decision is made or changed. See `CLAUDE.md` for the rule.

- **Status:** 🟢 Design complete — pending owner review, then implementation planning.
- **Last updated:** 2026-05-23
- **Owner:** Vishnu (vishnusurya11@gmail.com)

---

## 1. Vision

Visurena is a cinematic creative-studio platform — written **Stories**, plus **Movies**,
**Music**, and **Games** — with a dark, jewel-toned editorial look and a subtle animated
"nebula gas" background. It is being rebuilt from a static brochure site into a real
platform: automated content infrastructure, user accounts, engagement (likes / progress /
comments / follows), interaction analytics, and search. Built React-first so a future
mobile app reuses the design language and logic.

---

## 2. Locked decisions

| # | Decision | Value |
|---|---|---|
| D1 | Build approach | Rebuild **in-place** on the existing Next.js app (becomes `apps/web`) |
| D2 | Homepage direction | **The Studio** (from `visurenawebtemp`) |
| D3 | Palette | **Jewel** (amber=Stories, emerald=Movies, ruby=Music, amethyst=Games) on black |
| D4 | Background | **Drifting nebula gas**, section-tinted, subtle, honors reduced-motion |
| D5 | Phase 1 scope | Homepage + all section/detail pages |
| D6 | Mobile | **Invest now** — monorepo + shared design tokens/logic for future React Native/Expo app |
| D7 | Overall architecture | **A · All-AWS serverless** (S3+CloudFront, API GW+Lambda, DynamoDB, Cognito, EventBridge) |
| D8 | Auth | **AWS Cognito** — Google, Apple, Facebook, email+password. AWS stores credentials, never us. |
| D9 | Engagement features | Likes, progress/continue, comments & ratings, follow + notify; interaction analytics |
| D10 | Content storage | Content in **S3** (NOT git). Path `section/YYYY/MM/DD/slug/` by **creation date** (immutable home). Each work self-contained: `item.json` + `body/` + `images/` + `audio/` + `video/` + `extras/` |
| D11 | Content format | Structured **JSON** documents (+ image/audio/video assets); system renders them into themed components. No HTML/Markdown. Story bodies = block arrays. Renders web **and** mobile. |
| D12 | Publishing | **Scheduled auto-publish** — `publishAt` flips items (and individual chapters) "coming soon" → live |
| D13 | Content index | **DynamoDB `Content`** table indexes all items (status, dates, accent, section, chapter availability) and drives listings |
| D14 | IaC | **AWS CDK** (TypeScript) → synthesizes CloudFormation; existing CFN migrated in |
| D15 | Budget | Lowest-cost / scale-to-zero first; ~$10/mo ceiling now; non-AWS OK if cheaper & capable |
| D16 | Per-item immersive theming | Persistent nebula bg never resets; each item's `accent` (authored or auto-extracted from cover) gently bleeds into bg + accents on its page. Overall look unchanged. Intensity: **noticeable but gentle**, tunable. |
| D17 | Nebula rendering | **Layered CSS/SVG radial-gradient gas + grain**, slow GPU-friendly drift. Pauses on hidden tab, honors `prefers-reduced-motion`, lightens on low-power/mobile. WebGL upgrade later possible. |
| D18 | Login UI | **Custom jewel-themed** sign-in/up screens on Cognito (via Amplify Auth) |
| D19 | Notifications | Follow → release alerts via **SES email** first (push later). Doubles as the Monday newsletter engine. |
| D20 | Search | **Client-side Fuse.js** over a generated index JSON first; **Algolia / OpenSearch Serverless** later |
| D21 | Authoring = automation, **no admin panel** | A new work arrives as one structured folder (with `item.json`); `content-sync` auto-ingests to the DB; `scheduler` auto-publishes. Hands-off, no admin UI. |
| D22 | Self-contained works, append-only | Each folder holds only its **own** parts. A separate related work (album, sequel, adaptation) is its **own dated entry** — old folders are never reorganized. Permanent unique `id` per work. |
| D23 | `Relations` link table | Edge table `fromId, toId, type` (`soundtrack-of`, `sequel`, `from-story`, `in-world`…), auto-built from `item.json.related[]`. Bidirectional. |
| D24 | Engagement state tables | `Users`; `Likes` (+ cached `likeCount` on Content); `Progress`; `Comments` (text+rating); `Follows` (reverse-indexed for release emails). Join-table pattern. |
| D25 | Events / interactions log | Append-only stream of every interaction (logged-in + anonymous `sessionId`) → **S3 + Athena** (not DynamoDB). Powers analytics/recs/history. Requires a **cookie/consent notice**. |
| ~~D26~~ | Multi-language / translations | **Deferred — out of scope for now.** Revisit later as a same-work / language-variant model. Not built initially. |
| D27 | Serialized chapters | Each chapter has its own `publishAt`/status (live / scheduled / writing). Scheduler flips chapters individually. Content index caches `chaptersLive/Total/nextChapterAt`. "New this week"/Monday newsletter derive from chapters released that week. |

---

## 3. Phase roadmap & build order

Design is done up front (this doc). **Building** happens in shippable steps:

| Step | Name | Backend? | Ships |
|---|---|---|---|
| **0** | Foundation | No | Monorepo (pnpm+Turborepo); `visurena-next`→`apps/web`; `design-tokens / ui / core / config` packages; CDK skeleton |
| **1** | Redesign + nebula | No | "The Studio" look, nebula bg, per-item immersion, all pages — reading a **local JSON content layer**; deploy to existing S3/CloudFront |
| **2** | Content infrastructure | Yes | S3 content bucket, `Content`+`Relations` tables, `content-sync`, EventBridge scheduler, scheduled publishing live |
| **3** | Accounts & login | Yes | Cognito + custom jewel login + `Users` profiles |
| **4** | Engagement + analytics | Yes | Likes, progress, comments/ratings, follows + SES notify; `Events` log → S3/Athena; consent notice |
| **5** | Search | Maybe | Fuse.js index (Algolia/OpenSearch later) |
| **6** | Later | — | Expo mobile app (reuses `design-tokens`+`core`); analytics dashboards; optional WebGL nebula |

Maps to the owner's original 5 phases, plus a small Foundation step so the redesign lands on clean rails. Each step is independently shippable.

---

## 4. System architecture (Architecture A — All-AWS serverless)

```
                        ┌─────────────────────────────────────────────┐
                        │                  USERS                       │
                        │        (web today · mobile later)            │
                        └───────────────┬─────────────────────────────┘
                                        │ HTTPS
                        ┌───────────────▼───────────────┐
                        │      CloudFront (CDN/edge)     │
                        └───┬───────────────────────┬────┘
            static pages    │                       │   dynamic calls (JWT)
        ┌───────────────────▼──────┐      ┌─────────▼───────────────────┐
        │   S3 — WEB (Next.js SSG) │      │   API Gateway (HTTP API)    │
        │   homepage, sections,    │      │            +                │
        │   content pages          │      │   Lambda (likes, progress,  │
        └──────────┬───────────────┘      │   comments, follows, me)    │
                   │ reads index           └───┬───────────────┬─────────┘
                   │                           │               │
        ┌──────────▼───────────┐   ┌───────────▼────┐   ┌──────▼──────────────┐
        │  S3 — CONTENT bucket │   │   DynamoDB      │   │   Cognito User Pool │
        │  section/YYYY/MM/DD/  │   │  Content        │   │  Google · Apple ·   │
        │  slug/ (item.json +  │   │  Relations      │   │  Facebook · email   │
        │  body/images/audio/  │   │  Users · Likes  │   │  (AWS stores creds, │
        │  video/extras)       │   │  Progress …     │   │   never us)         │
        └──────────▲───────────┘   └───────▲────────┘   └─────────────────────┘
                   │                        │
        ┌──────────┴───────────┐   ┌────────┴─────────────┐
        │  content-sync        │   │  EventBridge (cron)  │
        │  (S3 ↔ Content/Rel)  │   │  → Lambda: flip       │
        └──────────────────────┘   │  works + chapters     │
                                    │  live on publishAt    │
                                    └──────────────────────┘

   Events: interactions → Kinesis Firehose → S3 → Athena (analytics, recs, history)
   Search: index JSON in S3 + client Fuse.js → OpenSearch/Algolia later
   Notify: chapter/work goes live → Lambda → SES email to followers (Monday newsletter)
   CI/CD: GitHub Actions → build web → deploy S3 → invalidate CloudFront
   IaC:   AWS CDK (TypeScript) in /infra → synthesizes CloudFormation
```

**Flow:** Public pages are static, cached at the edge, and read the `Content` index (built
at deploy + a JSON snapshot in S3) to know what's live. Content bodies are JSON in the
content S3 bucket, rendered into themed components. Personal actions happen after login —
the browser calls the Lambda API with a Cognito JWT. EventBridge flips works *and
individual chapters* live on their dates and triggers follower emails. Every interaction
is logged to the Events stream for analytics.

---

## 5. Repository structure (monorepo: pnpm + Turborepo)

```
visurena/                      ← monorepo root
├─ apps/
│  ├─ web/                     ← Next.js site, rebuilt to the new design (was visurena-next)
│  └─ mobile/                  ← React Native / Expo app (Phase 6; stub initially)
├─ packages/
│  ├─ design-tokens/           ← jewel palette, type scale, spacing, motion  (web + mobile)
│  ├─ ui/                      ← shared React components
│  ├─ core/                    ← content types, API client, hooks (framework-agnostic)
│  └─ config/                  ← shared tsconfig / eslint / tailwind preset
├─ services/
│  ├─ api/                     ← Lambda handlers (likes, comments, progress, follows)
│  ├─ content-sync/            ← S3 content ⇄ Content/Relations index
│  └─ scheduler/               ← EventBridge publish-flip (works + chapters) + notify
├─ infra/                      ← AWS CDK (S3, CloudFront, Cognito, DynamoDB, API GW, EventBridge, Firehose)
└─ content-local/              ← local-only test mirror (real source of truth = S3)
```

Cross-platform hinge: `packages/design-tokens` + `packages/core` are imported by **both**
`apps/web` and `apps/mobile`. Only tokens + logic are shared; UI is re-implemented natively
in React Native.

---

## 6. Content infrastructure

### 6.1 Folder layout (one self-contained, append-only folder per work)

```
s3://visurena-content/
└─ stories/2026/03/19/the-lantern-mile/        ← section / creation-date / slug  (id: sto_LM)
   ├─ item.json          ← the manifest: ALL metadata, schedule, accent, chapters, related[]
   ├─ body/   01.json 02.json …   ← chapter text as block arrays
   ├─ images/  cover.jpg  social.jpg  inline-01.jpg
   ├─ audio/
   │  ├─ audiobook/01.mp3 …   music/theme.mp3
   ├─ video/   clip.mp4
   └─ extras/
```

- Folder sharded by **creation date** (immutable home); a year/month/day tree keeps any
  prefix small. S3 itself has no folder limits — this is for tidiness + listing.
- Related works made later are **their own dated entries**, linked via `Relations` (never
  nested, old folders never reorganized).

### 6.2 `item.json` manifest (single source of truth, robot-readable)

```json
{
  "id": "sto_LM",
  "section": "stories",
  "slug": "the-lantern-mile",
  "status": "scheduled",                       // draft | scheduled | live
  "createdAt": "2026-03-19",
  "publishAt": "2026-03-19T08:00:00Z",
  "genre": "Horror",
  "accent": { "primary": "#7c8fa8" },          // immersion color (or auto from cover.jpg)
  "cover": "images/cover.jpg",
  "tags": ["horror", "road"],
  "credits": { "author": "…", "narrator": "…", "composer": "…" },

  "title": "The Lantern Mile",
  "summary": "…",

  "chapters": [
    { "n": 1, "title": "…", "body": "body/01.json",
      "audiobook": "audio/audiobook/01.mp3", "publishAt": "2026-03-19T08:00:00Z" },
    { "n": 6, "publishAt": "2026-05-25T08:00:00Z" },     // upcoming (Monday)
    { "n": 7, "status": "writing" }                       // not scheduled
  ],

  "related": [ { "toId": "mus_LT", "type": "soundtrack" } ]
}
```

### 6.3 Automation (hands-off)

```
Drop folder in S3 ──▶ content-sync (S3 event → Lambda)
                        • reads item.json
                        • upserts Content index (incl. chapter availability)
                        • writes Relations edges (both directions) from related[]
                        • refreshes the public index JSON snapshot

EventBridge cron ──▶ scheduler (Lambda)
                        • flips works & chapters live when publishAt ≤ now
                        • triggers SES emails to followers (Monday newsletter)
                        • refreshes index snapshot / CloudFront invalidation
```

### 6.4 Render pipeline
- **Listing pages** (homepage rows, sections, shelves): Next.js reads the `Content` index at
  build → themed cards. Scheduled flips refresh the snapshot.
- **Detail pages**: app provides the themed shell (chrome, chapter nav, like button); the
  JSON body renders into themed components with the item's accent immersion.
- **Local mode**: dev reads from `content-local/` — write & preview with zero AWS.

### 6.5 Generation output → site contract (the normalizer)

The story-engine **drops a richer, engine-shaped folder** than the target §6.1 layout. Observed
drop (`website_data/stories/2026/05/25/20260525141829_short/`):

```
20260525141829_short/                 ← folder name = <UTCstamp>_<kind>
├─ slack-water.json    ← rich generation record: content + heavy craft metadata
├─ slack-water.md      ← rendered prose (title + genre line + prompt blockquote + prose)
├─ timing.jsonl        ← per-event generation telemetry
└─ timing.txt          ← human-readable timing summary
```

- The `<slug>.json` / `<slug>.md` **filename is the slug** ("Slack Water" → `slack-water`).
- `slack-water.json` is a **superset** — alongside the content it carries deck-engine, MICE,
  craft, frame, characters, locations, causality, etc. The **site consumes a thin projection**;
  the rest is reserved for the Research/field-notes surface (the transparency angle, BRD §data-ethics).

**Projection (generation JSON → `item.json` / `ContentItem`):**

| Site field | From generation | Notes |
|---|---|---|
| `id` | `id` | e.g. `20260525141829_short-mystery-slack-water` (prefix `sto_` optional) |
| `slug` | `<slug>.json` filename / `title` | |
| `kind` | folder suffix `_short` / `tier.id` | `short \| novel \| series` — see 6.6 |
| `section` | constant `stories` | |
| `title`, `genre` | `title`, `genre` | |
| `summary` | `logline` (fallback `promise`) | card/hero blurb |
| `createdAt`, `publishAt` | `created_at` | ISO |
| `readMinutes`, `wordCount`, `sceneCount` | `totals.{read_minutes,word_count,scene_count}` | |
| `tags` | `reedsy_tags` | |
| **body** | `scenes[]` (`.title`, `.prose`) — fallback top-level `prose` | the reader's source |
| `accent` | — *(not emitted)* | auto-derived from cover, or sidecar override (6.8) |
| `cover` / `hero` | — *(not emitted)* | **you provide** (6.8) |

**Two ways to bridge** engine output to the §6.2 `item.json` contract:
- **(A)** the engine emits a compliant `item.json` + `body/` + `images/` (the §6.1 layout) — preferred end-state.
- **(B)** the platform runs a **normalizer** at build/ingest that reads the rich JSON and produces
  the thin projection in memory — used now for local mode (no persisted `item.json` required).

### 6.6 Content kinds (short vs novel / web-series)

| Kind | Structure | Reader | Release |
|---|---|---|---|
| **short** | one chapter | **one continuous read**; `scenes[]` render as in-page section breaks (✦ / rule), no chapter index | published whole |
| **novel** / **web-series** | `chapters[]`, each its own body + `publishAt` | chapter-paginated; reuses the `[slug].tsx` chapter index | **chapter-level release (Monday drops) — deferred to a later pass** |

`kind` comes from the folder suffix (`_short`) / `tier`; it selects which reader renders. Shorts are
the only kind wired now; chapter scheduling for novels/series is the next iteration.

### 6.7 Source provider — local ↔ S3 (build-time switch)

The site is **static-export**, so *all* content is resolved during `next build` — the "switch
between local and S3" is a **build-time env flag**, not a runtime toggle. One provider module
(`apps/web/lib/content.ts`, extended) exposes `getStories()` / `getStory(slug)` returning the
normalized projection + body and **hiding the source** so pages are source-agnostic.

```
VR_CONTENT_SOURCE   = local | s3        # default: local (dev)
VR_CONTENT_LOCAL_DIR = D:\…\website_data # drop root, read in place (alpha-local)
VR_CONTENT_S3_BUCKET = visurena-content-alpha   # us-west-2 (prod: visurena-content-prod)
VR_CONTENT_S3_REGION = us-west-2
VR_CONTENT_BASE_URL = https://content.visurena.com   # CDN base for asset URLs (s3/prod)
```

- **local**: walk `<dir>/stories/**/<id>/`, normalize each, and **copy referenced assets** into
  `apps/web/public/stories/<slug>/…` (**resizing + converting to WebP** so the static `out/` ships
  optimized files even though the engine drops ~2 MB PNGs); asset `src` = `/stories/<slug>/cover_34.webp`.
- **s3**: `pnpm content:pull` (`scripts/pull-content.mjs`) runs `aws s3 sync s3://<bucket> → apps/web/.content-cache`
  (us-west-2, **download-only**), then the **same walker** reads the cache and copies covers into `public/` — so
  an S3 build needs no AWS SDK and no CloudFront yet. Run it before `next build` for an S3-sourced build.
  *(Future optimization: serve covers from CloudFront `content.visurena.com` instead of bundling them.)*
- Provider **caches once per process** (no per-request re-scan). Pick up new content by restarting dev / rebuilding.
- Both yield identical `ContentItem[]`. The drop folder, `apps/web/.content-cache/`, and `apps/web/public/stories/`
  are **git-ignored** (staging/cache, not committed) — prod content of record lives in S3.

### 6.8 Asset requirements (what you provide per story) — the covers

Generation emits **no imagery**; covers (and therefore the immersion accent) come from you now, an
image pipeline later. Per story, drop into the story folder under `images/`:

| File (engine convention) | Aspect | Recommended | Minimum | Used by |
|---|---|---|---|---|
| `images/cover_34.{png\|webp\|jpg}` | **3 : 4** portrait | 1200 × 1600 | 900 × 1200 | **primary** — cards, featured poster, trending, related (the thumbnail) |
| `images/cover_169.{png\|webp\|jpg}` | **16 : 9** landscape | 1920 × 1080 | 1600 × 900 | *optional* — single-story hero bg + any landscape/16:9 surface |
| `images/social.{png\|webp\|jpg}` | **1.91 : 1** | 1200 × 630 | — | *optional* — OpenGraph / share card |

- **Shape policy:** `cover_34` (3:4) is the one required image and drives every card/poster. If a
  `cover_169` (16:9) is also supplied the provider **uses both** — 3:4 for portrait surfaces, 16:9
  for the hero/landscape — otherwise the hero focal-crops the 3:4 cover. (Story cards stay 3:4; no
  card rework. Video sections like Movies/Music remain 16:9 from YouTube.)
- **Format:** PNG, JPG, or WebP accepted as input (sRGB). Engine drops raw PNGs (~2 MB) — fine; the
  **local provider resizes + converts to WebP** when copying into `public/stories/<slug>/`, so the
  static `out/` ships optimized files regardless of the source format.
- **Accent** auto-derives from the cover's dominant color. To override, add `"accent": "#RRGGBB"`
  to a sidecar `meta.json` in the story folder (or have the engine emit it).
- Filenames are **conventional** (`cover_34` / `cover_169` / `social`) so the provider finds them with no manifest.
- **Minimum to render a story:** just `images/cover_34.*`. Everything else has a sensible fallback.

### 6.9 Release date & scheduling

**Current behavior — publish on build.** Every story dropped into the source is treated as **live**:
the normalizer sets `status = live` and `publishAt = created_at`, so it appears the next time the site
builds. No scheduling input is required, and there's no separate release-date field to fill in yet.

**Deferred (revisit later).** Where the release date lives and how scheduling works is intentionally
**TBD** — we'll decide the field's home (engine-emitted vs sidecar vs index) when we need it. The
machinery is already half-there for when we do: `@visurena/core` ships `selectLive(items, now)` (gates on
`status:live && publishAt ≤ now`), and because the site is static-export, enforcement is **build-time** —
a future-dated item simply isn't written into `out/` until a (scheduled) rebuild runs, so nothing leaks.
Per-chapter release for novels/series rides on the same mechanism, deferred with chapter handling.

---

## 7. Visual design & theming (Phase 1)

- **Pages:** Homepage (status bar → header → hero → "New this week" → trending → genre
  shelves → continue → Monday newsletter → footer); section pages (Stories live;
  Movies/Music/Games "coming soon"; Research); detail pages (story reader, film/album/game,
  article).
- **Components** (`packages/ui`): `NebulaBackground`, `ThemeProvider`, `TopStatusBar`,
  `Header/Nav`, `Hero`, `ContentCard`, `CardRow`, `TrendingList`, `ShelfCard`,
  `NewsletterCTA`, `Footer`, `Reader`, `SignInButton` (placeholder in Phase 1).
- **Design tokens** (`packages/design-tokens`): jewel palette, section→stone map; serif
  display + JetBrains Mono labels + body face; motion durations/easings.
- **Nebula background:** one persistent layer; color from `ThemeProvider` (section tone →
  bleeds toward open item's accent — D16). Slow CSS/SVG gradient drift + grain.
  Performance-safe (D17).
- **Responsive:** mobile-first; nav collapses, card rows swipe/stack, nebula lightens.

---

## 8. Data model

**State layer (DynamoDB — drives the UI, fast):**

| Table | Key fields | Purpose |
|---|---|---|
| `Content` | id, section, slug, status, dates, accent, chapter availability, `likeCount` | every work; listings & detail |
| `Relations` | fromId, toId, type | links: soundtrack, sequel, from-story, in-world |
| `Users` | id (Cognito sub), name, avatar, prefs | accounts |
| `Likes` | userId, contentId, createdAt | who liked what (+ counter on Content) |
| `Progress` | userId, contentId, {chapter, %} | continue reading |
| `Comments` | contentId, userId, text, rating, ts | comments & ratings |
| `Follows` | userId, targetId (reverse-indexed) | follows → release emails |

**Events layer (S3 + Athena — analytics, infinite/cheap):**

| Stream | Fields | Purpose |
|---|---|---|
| `Events` | who(userId/sessionId), ts, type, target, context | append-only interaction log → analytics, recs, history |

State = "what's true now." Events = "what happened, when." Both feed the platform.

---

## 9. Authentication (Phase 3)

- **Cognito User Pool**: email/password + federated Google, Apple, Facebook.
- **Security:** AWS stores/verifies credentials (we never see passwords); email verification,
  strong password policy, optional MFA, HTTPS-only, JWT-protected APIs, least-privilege IAM,
  secrets in AWS Secrets Manager.
- **Token flow:** Cognito JWT → API Gateway Cognito authorizer → Lambda.
- **Profile:** `Users` row created on first login via a Cognito post-confirmation trigger.
- **Cost:** free under ~50k monthly active users.

---

## 10. Search (Phase 5)

- **Start:** generate a search-index JSON (titles, summaries, tags, genre, people)
  from the `Content` index → client-side **Fuse.js** (already a dependency). $0, instant.
- **Scale:** move to **Algolia** (free tier) or **OpenSearch Serverless** for full-body,
  ranked, faceted search across thousands of items.

---

## 11. Cost estimate (low traffic, monthly)

| Service | Est. |
|---|---|
| S3 + CloudFront (web + content) | ~$1–3 |
| DynamoDB (on-demand) | ~$0–1 |
| Lambda + API Gateway | ~$0–1 |
| Cognito | $0 (<50k users) |
| EventBridge / SES / Firehose / Athena | ~$0–1 |
| **Total** | **~$2–6/mo**, scales to near-zero when idle |

Under the $10 ceiling; search starts free; analytics is pennies-per-query.

---

## 12. Risks & mitigations

- **Monorepo migration** (touching the live app) → isolated Foundation step; keep deploy
  green; verify build before moving on.
- **Static ↔ scheduled-publish seam** → index-JSON snapshot + targeted CloudFront
  invalidation instead of full rebuilds where possible.
- **DynamoDB analytics weakness** → raw events go to S3 + Athena, not DynamoDB.
- **Auth** → lean entirely on Cognito; never store passwords; rate-limit; least-privilege.
- **Privacy** (Events tracking) → cookie/consent notice + data minimization from day one.
- **Cross-platform expectation** → only tokens + core logic shared web↔mobile; UI
  re-implemented in React Native.
- **JSON authoring friction** → validated schema + `content-local`; AI generates folders.

---

## 13. Change log

| Date | Change |
|---|---|
| 2026-05-23 | Initial draft. Locked D1–D15; Architecture A, system diagram, monorepo. |
| 2026-05-23 | Revised D10/D11: content is structured **JSON** (+ assets), system renders it. Added D16 (per-item immersive theming). |
| 2026-05-23 | §C visual. Immersion = noticeable-but-gentle (tunable). Added D17 (nebula = CSS/SVG). |
| 2026-05-23 | §D. Added D18 (custom Cognito login), D19 (SES notifications), D20 (Fuse.js→hosted search). |
| 2026-05-23 | §E. Dropped admin panel (full automation). Added D21 (folder ingestion, no panel). |
| 2026-05-23 | Content model: date-sharded folders (D10); D22 (self-contained, append-only works); D23 (`Relations` table). |
| 2026-05-23 | Data model: D24 (engagement state tables), D25 (Events log → S3/Athena). |
| 2026-05-23 | Added D27 (serialized chapters). **Finalized full design document** (sections §1–§12 fleshed out). Status → design complete, pending owner review. |
| 2026-05-23 | Owner: **deferred multi-language (D26) — out of scope for now**; kept serialized chapters (D27). Stripped per-language fields from folder layout, `item.json`, data model, and search index. |
| 2026-05-23 | Moved `ARCHITECTURE.md` + `CLAUDE.md` into `visurena/` (the git repo) for version control. Corrected stale CLAUDE.md content (JSON not HTML; status → design approved). |
| 2026-05-23 | Built Step 0 (monorepo) + Step 1 homepage: design-tokens, core content layer, ui (theme, nebula, chrome, cards), redesigned homepage reading the content layer. 16 tests passing; static export green. |
| 2026-05-23 | Phase 1b: ported "The Studio" template (`visurenawebtemp`) into the app — full homepage + Stories/Movies/Music/Research section pages. Added 12 studio motion components to `@visurena/ui` (VRRowHeader, VRPoster, VRTilt, VRFade, VRSplitText, VRCounter, VRMarquee, VRShaderBg, VRCursorDot, VRScrollProgress, VRMagnetic, VRStripe). `@visurena/ui` now declares `next` as a peer dependency (it uses `next/link`). Static export of 26 pages green; all tests green. |
| 2026-05-23 | UI fix (owner feedback): removed the custom cursor dot (`VRCursorDot` unmounted). Made the nebula-gas galaxy (D17) actually visible on every page — richer 4-cloud + starfield nebula tinted by section accent, and page wrappers/section fills made transparent/semi-transparent so the drifting gas shows through (previously hidden behind opaque section backgrounds). |
| 2026-05-23 | UI polish (owner feedback): home now has its own identity — `NebulaBackground variant="studio"` paints all four jewels at once (vs mono-tint section pages). Added depth pass (Netflix-style): card hover lift+scale+elevation, cursor-parallax on the nebula gas layer, header depth shadow + stronger blur. Sticky-footer fix (`.vr-app`) removes the bottom gap on short pages (research). Removed "Hyderabad, India" from footer + research copy. Motion scoped to fine-pointer + reduced-motion aware. |
| 2026-05-23 | Fixed broken Stories access: story cards linked to `/stories/[slug]` but that page didn't exist (every story 404'd). Built `stories/[slug].tsx` (hero w/ per-story tint, chapter index, reader's notes, related, newsletter) with `getStaticPaths` over all 12 story slugs; static export now 38 pages. Genre-shelf links repointed to `/stories#<id>` (were 404). |
| 2026-05-24 | Frontend audit + fixes. **Mobile was fully broken**: the responsive `[style*="grid-template-columns: …"]` overrides never matched because React serializes inline styles with NO space after the colon — corrected all selectors + broadened coverage (poster grids → 2-up on phones; chapter/essay rows compacted). Mobile section nav was `display:none` with no fallback → now a horizontally-scrollable nav row. Accessibility: added keyboard `:focus-visible` rings (none existed), accent text selection, 44px touch targets, and completed reduced-motion coverage. |
| 2026-05-25 | §6 content contract for **generated stories**: documented the real story-engine drop (`<stamp>_<kind>/<slug>.json`+`.md`+`timing.*`) and its projection → `item.json`/`ContentItem` (6.5); content **kinds** — short = one continuous read, novel/web-series = chapter-released later (6.6); **local↔S3 build-time provider** with `VR_CONTENT_*` env (6.7); **asset/cover spec** the author supplies — `images/cover` 3:4 (required), optional `wide` 16:9 + `social`, provider uses both shapes, accent auto-from-cover (6.8); **release/scheduling** — for now everything publishes on build (`status:live`, `publishAt=created_at`); where the release-date field lives is **deferred/TBD**, `selectLive` + build-time gating ready for when we need it (6.9). Confirmed local↔S3 is a one-env-flag swap behind a stable `getStories()` interface (S3 provider is the only net-new piece). |
| 2026-05-25 | **Stories wired to real content (end-to-end slice).** `apps/web/lib/content.ts` is now a build-time provider: scans the local drop (`VR_CONTENT_LOCAL_DIR`, default `../website_data`), normalizes the rich generation JSON → `Story`/`StoryFull` (per 6.5), copies `cover_34`/`cover_169` into `public/stories/<slug>/` (git-ignored). Rewrote `/stories` (real masthead/featured/catalogue) and `/stories/[slug]` (continuous reader: hero → scenes as ✦ breaks → about → related) — all hardcoded `VR_STORIES*`/trending/continue/shelves removed. Home story deep-links repointed to `/stories` to avoid 404s (full home de-fake still TODO). Build green: 27 pages (was 38), `/stories/slack-water` renders the prose + covers; 4 tests pass. Orphaned `content-local/stories.json` (old placeholders) now unused — safe to delete. |
| 2026-05-24 | Visual-craft pass (autoresearch-led, per the award-winning playbook): typographic polish (`text-wrap: balance` headings / `pretty` paragraphs, optical sizing, kerning + ligatures, optimizeLegibility); premium thin accent scrollbar; animated grow-from-left underlines on inline links (`.vr-ulink`, applied in footer w/ muted secondary color); gallery-style `VRPoster` (inset frame ring, richer cinematic scrim, photo zooms on card hover via `.vr-poster-img`). Fixed `<title>` nodes that mixed text + `&mdash;` (hydration warning) → single text nodes. Build green (38 pages). |
