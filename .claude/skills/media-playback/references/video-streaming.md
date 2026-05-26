# Video Streaming — HLS/DASH, ABR, recovery, fast-seek, DRM

Build-ready guidance for Visurena's video surfaces (movies, trailers, episodes). Behavior only — chrome/skin is `ui-styling`/`frontend-design`.

## Contents
1. [HLS vs DASH — what to deliver](#1-hls-vs-dash)
2. [Player selection: native HLS vs hls.js vs Shaka](#2-player-selection)
3. [Native HLS (Safari/iOS)](#3-native-hls)
4. [hls.js — setup, ABR/buffer tuning, error recovery](#4-hlsjs)
5. [Shaka Player — DASH + HLS, one codepath](#5-shaka-player)
6. [Fast-seek & scrub-preview](#6-fast-seek--scrub-preview)
7. [DRM (Widevine / PlayReady / FairPlay) — the right way](#7-drm)
8. [Sources](#8-sources)

---

## 1. HLS vs DASH

Both are **adaptive bitrate (ABR)** protocols: the source is encoded at several bitrates ("renditions"), chopped into short segments, and a manifest lists them. The player measures bandwidth and switches renditions on the fly.

- **HLS** (`.m3u8` + fMP4/TS): Apple's protocol. **Plays natively in Safari/iOS**. The pragmatic default for the web today — `.m3u8` with CMAF/fMP4 segments works everywhere via native (Safari) or hls.js (others).
- **DASH** (`.mpd`): the ISO standard. Broad on Android/smart-TV; **no native browser support** anywhere — always needs MSE (Shaka/dash.js).
- **Don't** pick one religiously. Common production setup: ship **HLS** broadly; add DASH only if your packaging/DRM mix or device matrix demands it.
- **Do** use **CMAF/fMP4** segments so a single set of media files serves both HLS and DASH manifests (less storage, less encoding).

**Do**: serve HLS, let Safari play it natively, hls.js elsewhere.
**Don't**: serve progressive MP4 for long-form video — no ABR means buffering and wasted bandwidth.

---

## 2. Player selection

```
Safari / iOS, plain HLS, no DASH-only / no non-FairPlay DRM   → native <video src> (no lib)
HLS on Chrome / Firefox / Edge (MSE)                          → hls.js
DASH, OR multi-DRM, OR one codepath across ALL browsers       → Shaka Player
```

Why: native HLS is the cheapest and most battery-efficient path and gives lock-screen integration for free; only reach for a library when the browser can't do it. hls.js is the standard MSE-based HLS engine for non-Safari. Shaka handles **both** HLS and DASH, is key-system-agnostic for EME, and is the mature choice for multi-DRM or a single unified codepath.

---

## 3. Native HLS

```html
<!-- Safari / iOS: zero JS. Captions auto-surface in the native UI when present. -->
<video src="https://stream.example.com/movie/master.m3u8" controls playsinline></video>
```

Detect support before deciding:

```js
const video = document.querySelector('video');
const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl') !== '';
// true on Safari/iOS → use src directly; false → load hls.js / Shaka
```

**Do** prefer native when `canPlayType` is truthy.
**Don't** load hls.js on Safari — it works, but you lose native efficiency and lock-screen niceties for no benefit.

---

## 4. hls.js

Default HLS engine for Chrome/Firefox/Edge. Always feature-check, with native fallback.

```js
import Hls from 'hls.js';

const src = 'https://stream.example.com/movie/master.m3u8';

if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = src;                          // Safari native
} else if (Hls.isSupported()) {
  const hls = new Hls({
    // --- ABR / buffer tuning (see notes below) ---
    startLevel: -1,            // -1 = let ABR pick; or pin a low index for fast startup
    maxBufferLength: 30,       // seconds ahead to buffer (default 30). Lower = less data, more risk of stall
    maxMaxBufferLength: 600,   // hard ceiling
    abrEwmaDefaultEstimate: 1_000_000, // 1 Mbps cold-start bandwidth guess
    // Live tuning (ignore for VOD):
    liveSyncDuration: 3,
  });
  hls.loadSource(src);
  hls.attachMedia(video);
  attachErrorRecovery(hls);  // see below — REQUIRED
}
```

### ABR & buffer — why these knobs
- ABR adapts the rendition to measured bandwidth. Let it drive (`startLevel: -1`) **but** consider pinning a **low** `startLevel` (e.g. index 0–1) for fast time-to-first-frame, then let ABR climb. Forcing the top rendition on frame 1 spikes startup latency and abandonment.
- `maxBufferLength` trades data usage for stall resistance. 30s is a good VOD default; raise for flaky networks, lower to save mobile data.
- `abrEwmaDefaultEstimate` seeds the bandwidth model before real data arrives — set it to a realistic value for your audience so the first rendition choice isn't wildly wrong.

### Error recovery — REQUIRED, not optional
A single transient network blip or decode glitch will otherwise end the session. Handle **fatal** errors by type:

```js
function attachErrorRecovery(hls) {
  let mediaErrorRecoveries = 0;
  hls.on(Hls.Events.ERROR, (_evt, data) => {
    if (!data.fatal) return; // non-fatal: hls.js self-heals; just log
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        // segment/manifest load failed → restart loading
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        if (mediaErrorRecoveries === 0) {
          hls.recoverMediaError();          // first attempt
        } else {
          hls.swapAudioCodec();             // then swap codec
          hls.recoverMediaError();          // and retry
        }
        mediaErrorRecoveries++;
        break;
      default:
        // unrecoverable → destroy + surface a retry UI
        hls.destroy();
        showRetryUI();
    }
  });
  // reset recovery counter once playback is healthy again
  hls.on(Hls.Events.FRAG_BUFFERED, () => { mediaErrorRecoveries = 0; });
}
```

For persistent network flakiness, also tune the load policies: `manifestLoadPolicy`, `playlistLoadPolicy`, `fragLoadPolicy` (retry counts/timeouts/backoff).

**Do** throttle media-error recovery (don't loop `recoverMediaError()` instantly forever) and reset the counter on `FRAG_BUFFERED`.
**Don't** treat every `ERROR` as fatal — most are non-fatal and self-heal.

### Cleanup
Call `hls.destroy()` on unmount to free the MSE source buffers and stop the network. (For the persistent *audio* player the rule is the opposite — see `audio-player.md`; but each *video* element is per-route and must be torn down.)

---

## 5. Shaka Player

Use when you need **DASH**, **multi-DRM**, or one codepath for every browser.

```js
import shaka from 'shaka-player';

shaka.polyfill.installAll();
if (!shaka.Player.isBrowserSupported()) { showUnsupportedUI(); }

const player = new shaka.Player(video);
player.configure({
  abr: { enabled: true, defaultBandwidthEstimate: 1_000_000 },
  streaming: { bufferingGoal: 30, rebufferingGoal: 2 },
  // DRM — see DRM section. License servers are mapped per key system:
  drm: {
    servers: {
      'com.widevine.alpha': 'https://license.provider.com/widevine',
      'com.microsoft.playready': 'https://license.provider.com/playready',
      // FairPlay configured separately (cert + server) — see DRM section
    },
  },
});

player.addEventListener('error', (e) => onShakaError(e.detail));
await player.load('https://stream.example.com/movie/manifest.mpd'); // or .m3u8
```

Why Shaka: it's **key-system-agnostic** — it asks the browser (via EME) what it supports and picks, so the same build serves Widevine (Chrome/Android), PlayReady (Edge/Windows), and FairPlay (Safari). It plays both DASH and HLS, so you can standardize on one player.

**Do** use Shaka when your matrix is DASH + multi-DRM.
**Don't** add Shaka just for plain HLS on Safari — native is lighter.

---

## 6. Fast-seek & scrub-preview

- **`video.fastSeek(t)`** snaps to the nearest keyframe (cheaper, less precise) — ideal for scrubbing. `video.currentTime = t` is frame-accurate but heavier. Use `fastSeek` while the user drags, settle to `currentTime` on release.
- **Scrub-preview thumbnails** ("trick play"): use the WebVTT **image/sprite** track (a `.vtt` mapping timestamps → `image.jpg#xywh=…` sprite regions) packaged by Mux/Cloudflare/Shaka Packager. On hover/drag, parse the cue for the current time and render the sprite crop above the scrubber.
- Debounce ABR-thrash on aggressive scrubbing; let the player settle before measuring bandwidth again.

**Do** use `fastSeek` during drag for responsiveness.
**Don't** fire a precise `currentTime` set on every pointermove — it stutters.

---

## 7. DRM

**DRM = EME (Encrypted Media Extensions, the browser API) + CENC (Common Encryption, the packaging).** Content is encrypted once with CENC; each platform's CDM (Content Decryption Module) gets keys from a **license server** over EME.

Three CDMs cover the field:
- **Widevine** — Chrome, Android, many smart TVs
- **PlayReady** — Edge, Windows, Xbox
- **FairPlay** — Safari, iOS, tvOS (uses native HLS path, separate cert + key-server flow)

### The rule: license handling is a SERVICE, not boilerplate
Key exchange is security-sensitive and provider-specific. Use a managed pipeline:
- **Mux Video**, **Cloudflare Stream**, or **AWS (MediaConvert/SPEKE + a DRM vendor)** to package CENC content and run/broker the license servers.
- On the client, wire the player to the provider's license endpoints (Shaka's `drm.servers` map above, or the provider's drop-in). For FairPlay, supply the app certificate and the license/key endpoint per the provider's guide.

```js
// Shaka: point each key system at the provider's license URL.
// Add auth headers via a request filter (token from YOUR backend, short-lived).
player.getNetworkingEngine().registerRequestFilter((type, request) => {
  if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
    request.headers['Authorization'] = `Bearer ${getDrmToken()}`;
  }
});
```

**Do** package once as CENC/CMAF and let a provider broker Widevine + PlayReady + FairPlay; gate licenses with short-lived tokens from your backend.
**Don't** hand-roll EME `generateRequest`/license POST flows or embed keys client-side. It's fragile, insecure, and you'll fight every CDM quirk yourself.

---

## 8. Sources

- Mux — Best practices for video playback (complete guide, 2025): https://www.mux.com/articles/best-practices-for-video-playback-a-complete-guide-2025
- Shaka Player (DASH & HLS, MSE-EME): https://github.com/shaka-project/shaka-player
- Shaka DRM configuration tutorial: https://shaka-player-demo.appspot.com/docs/api/tutorial-drm-config.html
- HLS.js in 2025 — complete guide (VideoSDK): https://www.videosdk.live/developer-hub/hls/hls-js
- hls.js API docs: https://github.com/video-dev/hls.js/blob/master/docs/API.md
