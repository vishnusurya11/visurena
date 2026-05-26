---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

> ## ⭐ Target: world-class, award-winning, on par with the best sites in the world
>
> For full-site/page work, the deep standard lives in the companion playbook (in the `modern-web-design` skill):
> **→ [`../modern-web-design/references/award-winning-playbook.md`](../modern-web-design/references/award-winning-playbook.md)** — read it for typography ratios, charcoal premium dark, tasteful/slight motion (easing + durations), subtle 3D + parallax done optimized, performance budgets, the AI-slop kill-list, and a pre-ship checklist.
>
> **This project = Visurena, an AI-powered entertainment hub.** House style: **charcoal premium dark** (near-black `#0E0E0E`–`#121212`, never pure `#000`; one disciplined accent; elevation via lighter surfaces), **slightly animated** (a few signature moments, lots of calm — restraint is the premium signal), **dynamic 3D/parallax depth** (subtle parallax 5–15%, optional WebGL hero), and **fully optimized** (60fps, fast LCP, lazy 3D, reduced-motion respected). Aim for one "wow" moment per page.
>
> **Compose the implementation skills** rather than hand-rolling everything: `gsap-scrolltrigger` (scroll reveals/parallax/pinning), `motion-framer` (React motion), `aceternity-ui` (animated components), `threejs-webgl`/`react-three-fiber` (3D), `tailwind-theme-builder` (theming/dark mode), `ui-styling`/`ui-ux-pro-max` (components + design intelligence).

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font. Apply letter-spacing: tighten display/hero text (`-0.02em` to `-0.04em`), loosen all-caps labels (`0.08em`+). Set `line-height: 1.5–1.6` for body. Use reduced opacity (`0.55–0.7`) for secondary text rather than just smaller size — the eye reads it as hierarchy, not weakness.
- **Color & Theme**: Commit to a cohesive aesthetic. Use OKLCH for colors (`oklch(65% 0.2 240)`) — it gives perceptual uniformity so `darken` and `lighten` operations look consistent across all hues, unlike HSL. Define primitive tokens (`--blue-500`) separate from semantic tokens (`--color-primary: var(--blue-500)`) so themes compose cleanly. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Spacing**: Use a consistent scale (base 4px or 8px) and reference it everywhere via CSS variables (`--space-1: 4px`, `--space-2: 8px`, `--space-4: 16px`…). Inconsistent spacing is the single most visible quality signal — the eye detects 4px misalignments subconsciously. Generous negative space signals confidence; controlled density signals precision. Both beat randomness.
- **Shadows & Depth**: Use soft shadows (low opacity 8–15%, high blur 8–16px, colored with a dark tint of the surface rather than pure black). Hard high-contrast shadows signal amateur work. Use 2–3 elevation levels max: cards get `0 4px 12px rgba(0,0,0,0.08)`, subtle interactive elements get `0 2px 6px rgba(0,0,0,0.05)`, flat elements get none.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (`animation-delay`) creates more delight than scattered micro-interactions. State transitions should use 200–300ms — fast enough to feel snappy, slow enough to feel intentional. Use `@starting-style` for entry animations from `display:none` without JS. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Bento-style unequal card grids create visual rhythm. Generous negative space OR controlled density — never randomness.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Component States (Production Completeness)

Every interactive component needs all its states designed, not just the idle state. Omitting states is the most common gap between a prototype and production UI:

- **Hover**: subtle shift — shadow increase OR color change, not both at max. 150–200ms transition.
- **Active/pressed**: scale 0.98–0.99 + color deepen. Snappy: 100ms.
- **Loading**: replace label with spinner or skeleton; don't just disable. Skeleton screens feel faster than spinners for content.
- **Success**: brief confirmation (icon swap, color flash) before returning to idle.
- **Error**: clear message, specific not generic ("Invalid email" not "Error"), always suggest the fix.
- **Empty state**: never just blank space. Show context-appropriate illustration/icon + a clear next action ("No items yet — create one").
- **Disabled**: reduced opacity (0.4–0.5) + `cursor: not-allowed`. Never make disabled states look identical to active ones.

