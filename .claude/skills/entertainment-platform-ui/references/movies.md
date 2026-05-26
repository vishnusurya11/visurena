# Movies / Video Streaming — UX Reference

Exemplars: **Netflix, Disney+, Max, Prime Video, Apple TV.**
Core idea: a dark canvas where **artwork is the UI**; collapse a library of thousands into a stream of small, low-stakes choices, and remove all friction between "I'm bored" and "I'm watching."

## Key screens

1. **Browse / Home** — Hero billboard + stacked content rows.
2. **Vertical / category landing** (Shows, Movies, Genre, "New & Hot") — same row grammar, scoped catalog.
3. **Title detail page** — the decision page for one title.
4. **Player** — full-screen immersive playback.
5. **Search & results** — query box, recent/trending, predictive results grid.
6. **My List / Watchlist** — saved titles.
7. **Profile gate + profile switcher** — who's watching.
8. **Account / settings** — playback prefs, parental controls, subtitles defaults, downloads.

## Signature components

### Hero billboard (the showpiece)
- Full-bleed, top-of-home, **personalized** to a high-conviction title for this user.
- Cinematic still that transitions to an **auto-playing muted trailer/motion** after a short dwell (with a mute/unmute toggle).
- Overlay: logo treatment (title art, not plain text), short synopsis, maturity rating, and **two CTAs: primary "Play", secondary "More Info" + an Add-to-List**.
- Bottom gradient scrim so text/buttons stay legible over any frame.
- Pitfall: don't autoplay loud audio; don't let the trailer obscure the CTAs; keep a poster fallback for slow connections.

### Content rows / carousels (the heart of browsing)
- Horizontally scrolling rows of cards; **vertical stack of horizontal rows**. Lets hundreds of titles live on one screen without overwhelm.
- **Three layers of personalization**: which rows appear and their order; which titles fill each row; the ranking of titles within a row.
- Standard rows: **Continue Watching (always first for returning users)**, Top 10 / Trending Now, New Releases, "Because you watched X", genre rows, "My List".
- Cards: artwork-forward; show progress bar overlay for partially-watched; ranking numeral for Top-10 rows.
- Show a **partial next card** at the row edge to signal scrollability; provide arrow affordances on web, swipe on touch, D-pad focus on TV.
- Pitfall (real, from Netflix's 2025 redesign backlash): **don't reduce how many tiles are visible per row** (6→4) — it lowers information density and frustrates browsers. Density is a feature here.

### Continue Watching
- Resume exact position; thumbnail reflects a frame near the resume point with a progress bar.
- Per-item overflow: "Remove from row", "View title details", "Mark as watched".
- For series: surface the *next episode*, not the one you finished.

### Hover / long-press preview
- **Desktop hover** (after ~400–600ms dwell): card expands into a preview card with muted autoplay video, title logo, quick actions (Play, +My List, Like/Thumbs, More Info), match %, runtime/seasons, top genres.
- **Mobile**: long-press or a dedicated info tap opens a bottom sheet preview (no hover on touch).
- Value: lets users decide *without* leaving the row — measurably speeds browse→watch conversion.
- Pitfall: don't trigger on accidental mouse pass (require dwell); don't shift layout so neighbors jump.

### Title detail page
- Backdrop key art / looping preview at top with Play (resume) as the dominant CTA.
- Metadata block: synopsis, cast, year, maturity rating, genres, match %, ratings/critic score.
- For series: **season selector + episode list** with per-episode thumbnail, title, duration, synopsis, and progress.
- Actions: Play, Add to My List, Like/Rate (thumbs up/down or stars), Share, Download.
- "More Like This" row + Trailers & Extras.
- Pitfall: don't flatten hierarchy — Play and resume must dominate; details are secondary.

### The video player
The player is where "invisible by design" matters most. Best-in-class controls:
- **Auto-hiding chrome**: controls fade after ~3s of inactivity, reappear on tap/move. Tap center to play/pause (mobile).
- **Scrub bar with thumbnail/storyboard preview**: hovering/dragging the timeline shows a frame preview at that timecode (Netflix, Prime, Max). Buffered range shown distinctly from progress.
- **Skip controls**: ±10s double-tap (mobile) / on-screen jump buttons; **Skip Intro** and **Skip Recap** contextual buttons; **Next Episode** countdown card on credits (with cancel).
- **Captions/subtitles**: easy toggle + a settings panel for language, size, background, style. Treat as essential, not optional.
- **Audio & quality**: audio track/language selector, quality/data-saver, playback speed (some platforms).
- **Top bar**: back/exit, title, cast-to-device (AirPlay/Chromecast), episodes drawer.
- **Live/Sports overlays** (if applicable): live indicator, jump-to-live, stats overlay.
- Pitfall: don't bury captions or Next-Episode in deep menus; don't let the scrubber be too thin to grab on touch; always show buffering with a clear spinner (buffering tanks satisfaction).

### Profiles
- **Who's watching** gate on launch: avatar grid (incl. Kids profile), Add Profile, Manage.
- Each profile = isolated taste graph, Continue Watching, My List, maturity level.
- Fast switch from a top-right avatar without full re-auth.

### Watchlist / My List
- One-tap add from any card, billboard, or detail page (the "+" → "✓" toggle).
- Dedicated tab/row; reorderable; the AI should weave list items back into home rows.

## Navigation / IA
- **Web/TV**: top nav (Netflix's current: Search, Home, Shows, Movies, Games, My Netflix) or left sidebar (Prime, Disney+, classic Netflix). Note users *prefer* the familiar left/standard nav — change cautiously.
- **Mobile**: bottom tab bar (Home, Search/Discover, Downloads, My Stuff).
- **Disney+/Apple TV difference**: brand-hub tiles (Disney/Pixar/Marvel/Star Wars) as a discovery layer on top of rows — useful when catalog has strong franchises/brands.
- Genre/Discovery: dedicated genre browsing + filters (genre, decade, mood), plus algorithmic "For You".

## What makes them great
- The dark UI exists to spotlight artwork; nothing competes with the content.
- Front-loaded high-conviction recommendation (billboard) solves "what to watch" fast.
- Preview-on-dwell reduces commitment cost of every choice.
- Resume-first design respects the returning user.
- Player gets out of the way (auto-hide) but everything (skip, captions, next) is one tap when summoned.

## Do
- Lead home with a personalized billboard, then Continue Watching, then ranked rows.
- Keep rows dense; show a peek of the next card.
- Use scrub-preview thumbnails and Skip Intro / Next Episode.
- Make captions and audio-track changes one tap from the player.
- Personalize row choice, item choice, and ranking; label provenance ("Because you watched…").

## Don't
- Don't autoplay audio on the billboard or previews without a mute control.
- Don't reduce tiles-per-row or otherwise lower information density to look "cleaner."
- Don't flatten the detail page so Play loses prominence.
- Don't bury frequently-used player controls (captions, skip) in overflow menus.
- Don't trigger hover previews without a dwell delay (causes jumpy, noisy rows).
