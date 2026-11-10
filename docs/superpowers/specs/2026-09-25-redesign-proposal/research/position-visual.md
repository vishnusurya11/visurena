# Visurena redesign — Visual / brand position (2026-09-25)

Lane: typography, color, imagery, composition, texture. Grounded in the screenshots in `refs/` and the sites listed in §6. Correction folded in: episodes are **vertical 9:16 micro-drama**; portrait key art is the primary asset.

## 1. DIAGNOSIS — why it reads as dated

- **Background = theme, not stage.** Drifting starfield tiles + a per-section colored radial "nebula" is the 2012–2016 "space" template: noise texture plus lens-flare gradient, applied before there is content to light. Every premium dark entertainment UI I opened (Apple TV, A24, Criterion, HBO Max, Mubi) uses a flat near-black ground and lets *artwork* supply all color. The Movies page is the tell: green fog, a giant serif word, "Coming soon" — a mood board, not a product.
- **Type pairing has three unrelated voices.** Newsreader/Fraunces display + Spectral italic body + JetBrains Mono labels is the Squarespace "editorial" preset. Worse, the studio's own title cards (`title-ep01/04.png`) already carry a Trajan-style small-caps serif with a red "Scarlet" — serif UI on serif key art means the chrome competes with the film.
- **Tracking is the loudest offender.** 10–11px uppercase mono at ~+0.25em in 40%-ivory ("THE EMERALD ROOM · MOVIES", "ESTD. MMXXVI"). Wide-tracked mono caps on black is the most recognisable Tumblr/sci-fi-template signifier, and at that size it fails contrast.
- **Glow and ivory.** Text-shadow glows on marquee words, dot-glows in the nav, four full-saturation swatches in the footer, #f5efdb ivory over emerald (muddy yellow-green). Netflix's rule is the modern one: chrome grey-on-black so artwork "reads as luminous". Here the chrome glows.
- **Empty black + a marquee.** Scroll-fade sections leave 2–3 viewports of #000; the only relief is a 100px italic marquee. On mobile that is a 9800px page with one hero. No palette fixes a page that shows one poster.

## 2. NON-NEGOTIABLES (for all three mockups)

