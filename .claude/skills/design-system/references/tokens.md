# Tokens — format, tiers, naming, OKLCH, compilation

The token layer is the contract every other layer depends on. Get this right and
theming, cross-platform, and accessibility fall out almost for free.

## Contents
- [DTCG token format](#dtcg-token-format)
- [The three tiers](#the-three-tiers)
- [Naming conventions](#naming-conventions)
- [OKLCH color](#oklch-color)
- [Worked example (primitive → semantic → component)](#worked-example)
- [Style Dictionary v4 config](#style-dictionary-v4-config)
- [Build outputs](#build-outputs)
- [Do / Don't](#do--dont)
- [Sources](#sources)

## DTCG token format

Author tokens as JSON in the **Design Tokens Community Group (DTCG / W3C)** format
(stable as of **v2025.10**). Tooling — Style Dictionary v4, Tokens Studio, Figma
Variables import — all speak it, so you stay portable.

A token is an object with:

- `$value` — **required**. The value, or an alias.
- `$type` — `color` | `dimension` | `fontFamily` | `fontWeight` | `duration` |
  `cubicBezier` | `number` | `shadow` | `typography` | etc. Set it on the token or
  inherit from the nearest parent group.
- `$description` — human note. Use it; future-you reads tokens out of context.

**Aliases** reference another token with curly braces: `"$value": "{color.primitive.charcoal.900}"`.

**Name rules:** a token/group name **cannot** start with `$` and **cannot** contain
`{`, `}`, or `.` (those are reserved for the syntax).

```json
{
  "color": {
    "primitive": {
      "amber": {
        "500": {
          "$type": "color",
          "$value": { "colorSpace": "oklch", "components": [0.78, 0.16, 75], "alpha": 1, "hex": "#f0a830" },
          "$description": "Stories accent base."
        }
      }
    }
  }
}
```

## The three tiers

Three layers, each aliasing the one below. This indirection is the whole point — it's
what lets a theme repaint the app by changing a handful of pointers.

| Tier | Named by | Examples | Aliases |
|---|---|---|---|
| **Primitive** | look / raw value | `charcoal-900`, `amber-500`, `space-4` | nothing (literal value) |
| **Semantic** | intent / role | `color-bg-base`, `color-text-primary`, `color-accent`, `radius-card` | a **primitive** |
| **Component** | component part | `button-primary-bg`, `card-bg`, `input-border` | a **semantic** |

**Hard rules (and why):**
- Semantic aliases primitive. Component aliases **semantic only**.
- **Never skip a tier.** A component pointing straight at a primitive (`button-bg →
  amber-500`) bypasses the semantic layer, so dark mode and per-vertical accents can't
  reach it. It will silently fail to re-theme.
- Keep semantic names **stable**. Themes change what they *point at*, not their names.

## Naming conventions

kebab-case, structured `category-property-variant-state`:

```
color-text-primary        color-bg-base          color-bg-elevated
color-text-muted          color-accent           color-accent-foreground
space-inline-md           radius-card            radius-button
shadow-elevation-1        shadow-elevation-2     duration-fast
easing-emphasized         font-size-lg           border-input
```

- Name semantic tokens for **WHY**, not hue. `color-text-muted`, not `color-gray-400`.
  WHY: when the palette shifts, the role name still tells the truth; a hue name lies.
- Encode **state** in the name when it matters: `color-accent-hover`, `border-ring-focus`.
- Keep the same name on web and mobile so engineers carry one mental model.

## OKLCH color

Author all colors in **OKLCH** — perceptually uniform, so equal lightness steps *look*
equally spaced, which makes a clean charcoal surface ramp and predictable contrast.
Components are `[lightness 0–1, chroma, hue°]`. Keep a `hex` fallback for tools/exports.

```json
"charcoal": {
  "950": { "$type": "color", "$value": { "colorSpace": "oklch", "components": [0.13, 0.01, 270], "alpha": 1, "hex": "#0d0e12" } },
  "900": { "$type": "color", "$value": { "colorSpace": "oklch", "components": [0.16, 0.01, 270], "alpha": 1, "hex": "#16181d" } },
  "800": { "$type": "color", "$value": { "colorSpace": "oklch", "components": [0.20, 0.01, 270], "alpha": 1, "hex": "#1e2127" } },
  "100": { "$type": "color", "$value": { "colorSpace": "oklch", "components": [0.96, 0.005, 270], "alpha": 1, "hex": "#f3f4f6" } }
}
```

Charcoal premium dark targets: `color-bg-base` ≈ L 0.16 (NOT pure black), elevated card
surface ≈ L 0.20, primary text ≈ L 0.96. Lift elevation by raising L slightly, not by
adding color.

## Worked example

`tokens/color.json` (primitive + semantic), `tokens/component.button.json` (component):

```json
{
  "color": {
    "semantic": {
      "bg":   { "base":     { "$type": "color", "$value": "{color.primitive.charcoal.900}" },
                "elevated": { "$type": "color", "$value": "{color.primitive.charcoal.800}" } },
      "text": { "primary":  { "$type": "color", "$value": "{color.primitive.charcoal.100}" },
                "muted":    { "$type": "color", "$value": "{color.primitive.charcoal.400}" } },
      "accent":            { "$type": "color", "$value": "{color.primitive.amber.500}" },
      "accent-foreground": { "$type": "color", "$value": "{color.primitive.charcoal.950}" }
    }
  }
}
```
```json
{
  "button": {
    "primary": {
      "bg":         { "$type": "color", "$value": "{color.semantic.accent}" },
      "foreground": { "$type": "color", "$value": "{color.semantic.accent-foreground}" }
    }
  }
}
```
Notice the chain: `button-primary-bg → color-semantic-accent → amber-500`. Swap
`color-semantic-accent` for one vertical and the button repaints — no component edit.

## Style Dictionary v4 config

ESM config. One source folder, two platform builds. `outputReferences: true` on the web
build is **essential** — it emits `var(--…)` references instead of resolved values, so
runtime theme switching (`.dark`, `[data-vertical]`) actually works.

```js
// packages/tokens/style-dictionary.config.js
import StyleDictionary from 'style-dictionary';

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    web: {
      transformGroup: 'css',
      buildPath: 'build/web/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: { outputReferences: true } // keep var() refs for runtime theming
      }]
    },
    native: {
      transformGroup: 'js',
      buildPath: 'build/native/',
      files: [
        { destination: 'tokens.ts',     format: 'javascript/es6' },
        { destination: 'tokens.d.ts',   format: 'typescript/es6-declarations' }
      ]
    }
  }
};
```
```jsonc
// packages/tokens/package.json (excerpt)
{ "scripts": { "build": "style-dictionary build --config style-dictionary.config.js" } }
```

## Build outputs

- **Web** → `build/web/tokens.css`: `:root { --color-semantic-bg-base: var(--color-primitive-charcoal-900); … }`.
  Import once in the app's global CSS, then expose via `@theme inline` (see
  `theming.md`).
- **Native** → `build/native/tokens.ts` + `tokens.d.ts`: typed JS objects consumed by
  NativeWind `vars()` and React Native Reusables components (see `cross-platform.md`).

Run `pnpm --filter tokens build` whenever tokens change; commit the JSON source, not
only the build output.

## Do / Don't

- **Do** keep `$description` on semantic tokens — it documents intent for both platforms.
- **Don't** edit `build/` by hand. It's generated; your change will be overwritten.
- **Do** put each category in its own file (`color.json`, `spacing.json`, `motion.json`)
  under `tokens/`; the glob picks them all up.
- **Don't** hardcode resolved hex values in component tokens — alias semantic so theming
  flows through.

## Sources

- Design Tokens Community Group — https://www.designtokens.org/
- DTCG format spec — https://www.designtokens.org/tr/
- Style Dictionary + DTCG — https://styledictionary.com/info/dtcg/
