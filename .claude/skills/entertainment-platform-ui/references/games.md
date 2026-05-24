# Games — UX Reference

Exemplars: **Steam, Epic Games Store, Xbox, itch.io, GOG Galaxy.**
Core idea: cleanly separate the two jobs — the **Store** (discover, market, convert) and the **Library** (own, install, launch). The **game detail page** is a media-forward marketing landing page that must convert a skim into a wishlist/purchase in seconds. Layer social on top (achievements, friends, reviews).

## Key screens

1. **Store home / discovery** — featured carousel, curated rows, specials, categories, recommendations.
2. **Game detail page** — the conversion page for one title.
3. **Search & browse** — by genre/tag/price/features; filters and sort.
4. **Library** — owned games, install/launch states, collections.
5. **Game library detail / play page** — launch, news, achievements, playtime, DLC, cloud saves.
6. **Wishlist** — saved-for-later with price-drop notifications.
7. **Cart / checkout** (if commerce).
8. **Friends / social** — friends list, activity feed, what friends are playing.
9. **Downloads / install manager** — queue, progress, pause/resume.

## Signature components

### Store home
- Top **featured carousel** (hand-picked or personalized hero spots) with big key art, short pitch, price/discount, CTA.
- Curated horizontal rows: Recommended For You, New & Trending, Top Sellers, Specials/Discounts, "More like games you've played", genre hubs.
- Steam's **Discovery Queue**: a guided one-at-a-time "next game" flow (capsule + quick verdict: interested / not / wishlist) — a great low-friction discovery mechanic.
- Pitfall: too many rows of equal weight = noise; rank ruthlessly and personalize.

### Game detail page (the most important screen)
Above the fold decides everything — users skim capsule → screenshots → ~3 lines of description → wishlist or bounce. Anatomy:
- **Media block (left/top)**: a **trailer that autoplays muted** + a **screenshot/video gallery** with thumbnails. Lead the trailer and first 3–4 screenshots with *core gameplay*, never title screens or concept art.
- **Buy/CTA block (right/top)**: capsule art, **price + discount**, primary CTA (**Buy / Add to Cart / Install / Play / Get**), **Add to Wishlist**, "in library" state if owned.
- **Short description + tags**: a few punchy lines; **tags/sub-genres** (Steam allows ~20) that also drive the recommendation algorithm — specific ("Roguelite Deckbuilder") beats generic ("Action").
- **Metadata**: developer/publisher, release date, platforms, languages, features (single/multiplayer, co-op, controller, cloud saves, achievements), content rating.
- **Reviews**: aggregate sentiment (Steam's "Overall/Recent: Very Positive" + % + count) and review excerpts with helpfulness voting. Reviews are a primary trust signal.
- **System requirements**: min/recommended — important but **placed lower**, not above the fold.
- **DLC, editions/bundles, related games**.
- Pitfall (Steam's known flaw): **flat visual hierarchy** — articles, languages, specs all at the same weight bury the essentials (price, gameplay, CTA). Establish clear hierarchy; lead with what converts.

### Library
- **Owned games** as a grid/list of capsules, sortable (recent, alphabetical, playtime) and filterable; **Collections/shelves** (manual or smart).
- Per-game **state machine on the tile/button**: `Install` → `Downloading X% (pause/cancel)` → `Ready/Play` → `Update available` → `Running`. State must be unmistakable.
- Recently played row + "jump back in".
- Per-game library page: big art, **Play/Install**, playtime, achievements progress, recent news/patch notes, DLC, cloud-save status, friends who play.
- Epic's redesign idea worth borrowing: **rate & review from inside the library** (stars + a few emoji reactions) that then surfaces on the store page.

### Wishlist
- One-tap add from any capsule or detail page.
- Notify on discount/release; sortable by price, discount, release date.

### Achievements
- Per-game grid: icon, name, description, unlocked/locked, rarity/% of players who have it, unlock date; global completion %.
- Locked achievements can be hidden/teased (avoid spoilers).
- Profile-level showcase of rare/recent achievements; Xbox "Gamerscore" as a cross-game meta-progression number.

### Friends / social
- Friends list with **online/in-game/offline presence** and "now playing X".
- Activity feed (friend bought/achieved/reviewed), invites/party, compare achievements, shareable profiles/showcases.
- Xbox/Steam pattern: social presence is ambient throughout (on detail pages: "3 friends own this").

### Downloads / install manager
- Queue with per-item progress, speed, ETA, size; pause/resume/reorder; disk-space indicator; auto-update settings; background download while playing.

## Navigation / IA
- **Top-level split: Store | Library | Community/Friends | News | Profile.** Keep Store and Library clearly separated — they're different mental modes (buying vs playing).
- Store sub-nav: Discover, Browse (by category/tag), Wishlist, Specials.
- Epic keeps the storefront minimal/accessible; Steam is powerful but criticized for **feature bloat and janky navigation** — bias toward Epic's clarity.

## What makes them great
- Media-forward detail pages that sell in the first few seconds.
- Wishlist + discount notifications create a low-pressure conversion funnel.
- Clear install/launch state machine in the library.
- Reviews and friend presence as constant trust/social signals.
- Achievements and meta-scores drive long-term engagement.

## Do
- Separate Store and Library as distinct surfaces.
- Lead detail pages with gameplay trailer + gameplay screenshots and one clear price/CTA.
- Use specific tags (they power discovery) and show aggregate review sentiment + count.
- Make every library tile's state (install/download/update/play) unmistakable.
- Surface friends-who-own and let users rate/review owned games.

## Don't
- Don't give every piece of detail-page info equal visual weight (Steam's mistake).
- Don't put system requirements above the fold ahead of price/gameplay.
- Don't pile up equal-weight store rows; rank and personalize.
- Don't lead trailers/screenshots with title screens or concept art.
- Don't let navigation bloat — keep the storefront accessible (Epic > Steam here).
