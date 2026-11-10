# Visurena redesign — CONSENSUS SPEC for the mockups (2026-09-25)

Five experts (UX/IA, visual/brand, motion/frontend, product, mobile/design-system) researched
and debated. Their positions are in position-*.md and position-*-round2.md next to this file.
Read this SPEC fully. It is the contract every mockup must satisfy. The VISUAL SKIN differs per
mockup (see your direction brief); the IA, content, copy and rules below are IDENTICAL across all.

## 0. Facts
- Visurena = one-person AI film/story/music/game studio. Positioning line (under wordmark or in
  hero eyebrow): "Classic stories. New pictures. You choose what's next."
- Live series: **A Study in Scarlet** (Sherlock Holmes, 1887). **COMPLETE, 14 episodes, ~10 min
  each, ~2h 20m total**, VERTICAL 9:16 video, published on YouTube. 60s vertical trailer exists.
  Cast sheets, audiobook, casebook exist.
- Next series: **Frankenstein** (Shelley, 1818) — IN PRODUCTION ("Script ✓ · Cast ✓ · Ep 1 rendering",
  chosen by 517 votes).
- Voting queue (Request board): Dracula (Episodes) 412 · Pride and Prejudice (Episodes) 388 ·
  The Picture of Dorian Gray (Episodes) 301 · Jekyll & Hyde (Episodes) 274 · Moby-Dick (Feature) 236 ·
  Peter Pan (Episodes) 219 · Tom Sawyer (Episodes) 187 · Heart of Darkness (Feature) 164 ·
  The Metamorphosis (Shorts) 152. Header: "On the slate · 2,850 votes this season".
- Stories (Read): Falls Water (Coming-of-age · 32 min), As Promised, Glass and Granite, One Mitten,
  Rich Ground, Slack Water, The Mortar Line. Covers in assets/story-<slug>-34.jpg (3:4) and -169.jpg.
