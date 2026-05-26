---
name: animation-orchestration
description: Decision and choreography skill for web animation — picks the RIGHT tool (CSS-only vs Motion/Framer vs GSAP/ScrollTrigger vs View Transitions vs React Spring) and choreographs timing, easing, staggering, and sequencing. Use BEFORE implementing any animation to choose the approach, then routes the build to the gsap-scrolltrigger or motion-framer skills. Triggers on: "which animation library", "how should I animate this", choreographing/orchestrating multi-step sequences, page/route transitions, scroll-driven effects, micro-interactions, animation performance/jank, 60fps, or prefers-reduced-motion.
---

# Animation Orchestration

## Overview

This is a **decision and choreography** skill, not an implementation skill. It answers two questions before you write any animation code:

1. **Which tool?** — CSS-only, Motion (Framer), GSAP + ScrollTrigger, the View Transitions API, or React Spring.
2. **How do I choreograph it?** — easing curves, duration scales, stagger, sequencing, and orchestration so motion feels intentional instead of noisy.

It then **routes implementation** to the sibling skills:
- **`gsap-scrolltrigger`** — scroll-driven sequences, pinning, scrubbing, parallax, timelines, SplitText/MorphSVG, non-React or framework-agnostic work.
- **`motion-framer`** — React component motion: gestures, layout/shared-element transitions, `AnimatePresence` exit animations, springs.
- **`modern-web-design`** — the higher-level *what to build* / house-style decisions (this skill is the *how to move* layer beneath it).

**When to use this skill:**
- You're unsure whether to reach for CSS, Motion, GSAP, View Transitions, or React Spring.
- You need to choreograph a multi-element sequence (hero reveal, staggered grid, multi-step scroll story).
- You're building page/route transitions and want native View Transitions vs library tradeoffs.
- An animation feels janky, "AI-slop," or fires everywhere at once and you need timing discipline.
- You must ship accessible motion (`prefers-reduced-motion`) and 60fps on mobile.

**Do NOT use this skill for:** the actual API syntax of a chosen tool — once decided, jump to `gsap-scrolltrigger` or `motion-framer`.

> **2026 license note:** As of April 2025, **GSAP and ALL its plugins (ScrollTrigger, ScrollSmoother, SplitText, MorphSVG, DrawSVG, Inertia) are 100% free**, including commercial use, following Webflow's acquisition. There is no longer any cost reason to avoid GSAP. ([GSAP pricing](https://gsap.com/pricing/))

## The Decision: Which Tool?

### Decision table

| Need | Reach for | Why |
|---|---|---|
| Simple hover / focus / state toggle, enter/leave on a single element | **CSS** (`transition`, `@keyframes`) | Zero JS, runs on compositor, cheapest possible. |
| One-shot entrance, looping ambient motion (no JS state) | **CSS** (`animation`) | Declarative, GPU-friendly, no bundle cost. |
| React component motion: gestures (drag/hover/tap), layout shifts, list add/remove, springs | **Motion (`motion/react`)** | Declarative React API, `AnimatePresence` handles exit, layout animations are unique to it. |
| Complex multi-step **timelines**, precise sequencing, overlapping tweens, replay/seek control | **GSAP timeline** | `gsap.timeline()` is the best-in-class sequencer; position params beat chained `setTimeout`. |
| **Scroll-driven**: pin, scrub, parallax, reveal-on-enter, horizontal scroll, scroll-linked 3D | **GSAP ScrollTrigger** | Purpose-built; handles start/end, scrub, pinning, batching, refresh on resize. |
| **Page / route transition** between full pages or app routes | **View Transitions API** first; **Motion `AnimatePresence`** for React SPA fallback | Native VT is now Baseline for same-document; cross-document needs Chromium. |
| Highly interactive, physics-led UI (pull-to-refresh, draggable cards with momentum) where feel > precision | **React Spring** *or* Motion springs | Spring physics with interruptible, velocity-aware motion. Motion's spring covers most cases; React Spring shines for `useSpring`/`useTrail` imperative control. |
| Text splitting / SVG morph / draw-on | **GSAP** (SplitText, MorphSVG, DrawSVG — now free) | No solid free equivalent. |
| SVG line-drawing / path morph in React without GSAP | **CSS** `stroke-dasharray` or **Motion** `pathLength` | Lightweight for simple cases. |

### Decision tree (fast path)

```
Is it scroll-position-driven (pin / scrub / parallax / reveal-on-enter)?
├─ YES → GSAP ScrollTrigger        → route to: gsap-scrolltrigger
└─ NO
   Is it a navigation between pages/routes?
   ├─ YES → View Transitions API (native) ; React SPA → Motion AnimatePresence
   └─ NO
      Is it in React AND involves gestures / layout / enter-exit of components?
      ├─ YES → Motion (motion/react)  → route to: motion-framer
      └─ NO
         Is it a multi-step timed sequence with precise overlap/replay?
         ├─ YES → GSAP timeline       → route to: gsap-scrolltrigger
         └─ NO
            → CSS transition / @keyframes (cheapest; do this by default)
```

