# Images, Illustrations, Shadows & Effects in Dark Mode

Dark mode breaks visuals that were designed only for light. Handle each asset type deliberately — never `filter: invert()` a whole page.

## Logos & illustrations baked on white

A logo flattened onto a white rectangle shows a glaring block on dark.

```html
<!-- OS-preference swap (follows the OS, not your manual toggle) -->
<picture>
  <source srcset="/logo-dark.svg"  media="(prefers-color-scheme: dark)">
  <img    src="/logo-light.svg" alt="Acme">
</picture>
```

**Manual-toggle-aware swap** (`<picture media>` only follows the OS): swap in JS, or use CSS backgrounds keyed off `data-theme`:

```css
.logo            { background-image: url('/logo-light.svg'); }
[data-theme="dark"] .logo { background-image: url('/logo-dark.svg'); }
```

## Inline SVG icons — use `currentColor`

The cleanest approach: author icons with `fill="currentColor"` / `stroke="currentColor"` so they inherit the text color token and theme automatically — no variant files.

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">…</svg>
```

```css
.icon { color: var(--text-primary); } /* icon follows the theme for free */
```

## Transparent PNGs with dark linework

Black diagrams/icons on a transparent PNG vanish on dark. Options, best first:
1. Re-export as `currentColor` SVG (auto-themes).
2. Ship a light-stroke PNG variant and swap as above.
3. Last resort: put it on a fixed light backing chip (`background:#fff; border-radius; padding`) so it stays legible in both themes.

## Photographs

Full-brightness photos feel harsh against a dark UI. Gently dim in dark only:

```css
[data-theme="dark"] img.photo { filter: brightness(.85) contrast(1.05); }
```

Keep it subtle (~10–15%). Respect `prefers-reduced-transparency`/user intent; never dim so far that detail is lost.

## Shadows → elevation

Box-shadows are nearly invisible on dark surfaces. Replace shadow-based depth with **lighter surfaces** (see token-mapping.md elevation steps) plus an optional hairline border.

```css
/* light: shadow conveys lift */
.card { background: var(--surface-raised); box-shadow: 0 1px 3px rgb(0 0 0 / .12); }

/* dark: lighter surface + faint light border conveys lift; shadow is secondary */
[data-theme="dark"] .card {
  background: var(--surface-raised);
  border: 1px solid rgb(255 255 255 / .06);
  box-shadow: 0 1px 2px rgb(0 0 0 / .4);   /* optional, weak */
}
```

## Borders & dividers

Light-mode dividers (`#e4e4e7`) disappear on dark. Use a low-opacity light border or the `--border-subtle` dark value (`~#2e2e2e`). For separation between adjacent surfaces, a 4–8% white border often reads better than a gray one.

## Gradients & glows

Bright gradients overpower dark UIs. Lower opacity and shift toward the surface hue. Glow/neon accents should be desaturated like other accents (see token-mapping.md) and used sparingly — they fatigue quickly on dark.

## Quick audit

- [ ] No logo/illustration renders as a white block
- [ ] Inline icons use `currentColor`
- [ ] Transparent-PNG line art is still visible
- [ ] Photos dimmed subtly (≤15%) in dark only
- [ ] Depth comes from surface lightness, not invisible shadows
- [ ] Dividers/borders visible on dark surfaces
