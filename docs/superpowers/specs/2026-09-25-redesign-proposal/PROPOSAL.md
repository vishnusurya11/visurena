# Visurena redesign proposal

Date: 2026-09-25. Prepared for the owner by a five-expert panel (UX/IA, visual/brand, motion and
front-end, entertainment product, mobile and design systems). Two rounds: independent research
with cited sources, then a debate where each expert conceded, held, and voted.

## 1. Why the site reads as a 2000s website

The panel agreed on five causes. All five are fixable without touching the backend.

1. **Hero, then void.** Every section below the hero starts at opacity 0 and only appears when
   scrolled into view. A visitor at 1440x900 sees one story and no evidence anything else exists.
   The full-page screenshot shows about 3,300px of black.
2. **The strongest product is hidden.** Fourteen finished episodes of A Study in Scarlet, a trailer,
   a cast, an audiobook and a casebook exist on YouTube and in the studio. The Movies page says
   "Coming soon". The site sells one short story and hides a complete series.
3. **Space-template styling.** Starfield tiles, colored nebula fog, glow text-shadows, and
   10px wide-tracked uppercase mono labels are the recognizable 2012 to 2016 "space" template.
   Every premium dark entertainment site checked (Apple TV, A24, Criterion, Mubi, Max) uses a
   flat near-black ground and lets the artwork supply all the color.
4. **Three unrelated type voices.** Serif display, serif italic body, mono labels. The studio's own
   title cards already carry a Trajan-style serif, so serif chrome on top competes with the film.
5. **No time, no loop.** Nothing on the page has a date, a state, or a count. No follow, no
   continue, no vote. Every visit is a first visit.

## 2. What the panel agreed on (unanimous after debate)

- **Nothing is ever empty or "coming soon".** Desktop first viewport shows at least six real works,
  each with a status line in the form Format · State · Count · Runtime. Modules with fewer than
  three items do not render. Unreleased work carries a production state or a vote count.
- **Everything visible at first paint.** No opacity-0 reveals, no scroll-gated content, no
  marquee, no continuous animation, no autoplay. Motion only for state changes and hover.
- **Only artwork is saturated.** Chrome is neutral. The vertical accent is a mark, one role per
  viewport: a state chip, a progress fill, the active-nav underline, vote digits.
- **Ambient light comes from the artwork**, as a tiny pre-blurred copy of the poster emitted at
  ingest. That single asset works on web and React Native. No blur filters, no blend modes.
- **The brand must survive React Native.** Every element is expressible as surface, two-stop
  gradient, image, text style, radius, and 1px border. Each mockup has a "Native mode" toggle
  that strips web-only garnish so you can see the brand still holds.
- **Vertical video is native, not embedded as an afterthought.** The episodes are 9:16. The
  desktop episode page is a portrait stage on a frame-derived glow with a 400px episode panel
  beside it. Mobile is a series-scoped full-screen swipe player. Landscape features use the same
  routes with the panel dropping below.
- **One nav bar, the four rooms kept.** Stories · Movies · Music · Games · Requests, plus search and
  Continue. Video series, episodes, trailers and shorts are added under Movies. The beta badge and
  language bar leave the header.
- **Home treats the four verticals as peers.** A four-slot hero, one slot per vertical, then a New
  this week rail mixing all kinds, then Stories, Movies, Music and Games rails. No wall of identical
  episode posters: one title card per series, a distinct scene still per episode.
- **Requests is the differentiator and gets real estate.** Nav item with a live count, home
  module three ("On the slate"), a teaser near the foot of the page, the last module of every
  series page, and the end card of a finished series.

Where they still disagree, and my call:

| Question | Split | Call for the mockups |
|---|---|---|
| Serif in the chrome | Visual says none, mobile says keep a serif display | Lobby and Broadsheet follow the visual lead; Jewel Room keeps a serif so you can compare |
| Requests in the first viewport | Product wants it, UX says people vote after they care | Episode rail in the fold, slate as module three, Frankenstein as hero slot two |
| Mobile tabs | Mobile wants job tabs, owner wants the four rooms | Home · Stories · Movies · Music · Games, Requests in the top bar |
| Glass header | Motion allows blur on the header only, mobile says never | No blur anywhere. Header is 92% opaque bg-0 |

