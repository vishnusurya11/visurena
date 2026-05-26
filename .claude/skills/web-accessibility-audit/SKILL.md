---
name: web-accessibility-audit
description: "Hands-on accessibility (a11y) audit + remediation workflow using real tooling: run the tools, find issues, fix them, verify. Covers axe-core / axe DevTools, Lighthouse, WAVE, Pa11y; automated test setup (eslint-plugin-jsx-a11y, @axe-core/playwright, jest-axe); keyboard-nav testing; screen-reader testing (VoiceOver / NVDA); color contrast; focus management & visible focus; ARIA APG patterns; and a combined automated+manual checklist. Use when the user asks to make a site/component accessible, run an a11y audit, set up accessibility testing or CI, fix WCAG failures, test keyboard navigation, test with a screen reader, fix focus traps in modals, add aria, or verify accessibility. This is the practical run-and-fix loop; for rule-based design critique see the design-auditor skill, and for dark-mode contrast specifics see dark-mode-mastery."
compatibility: claude-code-only
---

# Web Accessibility Audit

A practical **audit → fix → verify** loop using real tools. This skill complements **design-auditor** (which flags issues from a rule set on screenshots/Figma/code) — here we *run actual tooling*, reproduce issues, remediate, and re-test.

## The #1 thing to internalize

**Automated tools catch only ~30–40% of WCAG issues** (Deque's own study: axe finds ~57% of *issues it can measure*, but only ~30% of *success criteria* are machine-testable). Passing axe is necessary, **not sufficient**. Never tell a user "it passes axe, so it's accessible." Real accessibility requires the manual layer: keyboard, screen reader, focus, and human judgment on alt text, reading order, and meaning.

## The Workflow

```
1. Static analysis      eslint-plugin-jsx-a11y         (in editor / pre-commit)
2. Automated component  jest-axe / @axe-core/playwright (in test suite / CI)
3. Automated page       axe DevTools, Lighthouse, WAVE, Pa11y (manual + CI)
4. MANUAL keyboard      tab through everything, no mouse
5. MANUAL screen reader VoiceOver (Mac) / NVDA (Windows)
6. MANUAL judgment      alt text, reading order, focus mgmt, reduced motion
7. Fix + re-run 1-6     verify each fix actually resolves the issue
```

Layers 1–3 are cheap and fast — automate them first. Layers 4–6 are where the real issues live.

---

## Step 1 — Static analysis: `eslint-plugin-jsx-a11y`

Catches missing `alt`, invalid ARIA, label-less inputs, etc. *as you type* (React/JSX). Cheapest possible feedback.

```bash
npm i -D eslint-plugin-jsx-a11y
```

Flat config (ESLint 9+, `eslint.config.js`):

```js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  jsxA11y.flatConfigs.recommended,   // or .flatConfigs.strict
  {
    rules: {
      // tighten beyond recommended where it matters:
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/anchor-is-valid': 'error',
    },
  },
];
```

Legacy `.eslintrc`: `"extends": ["plugin:jsx-a11y/recommended"]`.

Caveat: static analysis can't see runtime ARIA, dynamic content, or computed contrast. It's layer 1 of many.

## Step 2 — Component tests: `jest-axe` and `@axe-core/playwright`

### jest-axe (unit/JSDOM)

```bash
npm i -D jest-axe @testing-library/react
```

```js
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button';

expect.extend(toHaveNoViolations);

test('Button has no axe violations', async () => {
  const { container } = render(<Button>Save</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();   // prints exact rule + node on failure
});
```

JSDOM can't compute layout/contrast — color-contrast checks are unreliable here. Use real-browser tests (Playwright) for contrast.

### @axe-core/playwright (real browser, full page)

```bash
npm i -D @playwright/test @axe-core/playwright
```

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page has no detectable a11y violations', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

// Scope to a region (e.g. test a modal in its open state)
test('open dialog is clean', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open settings' }).click();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(results.violations).toEqual([]);
});
```

This catches real-browser color-contrast and runs against the *interactive* state — critical for SPA/dynamic content the static tools miss.

## Step 3 — Page-level scanners

| Tool | Use it for | How |
|---|---|---|
| **axe DevTools** (browser ext) | Interactive triage on a real page; "guided tests" for things axe can't auto-check | Install extension, open DevTools → axe panel → Scan |
| **Lighthouse** | Quick a11y score + common issues; CI gate | Chrome DevTools → Lighthouse, or `npx lighthouse <url> --only-categories=accessibility` |
| **WAVE** (WebAIM) | Visual overlay of issues, contrast, structure/headings | wave.webaim.org or the extension |
| **Pa11y / pa11y-ci** | Headless CLI scans across many URLs in CI | `npx pa11y https://example.com` or `pa11y-ci` with a config |

