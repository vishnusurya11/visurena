# Music — UX Reference

Exemplars: **Spotify, Apple Music, YouTube Music, SoundCloud.**
Core idea: a **persistent player** is the spine of the app. Everything else (browse, search, library) feeds the player, and the player never disappears as you navigate. Optimize for **one-handed, bottom-reachable** control and the three user mindsets: what I'm playing **NOW**, what's **NEXT** (queue), what's for **LATER** (library/explore).

## Key screens

1. **Home** — personalized shelves: Recently played, Made-For-You mixes, Daily Mixes, Release Radar / New releases, jump-back-in, mood/activity stations.
2. **Search / Explore** — search box + browse-by-genre/mood tiles (colorful category cards).
3. **Library** — your playlists, liked songs, albums, artists, downloads; sortable/filterable.
4. **Now Playing** (full-screen player) — expanded from the mini-player.
5. **Queue** — now playing + up-next + history.
6. **Playlist page** — cover, title, owner, play/shuffle, track list.
7. **Album page** — cover, artist, tracklist, save.
8. **Artist page** — header art, follow, play, popular tracks, discography, about, related artists.
9. **Lyrics view** — time-synced lyrics.

## Signature components

### Mini-player (the persistent bar) — the single most important component
- A **slim bar docked directly above the bottom tab bar**, present on *every* screen.
- Shows: small album art, track title + artist, play/pause, and (space permitting) next + a like/heart. A thin progress line along the bar.
- **Tap anywhere on the bar → expands to full Now Playing**; swipe down to collapse. Swipe the bar horizontally to skip tracks (common pattern).
- Why it persists: users want to keep browsing while listening; the mini-player lets them control playback without losing context. (Spotify's research: users open the full player only briefly, mainly to reach the queue — so make the mini-player as capable as possible.)
- Pitfall: don't make the mini-player too thin to tap; don't remove core controls (skip, like) from it forcing a full-screen trip.

### Now Playing (full-screen player)
- Large album art (Apple Music animates it; a strong premium touch), title/artist, a prominent **scrubber with elapsed/remaining time**.
- Transport row: shuffle, previous, **play/pause (dominant)**, next, repeat.
- Secondary row: like/save, add-to-playlist, share, device/cast picker, **queue**, **lyrics** toggle, more (…).
- Bottom: "Up next" peek / device-connect bar.
- Keep frequently-used controls (queue, repeat, lyrics) **visible**, not hidden in an overflow menu — Spotify drew real backlash for moving queue/repeat into a submenu despite free space.

### Queue
- Three zones: **Now playing**, **Next in queue** (manually added, reorderable, removable), **Next up** (from the source playlist/radio).
- Drag-to-reorder, swipe-to-remove, clear-queue control.
- Pitfall: queue that silently persists across sessions/devices with no clear way to clear it confuses users — give an explicit Clear and predictable cross-device behavior.

### Playlists
- Cover (custom or auto-mosaic of track art), title, creator, description, like/save, download toggle.
- **Play** + **Shuffle** as the two primary actions at top.
- Track rows: title, artist, album, duration, explicit tag, like, …; now-playing track highlighted with an equalizer animation.
- Desktop power features: multi-select, drag-and-drop reordering, drag songs between playlists.
- Collaborative/shared playlists and "Add to this playlist" recommendations at the bottom.

### Album & Artist pages
- **Album**: large cover, artist link, year, Play/Shuffle/Save, numbered tracklist, "More by this artist".
- **Artist**: immersive header (artist photo/art), monthly listeners, Follow, Play, **Popular** (top tracks), **Discography** (albums/singles), Related artists, About, concerts/merch (where present). Verified-artist signal.

### Library
- Tabs/filters: Playlists, Artists, Albums, Liked Songs, Downloaded, Podcasts.
- Sort (recent, alphabetical, creator) and a grid/list toggle.
- "Liked Songs" as a special auto-playlist; downloads clearly marked for offline.
- Pitfall (Apple Music complaint): don't bury favorites among everything else — make saved/liked content easy to find and organize.

### Search
- Persistent search field; recent searches + trending.
- Browse tiles by genre/mood/activity (colorful cards) as zero-query discovery.
- Results grouped by type: Top result, Songs, Artists, Albums, Playlists, Podcasts; tappable to play immediately.

### Lyrics
- **Time-synced, line-by-line highlight** that scrolls with playback (Apple Music's is best-in-class).
- Tap a line to jump to that timecode; share-a-lyric snippet.
- Bonus: a karaoke/"Sing" mode that lowers vocal volume.

### Recommendations / personalization (Spotify's moat)
- **Made-For-You**: Discover Weekly, Release Radar, Daily Mixes, "On Repeat", "Blend" (shared taste). Strong, fast-learning taste graph.
- Radio/autoplay: when the queue ends, continue with similar tracks.
- "Because you listened to…" provenance on shelves.

## Navigation / IA
- **Mobile bottom tabs**: Home, Search, Library (+ Create/Premium on some). 3–5 max, mini-player riding above them.
- **Desktop/web**: left sidebar (Home/Search + library tree), main content, **persistent bottom now-playing bar** spanning full width, optional right panel (queue / now-playing context / friend activity).
- Consistency across phone/desktop/web is a competitive advantage (Spotify is praised for this).

## What makes them great
- The persistent player removes the "lose my music to browse" tax.
- One-handed, bottom-anchored controls within thumb reach.
- World-class personalization that learns fast and shows its reasoning.
- Apple Music's aesthetic polish (animated art, full-screen player, synced lyrics) shows how premium feel differentiates a commoditized catalog.

## Do
- Make the mini-player persistent and capable (skip + like without expanding).
- Keep queue, repeat, shuffle, lyrics visible in the full player.
- Offer Play and Shuffle as twin primary actions on every collection.
- Build time-synced lyrics and Made-For-You mixes with provenance.
- Keep navigation identical across web/desktop/mobile.

## Don't
- Don't hide frequently-used controls (queue/repeat/lyrics) in overflow menus when there's space.
- Don't let the queue persist confusingly across devices with no Clear.
- Don't make the mini-player un-tappably thin or strip its controls.
- Don't make saved/liked music hard to find or organize.
