# Semantic Token Mapping for Dark Mode

The core discipline: a token names a **role**, never a hue. Components reference roles only. Each role has one value per theme. Switching theme swaps values; component code is untouched.

## Why not flip raw colors?

`filter: invert()` or hex inversion breaks because:
- Brand colors invert to off-brand hues (blue → orange).
- Photos and logos invert into negatives.
- Inverted `#fff`→`#000` gives the worst possible OLED/halation combo.
- Contrast relationships are not preserved (a 4.5:1 light pair is not 4.5:1 inverted).

## Full role table

| Role token | Purpose | Light | Dark |
|---|---|---|---|
| `--surface-base` | App background / lowest layer | `#ffffff` | `#121212` |
| `--surface-raised` | Cards, panels (1 step up) | `#f7f7f8` | `#1e1e1e` |
| `--surface-overlay` | Modals, menus, popovers (highest) | `#ffffff` | `#2a2a2a` |
| `--surface-sunken` | Wells, code blocks (recessed) | `#f0f0f1` | `#0d0d0d` |
| `--text-primary` | Body / headings | `#1a1a1a` | `#e6e6e6` |
| `--text-secondary` | Captions, metadata | `#525252` | `#a1a1aa` |
| `--text-disabled` | Disabled labels | `#a3a3a3` | `#5a5a5a` |
| `--border-subtle` | Dividers, hairlines | `#e4e4e7` | `#2e2e2e` |
| `--border-strong` | Input outlines, focus base | `#a1a1aa` | `#52525b` |
| `--accent` | Primary action / link | `#2563eb` | `#7aa7f0` |
| `--accent-foreground` | Text/icon on accent | `#ffffff` | `#0a0a0a` |
| `--accent-hover` | Accent hover state | `#1d4ed8` | `#93bbf5` |
| `--success` / `--warning` / `--danger` | Status | vivid | desaturated + lightened |

All dark text/surface pairs above are tuned to clear WCAG 2.2 AA on `--surface-base`; re-verify any you change with tooling (see web-accessibility-audit).

## Elevation by lightness (not shadow)

Shadows barely register on dark surfaces. Convey elevation by stepping surface lightness up ~4–8% per level.

```
Level 0  surface-base     #121212   (≈ 7% L)
Level 1  surface-raised   #1e1e1e   (≈ 12% L)
Level 2  surface-overlay  #2a2a2a   (≈ 16% L)
Level 3  (toasts/tooltips)#323232   (≈ 20% L)
```

**Tonal elevation (Material You):** tint each step slightly toward the brand/primary hue instead of pure gray, so higher surfaces feel cohesive with the brand.

```css
/* gray elevation */
--surface-raised: #1e1e1e;
/* tonal elevation — same lightness, faint primary tint */
--surface-raised: color-mix(in oklab, #1e1e1e 92%, var(--accent));
```

Keep a faint `1px` light-tinted border or a low-opacity shadow as a *secondary* cue, but lightness should be the primary signal.

## Accent desaturation recipe

Vivid light-mode accents vibrate and often fail contrast on dark.

```
For each accent, going light -> dark:
  1. Lower saturation by ~15-25%
  2. Raise lightness until it clears 4.5:1 on --surface-base (text) / 3:1 (UI)
  3. Re-check the accent-foreground pair too

Example (HSL):
  light --accent: hsl(217 91% 53%)
  dark  --accent: hsl(217 70% 65%)   // -21% sat, +12% light
```

`color-mix()` shortcut for a quick desaturated/lightened dark variant:

```css
--accent-dark: color-mix(in oklab, var(--accent) 70%, white);
```

## Token hygiene

- Components use only role tokens — never a literal hex, never `--blue-500`.
- Pair every background role with a foreground role (`--accent` + `--accent-foreground`) so contrast is designed, not accidental.
- Status colors (success/warning/danger) get the same desaturate-for-dark treatment.