**Golden rules:**
- **Default to CSS.** Only escalate to a library when CSS genuinely can't express it (sequencing, scroll-linking, gestures, springs, layout).
- **Never run two engines on the same property of the same element** (e.g. GSAP and Motion both touching `transform`) — they fight and cause jitter. Pick one owner per property.
- **One signature "wow" moment per page; calm everywhere else.** Orchestration is about restraint as much as motion.

## Choreography & Timing Principles

### Duration scale

Use a small, consistent scale instead of arbitrary numbers. Faster for small/utility, slower for large/expressive.

```css
:root {
  --dur-instant: 100ms;  /* tiny state flips: checkbox, toggle tick */
  --dur-fast:    150ms;  /* hover, focus, button press */
  --dur-base:    250ms;  /* most enter/leave, dropdowns, tooltips */
  --dur-slow:    400ms;  /* modals, larger panels, cards */
  --dur-xslow:   600ms;  /* hero reveals, page-level moments */
}
```

Guidance: UI feedback should feel **sub-300ms**; anything over ~500ms needs a deliberate reason. Larger travel distance = slightly longer duration. On exit, animate ~20-30% faster than enter so dismissal feels responsive.

### Easing curves

Match the curve to the intent. Avoid `linear` for UI (feels robotic) — reserve it only for continuous/scroll-scrubbed motion.

```css
:root {
  /* Standard UI — accelerate out, decelerate in */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);   /* Material "standard" */
  /* Entering elements — decelerate (ease-out) */
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  /* Exiting elements — accelerate (ease-in) */
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  /* Playful overshoot — for emphasis, sparingly */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- **Enter → ease-out** (object arrives and settles). **Exit → ease-in** (object accelerates away).
- **Overshoot/spring** for delight on a single hero element, never on every card.
- For physics-real feel (drag release, momentum), prefer a **spring** (Motion/React Spring) over a bezier — springs are velocity-aware and interruptible.

### Staggering

Stagger turns "everything appears at once" into a guided eye-path. Keep per-item delay small (30-80ms) so the whole group still feels snappy.

```css
/* CSS stagger via custom property + inline --i index */
.item { animation: rise var(--dur-base) var(--ease-out) both;
        animation-delay: calc(var(--i) * 60ms); }
```

Direction matters: stagger **in reading order** (top-left → bottom-right) on enter; **reverse** on exit. For grids, a diagonal/distance-based stagger reads more naturally than pure index order.

### Orchestration / sequencing

- **Overlap, don't queue.** Start the next step before the previous fully ends (~70-90% in) so the sequence flows instead of stuttering. GSAP timeline position params (`"<"`, `"-=0.2"`) and Motion's `staggerChildren` + `delayChildren` express this cleanly.
- **`when: "beforeChildren"`** (Motion variants) to reveal a container before its items; **`afterChildren`** to collapse items before the container leaves.
- Group related motion so it reads as **one gesture**, not N independent animations.

See `references/choreography.md` for the full timing/stagger/sequencing playbook with GSAP timeline + Motion variant recipes.

## The Same Micro-Interaction, Three Ways

A card that lifts and brightens on hover — to make the tradeoff concrete.

**CSS (default choice — cheapest, no JS):**
```css
.card {
  transition: transform var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
  will-change: transform; /* only if measured benefit; remove after */
}
.card:hover { transform: translateY(-4px) scale(1.02);
              box-shadow: 0 12px 32px rgba(0,0,0,.18); }
```

**Motion (React — when state/gesture orchestration is already in JS):**
```jsx
import { motion } from "motion/react"

