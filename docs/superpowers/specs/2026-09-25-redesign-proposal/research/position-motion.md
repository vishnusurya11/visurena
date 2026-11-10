# Position: motion, backgrounds, performance, video
Front-end / motion lane, 2026-09-25. Grounded in `apps/web/pages/index.tsx`, `apps/web/styles/globals.css`, `packages/ui/src/{VRFade,NebulaBackground}.tsx`, `apps/web/pages/_app.tsx`, `next.config.js`, the screenshots and `refs/yt/`.

## 1. DIAGNOSIS

- **Everything below the hero is hidden by default.** `.vr-fade { opacity:0; translateY(18px) }` (`globals.css:135`) wraps every section and card; it shows only when `IntersectionObserver` fires at 8% visibility minus 40px (`VRFade.tsx:23`), then takes 720ms plus `delay={i*50}` per card. Full-page captures, crawler screenshots, print and fast scrollers all see black slabs (home-top/home-mid.png). Chrome excludes opacity-0 elements from LCP and re-elects the H1 later on a font repaint (DebugBear), so the metric is worse and noisy. The 540ms `.vr-page` fade on every route (`globals.css:139`) stacks on top.
- **The hero art is invisible to the preload scanner.** It is an inline `background: url(...)` (`index.tsx:121`) with `images.unoptimized` (`next.config.js:4`): full-size JPG, no `srcset`, no `fetchpriority`, discovered only after CSSOM + JS. On 4G that is the whole perceived-load story.
- **The "cinema" is invisible and expensive at once.** Nebula clouds sit at 7-14% accent over near-black (`globals.css:113-123`) and read as flat black, while starfield tiles animate `background-position` (`:87`, `:97`), a paint-every-frame property, inside a `position:fixed` layer with two full-viewport `mix-blend-mode: screen` children (`:111`, `:119`). A GPU tax for a drift nobody sees.
- **Motion is decorative, not causal.** Cursor parallax (`index.tsx:85-107`), Ken Burns (`globals.css:377`), tilt, marquee, sheen, pulse, bob: seven ambient loops, none responding to the user. That is 2008 Flash grammar. Card hover animates a four-layer `box-shadow` (`globals.css:215-222`), paint not compositor. `design-tokens/src/motion.ts` defines four tokens; `globals.css` uses none.
- **Emptiness reads as slowness.** An 88vh hero, one story, a marquee, two tiles; Movies is a word plus "Coming soon" (movies.png) while 11 episodes exist on YouTube. Seven font families load from Google Fonts (`_app.tsx:16-19`); three are used.

## 2. NON-NEGOTIABLES

