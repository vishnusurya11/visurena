# Research tab + YouTube shorts on the site + one publishing pipeline — brainstorm

**Date:** 2026-10-22 · **Status:** owner said "go" on the recommended defaults; PR-A and PR-B
built locally (not committed), PR-C not started. Three agents surveyed `visurena_studio`, the
website repo, and the YouTube/publishing landscape; this is the merge.

### Build status (2026-10-22)
| Item | State |
|---|---|
| Defaults taken | Research = studio nav item (sapphire) · Markdown/HTML for research only (D37) · local drop now, S3 later · series-only shorts feed (no API key) · six articles list, H3 media hold kept |
| PR-A ingest fallback + shorts | **Built.** WotW 27/27 and Jekyll 1/10 now on the site; playlist + whole-book links; Home "Latest shorts" shelf + Subscribe; fitted posters |
| PR-B research section | **Built.** `/research`, `/research/[slug]`, `lib/research.ts`, Scholar meta, JSON-LD, BibTeX, RSS; three articles in `../website_data/research/2026/10/22/` (upscaler benchmark, capacity model n = 1, Story Department report) |
| PR-C S3 export + Actions + Zenodo | **Not started** (D38 proposed). Touches AWS, GitHub and Zenodo, so it waits for an explicit go |
| Still open for the owner | ORCID id; public research repo name; review the three article texts before any push; unlist WotW ep16 duplicates `qXqY1ge1RMo`, `vivwJZD29gU` |

---

## 0. The brick (one rule that regenerates all three asks)

> **A public work is one self-contained, dated folder with an `item.json`; the site is a build-time
> projection of the set of folders.** (already locked: D10, D21, D22, D35)

Stories already follow it. Shorts follow it through the studio ledger → `series.json` (D35).
A research article is just a third `section`. Nothing new is invented below; every feature is this
rule applied to one more kind of folder, plus a fan-out at the end (RSS / DOI / cross-post).

```
visurena_studio                      S3 visurena-content-<env>            apps/web (static export)
──────────────────                   ─────────────────────────            ────────────────────────
library/<book>/uploads.jsonl ──┐     movies/2026/09/12/<series>/item.json  /movies, /movies/[s]/[ep],
episodes/epNN/youtube.json ────┤──▶  research/2026/10/21/<slug>/item.json ─▶ "Latest shorts" shelf,
docs/audit/<date>_<bench>/ ────┘     stories/2026/…/<slug>/item.json        /research, /research/[slug],
                                                                           feed.xml, sitemap, JSON-LD
          publish department (studio)          content:pull + build (GH Actions, alpha → prod)
```

---

## 1. What is true today (verified 2026-10-22)

**Channel.** "The Keeper's Lantern", `https://www.youtube.com/@TheKeepersLantern`,
id `UCyjo8L-DEJaeGuufUqMpigw`. 65 subs · 80 public videos · ~14.1k views. RSS feed works
(latest 15, no key). Book playlists verified live: Scarlet `PLWwu0OoN4CkQ` (14), War of the Worlds
`PLO5yijZWcZlY` (27), Jekyll `PLG7jS28mfkpo` (1). All 13 recent episodes are Shorts; the two
"Full Story Adaptation" compilations are regular videos.

**Ledgers.** Scarlet 14/14 published + compilation `HOLHQEN0Gic`. WotW 27/27 + compilation
`HSn8Gl7mnyA`. Jekyll 1/10 (`bHj8WAY4rWE`, public 2026-10-21). Aspect is mixed: early Scarlet
9:16, Scarlet ep14 / WotW / Jekyll 1:1, trailers 16:9. No trailer has a YouTube id.

**The site today misses two of the three books.** `apps/web/scripts/ingest-studio.mjs` requires
`SERIES_PROGRESS.json`; only Scarlet has one. WotW and Jekyll only have `uploads.jsonl` +
`episodes/epNN/youtube.json`. So `content-local/series.json` shows Scarlet and nothing else.

