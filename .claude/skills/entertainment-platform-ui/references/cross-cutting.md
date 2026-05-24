# Cross-Cutting "Super-App" Concerns — UX Reference

How to bind 5 verticals (Movies, Music, Games, Stories, Tournaments) into one coherent, premium, AI-discovery-driven hub without it feeling like five apps stapled together. The hard problems: a navigation model that holds 5 verticals, a unified home and search, cross-vertical recommendations, one account/profile, and onboarding that bootstraps taste fast.

## 1. Navigation model for 5 verticals

The constraint: **bottom tab bars and top/side nav both want 3–5 items** (Apple HIG + Material both cap primary nav at ~5). You have 5 verticals *plus* Home, Search, Library, and Profile — that's too many for one bar. Resolve it like a super-app:

- **Recommended mobile model:** a **5-item bottom tab bar** of *cross-vertical jobs*, not verticals:
  `Home (unified discovery) · Search · Library/My Stuff · [vertical switcher] · Profile`
  …where the verticals are reached from Home (vertical-entry tiles/shelves), a top vertical switcher (segmented control or chips: All / Movies / Music / Games / Stories / Tournaments), and contextual deep-links. Each vertical, once entered, can show its own sub-nav.
- **Alternative:** make the 5 verticals the tabs and fold Search/Library/Profile into Home + a top bar — viable, but then cross-vertical discovery weakens. Prefer job-based tabs for a true "one-stop" feel.
- **Avoid the hamburger for primary verticals** — NN/g: hamburger menus make options *least discoverable* ("out of sight, out of mind"); fine for secondary/account items only.
- **Don't overload the tab bar** with carousels of extra tabs (poor discoverability). Keep it 3–5, persistent, labeled, thumb-reachable.
- **Web/TV:** top nav or left sidebar can hold more — show the verticals there plus Home/Search/Library/Profile. Users prefer familiar left/standard nav (Netflix's 2025 move off the sidebar drew backlash) — change it cautiously.
- **Persistent players ride above the nav:** the music **mini-player** docks above the tab bar on every screen; video/reading open as full-screen flows layered above nav and return you where you were. Design the nav so these shells coexist.
- **Brand/vertical hubs** (Disney+/Apple-TV pattern): each vertical can have a "hub" landing with its own hero + rows; entering a vertical feels like a destination, not a filter.

## 2. Unified home / discovery

The flagship surface and the home of AI discovery. It must blend all five verticals coherently:

- **Top: a personalized cross-vertical hero/billboard** — the single highest-conviction thing for this user *right now*, regardless of vertical (a movie, a new album, a game on sale, the next chapter, a live tournament). One primary CTA per its type (Play / Listen / Install / Read / Watch live).
- **Then a "Continue" rail that spans verticals**: Continue Watching + Continue Listening + Continue Reading + Resume Game + Your live/upcoming matches — resume is the returning-user's first need across *all* verticals.
- **Then ranked shelves**, each tagged by vertical with a clear icon/label and "see all" → that vertical's hub. Mix vertical-specific shelves ("New Releases — Movies") with cross-vertical themes ("Sci-Fi across everything", "Tonight's vibe").
- **AI provenance:** label rows "Because you watched/listened/read/played X" so recs feel earned. Cross-domain transfer is real and valuable — use music taste to seed story/movie recs, game taste to seed tournaments, etc. (cross-domain recommendation is a proven cold-start remedy).
- **Layered personalization** (Netflix model applied app-wide): personalize *which shelves appear*, *which items fill them*, and *their ranking* — per user.
- **Vertical-entry tiles** so users who came for one thing can pivot fast.
- Pitfall: don't make home a flat dump of equal-weight rows; rank ruthlessly and keep each card artwork-forward.

## 3. Global search (one box, all verticals)

- **One persistent search** that returns **mixed results grouped by vertical**: a "Top result" + sections (Movies, Music, Games, Stories, Tournaments, People/Teams/Artists).
- Zero-query state: recent searches, trending across verticals, and **browse-by category/mood tiles** (the colorful-tile pattern from music/streaming) that cut across verticals (genre, mood, "live now").
- Predictive/typeahead with thumbnails; filters (vertical, type, free/premium, live).
- Each result row offers the right inline action for its type (Play, Add, Install, Read, Register) so users act without leaving search.
- **AI/semantic search**: support natural-language intent ("relaxing sci-fi", "games like X for two players", "a tournament tonight") — this is the differentiator for an AI-discovery hub. Make it forgiving and conversational.

## 4. Cross-vertical recommendations

- Build **one unified taste graph** per user spanning all five verticals; let signals transfer across domains (the cross-domain/cold-start technique).
- Recommend *across* verticals on detail pages: from a movie → its soundtrack (music), the game adaptation, the novel it's based on, a related tournament/community.
- "Because you…" provenance everywhere; let users tune/hide signals (transparency + control beats opaque or creepy).
- Use cross-vertical bundles/collections ("The Cyberpunk Collection: film + album + game + story") as a signature super-app moment.

## 5. Profile / account

- **One account, optional sub-profiles** (Netflix "who's watching" pattern) — each sub-profile = isolated taste graph + Continue states + maturity level + Kids mode. Fast avatar switch without full re-auth.
- Unified **Library / My Stuff**: watchlist + saved music + game library + bookshelf + registered tournaments, filterable by vertical.
- Profile shows cross-vertical identity: achievements/streaks/badges (games + reading + tournaments), stats, followed artists/authors/teams/creators, activity.
- Settings: playback/reading prefs, subtitle/typography defaults, downloads, notifications per vertical, parental controls, privacy, subscription/billing.
- Auth: social + email (project uses AWS Cognito — Google/Apple/Facebook/email); credentials stored by the provider.

## 6. Onboarding

- **Bootstrap taste fast** (solve cold-start): a short, skippable preference picker. Ask which verticals they care about, then a quick **pick-your-favorites** step (tap several movies/artists/games/genres/teams) — Apple Music's "tell us your taste" pattern, applied across verticals.
- **Personalize the very first home** from those picks; show value within seconds (don't open to an empty/generic shell).
- Keep it **progressive**: a few high-value questions up front; learn the rest from behavior. Let users skip and refine later.
- Onboard the navigation: a light coachmark for the vertical switcher and persistent player. Honor `prefers-reduced-motion`.
- Pitfall: don't gate the whole product behind a long quiz; don't ask for paywall/payment before showing value.

## 7. Coherence kit (make 5 verticals feel like one product)

- **One design system**: shared dark charcoal surfaces (layered greys, near-black reserved for player/reader), one jewel accent for primary actions + "live"/progress, consistent type scale, spacing, radii, motion (150–300ms, staggered load reveals, subtle hover glow), and a drifting nebula-gas backdrop as the connective atmosphere.
- **One card grammar** across verticals: artwork + title + progress affordance + quick-add + hover/long-press preview — only the metadata and CTA verb change per vertical (Play / Listen / Install / Read / Register).
- **Consistent gestures**: tap-to-toggle chrome (player/reader), swipe rows, long-press preview, pull-to-refresh.
- **Vertical identity via accent/iconography**, not divergent layouts — a viewer should always feel "in Visurena," just in a different room.
- **Accessibility + performance baked in**: captions/typography/contrast, focus & D-pad nav, skeletons, progressive/blur-up media, time-to-first-frame discipline.

## Cross-cutting Do / Don't

**Do**
- Use job-based tabs (Home/Search/Library/Profile + vertical switcher), keep nav to 3–5, persistent, labeled.
- Make Home a personalized cross-vertical hero + a cross-vertical Continue rail + ranked, provenance-tagged shelves.
- Ship one global semantic search that returns and acts on all verticals.
- Maintain one unified taste graph; recommend and bundle across verticals.
- Onboard with a fast, skippable, cross-vertical taste picker and personalize the first session.
- Keep one design system, one card grammar, persistent players above nav.

**Don't**
- Don't bury verticals in a hamburger or overflow; don't exceed ~5 primary nav items.
- Don't make Home/search a flat, equal-weight dump; rank and personalize.
- Don't let verticals diverge into five inconsistent mini-apps.
- Don't gate value behind a long onboarding quiz or an early paywall.
- Don't make recommendations opaque — show "Because you…" and allow control.

---

## Sources

Movies / video streaming
- https://cxl.com/blog/netflix-design/
- https://createbytes.com/insights/netflix-design-analysis-ui-ux-review
- https://raw.studio/blog/netflix-immersive-ux-design/
- https://www.netsolutions.com/insights/video-streaming-apps-ux-design/
- https://www.forasoft.com/blog/article/streaming-app-ux-best-practices
- https://medium.com/design-bootcamp/6-ux-guidelines-for-streaming-platforms-d315396a3178
- https://think.design/blog/how-to-design-a-media-player/
- https://www.sitepoint.com/how-to-design-your-video-player-with-ux-in-mind/
- https://blog.mercury.io/designing-great-streaming-tv-apps-pt-2-top-or-left-navigation/
- https://www.macrumors.com/2025/08/13/netflix-rolls-out-redesigned-interface-apple-tv/
- https://www.techradar.com/streaming/the-new-ui-is-borderline-unusable-netflix-subscribers-are-still-complaining-about-the-app-re-design-and-im-100-percent-with-them
- https://www.whathifi.com/streaming-entertainment/tv-streaming-services/apple-tv-is-my-favourite-streaming-app-thanks-to-one-key-advantage-over-netflix-disney-and-prime-video

Music
- https://medium.com/@jenmatos/spotify-mini-player-design-exploration-b2d690fe3b77
- https://medium.com/design-bootcamp/spotify-ux-case-study-d5fdd6af853e
- https://spotify.design/article/small-but-mighty-weve-rolled-out-changes-to-the-now-playing-bar
- https://community.spotify.com/t5/Implemented-Ideas/Mobile-Return-repeat-and-queue-buttons-to-Now-Playing-screen/idi-p/4670123
- https://community.spotify.com/t5/Content-Questions/New-Queue-UI-Customer-Feedback/td-p/6647974
- https://medium.com/design-bootcamp/a-sonic-deep-dive-spotify-vs-apple-music-vs-youtube-music-41dea45d2106
- https://techpoint.africa/guide/apple-music-vs-spotify-vs-youtube-music-i-tested-them-all/
- https://www.androidauthority.com/spotify-vs-youtube-music-vs-apple-music-3232702/
- https://rausr.com/blog/the-evolution-of-spotify-design/

Games
- https://indiegamejoe.com/steam-store-page-optimization-above-the-fold-best-practices/
- https://presskit.gg/field-guides/steam-page-optimization-guide
- https://www.codecks.io/blog/2023/how-to-design-your-steam-store-page/
- https://www.firmanosman.com/steam-redesign
- https://medium.com/tkt-agency/how-to-satisfy-gamers-on-steam-with-ux-and-ui-design-e7a822d59f8f
- https://medium.com/design-bootcamp/epic-games-ui-ux-case-study-new-app-and-community-focused-features-1748102b435c
- https://philharrisdesign.com/portfolio/epic-games-store/
- https://outof.games/news/8496-steam-visually-overhauls-its-store-pages-wider-pages-better-descriptions-improved-search-ui/

Stories / reading
- https://support.wattpad.com/hc/en-us/articles/201339934-Reading-preferences
- https://support.wattpad.com/hc/en-us/articles/15993272811412-Reading-in-Dark-Mode
- https://medium.com/@theshyreveal/the-ux-of-webtoons-reading-comics-in-the-digital-age-aefbd95620e5
- https://arinaindarti.medium.com/ux-case-study-line-webtoon-browse-comics-efficiently-ee5024a23af4
- https://www.amazon.com/gp/help/customer/display.html?nodeId=T5Y94BzSCGwm0vd75W
- https://www.howtogeek.com/these-kindle-layout-settings-are-the-closest-thing-to-reading-a-real-book/
- https://blog.the-ebook-reader.com/2024/08/09/last-kindle-update-changed-reading-progress-indicator-and-some-hate-it/
- https://speechify.com/blog/what-is-whispersync/

Tournaments / esports
- https://github.com/g-loot/react-tournament-brackets
- https://www.bracketsninja.com/types
- https://rise.global/esports-tournament-bracket/
- https://www.commoninja.com/widgets/brackets
- https://gitnux.org/best/tournament-management-software/
- https://kb.score7.io/blog/guides/manage-tournament-from-your-phone/
- https://www.nadcab.com/blog/tournament-software-what-it-is-and-key-features
- https://apps.apple.com/us/app/liquipedia-esports-tracker/id1640722331
- https://liquipedia.net/

Cross-cutting (navigation, search, recommendations, onboarding)
- https://www.nngroup.com/articles/mobile-navigation-patterns/
- https://m1.material.io/patterns/navigation.html
- https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/
- https://www.designstudiouiux.com/blog/mobile-navigation-ux/
- https://www.ramotion.com/blog/mobile-app-navigation-patterns/
- https://www.chameleon.io/blog/personalized-onboarding
- https://airbyte.com/blog/recommendations-for-the-ai-cold-start-problem
- https://arxiv.org/pdf/2110.11154
- https://arxiv.org/pdf/2007.13287
