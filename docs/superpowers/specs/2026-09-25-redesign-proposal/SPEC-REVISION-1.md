# SPEC REVISION 1 (2026-09-25) — owner correction. OVERRIDES SPEC.md where they conflict.

Owner's words: episodes are NOT the only goal. Visurena has written stories, books, music and
games. KEEP THOSE TABS. Enhance by ADDING video episodes/series under the existing Movies tab.
Use the YouTube links for the video for now. The studio's video output is early-stage; do not
position the whole product around it.

## What changes (apply all; everything not listed stays as in SPEC.md)

1. NAV (web): `VISURENA` · `Stories · Movies · Music · Games · Requests (312)` · search · Continue pill · avatar.
   Nouns, not verbs. All four verticals ALWAYS visible, including Music (2 tracks + audiobook is fine).
   Active underline in that vertical's accent. Movies = films, series, episodes, trailers, shorts.

2. POSITIONING COPY. Tagline (under wordmark / footer): "Stories, movies, music, games. You choose what's next."
   "How this studio works" line: "Visurena is one person and a set of AI tools making stories, movies,
   music and games in the open. Every frame is generated; every cut is chosen. Vote on what we make next."
   Remove every mention of "vertical film", "micro-drama", "serialized vertical" from copy. The
   masthead (Broadsheet) becomes "No. 14 · Week of 22 September 2026 · Seven stories, one series, two singles, ten games · What next?"

3. HOME HERO = a 4-slot rotator, ONE SLOT PER VERTICAL, with a visible labelled tab strip under the
   hero (not just dots): `Stories · Movies · Music · Games`, each label in its accent when active.
   - Slot 1 (default, amber): Falls Water — eyebrow `Short story · New this week · Coming-of-age · 32 min`,
     title "Falls Water", logline "A survivor whose little brother died on the deadly coming-of-age
     Descent goes back down the dry waterfall and finds a capped pipe, a tourist puppet, and the last real water.",
     CTAs `Read it` · `All stories` · `+ Follow`. Art: assets/story-falls-water-34.jpg (3:4 card) with
     glow from assets/story-falls-water-169.jpg.
   - Slot 2 (emerald): A Study in Scarlet — as in SPEC (Series · Complete · 14 episodes · 2 h 20 min · 1887), 9:16 card, `Play Ep 1` · `Trailer` · `+ Follow`.
   - Slot 3 (ruby): Last Train — eyebrow `Single · Released · 3:42`, logline "A lo-fi night ride out of the city.", CTAs `Play` · `All music`. Art: assets/music-last-train.jpg (square card).
   - Slot 4 (amethyst): Neon Tetris — eyebrow `Game · Puzzle · Browser · No install`, CTAs `Play now` · `All games`. Art: assets/neon-tetris-thumb.svg in a 16:9 card on bg-2.
   All four slots in the DOM; JS switches; the default slot renders without JS.
   The hero must NOT read as a Sherlock page. The tab strip is the proof there are four rooms.

4. HOME SECTION ORDER (after the hero):
   1. "New this week · across the studio" — ONE mixed rail, 8 cards, each with a kind chip in its
      accent (Story / Episode / Single / Game): Falls Water, Scarlet Ep 14, As Promised, Last Train,
      Neon Tetris, Scarlet Ep 13, Glass and Granite, Cosmic Defense. Card ratios per kind
      (3:4 story, 2:3 episode, 1:1 single, 16:9 game) in ONE row of constant height (widths vary).
   2. "Stories · Amber" rail: 7 stories, 3:4 covers, status lines. Header link `All stories →`.
   3. "Movies · Emerald": A Study in Scarlet 2:3 episode rail (7 visible + peek, watched ticks,
      Ep 7 progress) with the series title + status line as the rail header, and a
      "Frankenstein · In production · Script ✓ · Cast ✓ · Ep 1 rendering · + Follow" card as the LAST
      card of that rail. Header link `All movies →`.
   4. "Music · Ruby": Last Train, Somebody Knew My Name, A Study in Scarlet Audiobook (3 items). `All music →`
   5. "Games · Amethyst": 16:9 tiles, 6 visible + peek. `All games →`
   6. "On the slate · 2,850 votes this season": the vote cards as in SPEC (Frankenstein first, then
      the nine novels with tabular counts + neutral Vote, `Request a title →`). Add ONE non-book
      request card so it is not only novels: "More arcade games · 143 votes · Vote" and "A horror
      story collection · 128 votes · Vote".
   7. "Continue": Ep 7 of Scarlet · Falls Water ch. 3 · Neon Tetris (with progress).
   8. "Shorts": 6 small 9:16 cards (keep, but compact).
   9. "How this studio works" one line (copy per item 2). Footer with the 4 vertical columns.
   Remove the separate "Request board teaser" module (the slate already covers it).