1. **Only artwork is saturated.** Surfaces and text are neutral. A vertical accent appears at most **once per viewport** as a *mark* — a ≤4px rule, a progress fill, a badge, ≤2 words — never as a section wash. Per-item immersion only as a tint ≤12% over a surface, computed from the poster at ingest and stored as hex in the content JSON (RN-safe: no blur, no blend modes).
2. **Elevation by luminance steps, never glow or colored shadow.** Four surface levels stepping ~5–7% (Muzli; matches Netflix #141414→#181818→#2F2F2F). Hairline borders at bg+1. Zero `text-shadow`, zero colored `box-shadow`.
3. **One family carries the UI; an optional second voice only for titles.** Tracking in [-0.03em, +0.06em]. No uppercase below 12px. Scale via optical size (opsz), not a third family. Every family must ship OFL static TTFs for Expo — all named below do (Google Fonts `css2`, all 200).

## 3. THREE VISUAL DIRECTIONS (ranked)

### #1 "Cinema Lobby" — the theatre principle, portrait-first
- **Mood:** dim the room, light the poster; the site is a lobby of lit one-sheets.
- **Background:** flat charcoal `#0C0C0E`. Per hero/series, a vertical linear gradient from the poster's stored `ambient` hex at 18% opacity into base, across the top 60vh. Crossfades between items; no drift, no stars.
- **Type:** **Geist** (UI, display, 300–700) + **Geist Mono** only for timecodes/episode numbers (tabular). No serif in chrome — the title cards already own the serif. Display at 56–72px, weight 500, -0.025em; body 16/1.55.
- **Color rule:** accent = the vertical's progress fill + the "Next drop" mark + the active nav underline. Nothing else. Buttons are white-on-charcoal.
- **Imagery rule:** the 9:16 card is the atom. Row tiles at **2:3** cropped from the top 75% of the 9:16 (the title lockup sits at ~35–45% height in ep01/ep04, so it survives). Hero = full-height 9:16 card at left on the ambient wash, episode strip right; on mobile the card goes full-width top. Future 16:9 sits in the same rows as a double-width tile — row height constant, tile width changes. Never letterbox portrait into 16:9.
- **Signature:** the *lit poster* — a 1px `#2A2A30` frame plus a 2px accent "floor line" beneath the hero card that doubles as the series progress bar.

### #2 "Editorial Broadsheet" — Criterion/Mubi Notebook, the studio as a weekly
- **Mood:** a cinema journal printed on black paper; the studio's making-in-the-open shows as issues, columns and folios.
- **Background:** `#101010` "paper" with hairline `#262626` rules; no gradients at all. Sections are separated by rules and folio numbers, not by color.
- **Type:** **Newsreader** (opsz 6–72, display + standfirsts, italics only for one-word emphasis) + **Hanken Grotesk** (UI/body/meta). Newsreader's opsz gives masthead and caption from one family, killing the three-voice problem.
- **Color rule:** accent as a single 3px rule under the section head and as the drop-cap color; footer swatch row deleted. Everything else `#F2F1EC` / `#A9A8A3`.
- **Imagery rule:** posters as **plates**: 2:3 (from 9:16 top-crop) with caption beneath in 13px grotesk, ragged 3–5 column grid on desktop, 2-up on mobile. 16:9 works as a full-column plate. Title cards are never overlaid with UI text.
- **Signature:** the **masthead + folio** system ("No. 12 · Week of 22 Sept · Ep. 11 of 11") in tabular Newsreader figures — the Request Board reads as the letters page.
- **Risk:** slower, more "read" than "watch"; needs real editorial copy weekly or it looks empty again.

### #3 "Signal" — Linear/Arc-grade technical dark
- **Mood:** an instrument panel for a demand-driven studio; numbers, rails, live state.
- **Background:** cool graphite `#121316`; surfaces `#191A1E` with 1px `#26272B` borders and 8px radius; no gradients.
- **Type:** **Bricolage Grotesque** (opsz 12–96, display) + **Inter Tight** (UI) + **Geist Mono** for stats. Bricolage's opsz keeps the wide-set display and tight UI in one voice.
- **Color rule:** a single 2px accent rail on the left edge of the active section/card; vote counts on the Request Board in accent; nothing else.
- **Imagery rule:** 9:16 preserved uncropped inside bordered frames, uniform grid; 16:9 in the same frame width, letter-spaced by the grid not by black bars.
- **Signature:** the **signal rail** + a live requests/votes ticker in tabular mono (replaces the marquee).
- **Risk:** reads as SaaS; coldest fit for stories and period drama.

## 4. THE PALETTE (revised tokens)

Surfaces (neutral, warm-black; no blue cast so amber/ruby don't muddy):
- `bg-0 #0C0C0E` page — near-black, not #000: avoids OLED smear and gives one step below cards.
- `bg-1 #141417` section/card — +5% luminance; where posters sit.
- `bg-2 #1C1C20` raised/hover — the only hover treatment (no glow).
- `bg-3 #26262B` overlay/menu/player chrome — also the hairline border color on bg-1.

Text:
- `text-1 #F2F1EC` warm white (replaces ivory #f5efdb, whose yellow cast fights emerald/ruby).
- `text-2 #A9A8A3` body/meta — ~9:1 on bg-0.
- `text-3 #6F6E6A` captions/disabled — 4.6:1 on bg-0, floor for 12px.
- `on-accent #0C0C0E`.

Vertical accents (desaturated ~15% and lifted for dark; each with a `-wash` = accent at 12% over bg-1 for per-item tint):
- Stories **amber `#E8B04B`** (was #f5b831) — pulled from school-bus yellow toward gold; still 10:1 on bg-0.
- Movies **emerald `#3DD68C`** (was #00d97e) — the 00-channel green was the most "neon 2010s" value in the set; this holds the jewel without the glow.
- Music **ruby `#F0537A`** (was #e91e63) — hot-pink read as nightclub; rose-crimson reads as velvet and clears 5.5:1 for text.
- Games **amethyst `#B48CF7`** (was #c084fc) — nearly kept; nudged toward blue so it doesn't merge with ruby-wash.
- Sapphire `#6C9BFF` — system only (links, focus rings), never a vertical.

## 5. WHERE I EXPECT TO DISAGREE

- **UX/IA** will want colored dots/underlines on every nav item for wayfinding. I say labels wayfind; color once per viewport, or the four accents become carnival again.
- **Motion/frontend** will want the ambient wash as a blurred poster (`backdrop-filter`) and some drift to keep "nebula". I say a solid gradient from a precomputed hex, opacity crossfade only — it's RN-portable and the drift is what reads as 2010s.
- **Product** will push ReelShort-style Hot/New/Trending badges and a loud accent-colored Request Board. I say one neutral badge style, and the board earns attention through big tabular numbers, not color.
- **Mobile/design-systems** will want `#000` for OLED and system fonts. I say `#0C0C0E` and bundle the OFL TTFs; Netflix and Apple TV both ship near-black + one custom family.
- **The brief** says "The Studio" stays. It does — but the serif that carries "studio" now lives in the key art, not the chrome. Dropping the UI serif in directions 1 and 3 is deliberate.

## 6. REFERENCES (opened)

- https://tv.apple.com/ — black ground, one sans family, posters carry all color.
- https://mubi.com/ — dark ground, bold sans headlines, full-bleed stills.
- https://a24films.com/ — flat frames, no glows, grayscale chrome, whitespace does the separating.
- https://www.criterionchannel.com/ — near-black, white sans, generous tracking only at 18–24px, not micro.
- https://www.hbomax.com/ — black + bottom-darkening gradients for legibility, restraint elsewhere.
- https://www.reelshort.com/ — vertical micro-drama reference: 9:16 tiles in horizontal rows, hero uses larger portrait cover beside synopsis.
- https://www.dramabox.com/ — same format, 3–4 portrait tiles across on desktop, proportions never changed.
- https://oh-my-design.kr/design-systems/netflix — "theater principle", #141414/#181818/#2F2F2F steps, red as accent not surface.
- https://www.itsnicethat.com/articles/spotify-dinamo-new-typeface-spotify-mix-project-230524 — why one expressive variable family beat a "regular at different weights" face.
- https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/ — luminance-step elevation, #0A–#16 base range, off-white text.
- https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/ — atmospheric gradients as light not backgrounds; type-led maximalism.
- https://fonts.googleapis.com/css2?family=Geist … Newsreader, Hanken+Grotesk, Bricolage+Grotesque, Inter+Tight, Geist+Mono, Instrument+Serif, Fraunces, Literata — all returned 200 (fonts available, OFL).
