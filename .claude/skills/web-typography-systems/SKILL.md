---
name: web-typography-systems
description: "Design and implement robust web type systems — fluid type scales, modular scale ratios, optimal line length (measure), line-height & vertical rhythm, variable fonts, performant font loading, and CLS-free fallback metrics. Use when the user asks to set up typography, choose/pair fonts at the system level, build a type scale, fix tiny/huge or non-responsive text, fix layout shift caused by web fonts (CLS), self-host fonts, speed up font loading, handle variable fonts, or do multilingual/CJK/RTL type. For visual font-pairing options and palettes route to ui-ux-pro-max; for font-driven performance metrics see web-performance-audit; for overall aesthetic see frontend-design and modern-web-design."
---

# Web Typography Systems

Build a type system that scales fluidly, reads well at every width, loads fast, and never shifts the layout.

## When to use
- Establishing a project's type scale, font stack, and rhythm from scratch
- Text that is fixed-size, doesn't scale across breakpoints, or breaks the layout on mobile
- Web fonts causing layout shift (CLS), flashing (FOUT/FOIT), or slow LCP
- Adopting variable fonts, self-hosting, or subsetting
- Multilingual / CJK / RTL typography decisions

## When to skip
- You just need *which two fonts look good together* → use `ui-ux-pro-max` (font pairings) first, then come back here to systematize.
- A one-off single heading style with no system → inline CSS is fine.

## The four decisions of a type system

1. **Scale** — a modular scale generates every size from one ratio, so sizes feel harmonious instead of arbitrary.
2. **Measure** — line length of ~45–75 characters is the readability sweet spot (≈66 ideal for body).
3. **Rhythm** — line-height and vertical spacing derived from the scale, not hand-tuned per element.
4. **Delivery** — load the font without blocking render and without shifting layout.

## 1. Fluid type with `clamp()`

Stop using breakpoint jumps for type. One `clamp(min, preferred, max)` scales smoothly between viewport sizes:

```css
:root {
  /* clamp(MIN, fluid-with-vw, MAX) — vw term drives the scaling */
  --step--1: clamp(0.83rem, 0.78rem + 0.26vw, 0.96rem); /* small */
  --step-0:  clamp(1.00rem, 0.93rem + 0.36vw, 1.20rem); /* body  */
  --step-1:  clamp(1.20rem, 1.09rem + 0.55vw, 1.50rem);
  --step-2:  clamp(1.44rem, 1.28rem + 0.82vw, 1.88rem);
  --step-3:  clamp(1.73rem, 1.49rem + 1.20vw, 2.34rem);
  --step-4:  clamp(2.07rem, 1.73rem + 1.71vw, 2.93rem); /* display */
}

h1 { font-size: var(--step-4); }
h2 { font-size: var(--step-2); }
p  { font-size: var(--step-0); }
```

Rules of thumb: use `rem` for the min/max (respects user zoom), keep a `vw` component so it actually scales, and always cap with a max so display text doesn't get absurd on 4K. Generate exact values with **Utopia** (see references) rather than guessing the slope. Full modular-scale math and a generator snippet: `references/fluid-scale.md`.

## 2. Measure (line length)

```css
.prose { max-width: 66ch; }      /* ch ≈ width of "0"; 45–75ch is the band */
```

