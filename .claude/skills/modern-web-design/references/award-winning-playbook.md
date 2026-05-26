# Award-Winning Website Playbook

The standard for building **world-class, "wow"-tier websites** — the kind that win Awwwards Site of the Day / FWA / CSS Design Awards and read as if a top-10-in-the-world studio made them. This is the single source of truth referenced by the UI skills in this repo (`frontend-design`, `modern-web-design`, `ui-ux-pro-max`, `ui-styling`, `landing-page`, `web-artifacts-builder`).

Read this whenever the task is "build / design / improve a website or page" and quality matters. It is dense on purpose — it carries concrete numbers, curves, and do/don't pairs you can apply directly.

## Table of contents
1. [The Visurena north-star](#1-the-visurena-north-star) — what we are building, the target feel
2. [The mental model](#2-the-mental-model) — why most AI sites look cheap, and the fix
3. [Visual craft](#3-visual-craft) — typography, layout, color, charcoal dark
4. [Motion craft](#4-motion-craft) — tasteful/slight animation, easing, durations
5. [3D & parallax](#5-3d--parallax) — the dynamic depth the user wants, done optimized
6. [Performance & accessibility](#6-performance--accessibility) — non-negotiable budgets
7. [Tech stack & composition](#7-tech-stack--composition) — which skill/library when
8. [The AI-slop kill-list](#8-the-ai-slop-kill-list) — forbid every one
9. [Pre-ship checklist](#9-pre-ship-checklist)

---

## 1. The Visurena north-star

**Visurena is an AI-powered entertainment hub for everybody.** Every site/page we build for it should make a first-time visitor think *"wow — this is on par with the best websites in the world."* Concretely, the house style:

- **Charcoal premium dark by default.** Base background near-black charcoal (`#0E0E0E`–`#121212`, never pure `#000`), layered surfaces, one confident accent. This is the default aesthetic unless a brief says otherwise. (See §3 dark mode.)
- **Slightly animated, not "animated."** Motion is a garnish on already-excellent design. A few signature moments, lots of calm. (See §4.)
- **Dynamic depth via tasteful 3D + parallax.** Subtle parallax layers, optional WebGL/R3F hero, scroll-driven reveals — enough to feel alive and modern, never gimmicky or seasick. (See §5.)
- **Fully optimized.** Dynamic must never cost smoothness. 60fps, fast LCP, lazy-mounted 3D, reduced-motion respected. "Dynamic *and* optimized" is the whole brief. (See §6.)
- **Entertainment energy with restraint.** Bold, cinematic, confident — but disciplined. Think Apple/Stripe/Linear-grade polish applied to an entertainment brand, not a flashy template.

When in doubt, optimize for: **memorable, fast, effortless.** One signature "wow" moment per page beats effects everywhere.

---

## 2. The mental model

**Average is the enemy.** Told "make it beautiful," an AI emits the statistical average of its training data: Inter font, indigo→purple gradient, centered hero, three evenly-spaced cards. World-class design is a *specific, opinionated choice* — removing the unnecessary and making the essentials feel perfect, not adding more.

**Awwwards judging weights** (internalize these priorities): Design 40% · Usability 30% · Creativity 20% · Content 10%. The biggest differentiator judges cite is **custom interaction + art direction**. Restraint scores higher than excess.

**Three rules that flow from this:**
1. **Commit to one clear aesthetic direction** and execute it precisely. Intentionality > intensity (bold maximalism and refined minimalism both win; randomness loses).
2. **Decide constraints before generating** — tokens, type, palette, motion budget — not after.
3. **Every page needs one signature moment**, and the rest of the page should be calm enough to let it land.

---

## 3. Visual craft

### Typography (highest-leverage lever)
- **Escape default fonts.** Never default everything to Inter / Roboto / Arial / system sans — that alone reads as a template. Use a **two-font system: a distinctive display face + a clean readable body.**
  - Editorial/premium display: Fraunces, Playfair Display, Cormorant, DM Serif (serif); Clash Display, Syne, Space Grotesk, Bricolage Grotesque (distinctive sans). For an entertainment brand, a confident characterful display face earns the "wow."
  - Don't converge on the same trendy pick every time (e.g. don't reflexively reach for Space Grotesk). Vary by brief.
- **Type scale:** one modular ratio applied consistently — **1.25 (major third)** balanced default, **1.333 (perfect fourth)** for clear editorial hierarchy, **≥1.414** for bold/marketing. *Widen the contrast between display and body* — generic sites compress all sizes; award sites make H1 huge and body calm.
- **Body readability (non-negotiable):** size **16–20px**, line-height **1.5–1.7**, measure **45–85ch (target ~66ch)** via `max-width: 60–75ch`.
- **Headings:** tight leading **1.0–1.2**; negative tracking **-0.01em to -0.04em** on large display; positive tracking **+0.05em to +0.15em** on small all-caps labels/eyebrows.
- **Fluid type with `clamp()`** so it scales smoothly (preferred value must mix `rem`+`vw`, never pure `vw`, for zoom accessibility):
  ```css
  --step-body: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --step-h1:   clamp(2.5rem, 1.5rem + 6vw, 6rem);
  ```
- **Variable fonts:** one file, many weights; set `font-optical-sizing: auto`. Hierarchy via secondary text at reduced opacity (0.55–0.7), not just smaller size.

### Layout & composition
- **Break centered-everything.** Centered hero + two buttons + three icon cards is the #1 AI tell. Use **asymmetry, intentional left-alignment, overlap, diagonal flow, grid-breaking at chosen anchor points.**
- **Editorial/magazine instincts:** type as a graphic element, pull quotes, varied column widths, intentional density in some zones and air in others.
- **Bento grids** for feature/overview sections — modular rectangles of *different* sizes (uniform boxes defeat the purpose).
- **Spacing on an 8px scale:** 8 · 16 · 24 · 32 · 48 · 64 · 96 · 128 — every margin/padding/gap a multiple, referenced via tokens. Rule: **space inside a group < space separating groups.** Generous negative space signals confidence/luxury.

### Color & charcoal dark mode
- **Limited palette:** ~3 core — one dominant, a neutral ground, and **one disciplined accent** used rarely (CTAs, key highlights). Scarcity gives the accent power. Use **OKLCH** for perceptual uniformity and predictable contrast; semantic tokens (`--color-bg`, `--color-fg`, `--accent`) layered over raw palette tokens (`--blue-500`).
- **Charcoal premium dark (Visurena default):**
  - Background **never pure `#000`** — use `#0E0E0E`, `#121212`, `#18181B`, or warm `#1C1917`. Pure black is harsh on OLED and kills depth.
  - **Elevation via lighter surfaces, not shadows** — stack slightly lighter grays as layers rise.
  - Text: primary near-white (`#F2F2F2`/`#F8FAFC`, not glaring pure white); secondary a controlled gray (`#A3A3A3`/`#94A3B8`) — never let gray be the *primary* text.
  - **Accents need +10–20% saturation** in dark mode to hold weight; add ~20–30% more padding than light mode for breathing room.
  - Contrast: **≥4.5:1 body, ≥3:1 large text / UI** (WCAG AA), re-checked in dark mode.
- **Gradients — tasteful vs cheap:** TASTEFUL = near-imperceptible single-hue gradients for depth; vary brightness/saturation of *one* hue. CHEAP = purple→blue/indigo diagonal SaaS gradient, gradient text, multicolor/hard-stop gradients. (The "indigo plague" comes from old Tailwind defaults flooding training data — avoid it.)
- **Theme & dark-mode wiring:** `.dark` class on `<html>` (toggleable + persisted, with a pre-hydration inline script to avoid theme flash), `color-scheme: dark` so native controls theme correctly. For Tailwind v4 + shadcn specifics, use the `tailwind-theme-builder` skill.

### Surface details that read as "crafted"
Real product/brand assets over stock photos; consistent tokens across *all* pages (not just home); crafted hover/cursor states; subtle grain/noise overlay (rasterize SVG `feTurbulence` to AVIF/WebP for prod); soft shadows (low opacity 8–15%, blur 8–16px, dark-tinted not pure black), max 2–3 elevation levels.

---

## 4. Motion craft

**Philosophy: motion is an attention budget, not a free resource.** If everything moves, nothing stands out. Strategic stillness is what makes the few moments read as intentional and expensive. This is exactly the user's "slightly animated" — restraint is the premium signal.

**The only four legitimate jobs of motion:** guide attention · establish hierarchy · reward/confirm interaction · preserve continuity across state changes. If an animation does none of these — or makes the user wait to read/act — cut it.

### Durations (concrete)
| Motion type | Duration |
|---|---|
| Micro-interactions (hover, press, toggle, tooltip) | **100–200ms** |
| Standard UI transitions (dropdown, modal, drawer) | **200–300ms** (300ms is the "snappy" ceiling) |
| Larger surfaces / scroll reveals | **300–600ms** (~400–500ms typical) |
| Page transitions | **400–700ms** |
| Ambient/looping background | **multiple seconds** (the one place long is correct) |

Rule: **distance ∝ duration.** A 4px nudge ≈ 120ms; a full-screen slide ≈ 500ms.

### Easing (the premium curves)
- **Ease-OUT for anything entering or responding to the user** (fast start = instant responsiveness, soft settle). Avoid ease-in for UI; reserve it for exits. `ease-in-out` for ambient/symmetric loops.
- Built-in CSS easings are too weak — use tuned cubic-béziers:
  - `cubic-bezier(0.22, 1, 0.36, 1)` — expo.out-style luxurious decelerate
  - `cubic-bezier(0.16, 1, 0.3, 1)` — strong ease-out, very common on award sites
  - `cubic-bezier(0.25, 1, 0.5, 1)` — softer ease-out for small UI
- **GSAP:** `power2.out` (default UI), `power3.out`/`power4.out` (hero/large reveals), `expo.out` (glassy premium settle).
- **Springs (Motion/React Spring `{stiffness, damping, mass}`):** snappy UI `400–500 / 30–40 / 1`; default panels `260–300 / 26–30`; large surfaces `180–210 / 24–26`. Bounce only `0.2–0.35` (above ~0.4 = toy-like).

### Polish tricks
- **Never scale from 0** — start at `0.9–0.97` (avoids the "pop"). Button press: `scale(0.97)` on `:active`.
- **Origin-aware popovers:** `transform-origin` matches the trigger so menus grow *from* their button.
- **Masked line reveals** beat letters popping: wrap lines in `overflow:hidden`, slide up from 100% (GSAP SplitText `mask:"lines"`).
- **Stagger:** lists/cards `0.05–0.1s`; text by line `0.08–0.15s`; by word `0.02–0.05s`. Cap total group reveal ≤ ~0.6–0.8s.

### Signature techniques — tasteful vs slop
- **Scroll reveals:** opacity 0→1 + `y:16–32px→0`, ~400–500ms ease-out, **fire once**, trigger `top 85%`, content readable instantly. ✗ Slop: 100px+ flys, re-animating on scroll-back, gating readable content behind a fade.
- **Hover micro-interactions:** 100–200ms ease-out, underline grow / `y:-2px` lift / arrow nudge. ✗ Slop: 1.0→1.2 scale jumps, long durations, multiple transforms at once.
- **Magnetic buttons:** translate a *fraction* of cursor distance (strength ~0.2–0.4), small radius, eases home. ✗ Slop: huge range, button flying across screen.
- **Marquee:** slow, low-contrast, pauses on hover. ✗ Slop: fast, high-contrast, critical text.
- **Page transitions:** quick crossfade/cover (400–700ms) or the View Transitions API. ✗ Slop: elaborate loader on every nav.
- **Number counters:** count up once in view, 1–2s, ease-out. ✗ Slop: recount on every scroll.

The recurring slop signature: uniform durations on everything, motion that delays reading, re-triggering on scroll-back, elastic/bounce overuse, scale-from-zero pops, "animate because we can."

### Implementation snippets
GSAP scroll reveal (one observer, no re-trigger):
```js
gsap.registerPlugin(ScrollTrigger);
gsap.set(".reveal", { opacity: 0, y: 24 });
ScrollTrigger.batch(".reveal", {
  start: "top 85%", once: true,
  onEnter: b => gsap.to(b, { opacity:1, y:0, duration:0.6, ease:"power3.out", stagger:0.1 })
});
```
Motion `whileInView` (reveal once):
```jsx
<motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
  viewport={{once:true, amount:0.3}}
  transition={{duration:0.5, ease:[0.16,1,0.3,1]}} />
```
Lenis + GSAP single shared RAF (correct integration — separate loops cause 1–2 frame scrub lag):
```js
const lenis = new Lenis({ duration: 1.2, smoothWheel: true }); // lerp 0.1
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000)); // s → ms
gsap.ticker.lagSmoothing(0);
```
Magnetic button (`gsap.quickTo`, strength 0.3): see `gsap-scrolltrigger` skill for the full pattern. React: wrap GSAP in `useGSAP()` from `@gsap/react` (auto-cleanup under StrictMode); mark animation files `"use client"`; `ScrollTrigger.refresh()` after fonts/images/route change.

---

## 5. 3D & parallax (the dynamic depth, done optimized)

This is where the "dynamic, stands-out" feeling comes from — but it's also where sites get heavy and janky. Rules:

- **Parallax must be subtle:** background layers move **5–15% slower** than foreground; small `y` offsets. Adds depth you *barely* notice. ✗ Aggressive multi-layer parallax, large displacement, parallax on body text (hurts readability + triggers motion sickness). Drive it with `transform: translate3d()` only.
- **3D / WebGL only when it earns its place** — a hero canvas, product/feature showcase, or one signature moment. Use `react-three-fiber` (declarative, in React apps) or `threejs-webgl` (vanilla / max control). Never make 3D the whole page.
- **3D performance is mandatory, not optional:**
  - **Lazy-mount in view** (`dynamic(() => import('./Hero3D'), { ssr:false })` + IntersectionObserver); never ship Three.js in the initial bundle.
  - Pause the render loop when offscreen or `document.hidden`; cap DPR (`min(devicePixelRatio, 2)`); use compressed textures (Basis/KTX2), DRACO-compressed glTF, LOD, frustum culling.
  - Show a lightweight poster/placeholder while loading; progressive enhancement so the page works if WebGL fails.
  - **Disable or simplify 3D + parallax on mobile / low-power** (`navigator.hardwareConcurrency`, viewport width) and under `prefers-reduced-motion`.
- **Lighter alternatives for "depth" without a full 3D engine:** CSS 3D transforms + `perspective`, subtle tilt on hover, layered parallax sections, gradient-mesh/grain backgrounds, scroll-driven `clip-path` reveals. Often these deliver the "wow" at a fraction of the cost — reach for them first.

For Visurena: default to **subtle parallax + scroll reveals everywhere, and reserve true WebGL/R3F for one hero moment.** Dynamic feel, optimized cost.

---

## 6. Performance & accessibility (non-negotiable)

**Animate only `transform` and `opacity`** (and carefully `filter`/`clip-path`) — these run on the GPU compositor. Never animate `width`/`height`/`top`/`left`/`margin`/`padding` (layout thrash). 60fps = **16.7ms/frame** budget.

- **`will-change` discipline:** add just before an animation, remove after. Never spray it globally (blows GPU memory).
- **Core Web Vitals targets (75th pct):** **LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1** (FCP < 1.8s, TTFB < 0.8s). Aim sharper on hero pages (LCP < 1.5s, CLS < 0.05).
- **JS budget:** < ~300KB compressed/page, chunks ≤ 50KB. Code-split (`dynamic`/`React.lazy`); lazy-load below-fold + heavy libs (GSAP plugins, Three.js).
- **Images:** `next/image` (AVIF→WebP); `priority` on the single LCP image; correct `sizes`; always reserve width/height → CLS 0.
- **Fonts:** WOFF2, self-hosted, `font-display: swap` (or `optional`), preload only the 1–2 above-the-fold faces, variable font when many weights needed, subset via `unicode-range`. `next/font` handles metric-matching (zero font-swap CLS) automatically.
- **`prefers-reduced-motion` — reduce ≠ remove.** Kill vestibular triggers (large translate/scale/parallax/spin, smooth-scroll, scrub, autoplay); **keep gentle opacity/color fades** (often better than instant snaps). Build static-base → enable motion on `no-preference`:
  ```css
  .thing { /* static */ }
  @media (prefers-reduced-motion: no-preference) { .thing { transition: transform .3s; } }
  ```
  In JS branch on `matchMedia('(prefers-reduced-motion: reduce)')`; don't even init Lenis/3D when set. Prefer this over the blunt global `*{animation-duration:.01ms!important}` reset.
- **A11y baseline:** semantic HTML (`<button>`/`<a>`/`<nav>`/`<main>`, heading order), visible `:focus-visible` rings (never `outline:none` without a replacement), keyboard nav reachable through pinned/horizontal sections, `aria-label` on icon buttons, `aria-live` for async/state changes, 44×44px tap targets, decorative grain/noise `aria-hidden`. Custom cursor must not hide the focus path or block clicks (`pointer-events:none`), and never ships on touch.

---

## 7. Tech stack & composition

**Pick the lightest stack that does the job.**
- **Static HTML + Tailwind + GSAP (CDN) + Lenis** — landing pages, microsites, one-pagers. No React tax, fastest LCP/INP. A single GSAP+ScrollTrigger include does ~90% of "award-looking" effects. Many FWA-tier sites are exactly this.
- **Next.js (App Router) + Tailwind + Lenis + GSAP/ScrollTrigger + (optional) R3F** — scroll-narrative showpieces: pinned sequences, horizontal scroll, scrubbed reveals, 3D hero.
- **Next.js + Tailwind + shadcn/ui + Motion (Framer Motion)** — app/product UI where motion is component-local (layout/presence/gesture).

**Composition rules:** GSAP for scroll-cinema, Motion for component UI — **never run both on the same property.** Sync Lenis to GSAP's ticker (one RAF). Lazy-mount R3F/Three.

**Which skill in this repo to reach for:**
| Need | Skill |
|---|---|
| Overall design taste / aesthetic direction | `frontend-design`, `ui-ux-pro-max` |
| shadcn/ui + Tailwind component implementation | `ui-styling`, `tailwind-theme-builder` |
| Tailwind v4 + shadcn theming / dark mode wiring | `tailwind-theme-builder` |
| Scroll reveals, pinning, parallax, scrubbing | `gsap-scrolltrigger` |
| React component motion, gestures, presence | `motion-framer` |
| Pre-built animated React "wow" components | `aceternity-ui` |
| 3D hero / WebGL scene (vanilla) | `threejs-webgl` |
| 3D in React (declarative) | `react-three-fiber` |
| Single-file marketing/landing page | `landing-page` |
| Multi-component React artifact | `web-artifacts-builder` |
| Critique an existing UI | `design-review`, `design-auditor` |
| Design tokens / theming / cross-platform (web+mobile) design system | `design-system` |
| Entertainment UX patterns (movies/music/games/stories/tournaments, super-app IA) | `entertainment-platform-ui` |
| Video/audio players, captions, persistent mini-player | `media-playback` |
| Catalog/browse/feed performance + search & discovery | `media-catalog-performance` |
| Live scores, leaderboards, brackets, presence, real-time | `realtime-live-ui` |

---

## 8. The AI-slop kill-list

Forbid every one of these (use as a negative prompt):

- **Color:** purple/indigo/violet gradient hero; gradient text; mesh-gradient or floating "blob" backgrounds; pure-white flat background; pure `#000` dark mode; timid evenly-spread palette; random hex with no token system.
- **Type:** Inter / Roboto / Arial for everything; only 1–2 sizes; weak display/body contrast; no distinctive display face.
- **Layout:** centered hero + headline + two buttons; three evenly-spaced icon/feature cards in a row; uniform 16px radius + 24px padding everywhere; identical card heights; everything symmetric; no asymmetry; no broken grid.
- **Components:** generic `rounded-lg` cards; 0.1-opacity shadow on everything; default forms with no validation/error/empty/loading states; emoji used as icons; missing hover/focus states.
- **Imagery:** stock photos (diverse-team-at-laptops); over-smooth plastic AI illustrations; no real product/brand assets.
- **Copy:** vague aspirational headlines ("Build the future of X," "Your all-in-one platform"); hedging; superlatives ("best-in-class," "cutting-edge"); Lorem ipsum. Test: *would the actual founder say this sentence?*
- **Motion:** one duration for everything; ease-in/linear on UI; 600ms+ hovers; re-animating on scroll-back; scale-from-0 pops; aggressive parallax; heavy/laggy smooth scroll; ignoring `prefers-reduced-motion`; eager-loaded 3D; "animate because we can."
- **Concept:** decoration with no idea; effects with no meaning; no signature moment.

---

## 9. Pre-ship checklist

- [ ] One clear aesthetic direction, executed precisely — and one signature "wow" moment.
- [ ] Charcoal premium dark (not `#000`), one disciplined accent, OKLCH tokens, consistent across all pages.
- [ ] Distinctive display font + readable body; fluid `clamp()` type; measure ≤ ~66ch; body line-height 1.5–1.7.
- [ ] Asymmetric/intentional layout on an 8px spacing scale; no centered-hero-+-3-cards.
- [ ] Motion is slight: ease-out, sub-300ms UI, reveals fire once, content readable instantly, capped staggers.
- [ ] Parallax subtle (5–15%); 3D lazy-mounted, paused offscreen, disabled on low-power/reduced-motion.
- [ ] Animate only transform/opacity; `will-change` added/removed around the moment.
- [ ] LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; JS < 300KB; images sized + AVIF/WebP; fonts WOFF2 + preloaded.
- [ ] `prefers-reduced-motion` swaps to opacity/none (not deleted); a11y: semantic HTML, focus-visible, keyboard, contrast AA, 44px targets.
- [ ] Every interactive component has hover/active/focus/loading/success/error/empty/disabled states.
- [ ] Real copy, real assets — zero Lorem ipsum, zero slop from §8.

---

*Sources behind this playbook (web research, May 2026): Awwwards judging-criteria breakdowns; anti-AI-slop design guides (925studios, techbytes, prg.sh); Pimp My Type / Smashing (typography numbers); dark-mode palette references; Emil Kowalski animations.dev, Motion & GSAP docs, Lenis, easings.net (motion); web.dev Core Web Vitals, Next.js, shadcn/ui, MDN View Transitions & prefers-reduced-motion, Josh W. Comeau (tech & a11y). Studios worth studying: Active Theory, Locomotive, Obys, Resn, Cuberto, Immersive Garden.*
