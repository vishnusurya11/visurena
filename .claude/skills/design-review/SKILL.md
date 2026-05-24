---
name: design-review
description: "Review a web app or page for visual design quality — layout, typography, spacing, colour, hierarchy, consistency, interaction patterns, and responsive behaviour. Not a UX audit (that checks usability) — this checks whether it looks professional and polished. Produces a design findings report with screenshots. Triggers: 'design review', 'does this look good', 'review the design', 'check the layout', 'is this polished', 'visual review', 'design audit', 'make it look better', 'it looks off'."
compatibility: claude-code-only
---

# Design Review

Review a web app or page for visual design quality. This is not a UX audit (usability, workflow, friction) — this checks whether the design is **professional, consistent, and polished**.

The goal: would a design-conscious person look at this and think "this is well made" or "this looks like a developer designed it"?

## When to Use

- Before showing something to a client or team
- When something "looks off" but you can't pinpoint why
- After building a feature, before calling it done
- Periodic quality check on a shipped product
- After a UX audit — this is the visual companion

## Browser Tool Detection

Same as ux-audit — Chrome DevTools MCP, Playwright MCP, or playwright-cli. To exercise the motion and responsive checks below you need a tool that can: resize the viewport, hover/focus elements, scroll the page, and screenshot. All three options can do this.

