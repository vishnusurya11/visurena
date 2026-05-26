# Fixing LCP (Largest Contentful Paint)

**Good ≤ 2.5 s at p75.** The LCP element is the largest image, video poster, or block of text in the viewport during load.

## Break LCP into 4 sub-parts, fix the biggest

LCP = **TTFB + Resource Load Delay + Resource Load Duration + Element Render Delay**

| Sub-part | Typical share | Meaning | Levers |
|----------|---------------|---------|--------|
| **TTFB** | ~40% | First byte of HTML arrives | CDN, edge cache, server speed, fewer redirects |
| **Resource load delay** | <10% | Gap from TTFB until the LCP resource *starts* loading | preload, no lazy-load, early discovery |
| **Resource load duration** | ~40% | Time to download the LCP resource | smaller/next-gen images, compression, CDN |
| **Element render delay** | <10% | Resource done → element painted | remove render-blocking CSS/JS, font readiness |

Use the **`web-vitals` attribution build** (`onLCP` → `timeToFirstByte`, `resourceLoadDelay`, `resourceLoadDuration`, `elementRenderDelay`, `target`, `url`) to see which sub-part dominates *for real users* before optimizing.

## Image LCP (the common case)

```html
<!-- NEVER lazy-load the LCP image. Mark it high priority. -->
<img src="/hero-1600.webp"
     srcset="/hero-800.webp 800w, /hero-1600.webp 1600w, /hero-2400.webp 2400w"
     sizes="(max-width: 768px) 100vw, 60vw"
     width="1600" height="900" alt="…"
     fetchpriority="high" decoding="async">
<!-- note: no loading="lazy" on the hero -->
```

```html
<!-- If the LCP image is set via CSS background or discovered late, preload it -->
<link rel="preload" as="image" href="/hero-1600.webp" type="image/webp"
      fetchpriority="high"
      imagesrcset="/hero-800.webp 800w, /hero-1600.webp 1600w"
      imagesizes="(max-width: 768px) 100vw, 60vw">
```

Image checklist:
- Serve **AVIF** then **WebP** with JPEG fallback via `<picture>`; AVIF is usually smallest.
- Size to the rendered box — don't ship a 3000px image into a 600px slot.
- Always set `width`/`height` (also prevents CLS — see fix-cls.md).
- Compress aggressively; use a CDN/image service (Next/Image, Cloudinary, imgix) for auto-format + resize.

```jsx
// Next.js: priority sets fetchpriority=high, preloads, and disables lazy-loading.
import Image from 'next/image';
<Image src="/hero.webp" alt="…" width={1600} height={900} priority sizes="(max-width:768px) 100vw, 60vw" />
```

## Text LCP

If the LCP element is text, the blocker is usually **fonts** or **render-blocking CSS**:
- Preload the critical font: `<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>`
- `font-display: swap` (text shows in fallback immediately) or `optional`.
- Subset fonts; self-host WOFF2. Full font strategy: see **web-typography-systems**.

## Remove render-blocking resources (cuts render delay)

- **Inline critical CSS** for above-the-fold; load the rest with `media`/`onload` swap or split.
- `defer` (or `type="module"`) all scripts; `async` only for independent ones.
- Drop unused CSS/JS; code-split (see bundle-analysis.md).

## Warm up connections early

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="dns-prefetch" href="https://cdn.example.com">
```
Preconnect to the origin serving the LCP resource and to critical font hosts. Don't preconnect to many hosts — each costs a connection.

## Reduce TTFB (the foundation)

- **CDN + edge caching**; cache full HTML where the page allows (SSG/ISR).
- Cut **redirect chains** — each redirect adds a round trip before HTML even starts.
- HTTP/2 or HTTP/3; enable compression (brotli).
- **Stream HTML** early (flush `<head>` so the browser starts discovering resources sooner).
- Optimize DB/API calls on the critical render path; cache them.
- Add **`Server-Timing`** headers and read them in DevTools/RUM to localize backend cost:
  ```
  Server-Timing: db;dur=53, render;dur=12, cache;desc="hit"
  ```

## Pitfalls
- Lazy-loading the hero image (the single most common LCP regression).
- A late-discovered LCP image (set via JS or CSS background) with no preload.
- `fetchpriority="high"` on too many images — dilutes the signal.
- Carousels/sliders: the first visible slide may be the LCP element — don't lazy-load it.
- Client-rendered hero: the LCP element doesn't exist until JS runs → huge render delay. Server-render the hero.

## Docs
- LCP — https://web.dev/articles/lcp
- Optimize LCP — https://web.dev/articles/optimize-lcp
- fetchpriority — https://web.dev/articles/fetch-priority
- Preload / preconnect — https://web.dev/articles/preload-critical-assets , https://web.dev/articles/preconnect-and-dns-prefetch
- TTFB — https://web.dev/articles/ttfb
- Next.js Image — https://nextjs.org/docs/app/api-reference/components/image