1. **LCP <= 2.0s at p75 on mobile** (Google's "good" line is 2.5s). Hero art is an `<img fetchpriority="high">`, AVIF/WebP with `srcset`, sized at ingest. Nothing above the fold starts at `opacity:0`; if it animates it starts at 0.1 or after `load`. Two self-hosted font families max, preloaded, with `size-adjust` fallbacks so font CLS is 0.
2. **Animation budget.** Only `transform`, `opacity`, `clip-path`. Never animate `box-shadow`, `background-position`, `backdrop-filter`, `width/height`. At most **one** continuous animation on screen, paused off-screen and on hidden tabs. Motion JS <= 20KB gzipped. INP < 200ms; no scroll listeners.
3. **Reduced motion is one token.** `prefers-reduced-motion` (web) / `AccessibilityInfo.isReduceMotionEnabled` (RN) set `motion.reduced`. When true: no ambient motion, no hover autoplay, no parallax; reveals instant; route transitions a 120ms cross-fade. Plus a footer toggle stored locally.

## 3. MOTION LANGUAGE

Principle: **light responds, nothing wanders.** Every motion is caused by the user (scroll, hover, navigate) or by content (a new frame). Loops are banned except the ambient glow.

- **Tokens (shared web+RN, numbers only):** durations `fast 120 / base 200 / slow 320 / cinematic 560`; easings `out` (0.22,1,0.36,1), `inOut` (0.65,0,0.35,1), one spring (stiffness 260, damping 28); stagger 40ms capped at 6. Compiled to CSS custom properties on web and Reanimated `withTiming/withSpring` configs on RN.
- **Page enter:** none for the page; the hero paints in frame one. Hero text lines stagger 40ms, `opacity .1 → 1`, `translateY 8px → 0`, over `slow`.
- **Scroll:** below-fold reveals use CSS `animation-timeline: view()` inside `@supports`; fallback is **visible**, never hidden. Runs on the compositor (Chrome docs); Chrome/Edge 115+, Safari 26+; Firefox is flagged and gets the fallback. Because `view()` resolves from geometry, a full-page capture renders end states, which fixes the black slabs for free. Native scroll only; no Lenis.
- **Hero:** static art lit by the accent glow; on scroll it scales 1 → 1.06 and darkens via a `scroll()` timeline. A muted self-hosted loop (<= 2MB) may replace the still on desktop, after LCP, `pointer:fine`, not reduced.
- **Card hover:** `scale(1.04)` over `base`, scrim lightens, accent hairline draws in. Dwell 600ms, then preview; the delay is the Netflix lesson. Shadow lives on a pseudo-element and only its opacity animates.
- **Vertical accent transitions:** `--vr-accent` on `:root` transitions over `cinematic`; nothing re-lays out. Route changes wrap `document.startViewTransition` around the Pages Router's `routeChangeStart/Complete` (Chrome + Safari 18+, instant elsewhere); poster and player share a `view-transition-name` so opening an episode is the poster growing into the stage. No first-party Next flag exists for the Pages Router that I could confirm; treat as manual.
- **Library:** none for the core; CSS + WAAPI cover it. Keep `framer-motion` (already installed) only for `layout` animation in the request board, lazy-loaded; otherwise drop it. No GSAP: ScrollTrigger duplicates `animation-timeline` for ~30KB.

## 4. BACKGROUND OPTIONS

Ranked by (feel, cost, RN-portability). Recommendation: **1 over 2**; 3 as desktop garnish later.

1. **Artwork glow (Apple TV / YouTube ambient).** The page is lit by the featured item: a heavily blurred, downscaled copy of the hero, poster or current frame, tinted toward the vertical accent, cross-fading on change. Build: the pipeline emits a 64x36 pre-blurred WebP per artwork at ingest (~2KB); web shows it as a static `<img>` scaled to the viewport. Self-hosted video samples frames into a 10x6 canvas (Smashing); YouTube iframes cannot be sampled, so episodes use the thumbnail glow. Feel: highest. Cost: near zero. RN: the same asset.
2. **Gradient mesh + grain.** Three radial gradients in the accent at 25-35% at the top of each section fading to true black, a tiled 128px noise PNG at 4-6%, hue drift only via the `--vr-accent` transition. Scrolls with the section, not fixed. This is what the site attempts now at a fifth of the intensity with the wrong property. RN: `expo-linear-gradient` plus the tile.
3. **Shader nebula (ogl / Unicorn Studio).** FBM gas in accent colours. Unicorn's guide: runtime ~29-36KB gz, DPI 1, scale 0.75, 30fps, pause off-screen; 21st.dev agrees half-res + 30fps is ~3x cheaper. Home hero only, `pointer:fine`, not reduced. The only option with a bundle and battery bill, and not portable (a second Skia implementation), so last.

## 5. VIDEO

**The format decides the design.** Episodes and trailers are 9:16 vertical micro-drama. YouTube has no Shorts-specific embed: `/embed/<id>` is the normal player and fills its box, so a 16:9 iframe pillarboxes the episode in black. The iframe must be `aspect-ratio: 9/16`. `maxresdefault.jpg` is a 16:9 frame with YouTube's own blurred side-fill (`refs/yt/`); at ingest, crop the centre 720x1280 as the true poster and derive the glow from that crop.

**Embed:** `lite-youtube-embed` (or a 40-line equivalent in `packages/ui`) on `youtube-nocookie.com`, poster from our CloudFront, iframe mounted only on click (its "224x faster" claim is exactly this), `js-api` on. Hover previews are **not** YouTube: the pipeline renders a 5s muted 480x854 WebM (<= 400KB) per episode to S3; CloudFront's always-free 1TB/month + 10M requests covers that.

**Desktop stage: "portrait theatre".** A 9:16 stage at `height: min(85vh, ...)` (about 430px wide at 1080p) sits centre-left on a full-bleed glow from the portrait frame, so the phone-shaped video never floats in black. Right of it, a side panel: episode list with progress rings, chapter ticks down the stage edge, cast, "next drops <date>", request-board CTA. Never letterbox into a 16:9 player; ReelShort's desktop layout is the reference, and the glow is what stops it reading as "an embedded phone".

**Mobile: full-screen swipe player.** `scroll-snap-type: y mandatory`, one episode per snap, poster + glow for every card instantly. **One persistent player**, not an iframe per card: on snap change call `loadVideoById`, which keeps the first tap as user activation so later episodes autoplay with sound (a fresh iframe per card needs a fresh tap on iOS). Same shell in RN via `react-native-youtube-iframe` or a WebView.

**The shell holds both ratios.** `ratio: "9:16" | "16:9"` comes from the work's JSON; the stage is `max-height: 85vh; max-width: 100%` with `aspect-ratio` from data. Landscape flips the layout: stage full width, panel below.

**Player UI is ours from day one** (Media Chrome or custom) so the engine can change: chapters from the pipeline's scene JSON (`seekTo`); up-next as our overlay in the last 15s and at `ended`, `rel=0` so YouTube's end screen stays on-channel; progress sync via `getCurrentTime()` every 5s while playing plus on `pause`/`visibilitychange`/`pagehide`, debounced, `PUT /progress {work, episode, seconds}`, resume via `start=`, anonymous users in `localStorage` merged on login; keyboard shortcuts; mini-player on scroll.

**Migration path:** the pipeline already runs ffmpeg, so emit a portrait HLS ladder (540/720/1080) at ingest for free, no MediaConvert; S3 + CloudFront + hls.js (Safari native); flip the engine per work via a `source` field. Trigger is cost: a 10-min episode at 2.5Mbps is ~190MB, so the free tier covers ~5,000 views/month, then $0.085/GB (~$16 per 1,000 views). YouTube pays that today; self-host when control (no end-screen leakage, frame-sampled glow, true resume) beats reach.

## 6. WHERE I EXPECT TO DISAGREE

- **UX/IA** will want rows, request board and continue-watching on the first screen. Fine below the fold; above it I hold LCP and one hero, and every row is static images by default.
- **Visual/brand** will want the starfield, glass blur, grain everywhere, three typefaces and a fixed nebula. Trade: grain and glow yes; `backdrop-filter` only on the header; two typefaces; no fixed blend-mode layers; "drift" becomes a colour transition.
- **Product** will want Netflix autoplay in the hero and YouTube embeds in every card for reach. Hero video only after LCP, desktop, muted, self-hosted; the iframe lives only on the stage, on click.
- **Mobile/design-systems** will want one cross-platform animation runtime (Moti/Reanimated via react-native-web). I want shared **numbers**, not shared code: CSS/WAAPI on web, Reanimated on RN, both fed by `motion.ts`.
- **The brief** calls S3+CloudFront MP4 "cheap". It is, to 1TB/month; past that the maths above applies.

## 7. REFERENCES

- https://web.dev/articles/lcp — thresholds; opacity-0 and full-viewport elements excluded from LCP.
- https://www.debugbear.com/blog/opacity-animation-poor-lcp — fade-in hero elects a later LCP on repaint; start at 0.1 or don't animate.
- https://developer.chrome.com/docs/css-ui/scroll-driven-animations — `animation-timeline` on the compositor; Chrome/Edge 115+, Safari 26+, Firefox flagged.
- https://github.com/paulirish/lite-youtube-embed — click-to-load YouTube, `youtube-nocookie`, `js-api`.
- https://www.smashingmagazine.com/2023/07/recreating-youtube-ambient-mode-glow-effect/ — 10x6 canvas frame sampling on rAF, paused on `pause/ended`.
- https://www.unicorn.studio/docs/performance/ — shader cost levers: DPI 1, scale 0.75, 30fps, pause off-screen.
- https://21st.dev/blog/react-shader-background-components — ogl vs three.js, 30fps + half-res as ~3x saving, CSS gradients where no per-pixel maths is needed.
- https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/ — always-free 1TB/month + 10M requests; $0.085/GB for the next 9TB.
