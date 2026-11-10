# UX / IA — round 2

## 1. CONCEDE

- **Product: Scarlet is complete.** The locked "drops Tuesday" card and next-drop hero line are gone; the series page ends with "What should we adapt after this?"; Follow is the single retention verb ("notify me about the next series"). Nav word is **Next** with its live vote count, not Requests.
- **Motion: maxres is 16:9 with side-fill.** Poster = centre 720x1280 crop at ingest; click-to-load embed; one persistent mobile player; reveals with a visible fallback.
- **Visual: 2:3 row tiles cropped from the top 75% of the 9:16.** Denser (7-8 up) and the lockup survives; 9:16 only for hero card and player. Accent once per viewport; nav dots go.
- **Mobile: Search takes the Read slot.** Tabs `Home · Watch · Search · Next · You`. Three tokenised ratios.

## 2. HOLD

1. **First viewport = hero + episode rail, not hero + vote strip (vs Product).** A first-timer must see 14 episodes exist before being asked what to make next; "Next from the studio" is module 3, one scroll tick down.
2. **The first rail's top edge sits inside the fold, as static images (vs Motion).** Seven thumbnails under the hero cost nothing in LCP and are the only proof the site is not empty.
3. **Watch opens the hub; the feed is entered from a card (vs Mobile).** A feed of one complete series is a playlist. The feed earns the default slot at ~5 series.

## 3. VOTE

**Cinema Lobby.** Its atom is the portrait card and its chrome is a neutral sans legible at 12px — exactly what seven status-lined tiles per row and a 3-up phone need. **Kill Signal:** the ticker is the marquee reborn and an instrument panel is the wrong room for Holmes. (Broadsheet's own risk, "looks empty without weekly copy", is today's failure restated.)

## 4. THE ONE THING

**Nothing on the page is ever empty or "coming soon."** Desktop first viewport shows at least six real works with a status line; any module under three items does not render; every unreleased thing carries a production state or a vote count. Miss this and it is the old site with better fonts.

## 5. MOCKUP NOTES

1. **Home 1440x900:** one 60px bar `VISURENA · Watch · Read · Play · Next (312) · search · Continue`. Hero 460px: 9:16 Scarlet card (260px) left on the ambient wash; right: logo, status line, logline, `Start Ep 1` / `60s trailer` / `Follow`. Rail at y≈560: "All 14 episodes", 2:3 tiles, 7 visible plus peek, caption `Ep 3 · The Lauriston Garden Mystery · 9:48`, watched tick. Then: Next from the studio (Frankenstein in production, three requests with counts + Vote, `Request a title`), Continue (only with state), Read, Play, Shorts, one-line "How this studio works", footer. ≤3,600px total.
2. **Series page first viewport:** poster card left; centre: title, status line, synopsis, `Start Ep 1` / `Follow`; right: episode grid already visible (two rows). Chronological, no locked rows. Tabs: Cast · Audiobook · Casebook · Shorts. Last module: three vote cards.
3. **Episode page desktop:** 9:16 stage 780px tall (~440px wide) centred-left on the frame glow; 400px panel `Episodes (current pinned) · Chapters · About`; breadcrumb `A Study in Scarlet › Ep 4 of 14`; up-next Ep 5; provenance line under the stage.
4. **Phone 390px:** 56px top bar, 56px tabs; hero card ≤60vh with status line beneath; shelf 3-up plus peek (~111px tiles); one "Vote on what's next" card; every label ≥12px.
5. **Status-line grammar everywhere:** `{Format} · {State} · {Count} · {Runtime}` — `Series · Complete · 14 episodes · ~10 min each`; `Short story · 32 min`; `Frankenstein · In production · script done`; `Dracula · 212 votes · Vote`.
