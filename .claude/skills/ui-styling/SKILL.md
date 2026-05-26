---
name: ckm:ui-styling
description: Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications.
argument-hint: "[component or layout]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---

# UI Styling Skill

> ## ⭐ Style toward award-winning, on par with the best sites in the world
> Implement components in service of **world-class, "wow"-tier** output. Deep standard (in the `modern-web-design` skill):
> **→ [`../modern-web-design/references/award-winning-playbook.md`](../modern-web-design/references/award-winning-playbook.md)** (charcoal premium dark, tasteful/slight motion, subtle 3D + parallax done optimized, performance budgets, AI-slop kill-list).
>
> **This project = Visurena, an AI-powered entertainment hub** — default house style: **charcoal premium dark** (`#0E0E0E`–`#121212`, never pure `#000`; one disciplined accent; elevation via lighter surfaces; OKLCH tokens), **slightly animated**, **dynamic 3D/parallax depth**, **fully optimized**. For Tailwind v4 + shadcn theming/dark-mode wiring use `tailwind-theme-builder`; for motion use `motion-framer`/`gsap-scrolltrigger`; for animated components `aceternity-ui`.

Comprehensive skill for creating beautiful, accessible user interfaces combining shadcn/ui components, Tailwind CSS utility styling, and canvas-based visual design systems.

## Reference

- shadcn/ui: https://ui.shadcn.com/llms.txt
- Tailwind CSS: https://tailwindcss.com/docs

## When to Use This Skill

Use when:
- Building UI with React-based frameworks (Next.js, Vite, Remix, Astro)
- Implementing accessible components (dialogs, forms, tables, navigation)
- Styling with utility-first CSS approach
- Creating responsive, mobile-first layouts
- Implementing dark mode and theme customization
- Building design systems with consistent tokens
- Generating visual designs, posters, or brand materials
- Rapid prototyping with immediate visual feedback
- Adding complex UI patterns (data tables, charts, command palettes)

## Core Stack

### Component Layer: shadcn/ui
- Pre-built accessible components via Radix UI primitives
- Copy-paste distribution model (components live in your codebase)
- TypeScript-first with full type safety
- Composable primitives for complex UIs
- CLI-based installation and management

### Styling Layer: Tailwind CSS
- Utility-first CSS framework
- Build-time processing with zero runtime overhead
- Mobile-first responsive design
- Consistent design tokens (colors, spacing, typography)
- Automatic dead code elimination

### Visual Design Layer: Canvas
- Museum-quality visual compositions
- Philosophy-driven design approach
- Sophisticated visual communication
- Minimal text, maximum visual impact
- Systematic patterns and refined aesthetics

## Quick Start

### Component + Styling Setup

**Install shadcn/ui with Tailwind:**
```bash
npx shadcn@latest init
```

CLI prompts for framework, TypeScript, paths, and theme preferences. This configures both shadcn/ui and Tailwind CSS.

**Add components:**
```bash
npx shadcn@latest add button card dialog form
```

**Use components with utility styling:**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">View your metrics</p>
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Alternative: Tailwind-Only Setup

**Vite projects:**
```bash
npm install -D tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

```css
/* src/index.css */
@import "tailwindcss";
```

## Component Library Guide

**Comprehensive component catalog with usage patterns, installation, and composition examples.**

See: `references/shadcn-components.md`

Covers:
- Form & input components (Button, Input, Select, Checkbox, Date Picker, Form validation)
- Layout & navigation (Card, Tabs, Accordion, Navigation Menu)
- Overlays & dialogs (Dialog, Drawer, Popover, Toast, Command)
- Feedback & status (Alert, Progress, Skeleton)
- Display components (Table, Data Table, Avatar, Badge)

## Theme & Customization

**Theme configuration, CSS variables, dark mode implementation, and component customization.**

See: `references/shadcn-theming.md`

Covers:
- Dark mode setup with next-themes
- CSS variable system
- Color customization and palettes
- Component variant customization
- Theme toggle implementation

## Accessibility Patterns

**ARIA patterns, keyboard navigation, screen reader support, and accessible component usage.**

See: `references/shadcn-accessibility.md`

Covers:
- Radix UI accessibility features
- Keyboard navigation patterns
- Focus management
- Screen reader announcements
- Form validation accessibility

## Tailwind Utilities

**Core utility classes for layout, spacing, typography, colors, borders, and shadows.**

See: `references/tailwind-utilities.md`

Covers:
- Layout utilities (Flexbox, Grid, positioning)
- Spacing system (padding, margin, gap)
- Typography (font sizes, weights, alignment, line height)
- Colors and backgrounds
- Borders and shadows
- Arbitrary values for custom styling

## Responsive Design

**Mobile-first breakpoints, responsive utilities, and adaptive layouts.**

See: `references/tailwind-responsive.md`

Covers:
- Mobile-first approach
- Breakpoint system (sm, md, lg, xl, 2xl)
- Responsive utility patterns
- Container queries
- Max-width queries
- Custom breakpoints

## Tailwind Customization

**Config file structure, custom utilities, plugins, and theme extensions.**

See: `references/tailwind-customization.md`

Covers:
- @theme directive for custom tokens
- Custom colors and fonts
- Spacing and breakpoint extensions
- Custom utility creation
- Custom variants
- Layer organization (@layer base, components, utilities)
- Apply directive for component extraction

## Visual Design System

**Canvas-based design philosophy, visual communication principles, and sophisticated compositions.**

See: `references/canvas-design-system.md`

Covers:
- Design philosophy approach
- Visual communication over text
- Systematic patterns and composition
- Color, form, and spatial design
- Minimal text integration
- Museum-quality execution
- Multi-page design systems

## Utility Scripts

**Python automation for component installation and configuration generation.**

### shadcn_add.py
Add shadcn/ui components with dependency handling:
```bash
python scripts/shadcn_add.py button card dialog
```

### tailwind_config_gen.py
Generate tailwind.config.js with custom theme:
```bash
python scripts/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

