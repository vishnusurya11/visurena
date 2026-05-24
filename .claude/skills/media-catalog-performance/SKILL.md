---
name: media-catalog-performance
description: >-
  Make media- and image-heavy catalog UIs (browse grids, carousels, infinite
  feeds) fast and smooth: list/grid virtualization (react-window /
  @tanstack/react-virtual), infinite scroll vs pagination, responsive images
  (srcset/sizes, AVIF/WebP) via an image CDN, lazy/priority loading,
  LQIP/skeletons, and Core Web Vitals budgets (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1).
  Also owns search & discovery UX on those screens — instant/typeahead search,
  faceted filters, recommendation rails ("trending", "because you watched"), and
  empty/zero-result states. Use when building Visurena catalog browse, search,
  feed, or discovery pages for movies/music/games/stories, when wiring an image
  pipeline or pagination, or when a media-heavy grid/carousel is slow or janky
  (low FPS scroll, layout shift, slow LCP, sluggish typing). Card/poster
  aesthetics defer to ui-ux-pro-max / frontend-design; rail and reveal animation
  defer to gsap-scrolltrigger / motion-framer; skeleton component styling defers
  to ui-styling; screen/IA patterns come from entertainment-platform-ui.
---

# Media Catalog Performance & Discovery

Owns the **performance + discovery behavior** of media-heavy catalog, browse, feed,
and search screens for **Visurena** (movies, music, games, stories). Make them
**fast and smooth**, and make finding content effortless. Visual treatment is
**out of scope** — defer to the skills in the routing table.

North-star: premium **charcoal dark, lightly animated, dynamic + optimized** AI
entertainment hub. "Dynamic" must never cost "optimized" — performance is the floor.

## When to use

- Building a browse grid, carousel/rail, infinite feed, or search results page.
- Wiring an image pipeline (CDN, srcset, AVIF/WebP, lazy/priority).
- Choosing infinite scroll vs pagination, or adding load-more behavior.
- A media grid/carousel is **slow or janky**: low-FPS scroll, layout shift, slow
  LCP, sluggish typing in search, high memory on big catalogs.
- Designing search, faceted filters, recommendation rails, or empty/zero states.

## Decision framework

Decide in this order. Each step has a hard rule — do not skip ahead.

1. **Reserve space first, always.** Every image, card, and rail gets explicit
   dimensions / aspect-ratio before data loads. CLS target is **0** on catalog
   screens (budget ≤0.1). This is non-negotiable and prevents the most common
   "premium" feel killer: content jumping as posters load.
2. **Virtualize anything long.** If a list/grid can exceed ~50-100 visible-ish
   items (most catalogs), render only what's in/near the viewport with
   `@tanstack/react-virtual` (headless, grid+window) or `react-window` (simple
   fixed-size). Big INP / memory / scroll-FPS wins. Short, fixed rails (a 10-card
   carousel) do **not** need virtualization — don't over-engineer.
3. **Pick the right loading model** (see table below): infinite scroll for
   discovery feeds, pagination for SEO/"find a specific page" surfaces. Always
   keep the footer reachable.
4. **Optimize images** — they dominate catalog weight. Responsive `srcset`/`sizes`,
   AVIF→WebP→fallback through an image CDN, `fetchpriority="high"` on the **one**
   LCP image, `loading="lazy"` below the fold, LQIP/blur-up or skeleton while
   loading.
5. **Make discovery fast and forgiving.** Typeahead with debounce + abortable
   requests, faceted filters with active-filter chips, recommendation rails,
   and a designed **zero-result** state with suggestions.
6. **Hold the budget.** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (sharper on hero: LCP
   ≤2.0s, CLS 0). Measure before claiming "fast."

### Infinite scroll vs pagination

| Use infinite scroll when…             | Use pagination when…                          |
|---------------------------------------|-----------------------------------------------|
| Open-ended discovery feed / "for you" | SEO-critical pages (crawlable, indexable URLs)|
| Casual browsing, no target item       | User needs to "find page N" or share a page   |
| Mobile-first, lean-back consumption    | Catalogs where footer/links must be reachable |
| Engagement > navigability             | Comparison / "I'll come back to item 47"      |

- **Hybrid default for Visurena browse:** infinite scroll with a manual
  **"Load more"** fallback button + a reachable footer, backed by paginated,
  shareable URLs (`?page=` / cursor). Best of both.
- Always: IntersectionObserver sentinel, skeleton placeholders, prefetch next page.

## Do / Don't (perf essentials)

- DO set explicit width/height or `aspect-ratio` on every poster. DON'T let images
  size themselves — that ships layout shift.
- DO virtualize long grids/feeds. DON'T render 1,000 hidden cards "for smooth
  scroll" — it tanks INP and memory.
- DO mark exactly one LCP image `fetchpriority="high"` and eager. DON'T priority-load
  a whole grid — it starves the LCP image and slows everything.
- DO lazy-load below-the-fold images. DON'T lazy-load the hero/LCP image.
- DO serve AVIF/WebP at the right size via a CDN. DON'T ship one giant JPEG scaled
  down in CSS.
- DO debounce + abort typeahead requests. DON'T fire a request per keystroke and
  let stale responses overwrite fresh ones.
- DO design empty/zero-result/error states with suggestions. DON'T leave a blank
  grid — it reads as broken.
- DO let virtualization/perf own the grid; let other skills own the card's look.
  DON'T reinvent poster styling or rail animation here.

## Routing table

| Need                                                | Go to |
|-----------------------------------------------------|-------|
| Virtualization, infinite scroll vs pagination, image CDN pipeline, srcset/sizes, AVIF/WebP, lazy/priority, LQIP/skeletons, CLS, CWV budgets | `references/catalog-performance.md` |
| Typeahead/instant search, faceted filters, recommendation rails, empty/zero/error states, keyboard nav, search engines | `references/search-discovery.md` |
| Card / poster / rail **visual** treatment           | `ui-ux-pro-max` / `frontend-design` |
| Rail reveal & scroll-driven **animation**           | `gsap-scrolltrigger` / `motion-framer` |
| Skeleton **component styling**                      | `ui-styling` |
| Screen / IA / which-vertical **patterns**           | `entertainment-platform-ui` |
| House-style **perf budgets** (canonical owner)      | `../modern-web-design/references/award-winning-playbook.md` — owns budgets at the house-style level; this skill references, doesn't restate. |

## Sources

- https://strapi.io/blog/frontend-performance-checklist
- https://www.debugbear.com/blog/nextjs-image-optimization
- https://web.dev/articles/vitals
- https://tanstack.com/virtual
- https://www.algolia.com/doc/ (InstantSearch)
- https://www.meilisearch.com/
