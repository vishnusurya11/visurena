# Catalog Performance

Build-ready patterns for fast, smooth media-heavy catalogs. Code is illustrative
(React/Next-flavored) — adapt to the stack. **Visual styling is not here**:
posters/cards → `ui-ux-pro-max`/`frontend-design`, rail animation →
`gsap-scrolltrigger`/`motion-framer`, skeletons → `ui-styling`.

## Contents

1. [List & grid virtualization](#1-list--grid-virtualization)
2. [Infinite scroll vs pagination](#2-infinite-scroll-vs-pagination)
3. [Image pipeline (CDN, formats, srcset)](#3-image-pipeline)
4. [Loading priority: lazy vs fetchpriority](#4-loading-priority)
5. [LQIP, blur-up, skeletons](#5-lqip-blur-up-skeletons)
6. [Reserving space to kill CLS](#6-reserving-space-to-kill-cls)
7. [Core Web Vitals budgets & measurement](#7-core-web-vitals-budgets)

---

## 1. List & grid virtualization

**Why:** A 1,000-item catalog rendered fully = 1,000 DOM subtrees + 1,000 image
requests. Scroll FPS drops, INP spikes (the main thread is busy laying out nodes
nobody sees), memory balloons. Virtualization renders only the items in/near the
viewport, so cost is bounded by screen size, not catalog size.

**When to virtualize**
- DO virtualize: long browse grids, infinite feeds, search results, any list that
  can exceed ~50-100 items.
- DON'T virtualize: short fixed rails (a 10-15 card carousel), small filter lists.
  Virtualization adds complexity and can fight CSS scroll-snap — not worth it for
  small N.

**Library choice**
- `@tanstack/react-virtual` (v3, headless) — preferred for Visurena. One hook
  (`useVirtualizer`), you own all markup/styles, supports vertical, horizontal,
  **grid**, dynamic measurement, and window-scroll virtualization. Best fit for a
  responsive poster grid + horizontal rails.
- `react-window` — lightest weight, simplest API, great for uniform fixed-size
  rows/columns. Use when items are a known fixed size and you want minimal config.
- Avoid the older `react-virtualized` for new code (heavier, largely superseded).

**Grid virtualization with @tanstack/react-virtual** (compute columns from width,
virtualize rows):

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function PosterGrid({ items, columns, rowHeight }: GridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,   // poster height + gap
    overscan: 4,                     // render a few rows beyond viewport for smooth scroll
  });

  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((vRow) => (
          <div
            key={vRow.key}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              height: rowHeight,
              transform: `translateY(${vRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {Array.from({ length: columns }).map((_, c) => {
              const item = items[vRow.index * columns + c];
              return item ? <PosterCard key={item.id} item={item} /> : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- DO set `overscan` (3-5 rows) so scroll never reveals blank gaps.
- DO recompute `columns` on resize (breakpoint → column count) and feed it in.
- DON'T put heavy per-card effects inside virtualized rows that thrash on
  scroll; keep card render cheap. Card visuals/animation belong to other skills,
  but performance of the render path is yours.

---

## 2. Infinite scroll vs pagination

See the SKILL.md table for the decision. Implementation notes:

**IntersectionObserver sentinel** (the robust way — no scroll-event spam):

```tsx
function useInfiniteSentinel(onReach: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !enabled) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onReach(); },
      { rootMargin: '600px' }  // prefetch BEFORE the user hits the bottom
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onReach, enabled]);
  return ref;
}
// render <div ref={sentinelRef} /> after the last row + a skeleton block while fetching
```

- DO use a generous `rootMargin` (~600px) to prefetch the next page so content is
  ready before the user arrives — eliminates the "wait at the bottom" stutter.
- DO show skeleton placeholders for the incoming page (reserved height) so the
  sentinel doesn't cause a jump.
- DO keep paginated, shareable, crawlable URLs underneath (`?page=` or cursor) even
  with infinite scroll — preserves SEO and "share this page."
- DO provide a **"Load more"** button fallback and keep the **footer reachable**;
  pure auto-infinite traps users away from footer links.
- DON'T reset scroll position on append. DON'T let infinite scroll grow the DOM
  unbounded — combine with virtualization for very long feeds, or unmount
  far-offscreen pages.

**Pagination** for SEO-critical / "find page N" surfaces: real `<a href>` links
(crawlable), `rel="prev"/"next"` hints, and prefetch the next page on hover/visible.

---

## 3. Image pipeline

Images are usually **most** of catalog byte-weight. Win here = win everywhere.

**Format ladder:** AVIF → WebP → JPEG/PNG fallback. AVIF is smallest at quality;
WebP is the safe universal step up from JPEG; keep a fallback for ancient clients.

**Use an image CDN** for on-the-fly resize/format/quality — never hand-export every
size. Options: Cloudinary, imgix, or Next.js's built-in optimizer / `next/image`
(which can front a remote loader).

```
// imgix-style URL params
https://cdn.visurena.com/poster/inception.jpg?w=300&auto=format,compress&fit=crop
// Cloudinary-style transformations
https://res.cloudinary.com/visurena/image/upload/f_auto,q_auto,w_300/poster/inception.jpg
```
- `f_auto` / `auto=format` → CDN negotiates AVIF/WebP per client.
- `q_auto` / `auto=compress` → perceptual quality, smaller bytes.

**Responsive `srcset` + `sizes`** so each device downloads only what it displays:

```html
<img
  src="https://cdn.visurena.com/poster/x.jpg?w=300"
  srcset="
    https://cdn.visurena.com/poster/x.jpg?w=160 160w,
    https://cdn.visurena.com/poster/x.jpg?w=300 300w,
    https://cdn.visurena.com/poster/x.jpg?w=600 600w"
  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px"
  width="300" height="450"           /* ALWAYS set dimensions */
  loading="lazy" decoding="async" alt="Inception poster" />
```

**`next/image`** does srcset/sizes/format/lazy/blur for you — prefer it on Next:

```tsx
<Image
  src="/poster/x.jpg" width={300} height={450}
  sizes="(max-width: 640px) 45vw, 200px"
  placeholder="blur" blurDataURL={lqip}
  priority={isLcp}                    // ONLY the LCP image
  alt="…"
/>
```

- DO match `sizes` to the actual rendered width per breakpoint — wrong `sizes`
  silently downloads oversized images.
- DON'T scale a giant master image down with CSS; resize at the CDN.
- DON'T forget `width`/`height` — that's how the browser reserves space (CLS).

---

## 4. Loading priority

- **LCP image:** exactly one per screen (usually the hero / first visible poster).
  Mark it `fetchpriority="high"`, eager-load it (no `loading="lazy"`), and in Next
  use `priority`. DON'T lazy-load the LCP image — that's the #1 LCP regression.
- **Below the fold:** `loading="lazy"` so off-screen posters don't compete for
  bandwidth at load.
- **Everything else:** default priority. DON'T set `fetchpriority="high"` on the
  whole grid — it starves the LCP image and makes the page feel slower overall.
- **`decoding="async"`** on grid images keeps decode off the main paint path.
- Preconnect to the image CDN (`<link rel="preconnect" href="https://cdn…">`) to
  shave the first connection on LCP.

---

## 5. LQIP, blur-up, skeletons

Two complementary techniques; pick per surface.

- **LQIP / blur-up:** ship a tiny (~20px) blurred placeholder (base64 or a
  `?w=20&blur` CDN URL) that's instantly visible, then swap to the full image. Best
  for **hero and large posters** — feels premium, conveys the image's color/shape.
- **Skeletons:** neutral shimmer blocks sized to the final card. Best for **grids
  and rails** where you don't yet have per-item placeholders, and for the incoming
  page during infinite scroll. **Skeleton component styling defers to `ui-styling`.**

```tsx
// Blur-up swap
<img
  src={lqip}                                   // tiny, instant
  data-src={fullUrl}
  onLoad={(e) => { e.currentTarget.src = fullUrl; }}
  width={300} height={450} style={{ filter: 'blur(8px)' }}
/>
```
- DO size skeletons to the exact final dimensions — a mismatched skeleton causes
  CLS when the real card mounts.
- DON'T animate skeletons with layout-affecting properties; animate `opacity` /
  `background-position` only (cheap, no reflow).
- DON'T leave a skeleton up forever — wire a timeout → error/retry state.

---

## 6. Reserving space to kill CLS

CLS = content jumping after it appears. On catalog screens the target is **0**.

- DO give every poster a fixed `aspect-ratio` (e.g. `2 / 3` for movie posters) plus
  `width`/`height` so the box exists before bytes arrive.
- DO reserve height for rails, the incoming infinite-scroll page, ad/promo slots,
  and async badges/ratings.
- DO load web fonts with `font-display: swap` + a matched fallback metric to avoid
  text reflow shifting cards.
- DON'T insert content above already-visible content after load (e.g. a banner that
  pushes the grid down). DON'T animate layout-affecting properties on mount.

```css
.poster { aspect-ratio: 2 / 3; width: 100%; }   /* box reserved before image loads */
.rail   { min-height: 280px; }                   /* reserve rail height pre-data */
```

---

## 7. Core Web Vitals budgets

Targets (75th-percentile field data; INP replaced FID in March 2024):

| Metric | Good (budget) | Visurena sharper target |
|--------|---------------|--------------------------|
| **LCP** Largest Contentful Paint | ≤ 2.5s | ≤ 2.0s on hero/landing |
| **INP** Interaction to Next Paint | ≤ 200ms | ≤ 150ms on typeahead/filter |
| **CLS** Cumulative Layout Shift | ≤ 0.1  | **0** on catalog grids |

Levers, mapped to this doc:
- **LCP** → image pipeline (§3), priority/preconnect (§4), don't lazy-load hero.
- **INP** → virtualization (§1), cheap card renders, debounce/abort search
  (see search-discovery.md), avoid long main-thread tasks on scroll/type.
- **CLS** → reserve space everywhere (§6), set image dimensions (§3), font swap.

Measure, don't guess: Lighthouse / PageSpeed for lab, **field data** (CrUX,
`web-vitals` JS lib, RUM) for real INP/CLS, and DevTools Performance for INP
long-tasks. The house-style budget owner is
`../modern-web-design/references/award-winning-playbook.md` — defer to it for the
canonical numbers; this table is the catalog-screen application of them.

## Sources

- https://strapi.io/blog/frontend-performance-checklist
- https://www.debugbear.com/blog/nextjs-image-optimization
- https://web.dev/articles/vitals
- https://tanstack.com/virtual
