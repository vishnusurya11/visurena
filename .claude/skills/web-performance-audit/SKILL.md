---
name: web-performance-audit
description: Hands-on workflow to measure, diagnose, and fix web performance, centered on Core Web Vitals (LCP, CLS, INP) plus TTFB. Use this skill when a page is slow, when auditing performance, when a Lighthouse/PageSpeed score is low, when chasing layout shift, slow loads, or laggy interactions, when setting up Real User Monitoring (RUM) with the web-vitals library, when analyzing JS bundle size, or when asked to "improve Core Web Vitals", "pass CWV", "fix LCP/CLS/INP", "speed up the site", or "reduce bundle size". Triggers on lab-vs-field debugging, Lighthouse, PageSpeed Insights, WebPageTest, Chrome DevTools Performance panel, CrUX, and bundle analyzers. Pairs with web-typography-systems (font-driven CLS/LCP), frontend-design and modern-web-design (perf budgets for motion/3D).
---

# Web Performance Audit

## Overview

A repeatable workflow to **measure → diagnose → fix → verify** web performance, anchored on Core Web Vitals. As of 2026 the three Core Web Vitals are:

| Metric | What it measures | Good (p75) | Needs improvement | Poor |
|--------|------------------|-----------|-------------------|------|
| **LCP** — Largest Contentful Paint | Loading | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| **CLS** — Cumulative Layout Shift | Visual stability | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **INP** — Interaction to Next Paint | Responsiveness | ≤ 200 ms | 200–500 ms | > 500 ms |

Plus the key diagnostic, not a Core Web Vital itself:

| Metric | What it measures | Good | Poor |
|--------|------------------|------|------|
| **TTFB** — Time to First Byte | Server/network response | ≤ 800 ms | > 1800 ms |

> **CRITICAL — INP replaced FID.** On **12 March 2024**, Interaction to Next Paint (INP) became a Core Web Vital and **First Input Delay (FID) was removed entirely**. If you see FID anywhere, the source is outdated. INP measures the latency of *all* interactions across the page lifecycle (not just the first), and breaks each into three phases: **input delay → processing duration → presentation delay**.

> **Pass condition:** Google evaluates at the **75th percentile (p75)** of real users. **All three** (LCP, CLS, INP) must be "good" at p75 — separately for **mobile and desktop** form factors — for a URL/origin to pass.

This is the *what* and *how* of fixing perf. For deep procedures see `references/`. For typography-driven shifts and font loading, compose with **web-typography-systems**; for keeping motion/3D within budget, compose with **modern-web-design** and **frontend-design**.

## The Audit Workflow (run in order)

1. **Field first.** Check real-user data (CrUX / `web-vitals` RUM / PageSpeed Insights "Discover what your real users are experiencing"). The field decides whether you pass — the lab only explains *why*.
2. **Reproduce in lab.** Run Lighthouse (mobile preset, throttled) and a WebPageTest run to get a filmstrip + waterfall.
3. **Identify the worst metric** at p75 in the field, then find its cause in the lab.
4. **Attribute it.** Use the `web-vitals` **attribution build** in the field, and the Chrome DevTools **Performance** panel locally, to pin the exact element / long task / shift.
5. **Fix one metric at a time** (fixes below). Re-measure in lab after each change.
6. **Verify in the field.** CrUX is a **28-day rolling** dataset — field improvements take weeks to appear. Don't declare victory on a lab score alone.

## Lab vs Field — the single most important distinction

- **Lab data** (Lighthouse, WebPageTest, DevTools): one synthetic load, one device, controlled throttling. **Reproducible, great for debugging.** But **INP and CLS can't be fully captured in a single load** — Lighthouse reports *TBT* (Total Blocking Time) as an INP proxy and only the load-time portion of CLS.
- **Field data / RUM** (CrUX, `web-vitals`): aggregated real users across devices, networks, and full sessions. **This is what Google ranks on.** INP and full-session CLS only exist here.
- **They diverge** because real users have slower devices, interact with the page (INP), trigger late shifts (cookie banners, lazy content), and hit warm/cold caches differently. **When lab and field disagree, trust the field for scoring and use the lab to investigate.** See `references/measuring.md`.

