# Phase 2 — Serverless data + engagement layer (Design Spec)

**Date:** 2026-05-26
**Owner:** vishnusurya
**Status:** Draft — pending owner review
**Supersedes for Phase 2:** [PHASES.md §2 task list](../../PHASES.md) (this spec drives the rewrite of that section)
**References:** [ARCHITECTURE.md §8 Data model](../../../ARCHITECTURE.md#8-data-model)

---

## 0. How to read this

This document is the **what + why** for Phase 2. It locks the data shape, API surface, and operational pieces needed for engagement (likes / comments / events) and the catalog read path. After the owner signs off, this spec generates a concrete task-by-task implementation plan via `superpowers:writing-plans`, which becomes the new Phase 2 checklist in `PHASES.md`.

Decisions are numbered `D34…` continuing from [ARCHITECTURE.md §2](../../../ARCHITECTURE.md#2-locked-decisions).

---

## 1. Context & goals

### 1.1 What we're solving

Phase 1 delivered the static "Studio" frontend reading content metadata from S3 folder walks at build time. That works for the catalog but blocks three things the owner now wants:

1. **First-class catalog tables** — the site needs to know "what's scheduled to publish next" and "who's working on this" without walking S3 prefixes. Metadata moves into DynamoDB; S3 stays the home for content blobs (story text, audio, video, images).
2. **Engagement everywhere** — likes + comments on every content kind (stories, movies, music, games, journal, research), gated by a placeholder login modal until Phase 3 swaps in real Cognito.
3. **Cross-vertical relationships** — a story today may become a movie or have a soundtrack tomorrow. A first-class relations table captures these edges so the UI can show "related works" rails.
4. **Per-click analytics** — every page view and click (logged-in or anonymous) flows into an event lake the owner can query for analytics and recommendation training.

### 1.2 Goals

- Catalog metadata lives in DynamoDB; sourced from S3 `item.json` via a sync Lambda; the site reads from the API (or a build-time snapshot for the static export).
- Likes, saves, comments, follows on every content kind; placeholder login modal gates writes; gated actions are demoable end-to-end.
- Anonymous + logged-in event capture, joinable later via an identity-stitching mechanism that ships in Phase 2 (the *data shape* — Cognito itself is Phase 3).
- Public APIs hardened against drive-by abuse (Cloudflare Turnstile + AWS WAF + Lambda Powertools idempotency).
- Solo-creator-scale comment moderation that doesn't require babysitting (Amazon Comprehend Toxicity → Bedrock Claude Haiku for gray-zone → auto-hide on 3 reports).
- Stays under the $10/mo ceiling at hundreds-of-items × low-thousands-of-MAU scale.

### 1.3 Non-goals

| Item | Why deferred |
|---|---|
| Real authentication (Cognito) | Phase 3 — ships *together with* Phase 2 but its own scope |
| Recommendations engine | Phase 4+ — requires meaningful engagement signal first |
| Full-text search | Phase 5 — Fuse.js index regenerates on publish in Phase 2 |
| Mobile app | Separate track — shared `design-tokens` + `core` packages |
| Multi-language content | Deferred (per ARCHITECTURE D17) |
| WAF Bot Control add-on | Overkill at indie scale (~$10/M requests) — revisit at 10× traffic |
| SES Follow → email digest | Phase 3.3 — needs real users |
| Cross-device anon→user merge | Single-device only in Phase 2; multi-device reconciliation is its own can of worms |

---

## 2. Locked decisions (extending ARCHITECTURE §2)

| # | Decision | Rationale |
|---|---|---|
| **D34** | DynamoDB **domain-bounded multi-table**: `Catalog`, `Engagement`, `Relations`, `Users`, `IdentityMap` — *not* the single-table design in current ARCHITECTURE §8.1 | Modern AWS guidance (DeBrie 2024, AWS DB Blog, Momento, Nordcloud) softens the Houlihan-era single-table dogma. On-demand cost is per-RRU/WRU not per-table → cost-neutral. Multi-table gives easier streams, easier IAM, easier GDPR cascades, easier per-table schema migrations. |
| **D35** | `section` enum: `stories | movies | music | games | journal | research` (6 values) | Owner's "what about blog posts" extension. Journal + research have the same shape as stories — no schema change needed; just enum extension. About stays a static page. |
| **D36** | Events live in **S3 Parquet via Firehose → Glue Catalog → Athena** — not a DynamoDB table | Cheap, infinite, analytics-friendly. No real-time per-event queries planned. Matches ARCHITECTURE §8.2. |
| **D37** | Identity stitching ships in **Phase 2**: every event envelope carries both `anonymousId` and `userId?`; `IdentityMap` table created from day 1 | Cognito is P3, but the *data shape* must exist now — otherwise pre-login engagement cannot be backfilled to the user after first login. |
| **D38** | Public-API spam protection = **Cloudflare Turnstile (invisible) + AWS WAF rate-based rule + AWS Lambda Powertools idempotency + DynamoDB conditional writes** | Defense in depth. Turnstile is free + unlimited; WAF ~$5/mo + $1/rule + $0.60/M req; idempotency ~3 lines via Powertools. All within budget. |
| **D39** | Comment moderation = **rule prefilter → Comprehend Toxicity (cheap pass) → Bedrock Claude Haiku for gray zone (0.3–0.7) → auto-hide on 3 reports** | Solo-creator scale; pennies/mo at indie volume; Comprehend has 50k units/mo free for first year. Do NOT use Perspective API (Google sunsets Dec 31 2026). |
| **D40** | Catalog hosts **all six sections in one physical table**, partitioned by `section` (PK) | Same-shape data; "what's coming next across the whole site" is one Query; per-vertical pages are also one Query (`PK=stories`). The owner's intuition to "have a tables for each vertical" is honored via partition keys, without sprawl. |
| **D41** | Like/comment counts: **cached counter on Catalog row, updated by DynamoDB Streams aggregator Lambda** (not atomic counter) | Atomic counters aren't idempotent — retries double-count. Conditional-write + Stream → aggregator preserves idempotency and supports spam reversal. |
| **D42** | Soft-delete (not hard-delete) on comments + likes; hard-delete only on GDPR | Needed for moderation history, ban appeals, audit. |
| **D43** | Schema versioning: every row carries `schemaVersion: int`; migrations live in `infrastructure/cdk/migrations/<NNNN>-<slug>.ts` | Multi-table or single-table both rot without this. |
| **D44** | DynamoDB Point-in-Time Recovery (PITR) enabled on all 5 tables | ~$0.20/GB/mo, single-digit-GB tables = pennies; restores from bad migrations. |

---

## 3. Data model

5 DynamoDB tables + 1 S3-backed event lake. All Dynamo tables: **on-demand billing, PITR enabled, encryption at rest with AWS-managed KMS, table naming `vr-<env>-<table>` (e.g. `vr-alpha-catalog`).**

### 3.1 `Catalog` — content metadata across all six sections

**Purpose:** source of truth for what exists, what's scheduled, what's live, who's on it. Blobs (text, mp3, mp4, images) stay in S3.

**Keys**

- **PK** `section` (S) — `stories | movies | music | games | journal | research`
- **SK** `id` (S) — UUID v4, immutable

**Attributes**

| Attr | Type | Notes |
|---|---|---|
| `slug` | S | URL slug (`the-lantern-mile`). Mutable. |
| `title` | S | Display title |
| `summary` | S | ≤500 chars |
| `status` | S | `draft | scheduled | live | hidden | archived` |
| `genre` | S | e.g. `Horror`, `Sci-Fi` |
| `tags` | SS | string set |
| `createdAt` | S | ISO8601 |
| `publishAt` | S | ISO8601 — when status flips to `live` |
| `updatedAt` | S | ISO8601 |
| `s3Prefix` | S | `stories/2026/05/25/<id>/` — root in content bucket |
| `coverPortrait` | S | `images/cover_34.webp` (relative to `s3Prefix`) |
| `coverWide` | S | `images/cover_169.webp` |
| `accentHex` | S | `#7c8fa8` — jewel tone for theming |
| `credits` | M | `{author, narrator, composer, director, cast[]}` |
| `chapters` | L | story/novel only: `[{n, title, body, audiobook, publishAt, status}]` |
| `durationSec` | N | movie/music only |
| `assignee` | S | who's actively working on it |
| `notes` | S | private editorial notes |
| `likeCount` | N | cached counter (Streams-updated) |
| `commentCount` | N | cached counter |
| `viewCount` | N | cached counter |
| `schemaVersion` | N | starts at `1` |

**Global Secondary Indexes**

| Name | PK | SK | Purpose |
|---|---|---|---|
| **GSI1 `BySectionDate`** | `section` | `publishAt` | Section landing pages — newest-first feed |
| **GSI2 `BySlug`** | `section` | `slug` | URL routing — `/stories/the-lantern-mile` → 1 GetItem |
| **GSI3 `ScheduleQueue`** (sparse on `status=scheduled`) | `status` | `publishAt` | "What's publishing next" + EventBridge Scheduler trigger source |

**Access patterns (representative)**

- `GET /catalog/stories` → `Query GSI1 PK=stories ScanIndexForward=false` (1 RCU/page)
- `GET /catalog/stories/the-lantern-mile` → `Query GSI2 PK=stories SK=the-lantern-mile` (1 RCU)
- Homepage "coming next" → `Query GSI3 PK=scheduled SK > now() Limit 5` (1 RCU)
- Editorial dashboard "in flight" → `Scan WHERE status=draft` (rare; OK to scan at hundreds of items)
- Content-sync Lambda upserts on every S3 `item.json` change (idempotent — conditional write checks `updatedAt`)

### 3.2 `Engagement` — likes, saves, comments, follows

**Purpose:** everything users *do to* content. Different write velocity + lifecycle than Catalog → separate table.

**Keys** (polymorphic — type-prefixed)

- **PK** depends on entity (see sub-shapes)
- **SK** depends on entity
- Every row also carries `entityType: like | save | comment | follow` for stream consumers.

**Sub-shape A — Like**

| Attr | Type | Notes |
|---|---|---|
| `PK` | S | `USER#<userId>` |
| `SK` | S | `LIKE#<contentId>` |
| `entityType` | S | `like` |
| `userId` | S | duplicate of PK suffix for stream convenience |
| `contentId` | S | UUID |
| `section` | S | denormalized to avoid Catalog re-lookup |
| `createdAt` | S | ISO8601 |
| `GSI1PK` | S | `CONTENT#<contentId>` |
| `GSI1SK` | S | `LIKE#<createdAt>#<userId>` |

Conditional write `attribute_not_exists(PK)` makes likes idempotent — spam-clicking the heart is rejected by DynamoDB, not the Lambda.

**Sub-shape B — Save** (same as Like, `SK = SAVE#<contentId>`, `entityType=save`)

Stronger signal than Like (per [ARCHITECTURE §8.3](../../../ARCHITECTURE.md#83-signals--recommendations-the-phase-1-goal)); same access pattern.

**Sub-shape C — Comment**

| Attr | Type | Notes |
|---|---|---|
| `PK` | S | `CONTENT#<contentId>` |
| `SK` | S | `COMMENT#<createdAt>#<commentId>` |
| `entityType` | S | `comment` |
| `commentId` | S | UUID |
| `userId` | S | author |
| `displayName` | S | snapshot (don't re-resolve User on read) |
| `body` | S | ≤4000 chars |
| `parentId` | S | nullable; another commentId (threaded) |
| `status` | S | `live | hidden | removed | pending` |
| `reportCount` | N | starts 0; auto-hide at 3 |
| `moderationScore` | N | Comprehend toxicity 0.0–1.0 |
| `createdAt` | S | ISO8601 |
| `editedAt` | S | nullable |
| `GSI1PK` | S | `USER#<userId>` |
| `GSI1SK` | S | `COMMENT#<createdAt>` |
| `GSI2PK` | S | `STATUS#<status>` (sparse — moderation queue) |
| `GSI2SK` | S | `<createdAt>` |

**Sub-shape D — Follow**

| Attr | Type | Notes |
|---|---|---|
| `PK` | S | `USER#<userId>` |
| `SK` | S | `FOLLOW#<targetKind>#<targetId>` (`AUTHOR`, `SERIES`, `SECTION`) |
| `GSI1PK` | S | `TARGET#<targetKind>#<targetId>` |
| `GSI1SK` | S | `FOLLOW#<createdAt>#<userId>` |

**Global Secondary Indexes (table-level)**

| Name | PK | SK | Use |
|---|---|---|---|
| **GSI1 `ByTarget`** | `GSI1PK` | `GSI1SK` | "who liked X" / "followers of X" / "user's comments" — single index serves all reverse-lookups |
| **GSI2 `ModerationQueue`** (sparse) | `GSI2PK` | `GSI2SK` | Moderation inbox — `Query PK=STATUS#pending` |

### 3.3 `Relations` — content-to-content graph

**Purpose:** typed, *editorial* edges between content items (story → adapted-as → movie; movie → has-soundtrack → music). Separate from Engagement because it's not user-driven.

**Keys**

- **PK** `CONTENT#<fromId>`
- **SK** `REL#<type>#<toId>`

**Attributes**

| Attr | Type | Notes |
|---|---|---|
| `relationType` | S | `sequel | prequel | soundtrack-of | from-story | in-world | adapted-from | inspired-by | companion` |
| `fromId` | S | UUID |
| `fromSection` | S | denormalized |
| `toId` | S | UUID |
| `toSection` | S | denormalized |
| `weight` | N | 0.0–1.0 — ranks the "related works" rail |
| `createdAt` | S | ISO8601 |
| `createdBy` | S | userId or `system` |
| `notes` | S | optional editorial note |
| `GSI1PK` | S | `CONTENT#<toId>` |
| `GSI1SK` | S | `REL#<type>#<fromId>` |

**GSI**

- **GSI1 `ReverseLookup`** — find relations *pointing to* a content item (so when viewing the future movie, you see "based on the story X").

**Write pattern:** every edge is written in **both directions** via `TransactWriteItems` (one forward, one inverse-typed mirror). Type pairings the Lambda enforces:

| Forward | Inverse |
|---|---|
| `from-story` | `adapted-from` |
| `sequel` | `prequel` |
| `soundtrack-of` | `has-soundtrack` |
| `inspired-by` | `inspired` |
| `in-world` | `in-world` (symmetric) |
| `companion` | `companion` (symmetric) |

### 3.4 `Users` — Phase 2 stub, Phase 3 real

**Purpose:** profile per user. Phase 2 the placeholder login modal writes `local-<uuid>` stub rows; Phase 3 Cognito post-confirmation Lambda writes real ones.

**Keys**

- **PK** `USER#<userId>` — userId = Cognito `sub` (P3) or `local-<uuid>` (P2)
- **SK** `PROFILE`

**Attributes**

| Attr | Type | Notes |
|---|---|---|
| `userId` | S | sub or local id |
| `provider` | S | `placeholder | cognito | google | apple | facebook` |
| `displayName` | S | |
| `handle` | S | unique within table |
| `avatarUrl` | S | S3 URL |
| `email` | S | encrypted at rest (default KMS) |
| `createdAt` | S | |
| `lastSeenAt` | S | |
| `consent` | M | `{analytics, marketing, personalization}` each `{value: bool, updatedAt: ISO8601}` |
| `prefs` | M | section-level prefs |
| `tasteVector` | M | Phase 4 — feature vector for recs |
| `role` | S | `user | mod | admin` |
| `schemaVersion` | N | |

**GSI**

- **GSI1 `ByHandle`** — `PK=HANDLE#<handle>`, `SK=USER` — handle uniqueness check + profile-by-handle URLs.

**Phase 2 ↔ Phase 3 transition:** the placeholder modal creates a `local-<uuid>` user in localStorage. Phase 3 swap: real Cognito sub replaces it; an account-merge Lambda re-points the local id's likes/comments to the real sub by rewriting the `userId` attribute on Engagement rows (small at indie scale).

### 3.5 `IdentityMap` — anon → user stitching

**Purpose:** stitch anonymous event history to the user on first login. Ships in **Phase 2** even though Cognito is Phase 3 — otherwise pre-login engagement is lost.

**Keys**

- **PK** `ANON#<anonymousId>` (UUID, generated client-side on first visit, persisted in localStorage)
- **SK** `USER#<userId>`

**Attributes**

| Attr | Type | Notes |
|---|---|---|
| `anonymousId` | S | |
| `userId` | S | placeholder local id (P2) or Cognito sub (P3) |
| `mergedAt` | S | ISO8601 |
| `mergeSource` | S | `placeholder-login | cognito-login | manual` |
| `GSI1PK` | S | `USER#<userId>` (reverse lookup) |
| `GSI1SK` | S | `ANON#<anonymousId>` |

**TTL:** none — needed for the lifetime of the user.

**How it's used:** every event envelope carries **both** `anonymousId` and `userId?`. Athena queries `LEFT JOIN events ON IdentityMap.anonymousId` to attribute pre-login activity to the eventual user.

### 3.6 Events lake — S3 Parquet (not DynamoDB)

Per ARCHITECTURE §8.2 — kept as-is.

- **Ingest:** API Gateway HTTP `/collect` → Lambda (validate + enrich envelope) → Firehose
- **Storage:** S3 Parquet, partitioned `s3://vr-events-<env>/<eventName>/year=YYYY/month=MM/day=DD/`
- **Catalog:** AWS Glue Data Catalog table, schema evolves automatically
- **Query:** Athena — partition pruning makes "last 7 days of `content_liked`" cost pennies

**Envelope schema** (every event):

| Field | Type | Notes |
|---|---|---|
| `messageId` | string (UUID) | dedup key |
| `eventName` | string | snake_case past tense — `page_viewed`, `content_liked`, `comment_posted`, etc. (full taxonomy in ARCHITECTURE §8.2) |
| `schemaVersion` | int | per-event-name versioning |
| `ts` | timestamp | ISO8601 — server-set on receipt |
| `userId` | string? | nullable until login |
| `anonymousId` | string | always present |
| `sessionId` | string | rotates after 30min idle |
| `consent` | struct | snapshot at event time |
| `context` | struct | `{page, referrer, device, locale, viewport, campaign?}` |
| `properties` | struct | event-specific payload (contentId, section, slug, …) |

---

## 4. API surface

All endpoints behind **API Gateway HTTP API** (cheaper than REST API at this scale) + **AWS Lambda** (TypeScript, AWS Lambda Powertools for tracing/idempotency/logging). One Lambda per logical group, not one per endpoint.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/catalog/:section` | GET | none | List items in section (paginated, newest-first) |
| `/catalog/:section/:slug` | GET | none | Get item by slug + cross-vertical relations |
| `/catalog/:section/:slug/related` | GET | none | Just the relations payload (separate for caching) |
| `/collect` | POST | none | Event ingest — envelope validation + Firehose write |
| `/identify` | POST | placeholder-jwt | anon→user merge — writes IdentityMap |
| `/like` | POST / DELETE | placeholder-jwt | Toggle like (conditional write) |
| `/save` | POST / DELETE | placeholder-jwt | Toggle save |
| `/comment` | POST | placeholder-jwt | Post comment (runs moderation §6) |
| `/comment/:id` | DELETE | placeholder-jwt OR mod | Soft-delete |
| `/comment/:id/report` | POST | placeholder-jwt OR anon | Report comment (increments `reportCount`) |
| `/follow` | POST / DELETE | placeholder-jwt | Toggle follow |
| `/me/library` | GET | placeholder-jwt | A user's likes + saves + follows |

**Placeholder JWT** in Phase 2: a self-signed JWT minted by the placeholder login modal carrying `local-<uuid>` as `sub`. Validated by a shared Lambda authorizer that becomes the Cognito authorizer in Phase 3 (interface is identical — only the verify-step changes).

**Site read path:**
- **At build:** `pnpm content:build-snapshot` (NEW — replaces or augments `content:pull`) calls `GET /catalog/<section>` for each section, writes JSON snapshots into `apps/web/.content-cache/`, build proceeds against that. Keeps the static export.
- **At runtime:** engagement reads (`likeCount`, `commentCount`, "have I liked this") are client-fetched after hydration — they're frequently changing and don't need to be in the static HTML.

---

## 5. Abuse protection — defense in depth

For every public write endpoint:

| Layer | What | Cost |
|---|---|---|
| **L1 — Cloudflare Turnstile (invisible)** | Token minted client-side on form submit, verified server-side in the write Lambda. Kills ~95% of drive-by bots. | $0 (free, unlimited) |
| **L2 — AWS WAF rate-based rule** | Attached to API Gateway. Threshold: 500 req per 5min per IP for writes. | ~$5/mo WebACL + $1/rule + $0.60/M req |
| **L3 — API Gateway stage throttling** | Burst 50 req/s, steady 100 req/s. Stage-level (no API keys — never distribute keys on a static frontend). | $0 |
| **L4 — Powertools idempotency** | Every write accepts `Idempotency-Key` header; Powertools persists the key in DynamoDB with TTL. Dedupes retries + spam. | Pennies |
| **L5 — DynamoDB conditional writes** | Likes/Saves: `attribute_not_exists(PK)` rejects double-likes at the database. Conditional writes are themselves idempotent (atomic counters are not). | $0 |
| **L6 — Streams aggregator for counts** | `likeCount`/`commentCount` on Catalog updated by a Stream Lambda processing Engagement table changes. Spam-reversal is "delete bad rows; trigger recount." | ~$0 at scale |

**What we explicitly skip in P2:** WAF Bot Control add-on ($10/M req — overkill until traffic grows ~10×).

---

## 6. Comment moderation pipeline

For every comment POST:

```
1. Rule prefilter (in Lambda, free)
   - regex deny-list (slurs, link-only posts, ALL CAPS over N chars)
   - length cap (4000)
   - dedup by body-hash within 60s window
   - reject early on hit → 422

2. Amazon Comprehend Toxicity (`detectToxicContent`)
   - $0.0001 per 100-char unit
   - 50k units/mo free for the first 12 months
   - returns scores: hate_speech, harassment_or_abuse, insult,
     sexual, violence_or_threat, profanity, graphic

3. Decision based on max score:
   - score ≥ 0.7  → status = hidden    (don't surface; appears in mod queue)
   - score 0.3–0.7 → invoke Bedrock Claude Haiku contextual judge
                    with site policy in system prompt
                    → status = live | pending | hidden per judge
   - score < 0.3  → status = live

4. Persist row with `status` + `moderationScore`.
```

**Report flow:** `POST /comment/:id/report` → `UpdateItem reportCount += 1` with a conditional clause that flips `status` to `hidden` when `reportCount >= 3` (configurable per ARCHITECTURE §13). Hidden comments surface in `Query GSI2 PK=STATUS#hidden` for the mod inbox.

**Shadow-ban:** users flagged `shadow=true` see their own posts; nobody else does. Cheapest effective primitive for repeat offenders.

**First-post friction:** accounts < 24h old get a second Comprehend pass + can't post links.

**Do NOT use:** Perspective API — Google sunsets Dec 31 2026 with no migration path.

---

## 7. Content sync + scheduler

### 7.1 S3 → Catalog sync Lambda

**Trigger:** S3 ObjectCreated on `s3://visurena-content-<env>/**/item.json`.

**Behavior:**
1. Parse `item.json`.
2. Conditional `PutItem` into Catalog with `updatedAt` check — idempotent on retries.
3. If `related[]` is present, write Relations edges via `TransactWriteItems` (both directions, see §3.3).
4. If `status=scheduled`, register a one-time EventBridge Scheduler entry at `publishAt`.
5. If `status=live`, emit `content_published` event + trigger §7.3 invalidation.

### 7.2 EventBridge Scheduler — publish flips

Use **EventBridge Scheduler** (newer, scales better) not classic EventBridge rules. One-time schedules created per content item at `publishAt`. On fire:

1. `UpdateItem` Catalog: `status = live`.
2. Trigger §7.3 invalidation.
3. Emit `content_published` event to the lake.

### 7.3 CloudFront invalidation + snapshot regen

On publish:

1. Invalidate `/`, `/<section>`, `/<section>/<slug>` (3 paths — first 1000 paths/mo free).
2. Regen the Fuse.js search index JSON in S3.
3. Regen sitemap.xml + RSS feeds.
4. **Cache strategy:** short HTML TTL (60s) + long hashed-asset TTL → most publishes need *zero* CloudFront invalidation in practice.

---

## 8. Observability & ops

| Item | What |
|---|---|
| **CloudWatch dashboards** | One per service: `api`, `content-sync`, `scheduler`, `collect`, `moderation`. Panels: p50/p99 latency, error rate, throttle rate, cold-start rate. |
| **Alarms** | Per-Lambda error rate > 5% over 5min; per-table UserErrors/SystemErrors > 0; throttles > 0; billing alarms at $10 / $25 / $50. |
| **PITR** | Enabled on all 5 tables. Restore from bad migrations in a single click. |
| **GDPR deletion** | `deleteUser(sub)` Lambda fan-out: Cognito delete → DynamoDB `Query+Delete` on `USER#<sub>` partition across all 5 tables → S3 Find-and-Forget on the events lake. Phase 2 ships a stub script; Phase 3 wires it to a self-service request. |
| **Schema versioning** | `schemaVersion` attribute on every row; migrations live in `infrastructure/cdk/migrations/<NNNN>-<slug>.ts`, run via CDK custom resource. |
| **Cost guard rails** | AWS Budgets alert at $10/$25/$50; daily Cost Explorer snapshot delivered to a small dashboard. |

---

## 9. Gap closure vs current PHASES.md §2

| Original task | What changes |
|---|---|
| 2.1 CDK foundation | Kept verbatim |
| 2.2 single-table | **Replaced** with multi-table per D34 — 5 tables |
| 2.3 event-capture | Kept + add IdentityMap + dual-id event envelope per D37 |
| 2.4 Likes + Save | Kept + add idempotency + Streams counter aggregator (D41) |
| 2.5 Comments | Kept + add moderation pipeline §6 |
| 2.6 Placeholder login | Kept + clarify `useAuth()` interface for Phase-3 swap |
| 2.7 Request board | Deferred to Phase 2.5 — not in this spec |

**New tasks not in current PHASES.md:**

| New | Why |
|---|---|
| 2.2b S3 → Catalog sync Lambda | Makes the table the read surface |
| 2.3b EventBridge Scheduler for publish flips | Closes the "scheduled→live" gap |
| 2.5b Moderation pipeline | Prevents the "bad week after launch" scenario |
| 2.8 Abuse layer (WAF + Turnstile + idempotency) | Public endpoints get discovered within days |
| 2.9 IdentityMap table + dual-id envelope | Must ship in P2 or pre-login signal is lost |
| 2.10 GDPR delete stub | Easier to wire now than retrofit later |
| 2.11 Observability dashboards + alarms + PITR | Bites in week 2, not week 1 |
| 2.12 Schema versioning convention | All tables rot without this |
| 2.13 CloudFront invalidation + sitemap + search-index regen on publish | SEO + freshness |

---

## 10. Updated Phase 2 task list

(To replace [PHASES.md §2](../../PHASES.md) once spec is approved.)

### 2.1 CDK foundation
- [ ] Scaffold CDK app in `infrastructure/cdk/` (TypeScript), one app, per-env stacks (`alpha`, later `prod`).
- [ ] Migrate existing infra into CDK over time: site bucket, CloudFront `E19J2MV0E1W0DD` + `visurena-rewrite-index` function, content bucket.
- [ ] CI: `cdk deploy` on infra changes (separate workflow from fast content/site deploy).
- [ ] Tests: CDK fine-grained assertions / snapshot on the synthesized stack.

### 2.2 DynamoDB tables (multi-table per D34)
- [ ] Define 5 tables: `Catalog`, `Engagement`, `Relations`, `Users`, `IdentityMap`. All on-demand, PITR enabled, default KMS.
- [ ] Define all GSIs per §3.
- [ ] `packages/core`: typed access functions per table — `catalog`, `engagement`, `relations`, `users`, `identityMap`.
- [ ] Tests: unit test each access function (aws-sdk-client-mock).

### 2.2b S3 → Catalog sync Lambda
- [ ] Lambda triggered by S3 ObjectCreated on `**/item.json`.
- [ ] Conditional PutItem to Catalog; Relations edges via TransactWriteItems.
- [ ] Tests: unit + integration (LocalStack or fixtures).

### 2.3 Event capture pipeline
- [ ] `/collect` endpoint (API GW HTTP + Lambda): validate canonical envelope → enrich → Firehose.
- [ ] Firehose → S3 (Parquet, partitioned `eventName/date`) + Glue Catalog + Athena named-queries.
- [ ] Client emitter in `packages/core` (anonymousId, sessionId, consent, dual-id envelope) used by `apps/web`.
- [ ] Wire anonymous capture: `page_viewed`, `content_viewed`, `read_progress`.
- [ ] Tests: envelope validation + Lambda handler units.

### 2.3b EventBridge Scheduler — publish flips
- [ ] On Catalog insert/update with `status=scheduled`, register one-time schedule at `publishAt`.
- [ ] Scheduler Lambda: flip status → live, invalidate CloudFront paths, regen search index + sitemap + RSS.
- [ ] Tests: scheduler creation + flip + invalidation.

### 2.4 Likes + Saves
- [ ] API: like/unlike, save/unsave (conditional write idempotency).
- [ ] DynamoDB Streams aggregator Lambda → updates `likeCount` / `saveCount` on Catalog.
- [ ] Emit `content_liked` / `content_saved` events.
- [ ] Web: like/save controls on cards + detail; optimistic UI; counts hydrate client-side.
- [ ] Logged-out click → placeholder login modal (2.6).
- [ ] Tests: API + Stream handler + web component.

### 2.5 Comments
- [ ] API: post / list / delete (threaded `parentId`).
- [ ] Web: comment thread on detail; posting requires placeholder login.
- [ ] Tests: API + component.

### 2.5b Moderation pipeline
- [ ] Rule prefilter in comment Lambda.
- [ ] Comprehend Toxicity integration.
- [ ] Bedrock Claude Haiku integration for gray-zone (0.3–0.7).
- [ ] Auto-hide on `reportCount >= 3` (conditional update).
- [ ] Mod inbox API (`/mod/queue`) + minimal web view.
- [ ] Tests: each stage + end-to-end happy + bad path.

### 2.6 Placeholder login gate
- [ ] Jewel-themed login modal triggered by gated actions; stub identity stored in localStorage; mints a self-signed JWT.
- [ ] `useAuth()` interface in `packages/core` so Phase 3 swaps Cognito in with minimal change.
- [ ] Shared Lambda authorizer that validates either the stub JWT (P2) or Cognito JWT (P3).
- [ ] Tests: gate fires on like/comment/save/follow when logged-out.

### 2.8 Abuse protection
- [ ] Cloudflare Turnstile (invisible) on every write surface; token verified in Lambda.
- [ ] AWS WAF WebACL with rate-based rule attached to API Gateway.
- [ ] API Gateway stage throttling (50/100 req/s).
- [ ] Lambda Powertools idempotency on every write handler.
- [ ] Tests: rate-limit triggers + idempotent retry.

### 2.9 Identity stitching
- [ ] `IdentityMap` table (created in 2.2).
- [ ] `/identify` endpoint writes the map row on first login.
- [ ] Client SDK in `packages/core` always sends `anonymousId` + `userId?` in event envelope.
- [ ] Athena named-query: events LEFT JOIN IdentityMap.
- [ ] Tests: pre-login events attribute correctly after login.

### 2.10 GDPR deletion stub
- [ ] `deleteUser(sub)` Lambda: cascades across all 5 tables; Phase 2 = manual invocation; Phase 3 = wired to self-service.
- [ ] S3 Find-and-Forget plan for the events lake (documented; runs quarterly).
- [ ] Tests: cascade correctness.

### 2.11 Observability
- [ ] CloudWatch dashboards per service.
- [ ] Alarms: error rate, throttles, billing ($10/$25/$50).
- [ ] PITR on all 5 tables.
- [ ] AWS Budgets alert at $10/$25/$50.

### 2.12 Schema versioning
- [ ] `schemaVersion` attribute on every row.
- [ ] `infrastructure/cdk/migrations/` convention + CDK custom-resource runner.
- [ ] Docs in ARCHITECTURE.md §8 update.

### 2.13 Search-index + sitemap regen on publish
- [ ] Wire into the Scheduler Lambda (§2.3b).
- [ ] Fuse.js index JSON written to S3, served from CloudFront.
- [ ] sitemap.xml + RSS feeds per section.
- [ ] Tests: regen on publish; no regen on draft.

---

## 11. Phasing within Phase 2

Suggested implementation order (each row is one sub-plan; pause + verify between rows):

| Order | Bundle | Why this order |
|---|---|---|
| 1 | 2.1 + 2.12 | Foundation + versioning convention land first |
| 2 | 2.2 + 2.2b + 2.11 | Tables, sync from S3, observability — site can render from API |
| 3 | 2.3 + 2.9 | Event ingest with dual-id envelope from day 1 |
| 4 | 2.6 + 2.8 | Placeholder auth + abuse layer before any write surface ships |
| 5 | 2.4 + 2.5 + 2.5b | Engagement with moderation in the same shipment |
| 6 | 2.3b + 2.13 | Scheduler + sitemap/search regen |
| 7 | 2.10 | GDPR stub (ship before public launch) |

---

## 12. Risks & mitigations (in addition to ARCHITECTURE §12)

| Risk | Mitigation |
|---|---|
| Multi-table sprawl makes simple queries cross-table | All five tables map to clean domain boundaries; engagement aggregates land on Catalog via Streams |
| Comprehend false positives anger users | Gray-zone routing to Bedrock Haiku + visible appeal/unhide path in mod UI |
| Anonymous→user merge happens on shared family laptop → wrong attribution | Single-device-only in P2 (documented); explicit cross-device reconciliation deferred |
| Turnstile blocks legitimate users behind privacy add-ons | Server-side allow-list bypass for first 5 events per IP per day; fall back to visible challenge |
| EventBridge Scheduler quota exceeded | Default soft quota 1M schedules; review at 100k items |
| Bedrock Haiku quota / regional availability | Use us-west-2 (primary infra region); set per-account quota alarm |

---

## 13. Open questions for owner

1. **`section` naming** — keep `section` (codebase consistency) or rename everywhere to `category`? Default: keep `section`.
2. **`journal` + `research` separate sections, or one with research-as-a-tag?** Default: separate (matches nav exactly).
3. **Anonymous reports allowed?** Logged-in-only reports are easier to abuse-control but reduce the report surface. Default: logged-in-only in P2.
4. **Comment edit window?** Default: 5 minutes after post; edited comments rerun moderation.
5. **Placeholder JWT lifetime?** Default: 30 days (localStorage persistence).

---

## 14. Out of scope (explicit)

- Real auth (Cognito) — Phase 3
- Recommendation engine — Phase 4+
- Full-text search (beyond Fuse.js index regen) — Phase 5
- Mobile app surfaces — separate track
- Multi-language content — deferred
- Demand / request board — Phase 2.5
- WAF Bot Control add-on — defer until 10× traffic
- SES Follow→email digest — Phase 3.3
- Cross-device anon→user reconciliation — Phase 3+

---

## 15. Sources (research-backed)

- DynamoDB design: [AWS DB Blog — single vs multi-table](https://aws.amazon.com/blogs/database/single-table-vs-multi-table-design-in-amazon-dynamodb/), [DeBrie — single-table](https://www.alexdebrie.com/posts/dynamodb-single-table/), [Momento](https://www.gomomento.com/blog/single-table-design-for-dynamodb-the-reality/), [Nordcloud](https://nordcloud.com/tech-community/problems-with-dynamodb-single-table-design/)
- Identity stitching: [Segment Alias spec](https://segment.com/docs//connections/spec/alias/), [Snowplow Identities](https://snowplow.io/blog/introducing-snowplow-identities), [Snowplow dbt stitching](https://docs.snowplow.io/docs/modeling-your-data/modeling-your-data-with-dbt/package-features/identity-stitching/), [Cognito post-confirmation trigger](https://lucvandonkersgoed.com/2022/01/10/anonymous-user-identities-with-cognito-lambda-triggers/)
- Abuse: [WAF + API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html), [Turnstile GA](https://blog.cloudflare.com/turnstile-ga/), [Powertools idempotency](https://docs.aws.amazon.com/powertools/typescript/2.1.1/utilities/idempotency/), [DynamoDB conditional writes](https://cloudmaterials.com/en/blog-entry/dynamodb-conditional-operations-and-atomic-counters), [resource counters](https://aws.amazon.com/blogs/database/implement-resource-counters-with-amazon-dynamodb/)
- Moderation: [Comprehend pricing](https://aws.amazon.com/comprehend/pricing/), [Comprehend toxicity launch](https://aws.amazon.com/blogs/aws/new-for-amazon-comprehend-toxicity-detection/), [AWS — moderate chats with AI + LLMs](https://aws.amazon.com/blogs/machine-learning/moderate-audio-and-text-chats-using-aws-ai-services-and-llms/), [Perspective sunset](https://www.lassomoderation.com/blog/perspective-api/), [Tumblr Smart Moderation](https://help.tumblr.com/knowledge-base/moderating-communities/), [Substack moderation](https://on.substack.com/p/a-guide-to-substacks-moderation-tools)
- Ops: [EventBridge serverless scheduling](https://aws.amazon.com/blogs/architecture/serverless-scheduling-with-amazon-eventbridge-aws-lambda-and-amazon-dynamodb/), [DynamoDB PITR](https://aws.amazon.com/dynamodb/pricing/on-demand/), [GDPR + DynamoDB](https://aws.amazon.com/blogs/database/building-a-gdpr-compliance-solution-with-amazon-dynamodb/), [S3 Find-and-Forget](https://aws.amazon.com/blogs/big-data/handling-data-erasure-requests-in-your-data-lake-with-amazon-s3-find-and-forget/), [CloudFront invalidation pricing](https://oneuptime.com/blog/post/2026-02-12-invalidate-cloudfront-cache/view), [DynamoDB schema migration](https://medium.com/@technogise/dynamodb-schema-migration-made-easy-915f371674dc)
