# Font Loading & CLS Elimination

## Decision: self-host vs CDN vs system
| Option | Pros | Cons | Use when |
|---|---|---|---|
| **Self-host woff2** | Fastest, private, one origin | You manage files/subsetting | Production, brand fonts |
| Google Fonts CDN | Easy, cached | Extra connection, GDPR exposure | Prototypes |
| System font stack | Zero download, zero CLS | Limited brand control | UI text, perf-critical |

## `font-display` values
| Value | Behavior | Use for |
|---|---|---|
| `swap` | Fallback shown immediately, swaps when font loads | Most text (default choice) |
| `optional` | Brief block, then fallback; font only used if cached | Non-critical / body where swap shift is unwanted |
| `fallback` | Very short block then fallback; short swap window | Compromise |
| `block` | Up to 3s invisible text (FOIT) | Almost never — avoid |

## Preload only the critical font
```html
<link rel="preload" href="/fonts/Inter-roman.var.woff2" as="font"
      type="font/woff2" crossorigin>
```
- `crossorigin` is **required** for fonts even same-origin (fonts are fetched in CORS mode).
- Preload 1–2 fonts max (the above-the-fold ones). Over-preloading delays LCP.
- Don't preload fonts you set to `font-display: optional` unless cached.

## Eliminate CLS with fallback metric overrides
The web font and its fallback usually have different metrics, so when the swap happens the text reflows → layout shift. Fix by tuning a fallback `@font-face` to occupy the **same space**:

```css
@font-face {
  font-family: "Inter-fallback";
  src: local("Arial");
  size-adjust: 107%;        /* scale fallback glyphs to match x-height/advance */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: "Inter var", "Inter-fallback", system-ui, sans-serif; }
```

**Get the numbers, don't guess:**
- **Fontaine** (https://github.com/unjs/fontaine) auto-generates metric-matched fallbacks (built into Nuxt; Vite plugin available).
- **Capsize** (https://github.com/seek-oss/capsize) for precise text trimming/metrics.
- Next.js `next/font` does this automatically (it self-hosts and injects size-adjusted fallbacks).

## Subsetting
Ship only the glyphs you use:
- Latin-only site: subset to Latin + Latin-ext, drop the rest → often 60–80% smaller.
- Use `unicode-range` to split by script so the browser only downloads ranges actually rendered:
```css
@font-face {
  font-family: "Brand";
  src: url("/fonts/brand-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF;   /* Basic Latin + Latin-1 */
}
@font-face {
  font-family: "Brand";
  src: url("/fonts/brand-cyrillic.woff2") format("woff2");
  unicode-range: U+0400-04FF;   /* only fetched if Cyrillic is rendered */
}
```
- Tools: `glyphhanger`, `fonttools subset`, or `subfont`.

## Modern system font stack (zero-cost option)
```css
:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
               Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Menlo,
               Consolas, monospace;
}
```
See https://modernfontstacks.com/ for curated, character-rich stacks (Old Style, Humanist, Geometric, etc.) that need no download.

## Catch synthesized faces in testing
```css
* { font-synthesis: none; }  /* surfaces missing weights/italics as wrong, not faked */
```
