# ARIA APG Patterns (copy-pasteable)

Source of truth: ARIA Authoring Practices Guide — https://www.w3.org/WAI/ARIA/apg/patterns/

**First law of ARIA:** prefer native HTML. `<button>`, `<a href>`, `<input>`, `<details>/<summary>`, `<dialog>` give correct role, focus, and keyboard behavior for free. Use ARIA only when no native element fits, and then follow the pattern exactly.

---

## Modal Dialog

APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

Native `<dialog>` handles most of this (focus trap, `Esc`, backdrop) — prefer it:

```html
<button id="open">Open settings</button>
<dialog id="dlg" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Settings</h2>
  <!-- content -->
  <button id="close">Close</button>
</dialog>
<script>
  const dlg = document.getElementById('dlg');
  open.addEventListener('click', () => dlg.showModal()); // traps focus, Esc closes
  close.addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => open.focus());      // restore focus to trigger
</script>
```

If you must build a custom dialog with `role="dialog"`:

Required:
- `role="dialog"` + `aria-modal="true"`
- Accessible name via `aria-labelledby` (title) or `aria-label`
- On open: move focus into the dialog (first focusable, or the dialog/heading with `tabindex="-1"`)
- While open: **trap** Tab/Shift+Tab inside; content behind is inert (use `inert` on the rest of the page)
- `Esc` closes
- On close: **return focus to the element that opened it**

Keyboard:
| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Cycle focusable elements within the dialog (wraps) |
| `Esc` | Close the dialog |

Pitfall: a focus trap with no `Esc`/close path is a WCAG 2.1.2 keyboard-trap failure. The trap must always be escapable.

---

## Tabs

APG: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

```html
<div class="tabs">
  <div role="tablist" aria-label="Account settings">
    <button role="tab" id="tab-1" aria-selected="true"  aria-controls="panel-1">Profile</button>
    <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Billing</button>
  </div>
  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">…</div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>…</div>
</div>
```

Roving tabindex: only the active tab has `tabindex="0"`; the rest are `tabindex="-1"`. Arrow keys move selection and focus.

Keyboard:
| Key | Action |
|---|---|
| `Tab` | Moves into the tablist (to active tab), then to the panel |
| `←` / `→` | Move to previous/next tab (wraps); update `aria-selected` + roving tabindex |
| `Home` / `End` | First / last tab |
| `Enter` / `Space` | Activate (only needed for manual-activation tabs) |

---

## Screen-reader-only content (`.sr-only`)

Visually hide but keep in the accessibility tree (do NOT use `display:none` or `visibility:hidden` — those remove it from the a11y tree).

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
/* Make it visible when focused — e.g. a skip link */
.sr-only-focusable:focus,
.sr-only-focusable:focus-within { position: static; width: auto; height: auto; clip: auto; }
```

Skip link:

```html
<a href="#main" class="sr-only sr-only-focusable">Skip to main content</a>
…
<main id="main" tabindex="-1">…</main>
```

---

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Disable/replace non-essential motion (parallax, autoplay, large transitions). Never gate functionality behind motion. JS check: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## Live regions (announce dynamic updates)

```html
<div aria-live="polite" role="status">Saved.</div>   <!-- non-urgent -->
<div aria-live="assertive" role="alert">Error: email required.</div> <!-- urgent -->
```

The container must exist in the DOM *before* you inject text for the update to be announced. `polite` waits for a pause; `assertive`/`alert` interrupts — use sparingly.
