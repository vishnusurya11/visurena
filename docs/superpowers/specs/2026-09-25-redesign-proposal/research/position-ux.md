# Position: UX / Information Architecture — Visurena redesign

Inputs: BRIEF.md plus the correction that episodes are **vertical 9:16** micro-drama (~10 min,
60s portrait trailer, landscape features later); the six refs/ screenshots; the
`entertainment-platform-ui` skill; 8 sources opened (section 6).

## 1. DIAGNOSIS

- **Hero, then void.** `home-top.png` (1440x4588): one hero (~800px), ~3,300px of black, a
  marquee, more black, footer. A visitor at 1440x900 sees one work and no evidence a second
  exists. The 2025 references all moved toward more titles on screen (Apple TV, Netflix).
- **Hubs are billboards.** `movies.png` = the word "Movies", a tagline, "Coming soon", black,
  footer — while 11 published episodes exist. `stories.png` claims "6 stories · 4 genres", then
  shows one story and black. The IA declares empty rooms that are not empty.
- **The header does the wrong jobs.** Two stacked bars (language + beta badge, then nav). Five
  equal-weight vertical names; "Home" duplicates the wordmark. Missing: search, continue/account,
  and the Request board — the stated differentiator has no nav presence.
- **The hero says nothing about format.** "FALLS WATER" as a typographic poster, a synopsis,
  "READ IT". No "Short story · 32 min", no ongoing/complete state, no resume. On mobile the
  8px mono micro-labels carrying metadata are unreadable; the phone page is a hero and a footer.
- **No spine for what the studio makes.** Nothing models "series → episode → next drop", and the
  page grammar assumes landscape video while the pipeline produces portrait episodes, title cards
  and trailers. The one thing the site got right by accident is its 3:4 poster grid — empty.

## 2. NON-NEGOTIABLES (IA)

1. **First viewport shows real, actionable works, plural.** Desktop ≥6 artwork items with a
   format/status line ("Series · Ep 11 · new Tuesdays") before any scroll; mobile ≥3. A section
   with fewer than three items does not render — a data rule in the page, not a hope.
2. **One nav bar carrying jobs, not just rooms.** Wordmark, verticals, **Requests** as a peer of
   the verticals, then Search and Continue/You. One ~60px bar; beta badge and language move to
   the footer. Mobile: 5-item bottom tab bar.
3. **Series and episode pages are canonical, JSON-driven templates that hold both aspect
   ratios.** `aspect` is a field on every video item; the same routes render a portrait theater
   today and a landscape player for features later. Every mockup ships both pages.

## 3. PROPOSED IA

**Global nav (web).** Left: `VISURENA` (is Home). Center: `Watch · Read · Play · Requests`.
Right: `Search` (overlay, mixed results grouped by vertical), `Continue` (avatar after Cognito;
before that a pill fed by localStorage progress). **Music is hidden until it has ≥3 works.**
Verbs over nouns because a demand-driven studio sells actions; the jewel accent survives as each
item's dot. Prime Video and Netflix TV both converged on one flat, always-visible bar of five to
six items; neither stacks a status bar above it.

**Mobile bottom bar.** `Home · Watch · Read · Requests · You`; Search in the top bar. YouTube's
2026 test moving Subscriptions off the bottom bar was criticized precisely because the most-used
job left thumb reach.

**Homepage (today: 1 series/11 portrait episodes, 1-6 stories, a few games, 10 queued).**
First screen at 1440x900 (nav 60 + 840px):