<motion.div
  whileHover={{ y: -4, scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,.18)" }}
  transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
/>
```

**GSAP (when this hover is one step in a larger timeline/scroll sequence):**
```js
import gsap from "gsap"
const card = document.querySelector(".card")
card.addEventListener("mouseenter", () =>
  gsap.to(card, { y: -4, scale: 1.02, duration: 0.15, ease: "power2.out" }))
card.addEventListener("mouseleave", () =>
  gsap.to(card, { y: 0, scale: 1, duration: 0.15, ease: "power2.out" }))
```

**Verdict:** For a standalone hover, **CSS wins** — fewest moving parts. Choose Motion only if the component is already animation-driven; choose GSAP only if this is part of a bigger orchestrated timeline. Don't pull in a 30kb+ library for a hover.

## Performance: hitting 60fps (120fps on capable displays)

**Animate only `transform` and `opacity`.** These are composited on the GPU and skip layout + paint. Everything else risks jank.

```
✅ Cheap (compositor):  transform (translate/scale/rotate), opacity, filter (mostly)
❌ Layout-thrashing:    width, height, top, left, right, bottom, margin, padding
❌ Paint-heavy:         box-shadow (large), background-position, color on big areas
```

- **`width/height` → use `transform: scale()`** + adjust `transform-origin`. **`top/left` → `translate()`**.
- **`will-change: transform`** promotes an element to its own layer *before* animating — but it costs memory. Apply to the few elements about to animate, then **remove it on completion**. Never put `will-change` on dozens of elements or in a global rule.
- **Mobile:** test on a real mid-tier Android, not a desktop sim. Reduce/disable parallax, blur, and 3D on low-end devices (`navigator.hardwareConcurrency`, `matchMedia('(pointer: coarse)')`). Heavy `backdrop-filter` + scroll is a classic mobile killer.
- **Scroll:** prefer ScrollTrigger's batching/`scrub`; never animate layout properties on scroll. Avoid reading layout (`offsetTop`, `getBoundingClientRect`) inside scroll/raf handlers without caching — that's forced synchronous layout (layout thrash).
- Verify in **Chrome DevTools → Performance**: watch for long tasks, layout/paint flashes, and dropped frames in the FPS meter.

Full property reference and the layout-thrash cheat sheet: `references/performance.md`.

## Accessibility: `prefers-reduced-motion`

This is non-negotiable. Honor it in **both** CSS and JS.

**CSS — global safety net (place last in your stylesheet):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Motion (React):**
```jsx
import { useReducedMotion } from "motion/react"
const reduce = useReducedMotion()
<motion.div animate={{ x: reduce ? 0 : 100 }}
            transition={{ duration: reduce ? 0 : 0.4 }} />
```

**GSAP:**
```js
import gsap from "gsap"
const mm = gsap.matchMedia()
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // build scroll/timeline animations only here; auto-reverted otherwise
})
```

- **Reduce ≠ remove.** Replace large movement/parallax/auto-play with a fast opacity fade or instant state — keep the information, drop the motion. Don't strand the user with hidden content.
- Provide a manual "reduce motion" toggle for heavy experiences; never trap users in essential motion.

## Common Pitfalls

1. **Over-animation / AI-slop.** Everything sliding, bouncing, and parallaxing at once. Fix: one signature moment per page; if you can't justify an animation's purpose, delete it.
2. **Jank on mobile.** Desktop-smooth, phone-stuttery. Fix: transform/opacity only, cut parallax/blur on low-end, test on real hardware.
3. **Layout-thrash properties.** Animating `width/height/top/left/margin`. Fix: use `transform`.
4. **Two engines, one property.** GSAP and Motion both writing `transform` → jitter. Fix: one owner per property.
5. **Scroll-jacking.** Hijacking native scroll speed/physics frustrates users and breaks keyboard/momentum scroll. Fix: enhance scroll (ScrollTrigger without changing scroll physics); never disable it.
6. **Animation interruption ignored.** Re-triggering an animation mid-flight from its baseline causes jumps. Fix: animate *from current value* (GSAP overwrites/`gsap.killTweensOf`, Motion is interruptible by design, springs are velocity-aware). Set `overwrite: "auto"` in GSAP when re-firing.
7. **Forgetting `prefers-reduced-motion`.** Ships motion-sickness triggers. Fix: the CSS safety net above + per-library hooks.
8. **`will-change` everywhere.** Memory blowup and *worse* performance. Fix: apply just-in-time, remove on complete.
9. **`AnimatePresence` exit not firing.** Element removed without the wrapper or without a stable `key`. Fix: see `motion-framer`.

## Resources

### Official documentation
- [GSAP Docs](https://gsap.com/docs/v3/) — core, timelines, eases
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — scroll-driven API
- [GSAP pricing / free license](https://gsap.com/pricing/) — confirms 100% free as of 2025
- [Motion for React](https://motion.dev/docs/react) — import `motion/react`
- [Motion `useReducedMotion`](https://motion.dev/docs/react-use-reduced-motion)
- [MDN: CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [MDN: CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [MDN: `easing-function`](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [web.dev: Animations guide](https://web.dev/articles/animations-guide)
- [web.dev: Same-document view transitions are Baseline](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available)

### Sibling skills (route implementation here)
- `gsap-scrolltrigger` — once you've chosen GSAP/ScrollTrigger/timeline
- `motion-framer` — once you've chosen Motion (React)
- `modern-web-design` — the *what to build* layer above this one

### Bundled references
- `references/decision-matrix.md` — extended tool comparison, View Transitions deep dive, React Spring vs Motion springs
- `references/choreography.md` — duration/easing/stagger/sequencing recipes (GSAP timeline + Motion variants)
- `references/performance.md` — compositor vs layout/paint property tables, will-change discipline, mobile budget, DevTools workflow
