# Position: design system + mobile (staff design-systems engineer)

Scope: token architecture, what survives web→native, component inventory, phone layout, one brand across site and app. Incorporates the correction that episodes are **9:16 vertical micro-drama** (ReelShort/DramaBox format).

## 1. DIAGNOSIS

- **Three copies of the palette, none of them tokens.** `packages/design-tokens/src/colors.ts` (TS constants), `packages/design-tokens/tailwind-preset.cjs` (hand-mirrored hex), and `packages/ui/src/Header.tsx` (its own `VR_SECTIONS` + hex + font strings). No DTCG source, no build step, no semantic tier. The project's own skill (`.claude/skills/design-system/SKILL.md`) forbids exactly this.
- **The signature effects are web-only CSS.** D17 nebula re-tints via `hue-rotate` (RN `filter` on iOS supports only `brightness`/`opacity`); `Header.tsx` uses `backdropFilter` (no RN equivalent); `VRPoster.tsx` uses `mixBlendMode: overlay` (RN: New Architecture, Android 10+ only); `Hero.tsx` uses `maskImage`. If these carry the look, the app cannot look like the site.
- **`packages/ui` is a web package wearing a shared badge.** `Header.tsx` imports `next/link`; every component renders `<a>`/`<section>` with inline CSS strings. Nothing here is importable by Expo, so D6 ("invest now") is not yet true in code.
- **Card geometry is wrong for the content.** `ContentCard.tsx` is hard-coded `aspect-[3/4]`; `CardRow.tsx` is a 6-column grid, not a shelf. The catalog is 9:16 episodes and trailers, later 16:9 features — no ratio prop, no progress, no episode state.
- **Mobile is a shrunken desktop.** `home-mobile.png`: 10px JetBrains Mono labels at `0.18em` tracking are illegible at phone density, two stacked top bars eat ~90px, there is no tab bar, and the fade-in sections leave a black void. `motion.ease` is a CSS string; RN needs a bezier tuple.

## 2. NON-NEGOTIABLES

1. **Tokens are the brand; effects are garnish.** Every mockup must still read as Visurena with `backdrop-filter`, `mix-blend-mode`, `hue-rotate`, masks and text-stroke removed. Ambient color comes from surfaces + gradients + image scrims — all portable (RN `backgroundImage` gradients, `expo-linear-gradient`, `expo-blur` on images).
2. **One component, both ratios, one accent hook.** Every media surface takes `ratio: "9:16" | "2:3" | "16:9" | "1:1"` and reads `--accent`, never a literal. Vertical and per-item theming re-point `--accent`; components are never forked (D16 stays).
3. **Phone is a first-class layout, not a breakpoint.** 44pt touch targets (48 for tabs), 16px gutter, one top bar, bottom tabs, labels ≥12px. Every mockup ships a 390px phone frame built from the same components.

## 3. TOKEN ARCHITECTURE

**Tiers** (as the skill): *primitive* (`color.jewel.amber.500`, `space.4`) → *semantic* (`color.bg.base`, `color.text.muted`, `color.accent`, `radius.card`) → *component* (`card.bg`, `tab.active.fg`; aliases semantic only). Kebab-case `category-property-variant-state`. Source: DTCG JSON in `packages/design-tokens/tokens/*.json`, OKLCH with `hex` fallback. Style Dictionary v4 does not yet fully support the 2025.10 DTCG revision, so stay on the stable subset.

**Surfaces.** Black but not `#000`: `bg-base` L≈0.13 (`#0b0c10`), `bg-raised` 0.17, `bg-overlay` 0.21, `bg-sheet` 0.24; `border-hairline` white 8%, `border-strong` 14%. One step darker than the skill's 0.16 — deliberate; video needs deep pillars. Text: `text-primary` ivory L≈0.95, `text-secondary` 70%, `text-muted` 50% (drop the 32% "faint"; it fails contrast on phones).

**Accent as tokens.** `color-accent` is the single hook. Vertical layer: `[data-vertical]` (web) / `vars({"--accent"})` (NativeWind) points it at the jewel primitive — D3's mapping wins over the skill's table (which has movies=crimson, games=emerald; correct the skill). Item layer (D16): `item.json.accent` sets `--accent-item`; `--accent` resolves `var(--accent-item, var(--accent-vertical))`. RN has no `color-mix()`, so `packages/core` computes derivatives at runtime for both platforms: `accentTint` (12% over base), `accentGlow` (28%), `accentForeground` (by contrast), plus an OKLCH clamp (L 0.62–0.80, C ≤ 0.2) so extracted cover colors never break contrast.

