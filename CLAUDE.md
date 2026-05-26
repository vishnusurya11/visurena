# CLAUDE.md — Visurena project

## ⚠️ Critical rule: keep ARCHITECTURE.md updated
**[ARCHITECTURE.md](ARCHITECTURE.md) is the living source of truth for this project's
architecture.** Whenever an architecture decision is made, changed, or removed, update
ARCHITECTURE.md in the *same* change — the decisions table (§2), the diagram (§4), and the
change log (§13). Never let it drift from reality. This is important to the owner.

## What this project is
Visurena — a cinematic creative studio platform (Stories, Movies, Music, Games) being
rebuilt from a static site into a real platform with automated content infrastructure,
accounts, engagement, interaction analytics, and search. Built React-first so a future
mobile app can reuse the design tokens + logic.

## Current status
🟢 **Design approved (2026-05-23).** Implementation not started. Building begins with
**Step 0 (monorepo foundation)** + **Step 1 (visual redesign + nebula background)**.
See ARCHITECTURE.md §3 for the full build order. Implementation plans live in
`docs/superpowers/plans/`.

## Key locked decisions (see ARCHITECTURE.md §2 for the full table)
- Rebuild **in-place** on the existing Next.js app → becomes `apps/web` in a pnpm+Turborepo monorepo.
- Look: **"The Studio"** direction, **jewel** palette on black, **drifting nebula-gas** background (CSS/SVG), per-item color immersion.
- Architecture: **All-AWS serverless** — S3 + CloudFront, API Gateway + Lambda, DynamoDB, Cognito, EventBridge.
- Auth: **AWS Cognito** (Google / Apple / Facebook / email+password). AWS stores credentials, never us.
- Content: lives in **S3** (NOT git) as **structured JSON** (+ assets), one self-contained folder per work at `section/YYYY/MM/DD/slug/`; **no admin panel** — automation (`content-sync` + `scheduler`) ingests folders and **auto-publishes** works/chapters on schedule.
- Data model: `Content · Relations · Users · Likes · Progress · Comments · Follows` (DynamoDB) + an append-only `Events` log → S3/Athena.
- IaC: **AWS CDK** (TypeScript) → synthesizes CloudFormation.
- Mobile: **monorepo now**, shared `design-tokens` + `core` packages for a future React Native/Expo app.
- Budget: lowest-cost / scale-to-zero first; ~$10/mo ceiling for now.
- Deferred for now: multi-language/translations.

## Source material
- New design template (do not edit; reference only): `../visurenawebtemp/` — "The Studio" homepage + jewel palette + screenshots.
- Existing app being rebuilt: `visurena-next/` (Next.js + Tailwind, static export to S3/CloudFront).