- Music: "Last Train", "Somebody Knew My Name" (assets/music-*.jpg posters).
- Games (Play): Cosmic Defense, Neon Tetris, Snake Evolution, Brick Breaker Ultra, Pong Championship,
  Pac-Runner, Asteroid Blaster, Frogger Crossing, Missile Defense, Centipede Garden (assets/*-thumb.svg, 16:9).
- Episode titles (ch 1-14): 1 A Mr. Sherlock Holmes · 2 The Science of Deduction · 3 The Lauriston
  Garden Mystery · 4 What John Rance Had to Tell · 5 Our Advertisement Brings a Visitor ·
  6 Tobias Gregson Shows What He Can Do · 7 Light in the Darkness · 8 On the Great Alkali Plain ·
  9 The Flower of Utah · 10 John Ferrier Talks with the Prophet · 11 A Flight for Life ·
  12 The Avenging Angels · 13 A Continuation of the Reminiscences of John Watson · 14 The Conclusion.
  Runtimes: invent between 9:12 and 11:40. YouTube ids ep1..ep6: -K2ucdt_mCg P8i7niWhEWo Pkr4HudmQPo WN2ktyq8tr0 g-U-P0ZOoq8 AIX83NAcTGc.
- Episode art: assets/title-ep01.jpg … title-ep08.jpg are PORTRAIT title cards (the true posters).
  For ep 9-14 reuse title cards cyclically. assets/yt-*.jpg are 16:9 YouTube frames with blurred
  side-fill; use ONLY as the "frame glow" backdrop or crop the centre 9:16. Cast: assets/cast-holmes.jpg,
  assets/cast-watson.jpg (portraits). Reference all assets by RELATIVE path `assets/<file>`.

## 1. Non-negotiables (all five lanes, merged)
1. NOTHING is empty or "coming soon". Desktop first viewport (1440x900) shows at least 6 real works with a
   status line. Any module with fewer than 3 items does not render. Every unreleased thing carries a
   production state or a vote count. Status-line grammar: `{Format} · {State} · {Count} · {Runtime}`.
2. Everything visible at first paint with JS disabled. NO opacity-0 reveals, NO scroll-gated
   content, NO marquee or ticker, NO fixed background layers, NO continuous animation, NO autoplay.
3. Only artwork is saturated. Chrome (surfaces, text, buttons) is neutral. The vertical accent
   is a MARK, one role per viewport: state-chip text, progress fill, 2px active-nav underline,
   slate vote digits, focus ring. Never button fills, section titles, badge backgrounds, footer swatches.
   No text-shadow, no coloured box-shadow, no glow on chrome, no uppercase below 12px, tracking
   within [-0.03em, +0.06em] (meta/mono labels may go to 0.08em at 12–13px, tabular-nums).
4. Elevation by luminance steps only. Surfaces: bg-0 #0B0C10 · bg-1 #141518 · bg-2 #1C1D21 ·
   bg-3 #26272B · hairline rgba(255,255,255,.08). Text: #F2F1EC / #A9A8A3 / #7A7975.
   Accents: Stories amber #E8B04B · Watch emerald #3DD68C · Music ruby #F0537A ·
   Games amethyst #B48CF7 · system sapphire #6C9BFF. (A direction brief may override surfaces and type.)
5. Ambient light comes from the ARTWORK: a tiny pre-blurred copy of the poster or frame as an
   img (object-fit: cover, opacity ~.45) under a linear-gradient to bg-0, or a solid two-stop
   gradient from a stored hex. Mockups fake the blur with `filter: blur()` on an img (allowed in the
   mockup only; mark it with class "web-garnish"). No backdrop-filter, no mix-blend-mode, no
   hue-rotate, no mask-image, no text-stroke anywhere.
6. RN-portable brand: every element must be expressible as {surface hex, two-stop linear gradient,
   image, text style, radius, 1px border}. Include a small toggle "Native mode" (top-right,
   dev-only chip) that adds class `native` to html; CSS under `html.native` disables every
   `.web-garnish` (blur, hover previews). The page must still read as the same brand.
7. Motion tokens: fast 150ms · normal 220ms · slow 400ms; easing cubic-bezier(.22,1,.36,1).
   Hover (pointer:fine only): card `transform: scale(1.04)` + bg-2, no shadow change, no sibling
   shift. Respect prefers-reduced-motion (disable transforms).
8. Portrait video is NEVER letterboxed into a 16:9 box and never floats on flat black: the 9:16
   stage sits on the frame-glow backdrop with the episode panel beside it.

## 2. Information architecture (identical in all mockups)
Global nav (web), ONE 60px bar, sticky, bg-0 at 92% opacity (no blur):
  left `VISURENA` wordmark (is Home) · centre `Watch · Read · Play · Requests (312)` ·
  right: search icon (44x44), `Continue` pill (Ep 7 · 4 min left), avatar 44x44.
  Music is hidden from nav (only 2 tracks) but appears as a home rail. Language switcher and beta
  badge: GONE (language lives in the footer only).
Active nav item: 2px accent underline in that vertical's colour. That is the only nav colour.

### HOME (1440x900 first viewport = nav 60 + 840)
1. HERO, max 55vh (~460px), split. Left/centre: eyebrow `Series · Complete · 14 episodes · 2 h 20 min · A Study in Scarlet, 1887`,
   title "A Study in Scarlet" (with "Sherlock Holmes" small above), logline (one sentence),
   CTAs `▶ Play Ep 1` (primary, white on charcoal) · `Trailer` · `+ Follow` (subline "Get the next series first").
   Right: the full 9:16 title card (assets/title-ep01.jpg), height = hero minus 48px, 1px hairline frame,
   radius 8, on the artwork-glow wash. Rotator dots (2): slot 2 = Frankenstein in production
   (eyebrow `Series · In production · Script ✓ · Cast ✓ · Ep 1 rendering · Chosen by 517 votes`, CTA `+ Follow`).
2. "All 14 episodes" rail, top edge INSIDE the fold (y about 560): 2:3 tiles (crop from the top 75% of the
   9:16 card via object-fit/object-position), 7 visible plus peek, caption `Ep 3 · The Lauriston Garden Mystery · 9:48`,
   watched tick on ep 1-6, 2px accent progress fill on ep 7 ("Continue").
3. "On the slate · 2,850 votes this season": Frankenstein in-production card first (state chip + `+ Follow`),
   then vote cards with LARGE tabular vote counts and a neutral `Vote` button (accent only on the digits),
   last card `Request a title →`. 2:3 cards; use a neutral typeset book-cover treatment (title + author/year on bg-2).
4. "Continue" rail (Ep 7 of Scarlet · Falls Water ch. 3 · Neon Tetris) with progress bars.
5. "Read · Stories" rail: 3:4 covers, caption `Short story · Coming-of-age · 32 min` etc. 7 visible.
6. "Listen": 2 tracks + audiobook "A Study in Scarlet · Audiobook · 4 h 51 min" (3 items, so it renders).
7. "Play · Games": 16:9 tiles, 5-6 visible, caption `Arcade · 5 min · Browser`.
8. "Shorts from the studio": 9:16 small cards (title cards), 8 visible, `Short · 0:58`.
9. Request board teaser: top 3 requests + `Request something`. (Compact; different layout than 3.)
10. "How this studio works": ONE dated line + link. "Visurena is one person and a set of AI tools
    adapting public-domain classics into serialized vertical film. Every frame is generated;
    every cut is chosen. Vote on the next book." + `How it's made →`
11. Footer: wordmark, four link columns, language, AI disclosure, © Visurena 2026.
Total page about 3,800px or less. Section gaps 64px or less.

### SERIES PAGE  /watch/a-study-in-scarlet
First viewport: left poster card (9:16, full); centre: "Sherlock Holmes" small, title, status line
`Series · Complete · 14 episodes · ~10 min each · 1887`, synopsis (3 lines), CTAs `▶ Start Ep 1` or
`Continue Ep 7` (progress ring) · `Trailer` · `+ Follow` · share; right: the episode GRID already
begins (two rows visible). Then the full episode grid (2:3 tiles, 7-up, chronological, current
highlighted, watched ticks). Then tabs `Cast · Audiobook · Casebook · Shorts · About the adaptation`
(render Cast with 6 portraits: Holmes, Watson, Lestrade, Gregson, Jefferson Hope, Lucy Ferrier;
reuse the two cast portraits plus neutral initial tiles). Last module: "What should we adapt after
this?" three vote cards + `Request a title`. Footer.

### EPISODE PAGE  /watch/a-study-in-scarlet/ep-4
Breadcrumb `A Study in Scarlet › Ep 4 of 14`. Desktop stage: 9:16 player, height min(100vh - 108px, 800px)
(about 445x792), centred-left on the frame-glow backdrop (assets/yt-WN2ktyq8tr0.jpg blurred, opacity .45,
under a gradient to bg-0); use the title card as the poster with a play button (do NOT embed an
iframe; show a "click to load on YouTube" poster). Right: 400px panel (bg-1, 1px hairline left) with
tabs `Episodes (current pinned) · Chapters · About`; episode rows 72px: 40x71 thumb, number, title,
runtime, progress. Under the stage: title "What John Rance Had to Tell", `Ep 4 · 10:04 · Chapter 4`,
prev/next, `Up next: Ep 5 · Our Advertisement Brings a Visitor` with an auto-advance note, like/comment/share.
Provenance line (13px, text-2): "Every frame generated with AI. Every cut chosen by one person. How this was made →".
Below: "Shorts from this episode" rail, "More from the slate" rail, footer.

### PHONE FRAME (390x844) — show HOME and SERIES side by side in a "Mobile" view
Top bar 56px (wordmark, search 44, avatar 44). Bottom tabs 56px: `Home · Watch · Read · Requests · You`,
items 48x48, icon 24, label 12px. Home: hero art 358x448 (4:5 top crop of 9:16) on 18% ambient
gradient, then status line 14px, then two full-width 48px CTAs, then "On the slate" rail 2:3 cards 111x167 3-up
with peek (state chip + count), then Episodes rail 9:16 cards 111x197 with 2px progress, then Read rail
111x167, then Play rail 16:9 171x96. Series: key art 390x520 with bottom scrim, title 30px + status
line 14px, `Start Ep 1` 48px / `Follow` / `Trailer`, synopsis 3-line clamp, episode rows 144px
(9:16 thumb 72x128), cast shelf, three vote cards. Touch targets 44px or more. Nothing under 12px.

## 3. Deliverable format (per direction)
ONE self-contained HTML file `mockup-<direction>.html` with an in-page view switcher (top-left
dev chip, visibly not part of the design): `Home · Series · Episode · Mobile`. Views are sections
toggled with a few lines of vanilla JS (hash-based: #home #series #episode #mobile), all four
rendered in the DOM (no lazy). Fonts via Google Fonts link (max two families). No frameworks,
no Tailwind CDN, plain CSS with custom properties named after the tokens above. Images via
relative `assets/…`. Include the "Native mode" toggle. Must be responsive down to 390px (real
responsive, not only the phone frame). No console errors. Target 250KB or less of HTML+CSS.