## Measuring — tool cheat sheet

| Tool | Type | Best for |
|------|------|----------|
| **PageSpeed Insights** (pagespeed.web.dev) | Field (CrUX) + Lab (Lighthouse) | One-stop URL check; shows both side by side |
| **Lighthouse** (DevTools tab / CLI / CI) | Lab | Reproducible scoring, opportunities, diagnostics |
| **Chrome DevTools → Performance** | Lab | Long tasks, flame chart, INP interaction trace, layout-shift culprits |
| **WebPageTest** (webpagetest.org) | Lab | Waterfall, filmstrip, multi-location/device, connection view |
| **`web-vitals` JS library** | Field/RUM | Capture LCP/CLS/INP/TTFB/FCP from your *own* users + attribution |
| **CrUX** (Dashboard / BigQuery / API) | Field | Origin-level historical trends, 28-day rolling p75 |

### Field/RUM with the `web-vitals` library (current: v5)

Install: `npm install web-vitals`. Standard build sends bare metrics; the **attribution build** (`web-vitals/attribution`, ~+1.5 KB brotli) adds the diagnostic data you need to actually fix things.

```js
// Standard build — minimal RUM
import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals';

function sendToAnalytics(metric) {
  // metric = { name, value, rating, delta, id, navigationType, entries }
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
  });
  // sendBeacon survives page unload; fall back to fetch keepalive
  (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
    fetch('/analytics', { body, method: 'POST', keepalive: true });
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
onFCP(sendToAnalytics);
```

```js
// Attribution build — tells you WHICH element/task/shift to fix
import { onINP, onLCP, onCLS } from 'web-vitals/attribution';

onINP(({ value, attribution }) => {
  // attribution: interactionTarget, interactionType, inputDelay,
  //              processingDuration, presentationDelay, loadState
  console.log('Slow interaction on', attribution.interactionTarget,
    'phases →', attribution.inputDelay, attribution.processingDuration,
    attribution.presentationDelay);
});

onLCP(({ value, attribution }) => {
  // attribution: target (the LCP element), url, timeToFirstByte,
  //              resourceLoadDelay, resourceLoadDuration, elementRenderDelay
  console.log('LCP element', attribution.target, 'TTFB', attribution.timeToFirstByte);
});

onCLS(({ value, attribution }) => {
  // attribution: largestShiftTarget, largestShiftTime, largestShiftValue, loadState
  console.log('Biggest shift from', attribution.largestShiftTarget);
});
```

Notes: callbacks fire once per page by default; pass `{ reportAllChanges: true }` to stream updates. Metrics are **re-reported with a new `id` after bfcache restore**, so always send by `id`, not once-per-page-load. Aggregate to **p75 per metric** to mirror Google. Full setup, dedup, and a Next.js `useReportWebVitals` example: `references/measuring.md`.

### Bundle analysis (JS is usually the INP/LCP root cause)

```bash
# Next.js — wrap config, then build with the flag
npm i -D @next/bundle-analyzer
ANALYZE=true npm run build      # opens client + server treemaps

# Vite / Rollup — visualizer plugin (sunburst/treemap/flamegraph)
npm i -D rollup-plugin-visualizer

# Any sourcemapped bundle — maps bytes back to your real source
npm i -D source-map-explorer
npx source-map-explorer 'dist/**/*.js'
```

Look for: duplicated deps, full-library imports (`import _ from 'lodash'` → `lodash-es` cherry-pick), moment/large date libs, and anything large that isn't above-the-fold. See `references/bundle-analysis.md`.

## Fixes by metric

### LCP — break it into 4 parts, attack the biggest

