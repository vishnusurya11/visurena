# Motion lane, round 2

## 1. CONCEDE

- **Product:** Scarlet is complete (14/14). The side panel loses "next drops"; the status line reads "Complete · 14 episodes · ~2h 20m", and **auto-advance up-next becomes the core loop**. Motion is for state changes (vote ticking, a "New" chip), not reveals.
- **Visual:** zero drift, zero glow, no `text-shadow`, no grain, no blend modes. My one ambient loop is gone: the page has **zero** continuous animation. The wash is a solid gradient from a precomputed hex, crossfaded by opacity. Hover elevation is `bg-2`, not shadow.
- **Mobile:** effects are droppable garnish. I adopt their tokens (`fast 150 / normal 220 / slow 400`, 4-number easing tuples, `motion-reduced` set) and drop mine; delete `ambient-drift`. Backgrounds ship as image assets.
- **UX:** their reveal rule (content at opacity >= 0.6 before any motion; scroll may finish a reveal, never start one) replaces my "0.1". I take their stage numbers (~470px player, 400px panel) and kill the Netflix sibling shift.

## 2. HOLD

1. **The 9:16 stage sits on a frame-derived backdrop, not flat charcoal** (vs visual). It is a pre-rendered 18x32px JPG in an `<img>`: no filter, no blend mode, RN-identical, so it passes visual's own portability test. A 470px portrait video on 1000px of flat charcoal is the loudest "embedded phone" signal; Apple TV and YouTube, visual's references, light the room from the frame. Stage only.
2. **Card hover keeps `scale(1.04)` plus a 600ms-dwell muted preview** (vs visual, partly UX). Scaling the card moves nothing else; the preview is the one motion that is content, the only way to taste a 10-minute episode without leaving the row. Pointer only, never on touch.
3. **No hero video before LCP** (vs product's mobile trailer autoplay). Poster `<img>` first, always; trailer after `load`, on desktop dwell or tap, never on Save-Data. A 60s trailer racing the poster on 4G turns a 2s LCP into 6s.

## 3. VOTE

**Cinema Lobby**, borrowing Broadsheet's folio line ("14 episodes · Complete") under every title. Flat charcoal plus one gradient from a stored hex is the cheapest ground possible (one paint, no compositing layers), and its "lit poster" gives the stage backdrop a native home. **Kill Signal**: its live ticker reintroduces the continuous animation I just removed, and it reads cold on period drama.

## 4. THE ONE THING

**Everything the user came for is visible at first paint with JS disabled**: hero as `<img fetchpriority="high">`, every card at rest at opacity >= 0.6, nothing gated on scroll, dwell or script. If a full-page capture shows a black region, the redesign failed.

## 5. MOCKUP NOTES

1. **Ground.** `body { background:#0C0C0E }`. Per hero/series: `background: linear-gradient(180deg, <mix> 0%, #0C0C0E 60vh)`, where `<mix>` = base + 0.18 x (ambient - base) per channel, precomputed to hex (ambient `#6B4A2E` -> `#1D1713`). No `color-mix()`, no radial, no texture, no `position:fixed`; it scrolls with the section.
2. **Hover.** `.card { transition: transform 220ms cubic-bezier(.22,1,.36,1), background 150ms } .card:hover { transform: scale(1.04); background:#1C1C20 }` inside `@media (hover:hover) and (pointer:fine)`. No shadow change, no sibling movement. Optional: `<video muted loop playsinline preload="none" poster>` started 600ms after `mouseenter`.
3. **Desktop stage, 1440x900.** Nav 60px. Player `height: min(calc(100vh - 108px), 800px); aspect-ratio: 9/16` (~445x792), centred left of a **400px** panel (`background:#141417; border-left:1px solid #26262B`), 32px gap. Tabs Episodes / Chapters / About; rows 72px with a 40x71 thumb, number, title, runtime, progress. For 16:9 the player spans full width and the panel drops beneath.
4. **Backdrop from a JPG, no JS.** `magick maxres.jpg -gravity center -crop 720x1280+0+0 -resize 18x32 glow.jpg` (~2KB). `<img src="glow.jpg" alt="" aria-hidden>` at `position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.45`, under a `linear-gradient(180deg, transparent, #0C0C0E)` overlay. Browser upscaling of 18x32 *is* the blur.
5. **Must not appear.** `opacity:0` reveals; fixed background layers; `mix-blend-mode`, `backdrop-filter`, `text-shadow`, animated `box-shadow`/`background-position`; marquee or ticker; a seven-family Google Fonts link (self-host two, `font-display: swap`); hero art as CSS background; any `autoplay` on load.
