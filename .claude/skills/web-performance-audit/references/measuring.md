# Measuring: lab, field, and RUM

The golden rule: **the field decides whether you pass; the lab tells you why.** Set up both.

## Lab vs field — full picture

| Dimension | Lab (synthetic) | Field (RUM / CrUX) |
|-----------|-----------------|--------------------|
| Source | One simulated load on one device | Aggregated real users |
| Reproducible? | Yes | No (it's a distribution) |
| Used for Google ranking? | No | **Yes (p75)** |
| INP measurable? | No — proxied by **TBT** (Total Blocking Time) | Yes (real interactions) |
| CLS measurable? | Only load-time portion | Full session, incl. late shifts |
| Best for | Debugging, CI gates, reproducing | Truth, prioritization, verifying fixes |

**Why they diverge:** real users run slower CPUs and networks, *interact* with the page (the only way INP exists), trigger late shifts (cookie/consent banners, ads, lazy sections), and hit cold vs warm caches. A perfect Lighthouse score routinely co-exists with a failing field INP. When they disagree: **trust the field for scoring, use the lab to investigate.**

## PageSpeed Insights (start here)

`https://pagespeed.web.dev` — paste a URL. It shows, side by side:
- **"Discover what your real users are experiencing"** = CrUX field data (the part that ranks). Toggle Mobile/Desktop.
- **"Diagnose performance issues"** = a live Lighthouse lab run with opportunities/diagnostics.
If the field card says "not enough data," the origin lacks CrUX volume — rely on your own `web-vitals` RUM instead.

## Lighthouse (lab)

Three ways to run:
- **DevTools → Lighthouse tab** — pick *Mobile* + *Performance*, *Navigation* mode, click Analyze.
- **CLI:** `npm i -g lighthouse && lighthouse https://example.com --view --preset=desktop` (omit preset for mobile default).
- **CI (LHCI):** `npm i -D @lhci/cli && lhci autorun` with a `lighthouserc.js` asserting budgets — gate PRs on regressions.

Read it in this order: **field-vs-lab note at top → metrics (LCP/CLS/TBT) → "Opportunities" (est. savings) → "Diagnostics."** Remember TBT is the INP proxy; a high TBT predicts INP pain.

Tips: always test **mobile first** (slow 4G + 4× CPU throttle is the default for a reason); run 3× and take the median (variance is real); test a **production** build, not dev.

## Chrome DevTools — Performance panel (deep lab diagnosis)

1. Open **Performance**, enable **Screenshots** + (optionally) **Web Vitals** lane.
2. Throttle: **CPU 4× slowdown**, **Network Slow 4G**.
3. Record a load (reload button in the panel) — or record while you **click/type** to capture a real interaction for INP.
4. Read:
   - **LCP / FCP / CLS markers** in the Timings/Web Vitals lane.
   - **Long tasks** (red-corner blocks > 50 ms) in the Main thread flame chart — these cause INP and TBT. Click one to see the call stack.
   - **Layout Shift** entries in the Experience lane — hover to highlight the shifted element.
   - **Interactions** track (modern Chrome) — shows each interaction's input delay / processing / presentation breakdown.

The DevTools **Performance insights** / Lighthouse panel will also name the LCP element directly.

## WebPageTest (lab, richer than Lighthouse)

`https://www.webpagetest.org` — choose a real location + device + connection. Value:
- **Waterfall** — request-by-request timing; spot render-blocking resources, slow TTFB, late-discovered LCP image, third-party stalls.
- **Filmstrip / video** — *visually* see when LCP paints and when shifts happen.
- **Connection view** — DNS/connect/TLS/TTFB per host.
- Run multiple times; WPT reports the median run.

## Field/RUM with the `web-vitals` library (v5)

Install: `npm install web-vitals`. Capture metrics from your *own* users — the only way to get INP and full-session CLS for *your* traffic, and essential when CrUX has no data.

```js
// rum.js
import { onCLS, onINP, onLCP, onTTFB, onFCP } from 'web-vitals/attribution';

const queue = new Set();
function addToQueue(metric) { queue.add(metric); }

function flushQueue() {
  if (!queue.size) return;
  const body = JSON.stringify([...queue].map((m) => ({
    name: m.name, value: m.value, rating: m.rating, delta: m.delta,
    id: m.id, navigationType: m.navigationType,
    attribution: m.attribution,   // the actionable part
  })));
  (navigator.sendBeacon && navigator.sendBeacon('/rum', body)) ||
    fetch('/rum', { body, method: 'POST', keepalive: true });
  queue.clear();
}

[onCLS, onINP, onLCP, onTTFB, onFCP].forEach((fn) => fn(addToQueue));

// Flush when the page is hidden/unloaded (most reliable point).
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushQueue();
});
```

Key behaviors to handle:
- **bfcache:** after back/forward-cache restore, metrics are **re-reported with a new `id`**. Send by `id` and dedupe server-side; never assume one metric per page load.
- **`reportAllChanges: true`** streams every change (more events) vs the default single final report — use only if you need live updates.
- **INP `durationThreshold`** defaults to 40 ms; lower it to catch more interactions, raise to reduce noise.
- **Aggregate to p75 per metric, per form factor** server-side to mirror Google's scoring.

### Next.js helper

```js
// app/_components/web-vitals.js  ('use client')
'use client';
import { useReportWebVitals } from 'next/web-vitals';
export function WebVitals() {
  useReportWebVitals((metric) => {
    navigator.sendBeacon?.('/rum', JSON.stringify(metric));
  });
  return null;
}
```

## CrUX (Chrome User Experience Report)

Origin/URL-level *real* field data, the basis of Google's CWV assessment. It's a **28-day rolling** dataset reported at **p75** — so fixes take weeks to show.
- **PageSpeed Insights** surfaces it per URL.
- **CrUX Dashboard** (Looker Studio template) — historical trends per origin.
- **CrUX API** — programmatic p75 for a URL/origin: `https://developer.chrome.com/docs/crux/api`.
- **CrUX on BigQuery** — monthly histograms for large-scale analysis.

Coverage caveat: low-traffic URLs/origins won't have CrUX data — that's exactly when your own `web-vitals` RUM matters.

## Verifying a fix

1. Confirm in the **lab** the targeted metric improved (re-run Lighthouse/WPT/DevTools).
2. Ship to production.
3. Watch your **RUM p75** drop within days.
4. Confirm in **CrUX** over the following weeks (28-day rolling lag). Only then is it "passing."

## Docs
- Vitals — https://web.dev/articles/vitals
- Lighthouse — https://developer.chrome.com/docs/lighthouse/overview
- LHCI — https://github.com/GoogleChrome/lighthouse-ci
- DevTools Performance — https://developer.chrome.com/docs/devtools/performance
- WebPageTest — https://docs.webpagetest.org
- web-vitals — https://github.com/GoogleChrome/web-vitals
- CrUX — https://developer.chrome.com/docs/crux
- PageSpeed Insights — https://pagespeed.web.dev
