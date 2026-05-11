---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

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

Remember: Codex is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

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

## Accessibility as Quality Signal

Accessibility and design quality are the same thing measured differently. Good a11y forces the design decisions that make interfaces work for everyone:

- **Color contrast**: WCAG AA minimum (4.5:1 text, 3:1 UI elements). OKLCH makes this predictable — `oklch(40% 0.2 240)` on white will always contrast; you can verify without guessing.
- **Focus states**: Visible, styled focus rings are design elements, not dev oversights. Style them with `outline` + `outline-offset` to match your aesthetic. Never remove focus outlines without replacing them.
- **Semantic HTML**: Use `<button>` for actions, `<a>` for navigation, proper heading hierarchy (`h1` → `h2` → `h3`). Semantic structure improves keyboard navigation, screen reader output, and SEO simultaneously.
- **Interactive targets**: Minimum 44×44px tap targets on mobile. Small targets are bad design, not just bad a11y.
- **State announcements**: Dynamic content changes (loading, errors, success) need `aria-live` regions or equivalent so screen readers announce them.

Using Radix UI or shadcn/ui as a component foundation bakes most of this in automatically.

## Modern CSS Tools Worth Using

- **Container queries** (`@container`): Make components adapt to their parent's width, not the viewport. Enables true component portability — the same card works at 300px sidebar width and 800px main content width.
- **`@starting-style`**: Animate elements entering the DOM from `display:none` without JavaScript delays. Clean entry animations for modals, toasts, dropdowns.
- **View Transitions API**: Page-level or component-level transitions with `document.startViewTransition()`. Baseline browser support as of 2025 — use it for SPA navigation feel.
- **`@layer`**: Organize CSS into explicit cascade layers to eliminate specificity wars between base styles, components, and utilities.
