# Fluid Modular Scale — math & generation

## Modular scale basics
A modular scale multiplies a base size by a ratio repeatedly. Each step up = ×ratio, each step down = ÷ratio.

Common ratios:
| Name | Ratio |
|---|---|
| Minor third | 1.200 |
| Major third | 1.250 |
| Perfect fourth | 1.333 |
| Augmented fourth | 1.414 |
| Golden | 1.618 |

Tip: use a **larger ratio on desktop** and a **smaller ratio on mobile** so headings aren't oversized on small screens. Fluid type lets you interpolate between two scales (e.g. 1.2 mobile → 1.333 desktop).

## How `clamp()` produces fluid type
`clamp(MIN, PREFERRED, MAX)`:
- `MIN` — size at the smallest target viewport (use `rem`)
- `MAX` — size at the largest target viewport (use `rem`)
- `PREFERRED` — a line `y = mx + b` where `x` is the viewport: `b` (rem) + `m`·`100vw`

### Compute the slope by hand
Given a value that goes from `minSize` at `minVw` to `maxSize` at `maxVw` (all in px):

```
slope      = (maxSize - minSize) / (maxVw - minVw)
yIntercept = -minVw * slope + minSize
preferred  = (yIntercept / 16)rem + (slope * 100)vw
```

Example: body 16px @ 360px → 20px @ 1240px
```
slope      = (20 - 16) / (1240 - 360) = 0.004545
yIntercept = -360 * 0.004545 + 16 = 14.36px
=> clamp(1rem, 0.898rem + 0.4545vw, 1.25rem)
```

### JS generator
```js
function fluid(minPx, maxPx, minVw = 360, maxVw = 1240, root = 16) {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const yIntercept = -minVw * slope + minPx;
  const pref = `${(yIntercept / root).toFixed(3)}rem + ${(slope * 100).toFixed(3)}vw`;
  return `clamp(${(minPx / root).toFixed(3)}rem, ${pref}, ${(maxPx / root).toFixed(3)}rem)`;
}
// fluid(16, 20) -> "clamp(1.000rem, 0.898rem + 0.455vw, 1.250rem)"
```

## Recommended: use Utopia
Hand-math is error-prone for a full scale. **Utopia** (https://utopia.fyi/) generates a coherent fluid type *and* space scale from two viewport/ratio pairs and exports CSS custom properties. Workflow:
1. Set min viewport (e.g. 320–360) + min ratio (e.g. 1.2).
2. Set max viewport (e.g. 1240–1440) + max ratio (e.g. 1.333).
3. Pick number of steps up/down from base.
4. Export the `--step-*` custom properties into `:root`.

## Spacing from the same system
Derive spacing tokens from the scale so type and rhythm agree:
```css
:root {
  --space-2xs: clamp(0.5rem, 0.46rem + 0.18vw, 0.625rem);
  --space-s:   clamp(1rem, 0.93rem + 0.36vw, 1.25rem);
  --space-l:   clamp(2rem, 1.86rem + 0.71vw, 2.5rem);
}
```
Fluid space + fluid type means the whole layout breathes consistently across widths.
