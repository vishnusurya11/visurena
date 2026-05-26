---
name: media-playback
description: Build production video and audio players for streaming apps — HLS/DASH adaptive streaming (hls.js, Shaka Player, native HLS), captions/subtitles (WebVTT, CEA-608/708), DRM/EME (Widevine/PlayReady/FairPlay), buffering & ABR tuning, a persistent global audio player with queue/gapless/Media Session lock-screen controls, and accessible keyboard-driven player controls. Use whenever building ANY playback surface — a movie/video player, a music player, a story/audiobook player, a docked mini-player, a now-playing/full-screen player, a trailer autoplay, scrub-preview seeking, captions toggles, or custom player UI/controls. Also use for "playback keeps restarting on navigation", "audio should keep playing across routes", "lock-screen / media-key controls", "DRM-protected video", "adaptive bitrate / buffering / stalls", or "make the player keyboard/screen-reader accessible". This skill owns playback BEHAVIOR (streaming, recovery, queue, a11y); player chrome appearance/skinning defers to ui-styling / frontend-design / motion-framer.
---

# Media Playback

This skill builds the **playback engine** behind Visurena — the streaming entertainment hub for **movies, music, and stories/audiobooks**. It owns *behavior*: adaptive streaming, error recovery, the persistent audio store, the queue, captions, DRM wiring, and accessible controls. It does **not** own *looks*: the visual chrome, colors, and motion of the player are delegated (see Cross-references).

Three north stars, baked into every decision below:
- **Respect `prefers-reduced-motion`** — never autoplay trailers/video-with-motion for users who opted out; show a static poster + explicit play.
- **Captions on by availability** — if a caption track exists and the user hasn't explicitly turned them off, default them on; remember the choice.
- **Never ship a div-soup player.** Custom controls must be real buttons, keyboard-operable, ARIA-labelled, with managed focus. An inaccessible player is a broken player.

## Step 1 — Pick the playback tech (decision)

```
Audio (music / stories / audiobooks)?
  → Persistent global audio player: ONE <audio> (or Web Audio) in a store ABOVE the router.
    Web → references/audio-player.md   Expo/mobile → react-native-track-player.

Video?
  ├─ Is it Safari / iOS (and no DASH-only, no non-FairPlay DRM)?
  │     → Native HLS: just <video src="…m3u8">. No JS lib needed. Cheapest, best battery.
  ├─ HLS on Chrome / Firefox / Edge (MSE) ?
  │     → hls.js. The default for HLS on non-Safari.
  ├─ DASH, OR multi-DRM (Widevine + PlayReady + FairPlay), OR one codepath across all browsers?
  │     → Shaka Player. DASH+HLS, key-system-agnostic EME, mature DRM.
  └─ Protected content (any DRM)?
        → DRM = EME + CENC. The license server is a SERVICE (Mux / Cloudflare Stream / AWS).
          Document the client integration; DO NOT hand-roll license exchange.
```

Why: Safari plays HLS natively via `<video src>` (lowest overhead, hardware-accelerated, free lock-screen integration). Chrome/Firefox/Edge can't play HLS natively, so they need Media Source Extensions — `hls.js` feeds segments into MSE for HLS; Shaka does HLS **and** DASH and is the right call when you need DASH or unified multi-DRM. Don't reach for a library when native works.

## Step 2 — Route to the reference you need

Read the matching file **before** writing code. Each is build-ready and self-contained.

| If the task involves… | Read |
|---|---|
| HLS vs DASH; native HLS vs hls.js vs Shaka; ABR/buffer tuning; error/failover recovery; fast-seek/scrub | `references/video-streaming.md` |
| DRM (Widevine/PlayReady/FairPlay), EME, CENC, license-server integration via Mux/Cloudflare/Shaka | `references/video-streaming.md` (DRM section) |
| Persistent global audio player that survives navigation; queue; gapless/crossfade; Media Session lock-screen/media-key controls | `references/audio-player.md` |
| Music AND story/audiobook playback (the consolidation win — one player, both) | `references/audio-player.md` |
| Mobile/Expo audio (background playback) | `references/audio-player.md` (react-native-track-player) |
| WebVTT / CEA-608/708 captions; multi-language audio; audio description; keyboard controls; ARIA; focus mgmt; reduced-motion autoplay; RTL | `references/captions-a11y-i18n.md` |

## Non-negotiables (do / don't)

- **Do** keep a single audio instance in a store mounted above the router. **Don't** mount `<audio>` inside a route component — navigation unmounts it and playback restarts. (This is the #1 audio bug; see `audio-player.md`.)
- **Do** handle fatal hls.js errors with recovery: `NETWORK_ERROR → hls.startLoad()`, `MEDIA_ERROR → hls.recoverMediaError()` (and `swapAudioCodec()` before a second recovery). **Don't** let a single transient stall kill the session.
- **Do** let ABR pick the bitrate, but set a sensible `startLevel` and tune `maxBufferLength` for your content. **Don't** force max quality on first frame — it spikes startup time and abandonment.
- **Do** treat DRM license handling as a managed service and wire the client to it. **Don't** write naive EME/license boilerplate; key handling is security-sensitive and provider-specific.
- **Do** wire the Media Session API (metadata + `play`/`pause`/`previoustrack`/`nexttrack`/`seekto`/`seekbackward`/`seekforward`) and call `setPositionState()` so lock-screen scrubbers track. **Don't** ship audio with no lock-screen/media-key support — it feels broken on phones.
- **Do** build controls as `<button>`s with `aria-label`, `aria-pressed`, roving focus, and full keyboard support (Space/K play-pause, ←/→ seek, ↑/↓ volume, F fullscreen, M mute, C captions). **Don't** use clickable `<div>`s.
- **Do** check `matchMedia('(prefers-reduced-motion: reduce)')` before any autoplay-with-motion (trailers, hero previews). **Don't** autoplay motion for those users.
- **Do** default captions on when a track is available and not explicitly disabled; persist the user's choice. **Don't** hide captions behind a deep menu only.

## Cross-references (appearance & UX — NOT this skill)

This skill is behavior. For how the player **looks and feels**:
- Player chrome styling, surfaces, charcoal-dark premium theme → `ui-styling`, `frontend-design`
- Control micro-interactions (hover/scrub/expand animations) → `motion-framer`
- Theme tokens (colors, spacing, radii for the player) → `design-system`, `tailwind-theme-builder`
- UX patterns for player / mini-player / now-playing / content rows → `entertainment-platform-ui`
- Award-level polish bar → `../modern-web-design/references/award-winning-playbook.md`

Visurena north star: charcoal premium dark, slightly animated, dynamic + optimized AI entertainment hub. The player is near-black (reserve true dark for the immersive surface), quiet chrome, content-forward — but that's the styling skills' job; here, make it *work*.

## Sources

See the **Sources** list at the bottom of each reference file for the canonical, current (2026) docs.
