# Captions, Accessibility & Internationalization for players

Make Visurena's players usable by everyone. **Never ship a div-soup, mouse-only player.** Captions, keyboard operation, focus management, and reduced-motion are requirements, not extras. Behavior only; visual styling of focus rings/caption boxes is `ui-styling`.

## Contents
1. [Captions & subtitles: WebVTT + CEA-608/708](#1-captions--subtitles)
2. [Multi-language audio & audio description](#2-multi-language-audio--audio-description)
3. [Fully keyboard-operable controls](#3-keyboard-operable-controls)
4. [ARIA for custom controls](#4-aria-for-custom-controls)
5. [Focus management](#5-focus-management)
6. [prefers-reduced-motion on autoplay/trailers](#6-prefers-reduced-motion)
7. [RTL](#7-rtl)
8. [Sources](#8-sources)

---

## 1. Captions & subtitles

Two delivery mechanisms, both common:

- **WebVTT** (`<track kind="captions" src="…vtt">`): sidecar text files, the web-native path. Styleable, easy to add/remove languages. Use for VOD where you control packaging.
- **CEA-608 / CEA-708**: captions **embedded in the video stream** (broadcast/HLS-origin content). 608 is legacy (≤4 fields, simple styling); 708 is modern (Unicode, positioning, richer styling). hls.js and Shaka surface these as text tracks automatically — you render them or let the native UI do it.

```html
<video controls>
  <source src="movie.m3u8" type="application/vnd.apple.mpegurl">
  <track kind="captions"  srclang="en" label="English"  src="en.vtt" default>
  <track kind="subtitles" srclang="es" label="Español"  src="es.vtt">
  <track kind="captions"  srclang="en" label="English (SDH)" src="en-sdh.vtt">
</video>
```

**captions vs subtitles**: captions include non-speech audio (`[door slams]`, speaker IDs) for deaf/HoH users; subtitles assume you can hear and just translate dialogue. Offer both where you have them; SDH (Subtitles for Deaf/Hard-of-hearing) is the captions-equivalent for translated content.

### Default behavior (Visurena north star: captions on by availability)
```js
// On a custom player, drive tracks via textTracks (NOT the `default` attr alone, which
// the native UI may ignore in custom skins). Respect a remembered user choice.
const pref = localStorage.getItem('captionsLang'); // null = no explicit choice
[...video.textTracks].forEach(t => {
  const isCaptionLike = t.kind === 'captions' || t.kind === 'subtitles';
  if (!isCaptionLike) return;
  if (pref === 'off') t.mode = 'disabled';
  else if (pref ? t.language === pref : t.language === navigator.language.slice(0,2))
    t.mode = 'showing';   // default ON for matching language when no explicit off
  else t.mode = 'disabled';
});
```

**Do** default captions on when a track exists and the user hasn't explicitly disabled them; persist their choice.
**Don't** bury captions in a deep menu with no on-surface toggle, and don't burn captions into the video (no language switching, no user styling, fails a11y).

---

## 2. Multi-language audio & audio description

- **Multiple audio tracks**: expose a language picker. In HLS/DASH the renditions carry language metadata; with hls.js use `hls.audioTracks` / `hls.audioTrack = i`, with Shaka `player.getAudioLanguages()` / `player.selectAudioLanguage(lang)`.
- **Audio description (AD)**: a separate audio track (or describable text track, `kind="descriptions"`) narrating on-screen action for blind/low-vision users. Treat AD as a selectable audio variant; label it clearly ("English — Audio Description").

**Do** label tracks with human names ("Español (Latinoamérica)") and persist the selection.
**Don't** assume one audio track; entertainment content routinely ships several.

---

## 3. Keyboard-operable controls

Every control must be reachable and operable from the keyboard. Standard player keymap (match user expectations from YouTube/Netflix):

| Key | Action |
|---|---|
| Space / K | play / pause |
| ← / → | seek −5s / +5s |
| J / L | seek −10s / +10s |
| ↑ / ↓ | volume up / down |
| M | mute toggle |
| F | fullscreen toggle |
| C | captions toggle |
| 0–9 | jump to 0–90% |
| , / . | frame step (when paused) |

```js
player.addEventListener('keydown', (e) => {
  if (e.target.matches('input, [contenteditable]')) return; // don't hijack typing
  switch (e.key) {
    case ' ': case 'k': e.preventDefault(); togglePlay(); break;
    case 'ArrowLeft':  seekBy(-5);  break;
    case 'ArrowRight': seekBy(+5);  break;
    case 'ArrowUp':    e.preventDefault(); volumeBy(+0.05); break;
    case 'ArrowDown':  e.preventDefault(); volumeBy(-0.05); break;
    case 'm': toggleMute();        break;
    case 'f': toggleFullscreen();  break;
    case 'c': toggleCaptions();    break;
  }
});
```

The **scrubber** must be a real slider: `role="slider"` with `aria-valuemin/max/now/valuetext`, responding to ←/→ (and Home/End). Prefer `<input type="range">` (free keyboard + a11y) styled to taste.

**Do** `preventDefault()` on Space/arrows so the page doesn't scroll, but skip it when focus is in a text field.
**Don't** trap focus inside the player so users can't tab away.

---

## 4. ARIA for custom controls

If you replace native `controls`, you inherit native's accessibility — and most custom players lose it. Build with real semantics:

```html
<button aria-label="Play" aria-pressed="false" data-action="play">▶</button>
<button aria-label="Mute" aria-pressed="false" data-action="mute">🔊</button>
<button aria-label="Captions" aria-pressed="true"  data-action="cc">CC</button>

<div role="slider" tabindex="0"
     aria-label="Seek"
     aria-valuemin="0" aria-valuemax="5400"
     aria-valuenow="932" aria-valuetext="15 minutes 32 seconds of 1 hour 30 minutes">
</div>

<!-- Announce transient state changes (buffering, error) politely: -->
<div aria-live="polite" class="sr-only" id="player-status"></div>
```

Rules:
- Use `<button>`, not `<div onclick>`. Toggles use `aria-pressed`; menus use `aria-expanded` + `aria-controls`.
- Icon-only buttons MUST have `aria-label` (and update it: "Play" ↔ "Pause").
- Push buffering/error/now-playing changes to an `aria-live="polite"` region so screen-reader users hear them.
- The `<video>`/`<audio>` element should have an accessible name (e.g. `aria-label="Movie title"`).

**Do** keep `aria-pressed`/`aria-expanded`/`aria-label` in sync with actual state on every toggle.
**Don't** rely on color alone (e.g. captions "on" = blue icon) — also flip `aria-pressed` and a visible affordance.

---

## 5. Focus management

- **Visible focus**: never `outline: none` without a replacement; controls need a clear focus ring (styling lives in `ui-styling`, but the *requirement* lives here).
- **Auto-hiding chrome**: video controls that hide on idle must **re-show on any keyboard focus/interaction** and not strand a focused control invisibly. When chrome hides, blur or keep the focused control visible.
- **Fullscreen / now-playing sheet**: when an expanded player opens, move focus into it; on close, **return focus to the trigger**. If it's modal, trap focus while open (Esc closes) — but the *inline* player must NOT trap focus.
- **Roving tabindex** for a control bar is fine, but ensure Tab still escapes the player.

**Do** restore focus to the opener when closing the now-playing/fullscreen view.
**Don't** let auto-hide remove the currently-focused control from view.

---

## 6. prefers-reduced-motion

Visurena north star: **respect `prefers-reduced-motion` for autoplay/trailers.** Hero auto-playing trailers and motion previews can trigger vestibular discomfort.

```js
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  // Show a static poster + an explicit Play button. Do NOT autoplay motion.
  showPosterWithPlayButton();
} else {
  trailer.play(); // autoplay allowed
}
// Also react if the user changes the setting live:
matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', applyMotionPreference);
```

Pair with sensible autoplay hygiene anyway: autoplay **muted** (browsers block unmuted autoplay), and give an obvious unmute. For audio, never autoplay sound without a user gesture.

**Do** swap autoplaying trailers/previews for a static poster + explicit play when reduced-motion is on.
**Don't** autoplay unmuted, and don't ignore live changes to the media query.

---

## 7. RTL

For Arabic/Hebrew/etc. locales (`dir="rtl"`):
- **Mirror the layout, not the media.** Control order, the progress direction, prev/next, and the seek bar flow right-to-left; the video frame itself is never mirrored.
- Use logical CSS (`margin-inline-start`, `inset-inline-end`, `flex` with logical order) so the control bar flips automatically under `dir="rtl"`.
- In RTL, **←/→ seek keys keep their physical meaning** (← = back in time) — don't swap them; only the visual bar direction flips.
- Caption text inherits the track's language direction; ensure your caption container respects `unicode-bidi`/`direction` so mixed-direction subtitles render correctly.

**Do** drive layout with logical properties so `dir="rtl"` mirrors the chrome for free.
**Don't** mirror the video itself or invert the seek-key semantics.

---

## 8. Sources

- W3C — Media Accessibility User Requirements: https://www.w3.org/TR/media-accessibility-reqs/
- MDN — WebVTT API: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
- MDN — Web video text tracks format (WebVTT): https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format
- MDN — Media Session API (action handlers for media keys): https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- Mux — Best practices for video playback (captions/a11y, 2025): https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025
