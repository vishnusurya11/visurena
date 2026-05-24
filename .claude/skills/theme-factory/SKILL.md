---
name: theme-factory
description: Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.
license: Complete terms in LICENSE.txt
---

# Theme Factory Skill

A curated set of 10 professional color + font themes, plus a generator for custom themes,
that can be applied to any artifact (slides, docs, reports, HTML/landing pages, dashboards,
charts).

## When to use

Use this skill when:
- The user wants an existing artifact "themed", "styled", "branded", or given a consistent
  look (colors + fonts).
- The user names a mood/industry ("make these slides feel like a luxury brand") and wants a
  cohesive palette + type pairing rather than ad-hoc colors.
- You're producing a multi-page/multi-slide artifact and want one consistent visual system.

**Preset vs custom:**
- **Preset** — when one of the 10 themes fits the mood/audience. Fastest, contrast-vetted.
- **Custom (on-the-fly)** — when the user supplies brand colors, or no preset fits the brief.
  See `references/custom-themes.md`.

**Skip this skill when:**
- The repo already has a design system / token file / brand guide — follow that instead.
- The user wants a from-scratch, highly bespoke UI design (use `frontend-design` /
  `modern-web-design`).
- It's a code-only change with no visual styling involved.

## The 10 preset themes

| Theme | Mood | Best for |
|-------|------|----------|
| Ocean Depths | Calm maritime, navy/teal | Corporate, finance, consulting |
| Sunset Boulevard | Warm, vibrant orange/coral | Creative pitches, lifestyle, events |
| Forest Canopy | Grounded earth tones | Sustainability, outdoor, wellness |
| Modern Minimalist | Clean grayscale | Tech, architecture, data viz |
| Golden Hour | Warm autumnal | Hospitality, food, cozy lifestyle |
| Arctic Frost | Cool, crisp blues | Healthcare, clean tech, pharma |
| Desert Rose | Soft dusty tones | Fashion, beauty, weddings, interiors |
| Tech Innovation | Bold high-contrast blue/cyan | Startups, AI/ML, software launches |
| Botanical Garden | Fresh organic greens | Food, farm-to-table, natural products |
| Midnight Galaxy | Dramatic cosmic purples | Entertainment, gaming, luxury, creative |

Each is fully specified in `themes/<name>.md` (4-color palette with hex + roles, header/body
font pair, recommended use).

## Workflow

1. **Showcase** — Display `theme-showcase.pdf` so the user can see all themes visually.
   Do not modify it; just show it for viewing.
   - *Fallback if the PDF can't render* (no viewer / headless): summarize the table above and
     paste the palette swatches from the relevant `themes/*.md` files inline (color name +
     hex), or render small HTML swatches so the user can still choose.
2. **Select** — Ask which theme to apply. Get explicit confirmation. If nothing fits, offer to
   generate a custom theme (`references/custom-themes.md`).
3. **Read** — Load the chosen `themes/<name>.md` to get the exact hex codes and font pair.
4. **Apply** — Map the 4 tokens onto the artifact and apply consistently. See
   `references/applying-themes.md` for concrete per-artifact code (CSS variables, Tailwind
   config, slides/docs, charts).
5. **Verify contrast** — Confirm text/background hits WCAG AA before finishing
   (`references/wcag-contrast.md`). Fix any low-contrast pairing.

## Token-to-role mapping (quick version)

Each theme has: 1 dark anchor, 1 light neutral, 1 primary accent, 1 secondary accent.

- Text = dark anchor (on light) / light neutral (on dark). **Never** put accent-on-accent.
- Background = light neutral (light mode) / dark anchor (dark mode).
- Primary accent = links, CTAs, key data point, section bars.
- Secondary accent = highlights, dividers, zebra stripes, second chart series.

Full mapping table and copy-paste code: `references/applying-themes.md`.

## Best practices (must-follow)

- **WCAG 2.2 AA contrast**: 4.5:1 body text, 3:1 large text / UI. Verify, don't assume —
  several presets have decorative accents that fail as body text (see `wcag-contrast.md`).
- **60-30-10** color distribution; one accent does the heavy lifting.
- **Two font families max**; contrast heading vs body (don't pair two similar sans).
- **Dark mode**: use `#121212`–`#1a1a1a`, not pure black; desaturate bright accents.
- **Font fallbacks**: theme fonts (DejaVu/FreeSans) aren't guaranteed in browsers — always
  supply a fallback stack (`applying-themes.md`).
- **Don't encode meaning in color alone** (color-vision deficiency); add text/icon/shape.

## Edge cases & pitfalls

- **Theme clashes with existing content** — if the artifact already has hard-coded brand
  colors, charts, or images, the theme accents may collide. Flag it and either restyle those
  elements or pick a theme whose accents harmonize with the existing imagery.
- **Low-contrast palette chosen for body text** — e.g. Sunset Boulevard's Warm Sand or Desert
  Rose's Dusty Rose on a light background. Re-map: dark anchor for text, accent for fills/large
  text only.
- **Showcase PDF can't render** — use the fallback in step 1; never block on the PDF.
- **Two near-identical colors** (Desert Rose Sand vs Dusty Rose) — don't use both for
  adjacent surfaces; you'll lose the boundary. Add a tint/shade for separation.
- **Bright neon on light** (Tech Innovation cyan, Botanical marigold) — these are dark-mode /
  highlight colors; on light backgrounds they vanish.
- **Over-applying the accent** — flooding every element with the accent kills its impact.
- **Custom theme without contrast check** — always run the check in `wcag-contrast.md` before
  showing a generated theme.

## References

- WCAG 2.2 SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- WCAG 2.2 SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast
- WebAIM Contrast Checker (concept/tool): https://webaim.org/resources/contrastchecker/
- Google Fonts (web-font equivalents / pairing): https://fonts.google.com/
- MDN — `prefers-color-scheme` (dark mode): https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- Local: `references/applying-themes.md`, `references/wcag-contrast.md`, `references/custom-themes.md`
