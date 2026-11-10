# Visurena redesign — shared research brief (2026-09-25)

## The ask (from the owner)
The live site https://visurena.com "looks like a 2000s website". Rework the visuals into a
modern, premium, cinematic experience. The owner's THEMES stay (dark, cinematic, "The Studio",
jewel accents per vertical, made-in-the-open creative studio) but the CURRENT background,
fonts, layout and other choices are NOT sacred. Anything can change.

Positioning: **Visurena = one-stop destination for all entertainment** — Stories (written,
serialized), Movies/Video (episodes, series, trailers, shorts), Music, Games. A **mobile app
with the same name** follows, so the design must translate to React Native/Expo. This is the
**alpha** environment; prod comes later.

Deliverable of this whole exercise: a written proposal + 2-3 clickable HTML mockups
(homepage + a video series/episode page each) the owner picks from. NOT code changes.

## Hard facts about the current site (screenshots in ./shots/)
- Stack: Next.js static export on S3 + CloudFront (no SSR). pnpm+Turborepo monorepo:
  apps/web, packages/design-tokens, packages/ui, packages/core. Tailwind present.
- Current look: black background, drifting starfield SVG tiles + per-section colored
  "nebula" radial gradients; serif display (Newsreader/Fraunces) + Spectral body +
  JetBrains Mono uppercase micro-labels with wide tracking; ivory text #f5efdb.
- Jewel palette: amber #f5b831 = Stories, emerald #00d97e = Movies, ruby #e91e63 = Music,
  amethyst #c084fc = Games, sapphire #5b8def reserved. Surfaces #0a0a0b / #101012 / #16161a.
- Homepage sections: full-bleed hero of the latest story, "New this week" 3:4 poster grid,
  "Trending" with giant outlined rank numbers, a marquee, two 16:9 "room" tiles, newsletter.
- Screenshots show what the owner sees: hero is fine-ish, then LONG EMPTY BLACK STRETCHES
  (scroll-fade-in sections that never show in a full-page capture, which mirrors a slow/empty
  feel), a marquee, then footer. Movies page = giant "Movies" word + "Coming soon". Music
  page similar. Very little real content is surfaced. Only 1 story + a few games are live.
- Header: text nav with colored dots, small language switcher and "FREE DURING OPEN BETA"
  status bar at the very top (2 stacked bars).

## The content that ALREADY EXISTS and is not shown (this is the big gap)
The owner's separate pipeline `visurena_studio` (Python, AI film studio) has produced and
PUBLISHED TO YOUTUBE 11+ episodes (~10 min each, target "episode10") of a serialized
adaptation of "A Study in Scarlet" (Sherlock Holmes, 1887 period). Ten more classic novels
are queued in its library (Frankenstein, Dracula, Pride and Prejudice, Tom Sawyer, Peter
Pan, Moby-Dick, Metamorphosis, Jekyll & Hyde, Dorian Gray, Heart of Darkness). Output formats:
feature (~100 min), episode10 (~10 min), short60 (~1 min vertical shorts). Per series it
has: episodes with YouTube video_ids, a trailer, per-episode title cards (see refs/), a
cast list with character sheets, an audiobook, a "casebook". Example YouTube ids:
ep1 -K2ucdt_mCg, ep2 P8i7niWhEWo, ep3 Pkr4HudmQPo, ep4 WN2ktyq8tr0, ep5 g-U-P0ZOoq8,
ep6 AIX83NAcTGc, ep7 xksX2qouWEo, ep8 V5sFXhGemRk, ep9 Me9h8oQwx6E, ep10 nftf6bbjQMs,
ep11 ZC7AWsoTrlo. Thumbnails available at https://img.youtube.com/vi/<id>/maxresdefault.jpg
So the Video tab must support: series page (poster, synopsis, cast, trailer, episode list
with progress, "next episode drops <date>"), episode page (embedded/hosted player, up-next,
chapters), shorts, plus "continue watching" on home. Episodes auto-publish on a schedule.

## Locked platform decisions (do not fight these)
- Content = structured JSON in S3, one folder per work, auto-published on schedule; NO admin panel.
- Static export + serverless API (Lambda/DynamoDB) for per-user state (likes, progress,
  comments, follows). Login via Cognito later; browsing is anonymous.
- A first-class "Request board": the audience requests + votes what gets made next
  (demand-driven studio). This is the differentiator; it deserves a place in the design.
- Budget ~$10/mo; scale-to-zero. So: no heavy video hosting yet (YouTube embed or S3+CloudFront
  MP4), no server rendering.
- Design tokens must compile to web AND React Native (no CSS-only tricks as the primary
  design language; blur/backdrop-filter, mix-blend-mode etc. are web-only garnish).
- Logo/wordmark "VISURENA" stays. Palette CAN evolve (keep the idea of one accent per vertical).

## What we want from you
An honest expert position, grounded in real references (cite URLs you actually checked).
Be opinionated. Disagree with the brief where you should. Keep it under ~1500 words.
