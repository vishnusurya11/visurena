# Creating a Custom Theme On-the-Fly

When none of the 10 presets fit (brand colors supplied, niche mood, specific palette
requested), generate a new theme file that follows the **exact same structure** as the
presets so it slots into the existing apply workflow.

## Steps

1. **Derive 4 colors** from the user's input (brand colors, mood words, industry).
   Follow the role structure: 1 dark anchor, 1 light neutral, 1 primary accent, 1 secondary
   accent. If the user gives one brand color, build the rest around it (see palette
   principles below).
2. **Pick a font pair** following the pairing principles below.
3. **Verify contrast** of the dark/light text pair (`wcag-contrast.md`) before showing.
4. **Write the theme file** to `themes/<slug>.md` using the template.
5. **Show it for review** (palette swatches + sample heading/body), get confirmation, then
   apply per `applying-themes.md`.

## Template (mirror the presets exactly)

```markdown
# <Theme Name>

A <one-line mood/identity description>.

## Color Palette

- **<Name>**: `#xxxxxx` - <role, e.g. Primary dark / background>
- **<Name>**: `#xxxxxx` - <role>
- **<Name>**: `#xxxxxx` - <role>
- **<Name>**: `#xxxxxx` - <role>

## Typography

- **Headers**: <Font> Bold
- **Body Text**: <Font>

## Best Used For

<Comma-separated list of suitable contexts/industries.>
```

## Palette-building principles

- **Start from one seed color** and build a scheme:
  - *Analogous* (neighbors on the wheel) → calm, cohesive.
  - *Complementary* (opposite) → high energy; use the opposite as the rare accent only.
  - *Triadic* → vibrant but balanced.
- **Adjust in HSL/OKLCH**, not RGB: hold hue, vary lightness/saturation to get a coherent set.
- **Neutralize the bulk**: the dark anchor and light neutral should be near-neutral (low
  saturation) so the accents read as accents.
- **Always verify** the dark-vs-light pair hits 4.5:1; nudge lightness until it does.

## Font-pairing principles

- **Contrast the roles**: pair a characterful display/heading face with a clean, highly
  legible body face (serif heading + sans body, or geometric-sans heading + humanist-sans body).
- **Avoid pairing two similar sans** (e.g. two geometric sans) — it reads as a mistake.
- **Max two families** (plus weights). More than two looks unfinished.
- **Match the mood**: serif = editorial/trust/luxury; geometric sans = tech/modern; humanist
  sans = friendly/approachable.
- **Body legibility wins**: the body font must be comfortable at 16px+; never sacrifice it for
  a trendy display face.
- For web artifacts, supply a fallback stack (see `applying-themes.md`) and prefer fonts with a
  Google Fonts equivalent so they load in browsers.

## Worked example — "Vault" (fintech, supplied brand `#0F6FFF`)

```markdown
# Vault

A confident, trustworthy fintech theme anchored on a single electric-blue brand color.

## Color Palette

- **Ink**: `#0B1220` - Primary dark text / dark background
- **Cloud**: `#F7F9FC` - Light background / inverted text
- **Brand Blue**: `#0F6FFF` - Primary accent: CTAs, links, key data
- **Mint**: `#3BD9A8` - Secondary accent: positive states, highlights

## Typography

- **Headers**: Space Grotesk Bold
- **Body Text**: Inter

## Best Used For

Fintech dashboards, banking decks, SaaS pricing pages, investor reports.
```

(Ink-on-Cloud ≈ 17:1 AAA; Brand Blue-on-Cloud ≈ 3.6:1 — use for large text/UI/links, not
small body copy.)