**Research surface.** `apps/web/pages/research.tsx` exists as a jewel-era "Coming soon"
placeholder (Sapphire), linked from the footer "Studio" column and from `/about`. No lib, no
content source, no article page. ARCHITECTURE.md §6.5 already reserves the rich generation
metadata "for the Research/field-notes surface".

**Research material.** The studio's git-ignored `docs/audit/` holds ~40 dated benchmark folders,
the best of them pre-registered (`PREREG.md → REPORT.md → two critiques → REBUTTAL.md →
VERDICT.md → 00_SUMMARY.png`). `docs/audit/2026-10-21_growth_publishable/REPORT.md` Part B already
ranks publishable packages (smallface-bench paper, ComfyUI-FaceGate, comfy-replay, a system paper).
The architecture page (`architecture/index.html`, published at
https://claude.ai/artifact/6HCxs36mcpFk2TJS389QXr) is a self-contained interactive HTML report.
The studio repo is public on GitHub with an Apache-2.0 LICENSE (added 2026-10-21).

---

## 2. Shorts and the channel on the site

### 2.1 Fix the source first (blocks everything else)
Make the ingest derive a series from `uploads.jsonl` + `episodes/epNN/youtube.json` when
`SERIES_PROGRESS.json` is absent. Rules the ledger needs:
- live set = last row per `video_id`, drop `{"event":"deleted"}` ids, require public privacy;
- one video per episode: newest public upload wins (WotW ep16 has three public uploads; pick
  `keQliW8rWNE` and flag the other two for the owner to unlist);
- `kind: short | video` per entry (episodes = short, compilations = video) and `aspect` from the
  master (`ffprobe`, already done);
- compilations become a `related: [{type:"compilation"}]` entry on the series, not an episode;
- poster fallback when `title/book/` is missing (Jekyll): `title/ep01.png`.

Longer term the studio's publish step writes `item.json` itself (the architecture page's Future
tab already proposes a publish department), and the site stops parsing ledgers.

### 2.2 Where it shows
- **Home:** a "Latest shorts" shelf (`getLatestEpisodes` + `MediaCard` 1:1 / 9:16 already exist)
  and a channel line: "80 videos · 65 subscribers · Subscribe" linking to the handle.
- **/movies:** per-series "Watch in order on YouTube" (playlist link), compilation card, trailer
  slot once a trailer is uploaded.
- **New `/shorts` (optional):** a vertical, swipe-style rail of every short, newest first. Cheap
  because it is a view over `series.json`; only worth it if the owner wants a Shorts-first page.

### 2.3 Keeping it fresh without a server
- Truth = ledger (push). YouTube = verifier (pull) at build time: per-playlist RSS for title /
  published / view counts, oEmbed for thumbnails. No API key needed for the series.
- Add `YOUTUBE_API_KEY` (GitHub Actions secret, build-time only) **only** if the owner wants the
  ~65 legacy videos (audiobooks, AI stories, fan film) that no ledger tracks. One
  `playlistItems.list` over the uploads playlist, 50 per unit, well inside the free quota.
- Thumbnails: prefer the studio's own `title/epNN.png`; fall back to
  `i.ytimg.com/vi/<id>/hqdefault.jpg` (`maxresdefault` 404s on some uploads and side-fills Shorts).
- Embeds stay `youtube-nocookie` click-to-load (`YouTubeLite` exists).

---

## 3. The Research tab

### 3.1 Position: a Studio surface, not a fifth vertical (recommended)
Verticals are things the audience consumes (Stories, Movies, Music, Games). Research is the
studio speaking about how it works. Treat it like `/requests`: a `NavLink` in `LobbyShell` +
`active: "research"`, a footer "Studio" link (already there), a tile on `/about`. This keeps
**Sapphire** legitimately (Sapphire = system/studio voice, never a vertical, so no palette
conflict) and avoids touching `sections.ts`, `BottomTabs`, the home ACCENT map and ~6 tests.
Promotion to a vertical later is a one-day change if it earns it.

