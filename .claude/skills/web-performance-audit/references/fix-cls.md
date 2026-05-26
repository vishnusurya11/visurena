# Fixing CLS (Cumulative Layout Shift)

**Good ≤ 0.1 at p75.** CLS sums *unexpected* layout shifts over the page's lifetime. CLS is layout-shift score = impact fraction × distance fraction, summed over the worst session window. The fix is always: **reserve space before content arrives, and never push existing content down.**

Use the **`web-vitals` attribution build** (`onCLS` → `largestShiftTarget`, `largestShiftTime`, `largestShiftValue`, `loadState`) to find the single biggest contributor — fix that first, don't micro-optimize tiny shifts.

## 1. Always give media intrinsic dimensions

```html
<!-- width/height let the browser compute aspect-ratio and reserve the box -->
<img src="photo.jpg" width="800" height="600" alt="…">
<video width="1280" height="720" poster="/poster.jpg"></video>
<iframe src="…" width="560" height="315"></iframe>
```

```css
/* For responsive/fluid media or embeds, reserve space with aspect-ratio */
.embed   { aspect-ratio: 16 / 9; width: 100%; height: auto; }
.avatar  { aspect-ratio: 1; width: 48px; }
img      { height: auto; }   /* keep aspect when width is constrained */
```

## 2. Kill font-swap reflow (biggest typography-driven CLS)

When a web font loads and replaces the fallback, differing metrics reflow text. Match the fallback's metrics to the web font:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-display: swap;
}
/* A fallback face tuned to occupy the SAME space as Inter */
@font-face {
  font-family: 'Inter-fallback';
  src: local('Arial');
  size-adjust: 107%;        /* scale glyphs so the box matches */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: 'Inter', 'Inter-fallback', sans-serif; }
```

Let tooling generate these overrides instead of hand-tuning:
- **Next.js `next/font`** automatically creates a metric-matched fallback (zero-CLS fonts).
- **fontaine** (Vite/Nuxt) and **Capsize** compute `size-adjust`/`ascent-override` for you.
See **web-typography-systems** for the full font-loading strategy.

## 3. Reserve space for late/async content (the #1 field-only CLS)

These load *after* first paint and shift everything below them — and they only show up in **field** data, never a single lab load:
- **Ads / sponsored slots:** wrap in a fixed-size container (`min-height`) sized to the largest expected creative.
- **Embeds** (tweets, YouTube, maps): give the container a known `aspect-ratio`/`min-height` before the script rewrites it.
- **Cookie/consent banners & modals:** render as `position: fixed` overlays so they don't reflow document content. Never inject them as a top-of-document block.
- **"You may also like" / related rails, infinite scroll:** reserve skeleton boxes of the final size.
- **Notifications/toasts:** `position: fixed`, never inline.

```css
.ad-slot { min-height: 280px; }     /* reserve before the ad arrives */
.cookie-banner { position: fixed; inset: auto 0 0 0; }  /* overlay, no reflow */
```

## 4. Never insert content above existing content

Adding a banner/alert *above* already-painted content pushes it down → shift. Instead: reserve the slot up front, or insert via a fixed/absolute overlay, or only inject in response to a user action near that spot.

## 5. Animate with transform/opacity only

```css
/* GOOD — compositor-only, no layout shift */
.card:hover { transform: translateY(-4px); }
/* BAD — animating layout properties shifts surrounding content */
.card:hover { top: -4px; margin-top: -4px; height: 110%; }
```

## 6. Skeletons must match final dimensions

A skeleton that's a different size than the loaded content just shifts twice. Size skeletons to the real content's box.

## Pitfalls
- Images without `width`/`height` (or CSS that overrides them without `aspect-ratio`).
- Web fonts with no metric-matched fallback → swap reflow.
- Late consent banner / ad / lazy section injected into document flow.
- Dynamically injected content above the fold (A/B test variants, promo bars).
- Animating `height`/`top`/`margin` instead of `transform`.
- Chasing 0.001 shifts — find the **largest** shift via attribution and fix that.

## Docs
- CLS — https://web.dev/articles/cls
- Optimize CLS — https://web.dev/articles/optimize-cls
- Font best practices / metric overrides — https://web.dev/articles/font-best-practices
- Next.js fonts — https://nextjs.org/docs/app/api-reference/components/font
- fontaine — https://github.com/unjs/fontaine
- aspect-ratio (MDN) — https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio
