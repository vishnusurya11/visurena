# Round 2 — design system + mobile

## 1. CONCEDE

- **Product (Scarlet complete 14/14):** `ReleasePill` becomes a `StatusLine` with three states (airing / complete / in production). Hero CTA is `Watch Ep 1` or `Continue Ep N`. "Next from the studio" is a home module; the nav word is `Next`.
- **UX (tabs + feed):** Tabs `Home · Watch · Read · Next · You`, Search in the top bar. Watch is a browse hub; the swipe player is **series-scoped**, entered from a card. With one series a cross-series feed is empty.
- **Visual (#0C0C0E, no chrome serif, ingest ambient):** Adopt the ramp `#0C0C0E / #141417 / #1C1C20 / #26262B`, `#F2F1EC` text, the desaturated accents — all RN-safe hex. One sans + mono numerals is one TTF set on Expo. The per-item `ambient` hex stored in `item.json` replaces my runtime OKLCH clamp (fallback only).
- **Motion (pre-blurred glow):** A 64×36 pre-blurred WebP per artwork removes `expo-blur` from `AmbientBackdrop`; one file serves both platforms. Shared numbers, not shared code — agreed.

## 2. HOLD

1. **Zero `backdrop-filter`, header included** (vs motion's "header only"). A glass header makes the app header a different object on every screen. Header = `bg-0` at 92%, solid on scroll.
2. **The tab bar never mutates with inventory** (vs UX's collapse rule on nav). Five fixed tabs; a thin vertical shows an empty state with slate + vote inside its tab. Tabs that come and go break muscle memory. Games live in a Home rail and Search chips.
3. **Accent = one *role* per viewport, not one instance** (vs visual). Three `ContinueCard` progress fills are one role. A role rule is enforceable as a token; "once" is not.

## 3. VOTE

**Cinema Lobby**, with Broadsheet's tabular status line ("Ep 11 of 14 · 9 min") as the metadata voice. Every Lobby element maps to an RN primitive — flat surface, two-stop gradient from a stored hex, image, text, 1px border — so site and app share one token set. **Kill Signal:** bordered frames and a live ticker read as SaaS, need live data we lack, and fit period drama worst.

## 4. THE ONE THING

Every visual decision must be expressible as `{surface hex, two-stop linear gradient, image, text style, radius, 1px border}` — the React Native primitive set. If the brand needs anything outside that to be recognisable, the redesign has failed for the app.

## 5. MOCKUP NOTES

1. **Tabs:** `Home · Watch · Read · Next · You`; 56px bar + safe area, items 48×48, icon 24px, label 12px. Top bar 56px: wordmark left; Search and avatar 44×44 right.
2. **Home, 390px (gutter 16, gap 12, section gap 40):** hero art 358×448 (4:5 top-crop of the 9:16 key art) on an 18% ambient gradient → status line 14px → two full-width 48px CTAs → "Next from the studio" rail, 2:3 cards **111×167** 3-up with peek, state chip + vote → Episodes rail, 9:16 cards **111×197** with 2px progress → Read rail 111×167 → Play rail 16:9 171×96. Rails with <3 items do not render.
3. **Series page, 390px:** key art 390×520 with bottom scrim → title 30px + status line 14px → `Start Ep 1` 48px / `Follow` / `Trailer` → synopsis 16/1.55, 3-line clamp → episode rows: 9:16 thumb 72×128, title 16px, runtime 14px, date 12px, row 144px → cast shelf 96px → extras → three vote cards. Tap → full-screen series-scoped swipe player: series name, "Ep 4 of 14", chapter-segmented 3px progress, right rail of four 48×48 buttons, end card "Complete · Follow the studio · Next: Frankenstein".
4. **Floors:** touch targets ≥44×44 (48 in tab bar and player rail); nothing below 12px; tracking within [-0.03em, +0.06em]; card titles 14px, 2-line clamp.
5. **Render-without proof:** an `html.native` toggle that disables `backdrop-filter`, `mix-blend-mode`, `filter`, `mask-image`, `text-shadow`, `-webkit-text-stroke`, `color-mix()` and all animation except opacity/transform. Screenshot both states; they must be the same brand.