- **Chrome DevTools MCP** — [github.com/ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) (best for performance traces, CLS, network; supports `emulate` for viewport + reduced-motion). Setup: [developer.chrome.com/blog/chrome-devtools-mcp](https://developer.chrome.com/blog/chrome-devtools-mcp).
- **Playwright MCP** — [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) (`@playwright/mcp@latest`; accessibility-snapshot driven, good for hover/focus/keyboard).

## URL Resolution

Same as ux-audit — prefer deployed/live over localhost.

## Reference Standards (official)

| Need | Source |
|------|--------|
| Contrast minimums, focus-visible, target size — the criteria | [WCAG 2.2 Quick Reference (W3C WAI)](https://www.w3.org/WAI/WCAG22/quickref/) — Contrast (Minimum) **1.4.3** = 4.5:1 body / 3:1 large; Non-text Contrast **1.4.11** = 3:1 UI/graphics; Focus Visible **2.4.7**; Focus Appearance **2.4.11**; Target Size (Minimum) **2.5.8** = 24×24 CSS px |
| Verify a specific text/background pair | [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) · [WebAIM Link Contrast Checker](https://webaim.org/resources/linkcontrastchecker/) (links need 3:1 vs surrounding text *and* 4.5:1 vs background) |
| How to evaluate contrast & colour in practice | [WebAIM: Evaluating Contrast](https://webaim.org/articles/contrast/evaluating) |
| Reduced-motion behaviour | [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |

## What to Check

### 1. Layout and Spacing

| Check | Good | Bad |
|-------|------|-----|
| **Consistent spacing** | Same gap between all cards in a grid, same padding in all sections | Some cards have 16px gap, others 24px. Header padding differs from body |
| **Alignment** | Left edges of content align vertically across sections | Heading starts at one indent, body text at another, cards at a third |
| **Breathing room** | Generous whitespace around content, elements don't feel cramped | Text touching container edges, buttons crowded against inputs |
| **Grid discipline** | Content follows a clear column grid | Elements placed freely, no underlying structure |
| **Responsive proportions** | Sidebar/content ratio looks intentional at every width | Sidebar takes 50% on tablet, content is squeezed |
| **Vertical rhythm** | Consistent vertical spacing pattern (e.g. 8px/16px/24px/32px scale) | Random spacing: 13px here, 27px there, 8px somewhere else |

### 2. Typography

| Check | Good | Bad |
|-------|------|-----|
| **Hierarchy** | Clear visual difference between h1 → h2 → h3 → body | Headings and body text look the same size/weight |
| **Line length** | Body text 50-75 characters per line | Full-width text running 150+ characters — hard to read |
| **Line height** | Body text 1.5-1.7, headings 1.1-1.3 | Cramped text or excessive line height |
| **Font sizes** | Consistent scale (e.g. 14/16/20/24/32) | Random sizes: 15px, 17px, 22px with no relationship |
| **Weight usage** | Regular for body, medium for labels, semibold for headings, bold sparingly | Everything bold, or everything regular with no hierarchy |
| **Truncation** | Long text truncates with ellipsis, title attribute shows full text | Text overflows container, wraps awkwardly, or is cut off without ellipsis |

### 3. Colour and Contrast

| Check | Good | Bad |
|-------|------|-----|
| **Semantic colour** | Using design tokens (bg-primary, text-muted-foreground) | Raw Tailwind colours (bg-blue-500, text-gray-300) |
| **Contrast ratio** | Text meets WCAG AA (4.5:1 for body, 3:1 for large text) | Light grey text on white, or dark text on dark backgrounds |
| **Colour consistency** | Same blue means the same thing everywhere (primary = action) | Blue means "clickable" in one place and "informational" in another |
| **Dark mode** | All elements visible, borders defined, no invisible text | Elements disappear, text becomes unreadable, images look wrong |
| **Status colours** | Green=success, yellow=warning, red=error consistently | Green used for both success and "active" with different meanings |
| **Colour overuse** | 2-3 colours + neutrals | Rainbow of colours with no clear hierarchy |

### 4. Visual Hierarchy

| Check | Good | Bad |
|-------|------|-----|
| **Primary action** | One clear CTA per page, visually dominant | Three equally styled buttons competing for attention |
| **Squint test** | Squinting at the page, the most important element stands out | Everything is the same visual weight — nothing draws the eye |
| **Progressive disclosure** | Most important info visible, details available on interaction | Everything shown at once — overwhelming |
| **Grouping** | Related items are visually grouped (proximity, borders, backgrounds) | Related items scattered, unrelated items touching |
| **Negative space** | Intentional empty space that frames content | Empty space that looks accidental (uneven, trapped white space) |

### 5. Component Consistency

| Check | Good | Bad |
|-------|------|-----|
| **Button styles** | One primary style, one secondary, one destructive — used consistently | 5 different button styles across the app |
| **Card styles** | All cards have the same border-radius, shadow, padding | Some cards rounded, some sharp, some with shadows, some without |
| **Form inputs** | All inputs same height, same border style, same focus ring | Mix of heights, border styles, focus behaviours |
| **Icon style** | One icon family (Lucide, Heroicons), consistent size and stroke | Mixed icon families, different sizes, some filled some outlined |
| **Border radius** | Consistent radius scale (e.g. 4px inputs, 8px cards, 12px modals) | Random radius values: 3px, 7px, 10px, 16px |
| **Shadow** | One or two shadow levels used consistently | Every component has a different shadow depth |

### 6. Interaction & Motion

Static screenshots hide half the design. You must **drive** the page: hover each interactive element, tab through it, scroll it top-to-bottom, and re-test with reduced-motion on. A design that looks great frozen can feel cheap or broken in motion.

| Check | Good | Bad |
|-------|------|-----|
| **Hover states** | Buttons, links, and clickable cards change on hover (colour/elevation/scale) | No hover feedback — user unsure what's clickable |
| **Hover targets vs feedback** | The whole clickable area responds, cursor is `pointer` | Only the text label reacts; padding is dead; cursor stays `default` |
| **Focus states** | Visible focus ring on all interactive elements, ≥3:1 vs background (WCAG 2.4.7/2.4.11) | Focus ring missing, removed via `outline:none`, or invisible against background |
| **Active/selected states** | Nav items, tabs, sidebar links show current selection distinctly | Active item looks the same as inactive |
| **Transition timing** | Micro-interactions 150–250ms, ease-out on enter; transitions `transform`/`opacity` only | No transitions (jarring snap), >400ms (laggy), or animating `width`/`height`/`top`/`left` (janky) |
| **Hover scale discipline** | Subtle lift (`scale(1.02)`, shadow bump); does not reflow neighbours | Big jumps that shift surrounding layout, or scale on a non-`transform` property |
| **Scroll reveals** | Reveal-on-scroll fires once, slightly before the element enters view, then stays | Elements re-animate every scroll, pop in late, or flash empty then fill |
| **Scroll/parallax smoothness** | 60fps, subtle depth; honours reduced-motion | Janky scroll-jacking, content that overshoots, motion sickness risk |
| **Loading indicators** | Skeleton screens or spinners during async; reserved space (no CLS) | Content pops in without warning, layout shifts (high CLS) |
| **Disabled states** | Disabled elements muted (opacity ~0.4–0.5), `cursor: not-allowed`, no hover effect | Disabled buttons look clickable, still hover, no cursor change |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` disables/dampens non-essential motion | Animations ignore the preference — accessibility + comfort failure |

**How to actually test motion (don't eyeball static shots):**
1. Hover every button, link, and card; screenshot the hover state. Note anything with no feedback or layout shift.
2. Tab through the page from the top; confirm a visible focus ring on each stop, in tab order matching visual order.
3. Scroll slowly top-to-bottom watching reveal/parallax behaviour; then scroll back up — do reveals replay or stay?
4. Enable reduced motion and reload, then repeat the scroll. Chrome DevTools MCP: emulate `prefers-reduced-motion: reduce`. Playwright: launch context with `reducedMotion: 'reduce'`. Motion should noticeably calm down.
5. If a tool can throttle CPU (Chrome DevTools), scroll under 4× throttle to expose jank that hides on a fast machine.

### 7. Responsive Quality

Don't review only at your window width. **Test at three breakpoints** and run the per-width checklist at each. Resize the actual viewport (Chrome DevTools MCP `resize_page` / `emulate` device; Playwright `page.setViewportSize`), reload if layout is JS-driven, and screenshot each width.

| Breakpoint | Width × Height | What to look for specifically |
|------------|----------------|-------------------------------|
| **Mobile** | 375 × 812 | Nav collapses to hamburger/sheet; **no horizontal scroll** (page width must equal viewport — check `document.documentElement.scrollWidth`); tap targets ≥44px and ≥8px apart; single-column stacking; body text still ≥16px (avoids iOS auto-zoom); fixed bars don't cover content; images don't overflow |
| **Tablet** | 768 × 1024 | The width most layouts forget — sidebar/content ratio looks intentional (not a squeezed 50/50); grids reflow to 2-col cleanly, not 3 cramped or stuck at 1; gutters scale up from mobile; no awkward trapped whitespace; landscape (1024×768) still works |
| **Desktop** | 1440 × 900 | Content respects a max-width (e.g. `max-w-6xl/7xl`) — text doesn't run 150+ chars edge-to-edge; hover states present (re-check §6); multi-column grids aligned; no giant empty side margins from a too-small container |

Per-width checks that always apply:

| Check | Good | Bad |
|-------|------|-----|
| **No horizontal scroll** | `scrollWidth === clientWidth` at every breakpoint | A stray wide element forces sideways scroll on mobile |
| **Image scaling** | Images fill containers proportionally (`object-fit`, `max-width:100%`) | Images stretched, cropped badly, or overflowing |
| **Table responsiveness** | Horizontal scroll *inside* the table, or stack to cards on mobile | Whole page wider than screen with no way to see columns |
| **Touch targets** | At least 44×44px on mobile, 8px+ spacing | Tiny links, close buttons, checkboxes packed together |
| **Breakpoint transitions** | Layout changes are deliberate at each step | Elements jump/overlap *between* breakpoints (e.g. 600–767px); resize slowly to catch this |

## Severity Guide

| Level | Meaning | Example |
|-------|---------|---------|
| **High** | Looks broken or unprofessional | Invisible text in dark mode, buttons different heights inline |
| **Medium** | Looks unpolished | Inconsistent spacing, mixed icon styles, truncation without ellipsis |
| **Low** | Nitpick | 1-2px alignment, slightly different border-radius, shadow too strong |

## Output

Write findings to `.jez/artifacts/design-review.md`:

```markdown
# Design Review: [App Name]
**Date**: YYYY-MM-DD
**URL**: [url]

## Overall Impression
[1-2 sentences — professional / unpolished / inconsistent / clean]

## Findings

### High
- **[issue]** at [page/component] — [what's wrong] → [fix]

### Medium
- **[issue]** at [page/component] — [what's wrong] → [fix]

### Low
- **[issue]** — [description]

## What Looks Good
[Patterns that are well-executed and should be preserved]

## Top 3 Fixes
1. [highest visual impact change]
2. [second]
3. [third]
```

Take screenshots of findings where the issue is visual (most of them).

## Example Findings (with code-level fixes)

Write findings this concretely — name the element, say what's wrong, give the fix as code.

**[High] Focus ring removed on primary buttons** — keyboard users can't see where they are (fails WCAG 2.4.7).
```css
/* Found */
button:focus { outline: none; }
/* Fix — visible ring with ≥3:1 contrast, doesn't disturb mouse users */
button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

**[High] Body text fails AA contrast** — `text-gray-400` (#9CA3AF) on white is **2.85:1**, below the 4.5:1 minimum (verify in [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)).
```html
<!-- Found -->  <p class="text-gray-400">Subtotal</p>   <!-- 2.85:1 ✗ -->
<!-- Fix   -->  <p class="text-gray-600">Subtotal</p>   <!-- #4B5563 = 7.0:1 ✓ -->
```

**[Medium] Card hover animates layout-shifting properties** — bumping `height`/`margin` reflows neighbours and stutters.
```css
/* Found */
.card:hover { margin-top: -4px; height: 212px; }
/* Fix — GPU-friendly transform + opacity only, honour reduced motion */
.card { transition: transform .2s ease-out, box-shadow .2s ease-out; }
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgb(0 0 0 / .12); }
@media (prefers-reduced-motion: reduce) { .card { transition: none; } .card:hover { transform: none; } }
```

**[Medium] Horizontal scroll on mobile** — a fixed-width hero (`width: 1200px`) overflows a 375px viewport.
```css
/* Found */  .hero { width: 1200px; }
/* Fix   */  .hero { width: 100%; max-width: 1200px; }   /* + check images: img { max-width: 100%; height: auto; } */
```

**[Medium] Disabled button looks clickable** — same colour, still shows pointer + hover.
```css
/* Fix */
button:disabled { opacity: .45; cursor: not-allowed; pointer-events: none; }
```

## Tips

- Check dark mode AND light mode — most issues appear in one but not the other
- The squint test is the fastest way to find hierarchy problems
- Component inconsistency is the most common issue in dev-built UIs
- "Looks off" usually means spacing — check margins and padding first
- Motion bugs only show when you interact — always hover, tab, and scroll; never review from a single static screenshot
- The 600–767px range (between mobile and tablet breakpoints) is where layouts most often break — resize slowly through it
- Always re-test scroll/animation with reduced-motion enabled; a "wow" effect that ignores the preference is a finding, not a feature
- If you can't identify the issue, compare to a well-designed app in the same category
