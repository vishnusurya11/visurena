---
name: entertainment-platform-ui
description: Reference patterns for designing/building a one-stop entertainment platform (Movies, Music, Games, Stories, Tournaments) with a premium charcoal-dark, lightly-animated, award-winning aesthetic and AI-powered discovery. Use when designing or implementing any screen, component, navigation, or flow for Visurena (or any multi-vertical entertainment "super-app") — e.g. a video player, content rows, a music mini-player, a game store page, a reader, a tournament bracket, a unified home, global search, onboarding, or cross-vertical recommendations. Encodes the actual UX patterns of category leaders (Netflix, Disney+, Max, Prime Video, Apple TV, Spotify, Apple Music, YouTube Music, SoundCloud, Steam, Epic, Xbox, itch.io, Wattpad, Webtoon, Kindle, FACEIT, Challonge, Battlefy, Liquipedia) plus the do/don'ts.
---

# Entertainment Platform UI

This skill captures the proven UI/UX patterns of best-in-class entertainment platforms so an AI can design and build **Visurena** — a one-stop hub for **Movies, Music, Games, Stories, and Tournaments**. Aesthetic target: **premium charcoal-dark, slightly animated, award-winning**, with **AI-powered discovery** as the organizing idea.

## How to use this skill

1. Identify which vertical(s) the task touches, then **read the matching reference file(s)** below before designing or coding. Each file is a dense, build-ready spec: key screens, signature components, navigation/IA, do/don'ts.
2. For anything that spans verticals (home, search, nav, profile, onboarding, recommendations), read `references/cross-cutting.md`.
3. Treat the reference files as the source of truth for *what good looks like*. They tell you the components to build and the traps to avoid. Combine with the project's own design language (charcoal-dark, jewel accents, drifting nebula-gas background, light motion).

| If the task involves… | Read |
|---|---|
| Video/movie browsing, hero billboards, content rows, the player, watchlist, profiles | `references/movies.md` |
| Music playback, mini-player, queue, playlists, library, lyrics, artist/album pages | `references/music.md` |
| Game store/library, game detail, media galleries, reviews, achievements, install states | `references/games.md` |
| Reading, the reader (typography/scroll/pagination), bookshelf, chapters, serialized content | `references/stories.md` |
| Brackets, leaderboards, match pages, live scores, registration/check-in, teams, schedules | `references/tournaments.md` |
| Unified home, global search, navigation model (5 verticals), cross-vertical recs, profile, onboarding | `references/cross-cutting.md` |

## The 5 verticals at a glance

- **Movies / video** — Dark canvas where artwork is the UI. Personalized **hero billboard** → horizontally-scrolling **content rows** (Continue Watching first) → **hover/long-press preview** → **title detail** → **immersive player** with auto-hiding controls, scrub-preview thumbnails, Skip Intro, captions, Next Episode. Exemplars: Netflix, Disney+, Max, Prime Video, Apple TV.
- **Music** — A **persistent player** is the spine: a **mini-player** docked above nav on every screen that expands to **Now Playing** (full art, scrubber, queue, lyrics). Library/Search/Home tabs feed it. Exemplars: Spotify, Apple Music, YouTube Music, SoundCloud.
- **Games** — Two distinct surfaces: **Store** (discovery, marketing, conversion) vs **Library** (owned, install/launch states). **Game detail** is a media-forward landing page (trailer, screenshot gallery, tags, reviews, specs, price/CTA). Plus social: achievements, friends, wishlists. Exemplars: Steam, Epic, Xbox, itch.io.
- **Stories / reading** — A distraction-free **reader** is the heart: tap-to-toggle chrome, typography controls (size/font/spacing/margins), scroll *or* paginate, light/sepia/dark, progress + sync. Around it: **bookshelf/library**, **chapter lists**, **serialized** episodic release, discovery, streaks. Exemplars: Wattpad, Webtoon, Kindle, Radish.
- **Tournaments / esports** — **Bracket visualization** (single/double elim, round robin, Swiss) that stays legible at scale, **leaderboards**, **match pages** with live real-time scores, **registration + check-in** flows, **team/player profiles**, **schedules**. Exemplars: FACEIT, Challonge, Battlefy, Toornament, Liquipedia.

## Universal principles (apply everywhere)

- **Content over chrome.** On a dark canvas, the artwork *is* the interface. Keep UI quiet; let posters, album art, key art, cover art, and team logos carry the visual weight. (Netflix's dark UI exists to make thumbnails pop.)
- **Reduce "what do I do next" to seconds.** Every leader front-loads a high-conviction recommendation (billboard, Continue Watching, Made-For-You) and offers low-stakes, scannable choices (rows of cards). Decision fatigue is the enemy.
- **Resume is sacred.** Continue Watching / Continue Listening / Continue Reading / "jump back in" must be the first thing returning users see, with exact progress restored. Cross-device sync (Whispersync-style) is table stakes.
- **One ergonomic navigation model.** Mobile: a **bottom tab bar of 3–5 items** within thumb reach. Web/TV: top or left nav. Never bury primary verticals in a hamburger (out of sight = out of mind). With 5 verticals you must consolidate (see cross-cutting.md).
- **Personalization is layered.** Choose the *rows/shelves*, the *items* within them, and the *ranking* of items — all per user. Surface "Because you watched/listened/read/played X" to make recs feel earned, not creepy.
- **Motion is a seasoning, not a meal.** Use 150–300ms transitions, staggered reveals on load, subtle hover scale/glow, and full-motion previews on dwell. Never block content behind animation; honor `prefers-reduced-motion`.
- **Performance is UX.** Time-to-first-frame, instant thumbnail loading (progressive/blur-up), and skeleton states define perceived quality. Abandonment climbs ~5–6% per extra second of start delay.
- **Accessibility is non-negotiable.** Captions/subtitles, adjustable text, sufficient contrast on the dark theme, focus states, keyboard/D-pad navigation, and screen-reader labels for icon-only controls.
- **Don't ship the common pitfalls:** information overload with flat hierarchy (everything same weight), shrinking how much content is visible per row, hiding frequently-used controls in overflow menus, ambiguous icons (no labels), and autoplaying audio/video without consent.

## Output expectations when building

- Design dark-first. Surfaces are layered charcoals (not pure black for large fields; reserve near-black for the player/reader), jewel accent for primary actions and "live"/progress states.
- Build the **persistent player** (music) and **immersive player/reader** (video, stories) as app-level shells that survive navigation.
- Every card component should support: artwork, title, a progress affordance, a quick-add (watchlist/library/wishlist), and a hover/long-press preview.
- Every detail page is a media-forward landing page with one unmistakable primary CTA (Play / Listen / Install / Read / Register).
- Treat the AI discovery layer as a first-class surface: a unified, cross-vertical home and search that can return Movies + Music + Games + Stories + Tournaments together, with "Because you…" provenance.

See `references/` for the build-ready specifics, and the **Sources** list at the bottom of `references/cross-cutting.md`.