**Type** (fluid `clamp()` web / fixed phone step + `fontScale()` native): display-xl 64/56, display-lg 48/40, display-md 36/30, title-lg 28/24, title-md 22/20, title-sm 18, body-lg 18, body 16, body-sm 14, label 12 (mono, ≤0.12em tracking). Line-heights 1.05/1.2/1.55. Ship composite `typography` tokens; the token names the family, the platform maps the file (variable font on web, static instances on native).

**Spacing** (4-base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. Semantic: `gutter` 16/24/48, `section-gap` 48/96, `shelf-gap` 12/16.

**Radius:** poster 8, card 10, button 8, chip full, sheet-top 20, player 0 phone / 12 desktop. **Elevation** = composite {surface, border, shadow}: levels 0–3 lift the surface; shadow only for floaters (mini-player, sheets): `0 12px 32px -8px black/40`.

**Motion:** `fast` 150, `normal` 220, `slow` 400, `accent-fade` 1200, `ambient-drift` 60000 (tagged web-only); easings as 4-number tuples so web emits `cubic-bezier()` and native `Easing.bezier()`; a `motion-reduced` set zeroes ambient and halves the rest.

**Pipeline:** Style Dictionary v4, one source, three targets: (a) `build/web/tokens.css` via `css/variables` with `outputReferences: true` so the `--accent` chain stays live; (b) a generated Tailwind preset replacing the hand-mirror — when `apps/web` moves Tailwind 3.4→v4 it becomes `@theme inline`, and NativeWind v5 (Tailwind-v4-based, RC March 2026) can consume the **same CSS file**; (c) `build/native/tokens.ts` via `javascript/es6` with a transform that strips `px` to numbers and emits `vars()` maps per vertical. Turborepo `^build` orders it. `packages/ui` splits into `ui-web` (shadcn) and `ui-native` (React Native Reusables) with identical names/variants/props; `packages/core` holds accent math, ratio helpers and the D11 block renderer.

## 4. COMPONENT INVENTORY

| # | Component | Web vs native |
|---|---|---|
| 1 | `TopBar` (wordmark, search, profile) | Web sticky translucent; native transparent, solid on scroll. One bar only. |
| 2 | `BottomTabs` | Native only (Expo Router). Web: TopBar nav + footer. |
| 3 | `VerticalChips` (Stories/Movies/Music/Games/Requests) | Same; native scroll-row under TopBar. |
| 4 | `HeroBillboard` | Web: split hero — 9:16 key art beside type, accent bleed. Native: 9:16 peek carousel. |
| 5 | `MediaCard ratio=…` | 9:16 episodes/series, 2:3 stories, 16:9 features/games, 1:1 albums. Hover-zoom vs press-scale. |
| 6 | `Shelf` + `SectionHeader` | Scroll-snap + arrows vs horizontal FlatList; same tokens. |
| 7 | `RankShelf` (Top 10 numerals) | Real text on both; no `text-stroke` — heavy weight + `text-muted`. |
| 8 | `ContinueCard` + `ProgressBar` | Identical. |
| 9 | `SeriesHeader` | Web: wide backdrop crop + poster; native: full-bleed 9:16 art with scrim. Both read `--accent-item`. |
| 10 | `EpisodeItem` / `EpisodeList` | 9:16 thumb, number, duration, progress, state (live/scheduled/locked). Native vertical list; web right rail. |
| 11 | `VerticalPlayer` | Native: full-screen 9:16 pager, swipe-up = next, pre-cache 2 (expo-video). Web: `PlayerStage` — 9:16 player at `78vh·9/16` wide, ambient blurred key-art backdrop (web garnish), episode rail right, synopsis/cast/comments below. Swapping ratio to 16:9 drops the rail below. |
| 12 | `PlayerActionsRail` (like/comment/share/episodes) | Native right edge; web under stage. |
| 13 | `MiniPlayer` (music) | Native docked above tabs, expands to sheet; web fixed bottom bar. |
| 14 | `RequestCard` + `VoteButton` | Same; state chip requested → in production → released (links to work). Vote gated by login (D33). |
| 15 | `Badge` (New, Ep 12, Scheduled, Trending) | Identical. |
| 16 | `ReleasePill` ("Next episode Thu") | Identical; from `nextChapterAt`. |
| 17 | `Button` / `IconButton` / `Chip` | shadcn vs RNR, identical variants. |
| 18 | `Sheet` / `Dialog` | Native bottom sheet; web dialog. |
| 19 | `AmbientBackdrop` | Web nebula/gradient drift; native static gradient + `expo-blur` (Android ≥12; gradient fallback). |
| 20 | `Reader` (block renderer) | Shared logic in `core`; platform primitives differ. |

## 5. MOBILE LAYOUT

**Tabs (5):** Home · **Watch** (vertical episode feed, the default binge surface — Netflix "Clips" pattern) · Search (with `VerticalChips`) · **Requests** (the differentiator earns a tab) · You (Continue, Saved, Follows, profile). Music `MiniPlayer` docks above the tabs everywhere.

**Home (390px):** TopBar → VerticalChips → 9:16 `HeroBillboard` carousel (accent bleed) → "Continue watching" shelf (9:16, 3 per row ≈111px) → one "Vote on what's next" `RequestCard` → per-vertical shelves (Stories 2:3, Music 1:1, Games 16:9) → "Made this week".

**Series page:** full-bleed 9:16 key art with scrim → title, meta, `ReleasePill` → `Play E1` / `Trailer` / `Follow` → synopsis → `EpisodeList` with progress → cast shelf → related. Tap an episode → `VerticalPlayer` full-screen; swipe up advances, swipe down closes.

**Desktop mirrors, not copies:** same shelves; the hero becomes the split billboard and the player becomes the stage with a rail, so the 9:16 asset is framed by the brand rather than floating on black.

## 6. WHERE I EXPECT TO DISAGREE

- **Visual/brand:** will want backdrop blur, blend modes and the photographic nebula as identity. Those are web-only garnish; identity must be surfaces + accent + type, or the app becomes a different product. Keep mono micro-labels, but 12px / 0.12em.
- **Motion/frontend:** will push scroll-fade sections; on phone those are the black voids in the screenshot. Content visible at rest, motion additive, `motion-reduced` honored on both platforms.
- **UX/IA:** may want one tab per vertical. Netflix, Crunchyroll and Disney+ all moved verticals into top chips and kept tabs for modes. I hold that line and give Requests the fifth slot.
- **Product:** may want 16:9 features first on desktop. Reality is 11 vertical episodes; the system holds both ratios, but mockups should lead with 9:16 done well.
- **Project skill:** I keep its tiers and pipeline but deviate on base lightness (0.13 vs 0.16), keep serif display (it says sans), and flag its accent table contradicting locked D3.

## 7. REFERENCES

- https://styledictionary.com/info/dtcg/ — SD v4 DTCG support; 2025.10 revision not fully supported yet.
- https://styledictionary.com/reference/hooks/formats/predefined/ — `css/variables` + `outputReferences`, `javascript/es6`, `typescript/es6-declarations`.
- https://www.nativewind.dev/blog/announcement-nativewind-v4 — `vars()` runtime CSS variables on native.
- https://www.nativewind.dev/docs/guides/themes — v5 RC, Tailwind v4 CSS-first, nested `vars()` per theme × scheme.
- https://github.com/founded-labs/react-native-reusables — shadcn-for-RN on NativeWind.
- https://reactnative.dev/docs/next/view-style-props — `filter` (iOS brightness/opacity only), `mixBlendMode` (Android 10+, New Arch), `boxShadow`, gradient `backgroundImage`; no backdrop-filter.
- https://docs.expo.dev/versions/latest/sdk/blur-view/ — BlurView efficient only on Android SDK 31+.
- https://docs.expo.dev/versions/latest/sdk/linear-gradient/ — linear only; radial via RN `backgroundImage`.
- https://help.netflix.com/en/node/575087423404644 — 4 tabs (Home, Clips, Search, My Netflix) + top filter chips.
- https://www.whats-on-netflix.com/news/netflix-mobile-updates-clips-new-navigation/ — vertical Clips feed, April 2026 rollout.
- https://www.kholten.com/projects/crunchyroll-app — Home/Search/My Lists/Games/Store tabs, hero carousel, Continue Watching.
- https://www.figma.com/blog/creating-coherence-how-spotifys-design-system-goes-beyond-platforms/ — Encore: shared Foundation tokens, platform subsystems.
- https://www.reelshort.com/ — portrait cards in shelves on desktop.
- https://fastpix.com/tutorials/how-to-build-a-micro-drama-video-app-like-reelshort-or-dramabox — swipe-up next episode, pre-cache.
