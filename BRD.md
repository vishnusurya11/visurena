# ViSuReNa — Business Requirements Document

| | |
|---|---|
| **Version** | 1.3 |
| **Status** | Draft — Phase 0 (Brand & Foundation) |
| **Last updated** | 2026-05-09 |
| **Owner** | Vishnu (sole contributor as of v1.0) |
| **Canonical URL** | This file in the platform repo: `BRD.md` |
| **Cross-repo reference** | Other repos in the ViSuReNa ecosystem MUST link to this document at the pinned commit they were built against |

> This document is the **single source of truth** for the ViSuReNa product vision, system architecture, and cross-repo contracts. If anything in any ViSuReNa repo conflicts with this document, this document wins. Update this document FIRST, then propagate.

---

## Table of contents

0. [Document conventions](#0-document-conventions)
1. [Executive summary](#1-executive-summary)
2. [Background & motivation](#2-background--motivation)
3. [Vision & objectives](#3-vision--objectives)
4. [Users & stakeholders](#4-users--stakeholders)
5. [Scope](#5-scope)
6. [The flywheel — functional model](#6-the-flywheel--functional-model)
7. [System architecture — the four-repo system](#7-system-architecture--the-four-repo-system)
8. [Component specifications](#8-component-specifications)
9. [Data model & schemas — the contract](#9-data-model--schemas--the-contract)
10. [Storage layout — S3](#10-storage-layout--s3)
11. [Integration & handoff flows](#11-integration--handoff-flows)
12. [Infrastructure ownership](#12-infrastructure-ownership)
13. [CI/CD strategy](#13-cicd-strategy)
14. [Phases & roadmap](#14-phases--roadmap)
15. [Success metrics](#15-success-metrics)
16. [Non-functional requirements](#16-non-functional-requirements)
17. [Data, privacy, ethics](#17-data-privacy-ethics)
18. [Membership & monetization](#18-membership--monetization)
19. [Open questions & risks](#19-open-questions--risks)
20. [Glossary](#20-glossary)
21. [Appendix A — Example schemas](#appendix-a--example-schemas)
22. [Appendix B — Concrete handoff walkthrough](#appendix-b--concrete-handoff-walkthrough)
23. [Appendix C — New content engine bootstrap checklist](#appendix-c--new-content-engine-bootstrap-checklist)
24. [Appendix D — Brand visual identity](#appendix-d--brand-visual-identity-aurora-indigo-locked-v1)

---

## 0. Document conventions

- **MUST / SHOULD / MAY** are used in the RFC-2119 sense.
- **Repo names** are written in `code-formatting`: e.g. `visurena-platform`, `visurena-blog-engine`.
- **Surface** = a consumer-facing app (web, iOS, Android, TV, VR). Plural: surfaces.
- **Content engine** = a repo that generates one type of content.
- **Schema** = a JSON Schema file in the platform repo's `schemas/` directory. The contract.
- **Manifest** = a single JSON file in S3 listing all currently live content.
- All dates in `YYYY-MM-DD` format. All times in UTC unless otherwise stated.
- Versioning: this document uses semantic versioning. Breaking changes to schemas or the handoff contract bump the major version.

---

## 1. Executive summary

**ViSuReNa is a demand-driven AI content studio where the audience tells us what to make, and we make it — chapter by chapter, track by track, scene by scene.**

ViSuReNa **looks and feels** like a streaming platform (in the family of Mubi, Apple TV+, Netflix), but the underlying product is fundamentally different: instead of a fixed catalog distributed to a passive audience, the catalog is **co-created with the audience using AI as the production engine**.

The system is composed of:
- One **platform repo** — surfaces (web/mobile/TV/VR), schemas, infrastructure, data collection
- Multiple **content engine repos** — one per medium (blog, story, music, film, game), each generating conformant content
- One **orchestration repo** — editorial calendar, decides when and what goes live
- One **analytics repo** — processes user signal, identifies demand clusters, feeds insights back

All repos communicate through a single set of versioned schemas and an S3-based content store with a manifest index.

---

## 2. Background & motivation

### 2.1 The gap

The current AI content market splits into two camps, both flawed:

1. **Generate-first platforms** (most "AI content" startups) flood the world with generated material, then hope an audience finds it. Hit rates are abysmal because there is no demand signal.
2. **Traditional content platforms** (Netflix, Wattpad, Spotify) have rich audience data but can't translate it into production at scale because human creation is expensive and slow.

ViSuReNa occupies the gap: **capture taste first, then generate against it**. AI removes the production cost; user-supplied taste removes the demand-discovery cost.

### 2.2 The defensible insight

Three consequences of capturing taste first:

1. **Cheaper to make.** We know it'll resonate before we ship it.
2. **Stickier audience.** Users have skin in the game — they shaped it.
3. **Proprietary taste data.** Nobody else has it. The data appreciates faster than any individual piece of content does.

### 2.3 Why now

- Generative AI quality crossed the threshold for prose, music, and short video in 2024–2025.
- Hosted-API pricing (OpenAI, Anthropic, Replicate) collapsed the per-piece production cost to fractions of cents.
- Audiences are increasingly comfortable with AI-assisted content when the human editorial layer is visible.
- Static-site + serverless infrastructure makes the operational floor near-zero ($1–$10/mo until product-market fit).

---

## 3. Vision & objectives

### 3.1 Three-year vision

By end of Year 3, ViSuReNa is:
- A multi-surface platform (web + mobile + TV + early VR) with a global audience in the tens of thousands
- Producing original chapters, tracks, and short films across at least three mediums, all seeded by audience demand
- Generating recurring revenue from a tiered membership model
- Recognized in the AI-content space as the rare project that combines audience data, AI generation, and editorial discipline

### 3.2 Phase 0 objectives (current)

- Establish brand identity and visual language distinct from any existing streaming platform
- Ship a recommendation-intake home page that collects taste signal from day one
- Stand up the multi-repo architecture so content engines can be built in parallel
- Maintain near-zero operational cost (< $5/mo)

### 3.3 Non-objectives

- We are not building a content marketplace, social network, or general-purpose recommendation API.
- We are not training custom foundation models.
- We are not building tooling for other companies — every component serves ViSuReNa first.

---

## 4. Users & stakeholders

### 4.1 User segments

| Segment | Who | What they want | How we serve them |
|---|---|---|---|
| **Curious browsers** | First-time visitors | "What is this?" answered in 5 seconds | Clear hero, intake prompt, showcase row |
| **Engaged taste-givers** | Returning visitors | Recommendations they trust, see the engine learning | Personalized recs, taste profile, weekly emails |
| **Crowd participants** | Members reading/watching/listening to ViSuReNa Originals | Influence over what gets made next | Feedback widgets, voting, transparency on which inputs were applied |
| **Technical observers** | Devs, AI researchers, builders following the journey | Insight into how it's built | Research blog, monthly transparency reports |

### 4.2 Internal stakeholders

- **Owner / Editorial Director** (currently sole contributor): final editorial veto on all content; sets phase commitments
- **Future creative director** (Phase 3+): owns story/script/music direction once first novel succeeds
- **Future engineering team** (Phase 3+): owns generation pipelines as they scale

---

## 5. Scope

### 5.1 In scope (Phases 0–3)

- Multi-surface platform (web first; mobile/TV/VR scaffolds at Phase 3+)
- Recommendation-intake flow + taste profile + per-rec feedback
- Curated catalog of ~500 existing media items for initial recommendations
- One content engine per medium (blog, story, music, film, game)
- Orchestration layer (release calendar, manifest gating)
- Analytics layer (demand-cluster identification, public dashboards)
- Membership tiers and payment integration (activates end of Phase 3)
- Schemas, S3 layout, and CI/CD across all repos

### 5.2 Explicitly out of scope (now)

- General-purpose recommendation API for other companies
- User-uploaded content
- Creator marketplace
- Live streaming
- Social features (followers, DMs, etc.)
- Gamification (streaks, points, badges) beyond minimal voting
- Multi-language at launch — English only; internationalize after Phase 3
- Blockchain / NFT / token integration of any kind
- Custom-trained foundation models — hosted APIs only
- Self-hosted GPUs

Default for any feature not in 5.1 is **no**. Any item from 5.2 may be revisited if the data demands it; the default remains no.

### 5.3 Future scope (Phase 4+)

- Multi-medium expansion: music → short video → long film → VR
- International language support
- Mobile and TV apps as first-class surfaces
- Revenue-share models with collaborating studios
- Public taste-data APIs for the research community (anonymized only)

---

## 6. The flywheel — functional model

```
  taste capture  →  recommendation  →  aggregated demand
        ↑                                    ↓
    membership  ←  multi-medium  ←  crowd-steered generation
```

### Loop steps

1. **Taste capture** — a user lands on a surface, tells ViSuReNa what story / film / song / game they love and **why** (theme, emotional beat, structural element). Saved to `s3://visurena-data/taste-inputs/`.
2. **Recommendation** — surfaces present matching items from the curated catalog. Builds trust before original content exists.
3. **Aggregated demand** — analytics processes taste-inputs, surfaces patterns ("23% want slow-burn sci-fi mystery with a queer protagonist"). Output: `s3://visurena-analytics/demand-clusters/`.
4. **Crowd-steered generation** — orchestration picks a high-demand cluster, commissions a content engine to generate. Engine produces conformant JSON, uploads to S3.
5. **Release** — orchestration sets the release date in the manifest. Manifest update triggers platform rebuild. Item goes live on schedule.
6. **Audience reaction** — users react chapter-by-chapter (or track/scene/level). Reactions saved to `s3://visurena-data/feedback/`.
7. **Selective incorporation** — orchestration + editorial decide which feedback signals to act on. Some are honored (genre direction, emotional beats); some are ignored (incoherent crowd pull). Editorial veto retained. **Crowd-steered, not crowd-written.**
8. **Multi-medium expansion** — same loop, applied successively: text → music → short video → long video → VR.
9. **Membership** — tiered subscription monetizes the engaged subset.

---

## 7. System architecture — the four-repo system

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   visurena-platform  (THIS REPO)                                           │
│   ──────────────────                                                       │
│   • All consumer surfaces (web, ios, android, tv, vr)                      │
│   • All schemas (the contract)                                             │
│   • All infrastructure (CloudFormation/CDK for the entire ecosystem)       │
│   • Data collection endpoints (taste inputs, feedback, votes, events)      │
│                                                                            │
│            owns infra used by ▼      writes user data to ▼                 │
└────────────────────────────────────────────┬──────────────────────────────┘
                                              │
   ┌──────────────────────┐    ┌──────────────┴────────────┐    ┌────────────────────┐
   │ CONTENT ENGINE REPOS │    │     S3 BUCKETS            │    │ ORCHESTRATION REPO │
   │ (one per medium)     │    │                           │    │                    │
   │ • blog-engine        │───▶│  visurena-content/        │◀───│ • Release calendar │
   │ • story-engine       │    │  visurena-data/           │    │ • Decides WHEN     │
   │ • music-engine       │    │  visurena-analytics/      │    │   content goes     │
   │ • film-engine        │    │                           │    │   live             │
   │ • game-engine        │    └──────────────┬────────────┘    │ • Owns manifest    │
   │                      │                   │                 │   release-gate     │
   └──────────────────────┘                   │                 └─────────┬──────────┘
                                              │ reads from                │
                                              ▼                           │ reads insights
                                  ┌──────────────────────┐                │ from
                                  │  ANALYTICS REPO      │────────────────┘
                                  │  • Reads user data   │
                                  │  • Athena/Lambda     │
                                  │  • Demand clusters   │
                                  │  • Public dashboards │
                                  └──────────────────────┘
```

### 7.1 Repo responsibilities at a glance

| Repo | Owns | Does NOT own |
|---|---|---|
| `visurena-platform` (this) | Surfaces, schemas, ALL infra (CloudFormation), data-collection APIs | Content generation, release scheduling, analytics processing |
| `visurena-{type}-engine` (×5) | Generation logic for one medium, output validation, S3 upload of own content | Schemas (consumes from platform), manifest, release timing |
| `visurena-orchestration` | Release calendar, manifest release-gate logic, commission triggers to engines | Generation, surfaces, infra |
| `visurena-analytics` | Reading `visurena-data/*`, processing into insights, writing to `visurena-analytics/*` | Generation, surfaces, infra |

### 7.2 Cross-repo invariants

- **Schemas are versioned and live in `visurena-platform/schemas/`.** Every other repo MUST pin a specific commit of the schemas it builds against.
- **All content lands in S3 — never in any repo's git history.** Generated content artifacts are deploy outputs, not source.
- **Only the platform repo owns infrastructure.** Other repos MAY declare what AWS resources they need, but the resources MUST be defined in `visurena-platform/infrastructure/`.
- **Only orchestration writes to `manifest.json`.** Engines write content files; orchestration includes them in the manifest when they go live.

---

## 8. Component specifications

### 8.1 `visurena-platform` (this repo)

**Purpose:** the ecosystem's distribution + display + data-collection layer.

**Top-level structure** (target — current state being migrated):
```
visurena-platform/
├── BRD.md                          ← this document
├── CLAUDE.md                       ← in-repo Claude assistant guidance
├── README.md                       ← short pointer to BRD.md
├── schemas/                        ← THE CONTRACT (consumed by all other repos)
│   ├── blog-post.schema.json
│   ├── story-chapter.schema.json
│   ├── track.schema.json
│   ├── film.schema.json
│   ├── game.schema.json
│   ├── manifest.schema.json
│   └── README.md
├── apps/
│   ├── web/                        ← the Next.js app (renamed from visurena-next/ on 2026-05-09)
│   ├── ios/                        ← Phase 3+
│   ├── android/                    ← Phase 3+
│   ├── tv/                         ← Phase 4+
│   └── vr/                         ← Phase 4+
├── infrastructure/                 ← CloudFormation/CDK for the WHOLE ecosystem
│   ├── content-store.yaml          ← S3 buckets, Lambda manifest-rebuilder
│   ├── data-collection.yaml        ← API Gateway + Lambda + DynamoDB for taste inputs
│   ├── analytics-storage.yaml      ← Athena workgroup, output bucket
│   └── README.md
├── docs/                           ← author guides, reference material
└── .github/workflows/              ← CI/CD for the platform itself
```

**Surfaces requirements:**
- Each surface MUST consume content via the manifest pattern (Section 11).
- Each surface MUST submit user-generated data through the data-collection API.
- Each surface SHOULD share the same accent color and typography family for brand coherence.

**Data collection endpoints (Phase 1+):**
- `POST /api/taste-input` — record a "what I love + why" entry
- `POST /api/feedback` — record per-content reaction
- `POST /api/event` — record interaction events (clicks, dwell time)

All endpoints MUST validate against schemas in `schemas/`.

### 8.2 Content engine repos

**One repo per medium.** Naming: `visurena-{medium}-engine`.

**Required interface (every content engine MUST implement):**

1. **Schema dependency.** Vendor or git-submodule the schemas from `visurena-platform/schemas/` at a pinned commit.
2. **Generation entry point.** A documented command (e.g., `python generate.py --params=...`) that produces output files locally.
3. **Validation step.** Before upload, the engine MUST validate output against the schema. Failed validation = no upload.
4. **Upload step.** Conformant output MUST be uploaded to the designated S3 path (Section 10).
5. **Notification step.** After successful upload, the engine MUST send a `repository_dispatch` webhook to `visurena-platform` with event type `content-published`.
6. **Idempotency.** Re-running with the same inputs MUST produce the same content ID; updates overwrite the same S3 path.

**Required interface (every content engine SHOULD implement):**
- A `generate-and-publish.yaml` GitHub Actions workflow that wraps generation + validation + upload + notify.
- A README that documents inputs, outputs, costs per generation.

### 8.3 `visurena-orchestration`

**Purpose:** the editorial brain. Decides what gets commissioned and when content goes live.

**Responsibilities:**
- Maintains the **release schedule** (which item, on which date, on which surface placements)
- **Commissions content** from engines: triggers engine workflows with parameters derived from analytics demand clusters
- **Owns the manifest release-gate**: an item exists in S3 only becomes visible in `manifest.json` when its release date arrives
- **Communicates with editorial** (currently the owner) for go/no-go on borderline content

**Mechanism:** scheduled Lambdas (EventBridge cron), reading from `visurena-analytics/demand-clusters/`, writing to `visurena-content/manifest.json` and triggering engine workflows via GitHub API.

### 8.4 `visurena-analytics`

**Purpose:** turn raw user data into actionable signals.

**Inputs:** all of `s3://visurena-data/`.

**Outputs:**
- `s3://visurena-analytics/reports/{YYYY-MM-DD}/` — daily reports (private)
- `s3://visurena-analytics/demand-clusters/{YYYY-MM-DD}.json` — top demand patterns (consumed by orchestration)
- `s3://visurena-analytics/public/crowd-dashboard.json` — aggregated, anonymized stats (consumed by surfaces, displayed to users)

**Tooling:** Athena queries on data-bucket Parquet/JSON, scheduled Lambdas for processing, optional QuickSight for internal dashboards.

---

## 9. Data model & schemas — the contract

### 9.1 Principle

**The schema is the contract.** Schemas live in `visurena-platform/schemas/`. Every content engine MUST validate output against the relevant schema. Every surface MUST treat schema-conformant data as the authoritative shape. Schema drift = breakage.

### 9.2 Required schemas

| Schema file | Defines | Owner team (eventually) |
|---|---|---|
| `blog-post.schema.json` | A research / blog article | Engineering |
| `story-chapter.schema.json` | A chapter of a serialized novel | Editorial |
| `track.schema.json` | A music track (single, EP component, album track) | Music engine team |
| `film.schema.json` | A short or long-form film entry | Film engine team |
| `game.schema.json` | A playable game listing | Game engine team |
| `manifest.schema.json` | The shape of `manifest.json` itself | Platform |
| `taste-input.schema.json` | A user's "what I love + why" submission | Platform |
| `feedback.schema.json` | A user reaction to a content item | Platform |
| `event.schema.json` | A user interaction event | Platform |

### 9.3 Versioning

- Schemas use semantic versioning embedded in the schema file's `version` property.
- **Backward-compatible additions** (new optional fields) bump the minor version.
- **Breaking changes** (renamed fields, type changes, newly required fields) bump the major version. Engines MUST migrate before the next platform release.
- Schema major-version bumps are coordinated through this BRD's version. The platform repo MAY support multiple schema versions in parallel during a migration window.

### 9.4 How other repos consume schemas

Two acceptable patterns:

1. **Git submodule** — the engine repo includes `visurena-platform/schemas/` as a submodule pinned to a commit.
2. **Vendored copy** — the engine repo copies the schema files into its own tree (e.g., `vendor/visurena-schemas/`) with a `SCHEMA_VERSION` file noting the commit.

Either is fine. The pin MUST be explicit; engines MUST NOT track `main` of the platform repo's schemas.

See Appendix A for example schemas.

---

## 10. Storage layout — S3

Three buckets, separated by trust boundary:

### 10.1 `s3://visurena-content/` (PUBLIC, CloudFront-fronted, world-readable)

```
manifest.json                       ← orchestration owns this; surfaces read it
blog/
  └── {YYYY}/{slug}.json
story/
  └── {novel-slug}/
      ├── meta.json
      └── chapters/{NN}.json
music/
  ├── singles/{slug}.json
  ├── eps/{slug}/
  └── albums/{slug}/
film/
  └── {slug}.json
game/
  └── {slug}.json
```

- **Bucket policy:** read-only public via CloudFront origin access; no direct PUT from public.
- **CloudFront:** dedicated distribution `content.visurena.com`.
- **Cache:** `manifest.json` `max-age=60`, content JSON `max-age=31536000, immutable` (filename includes content hash if needed).

### 10.2 `s3://visurena-data/` (PRIVATE, write-only by platform)

```
taste-inputs/{YYYY-MM-DD}/{uuid}.json
feedback/{content-id}/{uuid}/{ts}.json
events/{YYYY-MM-DD}/{batch}.json     ← raw analytics events
```

- **Bucket policy:** strictly private. Write only via the platform's data-collection Lambda role. Read only via the analytics repo's IAM role.
- **Lifecycle:** raw events expire after 90 days (analytics has already processed them by then).

### 10.3 `s3://visurena-analytics/` (MIXED PRIVACY)

```
reports/{YYYY-MM-DD}/...             ← private internal reports
demand-clusters/{YYYY-MM-DD}.json    ← consumed by orchestration
public/                              ← aggregated, anonymized
  └── crowd-dashboard.json
```

- **Bucket policy:** internal by default; specific objects (`public/*`) MAY be exposed via CloudFront.
- **Lifecycle:** reports archived to S3 Glacier after 1 year; demand-clusters retained indefinitely.

### 10.4 Existing legacy buckets (audit & rationalize)

| Bucket | Status | Action |
|---|---|---|
| `visurena.com-visurena-bucket` | Active — hosts the static site | Keep |
| `visurena-cloudfront-logs` | Active per IaC; effectively empty | Keep, ensure access logging on |
| `visurena-athena-results` | Created Aug 2025; will be used by analytics repo | Keep |
| `aishowdowns-visurena-manual` | Different project; orphaned | Delete after confirming with owner |

---

## 11. Integration & handoff flows

### 11.1 The content publish flow (T0 → T7)

```
TIME ─────────────────────────────────────────────────────────────────────▶

[T0]  Content engine repo finishes generating an item
      └─ output: item.json (conforms to schemas/{type}.schema.json)

[T1]  Engine's CI uploads to S3
      └─ aws s3 cp item.json s3://visurena-content/{type}/...
      └─ aws s3 cp assets/ s3://visurena-content/{type}/.../assets/ --recursive

[T2]  S3 PutObject event fires → manifest-rebuild Lambda
      └─ Lambda lists s3://visurena-content/**/*.json
      └─ Cross-references with s3://visurena-content/release-schedule.json
        (orchestration owns this)
      └─ Writes the new s3://visurena-content/manifest.json
      └─ Atomic; idempotent; safe under concurrent uploads

[T3]  Engine's CI sends repository_dispatch to platform repo
      └─ event_type="content-published"
      └─ client_payload={"type":"blog","slug":"flux-experiment"}

[T4]  Platform GitHub Actions receives the dispatch
      └─ Triggers the build+deploy workflow

[T5]  Platform build: Next.js getStaticProps fetches manifest + content
      └─ apps/web/lib/content.ts reads manifest.json from CloudFront
      └─ For each manifest entry, fetches the content JSON
      └─ Renders pages statically with content baked in

[T6]  Static export syncs to s3://visurena.com + CloudFront invalidation

[T7]  Visitor refreshes visurena.com → sees new content

Total wall-clock: 3–5 minutes from generation finish to live.
```

### 11.2 The release-gating flow (orchestration)

Items can land in S3 ahead of their public release date. Orchestration controls visibility:

```
[A]  Engine uploads item.json to s3://visurena-content/story/novel-x/chapters/05.json
[B]  Lambda rebuilds manifest, but checks release-schedule.json:
       "novel-x/chapter-05" → goLiveAt: 2026-05-15T18:00:00Z
[C]  If goLiveAt > now: item is NOT included in manifest.json
[D]  EventBridge cron at 2026-05-15T18:00:00Z fires → re-runs manifest builder
[E]  Manifest now includes the item → repository_dispatch to platform → site rebuilds
```

This means a content engine can ship Chapter 5 today and orchestration can hold it for next Friday. Editorial flexibility without engine coordination.

### 11.3 Data collection flow

```
User submits taste input on a surface
       │
       ▼
POST https://api.visurena.com/taste-input  (API Gateway)
       │
       ▼
Lambda validates against taste-input.schema.json
       │
       ▼
Lambda writes to s3://visurena-data/taste-inputs/{YYYY-MM-DD}/{uuid}.json
       │
       ▼
(Phase 2+) DynamoDB also writes for query-time access
       │
       ▼
(Daily) Analytics Lambda reads new inputs → updates demand-clusters
```

### 11.4 Failure modes & recovery

| Failure | Detection | Recovery |
|---|---|---|
| Engine fails schema validation | Engine's CI fails | Fix engine, re-run. Nothing reaches S3. |
| Engine uploads but dispatch fails | No platform rebuild triggered | Manual `gh workflow run deploy.yaml` on platform repo. Manifest is already correct. |
| Manifest Lambda fails | CloudWatch alarm | Lambda is idempotent; re-run via Lambda console or automatic retry |
| Platform build fails | GitHub Actions notification | Last successful deploy stays live. Fix and redeploy. |
| Surface fails to fetch manifest | Surface error monitoring (Sentry, Phase 2+) | Surface SHOULD cache last-known-good manifest with a TTL |

---

## 12. Infrastructure ownership

### 12.1 Principle

**All AWS infrastructure for the entire ViSuReNa ecosystem is defined in `visurena-platform/infrastructure/`.** No other repo creates AWS resources directly.

### 12.2 Why centralized

- Single CloudFormation/CDK source means consistent IAM, tagging, networking
- Other repos focus on their domain logic (generation, scheduling, analysis), not infra
- Cost attribution is clearer: one repo owns the AWS bill structure
- Onboarding a new content engine = adding an IAM role in the platform repo, not bootstrapping AWS again

### 12.3 What other repos CAN do

- Declare requirements in their README ("this engine needs an IAM role with PutObject to s3://visurena-content/blog/")
- Open a PR against `visurena-platform/infrastructure/` to add the resources
- Use the credentials provisioned for them; never create credentials themselves

### 12.4 IaC choice

- **CloudFormation** today (already in use for current S3+CloudFront setup)
- **Migration to AWS CDK (TypeScript)** in Phase 1 — better composability for the multi-bucket, multi-Lambda layout
- Decision deferred to Phase 1 commit; both are AWS-native and free

---

## 13. CI/CD strategy

### 13.1 Today (Phase 0)

- **Per-repo GitHub Actions.** Each repo has its own workflows. `visurena-platform` already has `.github/workflows/deploy.yaml`.
- **Cross-repo coordination via `repository_dispatch`.** Content engines trigger platform rebuilds through GitHub's dispatch API.
- **Cost: $0** on free tier.

### 13.2 Migration trigger

Switch to **AWS CodeCatalyst** when EITHER:
- 5+ active repos shipping daily, OR
- Manual "which workflow failed?" debugging across tabs becomes painful (subjective; ~3 incidents)

### 13.3 Why CodeCatalyst (not CodeStar, not CodePipeline)

- AWS deprecated CodeStar in July 2024; do not use it.
- CodeCatalyst is AWS's external answer to internal Brazil + Pipelines pattern: multi-repo Spaces, Workflows, Environments, Blueprints.
- Free tier (60 build hours/mo, unlimited users) covers Phase 0–1.
- After free tier: ~$4/active user/month.
- CodePipeline + CodeBuild remain useful as lower-level building blocks; CodeCatalyst sits on top.

### 13.4 Branching & release model

- Trunk-based development on `main`.
- Production deploys on every `main` push (current behavior).
- For multi-step changes that affect schemas + multiple repos: coordinate via release-train PRs:
  1. Schema change PR in `visurena-platform`
  2. Engine adapter PRs against the new schema commit
  3. Merge platform PR
  4. Engines update their pinned schema commit and merge

---

## 14. Phases & roadmap

Each phase has goal / deliverables / success criteria / exit condition. **Do not start the next phase until the previous phase's exit condition is met.**

### Phase 0 — Brand & foundation (current)

**Goal:** Site looks and feels like a real pre-launch streaming brand and clearly signals the recommendation-first thesis. Zero backend.

**Deliverables:**
- **Visual identity LOCKED — Aurora Indigo direction (see Appendix D).** Parent palette + 6 derived "room" accents + Inter / DM Serif Display italic / JetBrains Mono typography stack + locked nav order (`Search · For You · Watch · Read · Play · Listen · Research`). Reference mockups in `apps/web/public/mockups-dark/06-aurora-indigo*.html`.
- New home page where the **hero IS the recommendation intake** — 2-step prompt; saves to localStorage
- Showcase row of what already works (blog/Research, 7 browser games, music tracks). No "Coming Soon" placeholders surfaced.
- Locked nav (v1.3): **Home · Movies · Music · Games · Story · VR World · Blog** (medium-noun labels; "Search" was wrong because the tab is recommendation, not generic search — recommendation lives ON Home as the hero. "VR World" added because §14 Phase 4d names VR as the final medium expansion. "Blog" is the consolidated writing room — build log, transparency reports, and editorial essays all live there. We considered Studio (which ties to ViSuReNa's "editorial AI streaming studio" positioning) and Journal, but Blog reads clearest and aligns with the existing `/blog` route on the live site.)
- Schemas folder scaffolded (even with placeholder schemas) so engines have a target

**Success criteria:** Visitor understands "tell us what you want, we'll make it" within 5 seconds. Within 30 seconds, has shared one taste-input.

**Exit condition:** Aesthetic locked + intake collecting localStorage data + schemas v1 published.

### Phase 1 — Recommendation engine (live)

**Goal:** Taste-input flows into a real backend; recommend from a curated catalog.

**Deliverables:**
- Backend: API Gateway + Lambda + DynamoDB + S3 data bucket
- Curated catalog of ~500 items tagged by theme / emotional beat / structural element
- Matching v0: rule-based keyword + tag-overlap scoring (no ML)
- Result page: 3–5 recs with per-rec feedback ("loved / meh / not for me")
- Account-less: anon UUID in localStorage
- First content engine repo (`visurena-blog-engine`) wired up, end-to-end handoff working

**Success criteria:** 100+ unique users complete intake → recommendation → first feedback flow.

**Exit condition:** Engine generating defensible recs at user scale; feedback signal accumulating; first content engine has shipped at least one piece via the full handoff flow.

### Phase 2 — Free onboarding & data refinement

**Goal:** Grow the taste-data pool, refine matching, build a habit loop.

**Deliverables:**
- Lightweight accounts (email magic-link, no passwords)
- Personal taste-profile page
- Recs re-rank as engine learns from feedback
- Public "what the crowd wants" dashboard (analytics output)
- Mailing list opt-in + weekly "new picks for you" email

**Success criteria:** 1,000+ accounts; 5+ taste-inputs per active user; 25%+ weekly email open rate.

**Exit condition:** Enough taste data to identify 3+ concrete demand clusters worth generating original content against.

### Phase 3 — First original release (chapter-by-chapter)

**Goal:** Ship the first AI-generated original content, seeded by crowd demand.

**Deliverables:**
- Pick a single high-demand theme cluster from Phase 2 data
- Develop a novel concept: you author the spine; AI assists prose under your direction
- Release Chapter 1 with paragraph-level reactions
- Chapter 2+ ships weekly with explicit "what readers wanted" notes
- Behind-the-scenes blog post per chapter in the Research tab
- Orchestration repo live (release calendar + manifest gating)

**Editorial principle:** You decide what feedback to incorporate. Crowd-steered, not crowd-written. Protect narrative coherence.

**Success criteria:** 500+ readers complete Ch 1; 30%+ return for Ch 2; ≥10 substantive comments per chapter.

**Exit condition:** First novel completed end-to-end. Loop proven.

### Phase 4 — Multi-medium expansion

Each medium ships in roughly this order, each replicating the chapter-by-chapter loop:

- **4a — Music:** single → EP → album. Lowest friction (audio AI mature, tracks short).
- **4b — Short video:** 60-second AI-generated narrative shorts. Lowest-cost path into "movies."
- **4c — Long video / film:** only after 4b proves video fidelity. Likely co-production with external studios.
- **4d — VR / immersive:** last expansion; only sensible once audience and revenue justify the build cost.

### Phase 5 — Membership & monetization

Opens **at end of Phase 3** (after first chapter-by-chapter release proves stickiness). Not before — paywalling unproven product kills the funnel.

See Section 18 for tier details.

---

## 15. Success metrics

### 15.1 North-star metric

**Active taste-givers per week.** Count of unique users who submit at least one taste-input or feedback in the last 7 days. This metric directly measures whether the demand-capture flywheel is spinning.

### 15.2 Per-phase KPIs

| Phase | Primary KPI | Secondary |
|---|---|---|
| 0 | Time-to-first-taste-input (median) | Bounce rate on home page |
| 1 | Weekly active taste-givers | Recs/feedback ratio |
| 2 | Account creation rate | Email open rate, recs per account |
| 3 | Chapter completion rate (Ch 1 → Ch 2 → ...) | Comments per chapter, retention curve |
| 4 | Cross-medium engagement % | Tracks/films/games per user |
| 5 | Paid conversion rate | LTV, churn, tier mix |

### 15.3 Business metrics (Phase 5+)

- MRR (monthly recurring revenue)
- LTV / CAC ratio
- Gross margin per content piece (varies by medium)

---

## 16. Non-functional requirements

### 16.1 Performance

- **Home page (any surface):** Time-to-interactive < 2.0s on a mid-tier mobile device, 3G connection.
- **Manifest fetch:** < 200ms p95 (CloudFront-cached).
- **Content JSON fetch:** < 300ms p95.
- **Search/recommendation result:** < 1.5s p95 from query submit to result render.

### 16.2 Availability

- **Surfaces:** 99.9% uptime (CloudFront-fronted static; the only hard dependency is S3).
- **Data collection API:** 99.5% (API Gateway + Lambda; Lambda cold starts acceptable for write traffic).
- **Manifest:** 99.99% (CloudFront cache + multi-region S3 replication if needed at Phase 4 scale).

### 16.3 Scalability

- Phase 0–2: target up to 10,000 monthly actives. Free-tier infra sufficient.
- Phase 3: target up to 100,000 monthly actives. Stay on serverless; expect ~$50–$200/mo infra cost.
- Phase 4+: target 1M+. Budget will support a dedicated infrastructure engineer.

### 16.4 Security

- All buckets default-private. Public access only through explicit CloudFront distributions.
- IAM roles scoped to least privilege. No long-lived access keys for any automated process; use short-lived credentials via OIDC where possible.
- Secrets in AWS Secrets Manager or GitHub Actions secrets; never in code.
- Schema validation at all data-ingress points.
- Content Security Policy (CSP) on all surfaces.
- Regular CSO/security review (quarterly minimum from Phase 2+).

### 16.5 Browser/device support

- Web: latest 2 versions of Chrome, Firefox, Safari, Edge. Mobile Safari and Chrome on Android (latest 2 versions).
- Graceful degradation expected; no support for IE or pre-2022 browsers.

---

## 17. Data, privacy, ethics

### 17.1 What we collect

- **Taste inputs:** the content the user volunteered (titles, themes, why-they-love-it text). Required for the product to function.
- **Feedback:** structured reactions to recommendations and ViSuReNa Originals.
- **Events:** anonymized interaction events (page views, dwell time, click paths). Optional via cookie consent in jurisdictions that require it.
- **Account info (Phase 2+):** email address only. No demographic data, no third-party profile imports.

### 17.2 What we DO NOT collect

- Real names (unless voluntarily provided in profile)
- Phone numbers
- Location beyond country-level inferred from IP
- Social media profile data
- Any biometric or sensitive personal data
- Browsing history outside ViSuReNa surfaces

### 17.3 User rights (proactively offered, not just legally compliant)

- **Export:** one-click JSON download of everything we have on a user.
- **Delete:** one-click full account + data deletion. Honored within 7 days. Anonymized aggregates may persist (e.g., "23% of users wanted X" survives even after individual deletion).
- **Correct:** any taste-input or feedback can be edited or removed individually.
- **Opt out of analytics:** cookie consent banner; opt-out preserves core functionality.

### 17.4 What we never do

- Sell data to third parties.
- Share personal data with content collaborators or studios.
- Use the data to target users for advertising.

### 17.5 What we publish

- **Aggregated insights** (Public dashboard): "what the crowd wants" themes, anonymized. No individual data ever.
- **Monthly transparency reports** (Research tab from Phase 2+): user counts, opt-out rates, what the engine got right/wrong, where money went.

This section is a feature, not a defensive disclaimer. Position prominently in surfaces.

---

## 18. Membership & monetization

Activates at the **end of Phase 3** (after first chapter-by-chapter release proves stickiness).

### 18.1 Tier structure (proposed)

| Tier | Price | What you get |
|---|---|---|
| **Free** | $0 | Taste intake, recommendations, read 1 chapter behind the front |
| **Backer** | $1/mo | Read all chapters as released, basic feedback voting |
| **Curator** | $5/mo | 3× voting weight, early access (1 chapter ahead), full demand-cluster dashboard |
| **Executive Producer** | $15/mo | Name in credits, monthly creative review call, can pitch theme clusters |

**Annual discount:** 10× monthly price (= 2 months free).

### 18.2 Why $1 is the entry tier

Frictionless. Goal isn't margin; it's the **trust bond** of being a paying member. Margin comes from $5 / $15 conversion.

### 18.3 Payment infrastructure

- **Stripe** for processing (lowest friction for $1 tier; supports pricing experiments).
- **Avoid in-app purchases on Apple/Google** for as long as possible (30% tax kills the $1 tier). Web-first signup; mobile apps can use the same web-purchased subscription via login.

---

## 19. Open questions & risks

### 19.1 Open questions

- **Mobile stack:** React Native vs Flutter vs Tauri Mobile. Decide at Phase 3.
- **When to introduce ML beyond rule-based scoring:** probably ~10K users, when sparse signal is no longer the bottleneck.
- **When (if ever) to move off hosted AI APIs:** cost crossover at millions of generations/month.
- **IP:** who owns AI-generated content shipped on ViSuReNa — you, the AI provider, or shared with members?
- **Editorial team:** when to hire creative director — likely Phase 3 if first novel succeeds.
- **Brand naming for original content:** per-title sub-brand vs "ViSuReNa Originals" umbrella?
- **CodeCatalyst migration timing:** subjective trigger; revisit at every phase exit.

### 19.2 Known risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI provider price increase or capability regression | Medium | High | Multi-provider abstraction layer in engines; monitor weekly |
| First novel doesn't land | Medium | Very High | Ship Phase 3 small (8–10 chapters); pivot if Ch 2 retention < 30% |
| Schema drift across repos | Medium | High | Strict pinning; CI checks; this BRD as canonical source |
| Cost runaway from S3 storage of generated content | Low | Medium | Lifecycle policies; archive cold content to Glacier |
| Public AI-content backlash damages brand | Medium | Medium | Editorial transparency; visible human direction; "crowd-steered, not slop" positioning |
| Sole-contributor bus factor | High | Very High | This BRD; codebase docs; commit hygiene; backup access plan |

---

## 20. Glossary

- **Content engine** — A repo dedicated to generating one type of content (blog, story, music, film, game).
- **Manifest** — `s3://visurena-content/manifest.json`. Single source of truth for "what content is currently live."
- **Orchestration** — The repo/layer that decides when content goes live. Owns the release schedule and the manifest's release-gate.
- **Platform** — This repo (`visurena-platform`). Houses surfaces, schemas, infra, data collection.
- **Schema** — A JSON Schema file in `visurena-platform/schemas/`. Defines the shape of one content type or data type.
- **Surface** — A consumer-facing app: web, iOS, Android, TV, VR.
- **Taste input** — A user's submission of "I love [X], because [Y]." The primary demand signal.
- **ViSuReNa Original** — A piece of content generated by ViSuReNa via the demand-driven flywheel (as opposed to a recommended item from the curated existing-media catalog).

---

## Appendix A — Example schemas

These are illustrative templates. Final schemas live in `visurena-platform/schemas/` and are versioned independently.

### A.1 `blog-post.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://visurena.com/schemas/blog-post.schema.json",
  "title": "Blog Post",
  "type": "object",
  "version": "1.0.0",
  "required": ["id", "type", "title", "publishedAt", "body", "bodyFormat"],
  "properties": {
    "id":          { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "type":        { "const": "blog-post" },
    "title":       { "type": "string", "maxLength": 200 },
    "description": { "type": "string", "maxLength": 500 },
    "tags":        { "type": "array", "items": { "type": "string" } },
    "publishedAt": { "type": "string", "format": "date-time" },
    "thumbnail":   { "type": "string", "description": "S3 path or URL" },
    "body":        { "type": "string", "description": "Full article body" },
    "bodyFormat":  { "enum": ["markdown", "html"] },
    "author":      { "type": "string" },
    "readingTimeMinutes": { "type": "integer", "minimum": 1 }
  }
}
```

### A.2 `story-chapter.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://visurena.com/schemas/story-chapter.schema.json",
  "title": "Story Chapter",
  "type": "object",
  "version": "1.0.0",
  "required": ["id", "type", "novelId", "chapterNumber", "title", "body", "publishedAt"],
  "properties": {
    "id":            { "type": "string" },
    "type":          { "const": "story-chapter" },
    "novelId":       { "type": "string" },
    "chapterNumber": { "type": "integer", "minimum": 1 },
    "title":         { "type": "string" },
    "body":          { "type": "string" },
    "wordCount":     { "type": "integer" },
    "publishedAt":   { "type": "string", "format": "date-time" },
    "feedbackThemes": {
      "type": "array",
      "description": "Themes from previous chapter feedback that influenced this chapter",
      "items": { "type": "string" }
    }
  }
}
```

### A.3 `manifest.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://visurena.com/schemas/manifest.schema.json",
  "title": "Content Manifest",
  "type": "object",
  "version": "1.0.0",
  "required": ["generatedAt", "version", "items"],
  "properties": {
    "generatedAt": { "type": "string", "format": "date-time" },
    "version":     { "type": "string" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "path", "publishedAt"],
        "properties": {
          "id":          { "type": "string" },
          "type":        { "type": "string" },
          "path":        { "type": "string", "description": "S3 path relative to bucket root" },
          "publishedAt": { "type": "string", "format": "date-time" },
          "title":       { "type": "string" },
          "tags":        { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
```

### A.4 `taste-input.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://visurena.com/schemas/taste-input.schema.json",
  "title": "Taste Input",
  "type": "object",
  "version": "1.0.0",
  "required": ["id", "anonId", "submittedAt", "loved", "reason"],
  "properties": {
    "id":          { "type": "string", "format": "uuid" },
    "anonId":      { "type": "string", "format": "uuid", "description": "Per-browser UUID, persisted in localStorage" },
    "accountId":   { "type": "string", "format": "uuid", "description": "Optional, present if user is logged in" },
    "submittedAt": { "type": "string", "format": "date-time" },
    "loved": {
      "type": "object",
      "required": ["title", "medium"],
      "properties": {
        "title":    { "type": "string" },
        "medium":   { "enum": ["book", "movie", "tv", "music", "game", "other"] },
        "year":     { "type": "integer" }
      }
    },
    "reason":      { "type": "string", "maxLength": 1000, "description": "Why the user loved it" },
    "tags":        { "type": "array", "items": { "type": "string" } },
    "surface":     { "enum": ["web", "ios", "android", "tv", "vr"] }
  }
}
```

---

## Appendix B — Concrete handoff walkthrough

Trace one article end-to-end.

### Scenario

Content engine `visurena-blog-engine` generates an article titled "Flux LoRA experiments — 4-step workflow" and publishes it.

### Step-by-step

**1. Generation** (in `visurena-blog-engine`)

```bash
python generate.py \
  --topic="Flux LoRA experiments — 4-step workflow" \
  --output=./out/flux-experiment.json
```

Output `./out/flux-experiment.json`:
```json
{
  "id": "flux-experiment-2026-05-09",
  "type": "blog-post",
  "title": "Flux LoRA experiments — 4-step workflow",
  "description": "Walkthrough of a fast Flux + LoRA pipeline for stylized portraits.",
  "tags": ["ComfyUI", "Flux", "LoRA"],
  "publishedAt": "2026-05-09T14:30:00Z",
  "thumbnail": "blog/2026/flux-experiment-2026-05-09/thumbnail.png",
  "body": "# Flux LoRA experiments\n\nIn this post...",
  "bodyFormat": "markdown",
  "author": "Vishnu",
  "readingTimeMinutes": 6
}
```

**2. Validation** (CI step in `visurena-blog-engine`)

```bash
ajv validate -s vendor/visurena-schemas/blog-post.schema.json -d out/flux-experiment.json
# exit 0 → proceed; non-zero → fail the build
```

**3. Upload** (CI step)

```bash
aws s3 cp out/flux-experiment.json \
  s3://visurena-content/blog/2026/flux-experiment-2026-05-09.json

aws s3 cp out/assets/ \
  s3://visurena-content/blog/2026/flux-experiment-2026-05-09/ \
  --recursive
```

**4. Manifest rebuild** (automatic, S3 event → Lambda)

The Lambda lists `s3://visurena-content/**/*.json`, cross-references with `release-schedule.json`, writes the new `manifest.json`. The new article's entry:

```json
{
  "id": "flux-experiment-2026-05-09",
  "type": "blog-post",
  "path": "blog/2026/flux-experiment-2026-05-09.json",
  "publishedAt": "2026-05-09T14:30:00Z",
  "title": "Flux LoRA experiments — 4-step workflow",
  "tags": ["ComfyUI", "Flux", "LoRA"]
}
```

**5. Notify platform** (CI step in `visurena-blog-engine`)

```bash
gh api repos/visurena/visurena-platform/dispatches \
  -f event_type="content-published" \
  -f client_payload='{"type":"blog","id":"flux-experiment-2026-05-09"}'
```

**6. Platform rebuild** (`visurena-platform/.github/workflows/content-update.yaml`)

```yaml
on:
  repository_dispatch:
    types: [content-published]

jobs:
  rebuild-and-deploy:
    uses: ./.github/workflows/deploy.yaml
```

**7. Build reads manifest** (`apps/web/lib/content.ts`)

```typescript
const manifest = await fetch('https://content.visurena.com/manifest.json').then(r => r.json());
const blogPosts = await Promise.all(
  manifest.items.filter(i => i.type === 'blog-post')
                .map(i => fetch(`https://content.visurena.com/${i.path}`).then(r => r.json()))
);
```

**8. Deploy** — static export → `s3://visurena.com` → CloudFront invalidation.

**9. Live** — visitor refreshes `visurena.com/blog` and sees the new article.

Wall-clock: 3–5 minutes T1 → T9.

---

## Appendix C — New content engine bootstrap checklist

Use this when starting a new `visurena-{medium}-engine` repo.

### Checklist

- [ ] Repo named `visurena-{medium}-engine`
- [ ] README links back to this BRD (pinned commit)
- [ ] CLAUDE.md explains the engine's specific generation pipeline
- [ ] Vendored or submoduled `visurena-platform/schemas/{medium}.schema.json` at a pinned commit, with `SCHEMA_VERSION` file noting the commit hash
- [ ] `generate.py` (or equivalent) entrypoint with documented inputs/outputs
- [ ] Schema validation step in CI (using `ajv-cli`, `python-jsonschema`, or equivalent)
- [ ] AWS IAM role provisioned in `visurena-platform/infrastructure/` with least-privilege `s3:PutObject` to the engine's content folder ONLY
- [ ] CI workflow `generate-and-publish.yaml` that:
  - Runs generation
  - Validates output
  - Uploads to designated S3 path
  - Sends `repository_dispatch` to `visurena-platform`
- [ ] Repository secret `VISURENA_PLATFORM_DISPATCH_TOKEN` configured (a fine-grained PAT with `repository_dispatch` permission only)
- [ ] Cost estimate per generation documented in README
- [ ] Manual test: trigger workflow, confirm content appears on visurena.com within 5 min
- [ ] Add the engine to the orchestration repo's known-engines list

---

## Appendix D — Brand visual identity (Aurora Indigo, locked v1)

The brand direction was selected on 2026-05-09 after a six-direction parallel exploration. Canonical mockups live in `apps/web/public/mockups-dark/06-aurora-indigo*.html`. Engineering tokens for this palette are in `ARCHITECTURE.md` § Brand & visual system. This appendix is the **product-side source of truth for the brand**.

### D.1 Identity summary

- **Name of direction:** Aurora Indigo
- **Mood:** Future-AI streaming. Premium dark cinematic. Search-first product. Each section has its own "aurora glint" accent derived from a single parent indigo.
- **Family reference:** Mubi / Apple TV+ / Disney+ / HBO Max premium-streaming visual class — but distinct via the multi-color section accent system that reads as an aurora across the platform.

### D.2 Parent palette (page-level — used across every surface)

| Token | Hex | Role |
|---|---|---|
| `bg` | `#0A0E2A` | Page background. Where everything else sits. |
| `surface-1` | `#131A3D` | Cards, nav, panels. The first elevation. |
| `surface-2` | `#1D2552` | Raised surfaces. Tinted-gradient game blocks, palette tiles. |
| `hairline` | `#2A3268` | 1px borders, divider rules, subtle component edges. |
| `text-high` | `#F0F2FF` | Primary body text. Headlines. |
| `text-mid` | `#9DA8D9` | Secondary body text. Sub-paragraphs. Muted nav items. |
| `text-muted` | `#5C66A0` | Tertiary text. Mono build info. Disabled-state-equivalent. |
| `accent-parent` | `#6B7DFF` | **The verb.** Search button, link hover, focus rings, active-nav indicator on Search/For-You, primary CTAs across all rooms. |

### D.3 Six derived "room" accents (the aurora)

Each accent appears ONLY in its section's UI: section eyebrow, active nav indicator (when on that page), ambient hero radial spot, content card category label, card hover border, section-specific CTA pill.

The parent accent (`#6B7DFF`) stays glued to global UI even when in another room — so the brand reads cohesive across pages.

| Section | Accent hex | Role description |
|---|---|---|
| Home (master) | `#6B7DFF` (parent indigo) | The everything-feed — inherits the parent. Recommendation/intake hero lives here. |
| Movies | `#F472B6` (aurora pink) | Films, shorts, scenes (Phase 4b/c). |
| Music | `#F4C04E` (warm gold) | Tracks, EPs, originals (Phase 4a — first medium expansion). |
| Games | `#B5E853` (electric lime) | Browser games, retro reborn. The only complete catalog at Phase 0. |
| Story | `#2DD4BF` (soft cyan) | Chapters, novels, serialized fiction (Phase 3 — first long-form original). |
| VR World | `#A78BFA` (electric lavender) | Immersive worlds (Phase 4d — final medium expansion). |
| Blog | `#C0C8E0` (cool platinum) | Build log, transparency, editorial process. |

### D.4 Typography stack

- **Display + body:** [Inter](https://fonts.google.com/specimen/Inter) — weights 300, 400, 500, 600, 700. Italic where emphasis is needed.
- **Editorial italic (used SPARINGLY for hero pull-words and one or two pull-quotes per page):** [DM Serif Display](https://fonts.google.com/specimen/DM+Serif+Display) italic 400 — preferred. Fallback: [Spectral](https://fonts.google.com/specimen/Spectral) italic 700.
- **Monospace (all metadata, hex codes, build info, eyebrow labels):** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — weights 400, 500.
- **Hero headline scale:** ~5.6rem desktop, ~2.6rem mobile, weight 700, line-height 1.0, letter-spacing -0.03em. Italic emphasis word in DM Serif Display italic, in the section accent for that page.
- **Body line-height:** 1.55–1.7 depending on column width.
- **Tracking:** Tight on display (`-0.03em`). Loose on small-caps mono labels (`0.10em`–`0.16em`).

### D.5 Locked nav order

`HOME · MOVIES · MUSIC · GAMES · STORY · VR WORLD · BLOG`

- Medium-noun naming aligns with the per-medium phase plan (§14): Music = Phase 4a, Movies = Phase 4b/c, VR World = Phase 4d. Reads more conventionally than the action-verb predecessors (Watch/Listen/Play/Read).
- "Home" replaces the previous Search + For You combination. The recommendation hero lives ON Home — Search wasn't the right name because the input is really recommendation; "For You" was unclear.
- "Blog" replaces "Research" because the room covers build log + transparency + editorial process — broader than research alone. Also ties to ViSuReNa's positioning as "an editorial AI streaming studio."
- "Blog" is the consolidated writing room name (chosen 2026-05-09 over Studio/Journal/Notes). It aligns with the live site's existing `/blog` route and reads clearest as "where we write things." The room covers build log, transparency, and editorial essays — broader than the original "Research" but more concrete than "Studio."
- "VR World" is signaled from day 1 even though Phase 4d ships much later (likely 2028+). The room sits empty on purpose until the brief is crowd-steered into existence — empty rooms are more honest than "Coming Soon" placeholders (rejected explicitly in §14 Phase 0).
- Active tab is indicated by a 1px accent underline + brighter text. The accent is the section's accent when on that section's page; parent indigo on Home.

### D.6 Visual signatures (the moves that make this direction "Aurora Indigo")

1. **Controlled aurora mesh — exactly once per page, in the hero only.** A 2-blob radial gradient: indigo at ~16% opacity + aurora-pink at ~10% opacity. NEVER a full-page gradient mesh flood. Anywhere else on the page, surfaces are solid colors.
2. **The "color system" bento on home.** A dramatic showcase section establishes the multi-color section system at first glance — six tiles in the bento, each a full flood of its section accent with the hex code as the visual centerpiece. See `apps/web/public/mockups-dark/06-aurora-indigo.html`.
3. **Section accent as the room's verb; parent accent as the brand's verb.** Inside a room, the section accent owns the eyebrow, active state, and section CTA. But the global Search button, focus rings, and footer member-link stay parent indigo across all rooms. This is what stops the brand from feeling schizophrenic.
4. **Tabular monospace for ALL metadata.** Year, runtime, rating, build hash, timestamp, hex code, "12 items live" — all in JetBrains Mono. Information density signals authority.
5. **Italic-serif inside sans for the editorial pull-words.** One word per hero, one word per manifesto pull-quote. Anchored in DM Serif Display italic. The serif-in-sans contrast is the brand voice.

### D.7 What to AVOID

- Flooding the page with the gradient mesh (the AI-startup cliché). The mesh is a single moment in the hero only.
- Adding an 8th accent. The system has seven rooms (Home + 6 sub-rooms = 7 nav items, 7 distinct accents counting parent + 6 derived). Adding more breaks coherence.
- Using a section accent as a global verb (e.g., a Watch-pink Search button — wrong. Search button is always parent indigo).
- Replacing Inter/DM Serif/JetBrains Mono with Space Grotesk, Geist, or any default-trendy font — the typography stack is part of the brand lock.
- Generic SaaS landing tropes: logo cloud, testimonial blocks, feature-card-with-icon grids, bento with rounded-3xl shadow blur 80px.

### D.8 Reference mockups (canonical, do not modify without updating this appendix)

- Home: `apps/web/public/mockups-dark/06-aurora-indigo.html`
- Per-section proofs (showing the room accent system in context):
  - Home: the home page itself (`06-aurora-indigo.html`) — the master room
  - Movies: `apps/web/public/mockups-dark/06-aurora-indigo-watch.html` (file path retained for now; visible label is MOVIES)
  - Music: `apps/web/public/mockups-dark/06-aurora-indigo-listen.html` (visible label MUSIC)
  - Games: `apps/web/public/mockups-dark/06-aurora-indigo-play.html` (visible label GAMES)
  - Story: `apps/web/public/mockups-dark/06-aurora-indigo-read.html` (visible label STORY)
  - VR World: `apps/web/public/mockups-dark/06-aurora-indigo-vr-world.html`
  - Blog: `apps/web/public/mockups-dark/06-aurora-indigo-research.html` (visible label BLOG; file path retained)

### D.9 Engineering implementation note

CSS variable tokens, theming hooks, and the per-section accent override pattern are documented in `ARCHITECTURE.md` § Brand & visual system. Any surface (web, ios, android, tv, vr) MUST consume these tokens — never hard-code hex.

---

*End of BRD v1.2.*