`ch` is approximate (it's the `0` glyph advance), so verify visually — for proportional fonts ~66ch usually renders ~60–70 actual characters. For multi-column, set measure per column, not on the container.

## 3. Line-height & vertical rhythm

```css
:root {
  --leading-tight: 1.1;   /* large display headings */
  --leading-snug:  1.25;  /* sub-headings */
  --leading-body:  1.6;   /* body — looser for long-form reading */
}
h1 { line-height: var(--leading-tight); }
p  { line-height: var(--leading-body); }

/* Spacing derived from the rhythm, applied between flow siblings */
.prose > * + * { margin-block-start: 1.5em; }
```

Tighter line-height as size grows; looser for body. Use `em`-based margins so spacing scales with the element's own size.

## 4. Variable fonts

One file, many weights/widths — fewer requests, smoother animation:

```css
@font-face {
  font-family: "Inter var";
  src: url("/fonts/Inter-roman.var.woff2") format("woff2") tech(variations);
  font-weight: 100 900;          /* declare the supported axis range */
  font-display: swap;
  font-style: normal;
}

:root { --weight-body: 420; --weight-bold: 680; }   /* any value in range */
strong { font-variation-settings: "wght" var(--weight-bold); }
/* Prefer the high-level property when available: */
strong { font-weight: 680; }
```

Use registered axes via standard properties where possible (`font-weight`, `font-stretch`, `font-style`, `font-optical-sizing`); reserve `font-variation-settings` for custom axes (e.g. `"slnt"`, `"opsz"`, `"GRAD"`).

## 5. Font loading — fast and shift-free

Two problems to solve: **don't block render** and **don't shift layout when the font swaps in**.

```html
<!-- Preload only the critical above-the-fold font, woff2, with crossorigin -->
<link rel="preload" href="/fonts/Inter-roman.var.woff2" as="font"
      type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: "Inter var";
  src: url("/fonts/Inter-roman.var.woff2") format("woff2");
  font-display: swap;            /* show fallback immediately, swap when ready */
}

/* Kill CLS: tune a fallback so it occupies the SAME space as the web font */
@font-face {
  font-family: "Inter-fallback";
  src: local("Arial");
  size-adjust: 107%;            /* match x-height/advance to the web font */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

body { font-family: "Inter var", "Inter-fallback", system-ui, sans-serif; }
```

Get the override numbers from the **Fontaine** tool or Capsize (don't eyeball them). Self-host woff2 and subset to the glyphs/languages you use — it's faster and more private than a font CDN. Details: `references/font-loading.md`.

A zero-download alternative for UI text is a **modern system font stack** (see references) — instant, no CLS, no request.

## 6. Multilingual / CJK / RTL
- CJK needs more line-height (≈1.7–1.8) and the fonts are large — subset aggressively, lazy-load non-Latin ranges with `unicode-range`.
- Use logical properties (`margin-block`, `padding-inline`, `text-align: start`) so RTL "just works".
- Set `lang` on `<html>` and on switched-language sections; some shaping/line-breaking depends on it.

## Edge cases & pitfalls
- **FOIT** (invisible text): caused by `font-display: block`/default with a slow font — use `swap` (or `optional` for non-critical) so text is never invisible.
- **CLS from swap**: the #1 font perf bug — always define fallback metric overrides (`size-adjust`/`ascent-override`) so fallback and web font occupy identical space.
- **Preloading too much**: preload only 1–2 critical fonts; preloading every weight delays everything (preload competes for bandwidth).
- **`ch` ≠ exact characters**: it's the `0` advance; verify measure visually, especially for condensed/wide faces.
- **Variable-font weight on body**: animating `wght` triggers reflow if it changes advance width — fine for accents, avoid on large blocks.
- **`px` for type**: breaks user zoom/accessibility — use `rem`.
- **Faux bold/italic**: if a weight/style isn't in the file the browser synthesizes an ugly one; declare `font-synthesis: none` to catch it in testing.
- **Google Fonts privacy/perf**: third-party CDN adds a connection + GDPR exposure — self-host for production.

## References (official)
- MDN — `font-display`: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
- MDN — `@font-face`: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
- MDN — Variable fonts guide: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide
- MDN — `size-adjust`: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust
- MDN — `font-variation-settings`: https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings
- MDN — logical properties: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values
- web.dev — Font best practices: https://web.dev/articles/font-best-practices
- web.dev — Optimize CLS from fonts: https://web.dev/articles/optimize-cls
- Utopia (fluid type/space calculator): https://utopia.fyi/
- Fontaine (auto fallback metrics): https://github.com/unjs/fontaine
- Capsize (text sizing/trim): https://github.com/seek-oss/capsize
- Modern Font Stacks (system fonts): https://modernfontstacks.com/
- Google Fonts: https://fonts.google.com/

_Last revised: 2026-05-23. Verify font metric numbers against your actual font files with Fontaine/Capsize._
