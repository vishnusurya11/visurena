# Applying a Theme — Concrete Patterns by Artifact Type

Every theme file in `themes/` exposes the same four-token palette plus a header/body font pair.
Map those tokens onto whatever artifact you are styling. The recommended mapping:

| Theme token (role)        | Light artifact         | Dark artifact          |
|---------------------------|------------------------|------------------------|
| Darkest color             | Body/heading text      | Page background        |
| Lightest color            | Page background        | Body/heading text      |
| Primary accent            | Links, buttons, bars   | Links, buttons, bars   |
| Secondary accent          | Highlights, dividers   | Highlights, dividers   |

> Never assign the same token to both text and its background. Always check contrast first
> (see `wcag-contrast.md`). The "Deep Navy/Cream" or "Charcoal/White" pairs are the safe
> text-on-background combos in most themes; the two accents are decorative, not body text.

---

## 1. HTML / landing page (CSS custom properties)

Define the theme once as CSS variables so a theme swap is a one-block edit. Example using
**Ocean Depths** (`#1a2332` / `#2d8b8b` / `#a8dadc` / `#f1faee`):

```html
<style>
  :root {
    --bg:        #f1faee; /* Cream  — page background      */
    --fg:        #1a2332; /* Navy   — body text            */
    --accent:    #2d8b8b; /* Teal   — links, buttons       */
    --accent-2:  #a8dadc; /* Seafoam— highlights, borders  */
    --font-head: "DejaVu Sans", "Segoe UI", system-ui, sans-serif;
    --font-body: "DejaVu Sans", system-ui, sans-serif;
  }
  /* Dark variant: invert bg/fg, keep accents */
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1a2332; --fg: #f1faee; }
  }
  body { background: var(--bg); color: var(--fg); font-family: var(--font-body); }
  h1, h2, h3 { font-family: var(--font-head); font-weight: 700; }
  a, .btn { color: var(--accent); }
  .btn-solid { background: var(--accent); color: var(--bg); }
  hr, .divider { border-color: var(--accent-2); }
</style>
```

To switch themes later, edit only the four hex values and two font names — nothing else.

## 2. Tailwind artifact (CDN config)

```html
<script>
tailwind.config = {
  theme: { extend: {
    colors: {
      bg:       '#f1faee', fg: '#1a2332',
      accent:   { DEFAULT: '#2d8b8b', soft: '#a8dadc' },
    },
    fontFamily: { head: ['"DejaVu Sans"','system-ui'], body: ['"DejaVu Sans"','system-ui'] },
  }},
};
</script>
<!-- usage: <h1 class="font-head text-fg"> ... <a class="text-accent"> -->
```

## 3. Slides / docs / reporting (generic style guide)

When the artifact is a slide deck, doc, or report (not raw CSS), apply the tokens as a
consistent rule set across every page/slide:

- Slide/page background: the lightest color (or darkest for a dark deck).
- Title text: darkest color, header font, bold.
- Body text: darkest color (or a slightly softer tint), body font.
- Section accents, chart series #1, key numbers, callout bars: primary accent.
- Secondary chart series, table zebra stripes, subtle dividers: secondary accent.
- Keep the palette to these four colors plus tints; do not introduce off-theme colors.

## 4. Charts / data viz

Order series by visual priority: primary accent → secondary accent → darkest neutral →
a desaturated tint of the accent. Never rely on color alone — add labels/patterns so the
chart survives grayscale printing and color-vision deficiency.

---

## Font fallbacks (important)

The theme fonts (DejaVu Sans/Serif, FreeSans/FreeSerif) are libre fonts commonly available
in PDF/slide rendering environments but **not guaranteed in browsers**. For web artifacts,
always supply a fallback stack and, ideally, load a close web-font equivalent:

| Theme font        | Web equivalent (Google Fonts) | Fallback stack                                  |
|-------------------|-------------------------------|-------------------------------------------------|
| DejaVu Sans       | "DejaVu Sans", Verdana        | `"DejaVu Sans", Verdana, system-ui, sans-serif` |
| DejaVu Serif      | "DejaVu Serif", Georgia       | `"DejaVu Serif", Georgia, serif`                |
| FreeSans          | Helvetica / Arial             | `"FreeSans", Helvetica, Arial, sans-serif`      |
| FreeSerif         | Times                         | `"FreeSerif", "Times New Roman", serif`         |

Always end font stacks with `system-ui, sans-serif` or `serif` so text never falls back to
an unreadable default.
