# No-Flash (FART) Theming + Framework Patterns

**FART = Flash of inAccurate coloR Theme** — the page renders in the wrong theme for a split second, then snaps to the right one. Most visible for dark-mode users who briefly see white.

## Root cause

The theme is applied *after* first paint. Any of these flash:
- Applying theme in an external `.js` file (`<script src>` loads async/after parse).
- Applying it in a React `useEffect` / framework lifecycle (runs after hydration).
- Relying on a CSS class toggled by client code that runs post-paint.

## The fix: blocking inline script in `<head>`, before any CSS

It runs synchronously before the browser paints, so the correct `data-theme` is on `<html>` from the very first frame.

```html
<head>
  <script>
    (function () {
      try {
        var stored = localStorage.getItem('theme');
        var system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = stored || system;
      } catch (e) {
        document.documentElement.dataset.theme = 'light';
      }
    })();
  </script>
  <link rel="stylesheet" href="/styles.css" />
</head>
```

Rules:
- **Inline**, not `src`. External scripts are too late.
- **Before** the first stylesheet/`<link>`.
- Keep it tiny; wrap in `try/catch` (localStorage throws in private mode / sandboxed iframes).

## Next.js (App Router)

Easiest: use `next-themes`. It injects exactly this kind of blocking script for you and supports class/attribute strategy + system sync.

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required because the server can't know the client's theme — the attribute legitimately differs until the script runs.

Manual (no library): render the IIFE above with a raw `<script dangerouslySetInnerHTML={{ __html: '...' }} />` placed in the `<head>` of the root layout, before styles.

## SSR without flash: client hints (advanced)

A blocking script eliminates flash but means the server still rendered theme-agnostic markup. To render the correct theme on the *server*:

- **Cookie:** persist the user's choice in a cookie; read it in the server component / middleware and set `data-theme` on `<html>` during SSR. No client script needed for the stored case.
- **`Sec-CH-Prefers-Color-Scheme` client hint:** opt in via `Accept-CH`; the browser then sends the OS preference as a request header, letting the server pick the right theme for first-paint even before any cookie exists. Support is limited — treat as progressive enhancement and keep the inline script as the fallback.

## Vite / plain SPA

Put the inline IIFE directly in `index.html`'s `<head>` above the bundled CSS/JS. Your framework's theme provider (e.g. the one from **tailwind-theme-builder**) then takes over for runtime toggling — but the first paint is already correct.

## Test it

- Hard refresh (Cmd/Ctrl+Shift+R) repeatedly in dark mode — no white flash.
- Throttle to "Slow 3G" in DevTools and reload — the script still wins because it's render-blocking and inline.
- Incognito (localStorage may be restricted) — should fall back cleanly, no crash.
