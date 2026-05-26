# Decision Matrix — Extended

Deeper comparison once the SKILL.md decision table/tree has narrowed your choice.

## Tool-by-tool: strengths, weaknesses, when

### CSS (`transition`, `@keyframes`)
- **Strengths:** zero JS, zero bundle, runs on the compositor, declarative, easiest to make accessible. Works without hydration.
- **Weaknesses:** no real sequencing (only `animation-delay` chains, which are brittle), no scroll-position linking without JS, no gestures, no spring physics, hard to interrupt cleanly.
- **Use when:** hover/focus/active states, single-element enter/leave, ambient loops, simple SVG draw via `stroke-dasharray`. **This is the default — escalate only when CSS can't express the need.**

### Motion (`motion/react`)
- **Strengths:** declarative React API; gestures (`whileHover`/`whileTap`/`drag`); `AnimatePresence` for exit animations; **layout & shared-element transitions** (`layout`, `layoutId`) — genuinely unique; springs; `whileInView` for simple scroll reveals; interruptible by design; hybrid engine uses WAAPI/ScrollTimeline for up to 120fps and falls back to JS for springs/gestures.
- **Weaknesses:** React-centric; not ideal for elaborate frame-precise timelines; bundle cost vs CSS; `whileInView` is coarser than ScrollTrigger for scrubbed/pinned work.
- **Use when:** animating React components driven by state/gestures, list add/remove, modals, tab indicators, shared-element zoom. → route to `motion-framer`.

### GSAP + ScrollTrigger
- **Strengths:** best-in-class **timeline sequencer** (position params, overlap, labels, nesting, seek/replay); ScrollTrigger handles pin, scrub, parallax, batch, and refresh-on-resize; framework-agnostic; SplitText/MorphSVG/DrawSVG (all free since 2025); `matchMedia` for responsive + reduced-motion; `overwrite` for clean interruption.
- **Weaknesses:** imperative; in React needs `useGSAP`/cleanup care; heavier mental model than CSS for trivial cases.
- **Use when:** scroll storytelling, pinned multi-step sections, horizontal scroll galleries, complex overlapping timelines, text/SVG effects, scroll-linked 3D. → route to `gsap-scrolltrigger`.

### View Transitions API (native)
- **Strengths:** browser-native crossfade + shared-element morph for navigations; minimal code; works for **same-document** (SPA-style) and **cross-document** (MPA) navigations; degrades gracefully (no support = instant nav, no error).
- **Weaknesses:** newer; cross-document support is Chromium-led (Firefox 144 has same-document only as of late 2025); customization is CSS-pseudo-element based (`::view-transition-*`) with a learning curve; same-origin only for cross-document.
- **Status (2025):** **same-document view transitions became Baseline Newly available on 2025-10-14** (Chrome, Firefox, Safari). Cross-document is in Chromium 126+.

### React Spring
- **Strengths:** imperative spring control (`useSpring`, `useTrail`, `useChain`), velocity-aware, great for physics-led interactions (drag-release, pull, momentum lists).
- **Weaknesses:** another dependency; for most apps Motion's built-in springs already cover the need; smaller mind-share than Motion.
- **Use when:** you specifically want fine-grained imperative spring orchestration and aren't already using Motion. Otherwise prefer Motion springs.

## Springs: Motion vs React Spring

| | Motion springs | React Spring |
|---|---|---|
| API style | Declarative (`transition={{ type: "spring" }}`) + `useSpring` motion value | Imperative hooks (`useSpring`, `useTrail`, `useChain`) |
| Best for | Component animations already in Motion | Physics-first interactions, trails/chains |
| Interruptible | Yes | Yes |
| Recommendation | **Default** for React | Reach for only if you need its trail/chain imperative model |

If you're already on Motion, use Motion springs — don't add React Spring just for a bouncy button.

## View Transitions API — practical recipes

### Same-document (SPA / client routing)
```js
// Wrap the DOM update that changes the view.
function navigate(updateDOM) {
  if (!document.startViewTransition) { updateDOM(); return; } // graceful fallback
  document.startViewTransition(updateDOM);
}
```
```css
/* Name persistent/shared elements so they morph instead of crossfade */
.hero-img { view-transition-name: hero; }
/* Customize the default crossfade */
::view-transition-old(root),
::view-transition-new(root) { animation-duration: 250ms; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
```

### Cross-document (MPA, Chromium 126+)
```css
/* Opt BOTH pages in (same origin required) */
@view-transition { navigation: auto; }
```
Add matching `view-transition-name`s on shared elements (e.g. a thumbnail on the list page and the hero on the detail page) to get a shared-element morph across full page loads.

**When to choose VT over Motion `AnimatePresence`:** prefer native VT for page/route-level transitions (less JS, works across documents). Use `AnimatePresence` when you need per-component exit choreography inside a React tree, or when targeting browsers/scenarios VT doesn't cover.

## Quick anti-pattern guide
- Adding a library for a job CSS already does → bloat.
- Using `whileInView` for a pinned/scrubbed scroll story → use ScrollTrigger instead.
- Hand-rolling page transitions with JS when native View Transitions would do → unnecessary code.
- Stacking React Spring on top of Motion → redundant; pick one spring source.

## Sources
- [GSAP Docs](https://gsap.com/docs/v3/) · [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) · [GSAP pricing/free](https://gsap.com/pricing/)
- [Motion for React](https://motion.dev/docs/react) · [Motion scroll](https://motion.dev/docs/react-scroll-animations) · [Motion gestures](https://motion.dev/docs/react-gestures)
- [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) · [MDN @view-transition](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition)
- [web.dev: same-document VT Baseline](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available)
- [React Spring docs](https://www.react-spring.dev/) *(docs root — verify exact deep links before citing)*
