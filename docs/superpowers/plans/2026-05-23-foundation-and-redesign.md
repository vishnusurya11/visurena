# Foundation + Redesign (Step 0 + Step 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing `visurena-next` app into a pnpm+Turborepo monorepo and rebuild the homepage to the "The Studio" jewel design with a persistent, subtle, section-tinted nebula-gas background — all reading from a local JSON content layer, with no backend.

**Architecture:** Monorepo root = the `visurena/` git repo. The existing Next.js app moves to `apps/web`. Shared `packages/design-tokens` (jewel palette, type/motion tokens), `packages/core` (content types + local content loader), and `packages/ui` (shared React components) are consumed by `apps/web` now and a future `apps/mobile`. The site stays a static export to S3/CloudFront. Content is read from `content-local/` JSON during this phase (real S3 + DynamoDB come in a later plan).

**Tech Stack:** Next.js 14 (Pages Router, `output: 'export'`), React 18, TypeScript, Tailwind CSS 3, pnpm workspaces, Turborepo, Vitest + React Testing Library + jsdom (new — there are no tests today).

**Scope note:** This plan covers Step 0 (Foundation) and the *core* of Step 1 (design system, content layer, nebula background, theme provider, app shell, and the **homepage**). Section pages and detail/reader pages are a follow-on plan (`...-redesign-section-detail-pages.md`).

**Reference material (read-only, do not edit):**
- `../visurenawebtemp/` — the design source. Especially `shared.jsx` (palette + sample data), `studio2.jsx` / `page-home.jsx` (homepage layout), and `screenshots/studio-v2*.jpg`.
- `ARCHITECTURE.md` §3, §5, §6, §7 — build order, repo structure, content infra, visual design.

**Conventions for every task:** work on branch `redesign/foundation` (created in Task 1). Run commands from the repo root `visurena/` unless stated. Commit after each task.

---

## Phase A — Foundation (Step 0)

### Task 1: Safety branch + verify current build

**Files:** none (git + verification only)

- [ ] **Step 1: Create a working branch**

Run (from `visurena/`):
```bash
git checkout -b redesign/foundation
```

- [ ] **Step 2: Verify the current app still builds before we touch anything**

Run:
```bash
cd visurena-next && npm install && npm run build && cd ..
```
Expected: build succeeds and `visurena-next/out/` is generated (static export). If it fails, STOP and report — we need a green baseline before restructuring.

- [ ] **Step 3: Commit the baseline marker**

```bash
git add -A
git commit -m "chore: baseline before monorepo migration"
```

---

### Task 2: Introduce pnpm workspace + Turborepo at the repo root