### 3.2 Content model: `research/YYYY/MM/DD/<slug>/`
```
item.json          ← manifest (template/item.json)
article.md         ← kind "note"   : Markdown + front-matter, rendered in the Lobby reader
report.html        ← kind "report" : self-contained HTML (charts, interactive), embedded full-bleed
                                      inside the site chrome (sandboxed iframe), own dark theme
summary.png        ← one-screen card (the audit folders already produce 00_SUMMARY.png)
paper.pdf          ← print export of the article, sibling of the page (Google Scholar wants this)
data/              ← metrics.json, ledger.jsonl, hashes — what makes the claim checkable
```
Two kinds, on purpose: most results are a markdown note with tables; a few (the Story Department
page, a benchmark dashboard) are interactive HTML. **This is an explicit exception to D11 ("no
HTML/Markdown") scoped to `section: research`**, proposed as D37. Stories stay JSON blocks.
`gray-matter` and `marked` are already installed, so the note renderer is cheap.

### 3.3 Article page anatomy (every article, same layout)
1. Eyebrow: type chip (Benchmark · Negative result · Design essay · Note · System) · date · version.
2. Title · one-sentence claim · the headline number in large type (e.g. "predicted 5.0 h, measured 4.99 h, n = 1").
3. Abstract (≤200 words) · "Measured on" line (hardware, models, pinned versions, commit).
4. Body (note) or the embedded report (report).
5. Results with n, units, variance · Limitations · Reproduce (repo, data, exact commands).
6. **How to cite** (BibTeX `@misc` with DOI + URL) · License (CC-BY-4.0 text, Apache-2.0 code) · Changelog.
7. Related works: the video / story it came from, via `related[]` (Relations table, D23).
8. `<head>`: canonical, OG image = summary.png, JSON-LD `ScholarlyArticle`, Google Scholar
   `citation_title / citation_author / citation_publication_date / citation_pdf_url`.

### 3.4 Index page `/research`
Cards by type with filter chips, newest first, browse-by-date (Scholar wants a plain date index),
a "Studio in numbers" strip from the ledgers (episodes published, $/episode, GPU hours), and
`feed.xml`. For interviews: each card links to the one-screen `summary.png` and the PDF.

### 3.5 First six articles (from the ranked inventory)
| # | Working title | Source (visurena_studio) | Type |
|---|---|---|---|
| 1 | Denoise + Real-ESRGAN vs RTX VSR on anime video: 51–58 % less jitter | `docs/audit/2026-10-18_upscale/` + `docs/audit/2026-10-14_rtx_vsr_test/` | Benchmark |
| 2 | FastH3 does not beat production on small faces (pre-registered, 23/24 softer) | `docs/audit/2026-10-21_fasth3_faces/` | Negative result |
| 3 | A slow push replaces a held shot: frozen frames 86–95 % → 0–15 % | `docs/audit/2026-10-21_prompt_bench/` | Benchmark |
| 4 | A warp metric that picks the take model by shot size (27 clips) | `docs/audit/2026-10-18_warping/` | Benchmark |
| 5 | A capacity model, one out-of-sample check (n = 1, and why that is said) | `README.md` + `docs/DECISIONS.md` 2026-10-17 + `studio/episode_capacity.py` | Note |
| 6 | The Story Department: code is management, agents are specialists | `architecture/index.html` | System (report.html) |

Held until the attorney reads the MiniMax-H3 USA clause: any H3 clip or frame strip. Metrics,
hashes and protocol can ship now (the growth report says the same).

---

## 4. One publishing pipeline (stories, videos, research)

### 4.1 Studio side: a `publish` department (the Future tab already names it)
`scripts/publish/site_export.py <kind> <path>`:
- `series <book>` → `movies/YYYY/MM/DD/<series>/item.json` + poster/stills (today's ingest logic moves here);
- `research <audit-folder>` → `research/YYYY/MM/DD/<slug>/` from PREREG/REPORT/VERDICT + `00_SUMMARY.png`,
  with a scrub pass (absolute paths, owner quotes, decision ids) and a checklist gate (template/CHECKLIST.md);
- `story <drop>` → already the website_data shape.

Output lands in `s3://visurena-content-alpha/<section>/…` (bucket per env: alpha now, prod later).
No git commit for content; content lives in S3 (D10).

### 4.2 Site side: pull, build, deploy
GitHub Actions: nightly cron + `repository_dispatch` fired by `site_export.py` → `pnpm content:pull`
→ `next build` → deploy to alpha. Prod promotion = manual approval on the same artefact
(alpha → prod rule). The build also runs the YouTube reconcile (RSS/oEmbed, no key).

### 4.3 Fan-out per research article (tiers, cheapest first)
| Tier | When | What |
|---|---|---|
| 1 | every article | own page + canonical + JSON-LD + Scholar meta + PDF sibling + `feed.xml` + sitemap |
| 2 | any measured result or tool | public repo `visurena-research` (md + data + `CITATION.cff` + LICENSE) → GitHub release → **Zenodo DOI** (free, versioned, ORCID-linked); DOI goes back into the cite block; cross-post abstract to dev.to (`canonical_url`) and Medium import (canonical auto-set) |
| 3 | strong, n > 1, novel | arXiv cs.CV / cs.MM. Reality check: since 2026-01-21 first-time submitters need an endorser in the `cs` domain (institutional email alone no longer works); start finding one now. Or a workshop first (CVPR AI4CC / NeurIPS D&B, as the growth report suggests) |

Monday newsletter (D19) gets a "From the lab" item for free once research is in the content index.

---

## 5. Decisions the owner needs to make (scoping, before any build)

1. **Research position:** Studio nav item (recommended) or fifth vertical with its own stone?
2. **D37 exception:** allow `article.md` / `report.html` for `section: research` only?
3. **Content home now:** S3 `visurena-content-alpha` (recommended, matches D10 and alpha→prod) or
   keep `content-local/*.json` in git for one more phase?
4. **Legacy channel videos:** series-only (no key) or the whole channel (needs a YouTube Data API key in CI)?
5. **First six articles:** confirm the list in §3.5, and the H3-clip hold.
6. **Public research repo name + ORCID:** `visurena-research`? Is there an ORCID yet?
7. **Order of PRs** (proposed): PR-A ingest fix + shorts shelf (~1 day) → PR-B research section +
   template + first article (~2 days) → PR-C S3 export + GitHub Actions + Zenodo (~2 days).

Proposed ARCHITECTURE.md entries once decided: **D36** Research surface (position, model, Sapphire),
**D37** research-only Markdown/HTML exception, **D38** publish department + S3 export + fan-out tiers.

---

## Appendix: generalisable, publishable by itself
- The research template + export script (`site_export.py research`) is a standalone tool:
  "audit folder → citable static article with Scholar meta, JSON-LD, PDF, DOI hook". Nothing in it
  is Visurena-specific. Candidate name: `prereg-publish`.
- The reconcile step ("ledger is truth, YouTube RSS/oEmbed verifies at build") is a small Node
  package any static-site creator channel can use.

## Sources
- Studio inventory, website map and YouTube/publishing research: three agent reports, 2026-10-22.
- Channel/playlist facts fetched live from `youtube.com/feeds/videos.xml` (scratch copies in the
  session scratchpad `yt/` folder).
- Zenodo policies, GitHub citation docs, Google Scholar inclusion guidelines, arXiv endorsement
  policy post (2026-01-21): linked in the research agent's report; arXiv's Oct-2026 rate-limit
  numbers were secondary-source only and are not relied on above.