5. MOVIES HUB VIEW (NEW, add a 5th view `#movies`): the Movies tab page. Header "Movies · Emerald
   room". Sections: "Series" (one card: A Study in Scarlet, 9:16 poster, status line, `Start Ep 1`/`Continue Ep 7`;
   plus Frankenstein in-production card), "Latest episodes" (episode rail), "Trailers" (Scarlet 60s
   trailer card + Scarlet 30s teaser), "Shorts" (6), "In development" (three slate cards for Feature
   requests: Moby-Dick 236, Heart of Darkness 164, plus Frankenstein). Every card links (in the
   mockup, to #series / #episode). Movies hub must not be empty; it must not claim films exist that don't.

6. SERIES + EPISODE VIEWS: keep as built. Breadcrumb becomes `Movies › A Study in Scarlet › Ep 4 of 14`.
   Under the stage add a visible secondary link `Watch on YouTube ↗` (https://www.youtube.com/watch?v=WN2ktyq8tr0)
   next to the click-to-load poster; playback stays a YouTube embed, loaded on click.

7. MOBILE: bottom tabs = `Home · Stories · Movies · Music · Games` (48px items, 24px icons, 12px labels).
   Requests lives in the top bar as a chip with the count; avatar/search in the top bar. Phone Home:
   4-slot hero (default Falls Water 3:4 art 358x448) with the labelled strip, then New this week
   mixed rail, Stories rail, Movies episode rail, Music rail, Games rail, one slate card. Phone
   second frame stays the Series page.

8. SECTION HEADERS carry the vertical's accent as its mark (3px rule under the title, or the
   Broadsheet's accent rule, or the Jewel room threshold). That is how the four rooms read on Home.

9. ALL ELSE per SPEC.md: tokens, no-empty rule, first paint, accent budget, native mode, dev chips.

## 10. EPISODE ART — no wall of identical posters (owner: "all episodes of Sherlock as the first line is not good aesthetically")
- The title card (assets/title-ep01.jpg) is the SERIES poster only. Use it once per view (hero slot 2,
  series page poster, Movies hub series card). Never as the tile art for individual episodes.
- Every EPISODE tile uses a distinct scene still: crop the centre 9:16 of the YouTube frames
  (assets/yt-K2ucdt_mCg.jpg = Ep 1, yt-P8i7niWhEWo = Ep 2, yt-Pkr4HudmQPo = Ep 3, yt-WN2ktyq8tr0 = Ep 4,
  yt-g-U-P0ZOoq8 = Ep 5, yt-AIX83NAcTGc = Ep 6) via object-fit: cover + object-position: 50% 50%
  on a 9:16 or 2:3 box (the centre third of the 16:9 frame is the video). For Ep 7-14 reuse the six
  frames with a different object-position (e.g. 50% 20% / 50% 80%) so no two adjacent tiles look alike.
  Small overlay in the tile's bottom-left: "Ep 4" (12px mono, on a bg-0 80% chip). Episode number +
  title + runtime in the caption as before.
- HOME "Movies" rail is a MIX (this is what a release day looks like): [series card: Scarlet poster,
  "Series · Complete · 14 ep"] · [Ep 14 still] · [Ep 13 still] · [Ep 12 still] · [Trailer card, 9:16
  still with a play glyph, "Trailer · 0:60"] · [Short] · [Short] · [Frankenstein in production].
- SERIES PAGE: the episode section becomes NUMBERED ROWS (like the episode panel), 2 columns on desktop
  (7 rows each), each row: 9:16 still 56x100, number, chapter title, runtime, watched tick / progress.
  The first viewport still shows the poster + info + the first 4 rows. Mobile series page: same rows.
- MOVIES HUB "Latest episodes" rail: stills, not title cards.
- SHORTS rails: use the same stills (varied object-position), never the title card.