For re-fetching (data already shown): use a subtle progress bar, not a spinner — the spinner flickers existing content.

### Copy-pasteable State Patterns

**Button with all interaction states (CSS).** Hover/active/focus-visible/disabled, reduced-motion aware:

```css
.btn {
  --btn-bg: oklch(62% 0.19 255);
  background: var(--btn-bg);
  color: oklch(98% 0 0);
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  border: 0;
  font: inherit;
  cursor: pointer;
  transition: background-color 180ms ease, box-shadow 180ms ease, transform 100ms ease;
}
.btn:hover  { background: color-mix(in oklch, var(--btn-bg), black 8%); }   /* shadow OR color, not both maxed */
.btn:active { transform: scale(0.98); transition-duration: 100ms; }         /* snappy press */
.btn:focus-visible {                                                        /* keyboard focus only */
  outline: 2px solid oklch(62% 0.19 255);
  outline-offset: 2px;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;   /* belt-and-suspenders so hover never fires */
}
@media (prefers-reduced-motion: reduce) {
  .btn { transition: none; }
  .btn:active { transform: none; }
}
```

**Button loading / success states (React).** Replace the label, never just disable; brief success confirmation before idle:

```tsx
type Status = "idle" | "loading" | "success" | "error";

function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");

  async function handle() {
    setStatus("loading");
    try {
      await onSave();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500); // confirm, then return to idle
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t save — try again");
      setStatus("error");
    }
  }

  return (
    <>
      <button className="btn" onClick={handle} disabled={status === "loading"}>
        {status === "loading" && <Spinner aria-hidden />}
        {status === "loading" ? "Saving…"
          : status === "success" ? "✓ Saved"
          : "Save"}
      </button>
      {/* state announcement for screen readers */}
      <p aria-live="polite" className="sr-only">
        {status === "loading" ? "Saving" : status === "success" ? "Saved" : ""}
      </p>
      {status === "error" && (
        <p role="alert" className="error">{err /* specific, with the fix */}</p>
      )}
    </>
  );
}
```

**Empty state (never blank space).** Context icon + the one clear next action:

```tsx
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty" role="status">
      <InboxIcon aria-hidden className="empty__icon" />
      <h3 className="empty__title">No projects yet</h3>
      <p className="empty__hint">Create your first project to get started.</p>
      <button className="btn" onClick={onCreate}>New project</button>
    </div>
  );
}
```

**Loading vs re-fetching content.** Skeleton on first load (feels faster than a spinner); thin progress bar when data is already on screen so existing content doesn’t flicker:

```tsx
function List({ items, isLoading, isRefetching }: Props) {
  if (isLoading) {                       // first load → skeletons
    return (
      <ul className="space-y-3" aria-busy="true" aria-label="Loading items">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="h-12 rounded-md bg-[oklch(92%_0_0)] animate-pulse" />
        ))}
      </ul>
    );
  }
  if (items.length === 0) return <EmptyState onCreate={/* … */} />;
  return (
    <div className="relative">
      {isRefetching && <div className="progress-bar" aria-hidden />}  {/* subtle bar, not a spinner */}
      <ul>{items.map((it) => <li key={it.id}>{it.label}</li>)}</ul>
    </div>
  );
}
```

**Input field states (hover/focus/invalid/disabled).** Pure CSS, accessible focus ring and error styling tied to validity:

```css
.field {
  border: 1px solid oklch(85% 0 0);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: oklch(99% 0 0);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.field:hover  { border-color: oklch(70% 0 0); }
.field:focus-visible {
  outline: none;
  border-color: oklch(62% 0.19 255);
  box-shadow: 0 0 0 3px oklch(62% 0.19 255 / 0.25);
}
.field:user-invalid {                       /* only after interaction, not on first paint */
  border-color: oklch(58% 0.2 25);
  box-shadow: 0 0 0 3px oklch(58% 0.2 25 / 0.2);
}
.field:disabled { opacity: 0.5; cursor: not-allowed; background: oklch(96% 0 0); }
```