## 3. The three directions

All three share the same information architecture, content, copy, and rules. Only the skin
differs. The panel voted five to zero for Cinema Lobby, kept Broadsheet as the serious
alternative, and killed a fourth direction ("Signal", an instrument-panel look) as too cold for
period drama.

**A. Cinema Lobby + Board (recommended).** Dim the room, light the poster. Flat charcoal
ground, Geist for everything, mono only for numbers. Signature: the lit poster with a 2px accent
floor line that doubles as the progress bar. The slate uses a 2px accent rail and large tabular
vote counts. Cheapest to render, maps one-to-one onto React Native, and gives the vertical video
stage a natural home.

**B. Editorial Broadsheet.** A cinema journal printed on black paper. Newsreader display plus
Hanken Grotesk, hairline rules, folio numbers, posters as captioned plates, the Request board as
a letters page. Most literate and most distinctive. Risk: it wants weekly editorial copy or the
masthead metaphor rings hollow.

**C. Jewel Room.** Your current identity done properly. Fraunces display plus Inter Tight,
per-room color washes (emerald for Watch, amber for Read, ruby for Listen, amethyst for Play),
still, not drifting, with a grain overlay. Keeps the most of what you have. Risk: the room washes
spend the accent budget the other two directions save, and the serif competes with the title cards.

## 4. Studio integration (the video tab)

The studio's library already has everything the site needs per series: episode master files,
YouTube video ids, title cards, a 60s trailer, cast sheets with portraits, an audiobook, and a
casebook. Proposed contract, matching the locked content model (one folder per work, item.json):

- `content-sync` reads the studio's `SERIES_PROGRESS.json` and `uploads.jsonl` per book and emits
  `watch/YYYY/MM/DD/<slug>/item.json` with `kind: series`, `aspect: "9:16"`, state
  `airing | complete | in-production`, `episodes[]` with `youtubeId`, `title`, `runtime`,
  `publishAt`, `chapters[]`, plus `trailer`, `cast[]`, `audiobook`, `extras`.
- At ingest, crop the centre 720x1280 from the YouTube frame as the poster, and emit a 64x36
  pre-blurred glow image per poster. Those two assets drive the whole look.
- Playback: click-to-load YouTube embed on youtube-nocookie today, with our own player chrome
  for chapters, up-next auto-advance, and progress sync. Migration to self-hosted HLS on S3 plus
  CloudFront later is a per-work `source` field. The free CloudFront tier covers roughly 5,000
  views a month of ten-minute episodes before cost starts.
- Hover previews are 5s muted WebM clips rendered by the studio's existing ffmpeg step.

## 5. Alpha to prod

Nothing in the design depends on environment. The content bucket, CloudFront distribution, and
API base URL stay parameterized by env as they are today. The ingest step above runs against the
alpha bucket first. The design tokens compile once and ship to both.

## 6. Build plan after you pick

1. Tokens: DTCG JSON source, Style Dictionary build to CSS variables, Tailwind preset, and a
   React Native theme object. Replaces the three hand-mirrored palettes in the repo.
2. Components in packages/ui: TopBar, MediaCard with a ratio prop, Shelf, StatusLine,
   HeroBillboard, SeriesHeader, EpisodeList, PlayerStage, RequestCard with VoteButton, Badge.
3. Pages: Home, Stories, Movies hub, Series, Episode, Music, Games, Requests. Delete the fade-in wrapper,
   the starfield, the marquee, and the hub wordmark pages.
4. Studio ingest for A Study in Scarlet and the Frankenstein in-production state.
5. Tests for every new function, ARCHITECTURE.md decisions D2, D3, D4, D16, D17 updated.

Rough effort: about three working sessions for one direction, front-end only, with the
Requests board voting wired to a stub until the API exists.

## 7. Questions for you

1. Which direction, or which mix.
2. Confirm the episodes are meant to stay vertical for the whole slate, or whether landscape
   features are close enough that the hero should show both.
3. Whether "Requests" is the word you want in the nav, or "Next", or "Slate".
4. Whether the studio can write item.json itself at publish time, or the site should read the
   studio's ledgers as they are.
