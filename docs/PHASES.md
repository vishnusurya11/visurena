# Visurena — Phase execution plan (task level)

The **what-to-do**, task by task. The **why** lives in [ARCHITECTURE.md](../ARCHITECTURE.md)
(decisions §2, data model §8). This file is the working checklist.

**Working rules ([CLAUDE.md](../CLAUDE.md)):** commit/push **only when the owner asks** ·
**write + run tests** for every function · **alpha now, prod later** — test in alpha, then
promote to prod (keep changes env-aware).

**Architecture for Phases 2–3:** static frontend (S3/CloudFront) **+ serverless API**
(API Gateway + Lambda + DynamoDB), all defined in **AWS CDK**. Not SSR. (ARCHITECTURE D28.)

---

## Status
- ✅ **Phase 0 — Foundation:** pnpm + Turborepo monorepo, `apps/web`, `design-tokens / ui / core / config`.
- ✅ **Phase 1 — Redesign + content:** "The Studio" jewel design, nebula bg, all pages; **stories served from the S3 content bucket** (`content:pull` → `next build`); live on visurena.com.
- 🔜 **Phase 2 — Serverless data + engagement** (this doc).
- 🔜 **Phase 3 — Real auth (Cognito)** — ships **together with** Phase 2.

---

## Phase 2 — Serverless data + engagement layer

### 2.1 CDK foundation (the "better deployments")
- [ ] Scaffold CDK app in `infrastructure/cdk/` (TypeScript), one app, **per-env stacks** (`alpha`, later `prod`).
- [ ] Stack: DynamoDB table, event-ingest API, Firehose→S3 lake, Glue+Athena.
- [ ] Migrate existing infra into CDK over time: site bucket, CloudFront `E19J2MV0E1W0DD` + the **`visurena-rewrite-index`** function ([infrastructure/cloudfront-rewrite-index.js](../infrastructure/cloudfront-rewrite-index.js)), content bucket.
- [ ] CI: `cdk deploy` on infra changes (separate from the fast content/site deploy).
- [ ] **Tests:** CDK fine-grained assertions / snapshot on the synthesized stack.

### 2.2 DynamoDB single-table + access layer
- [ ] Define the table (on-demand) + GSI1 per [ARCHITECTURE §8.1](../ARCHITECTURE.md#8-data-model).
- [ ] `packages/core`: typed access functions — `Content, User, Like, Save, Comment, Follow, Request, RequestVote, Recommendation`.
- [ ] **Tests:** unit test each access function (DynamoDB Local or aws-sdk-client-mock).

### 2.3 Event-capture pipeline
- [ ] `/collect` endpoint (API GW HTTP API + Lambda): validate canonical envelope → enrich → Firehose.
- [ ] Firehose → S3 (Parquet, partitioned `event_type/date`) + Glue Catalog + Athena.
- [ ] Client emitter in `packages/core` (anonymousId, sessionId, consent) used by `apps/web`.
- [ ] Wire **anonymous** capture: `page_viewed`, `content_viewed`, `read_progress`.
- [ ] **Tests:** envelope validation + Lambda handler units.

### 2.4 Likes + Save
- [ ] API: like/unlike, save/unsave → DynamoDB write + emit `content_liked`/`content_saved`.
- [ ] Web: like/save controls on cards + detail; optimistic UI; counts hydrate client-side.
- [ ] Logged-out click → **placeholder login modal** (2.6).
- [ ] **Tests:** API handlers + a web component test.

### 2.5 Comments
- [ ] API: post / list / delete (threaded `parentId`), report flag, moderation `status`.
- [ ] Web: comment thread on story/game detail; posting requires login (placeholder).
- [ ] **Tests:** API + component.

### 2.6 Placeholder login gate (seam for Phase 3)
- [ ] Jewel-themed login modal triggered by gated actions; **stub** identity stored locally so the flow is demoable end-to-end.
- [ ] Clean interface (`useAuth()`-style) so Phase 3 swaps Cognito in with minimal change.
- [ ] **Tests:** gate fires on like/comment/save when logged-out.

### 2.7 Demand / Request board  *(optional in P2 — can slip to P2.5)*
- [ ] `Request` + `RequestVote` entities; submit / upvote / status; `request→producedWork` link.
- [ ] Web: per-room request board (submit + upvote + status), emits `request_*` events.
- [ ] **Tests.**

---

## Phase 3 — Real authentication (ships with Phase 2)

### 3.1 Cognito
- [ ] User pool: email/password + Google / Apple / Facebook; **custom jewel login UI** (Amplify Auth).
- [ ] Post-confirmation Lambda → `USER#<sub>` row; pre-token Lambda → role/flag claims.
- [ ] API Gateway **JWT authorizer** on gated endpoints (like/save/comment).

### 3.2 Swap placeholder → real
- [ ] Replace the placeholder `useAuth()` with Cognito; bind like/save/comment to `USER#<sub>`.
- [ ] **Stitch `anonymousId` → `userId`** on first login (merge anonymous engagement signal).

### 3.3 Per-user features
- [ ] Progress / continue-reading; Follows + SES release notify; "your likes / library".
- [ ] **Tests** across.

---

## Phase 4+ (later — not now)
- **Recommendations** — DIY: popularity / co-occurrence → collaborative filtering (feature vectors in DynamoDB, served via Lambda).
- **Search** — Fuse.js index → OpenSearch later.
- **Analytics dashboards** over the Athena lake.
- **Expo mobile app** (reuses `design-tokens` + `core`).
- **SSR/ISR evaluation** — only if instant-publish-with-SEO becomes a requirement (D28).
- **Games → S3/dynamic** content model (today they're repo `content-config.json`).

---

## Definition of done (every task)
1. Function has **tests**; `pnpm -C apps/web test` (+ relevant package tests) **green**.
2. Works in **alpha**; promotion to prod is a config swap (env-aware — D33 / alpha-prod).
3. **Nothing committed or pushed** until the owner asks.