**Entry animation without JS (`@starting-style`).** Toast/modal that animates in from `display:none` and out — note `transition-behavior: allow-discrete` is required to transition `display`:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 250ms ease, transform 250ms ease, display 250ms allow-discrete;
}
@starting-style {                  /* the "from" state on first render */
  .toast { opacity: 0; transform: translateY(8px); }
}
.toast[hidden] {                   /* exit */
  opacity: 0;
  transform: translateY(8px);
  display: none;
}
```

## Accessibility as Quality Signal

Accessibility and design quality are the same thing measured differently. Good a11y forces the design decisions that make interfaces work for everyone:

- **Color contrast**: WCAG AA minimum (4.5:1 text, 3:1 UI elements). OKLCH makes this predictable — `oklch(40% 0.2 240)` on white will always contrast; you can verify without guessing.
- **Focus states**: Visible, styled focus rings are design elements, not dev oversights. Style them with `outline` + `outline-offset` to match your aesthetic. Never remove focus outlines without replacing them.
- **Semantic HTML**: Use `<button>` for actions, `<a>` for navigation, proper heading hierarchy (`h1` → `h2` → `h3`). Semantic structure improves keyboard navigation, screen reader output, and SEO simultaneously.
- **Interactive targets**: Minimum 44×44px tap targets on mobile. Small targets are bad design, not just bad a11y.
- **State announcements**: Dynamic content changes (loading, errors, success) need `aria-live` regions or equivalent so screen readers announce them.

Using Radix UI or shadcn/ui as a component foundation bakes most of this in automatically.

## Modern CSS Tools Worth Using

- **Container queries** (`@container`): Make components adapt to their parent's width, not the viewport. Enables true component portability — the same card works at 300px sidebar width and 800px main content width. Baseline (size queries) since 2023; style/scroll-state queries reached Baseline 2026. Docs: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) · support: [caniuse](https://caniuse.com/css-container-queries)
- **`@starting-style`**: Animate elements entering the DOM from `display:none` without JavaScript delays. Clean entry animations for modals, toasts, dropdowns. Baseline 2024. Docs: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) · support: [caniuse](https://caniuse.com/css-starting-style)
- **View Transitions API**: Page-level or component-level transitions with `document.startViewTransition()`. Same-document transitions are Baseline as of 2025; cross-document (MPA) transitions are shipping but still stabilizing — use it for SPA navigation feel. Docs: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) · guide: [MDN: Using](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) · support: [caniuse](https://caniuse.com/view-transitions)
- **`@layer`**: Organize CSS into explicit cascade layers to eliminate specificity wars between base styles, components, and utilities. Baseline since 2022. Docs: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) · support: [caniuse](https://caniuse.com/css-cascade-layers)
- **OKLCH color** (`oklch()`): Perceptually-uniform color space — equal lightness steps look equally different, so theme lighten/darken stays consistent across hues. Baseline since 2023. Docs: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) · support: [caniuse](https://caniuse.com/mdn-css_types_color_oklch)
- **`color-mix()`**: Mix two colors in a chosen color space — pairs perfectly with OKLCH to derive tints/shades/state colors from one token. Docs: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) · support: [caniuse](https://caniuse.com/mdn-css_types_color_color-mix)

## References

- **MDN Web Docs** (authoritative CSS/HTML/JS reference): https://developer.mozilla.org/
- **Can I Use** (browser support tables): https://caniuse.com/
- **web.dev Baseline** (cross-browser feature readiness): https://web.dev/baseline/
- `prefers-reduced-motion` — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) · [caniuse](https://caniuse.com/prefers-reduced-motion)
- CSS scroll-driven animations (`animation-timeline`, `scroll()`, `view()`) — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-driven_animations) · [caniuse](https://caniuse.com/css-scroll-timeline)
- `transition-behavior: allow-discrete` (needed to transition `display`) — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior)
- WCAG 2.2 (accessibility criteria, incl. motion & contrast) — https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices (interaction patterns) — https://www.w3.org/WAI/ARIA/apg/

## Animation & Interaction Edge Cases

The gap between "animated" and "polished" is in handling these correctly. Most janky AI-built UIs fail exactly here.

- **Always honor `prefers-reduced-motion`.** Vestibular-sensitive users can get nauseated by parallax, large translations, and auto-playing motion. Wrap non-essential motion in `@media (prefers-reduced-motion: reduce)` and reduce to opacity-only or none. This is a WCAG requirement, not a nicety. Reduced-motion ≠ no-motion: a quick fade is fine; a 600px slide is not.
- **Animate only `transform` and `opacity` for 60fps.** These are GPU-compositable and skip layout/paint. Animating `width`, `height`, `top`/`left`, `margin`, or `box-shadow` triggers layout/paint every frame and stutters. For shadows, animate a pseudo-element's `opacity` instead. For size changes, prefer `transform: scale()` or the `scale`/`translate` individual properties.
- **Don't animate `height: auto`.** It can't be transitioned directly. Use a CSS grid `grid-template-rows: 0fr → 1fr` trick, `calc-size()` where supported, or measure-and-animate with JS. Same for `display: none` → visible: you need `transition-behavior: allow-discrete` plus `@starting-style`.
- **Layout shift from entrance animations (CLS).** Elements that fade/slide in must already occupy their final space (reserve dimensions, `aspect-ratio`, `min-height`) or they shove the page and tank Cumulative Layout Shift. Animate `opacity`/`transform`, not properties that change flow.
- **Scroll-jacking and over-pinning.** Hijacking scroll velocity or pinning long sections frustrates users and breaks trackpads/keyboards/screen-readers. Keep parallax subtle (5–15% offset), never trap the scroll, and make sure content is reachable without the animation.
- **Hover effects are desktop-only.** `:hover` fires unpredictably (or sticks) on touch — never gate essential info or actions behind hover. Provide a tap/focus path, and use `@media (hover: hover) and (pointer: fine)` to scope hover-dependent flourishes.
- **Respect timing budgets.** UI state transitions feel right at 150–300ms; page/section transitions 300–500ms; anything over ~500ms feels sluggish. Use eased curves (`ease-out` for entrances, `ease-in` for exits) — linear motion reads as cheap. Spring physics (Motion) beats fixed durations for interactive drags/gestures.
- **Stagger, don't strobe.** One orchestrated staggered reveal on load (50–80ms between items, capped at ~8 items) delights; dozens of independent micro-animations firing at once create chaos and contention. Cap concurrent animations.
- **Cancel/interrupt cleanly.** Rapid hover-in/hover-out or re-triggered animations must interrupt gracefully — use `transition` (auto-interrupts) over chained `@keyframes`, and in JS cancel in-flight animations (`Animation.cancel()`, AbortController, or Motion's interruptible springs) so they don't queue and lag.
- **`will-change` is a loaded gun.** It promotes elements to their own layer — useful for a known-imminent animation, but leaving it on many elements balloons GPU memory and *hurts* performance. Add it just before animating, remove it after; don't sprinkle it globally.
- **Infinite/auto-playing animations cost battery and attention.** Looping backgrounds, marquees, and spinners should pause off-screen (`IntersectionObserver`) and under reduced-motion. An always-spinning hero drains mobile batteries.
- **Focus must survive animated transitions.** When a modal/drawer animates in, move focus to it after the transition and trap it; on close, return focus to the trigger. View Transitions and `@starting-style` animate visuals but don't manage focus — that's still your job.
- **Test on a throttled mid-tier device.** A 120Hz desktop hides jank that a mid-range Android exposes instantly. Profile with CPU throttling (Chrome DevTools 4–6×) before calling motion "smooth."
