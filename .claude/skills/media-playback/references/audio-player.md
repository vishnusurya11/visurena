# Persistent Global Audio Player — architecture, queue, gapless, Media Session

The audio spine of Visurena. **One** player serves **both music AND stories/audiobooks** — that consolidation is the whole win: same store, same queue, same lock-screen integration, different metadata + skip semantics. Behavior only; the mini-player/now-playing *look* is `entertainment-platform-ui` + `ui-styling`.

## Contents
1. [The core rule: one instance, above the router](#1-the-core-rule)
2. [Global store architecture (web)](#2-global-store-architecture)
3. [Queue management](#3-queue-management)
4. [Gapless & crossfade](#4-gapless--crossfade)
5. [Media Session API — lock-screen & hardware controls](#5-media-session-api)
6. [Music vs stories/audiobooks — same player, different config](#6-music-vs-stories)
7. [Mobile / Expo — react-native-track-player](#7-mobile--expo)
8. [Sources](#8-sources)

---

## 1. The core rule

**Mount exactly ONE `<audio>` (or one Web Audio graph) in a store that lives ABOVE the router.** Navigation must never touch it.

Why: if `<audio>` lives inside a route/page component, navigating away **unmounts it and playback stops/restarts**. This is the single most common audio bug in SPAs. The audio element and its state are *app-shell* concerns, not *page* concerns.

```
<App>
  <AudioProvider>        ← owns the singleton <audio> + playback state. NEVER unmounts.
    <Router>             ← pages mount/unmount freely; audio keeps playing
      <HomePage/> <AlbumPage/> <StoryPage/> ...
    </Router>
    <MiniPlayer/>        ← reads/controls the store; a VIEW, not the source of truth
    <NowPlayingSheet/>   ← expanded VIEW of the same store
  </AudioProvider>
</App>
```

**Do** keep the element and state in the provider; render any number of mini-players/now-playing views as subscribers.
**Don't** create a new `Audio()` per track or per page. One element, swap its `src`.

---

## 2. Global store architecture

Web: a single store (Zustand/Redux/Context) holding the singleton element and all playback state. Sketch (Zustand-style, framework-agnostic shape):

```js
// audioStore.js — created ONCE, imported everywhere.
const audio = new Audio();           // the single element (or a Web Audio graph for crossfade)
audio.preload = 'metadata';

export const useAudioStore = create((set, get) => ({
  current: null,        // current track metadata
  queue: [],            // upcoming tracks
  history: [],          // for previous-track
  isPlaying: false,
  position: 0,
  duration: 0,
  repeat: 'off',        // 'off' | 'one' | 'all'
  shuffle: false,

  load(track, { autoplay = true } = {}) {
    audio.src = track.url;            // swap src on the SAME element
    set({ current: track });
    setMediaSessionMetadata(track);   // §5
    if (autoplay) get().play();
  },
  play()  { audio.play();  set({ isPlaying: true });  },
  pause() { audio.pause(); set({ isPlaying: false }); },
  seek(t) { audio.currentTime = t; updatePositionState(audio); },
}));

// Wire element events to the store ONCE (module scope, not in a component):
audio.addEventListener('timeupdate', () => {
  useAudioStore.setState({ position: audio.currentTime });
  updatePositionState(audio);          // keep lock-screen scrubber in sync
});
audio.addEventListener('loadedmetadata', () =>
  useAudioStore.setState({ duration: audio.duration }));
audio.addEventListener('ended', () => useAudioStore.getState().next());
```

Persist `current` + `position` (localStorage) so "Continue Listening" resumes exactly where the user left off.

**Do** subscribe `timeupdate`/`ended` at module scope so they survive re-renders.
**Don't** attach those listeners inside a component effect — they'll churn and double-fire.

---

## 3. Queue management

Model the queue as: `history[] ← current → queue[]`. Add `next()`/`previous()` honoring repeat/shuffle.

```js
next() {
  const { current, queue, history, repeat, shuffle } = get();
  if (repeat === 'one') { get().seek(0); get().play(); return; }
  if (queue.length === 0) {
    if (repeat === 'all' && history.length) { /* rebuild from history */ }
    else { set({ isPlaying: false }); return; }
  }
  const idx = shuffle ? Math.floor(Math.random() * queue.length) : 0;
  const nextTrack = queue[idx];
  set({ history: [...history, current], queue: queue.filter((_, i) => i !== idx) });
  get().load(nextTrack);
},
previous() {
  // Convention: if >3s in, restart current; else go to history top.
  if (get().position > 3) { get().seek(0); return; }
  const { history, current, queue } = get();
  if (!history.length) { get().seek(0); return; }
  const prev = history[history.length - 1];
  set({ history: history.slice(0, -1), queue: [current, ...queue] });
  get().load(prev);
}
```

Support: "play next" (unshift), "add to queue" (push), reorder (drag), clear.

**Do** implement the "previous restarts current if >3s in" convention — users expect it.
**Don't** lose the queue on reload; persist it.

---

## 4. Gapless & crossfade

A single `<audio>` element has an audible gap between tracks (src swap + buffering). Two paths:

- **Gapless** (albums, audiobook chapters): **double-buffer** with two elements (A/B). Preload track N+1 into the idle element when N nears its end; on `ended`, swap which element is "active". Eliminates the swap gap.
- **Crossfade** (music): use **Web Audio** — route two `MediaElementAudioSourceNode`s through `GainNode`s into the destination; ramp one gain down while the other ramps up over the crossfade window.

```js
// Crossfade sketch (Web Audio):
const ctx = new AudioContext();
const gainA = ctx.createGain(), gainB = ctx.createGain();
ctx.createMediaElementSource(elA).connect(gainA).connect(ctx.destination);
ctx.createMediaElementSource(elB).connect(gainB).connect(ctx.destination);
function crossfade(fromGain, toGain, secs) {
  const now = ctx.currentTime;
  fromGain.gain.linearRampToValueAtTime(0, now + secs);
  toGain.gain.setValueAtTime(0, now);
  toGain.gain.linearRampToValueAtTime(1, now + secs);
}
```

**Do** disable crossfade for stories/audiobooks (you don't want chapters bleeding into each other) — gapless or a small pause is correct there.
**Don't** crossfade spoken-word content; it garbles the narration.

---

## 5. Media Session API

This is what makes audio feel native: metadata on the lock screen / notification / macOS Now Playing, and working media keys, headset buttons, and lock-screen scrubbers. **Ship it for every audio session.**

```js
function setMediaSessionMetadata(track) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.title,
    artist: track.artist || track.author,   // author for audiobooks/stories
    album:  track.album  || track.series,
    artwork: [
      { src: track.cover_256, sizes: '256x256', type: 'image/png' },
      { src: track.cover_512, sizes: '512x512', type: 'image/png' },
    ],
  });
}

function registerMediaSessionHandlers(store) {
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession;
  ms.setActionHandler('play',          () => store.play());
  ms.setActionHandler('pause',         () => store.pause());
  ms.setActionHandler('previoustrack', () => store.previous());
  ms.setActionHandler('nexttrack',     () => store.next());
  ms.setActionHandler('seekto',        (d) => store.seek(d.seekTime));
  // For stories/audiobooks, prefer ±15/30s skip over track skip:
  ms.setActionHandler('seekbackward',  (d) => store.seek(store.position - (d.seekOffset || 15)));
  ms.setActionHandler('seekforward',   (d) => store.seek(store.position + (d.seekOffset || 30)));
}

// Keep the lock-screen scrubber accurate — call on timeupdate/seek:
function updatePositionState(audio) {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  if (!isFinite(audio.duration)) return;
  navigator.mediaSession.setPositionState({
    duration: audio.duration,
    playbackRate: audio.playbackRate,
    position: audio.currentTime,
  });
}
```

Also reflect state: set `navigator.mediaSession.playbackState = 'playing' | 'paused'` so the OS shows the right icon.

**Do** call `setPositionState()` on every `timeupdate`/seek — without it the lock-screen scrubber freezes.
**Don't** assume support; feature-detect (`'mediaSession' in navigator`) and degrade gracefully.

---

## 6. Music vs stories

One player, two profiles. The consolidation win is that everything below is the *same* store/element/Media Session — only the config differs:

| Aspect | Music | Stories / Audiobooks |
|---|---|---|
| Skip semantics | prev/next **track** | ±15s back / ±30s forward (`seekbackward`/`seekforward`) |
| Speed control | usually 1.0 | **playbackRate** 0.5–3.0× (essential) |
| Crossfade | optional, nice | **off** (garbles narration) |
| Sleep timer | rare | **expected** (stop after N min / end of chapter) |
| Resume granularity | per track | per **position** (mid-chapter); persist aggressively |
| Media Session `album` | album | series/book title; `artist` ← author/narrator |
| Chapter nav | n/a | chapter list = the queue; gapless between chapters |

**Do** expose `playbackRate` and a sleep timer in the story profile.
**Don't** fork into two separate players — that defeats the consolidation; branch on `track.kind` instead.

---

## 7. Mobile / Expo

Web Media Session ≠ native background audio. For Expo/React Native, the equivalent of "persistent global audio + lock-screen controls + background playback" is:

- **`react-native-track-player`** — the mature choice for a queue-based background audio player with lock-screen/notification controls and remote (headset/lock-screen) events. Note: it needs a **Dev Client** (Expo Go is unsupported), a registered **playback service**, and `UIBackgroundModes: ["audio"]` on iOS + `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permissions on Android.
- **`expo-audio`** — Expo's first-party audio module; enable background with the config plugin + `shouldPlayInBackground: true`. Good for simpler playback; track-player wins for full queue + rich remote controls.
- **`expo-video`** — first-party video (the mobile analogue of the `<video>` work in `video-streaming.md`).

**Do** use react-native-track-player when you need a real background queue with lock-screen controls on mobile.
**Don't** expect Expo Go to run it — build a Dev Client.

---

## 8. Sources

- MDN — Media Session API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- MDN — MediaSession.setActionHandler(): https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler
- web.dev — Customize media notifications with the Media Session API: https://web.dev/articles/media-session
- react-native-track-player: https://github.com/doublesymmetry/react-native-track-player
- react-native-track-player with Expo guide: https://github.com/doublesymmetry/react-native-track-player/blob/main/docs/docs/guides/with-expo.md
- Expo Audio (expo-audio): https://docs.expo.dev/versions/latest/sdk/audio/
