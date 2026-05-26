# Animation Performance

Hit a stable 60fps (120fps on capable displays) and avoid jank. The browser renders in stages: **JS → Style → Layout → Paint → Composite.** The fewer stages an animation touches, the cheaper it is.

## The only-two-properties rule

Animate **`transform`** and **`opacity`** wherever possible — they're handled at the **Composite** stage (GPU) and skip Layout and Paint entirely.

| Property | Pipeline stage triggered | Verdict |
|---|---|---|
| `transform` (translate/scale/rotate) | Composite only | Cheap — prefer |
| `opacity` | Composite only | Cheap — prefer |
| `filter` | Paint (mostly compositable) | OK in moderation |
| `color`, `background-color` | Paint | Avoid on large/animated areas |
| `box-shadow` | Paint (expensive when large/animated) | Avoid animating; fake with layered pseudo + opacity |
| `background-position` | Paint | Avoid; use `transform` on a layer |
| `width`, `height` | **Layout** + Paint | Avoid — use `transform: scale()` |
| `top/left/right/bottom` | **Layout** + Paint | Avoid — use `transform: translate()` |
| `margin`, `padding` | **Layout** + Paint | Avoid |
| `border-width` | **Layout** + Paint | Avoid |

### Conversions
- Position: `top/left` → `transform: translate(x, y)`.
- Size: `width/height` → `transform: scale()` (+ set `transform-origin`; counter-scale children if needed, or use Motion's `layout` which solves this).
- Reveal height (accordion): animate `transform: scaleY()` or use Motion `layout` / `grid-template-rows: 0fr → 1fr` (animatable in modern browsers) instead of `height`.

## `will-change` discipline

`will-change: transform` tells the browser to promote the element to its own compositor layer *ahead of time*, avoiding a hitch on the first frame. But each layer costs GPU memory.

- ✅ Apply to the **few** elements about to animate, **just-in-time**, and **remove on completion**.
- ❌ Never in a global/`*` rule, never on dozens of elements, never permanently.

```js
el.style.willChange = "transform"      // right before animating
// ...animate...
el.addEventListener("transitionend", () => { el.style.willChange = "auto" }, { once: true })
```
GSAP: `force3D: true` is the default and usually enough; only add `will-change` if profiling shows a first-frame hitch.

## Layout thrashing (forced synchronous layout)

Reading a layout property (`offsetTop`, `offsetWidth`, `getBoundingClientRect()`, `scrollHeight`, `getComputedStyle`) right after writing styles forces the browser to recompute layout synchronously — death in a scroll or `requestAnimationFrame` loop.

```js
// ❌ read-write-read-write inside a loop → thrash
items.forEach(el => { const h = el.offsetHeight; el.style.height = h * 2 + "px" })

// ✅ batch reads, then writes
const heights = items.map(el => el.offsetHeight) // read phase
items.forEach((el, i) => { el.style.height = heights[i] * 2 + "px" }) // write phase
```
In scroll handlers: cache measurements, recompute only on `resize`/`ScrollTrigger.refresh()`, and never read layout every frame.

## Scroll performance

- Use ScrollTrigger's `scrub` and batching; let it own `refresh` on resize.
- Only animate `transform`/`opacity` on scroll. Parallax = `translateY` on a promoted layer, never `background-position` or `top`.
- Avoid heavy `backdrop-filter`/`blur` on elements that move during scroll — it repaints every frame on many devices.
- Don't pin many elements simultaneously; consolidate into one pinned timeline.

## Mobile budget

- **Test on a real mid-tier Android**, not a desktop throttle sim — GPU/compositor behavior differs.
- Gate expensive effects:
```js
const lowEnd = (navigator.hardwareConcurrency ?? 4) < 4
const coarse = matchMedia("(pointer: coarse)").matches
if (lowEnd || coarse) { /* skip parallax / 3D / heavy blur; simpler reveals */ }
```
- Prefer `opacity`+`translate` reveals over scale+blur combos on phones.
- Lazy-mount 3D/canvas below the fold; pause off-screen rAF loops (`IntersectionObserver`).

## DevTools verification workflow

1. **Performance panel** → record while interacting/scrolling. Look for: long tasks (>50ms), purple **Layout** / green **Paint** bars during animation (should be mostly absent for transform/opacity), and dropped frames.
2. **Rendering tab** → enable **Frame Rendering Stats** (FPS meter), **Paint flashing** (green = repaints; should not flash during a transform animation), and **Layer borders**.
3. **Layers panel** → confirm only intended elements are promoted to their own layers (over-promotion via `will-change` shows here).
4. Target: no frames over 16.7ms (60fps) / 8.3ms (120fps) during the animation.

## Sources
- [web.dev: Animations guide](https://web.dev/articles/animations-guide)
- [web.dev: Stick to compositor-only properties](https://web.dev/articles/animations-guide#triggers)
- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [MDN: CSS performance / animation](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance)
- [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance)
