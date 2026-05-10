# schemas/

Cross-repo content contracts for the ViSuReNa ecosystem.

## What lives here

JSON Schema files that define the shape of every content type and data type that crosses repo boundaries:

- `blog-post.schema.json` — articles produced by `visurena-blog-engine`
- `story-chapter.schema.json` — chapters produced by `visurena-story-engine`
- `track.schema.json` — music tracks produced by `visurena-music-engine`
- `film.schema.json` — films produced by `visurena-film-engine`
- `game.schema.json` — playable games produced by `visurena-game-engine`
- `manifest.schema.json` — the shape of `s3://visurena-content/manifest.json`
- `taste-input.schema.json` — user-submitted "what I love + why"
- `feedback.schema.json` — user reactions to content items
- `event.schema.json` — user interaction events

## Status

**Phase 0:** this directory currently contains only this README. Schema files will be authored as Phase 1 begins, when the first content engine (`visurena-blog-engine`) needs a target to validate against.

See [BRD § 9](../BRD.md#9-data-model--schemas--the-contract) for the schema-as-contract principle and example schemas (BRD Appendix A).

See [ARCHITECTURE § 8.1](../ARCHITECTURE.md#11-architectural-principles--invariant-across-phases) for versioning, migration, and how other repos consume these schemas.

## Versioning

Each schema file's `version` property follows semver:

- **Backward-compatible additions** (new optional fields) → minor version bump
- **Breaking changes** (renames, type changes, new required fields) → major version bump, coordinated migration across all consuming repos

## How other repos use these

Two acceptable patterns:

1. **Git submodule** — engine repo includes this `schemas/` folder as a submodule pinned to a commit
2. **Vendored copy** — engine repo copies the schema files into `vendor/visurena-schemas/` with a `SCHEMA_VERSION` file noting the commit hash

Either is fine. The pin MUST be explicit; engines MUST NOT track `main` of this repo's schemas.