**Files:**
- Create: `package.json` (repo root)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.npmrc`
- Modify: `.gitignore` (root) — add monorepo ignores

- [ ] **Step 1: Confirm pnpm is available**

Run:
```bash
corepack enable && corepack prepare pnpm@9 --activate && pnpm --version
```
Expected: prints a 9.x version.

- [ ] **Step 2: Create the root workspace package.json**

Create `package.json`:
```json
{
  "name": "visurena",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: Create pnpm-workspace.yaml**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 4: Create turbo.json**

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["out/**", ".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

- [ ] **Step 5: Create .npmrc**

Create `.npmrc`:
```
auto-install-peers=true
strict-peer-dependencies=false
```

- [ ] **Step 6: Update root .gitignore**

Append to `.gitignore`:
```
node_modules/
.turbo/
**/.next/
**/out/
**/dist/
*.tsbuildinfo
```

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .npmrc .gitignore
git commit -m "chore: add pnpm workspace + turborepo scaffolding"
```

---

### Task 3: Move `visurena-next` → `apps/web`

**Files:**
- Move: `visurena-next/` → `apps/web/`
- Modify: `apps/web/package.json` (name + scripts)
- Delete: `apps/web/package-lock.json` (switching to pnpm)

- [ ] **Step 1: Move the app with git history preserved**

Run:
```bash
mkdir -p apps
git mv visurena-next apps/web
rm -f apps/web/package-lock.json
```

- [ ] **Step 2: Rename the package and add a typecheck script**

Modify `apps/web/package.json` — set the name and add scripts (keep existing deps):
```json
{
  "name": "@visurena/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "export": "next build"
  }
}
```

- [ ] **Step 3: Install from the root with pnpm**

Run (from `visurena/`):
```bash
pnpm install
```
Expected: pnpm links the workspace and installs `apps/web` deps. A root `pnpm-lock.yaml` appears.

- [ ] **Step 4: Verify dev + build still work from the monorepo**

Run:
```bash
pnpm --filter @visurena/web build
```
Expected: build succeeds; `apps/web/out/` generated.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: move visurena-next to apps/web; switch to pnpm"
```

---

### Task 4: Shared config package (`packages/config`)

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig.base.json`
- Modify: `apps/web/tsconfig.json` (extend base)

- [ ] **Step 1: Create the config package**

Create `packages/config/package.json`:
```json
{
  "name": "@visurena/config",
  "version": "0.0.0",
  "private": true,
  "files": ["tsconfig.base.json"]
}
```

- [ ] **Step 2: Create the shared tsconfig base**

Create `packages/config/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

- [ ] **Step 3: Point apps/web at the base + add workspace path aliases**

Replace `apps/web/tsconfig.json`:
```json
{
  "extends": "@visurena/config/tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"],
      "@visurena/design-tokens": ["../../packages/design-tokens/src"],
      "@visurena/core": ["../../packages/core/src"],
      "@visurena/ui": ["../../packages/ui/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Add config as a dev dependency of web**

Run:
```bash
pnpm --filter @visurena/web add -D @visurena/config@workspace:*
```

- [ ] **Step 5: Verify typecheck runs (strict mode may surface existing issues — note them, do not fix unrelated code yet)**

Run:
```bash
pnpm --filter @visurena/web typecheck || true
```
Expected: command runs. If pre-existing files error under `strict`, that's acceptable for now (new code will be strict-clean); record the count.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add @visurena/config shared tsconfig base"
```

---

### Task 5: Test tooling (Vitest + RTL) in `apps/web`

**Files:**
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.setup.ts`
- Create: `apps/web/__tests__/smoke.test.tsx`
- Modify: `apps/web/package.json` (test script + devDeps)

- [ ] **Step 1: Add test dependencies**

Run:
```bash
pnpm --filter @visurena/web add -D vitest@^1.6.0 @testing-library/react@^15.0.0 \
  @testing-library/jest-dom@^6.4.0 jsdom@^24.0.0 @vitejs/plugin-react@^4.3.0
```

- [ ] **Step 2: Add the test script**

Add to `apps/web/package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest config**

Create `apps/web/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@visurena/design-tokens": path.resolve(__dirname, "../../packages/design-tokens/src"),
      "@visurena/core": path.resolve(__dirname, "../../packages/core/src"),
      "@visurena/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
```

- [ ] **Step 4: Create the setup file**

Create `apps/web/vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Write a smoke test**

Create `apps/web/__tests__/smoke.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello() { return <h1>Visurena</h1>; }

describe("test tooling", () => {
  it("renders a component", () => {
    render(<Hello />);
    expect(screen.getByRole("heading", { name: "Visurena" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the test**

Run:
```bash
pnpm --filter @visurena/web test
```
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add vitest + react-testing-library to apps/web"
```

---

### Task 6: Create empty shared packages (`design-tokens`, `core`, `ui`)

**Files:**
- Create: `packages/design-tokens/{package.json,tsconfig.json,src/index.ts}`
- Create: `packages/core/{package.json,tsconfig.json,src/index.ts}`
- Create: `packages/ui/{package.json,tsconfig.json,src/index.ts}`

- [ ] **Step 1: Create design-tokens package skeleton**

Create `packages/design-tokens/package.json`:
```json
{
  "name": "@visurena/design-tokens",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": { "test": "vitest run", "typecheck": "tsc --noEmit" }
}
```
Create `packages/design-tokens/tsconfig.json`:
```json
{ "extends": "@visurena/config/tsconfig.base.json", "include": ["src/**/*"] }
```
Create `packages/design-tokens/src/index.ts`:
```ts
export {};
```

- [ ] **Step 2: Create core package skeleton**

Create `packages/core/package.json`:
```json
{
  "name": "@visurena/core",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": { "test": "vitest run", "typecheck": "tsc --noEmit" }
}
```
Create `packages/core/tsconfig.json`:
```json
{ "extends": "@visurena/config/tsconfig.base.json", "include": ["src/**/*"] }
```
Create `packages/core/src/index.ts`:
```ts
export {};
```

- [ ] **Step 3: Create ui package skeleton**

Create `packages/ui/package.json`:
```json
{
  "name": "@visurena/ui",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": { "test": "vitest run", "typecheck": "tsc --noEmit" }
}
```
Create `packages/ui/tsconfig.json`:
```json
{ "extends": "@visurena/config/tsconfig.base.json", "include": ["src/**/*"] }
```
Create `packages/ui/src/index.ts`:
```ts
export {};
```

- [ ] **Step 4: Wire packages into apps/web and install**

Run:
```bash
pnpm --filter @visurena/web add @visurena/design-tokens@workspace:* @visurena/core@workspace:* @visurena/ui@workspace:*
pnpm install
```

- [ ] **Step 5: Configure Next to transpile the workspace packages**

Modify `apps/web/next.config.js` — add `transpilePackages`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true, domains: ['img.youtube.com', 'i.ytimg.com', 'picsum.photos'] },
  output: 'export',
  trailingSlash: true,
  transpilePackages: ['@visurena/design-tokens', '@visurena/core', '@visurena/ui'],
}
module.exports = nextConfig
```

- [ ] **Step 6: Verify the build still passes with packages linked**

Run:
```bash
pnpm --filter @visurena/web build
```
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold design-tokens, core, and ui packages"
```

---

## Phase B — Design System (Step 1)

### Task 7: Jewel design tokens (`packages/design-tokens`)

**Files:**
- Create: `packages/design-tokens/src/colors.ts`
- Create: `packages/design-tokens/src/sections.ts`
- Create: `packages/design-tokens/src/motion.ts`
- Modify: `packages/design-tokens/src/index.ts`
- Test: `packages/design-tokens/src/sections.test.ts`

- [ ] **Step 1: Write the failing test for section→accent resolution**

Create `packages/design-tokens/src/sections.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { sectionAccent, SECTIONS } from "./sections";

describe("section accents", () => {
  it("maps each section to its jewel stone", () => {
    expect(sectionAccent("stories")).toBe("#f5b831"); // amber
    expect(sectionAccent("movies")).toBe("#00d97e");  // emerald
    expect(sectionAccent("music")).toBe("#e91e63");   // ruby
    expect(sectionAccent("games")).toBe("#c084fc");   // amethyst
  });
  it("falls back to ivory for unknown sections", () => {
    expect(sectionAccent("unknown")).toBe("#f5efdb");
  });
  it("lists the four primary sections in order", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(["stories", "movies", "music", "games"]);
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/design-tokens test`
Expected: FAIL (`./sections` has no exports).

- [ ] **Step 3: Implement colors**

Create `packages/design-tokens/src/colors.ts`:
```ts
// Jewel palette — graphic-standard gemstone colors that glow on black.
export const jewel = {
  amber: "#f5b831",
  ruby: "#e91e63",
  emerald: "#00d97e",
  amethyst: "#c084fc",
  sapphire: "#5b8def", // reserved
  ivory: "#f5efdb",
} as const;

export const surface = {
  black: "#0a0a0b",
  ink: "#101012",
  raise: "#16161a",
  hair: "rgba(245,239,219,0.12)", // hairline borders
  text: "#f5efdb",
  muted: "rgba(245,239,219,0.55)",
  faint: "rgba(245,239,219,0.32)",
} as const;
```

- [ ] **Step 4: Implement sections**

Create `packages/design-tokens/src/sections.ts`:
```ts
import { jewel } from "./colors";

export type SectionId = "stories" | "movies" | "music" | "games";

export const SECTIONS = [
  { id: "stories", label: "Stories", stone: "Amber", accent: jewel.amber },
  { id: "movies", label: "Movies", stone: "Emerald", accent: jewel.emerald },
  { id: "music", label: "Music", stone: "Ruby", accent: jewel.ruby },
  { id: "games", label: "Games", stone: "Amethyst", accent: jewel.amethyst },
] as const;

export function sectionAccent(section: string): string {
  return SECTIONS.find((s) => s.id === section)?.accent ?? jewel.ivory;
}
```

- [ ] **Step 5: Implement motion tokens**

Create `packages/design-tokens/src/motion.ts`:
```ts
export const motion = {
  nebulaDriftMs: 60000,      // one slow drift cycle
  accentFadeMs: 1200,        // per-item color cross-fade
  hoverMs: 220,
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;
```

- [ ] **Step 6: Re-export from index**

Replace `packages/design-tokens/src/index.ts`:
```ts
export * from "./colors";
export * from "./sections";
export * from "./motion";
```

- [ ] **Step 7: Run the test to confirm pass**

Run: `pnpm --filter @visurena/design-tokens test`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/design-tokens
git commit -m "feat(tokens): jewel palette, section accents, motion tokens"
```

---

### Task 8: Tailwind preset + fonts in `apps/web`

**Files:**
- Create: `packages/design-tokens/tailwind-preset.cjs`
- Modify: `apps/web/tailwind.config.js`
- Modify: `apps/web/pages/_app.tsx` (fonts)
- Modify: `apps/web/styles/globals.css` (base bg + font vars)

- [ ] **Step 1: Create a Tailwind preset that exposes the tokens as utilities**

Create `packages/design-tokens/tailwind-preset.cjs`:
```js
// Mirror of src/colors.ts for Tailwind (CJS so tailwind.config can require it).
module.exports = {
  theme: {
    extend: {
      colors: {
        jewel: {
          amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e",
          amethyst: "#c084fc", sapphire: "#5b8def", ivory: "#f5efdb",
        },
        ink: { DEFAULT: "#101012", black: "#0a0a0b", raise: "#16161a" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { label: "0.18em" },
    },
  },
};
```

- [ ] **Step 2: Point apps/web Tailwind at the preset**

Replace `apps/web/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@visurena/design-tokens/tailwind-preset.cjs")],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 3: Load the fonts (display=Fraunces, body=Spectral, mono=JetBrains Mono)**

In `apps/web/pages/_app.tsx`, replace the Google Fonts `<link>` block with:
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Spectral:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```
And change `<title>` to `Visurena` and the description meta to: `Visurena — a cinematic creative studio. Stories, films, music, and games.`

- [ ] **Step 4: Set base background + font CSS variables**

At the TOP of `apps/web/styles/globals.css` add:
```css
:root {
  --font-display: "Fraunces";
  --font-body: "Spectral";
  --font-mono: "JetBrains Mono";
}
html, body { background: #0a0a0b; color: #f5efdb; }
body { font-family: var(--font-body), system-ui, sans-serif; }
```

- [ ] **Step 5: Verify the build compiles with the new Tailwind preset**

Run: `pnpm --filter @visurena/web build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(web): tailwind token preset + jewel fonts and base theme"
```

---

### Task 9: Content types + local content loader (`packages/core`)

**Files:**
- Create: `packages/core/src/content-types.ts`
- Create: `packages/core/src/content-local.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/content-local.test.ts`

- [ ] **Step 1: Write the failing test for the loader filtering live items**

Create `packages/core/src/content-local.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectLive, latestBySection, type ContentItem } from "./content-local";

const items: ContentItem[] = [
  { id: "a", section: "stories", slug: "a", title: "A", status: "live",
    createdAt: "2026-05-01", publishAt: "2026-05-01T00:00:00Z", accent: "#fff" },
  { id: "b", section: "stories", slug: "b", title: "B", status: "scheduled",
    createdAt: "2026-05-10", publishAt: "2999-01-01T00:00:00Z", accent: "#fff" },
  { id: "c", section: "stories", slug: "c", title: "C", status: "live",
    createdAt: "2026-05-09", publishAt: "2026-05-09T00:00:00Z", accent: "#fff" },
];

describe("content-local", () => {
  it("selectLive returns only live items whose publishAt has passed", () => {
    const live = selectLive(items, new Date("2026-05-20T00:00:00Z"));
    expect(live.map((i) => i.id)).toEqual(["a", "c"]);
  });
  it("latestBySection sorts live items newest-first by publishAt", () => {
    const latest = latestBySection(items, "stories", new Date("2026-05-20T00:00:00Z"));
    expect(latest.map((i) => i.id)).toEqual(["c", "a"]);
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/core test`
Expected: FAIL (no `./content-local`).

- [ ] **Step 3: Define the content types**

Create `packages/core/src/content-types.ts`:
```ts
export type SectionId = "stories" | "movies" | "music" | "games" | "research";
export type ContentStatus = "draft" | "scheduled" | "live";

export interface Chapter {
  n: number;
  title: string;
  body?: string;        // path to body JSON (unused in Phase 1 listing)
  publishAt?: string;
  status?: "writing" | "scheduled" | "live";
}

export interface ContentItem {
  id: string;
  section: SectionId;
  slug: string;
  title: string;
  status: ContentStatus;
  createdAt: string;     // ISO date
  publishAt: string;     // ISO datetime
  accent: string;        // hex — drives per-item immersion
  genre?: string;
  summary?: string;
  cover?: string;        // image url/path
  tags?: string[];
  chapters?: Chapter[];
  reads?: string;        // display string e.g. "84.2k"
}
```

- [ ] **Step 4: Implement the loader/selectors**

Create `packages/core/src/content-local.ts`:
```ts
import type { ContentItem, SectionId } from "./content-types";
export type { ContentItem, SectionId } from "./content-types";

export function selectLive(items: ContentItem[], now: Date = new Date()): ContentItem[] {
  return items.filter(
    (i) => i.status === "live" && new Date(i.publishAt).getTime() <= now.getTime()
  );
}

export function latestBySection(
  items: ContentItem[],
  section: SectionId,
  now: Date = new Date()
): ContentItem[] {
  return selectLive(items, now)
    .filter((i) => i.section === section)
    .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
}
```

- [ ] **Step 5: Re-export from index**

Replace `packages/core/src/index.ts`:
```ts
export * from "./content-types";
export * from "./content-local";
```

- [ ] **Step 6: Run the test to confirm pass**

Run: `pnpm --filter @visurena/core test`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/core
git commit -m "feat(core): content types + local content selectors"
```

---

### Task 10: Seed local content (`content-local/`)

**Files:**
- Create: `content-local/stories.json`
- Create: `apps/web/lib/content.ts` (loads the JSON for pages)
- Test: `apps/web/__tests__/content.test.ts`

- [ ] **Step 1: Seed sample stories (ported from the template's sample data)**

Create `content-local/stories.json` (values from `../visurenawebtemp/shared.jsx` `VR_STORIES_LATEST`):
```json
[
  { "id": "sto_lantern-mile", "section": "stories", "slug": "lantern-mile",
    "title": "The Lantern Mile", "status": "live", "createdAt": "2026-05-18",
    "publishAt": "2026-05-18T08:00:00Z", "accent": "#7c8fa8", "genre": "Horror",
    "summary": "A trucker drives an Iowa highway where every fifth mile, the lights forget him.",
    "cover": "https://picsum.photos/seed/lantern-mile/900/1200", "reads": "9.8k",
    "chapters": [{ "n": 1, "title": "I" }, { "n": 9, "title": "IX", "status": "writing" }] },
  { "id": "sto_bone-tide", "section": "stories", "slug": "bone-tide",
    "title": "Bone Tide", "status": "live", "createdAt": "2026-05-14",
    "publishAt": "2026-05-14T08:00:00Z", "accent": "#6e8b86", "genre": "Mystery",
    "summary": "Eight bodies wash up on a Maine island that has no shore.",
    "cover": "https://picsum.photos/seed/bone-tide/900/1200", "reads": "7.1k" },
  { "id": "sto_below-the-concrete", "section": "stories", "slug": "below-the-concrete",
    "title": "Below the Concrete", "status": "live", "createdAt": "2026-05-11",
    "publishAt": "2026-05-11T08:00:00Z", "accent": "#a45d3f", "genre": "Thriller",
    "summary": "She bought the building cheap. Two floors below the lobby, somebody's been waiting.",
    "cover": "https://picsum.photos/seed/below-the-concrete/900/1200", "reads": "6.4k" },
  { "id": "sto_saltwater-saints", "section": "stories", "slug": "saltwater-saints",
    "title": "Saltwater Saints", "status": "live", "createdAt": "2026-05-09",
    "publishAt": "2026-05-09T08:00:00Z", "accent": "#5d7ea0", "genre": "Horror",
    "summary": "The fishermen of Esperanza Bay haven't aged since 1962. The tourists do.",
    "cover": "https://picsum.photos/seed/saltwater-saints/900/1200", "reads": "5.2k" },
  { "id": "sto_eight-rooms", "section": "stories", "slug": "eight-rooms",
    "title": "Eight Rooms", "status": "live", "createdAt": "2026-05-03",
    "publishAt": "2026-05-03T08:00:00Z", "accent": "#9a7e54", "genre": "Mystery",
    "summary": "A locked-room novella set inside a house that has seven.",
    "cover": "https://picsum.photos/seed/eight-rooms/900/1200", "reads": "4.8k" },
  { "id": "sto_hour-of-dogs", "section": "stories", "slug": "hour-of-dogs",
    "title": "Hour of Dogs", "status": "live", "createdAt": "2026-04-28",
    "publishAt": "2026-04-28T08:00:00Z", "accent": "#a85a55", "genre": "Thriller",
    "summary": "The hour between dogs and wolves — when neither knows which one it is.",
    "cover": "https://picsum.photos/seed/hour-of-dogs/900/1200", "reads": "4.1k" }
]
```

- [ ] **Step 2: Write the failing test for the web content adapter**

Create `apps/web/__tests__/content.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getLatestStories } from "@/lib/content";

describe("web content adapter", () => {
  it("returns live stories newest-first", () => {
    const stories = getLatestStories(new Date("2026-06-01T00:00:00Z"));
    expect(stories.length).toBeGreaterThanOrEqual(6);
    expect(stories[0].slug).toBe("lantern-mile");
    stories.forEach((s) => expect(s.status).toBe("live"));
  });
});
```

- [ ] **Step 3: Run it to confirm failure**

Run: `pnpm --filter @visurena/web test`
Expected: FAIL (no `@/lib/content`).

- [ ] **Step 4: Implement the adapter**

Create `apps/web/lib/content.ts`:
```ts
import { latestBySection, type ContentItem } from "@visurena/core";
import storiesJson from "../../../content-local/stories.json";

const stories = storiesJson as ContentItem[];

export function getLatestStories(now: Date = new Date()): ContentItem[] {
  return latestBySection(stories, "stories", now);
}
```

- [ ] **Step 5: Run the test to confirm pass**

Run: `pnpm --filter @visurena/web test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add content-local apps/web/lib/content.ts apps/web/__tests__/content.test.ts
git commit -m "feat(content): seed local stories + web content adapter"
```

---

## Phase C — Nebula Background + Theme

### Task 11: ThemeProvider with accent-blend logic (`packages/ui`)

**Files:**
- Create: `packages/ui/src/theme.tsx`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/src/theme.test.tsx`

- [ ] **Step 1: Write the failing test for accent resolution**

Create `packages/ui/src/theme.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { accent } = useTheme();
  return <span data-testid="accent">{accent}</span>;
}

describe("ThemeProvider", () => {
  it("uses the section accent when no item accent is set", () => {
    render(<ThemeProvider section="movies"><Probe /></ThemeProvider>);
    expect(screen.getByTestId("accent").textContent).toBe("#00d97e");
  });
  it("prefers the item accent when provided", () => {
    render(<ThemeProvider section="stories" itemAccent="#7c8fa8"><Probe /></ThemeProvider>);
    expect(screen.getByTestId("accent").textContent).toBe("#7c8fa8");
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/ui test`
Expected: FAIL.

- [ ] **Step 3: Implement the ThemeProvider**

Create `packages/ui/src/theme.tsx`:
```tsx
import React, { createContext, useContext, useMemo } from "react";
import { sectionAccent } from "@visurena/design-tokens";

interface ThemeValue { section: string; accent: string; itemAccent?: string; }
const ThemeContext = createContext<ThemeValue>({ section: "stories", accent: "#f5b831" });

export function ThemeProvider({
  section = "stories", itemAccent, children,
}: { section?: string; itemAccent?: string; children: React.ReactNode }) {
  const value = useMemo<ThemeValue>(
    () => ({ section, itemAccent, accent: itemAccent ?? sectionAccent(section) }),
    [section, itemAccent]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
```
Note: `@visurena/design-tokens` must be a dependency of `@visurena/ui` — run:
```bash
pnpm --filter @visurena/ui add @visurena/design-tokens@workspace:* react@^18
pnpm --filter @visurena/ui add -D @types/react@^18 vitest @testing-library/react @vitejs/plugin-react jsdom @testing-library/jest-dom
```
Add `packages/ui/vitest.config.ts` mirroring the one in Task 5 (plugin-react + jsdom + globals; no path aliases needed beyond default).

- [ ] **Step 4: Re-export from index**

Replace `packages/ui/src/index.ts`:
```ts
export * from "./theme";
```

- [ ] **Step 5: Run the test to confirm pass**

Run: `pnpm --filter @visurena/ui test`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): ThemeProvider with section/item accent resolution"
```

---

### Task 12: NebulaBackground (CSS/SVG, reduced-motion aware) (`packages/ui`)

**Files:**
- Create: `packages/ui/src/NebulaBackground.tsx`
- Create: `packages/ui/src/use-reduced-motion.ts`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/src/use-reduced-motion.test.tsx`

- [ ] **Step 1: Write the failing test for the reduced-motion hook**

Create `packages/ui/src/use-reduced-motion.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = (query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

describe("usePrefersReducedMotion", () => {
  beforeEach(() => mockMatchMedia(false));
  it("returns false when motion is allowed", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
  it("returns true when the user prefers reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/ui test`
Expected: FAIL.

- [ ] **Step 3: Implement the hook**

Create `packages/ui/src/use-reduced-motion.ts`:
```ts
import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}
```

- [ ] **Step 4: Implement the NebulaBackground**

Create `packages/ui/src/NebulaBackground.tsx`:
```tsx
import React from "react";
import { useTheme } from "./theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * Persistent jewel "nebula gas". Three large radial-gradient clouds drift slowly
 * (transform/opacity only — GPU-friendly). Color comes from the active theme accent,
 * cross-fading via a CSS transition. Honors prefers-reduced-motion (freezes drift).
 */
export function NebulaBackground() {
  const { accent } = useTheme();
  const reduced = usePrefersReducedMotion();
  return (
    <div aria-hidden className="vr-nebula" data-static={reduced ? "true" : "false"}
         style={{ ["--vr-accent" as string]: accent }}>
      <span className="vr-cloud vr-cloud-1" />
      <span className="vr-cloud vr-cloud-2" />
      <span className="vr-cloud vr-cloud-3" />
      <span className="vr-grain" />
    </div>
  );
}
```

- [ ] **Step 5: Add the nebula CSS to web globals**

Append to `apps/web/styles/globals.css`:
```css
.vr-nebula {
  position: fixed; inset: 0; z-index: -1; overflow: hidden;
  background: #0a0a0b; pointer-events: none;
}
.vr-cloud {
  position: absolute; width: 80vmax; height: 80vmax; border-radius: 50%;
  filter: blur(80px); opacity: 0.35; mix-blend-mode: screen;
  background: radial-gradient(circle at center,
    color-mix(in srgb, var(--vr-accent) 70%, transparent) 0%, transparent 60%);
  transition: background 1200ms cubic-bezier(0.22,1,0.36,1);
}
.vr-cloud-1 { top: -20vmax; left: -10vmax; animation: vr-drift-1 60s ease-in-out infinite; }
.vr-cloud-2 { bottom: -25vmax; right: -15vmax; opacity: 0.25;
  animation: vr-drift-2 80s ease-in-out infinite; }
.vr-cloud-3 { top: 30vmax; left: 40vmax; opacity: 0.18;
  animation: vr-drift-3 100s ease-in-out infinite; }
.vr-grain {
  position: absolute; inset: 0; opacity: 0.04;
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px);
  mix-blend-mode: overlay;
}
@keyframes vr-drift-1 { 0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(6vmax,4vmax) scale(1.08); } }
@keyframes vr-drift-2 { 0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-5vmax,-3vmax) scale(1.1); } }
@keyframes vr-drift-3 { 0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-4vmax,5vmax) scale(0.95); } }
.vr-nebula[data-static="true"] .vr-cloud { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .vr-cloud { animation: none !important; } }
```

- [ ] **Step 6: Re-export from index**

Replace `packages/ui/src/index.ts`:
```ts
export * from "./theme";
export * from "./use-reduced-motion";
export * from "./NebulaBackground";
```

- [ ] **Step 7: Run tests**

Run: `pnpm --filter @visurena/ui test`
Expected: PASS (4 tests total).

- [ ] **Step 8: Commit**

```bash
git add packages/ui apps/web/styles/globals.css
git commit -m "feat(ui): persistent nebula-gas background (CSS/SVG, reduced-motion aware)"
```

---

## Phase D — App Shell + Homepage

### Task 13: App shell wiring (persistent background + theme)

**Files:**
- Modify: `apps/web/pages/_app.tsx`
- Test: `apps/web/__tests__/app-shell.test.tsx`

- [ ] **Step 1: Write the failing test that the shell renders the nebula**

Create `apps/web/__tests__/app-shell.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider, NebulaBackground } from "@visurena/ui";

describe("app shell", () => {
  it("renders a persistent nebula layer", () => {
    const { container } = render(
      <ThemeProvider section="stories"><NebulaBackground /></ThemeProvider>
    );
    expect(container.querySelector(".vr-nebula")).not.toBeNull();
    expect(container.querySelectorAll(".vr-cloud").length).toBe(3);
  });
});
```

- [ ] **Step 2: Run it to confirm it passes already (integration check, no new code)**

Run: `pnpm --filter @visurena/web test`
Expected: PASS (verifies cross-package imports resolve in the web app).

- [ ] **Step 3: Wire the shell into _app.tsx**

In `apps/web/pages/_app.tsx`, wrap the app body:
```tsx
import { ThemeProvider, NebulaBackground } from "@visurena/ui";
// ...inside the returned fragment, replace <Component {...pageProps} /> with:
<ThemeProvider section={(pageProps as any).section ?? "stories"}>
  <NebulaBackground />
  <Component {...pageProps} />
</ThemeProvider>
```

- [ ] **Step 4: Verify the dev server renders the background**

Run: `pnpm --filter @visurena/web dev` and open `http://localhost:3000`.
Expected: a dark page with slow amber nebula drift behind content. Stop the server with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): persistent nebula + theme app shell"
```

---

### Task 14: Chrome components — TopStatusBar, Header, Footer (`packages/ui`)

**Files:**
- Create: `packages/ui/src/TopStatusBar.tsx`
- Create: `packages/ui/src/Header.tsx`
- Create: `packages/ui/src/Footer.tsx`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/src/Header.test.tsx`

- [ ] **Step 1: Write the failing test for the Header nav**

Create `packages/ui/src/Header.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the wordmark and primary sections", () => {
    render(<Header />);
    expect(screen.getByText("VISURENA")).toBeInTheDocument();
    ["Stories", "Movies", "Music", "Games"].forEach((s) =>
      expect(screen.getByRole("link", { name: s })).toBeInTheDocument());
  });
  it("shows a Sign In affordance", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/ui test`
Expected: FAIL.

- [ ] **Step 3: Implement Header**

Create `packages/ui/src/Header.tsx`:
```tsx
import React from "react";
import { SECTIONS } from "@visurena/design-tokens";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      <a href="/" className="font-display text-2xl tracking-[0.25em] text-jewel-ivory">
        VISURENA
      </a>
      <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-label uppercase">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`/${s.id}`} className="text-jewel-ivory/70 hover:text-jewel-ivory">
            {s.label}
          </a>
        ))}
        <a href="/research" className="text-jewel-ivory/70 hover:text-jewel-ivory">Research</a>
      </nav>
      <button className="font-mono text-xs tracking-label uppercase border border-jewel-ivory/30
        px-4 py-2 text-jewel-ivory/90 hover:border-jewel-ivory/60">
        Sign In
      </button>
    </header>
  );
}
```

- [ ] **Step 4: Implement TopStatusBar and Footer**

Create `packages/ui/src/TopStatusBar.tsx`:
```tsx
import React from "react";
export function TopStatusBar() {
  return (
    <div className="flex items-center justify-between px-6 py-2 md:px-10 border-b border-jewel-ivory/10
      font-mono text-[10px] tracking-label uppercase text-jewel-ivory/40">
      <span>New chapters every Monday</span>
      <span className="text-jewel-amber/80">Free during open beta</span>
    </div>
  );
}
```
Create `packages/ui/src/Footer.tsx`:
```tsx
import React from "react";
export function Footer() {
  return (
    <footer className="px-6 md:px-10 py-12 mt-24 border-t border-jewel-ivory/10
      font-mono text-[11px] tracking-label uppercase text-jewel-ivory/40">
      <div className="flex flex-wrap justify-between gap-6">
        <span>© {new Date().getFullYear()} Visurena</span>
        <span>Stories · Movies · Music · Games · Research</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Re-export and run tests**

Add to `packages/ui/src/index.ts`:
```ts
export * from "./TopStatusBar";
export * from "./Header";
export * from "./Footer";
```
Run: `pnpm --filter @visurena/ui test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): TopStatusBar, Header nav, Footer"
```

---

### Task 15: Content components — ContentCard, CardRow, Hero, NewsletterCTA (`packages/ui`)

**Files:**
- Create: `packages/ui/src/ContentCard.tsx`
- Create: `packages/ui/src/CardRow.tsx`
- Create: `packages/ui/src/Hero.tsx`
- Create: `packages/ui/src/NewsletterCTA.tsx`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/src/ContentCard.test.tsx`

- [ ] **Step 1: Write the failing test for ContentCard**

Create `packages/ui/src/ContentCard.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContentCard } from "./ContentCard";

describe("ContentCard", () => {
  it("shows title, genre, and links to the item", () => {
    render(<ContentCard section="stories" slug="lantern-mile" title="The Lantern Mile"
      genre="Horror" accent="#7c8fa8" />);
    expect(screen.getByText("The Lantern Mile")).toBeInTheDocument();
    expect(screen.getByText("Horror")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/stories/lantern-mile");
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/ui test`
Expected: FAIL.

- [ ] **Step 3: Implement ContentCard**

Create `packages/ui/src/ContentCard.tsx`:
```tsx
import React from "react";

export interface ContentCardProps {
  section: string; slug: string; title: string;
  genre?: string; accent: string; cover?: string;
}

export function ContentCard({ section, slug, title, genre, accent, cover }: ContentCardProps) {
  return (
    <a href={`/${section}/${slug}`}
       className="group relative block aspect-[3/4] overflow-hidden border border-jewel-ivory/10"
       style={{ background: cover ? `center/cover no-repeat url(${cover})` : "#16161a" }}>
      <span className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.85) 100%)` }} />
      <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: accent, opacity: .7 }} />
      {genre && (
        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-label uppercase
          text-jewel-ivory/70">{genre}</span>
      )}
      <span className="absolute left-3 bottom-3 right-3 font-display text-xl leading-tight
        text-jewel-ivory">{title}</span>
    </a>
  );
}
```

- [ ] **Step 4: Implement CardRow, Hero, NewsletterCTA**

Create `packages/ui/src/CardRow.tsx`:
```tsx
import React from "react";
import { ContentCard, type ContentCardProps } from "./ContentCard";

export function CardRow({ title, eyebrow, items }: {
  title: string; eyebrow?: string; items: ContentCardProps[];
}) {
  return (
    <section className="px-6 md:px-10 my-16">
      {eyebrow && <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-2">{eyebrow}</p>}
      <h2 className="font-display text-4xl md:text-5xl text-jewel-ivory mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((it) => <ContentCard key={it.slug} {...it} />)}
      </div>
    </section>
  );
}
```
Create `packages/ui/src/Hero.tsx`:
```tsx
import React from "react";

export function Hero({ eyebrow, title, summary, href, cover }: {
  eyebrow?: string; title: string; summary?: string; href: string; cover?: string;
}) {
  return (
    <section className="relative px-6 md:px-10 pt-16 pb-24 min-h-[60vh] flex flex-col justify-end">
      {cover && (
        <span aria-hidden className="absolute inset-0 -z-0 opacity-40"
          style={{ background: `center/cover no-repeat url(${cover})`,
                   maskImage: "linear-gradient(180deg, transparent, black 60%)" }} />
      )}
      <div className="relative max-w-3xl">
        {eyebrow && <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-3">{eyebrow}</p>}
        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] text-jewel-ivory mb-5">{title}</h1>
        {summary && <p className="font-body text-lg text-jewel-ivory/70 mb-6 max-w-xl">{summary}</p>}
        <a href={href} className="font-mono text-xs tracking-label uppercase border border-jewel-ivory/40
          px-5 py-3 text-jewel-ivory hover:border-jewel-ivory">Read now →</a>
      </div>
    </section>
  );
}
```
Create `packages/ui/src/NewsletterCTA.tsx`:
```tsx
import React from "react";

export function NewsletterCTA() {
  return (
    <section className="px-6 md:px-10 my-24 text-center">
      <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-4">✦ The Monday Post ✦</p>
      <h2 className="font-display text-5xl md:text-6xl text-jewel-ivory leading-tight max-w-3xl mx-auto">
        New chapters in your inbox, <em className="text-jewel-amber not-italic font-display italic">every Monday morning.</em>
      </h2>
      <p className="font-body text-jewel-ivory/60 mt-5 max-w-xl mx-auto">
        One short story, one essay, one piece of music we made that week. No tracking, no ads. Free during open beta.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Re-export and run tests**

Add to `packages/ui/src/index.ts`:
```ts
export * from "./ContentCard";
export * from "./CardRow";
export * from "./Hero";
export * from "./NewsletterCTA";
```
Run: `pnpm --filter @visurena/ui test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): Hero, ContentCard, CardRow, NewsletterCTA"
```

---

### Task 16: Assemble the homepage (`apps/web/pages/index.tsx`)

**Files:**
- Modify: `apps/web/pages/index.tsx` (replace with the new homepage)
- Test: `apps/web/__tests__/home.test.tsx`

- [ ] **Step 1: Write the failing test for the homepage**

Create `apps/web/__tests__/home.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/pages/index";
import { getLatestStories } from "@/lib/content";

describe("Home", () => {
  it("renders the hero and a 'New this week' row of stories", () => {
    const stories = getLatestStories(new Date("2026-06-01T00:00:00Z"));
    render(<Home stories={stories} />);
    expect(screen.getByRole("heading", { name: /the lantern mile/i })).toBeInTheDocument();
    expect(screen.getByText(/new this week/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm --filter @visurena/web test`
Expected: FAIL.

- [ ] **Step 3: Implement the homepage**

Replace `apps/web/pages/index.tsx`:
```tsx
import type { GetStaticProps } from "next";
import { TopStatusBar, Header, Footer, Hero, CardRow, NewsletterCTA } from "@visurena/ui";
import { getLatestStories } from "@/lib/content";
import type { ContentItem } from "@visurena/core";

export default function Home({ stories }: { stories: ContentItem[] }) {
  const [featured, ...rest] = stories;
  return (
    <main>
      <TopStatusBar />
      <Header />
      {featured && (
        <Hero eyebrow={`Now reading · ${featured.genre ?? ""}`} title={featured.title}
          summary={featured.summary} href={`/stories/${featured.slug}`} cover={featured.cover} />
      )}
      <CardRow eyebrow="Stories — published every Monday" title="New this week"
        items={rest.map((s) => ({ section: "stories", slug: s.slug, title: s.title,
          genre: s.genre, accent: s.accent, cover: s.cover }))} />
      <NewsletterCTA />
      <Footer />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { stories: getLatestStories(), section: "stories" } };
};
```

- [ ] **Step 4: Run the test to confirm pass**

Run: `pnpm --filter @visurena/web test`
Expected: PASS.

- [ ] **Step 5: Visually verify in the dev server**

Run: `pnpm --filter @visurena/web dev`, open `http://localhost:3000`.
Expected: dark homepage, amber nebula drifting behind, hero for "The Lantern Mile", a "New this week" card grid, the Monday newsletter block, footer. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add apps/web/pages/index.tsx apps/web/__tests__/home.test.tsx
git commit -m "feat(web): rebuild homepage in The Studio jewel design"
```

---

### Task 17: Build, responsive + reduced-motion QA, finalize

**Files:**
- Modify: `apps/web/pages/index.tsx` (only if QA finds responsive issues)
- Modify: `visurena/ARCHITECTURE.md` (change log)

- [ ] **Step 1: Full static export build**

Run: `pnpm --filter @visurena/web build`
Expected: build succeeds; `apps/web/out/` generated with the new homepage.

- [ ] **Step 2: Run the whole test suite across the monorepo**

Run (from root): `pnpm test`
Expected: all packages' tests PASS.

- [ ] **Step 3: Reduced-motion check**

In the dev server, enable "Reduce motion" in OS settings (or DevTools rendering emulation: prefers-reduced-motion). Reload.
Expected: the nebula clouds are frozen (no drift), background still tinted. 

- [ ] **Step 4: Responsive check**

In DevTools, view at 375px and 768px widths.
Expected: header nav collapses on mobile (sections hidden under md), card grid reflows to 2 cols, hero text scales. If broken, adjust Tailwind responsive classes in the affected component and re-run its test.

- [ ] **Step 5: Update the architecture change log**

Add a row to `visurena/ARCHITECTURE.md` §13:
```
| 2026-05-23 | Built Step 0 (monorepo) + Step 1 homepage: design-tokens, core content layer, ui (nebula, theme, chrome, cards), redesigned homepage. Static export verified. |
```

- [ ] **Step 6: Final commit + push the branch**

```bash
git add -A
git commit -m "chore: Step 0 + Step 1 homepage complete; QA verified"
git push -u origin redesign/foundation
```

---

## Self-review notes (for the implementer)

- **Spec coverage:** This plan implements ARCHITECTURE.md §3 Step 0 + the core of Step 1 (D1, D2, D3, D4, D6, D11 read-path, D16, D17). Deferred to the next plan: section pages, detail/reader pages, the full content-sync/scheduler/AWS (Steps 2+), auth (Step 3), engagement (Step 4), search (Step 5).
- **Not in scope here:** real S3/DynamoDB (content is local JSON), Cognito, likes/comments. The `SignInButton` is a visual placeholder.
- **Follow-on plan:** `2026-05-23-redesign-section-detail-pages.md` (Stories/Movies/Music/Games section pages + the per-item immersion on detail pages, which exercises `itemAccent` in ThemeProvider).