Lighthouse and axe-the-engine share rules, so don't treat them as independent confirmation. WAVE's structural/heading overlay is genuinely complementary.

```bash
npx pa11y https://example.com --standard WCAG2AA
```

## Step 4 — Manual keyboard testing (do this every audit)

No mouse. `Tab` / `Shift+Tab` / `Enter` / `Space` / arrow keys / `Esc`.

- [ ] Every interactive element is reachable with `Tab` and operable with keyboard
- [ ] **Visible focus indicator** on every focusable element (never `outline: none` without a replacement — WCAG 2.2 adds 2.4.11 Focus Not Obscured + 2.4.13 Focus Appearance)
- [ ] Focus order matches visual/reading order
- [ ] No keyboard trap (you can always `Tab` back out) — except *intentional, escapable* modal traps
- [ ] Modal/dialog: focus moves in on open, is trapped while open, `Esc` closes, focus returns to the trigger on close
- [ ] Skip link to main content is present and works
- [ ] Custom widgets implement the keyboard interactions their ARIA APG pattern requires (see Step 6)

## Step 5 — Screen reader testing

Test with at least one screen reader; ideally NVDA (Windows, ~65% of users) and VoiceOver (Mac/iOS).

**VoiceOver (macOS):** `Cmd+F5` to toggle. `Ctrl+Option` = "VO" modifier. `VO+→`/`←` navigate; `VO+Cmd+H` next heading; `VO+U` opens the rotor (lists headings/links/landmarks/form controls). Test in Safari (best VO pairing).

**NVDA (Windows, free):** Download from nvaccess.org. `Insert`/`CapsLock` = NVDA modifier. `H` next heading, `D` next landmark, `F` next form field, `K` next link; `NVDA+F7` opens the elements list. Test in Firefox or Chrome.

What to listen for:
- [ ] Every control announces a meaningful **name, role, and state** ("Save, button"; "Settings, dialog"; "Menu, expanded")
- [ ] Images: meaningful `alt`, or `alt=""`/`aria-hidden` if decorative
- [ ] Headings form a logical outline (no skipped levels used for sizing)
- [ ] Forms: each input has an associated `<label>`; errors are announced (e.g. `aria-live`, `aria-describedby`)
- [ ] Dynamic updates announced via live regions where appropriate (`aria-live="polite"`/`role="status"`)
- [ ] Reading order makes sense; no "clickable div" that's silent or mislabeled

## Step 6 — ARIA APG patterns (build custom widgets right)

For any custom widget (tabs, combobox, menu, dialog, disclosure, accordion, slider, tree), follow the **ARIA Authoring Practices Guide** pattern: it specifies the exact roles, states, and keyboard interactions. Don't invent ARIA.

**First law of ARIA: no ARIA is better than bad ARIA.** Prefer native HTML (`<button>`, `<a href>`, `<input>`, `<details>`/`<summary>`, `<dialog>`) — it ships correct semantics, focus, and keyboard behavior for free. Reach for ARIA only when no native element fits.

See `references/aria-patterns.md` for the dialog and tabs patterns with full keyboard maps and copy-pasteable markup.

---

## Edge Cases & Pitfalls

