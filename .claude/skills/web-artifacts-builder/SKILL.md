---
name: web-artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---

# Web Artifacts Builder

To build powerful frontend claude.ai artifacts, follow these steps:
1. Initialize the frontend repo using `scripts/init-artifact.sh`
2. Develop your artifact by editing the generated code
3. Bundle all code into a single HTML file using `scripts/bundle-artifact.sh`
4. Display artifact to user
5. (Optional) Test the artifact

**Stack**: React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS 3.4 + shadcn/ui

## When to use / when to skip

**Use this skill** when the artifact needs real app machinery:
- Multiple interacting components, shared state, in-artifact "routing"/tabs.
- shadcn/ui components (dialogs, forms, tabs, tables, command palette, toasts).
- A build/bundle step to ship one self-contained `bundle.html`.

**Skip it** (just write a single inline file) when:
- It's a simple single-component or static HTML/JSX artifact with no shared state.
- A plain Tailwind-via-CDN HTML page is enough → use the `landing-page` skill.
- You only need vanilla JS / a tiny widget — the bundler overhead isn't worth it.

## Design & Style Guidelines

VERY IMPORTANT: To avoid what is often referred to as "AI slop", avoid using excessive centered layouts, purple gradients, uniform rounded corners, and Inter font.

> ## ⭐ Build to win awards — read the playbook
> Target **world-class, "wow"-tier** artifacts. Deep standard (in the `modern-web-design` skill):
> **→ [`../modern-web-design/references/award-winning-playbook.md`](../modern-web-design/references/award-winning-playbook.md)** (charcoal premium dark, tasteful/slight motion, subtle 3D + parallax done optimized, performance budgets, the full AI-slop kill-list, pre-ship checklist).
>
> **This project = Visurena, an AI-powered entertainment hub** — default house style: **charcoal premium dark, slightly animated, dynamic 3D/parallax depth, fully optimized**, one signature "wow" moment. This builder ships React + Tailwind + shadcn/ui; layer in `motion-framer` for component motion and `aceternity-ui` for pre-built animated components (and `react-three-fiber` if a 3D moment earns its place — lazy-mounted).

## Quick Start

### Step 1: Initialize Project

Run the initialization script to create a new React project:
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```

This creates a fully configured project with:
- ✅ React + TypeScript (via Vite)
- ✅ Tailwind CSS 3.4.1 with shadcn/ui theming system
- ✅ Path aliases (`@/`) configured
- ✅ 40+ shadcn/ui components pre-installed
- ✅ All Radix UI dependencies included
- ✅ Parcel configured for bundling (via .parcelrc)
- ✅ Node 18+ compatibility (auto-detects and pins Vite version)

### Step 2: Develop Your Artifact

To build the artifact, edit the generated files. Import shadcn/ui components from
`@/components/ui/*` and icons from `lucide-react`. Quick examples (full set with Card,
Dialog, Tabs, Toast in `references/component-examples.md`):

**Button**
```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

<Button>Get started</Button>
<Button variant="outline" size="icon" aria-label="Next"><ArrowRight className="h-4 w-4" /></Button>
```

**Card**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card className="w-80">
  <CardHeader><CardTitle>Pro</CardTitle></CardHeader>
  <CardContent><p className="text-3xl font-bold">$29</p></CardContent>
</Card>
```

**Form (react-hook-form + zod, all pre-installed)**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email("Enter a valid email") });
const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

<Form {...form}>
  <form onSubmit={form.handleSubmit(v => console.log(v))} className="space-y-4" noValidate>
    <FormField control={form.control} name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl><Input type="email" {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
    <Button type="submit">Sign up</Button>
  </form>
</Form>
```

See **Common Development Tasks** below and `references/component-examples.md` for guidance.

### Step 3: Bundle to Single HTML File

To bundle the React app into a single HTML artifact:
```bash
bash scripts/bundle-artifact.sh
```

This creates `bundle.html` - a self-contained artifact with all JavaScript, CSS, and dependencies inlined. This file can be directly shared in Claude conversations as an artifact.

**Requirements**: Your project must have an `index.html` in the root directory.

**What the script does**:
- Installs bundling dependencies (parcel, @parcel/config-default, parcel-resolver-tspaths, html-inline)
- Creates `.parcelrc` config with path alias support
- Builds with Parcel (no source maps)
- Inlines all assets into single HTML using html-inline

### Step 4: Share Artifact with User

Finally, share the bundled HTML file in conversation with the user so they can view it as an artifact.

### Step 5: Testing/Visualizing the Artifact (Optional)

Note: This is a completely optional step. Only perform if necessary or requested.

To test/visualize the artifact, use available tools (including other Skills or built-in tools like Playwright or Puppeteer). In general, avoid testing the artifact upfront as it adds latency between the request and when the finished artifact can be seen. Test later, after presenting the artifact, if requested or if issues arise.

## Troubleshooting, assets & performance

If the bundle fails, assets break, or the file is too large, see
**`references/troubleshooting.md`** — it covers:
- Parcel bundle failures (path-alias resolution, stale cache, missing Radix deps, dark mode).
- Asset handling for a single-file artifact (inline images, fonts, avoid bundling video).
- A size/perf budget (`bundle.html` < 1.5 MB target) plus lazy-mount + icon tree-shaking.
- Single-file runtime gotchas (no `react-router` BrowserRouter, no env vars, sandboxed
  `localStorage`).

Fast clean rebuild:
```bash
rm -rf .parcel-cache dist bundle.html node_modules/.cache
bash scripts/bundle-artifact.sh
```

## References

- shadcn/ui components: https://ui.shadcn.com/docs/components
- shadcn/ui installation (Vite): https://ui.shadcn.com/docs/installation/vite
- shadcn/ui + React 19 notes: https://ui.shadcn.com/docs/react-19
- React docs: https://react.dev/
- Vite guide: https://vite.dev/guide/
- Tailwind CSS docs: https://tailwindcss.com/docs
- Tailwind dark mode (class strategy): https://tailwindcss.com/docs/dark-mode
- lucide-react icons: https://lucide.dev/guide/packages/lucide-react
- react-hook-form: https://react-hook-form.com/get-started
- Zod: https://zod.dev/
- Parcel (bundler): https://parceljs.org/docs/
- Local: `references/component-examples.md`, `references/troubleshooting.md`