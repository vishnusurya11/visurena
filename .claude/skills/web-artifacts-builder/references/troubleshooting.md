# Troubleshooting, Assets & Performance

## Bundle failures (Parcel `bundle-artifact.sh`)

| Symptom | Cause | Fix |
|---------|-------|-----|
| `@/components/...` not resolved at build | Parcel didn't pick up tsconfig paths | Ensure `.parcelrc` has `"resolvers": ["parcel-resolver-tspaths", "..."]` and `tsconfig.json` has `compilerOptions.paths: { "@/*": ["./src/*"] }`. Both are set by the scripts — don't delete them. |
| Build OK but `bundle.html` JS doesn't run | Module script not inlined / wrong entry | The entry must be `index.html` at project root with `<script type="module" src="/src/main.tsx">`. `html-inline` inlines what `dist/index.html` references. |
| Parcel "Cannot resolve" for a shadcn dep | A Radix/util dep missing | `pnpm add` the missing package; the init script installs all Radix + `class-variance-authority clsx tailwind-merge lucide-react`. |
| Tailwind classes missing in bundle | `content` globs don't match | `tailwind.config.js` `content` must include `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`. |
| `bundle.html` huge / slow to open | Heavy deps bundled (icons, 3D, charts) | See Performance budget below; import only the icons/components you use. |
| Parcel caches stale output | `.parcel-cache` | `rm -rf .parcel-cache dist bundle.html` and rebuild. |
| Dark mode classes don't apply | `.dark` not on `<html>` + missing `darkMode: ["class"]` | The init `tailwind.config.js` sets `darkMode: ["class"]`. Toggle by adding/removing `dark` on `document.documentElement`. |

Quick rebuild from clean state:

```bash
rm -rf .parcel-cache dist bundle.html node_modules/.cache
bash scripts/bundle-artifact.sh
```

## Asset handling (images / fonts / video)

The output is a **single self-contained HTML file**, so external file references break once
shared. Inline or embed everything:

- **Images** — import so the bundler fingerprints + inlines them, or use data URIs / remote
  HTTPS URLs (remote URLs require network at view time — prefer inlining for true portability):
  ```tsx
  import hero from "@/assets/hero.png"; // Parcel inlines small assets; large ones become files
  <img src={hero} alt="Product hero" loading="lazy" width={1200} height={630} />
  ```
  Keep raster images small (<200 KB each). Prefer SVG for icons/illustrations. Use
  `lucide-react` (already installed) for icons rather than image files.
- **Fonts** — avoid bundling WOFF2 binaries (they bloat the single file). Load from Google
  Fonts via `<link>` in `index.html` (needs network), or accept system fonts for offline use.
  If you must embed, base64 a single WOFF2 weight via `@font-face`.
- **Video** — never inline large video into the HTML. Use a remote HTTPS URL with
  `<video preload="none" poster="...">`, or a lightweight animated alternative (CSS/Lottie/SVG).
- **Always set explicit `width`/`height`** (or `aspect-ratio`) on media to avoid layout shift.

## Size & performance budget

For a snappy claude.ai artifact, target:

| Metric | Budget |
|--------|--------|
| `bundle.html` total | < 1.5 MB (warn), < 3 MB (hard) |
| Initial JS executed | keep heavy libs lazy |
| Largest single image | < 200 KB |
| Time to first paint | sub-second on a laptop |

Tactics:
- **Tree-shake icons** — `import { Search } from "lucide-react"` (named), never `import * as`.
- **Lazy-mount heavy components** — 3D (`react-three-fiber`), charts, large editors:
  ```tsx
  import { lazy, Suspense } from "react";
  const Scene = lazy(() => import("@/components/Scene"));
  // <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}><Scene /></Suspense>
  ```
- **One signature animation**, not motion everywhere; respect `prefers-reduced-motion`.
- **Don't import all 40+ shadcn components** — only the ones you render get bundled, so import
  selectively.
- After bundling, check the printed size (`du -h bundle.html`); if over budget, trim assets/deps.

## Common runtime gotchas

- **No routing in a single file** — `react-router` BrowserRouter needs a server. Use
  `HashRouter` or in-component state for "pages" inside an artifact.
- **No env vars / secrets** — the artifact runs client-side only; never embed API keys.
- **localStorage may be sandboxed** — guard with `try/catch`; fall back to in-memory state.
- **`process.env` is undefined** in the bundle — don't reference Node globals in components.