## Best Practices

1. **Component Composition**: Build complex UIs from simple, composable primitives
2. **Utility-First Styling**: Use Tailwind classes directly; extract components only for true repetition
3. **Mobile-First Responsive**: Start with mobile styles, layer responsive variants
4. **Accessibility-First**: Leverage Radix UI primitives, add focus states, use semantic HTML
5. **Design Tokens**: Use consistent spacing scale, color palettes, typography system
6. **Dark Mode Consistency**: Apply dark variants to all themed elements
7. **Performance**: Leverage automatic CSS purging, avoid dynamic class names
8. **TypeScript**: Use full type safety for better DX
9. **Visual Hierarchy**: Let composition guide attention, use spacing and color intentionally
10. **Expert Craftsmanship**: Every detail matters - treat UI as a craft

## Edge Cases & Pitfalls

### When NOT to Use shadcn/ui

shadcn/ui is React + Tailwind + Radix. It is the wrong tool when:

- **Non-React contexts.** shadcn components are JSX/TSX files that depend on Radix React primitives. They do not work in Svelte, Vue, Angular, SolidJS, plain HTML, or server-rendered template engines (Rails/Django/Laravel views, Astro `.astro`-only files without a React island). Use framework-native equivalents instead: [shadcn-svelte](https://www.shadcn-svelte.com/), [shadcn-vue](https://www.shadcn-vue.com/), [Bits UI](https://www.bits-ui.com/) (Svelte), [Ark UI](https://ark-ui.com/) (multi-framework), or [Melt UI](https://melt-ui.com/). For non-React Tailwind component markup, [daisyUI](https://daisyui.com/) is class-only and framework-agnostic.
- **You don't want Tailwind.** Every shadcn component ships Tailwind utility classes (`bg-primary`, `text-muted-foreground`, etc.). You *can* strip them and hand-write CSS, but that discards the library's value — prefer [Radix Themes](https://www.radix-ui.com/themes) or [Headless UI](https://headlessui.com/) (unstyled, you supply CSS/CSS-in-JS) instead.
- **Design-system lock-in already exists.** If the org standardizes on MUI, Chakra, Ant Design, or Mantine, mixing in shadcn duplicates primitives, doubles the a11y surface, and creates token drift. Stay on one system.
- **You need a fully managed, versioned dependency.** shadcn is copy-paste: components live in *your* repo and you own updates. If you want `npm update` to patch your UI library, that model is a poor fit.

### When NOT to Use Tailwind

- **CSS-in-JS apps (styled-components, Emotion, vanilla-extract, stitches).** Mixing Tailwind utilities with runtime CSS-in-JS means two styling paradigms, two sources of specificity, and ordering ambiguity between the static utility layer and the runtime `<style>` injection. Pick one. If the codebase is committed to CSS-in-JS, use [Panda CSS](https://panda-css.com/) (build-time, Tailwind-like ergonomics) or stay with the existing solution rather than bolting Tailwind on.
- **Tiny static pages / emails / no build step.** Tailwind needs a build (the v4 engine or CLI) to generate utilities. For a one-off HTML file with no toolchain, plain CSS or a CDN build is simpler; for HTML email, hand-written inline styles are required (utility classes don't survive email clients).
- **Highly art-directed, one-off layouts.** When every element is unique (editorial/award sites, complex SVG-driven scenes), utility soup adds noise without the reuse payoff — author bespoke CSS, optionally still using Tailwind's `@theme` tokens for color/spacing consistency.
- **Strict no-utility-class lint policies / Web Components with Shadow DOM.** Tailwind's global utility layer does not pierce Shadow DOM by default; component-scoped CSS or constructable stylesheets are the right tool there.

### Bundle-Size & Performance Trade-offs

- **Tailwind itself is near-free at runtime.** It produces static CSS, purges unused classes at build, and ships *zero* JS. The generated CSS scales with the number of *distinct* utilities used, not with markup size — repeated classes cost nothing extra. A mature app's CSS typically lands in the low tens of KB gzipped.
- **shadcn adds JS, not CSS.** Each component you add pulls its Radix primitive(s) into your bundle. Because utilities already exist in Tailwind's layer, adding shadcn components barely grows CSS, but Radix primitives (Dialog, Select, Popover, etc.) do add JS. Mitigate with tree-shaking (ES modules — automatic) and route/section-level code-splitting (`next/dynamic`, `React.lazy`) for heavy, below-the-fold components.
- **Avoid dynamically-constructed class names.** `` `text-${color}-500` `` is invisible to Tailwind's static scanner, so the class gets purged and silently doesn't render. Use full literal class strings and pick between them with a map or `cn()`:

```tsx
// ✅ scannable — full class strings present in source
const tone = { ok: "text-green-500", warn: "text-amber-500" } as const;
<span className={cn(tone[status])} />
// ❌ purged away — Tailwind never sees this literal
<span className={`text-${status}-500`} />
```

- **CSS-in-JS vs Tailwind perf:** runtime CSS-in-JS (styled-components/Emotion) serializes and injects styles during render, which shows up in hydration cost and React profiler flame graphs. Tailwind moves all of that to build time — generally the faster path for large component trees.

### Tailwind vs Custom CSS Conflicts (and how to resolve)

- **Specificity / ordering wars.** A custom CSS rule and a Tailwind utility targeting the same property: whichever comes *later* in the cascade (at equal specificity) wins, and bundlers can reorder. Fix by putting custom rules in explicit cascade layers so utilities can always override them predictably:

```css
@layer base, components, utilities;   /* declare order once */
@layer components {
  .card { padding: 1.5rem; border-radius: 0.75rem; }
}
/* a `p-2` utility on .card now wins because the utilities layer is last */
```

  In Tailwind v4, author custom rules inside `@layer components`/`@layer base` so the `utilities` layer keeps the upper hand. Avoid `!important` as a crutch (`!` / `!flex`) — reach for it only as a last resort.
- **Merging conflicting utilities at runtime.** Passing both `p-2` and a caller's `p-8` yields two padding utilities; CSS order, not intent, decides the winner. Always merge with `twMerge` (via the `cn()` helper) so the *last* wins deterministically:

```tsx
cn("p-2 rounded-md", className) // a caller passing "p-8" correctly overrides p-2
```

- **`@apply` pitfalls.** `@apply` only works with classes Tailwind knows in the current context, can't reference arbitrary runtime values, and in v4 must see your theme. Over-using `@apply` recreates a component CSS file and forfeits Tailwind's purge benefits — prefer composing utilities in markup or wrapping in a real component.
- **Resets clashing.** Tailwind's Preflist/preflight reset (unstyled lists, buttons, etc.) can surprise hand-written CSS or third-party widgets. Scope third-party styles, or selectively disable preflight if integrating a legacy stylesheet.
- **Global vs scoped collisions.** Tailwind utilities are global and won't reach into Shadow DOM; CSS Modules / scoped styles won't be overridden by global utilities either. Keep one ownership model per component boundary.

## Reference Navigation

**Component Library**
- `references/shadcn-components.md` - Complete component catalog
- `references/shadcn-theming.md` - Theming and customization
- `references/shadcn-accessibility.md` - Accessibility patterns

**Styling System**
- `references/tailwind-utilities.md` - Core utility classes
- `references/tailwind-responsive.md` - Responsive design
- `references/tailwind-customization.md` - Configuration and extensions

**Visual Design**
- `references/canvas-design-system.md` - Design philosophy and canvas workflows

**Automation**
- `scripts/shadcn_add.py` - Component installation
- `scripts/tailwind_config_gen.py` - Config generation

## Common Patterns

**Form with validation:**
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-6">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full">Sign In</Button>
      </form>
    </Form>
  )
}
```

**Responsive layout with dark mode:**
```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Content
          </h3>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

## Resources

- shadcn/ui Docs: https://ui.shadcn.com
- Tailwind CSS Docs: https://tailwindcss.com
- Radix UI: https://radix-ui.com
- Tailwind UI: https://tailwindui.com
- Headless UI: https://headlessui.com
- v0 (AI UI Generator): https://v0.dev
