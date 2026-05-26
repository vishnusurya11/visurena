# Choreography Playbook

How to make motion feel *intentional*: timing, easing, stagger, and sequencing recipes for the chosen tool.

## 1. Duration & easing — the contract

| Token | Value | Use |
|---|---|---|
| instant | 100ms | toggle tick, checkbox, tiny state flip |
| fast | 150ms | hover, focus ring, button press |
| base | 250ms | dropdowns, tooltips, most enter/leave |
| slow | 400ms | modals, side panels, cards |
| xslow | 600ms | hero reveals, page-level signature moments |

Rules of thumb:
- UI feedback should feel **sub-300ms**. Over ~500ms needs a reason.
- **Bigger travel = slightly longer** duration. **Exit ~20-30% faster** than enter.
- **Enter → ease-out** (decelerate, arrives & settles). **Exit → ease-in** (accelerate, leaves).
- `linear` only for continuous/scrubbed motion (scroll, marquees, spinners). Never for UI feedback.
- Overshoot/spring (`cubic-bezier(0.34,1.56,0.64,1)`) for ONE emphasis element, not every card.

```css
:root {
  --dur-instant:100ms; --dur-fast:150ms; --dur-base:250ms; --dur-slow:400ms; --dur-xslow:600ms;
  --ease-standard:cubic-bezier(0.4,0,0.2,1);
  --ease-out:cubic-bezier(0,0,0.2,1);
  --ease-in:cubic-bezier(0.4,0,1,1);
  --ease-spring:cubic-bezier(0.34,1.56,0.64,1);
}
```

GSAP equivalents: `power2.out` ≈ ease-out, `power2.in` ≈ ease-in, `power2.inOut` ≈ standard, `back.out(1.7)` ≈ spring/overshoot, `none` = linear.

## 2. Staggering

Goal: turn "all at once" into a guided eye path. Per-item delay **30-80ms**; whole group should still feel snappy (total < ~600ms for a typical grid).

**CSS (index-driven):**
```html
<li style="--i:0">…</li><li style="--i:1">…</li><li style="--i:2">…</li>
```
```css
li { opacity:0; animation: rise var(--dur-base) var(--ease-out) forwards;
     animation-delay: calc(var(--i) * 60ms); }
@keyframes rise { from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:none} }
```

**Motion (variants — preferred for React):**
```jsx
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1, when: "beforeChildren" } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0,0,0.2,1] } },
}
<motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
  {items.map(i => <motion.li key={i.id} variants={item} />)}
</motion.ul>
```
- `staggerChildren` = gap between each child. `delayChildren` = wait before the first.
- Reverse on exit: `staggerDirection: -1` + `when: "afterChildren"`.

**GSAP (stagger object — most control):**
```js
gsap.from(".item", {
  opacity: 0, y: 16, duration: 0.25, ease: "power2.out",
  stagger: { each: 0.06, from: "start" }, // "center" | "edges" | "random" | [x,y] grid origin
})
// grid-aware distance stagger:
gsap.from(".cell", { opacity:0, scale:0.9, duration:0.3,
  stagger: { grid: [5, 8], from: "center", amount: 0.6 } })
```

Direction: stagger in **reading order** on enter; **reverse** on exit. For grids, distance/diagonal (`from:"center"`/`grid`) reads more naturally than raw index.

## 3. Sequencing / orchestration

**Overlap, don't queue.** Start the next step ~70-90% into the previous so the sequence flows.

**GSAP timeline (the gold standard for sequencing):**
```js
const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.4 } })
tl.from(".hero-title", { y: 40, opacity: 0 })
  .from(".hero-sub",   { y: 24, opacity: 0 }, "-=0.25")   // overlap previous by 0.25s
  .from(".hero-cta",   { y: 16, opacity: 0 }, "<0.1")      // 0.1s after prev START
  .from(".hero-img",   { scale: 0.94, opacity: 0 }, 0)     // absolute time 0 (parallel)
// control: tl.pause(); tl.play(); tl.reverse(); tl.seek(0.5); tl.timeScale(1.5)
```
Position params: `"+=0.2"` (gap after), `"-=0.2"` (overlap before), `"<"` (align to prev start), `">"` (align to prev end), `"label"`, or absolute seconds.

**Motion sequence (`useAnimate`) for imperative React sequences:**
```jsx
import { useAnimate, stagger } from "motion/react"
const [scope, animate] = useAnimate()
await animate([
  [".title", { y: 0, opacity: 1 }, { duration: 0.4 }],
  [".sub",   { y: 0, opacity: 1 }, { at: "-0.25" }],          // overlap
  ["li",     { x: 0, opacity: 1 }, { delay: stagger(0.06) }], // stagger within step
])
```

**Container-before-children pattern:** reveal the shell, then its contents.
- Motion: `when: "beforeChildren"` on enter, `"afterChildren"` on exit.
- GSAP: tween container first, then children with overlap.

## 4. Interruption handling

Re-firing an animation from baseline mid-flight causes a visible jump. Always animate **from the current value**:
- **GSAP:** `overwrite: "auto"` on re-fired tweens, or `gsap.killTweensOf(el)` before re-tweening. Timelines: `tl.restart()` vs creating new ones.
- **Motion:** interruptible by default — changing the target mid-animation re-routes smoothly. For springs this is velocity-preserving.
- **Springs (Motion/React Spring):** inherently velocity-aware; ideal for rapidly toggled states (e.g. drag handles, hover spam).

## 5. Putting it together — a hero reveal recipe

Intent: title → subtitle → CTA → image, flowing as one gesture, ~900ms total, respects reduced motion.

```js
import gsap from "gsap"
const mm = gsap.matchMedia()
mm.add("(prefers-reduced-motion: no-preference)", () => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
  tl.from(".hero-img",   { scale: 1.06, opacity: 0, duration: 0.6 })
    .from(".hero-title", { y: 40, opacity: 0, duration: 0.5 }, "-=0.35")
    .from(".hero-sub",   { y: 24, opacity: 0, duration: 0.4 }, "<0.12")
    .from(".hero-cta",   { y: 16, opacity: 0, duration: 0.35 }, "<0.1")
  return () => tl.kill()
})
// reduced-motion users get the static, fully-visible layout (no timeline built).
```

Restraint reminder: **one signature moment per page.** Everywhere else, keep motion to sub-300ms feedback.