LCP ≈ **TTFB + resource load delay + resource load duration + element render delay**. Typically TTFB and load duration dominate.

```html
<!-- 1. NEVER lazy-load the LCP image. Mark it high priority instead. -->
<img src="/hero.webp" fetchpriority="high" width="1600" height="900"
     alt="…" decoding="async">  <!-- no loading="lazy" on the hero -->

<!-- 2. If the LCP image is referenced from CSS or discovered late, preload it -->
<link rel="preload" as="image" href="/hero.webp" type="image/webp" fetchpriority="high">

<!-- 3. Warm up cross-origin hosts (CDN, image host) early -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- 4. Preload critical fonts so text LCP isn't blocked -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

```jsx
// Next.js: use priority on the LCP <Image> (sets fetchpriority=high + preload, disables lazy)
import Image from 'next/image';
<Image src="/hero.webp" alt="…" width={1600} height={900} priority />
```

Other LCP wins: serve AVIF/WebP at the right size (`srcset`/`sizes`), cut **render-blocking CSS/JS** (inline critical CSS, defer the rest), reduce **TTFB** (CDN, edge cache, server timing), and set `font-display: swap` (or `optional`). Font tuning belongs to **web-typography-systems**. Deep dive: `references/fix-lcp.md`.

### CLS — reserve space, never inject layout late

```html
<!-- Always set intrinsic dimensions so the browser reserves the box -->
<img src="photo.jpg" width="800" height="600" alt="…">   <!-- → aspect-ratio is inferred -->
```

```css
/* Reserve space for media/embeds/ads with aspect-ratio */
.video-embed { aspect-ratio: 16 / 9; width: 100%; }

/* Kill font-swap reflow: match fallback metrics to the web font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  size-adjust: 105%;          /* tune so fallback ≈ web font box */
  ascent-override: 90%;
}
/* Or let the toolchain generate this: Next.js next/font, or fontaine/Capsize. */
```

Rules: reserve space for **ads, embeds, cookie banners, "you may also like" rails** *before* they load; never insert content **above existing content** (push it down → shift); animate with `transform`/`opacity`, never `top`/`height`/`margin`; toast/banner via `position: fixed`. Late banner/ad shifts are the #1 field-only CLS cause. Deep dive: `references/fix-cls.md`.

### INP — keep the main thread free during interactions

INP = **input delay + processing duration + presentation delay**. Almost always JS on the main thread.

```js
// Break up long tasks by yielding to the main thread between chunks.
// scheduler.yield() (Chrome) puts your continuation at the FRONT of the queue.
async function processInChunks(items) {
  for (const item of items) {
    doWork(item);
    if (navigator.scheduling?.isInputPending?.() || shouldYield()) {
      await yieldToMain();   // let queued input + paint run first
    }
  }
}