1. **Hero, max 55vh (~460px), split.** Right: the 60s portrait trailer in a 9:16 frame (~260px
   wide, muted, plays on dwell, poster fallback) over a blurred colour-pulled backdrop. Left:
   series logo, status line "Series · 11 episodes · Ongoing · new Tuesdays · Sherlock Holmes,
   1887", logline, `▶ Play Ep 1` / `Trailer` / `+ Follow`; returning visitor gets `Continue Ep 7
   · 4 min left` (Apple TV Up Next logic). Rotates 2-3 items with a visible indicator. A portrait
   frame inside a landscape hero is the honest way to show this format on desktop.
2. **"Latest episodes" rail, starting inside the fold.** 9:16 cards from the portrait title
   cards, **7 visible at 1440** (portrait is denser per row than 16:9 — a gift), each with Ep
   number, title, duration, date, progress bar, "New" badge (Disney+'s 2025 timely badges).
   Seven real items on screen one.

Below the fold: 3. **Continue** (cross-vertical, only if non-empty). 4. **"On the slate"** — the
10 queued novels as portrait posters with a state chip (`In production · Voting · Queued`) and
vote counts: the Request board surfacing on Home, honest future inventory that turns emptiness
into anticipation. 5. **Read** rail ("Short · 32 min" / "Serial · Ch 4 · Fridays"). 6. **Play**
rail. 7. **Shorts** rail (short60, same 9:16 card, labelled "Short"; a shelf, not a tab, until
volume justifies one). 8. **Request board teaser** — top three requests with vote buttons +
`Request something`. 9. **Studio note** — one dated card; replaces the marquee. 10. Footer.
About four screens tall today; rails are added as series ship, never padded.

**Series page** `/watch/a-study-in-scarlet`. First screen: left, portrait key art/trailer frame;
centre, logo, status line, logline, `Continue Ep N` (progress ring) or `Start Ep 1`, `Trailer`,
`+ Follow`, `Share`; right, still above the fold, the **episode grid begins** — episode selection
above the fold is what a series page is for. Then the full grid (portrait cards 7-up; current
highlighted; **the next unpublished episode is a locked card "Ep 12 · drops Tue 30 Sep"**,
Webtoon-style schedule-in-the-list). Then tabs: Cast, Extras (trailer, audiobook, casebook),
Shorts from this series, About the adaptation. Then "More from the slate". A landscape feature
uses the same template with 16:9 art and one `Play feature` CTA.

**Episode page, desktop = theater with side panel** (`/watch/a-study-in-scarlet/ep-7`). The
player fills viewport height minus nav (~840px → ~470px wide at 9:16), centred-left on a
blurred frame-derived backdrop so there is no black pillarbox. A **400px right panel** with tabs
`Episodes` (list, progress, current pinned) · `Chapters` (timecodes from JSON) · `About`
(synopsis, cast). Breadcrumb above; `‹ Prev` / `Next ›`, keyboard ↑/↓ and an end-of-episode
countdown chain episodes (the Shorts grammar applied to a series). Below the fold: shorts cut
from this episode, the series rail, comments later. When `aspect: 16:9`, the player takes full
content width and the panel drops beneath it — same route, same components.

**Episode page, mobile = swipe feed scoped to the series.** Full-screen 9:16; vertical swipe =
next/previous episode; tap toggles chrome (series name, Ep N, chapter-segmented progress bar); a
bottom sheet holds Episodes/Chapters/About; the last published episode ends on a "drops Tuesday
· Follow" card, not a dead end. ReelShort/DramaBox grammar scoped to one series; a cross-series
feed waits until ~5 series exist. Landscape features on mobile: inline 16:9, rotate to full screen.

## 4. CONTENT DENSITY RULE

- **Fold rule.** Desktop ≥6 artwork items with metadata in the first 900px; mobile ≥3. Hero
  ≤55vh desktop, ≤60vh mobile; the first rail's top edge always sits inside the fold.
- **Screen rule.** Every subsequent 900px contains a rail with ≥5 visible cards desktop or 2.5
  with peek on mobile. Section gaps ≤64px. Tiles at 1440: 9:16 cards 7, 2:3 posters 7-8, 16:9
  (features, games) 5-6. Mobile: 3-up portrait with peek.
- **Collapse rule.** A rail with <3 items does not render; a vertical with <3 works has no nav
  item and its hub redirects to Home with a slate/vote block. "Coming soon" is banned alone; it
  must carry a date or a vote CTA.
- **Reveal rule.** Content is in the static HTML at opacity ≥0.6 before any motion; scroll
  animations may finish a reveal, never start one. The black stretches are a motion decision.
- **Portrait rule.** Portrait video never gets black pillarboxes; the frame sits on a blurred
  backdrop and the reclaimed width holds the episode/chapter panel.
- **Honest filler.** The slate, shorts and open requests fill the page without lying; marquees,
  stat counters and giant section wordmarks do not.

## 5. WHERE I EXPECT TO DISAGREE

- **Visual/brand** will want a taller full-bleed hero and typographic poster titles. I hold hero
  ≤55vh with a portrait frame inside it, a metadata line under every title, and no marquee. The
  giant "Movies" wordmark on hub pages is the worst use of space on the site.
- **Motion/frontend** will want scroll reveals, hover expansion and an autoplaying swipe feed on
  desktop. I accept dwell trailer in the hero, non-shifting hover cards and ↑/↓ chaining in the
  theater; I reject anything that hides content before interaction, or a desktop feed that hides
  the episode panel.
- **Product** will want Requests as the hero and possibly a feed-first Home. Requests goes in the
  nav and at Home positions 4 and 8 — people vote after they care, after they watch — and Home
  stays browse-first until ~5 series. An empty Music tab hurts "one-stop" credibility more than a
  missing one.
- **Mobile/design-systems** may want Watch to open straight into a feed, or vertical names as the
  five tabs. I want job tabs, a browse hub behind Watch, the feed entered from a card, and a
  metadata line that survives 3-up portrait cards at 390px (drop the date before the Ep number).

## 6. REFERENCES

- https://www.apple.com/newsroom/2025/06/apple-tv-brings-a-beautiful-redesign-and-enhanced-home-entertainment-experience/ — tvOS 26: new poster art chosen so more titles fit on screen; profiles on wake for instant Up Next.
- https://www.aboutamazon.com/news/entertainment/prime-video-updated-steaming-experience — one flat bar Home/Movies/TV Shows/Sports/Live TV + hubs; hero rotator scoped to the selected section.
- https://www.disneyplus.com/explore/articles/disney-plus-app-redesign-new-features — For You/Disney+/Hulu/ESPN tabs, brand row, timely badges ("Season Finale", "New Series").
- https://www.tubefilter.com/2025/05/07/netflix-tv-homepage-redesign-tiktok-style-feed/ — shortcuts always visible at top; contextual badges to cut decision paralysis; vertical clip feed on mobile only.
- https://9to5google.com/2026/05/18/youtube-removes-subscription-tab-new-test-mobile/ — moving Subscriptions to top tabs criticized for taking the most-used feed out of thumb reach.
- https://play.google.com/store/apps/editorial?id=mc_apps_howto_webtoon_fcp&hl=en_US — Home + New & Hot daily releases, series page with episode list, Subscribe alerts, weekly cadence per series.
- https://apps.apple.com/us/app/reelshort-stream-drama-tv/id1636235979 — full-screen portrait episodes, vertical swipe between episodes, series-based library, daily additions.
- https://www.kurthenderson.com/blog/crunchyroll-redesign — episode info and selection belong above the fold on a series page; add Follow with new-episode alerts.