- **"Passes axe = accessible" fallacy:** automated tools cover ~30–40% of WCAG. They cannot judge alt-text quality, reading order, meaningful focus order, or whether an interaction makes sense. Always do Steps 4–6.
- **Dynamic / SPA content:** scanners check a single DOM snapshot. Route changes, modals, toasts, infinite scroll, and async loads need their *own* tests in the relevant state (open the modal, then scan — see Step 2 `.include()`). On client-side route change, move focus to the new view / `<h1>` and announce it.
- **Focus traps in modals:** a dialog *should* trap focus while open — but it must be escapable (`Esc`), restore focus to the trigger on close, and not trap the whole page permanently. A trap with no exit is a WCAG failure (2.1.2 No Keyboard Trap).
- **Screen-reader-only content:** use a proper `.sr-only` (visually-hidden) utility, not `display:none` (removes it from the a11y tree) and not `visibility:hidden`. `aria-label`/`aria-labelledby` are alternatives, but visible text is preferred.
- **Reduced motion:** honor `@media (prefers-reduced-motion: reduce)` — disable/replace non-essential animation, parallax, autoplay. Don't gate functionality behind motion.
- **Testing only with tools, never with real AT:** automated + real assistive-technology testing reveal different things. Budget time to actually drive NVDA/VoiceOver — and, when possible, include users who rely on AT.
- **Contrast in JSDOM:** jest-axe can't compute real contrast (no layout). Run color-contrast checks in a real browser (Playwright/axe DevTools/WAVE).
- **`tabindex` misuse:** never use positive `tabindex` (breaks order). `tabindex="0"` makes something focusable; `tabindex="-1"` makes it programmatically focusable (e.g. for `focus()` on a heading after route change) but not in the tab sequence.
- **Decorative vs meaningful images:** `alt=""` for decorative (so SR skips it); descriptive `alt` for meaningful; never omit the attribute (some SRs read the filename).

---

## Combined Automated + Manual Checklist

Automated (CI):
- [ ] `eslint-plugin-jsx-a11y` in lint, no errors
- [ ] `jest-axe` on key components, no violations
- [ ] `@axe-core/playwright` on key pages *and* interactive states (modals open, menus expanded)
- [ ] Lighthouse a11y and/or `pa11y-ci` gate in CI

Manual (every audit):
- [ ] Full keyboard pass (Step 4 list)
- [ ] Visible focus on everything; WCAG 2.2 focus criteria met
- [ ] Screen-reader pass with NVDA and/or VoiceOver (Step 5 list)
- [ ] Headings form a logical outline
- [ ] Alt text is meaningful / decorative images hidden
- [ ] Forms: labels associated, errors announced
- [ ] Color contrast verified in a real browser (text 4.5:1, large/UI 3:1)
- [ ] `prefers-reduced-motion` honored
- [ ] Custom widgets follow their ARIA APG pattern
- [ ] Re-ran tools after fixes — issues actually gone, no regressions

---

## Reference Files

- `references/aria-patterns.md` — dialog + tabs APG patterns (roles, full keyboard maps, markup), `.sr-only` utility, reduced-motion snippet
- `references/ci-setup.md` — wiring axe-playwright + Lighthouse + pa11y-ci into GitHub Actions, failing the build on violations

## Sibling Skills

- **design-auditor** — rule-based design/a11y critique from screenshots, Figma, or code (the "flag from rules" companion to this run-and-fix skill)
- **dark-mode-mastery** — dark-theme contrast and legibility specifics

## Official Documentation

- WCAG 2.2 Quick Reference (filterable success criteria): https://www.w3.org/WAI/WCAG22/quickref/
- ARIA Authoring Practices Guide (patterns): https://www.w3.org/WAI/ARIA/apg/
- ARIA APG — Patterns index: https://www.w3.org/WAI/ARIA/apg/patterns/
- Deque axe (overview): https://www.deque.com/axe/
- axe-core (rules + engine): https://github.com/dequelabs/axe-core
- @axe-core/playwright: https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md
- jest-axe: https://github.com/nickcolley/jest-axe
- eslint-plugin-jsx-a11y: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
- Playwright accessibility testing guide: https://playwright.dev/docs/accessibility-testing
- Lighthouse accessibility: https://developer.chrome.com/docs/lighthouse/accessibility/scoring
- Pa11y: https://pa11y.org/
- WebAIM (articles, WCAG checklist, contrast checker): https://webaim.org/
- NVDA (download): https://www.nvaccess.org/download/
- WebAIM — Using VoiceOver: https://webaim.org/articles/voiceover/
