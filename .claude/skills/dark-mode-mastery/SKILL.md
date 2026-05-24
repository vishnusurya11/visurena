---
name: dark-mode-mastery
description: "Strategy + implementation for excellent dark mode that is NOT just inverted colors. Covers semantic token mapping (map roles, don't flip raw colors), dark-mode contrast & legibility, elevation via lightness/surface tints instead of shadows, no-flash (FART) theming, accent desaturation, handling images/illustrations/shadows, and reduced pure-black on OLED. Use when the user asks to add dark mode, fix bad/inverted dark mode, theme toggle, system color-scheme sync, flash of wrong theme on load, dark mode looks washed out or low-contrast, OLED black smearing, or 'make dark mode actually good'. For the Tailwind v4 / shadcn CSS-variable plumbing and toggle wiring, route to the tailwind-theme-builder skill. For auditing the result, see web-accessibility-audit and design-auditor."
compatibility: claude-code-only
---

# Dark Mode Mastery

Great dark mode is a **separately designed theme**, not `filter: invert()`. This skill covers the design strategy and the real CSS/JS to ship it correctly. If you just need the Tailwind v4 + shadcn variable architecture and toggle component wired up, use **tailwind-theme-builder** — then come back here for the design decisions it doesn't make for you.

## The One Rule: Map Roles, Don't Flip Colors

Inverting raw colors (`#fff` → `#000`, brand blue → its complement) produces garish, low-legibility UIs. Instead, assign every color a **semantic role** and give that role a value per theme.

```
WRONG (raw flip):                  RIGHT (role mapping):
.dark { background: #000;          --surface-base:   light #ffffff / dark #121212
         color: #fff;              --text-primary:   light #1a1a1a / dark #e6e6e6
         --blue: #cc7700; }        --accent:         light #2563eb / dark #60a5fa (desaturated + lightened)
```

A token is a **role** (`--text-primary`, `--surface-raised`, `--border-subtle`, `--accent`), not a hue. Components reference roles only. Switching theme swaps the role values; component code never changes. See `references/token-mapping.md` for a full role table.

## Five Things Real Dark Mode Gets Right

