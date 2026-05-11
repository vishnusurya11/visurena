# ViSuReNa

A demand-driven AI content studio where the audience tells us what to make, and we make it — chapter by chapter, track by track, scene by scene.

**Live site:** [visurena.com](https://visurena.com)

## Documentation

The ViSuReNa ecosystem spans multiple repos. Three documents at this repo's root are the canonical sources of truth — referenced by every other repo in the ecosystem:

| Document | What it covers | Read this when… |
|---|---|---|
| **[BRD.md](BRD.md)** | Product vision, scope, phases, success metrics, monetization, data ethics | You want to understand WHAT ViSuReNa is and WHY |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture by phase: topology, contracts, IaC patterns, sequence diagrams, runbooks | You're building or integrating with the system |
| **[CLAUDE.md](CLAUDE.md)** | Guidance for Claude Code working in *this specific repo* (the platform repo) | You're using Claude Code on this codebase |

Other repos in the ecosystem (`visurena-blog-engine`, `visurena-story-engine`, `visurena-music-engine`, `visurena-film-engine`, `visurena-game-engine`, `visurena-orchestration`, `visurena-analytics`) MUST link back to BRD.md and ARCHITECTURE.md at the pinned commit they were built against.

---

## Local development

The Next.js app lives in `apps/web/`. All `npm` commands run from there.

```bash
cd apps/web
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to apps/web/out/
npx tsc --noEmit     # type-check
```

## Deployment

Push to `master` or `main` → GitHub Actions builds and deploys to S3 + CloudFront automatically. See [CLAUDE.md § Deployment](CLAUDE.md#deployment) for required secrets and the manual-deploy scripts.

## Content authoring (current, file-based)

In Phase 1+ this migrates to the manifest pattern (see [ARCHITECTURE § 3](ARCHITECTURE.md#3-phase-1-architecture--recommendation-engine-live)). Today:

- **Blog posts:** drop `.md` or `.html` files in `apps/web/posts/` — see [docs/blog-guide.md](docs/blog-guide.md).
- **Movies / music / games / stories cards:** edit `apps/web/content-config.json` — see [docs/content-management.md](docs/content-management.md).