function yieldToMain() {
  if ('scheduler' in window && 'yield' in scheduler) {
    return scheduler.yield();              // best: front-of-queue continuation
  }
  return new Promise((r) => setTimeout(r, 0)); // fallback (back-of-queue)
}
```

```js
// Render the visual response NOW; defer non-urgent work to after paint.
button.addEventListener('click', () => {
  showSpinnerImmediately();                       // cheap, paints next frame
  requestAnimationFrame(() => {
    setTimeout(() => doExpensiveWork(), 0);        // off the interaction's critical path
  });
});
```

Other INP wins: **defer/lazy-load non-critical JS** (route-level `import()`, `dynamic()`), shrink **hydration cost** in SPAs (RSC/islands/partial hydration, hydrate-on-visible), avoid **layout thrashing** (batch DOM reads then writes), debounce expensive handlers, and move heavy compute to a **Web Worker**. React 18+: wrap non-urgent updates in `startTransition`. Deep dive: `references/fix-inp.md`.

### TTFB — the foundation under LCP

CDN + edge caching, cache HTML where possible, reduce redirects (each adds a round trip), use HTTP/2-3, stream HTML early, optimize DB/API on the critical path, and read **`Server-Timing`** headers to locate backend cost. See `references/fix-lcp.md` (TTFB section).

## Edge cases & pitfalls

- **Lab–field divergence:** a 100 Lighthouse score can still **fail CWV** in the field (INP/CLS from real interaction & late shifts aren't in a single load). Always confirm in CrUX. → `references/measuring.md`.
- **INP has no single culprit:** it's the worst-ish interaction across the *whole session*, not one element. You **must** use the attribution build / DevTools interaction trace to find it; guessing wastes time.
- **Third-party scripts** (analytics, tags, chat, embeds) dominate INP/LCP/TTFB and are easy to overlook. Audit them; load with `async`/`defer`, a facade, or a partytown-style worker. → `references/fix-inp.md`.
- **Late CLS** from cookie banners, consent modals, ads, and lazy-loaded sections only appears in the **field** — lab loads finish before they fire.
- **Hydration cost** in SPAs (Next/Nuxt/SvelteKit) creates long tasks right when users first interact → bad INP. Reduce client JS; prefer server components/islands.
- **CDN/caching effects:** cold vs warm cache changes TTFB/LCP dramatically; field p75 blends both. bfcache restores re-report metrics with a new `id` — don't double-count or drop them.
- **Mobile ≠ desktop:** thresholds are the *same* but mobile fails far more (slow CPU/network). **Audit mobile first**; Google scores form factors separately.
- **`will-change` / over-`transform`:** GPU layer overuse raises memory and can *hurt* INP/paint. Use sparingly.
- **CLS chasing rounding:** 0.1 is the line; a single late shift can blow it. Hunt the **largest** shift via attribution, don't micro-optimize tiny ones.

## References (load on demand)

- `references/measuring.md` — Lighthouse (CLI/CI/LHCI), DevTools Performance + INP trace, WebPageTest reading, full `web-vitals` RUM (dedup, Next.js `useReportWebVitals`), CrUX (Dashboard/API/BigQuery), lab-vs-field deep dive.
- `references/fix-lcp.md` — LCP 4-part breakdown, images (AVIF/WebP/`srcset`), `fetchpriority`/preload/preconnect, render-blocking removal, TTFB & `Server-Timing`, font impact.
- `references/fix-cls.md` — dimensions/`aspect-ratio`, font-fallback metric overrides (`size-adjust`/`ascent-override`, fontaine/Capsize), ad/banner/embed reservations, transform-only animation.
- `references/fix-inp.md` — long-task breakup, `scheduler.yield()` + polyfill, `isInputPending`, hydration/SPA cost, Web Workers, React `startTransition`, third-party script taming.
- `references/bundle-analysis.md` — `@next/bundle-analyzer`, `rollup-plugin-visualizer`, `source-map-explorer`, code-splitting/dynamic import recipes, dependency-diet checklist.

## Authoritative docs

- Web Vitals overview & thresholds — https://web.dev/articles/vitals
- LCP — https://web.dev/articles/lcp · optimize: https://web.dev/articles/optimize-lcp
- CLS — https://web.dev/articles/cls · optimize: https://web.dev/articles/optimize-cls
- INP — https://web.dev/articles/inp · optimize: https://web.dev/articles/optimize-inp · long tasks: https://web.dev/articles/optimize-long-tasks
- TTFB — https://web.dev/articles/ttfb
- `web-vitals` library — https://github.com/GoogleChrome/web-vitals
- Lighthouse — https://developer.chrome.com/docs/lighthouse/overview
- Chrome DevTools Performance — https://developer.chrome.com/docs/devtools/performance
- PageSpeed Insights — https://pagespeed.web.dev · CrUX — https://developer.chrome.com/docs/crux
- WebPageTest — https://docs.webpagetest.org
- `scheduler.yield()` — https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield
- MDN performance — https://developer.mozilla.org/en-US/docs/Web/Performance
