# Foundations — spacing, type, radius, elevation, motion, breakpoints, icons, a11y

The non-color systems. All of these are **tokens** too — same DTCG format, same
pipeline. Literals in components are still banned here.

## Contents
- [Spacing (8px base)](#spacing-8px-base)
- [Typography (modular scale)](#typography-modular-scale)
- [Radius](#radius)
- [Elevation (surface ramp + shadow)](#elevation-surface-ramp--shadow)
- [Motion](#motion)
- [Breakpoints](#breakpoints)
- [Iconography](#iconography)
- [Accessibility baked into tokens](#accessibility-baked-into-tokens)
- [Do / Don't](#do--dont)
- [Sources](#sources)

## Spacing (8px base)

8px base with a 4px sub-step. WHY a fixed scale: rhythm. Arbitrary margins create
visual jitter; a scale makes everything snap to a grid the eye trusts.

Scale: `0, 4, 8, 12, 16, 24, 32, 48, 64, 80`.

```json
{
  "space": {
    "0":  { "$type": "dimension", "$value": "0px" },
    "1":  { "$type": "dimension", "$value": "4px" },
    "2":  { "$type": "dimension", "$value": "8px" },
    "3":  { "$type": "dimension", "$value": "12px" },
    "4":  { "$type": "dimension", "$value": "16px" },
    "6":  { "$type": "dimension", "$value": "24px" },
    "8":  { "$type": "dimension", "$value": "32px" },
    "12": { "$type": "dimension", "$value": "48px" },
    "16": { "$type": "dimension", "$value": "64px" },
    "20": { "$type": "dimension", "$value": "80px" }
  }
}
```
Add intent-named semantic spacing where it clarifies use: `space-inline-md` (gap between
inline items), `space-stack-lg` (vertical rhythm), `space-section` (block padding).

## Typography (modular scale)

Modular scale ~**1.25** (major third). Don't ship loose font-size/line-height pairs —
ship **composite `typography` tokens** so a text style travels family + weight +
line-height + letter-spacing as one unit.

```json
{
  "font": {
    "family": { "sans": { "$type": "fontFamily", "$value": ["Geist", "Inter", "system-ui", "sans-serif"] } },
    "size": {
      "xs":  { "$type": "dimension", "$value": "12px" },
      "sm":  { "$type": "dimension", "$value": "14px" },
      "base":{ "$type": "dimension", "$value": "16px" },
      "lg":  { "$type": "dimension", "$value": "20px" },
      "xl":  { "$type": "dimension", "$value": "25px" },
      "2xl": { "$type": "dimension", "$value": "31px" },
      "3xl": { "$type": "dimension", "$value": "39px" }
    }
  },
  "text": {
    "body": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.sans}", "fontWeight": 400,
        "fontSize": "{font.size.base}", "lineHeight": 1.6, "letterSpacing": "0"
      }
    },
    "display": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.sans}", "fontWeight": 700,
        "fontSize": "{font.size.3xl}", "lineHeight": 1.1, "letterSpacing": "-0.02em"
      }
    }
  }
}
```
For font-pairing choices, defer to `ui-ux-pro-max`. This skill just enforces that the
chosen pairing lives in tokens as composites.

## Radius

Steps: `none, 6, 10, 14, 20, full`. Charcoal-premium = **medium radii (10–14)**, not
pill-everything. WHY: heavy rounding reads playful/cheap; medium radii read premium and
modern. Reserve `full` for avatars, chips, and icon buttons.

```json
{
  "radius": {
    "none":   { "$type": "dimension", "$value": "0px" },
    "sm":     { "$type": "dimension", "$value": "6px" },
    "md":     { "$type": "dimension", "$value": "10px" },
    "lg":     { "$type": "dimension", "$value": "14px" },
    "xl":     { "$type": "dimension", "$value": "20px" },
    "full":   { "$type": "dimension", "$value": "9999px" },
    "card":   { "$type": "dimension", "$value": "{radius.lg}" },
    "button": { "$type": "dimension", "$value": "{radius.md}" }
  }
}
```

## Elevation (surface ramp + shadow)

In charcoal dark, elevation reads primarily from a **lighter surface**, with shadow as a
subtle secondary cue (shadows are weak on dark backgrounds). Build a surface ramp by
nudging lightness up, and pair it with restrained shadow tokens.

Surface ramp (semantic, aliasing charcoal primitives): `color-bg-base` (L~0.16) →
`color-bg-elevated` (L~0.20) → `color-bg-overlay` (L~0.24).

```json
{
  "shadow": {
    "elevation-1": { "$type": "shadow", "$value": { "color": "#000000", "alpha": 0.30, "offsetX": "0px", "offsetY": "1px",  "blur": "2px",  "spread": "0px" } },
    "elevation-2": { "$type": "shadow", "$value": { "color": "#000000", "alpha": 0.35, "offsetX": "0px", "offsetY": "4px",  "blur": "12px", "spread": "-2px" } },
    "elevation-3": { "$type": "shadow", "$value": { "color": "#000000", "alpha": 0.40, "offsetX": "0px", "offsetY": "12px", "blur": "32px", "spread": "-8px" } }
  }
}
```
Rule of thumb: raise surface for *structural* elevation (cards, sheets), add shadow for
*floating* elements (popovers, menus). Don't stack both aggressively — it muddies the
charcoal.

## Motion

Tokenize durations and easings; never inline magic numbers. "Slightly animated" = short,
purposeful, optimized — not bouncy or long.

```json
{
  "duration": {
    "instant": { "$type": "duration", "$value": "75ms" },
    "fast":    { "$type": "duration", "$value": "150ms" },
    "normal":  { "$type": "duration", "$value": "200ms" },
    "slow":    { "$type": "duration", "$value": "300ms" },
    "slower":  { "$type": "duration", "$value": "500ms" }
  },
  "easing": {
    "standard":   { "$type": "cubicBezier", "$value": [0.2, 0, 0,   1] },
    "decelerate": { "$type": "cubicBezier", "$value": [0,   0, 0,   1] },
    "accelerate": { "$type": "cubicBezier", "$value": [0.3, 0, 1,   1] }
  }
}
```
- `standard` → most transitions (hover, color, transform in place).
- `decelerate` → **entrances** (element arrives, slows into place).
- `accelerate` → **exits** (element leaves, speeds away).
- **Always honor `prefers-reduced-motion`.** WHY: motion can trigger vestibular
  discomfort — and it's a baseline accessibility requirement, not a nicety.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
On mobile, gate animations with `AccessibilityInfo.isReduceMotionEnabled()`. For actual
animation implementation, defer to `motion-framer` / `gsap-scrolltrigger`; this skill
only defines the tokens they consume.

## Breakpoints

`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`. These match Tailwind's defaults, so
web utilities line up. Treat them as tokens too for documentation and any JS that needs
the values.

```json
{
  "breakpoint": {
    "sm":  { "$type": "dimension", "$value": "640px" },
    "md":  { "$type": "dimension", "$value": "768px" },
    "lg":  { "$type": "dimension", "$value": "1024px" },
    "xl":  { "$type": "dimension", "$value": "1280px" },
    "2xl": { "$type": "dimension", "$value": "1536px" }
  }
}
```

## Iconography

`lucide-react` (web) / `lucide-react-native` (mobile) — same icon set, same names, so
markup ports across platforms. Size from tokens; color via `currentColor` so icons
inherit the surrounding `--foreground`/`--accent`.

```json
{
  "icon": {
    "sm": { "$type": "dimension", "$value": "16px" },
    "md": { "$type": "dimension", "$value": "20px" },
    "lg": { "$type": "dimension", "$value": "24px" }
  }
}
```
Don't hardcode icon strokes to a hex — let `currentColor` carry the theme.

## Accessibility baked into tokens

A11y is a property of the **token system**, verified at build/review time, not eyeballed
per screen.

- Every surface/foreground pair (shadcn pairs) ≥ **4.5:1** for body text, ≥ **3:1** for
  large text and UI components — in **all** modes AND **all** verticals.
- Focus ring (`--ring`) ≥ **3:1** against its adjacent surface.
- Minimum touch target **44×44px** (mobile especially) — encode as a semantic size token.
- Set `color-scheme` per mode so native form controls/scrollbars render correctly.
- **Don't eyeball contrast.** Run a contrast check on every pair × mode × vertical
  matrix when accents change. A pair that passed on amber can fail on crimson.

## Do / Don't

- **Do** ship typography as composite `typography` tokens, not loose size/line pairs.
- **Don't** invent off-scale spacing/radii in a component "just this once."
- **Do** prefer lighter surfaces over heavier shadows for dark-mode elevation.
- **Don't** ship motion without a `prefers-reduced-motion` path.
- **Do** keep icon set, names, and size tokens identical across web and mobile.

## Sources

- Tailwind theme (spacing/type/breakpoints model) — https://tailwindcss.com/docs/theme
- Material 3 motion — easing & duration — https://m3.material.io/styles/motion/easing-and-duration
- Style Dictionary (token authoring) — https://styledictionary.com/
- DTCG composite types — https://www.designtokens.org/tr/