1. **No pure black, no pure white.** Base surface ≈ `#121212` (Material's recommendation), body text ≈ `#e0e0e0`–`#f5f5f5` — never `#000`/`#fff`. Pure white text on pure black causes halation (text appears to bleed) and on OLED causes black smearing during scroll.
2. **Elevation via lightness, not shadow.** Shadows are nearly invisible on dark surfaces. Higher = lighter. Each elevation step raises surface lightness ~4–8% (optionally tinted toward the brand/primary hue — "tonal elevation", Material You). Keep a faint shadow/border only as a secondary cue.
3. **Desaturate + lighten accents.** A vivid light-mode accent vibrates painfully on dark and often fails contrast. Reduce saturation and raise lightness for the dark variant (e.g. `hsl(217 91% 53%)` → `hsl(217 70% 65%)`).
4. **Contrast still applies — both directions.** WCAG 2.2: body text ≥ 4.5:1, large/UI ≥ 3:1, against the *actual dark surface*. Don't let "softer" text drift below 4.5:1.
5. **No flash on load (FART).** Apply the theme in a blocking inline `<head>` script before first paint. Details below.

---

## Implementation

### 1. Opt into native dark UI with `color-scheme`

Set this first. It makes the browser render form controls, scrollbars, spellcheck underlines, and `system-color` keywords in the correct theme automatically — for free.

```css
:root { color-scheme: light dark; }            /* supports both; follows OS */
[data-theme="light"] { color-scheme: light; }  /* manual override */
[data-theme="dark"]  { color-scheme: dark; }
```

### 2. Define semantic tokens per theme (CSS custom properties)

```css
:root {
  /* surfaces step up in lightness for elevation */
  --surface-base:    #ffffff;
  --surface-raised:  #f7f7f8;
  --surface-overlay: #ffffff;
  --text-primary:    #1a1a1a;
  --text-secondary:  #525252;
  --border-subtle:   #e4e4e7;
  --accent:          #2563eb;   /* hsl(217 91% 53%) */
  --accent-foreground:#ffffff;
}

[data-theme="dark"] {
  --surface-base:    #121212;   /* not #000 */
  --surface-raised:  #1e1e1e;   /* +~lightness = "higher" */
  --surface-overlay: #2a2a2a;   /* modals/menus sit highest */
  --text-primary:    #e6e6e6;   /* not #fff */
  --text-secondary:  #a1a1aa;   /* keep >= 4.5:1 on --surface-base */
  --border-subtle:   #2e2e2e;
  --accent:          #7aa7f0;   /* desaturated + lightened */
  --accent-foreground:#0a0a0a;
}

body { background: var(--surface-base); color: var(--text-primary); }
```

Tailwind v4 / shadcn users: this exact role-per-theme pattern is what `tailwind-theme-builder` wires through `@theme inline`. Use that skill for the plumbing; keep these *role values* and the rules above.

### 3. Native `light-dark()` (no media query, no toggle JS)

If you only need OS-driven theming (no manual toggle), `light-dark()` is the leanest path. Baseline since May 2024 (widely available ~Nov 2026 — verify support for your audience). Requires `color-scheme`.

```css
:root { color-scheme: light dark; }
body {
  background: light-dark(#ffffff, #121212);
  color:      light-dark(#1a1a1a, #e6e6e6);
}
```

For a **manual toggle + persistence + system sync**, use the `data-theme` attribute approach (sections 2 + 4) instead — `light-dark()` only reacts to `color-scheme`, which is harder to flip per-user with persistence.

### 4. No-flash inline script (FART prevention) — REQUIRED for manual toggle

Put this **inline in `<head>`, before any CSS/stylesheet link**. It runs synchronously before first paint, so the page never renders the wrong theme. External JS or React effects run too late and flash.

```html
<head>
  <script>
    // Runs before paint. No FART. Keep it tiny and inline.
    (function () {
      try {
        var stored = localStorage.getItem('theme');           // 'light' | 'dark' | null
        var system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = stored || system;
      } catch (e) {
        // localStorage can throw in private mode / sandboxed iframes — fall back gracefully
        document.documentElement.dataset.theme = 'light';
      }
    })();
  </script>
  <!-- stylesheets come AFTER the script -->
  <link rel="stylesheet" href="/styles.css" />
</head>
```

### 5. Toggle + live system sync

```js
function setTheme(theme) {            // theme: 'light' | 'dark' | 'system'
  if (theme === 'system') {
    localStorage.removeItem('theme'); // forget preference -> follow OS again
    const sys = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = sys;
  } else {
    localStorage.setItem('theme', theme);
    document.documentElement.dataset.theme = theme;
  }
}

// Live-update only while the user is on "system" (no stored preference)
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
  }
});
```

Always offer three states — Light / Dark / **System** — not a two-way switch. A binary toggle silently desyncs from the OS.

---

## Handling Media & Effects in Dark Mode

| Asset | Problem in dark | Fix |
|---|---|---|
| Transparent PNG with dark linework | Invisible on dark surface | Ship a light-stroke variant via `<picture>` + `prefers-color-scheme`, or add a subtle backing chip |
| Logo / illustration baked on white | White rectangle glares | Provide an SVG/PNG dark variant; swap with `<picture media>` (see `references/images-and-effects.md`) |
| Photos | Full brightness feels harsh | Dim slightly: `filter: brightness(.85) contrast(1.05)` in dark only |
| Drop shadows | Nearly invisible | Replace with lighter surface (elevation) + optional `1px` light border |
| Vivid accent / chart colors | Vibrate, fail contrast | Desaturate + lighten the dark variants |

```html
<picture>
  <source srcset="/logo-dark.svg"  media="(prefers-color-scheme: dark)">
  <img    src="/logo-light.svg" alt="Acme">
</picture>
```

Note: `<picture media>` follows the *OS* preference, not your manual `data-theme`. For manual-toggle-aware swaps, switch the `src` in JS or use a CSS `background-image` keyed off `[data-theme="dark"]`.

---

## Edge Cases & Pitfalls

- **Flash of incorrect theme (FART):** Caused by applying theme in external JS / React `useEffect` (runs after paint). Fix: blocking inline `<head>` script (section 4). In Next.js, render it via `next-themes` or a `<Script strategy="beforeInteractive">` / raw script in the document head.
- **Pure-black smearing & halation on OLED:** `#000` background causes gray smear trails during scroll on OLED and makes white text halate. Use `#121212`-ish base and `#e6e6e6`-ish text. Reserve true black only for intentional full-bleed media.
- **Low-contrast desaturated accents:** Don't over-soften. Re-check every accent/text pair against its dark surface for ≥ 4.5:1 (text) / ≥ 3:1 (UI/large). See web-accessibility-audit to verify with tooling.
- **Form controls / native UI ignore your theme:** Symptom = white dropdowns, light scrollbars, black date-picker text on dark. Cause = missing `color-scheme`. Fix: set `color-scheme` on `:root` and per `[data-theme]` (section 1).
- **Images with white background:** A logo baked on white shows a glaring rectangle. Provide a transparent or dark-variant asset; don't rely on `invert`.
- **System-vs-manual desync:** A two-state toggle that only stores 'light'/'dark' stops following the OS. Always include a "System" option that removes the stored key (section 5).
- **Transparent PNGs with dark content:** Black icons/diagrams vanish. Provide light-stroke variants or render as `currentColor` SVG so they inherit `--text-primary`.
- **`light-dark()` + manual toggle confusion:** `light-dark()` reacts to `color-scheme` only. If you also flip a `data-theme` class, the two can disagree. Pick one source of truth — for persisted manual toggles, prefer the `data-theme` + custom-property approach.
- **`@media (prefers-color-scheme)` as the *only* mechanism:** Fine for OS-only theming, but offers no manual override and can't persist a user choice. Combine with the toggle for full control.

---

## Verification Checklist

- [ ] No `#000` background, no `#fff` body text in dark
- [ ] Every text/surface pair ≥ 4.5:1 (text) / 3:1 (large/UI) in dark — verify with tooling, not eyeballs
- [ ] Elevation reads as lighter surfaces, not just shadows
- [ ] Accents desaturated/lightened for dark and still pass contrast
- [ ] `color-scheme` set — form controls, scrollbars, date pickers themed
- [ ] No flash of wrong theme on hard refresh (test incognito + slow 3G)
- [ ] Three-state toggle (Light/Dark/System); System follows OS live
- [ ] Logos/illustrations/transparent PNGs have dark-safe variants
- [ ] Tested on an OLED device or with reduced brightness for smearing/halation

---

## Reference Files

- `references/token-mapping.md` — full semantic role table, light/dark values, elevation steps, accent desaturation recipe
- `references/no-flash-and-frameworks.md` — FART deep-dive, Next.js / next-themes / SSR cookie-hint patterns
- `references/images-and-effects.md` — `<picture>` swaps, currentColor SVG, photo dimming, shadow-to-elevation conversion

## Sibling Skills

- **tailwind-theme-builder** — Tailwind v4 + shadcn variable architecture, `@theme inline`, toggle component wiring
- **web-accessibility-audit** — run real contrast/a11y tooling against your dark theme
- **design-auditor** — rule-based check incl. "is my dark mode correct"

## Official Documentation

- MDN — `prefers-color-scheme`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- MDN — `color-scheme` property: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- MDN — `light-dark()`: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
- web.dev — `light-dark()` and color-scheme-dependent colors: https://web.dev/articles/light-dark
- web.dev — prefers-color-scheme / dark theme: https://web.dev/articles/prefers-color-scheme
- WCAG 2.2 — Contrast (Minimum) 1.4.3: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2 — Non-text Contrast 1.4.11: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Material Design — Dark theme (surfaces, elevation, #121212): https://m2.material.io/design/color/dark-theme.html
