# Contrast & Color Best Practices (WCAG 2.2 AA)

A theme is only "applied correctly" if the text is readable. Verify contrast **before**
finalizing any theme — including custom on-the-fly themes.

## The AA thresholds (WCAG 2.2, SC 1.4.3 / 1.4.11)

| What                                            | Minimum ratio |
|-------------------------------------------------|---------------|
| Normal body text vs background                  | **4.5 : 1**   |
| Large text (≥ 24px, or ≥ 18.66px bold)          | **3 : 1**     |
| UI components & graphics (borders, icons, focus)| **3 : 1**     |

Ratios are thresholds — do **not** round up. `4.49:1` fails the 4.5 requirement. Aim for AAA
(7:1) on long-form body text when you can. Logos/brand marks are exempt.

## How to check (no internet needed)

Compute relative luminance and the ratio yourself, or run this snippet:

```python
def _lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hexcolor):
    h = hexcolor.lstrip("#")
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126*_lin(r) + 0.7152*_lin(g) + 0.0722*_lin(b)

def contrast(fg, bg):
    l1, l2 = sorted([luminance(fg), luminance(bg)], reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

print(round(contrast("#1a2332", "#f1faee"), 2))   # Ocean Depths text-on-bg -> ~15.0 (AAA)
print(round(contrast("#2d8b8b", "#f1faee"), 2))   # Teal accent on Cream    -> ~3.0 (large text / UI only)
```

## Known low-contrast traps in the built-in themes

Several themes have accents that are decorative, **not** body-text safe. Use the dark color
for text and reserve these for fills/large text/UI:

- **Sunset Boulevard** — `Warm Sand #e9c46a` on cream is < 2:1. Use `Deep Purple #264653` for text.
- **Golden Hour** — `Mustard #f4a900` on beige is low. Use `Chocolate Brown #4a403a` for text.
- **Desert Rose** — `Dusty Rose #d4a5a5`/`Sand #e8d5c4` are too close. Use `Deep Burgundy #5d2e46` for text.
- **Tech Innovation** — `Neon Cyan #00ffff` on white fails badly (~1.2:1). It is a highlight on
  the dark `#1e1e1e` background only.
- **Arctic Frost** — `Silver #c0c0c0` and `Ice Blue #d4e4f7` are light-on-light; use `Steel Blue #4a6fa5` (bold/large) and dark text for body.

When in doubt, pair the theme's **darkest** color with its **lightest** color for text/background.

## Palette principles

- **60-30-10 rule** — ~60% dominant neutral (bg), ~30% secondary, ~10% accent. Accents pop
  because they are rare; don't flood a slide with the accent color.
- **One accent does the work** — use the primary accent for the single most important action
  or data point per view; the secondary accent is support only.
- **Don't encode meaning in hue alone** — ~8% of men have color-vision deficiency. Pair color
  with text, icon, shape, or position.
- **Tints/shades, not new hues** — need more steps? Lighten/darken the existing four colors
  rather than inventing off-palette colors.

## Dark mode

- Never use pure black `#000` for a dark background; `#121212`–`#1a1a1a` reduces halation and
  looks premium. Several themes already supply a near-black dark base (e.g. Tech Innovation
  `#1e1e1e`, Midnight Galaxy `#2b1e3e`).
- In dark mode, slightly **desaturate** bright accents so they don't vibrate against the dark
  field. Elevation = lighter surface, not heavier shadow.
- Re-check contrast after inverting — a pair that passes on light may fail on dark.
