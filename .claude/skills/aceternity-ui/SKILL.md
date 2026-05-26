---
name: aceternity-ui
description: 100+ animated React components (Aceternity UI) for Next.js with Tailwind. Use for hero sections, parallax, 3D effects, or encountering animation, shadcn CLI integration errors.
license: MIT
metadata:
  version: 1.1.0
  author: Claude Skills Maintainers
  last_updated: 2025-12-08
  last_verified: 2025-12-08
  motion_version: "12.23.25"
  clsx_version: "2.1.1"
  tailwind_merge_version: "3.4.0"
  references_included: 2
  keywords:
    - aceternity
    - aceternity-ui
    - react
    - nextjs
    - next.js
    - tailwind
    - tailwindcss
    - tailwind-css
    - framer-motion
    - motion
    - animations
    - animated-components
    - ui-components
    - component-library
    - shadcn
    - shadcn-ui
    - 3d-effects
    - background-effects
    - hero-sections
    - landing-pages
    - parallax
    - card-components
    - animated-cards
    - interactive-ui
    - modern-ui
    - visual-effects
    - typescript
    - bun
    - npm
    - pnpm
---

# Aceternity UI Skill

## Overview

Aceternity UI is a premium, production-ready React component library designed for Next.js applications. It provides 100+ beautifully animated and interactive components built with Tailwind CSS and Framer Motion. Components are installed via the shadcn CLI and can be customized directly in your codebase.

**Key Features:**
- 100+ animated, production-ready components
- Built for Next.js 13+ with App Router support
- Full TypeScript support
- Tailwind CSS v3+ styling
- Framer Motion animations
- Dark mode support
- Copy-paste friendly (not an npm package)
- Full source code access for customization

**Prerequisites:**
- Next.js 13+ (App Router recommended)
- React 16.8+
- Tailwind CSS v3+
- TypeScript (recommended)
- Node.js 18+ with bun, npm, or pnpm

## Installation

### Initial Setup

**For New Projects:**

```bash
# Create Next.js project (bun preferred)
bunx create-next-app@latest my-app
# or: npx create-next-app@latest my-app
# or: pnpm create next-app@latest my-app

cd my-app

# Select these options:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Optional
# - App Router: Yes (recommended)
# - Import alias: @/* (default)
```

**Initialize Aceternity UI via shadcn CLI:**

```bash
# Using bun (preferred)
bunx --bun shadcn@latest init

# Using npm
npx shadcn@latest init

# Using pnpm
pnpm dlx shadcn@latest init

# During setup:
# - Style: New York (recommended)
# - Color: Zinc (or your preference)
# - CSS variables: Yes (recommended)
```

**Configure Registry:**

After initialization, update `components.json` to add Aceternity registry:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "registries": {
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
  }
}
```

### Installing Components

**Using shadcn CLI 3.0+ (Namespaced Registry):**

```bash
# Install specific component
bunx shadcn@latest add @aceternity/background-beams
# or: npx shadcn@latest add @aceternity/background-beams
# or: pnpm dlx shadcn@latest add @aceternity/background-beams

# Component will be added to: components/ui/background-beams.tsx
```

**Manual Installation:**

If the registry method doesn't work, install manually:

1. Install required dependencies:
```bash
bun add motion clsx tailwind-merge
# or: npm install motion clsx tailwind-merge
```

2. Add utility function to `lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

3. Copy component code from [ui.aceternity.com](https://ui.aceternity.com) to your project

## Secure Installation

This setup runs multiple remote code executions (`create-next-app`, `shadcn init`, `shadcn add`). Before installing, follow supply chain security best practices:

- **Block post-install scripts** — `npm config set ignore-scripts true` (or Bun: disabled by default)
- **Cooldown period** — Wait 7 days for new package versions to be vetted by the community
- **Audit before installing** — Run `socket package score npm <pkg>` or use `socket npm install <pkg>` to check packages

Load the `dependency-upgrade` skill for full security configuration including Socket CLI integration, cooldown setup, lockfile validation, and CI enforcement.

## Component Categories

### 1. Backgrounds & Effects (28 components)

Create stunning animated backgrounds and visual effects for hero sections and full-page layouts.

**Key Components:**

- **Background Beams** - Animated glowing beams following SVG paths
- **Background Gradient** - Smooth gradient backgrounds with transitions
- **Wavy Background** - Animated wave patterns
- **Aurora Background** - Northern lights inspired animated gradients
- **Sparkles** - Particle sparkle effects
- **Meteors** - Falling meteor animations
- **Spotlight** - Dynamic spotlight effects
- **Grid and Dot Backgrounds** - Subtle grid/dot patterns
- **Vortex** - Swirling vortex animations
- **Canvas Reveal Effect** - Revealing content with canvas animations

**Usage Example:**

```tsx
"use client";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function HeroSection() {
  return (
    <div className="h-screen w-full relative">
      <div className="max-w-4xl mx-auto z-10 relative p-8">
        <h1 className="text-5xl font-bold">Welcome</h1>
        <p className="text-xl mt-4">Beautiful animated backgrounds</p>
      </div>
      <BackgroundBeams />
    </div>
  );
}
```

**When to Use:**
- Hero sections requiring visual impact
- Landing pages with animated backgrounds
- Full-screen sections needing depth
- Portfolio or agency websites
- Marketing pages with call-to-actions

### 2. Card Components (15 components)

Interactive cards with hover effects, animations, and 3D transformations.

**Key Components:**

- **3D Card Effect** - Cards with CSS perspective and 3D transforms
- **Card Hover Effect** - Smooth hover animations and transitions
- **Expandable Card** - Cards that expand to show more content
- **Focus Cards** - Cards that focus/highlight on hover
- **Card Spotlight** - Spotlight effect following mouse
- **Glare Card** - Holographic glare effect
- **Wobble Card** - Playful wobble animations
- **Infinite Moving Cards** - Auto-scrolling card carousel
- **Direction Aware Hover** - Hover effects based on cursor direction

**Usage Example:**

```tsx
"use client";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export function ProductCard() {
  return (
    <CardContainer>
      <CardBody className="bg-gray-50 rounded-xl p-6">
        <CardItem translateZ="50" className="text-2xl font-bold">
          Product Title
        </CardItem>
        <CardItem translateZ="60" as="p" className="text-sm mt-2">
          Product description goes here
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img src="/product.jpg" className="rounded-xl" alt="Product" />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
```

**When to Use:**
- Product showcases
- Feature highlights
- Portfolio items
- Team member profiles
- Pricing tiers
- Blog post previews

### 3. Scroll & Parallax (5 components)

Create engaging scroll-based animations and parallax effects.

**Key Components:**

- **Parallax Scroll** - Images with parallax scrolling
- **Sticky Scroll Reveal** - Content reveals while scrolling
- **Container Scroll Animation** - Animated scroll containers
- **Hero Parallax** - Parallax hero sections
- **MacBook Scroll** - MacBook-style scroll interactions

**Usage Example:**

```tsx
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

const content = [
  {
    title: "Feature One",
    description: "Description of feature one...",
    content: <div>Visual content here</div>
  },
  // More items...
];

export function Features() {
  return <StickyScroll content={content} />;
}
```

**When to Use:**
- Feature showcases with scroll interactions
- Storytelling layouts
- Product tours
- Long-form content with visual breaks
- Interactive timelines

### 4. Text Components (10 components)

Animated text effects for headings, titles, and interactive typography.

**Key Components:**

- **Text Generate Effect** - Text appearing character by character
- **Typewriter Effect** - Typing animation
- **Flip Words** - Word rotation animations
- **Text Hover Effect** - Interactive text on hover
- **Hero Highlight** - Gradient text highlights
- **Encrypted Text** - Matrix-style encrypted text effect
- **Colourful Text** - Gradient animated text

**Usage Example:**

```tsx
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

const words = [
  { text: "Build" },
  { text: "amazing" },
  { text: "websites", className: "text-blue-500" }
];

export function Hero() {
  return <TypewriterEffect words={words} />;
}
```

**When to Use:**
- Hero headings
- Attention-grabbing titles
- Dynamic content displays
- Interactive landing pages
- Animated CTAs

### 5. Buttons (4 components)

Enhanced button components with animations and effects.

**Key Components:**

- **Tailwind CSS Buttons** - Collection of styled buttons
- **Hover Border Gradient** - Animated gradient borders
- **Moving Border** - Animated border movement
- **Stateful Button** - Multi-state button with transitions

**Usage Example:**

```tsx
import { MovingBorder } from "@/components/ui/moving-border";

export function CTAButton() {
  return (
    <MovingBorder duration={2000} className="p-4">
      <span>Get Started</span>
    </MovingBorder>
  );
}
```

### 6. Navigation (5 components)

Modern navigation menus and tab systems.

**Key Components:**

- **Floating Navbar** - Floating navigation bar
- **Navbar Menu** - Full-featured navigation menu
- **Tabs** - Animated tab components
- **Resizable Navbar** - Responsive navigation
- **Sticky Banner** - Sticky announcement banners

### 7. Input & Forms (3 components)

Enhanced form inputs and file upload components.

**Key Components:**

- **Signup Form** - Animated signup forms
- **Placeholders and Vanish Input** - Inputs with animated placeholders
- **File Upload** - Drag-and-drop file upload

**Usage Example:**

```tsx
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

export function SearchBar() {
  const placeholders = [
    "Search for anything...",
    "What are you looking for?",
    "Type to search..."
  ];

  return (
    <PlaceholdersAndVanishInput
      placeholders={placeholders}
      onChange={(e) => console.log(e.target.value)}
      onSubmit={(e) => {
        e.preventDefault();
        console.log("submitted");
      }}
    />
  );
}
```

### 8. Overlays & Popovers (3 components)

Modal dialogs and tooltips with animations.

**Key Components:**

- **Animated Modal** - Modal with smooth animations
- **Animated Tooltip** - Tooltips with enter/exit animations
- **Link Preview** - Link preview popover on hover

**Usage Example:**

```tsx
import { Modal, ModalBody, ModalContent, ModalTrigger } from "@/components/ui/animated-modal";

export function BookingModal() {
  return (
    <Modal>
      <ModalTrigger className="bg-black text-white px-4 py-2 rounded-md">
        Book Now
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <h2>Booking Details</h2>
          {/* Modal content */}
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}
```

### 9. Carousels & Sliders (4 components)

Image sliders and carousel components.

**Key Components:**

- **Images Slider** - Full-screen image slider
- **Carousel** - Standard carousel component
- **Apple Cards Carousel** - Apple-style card carousel
- **Animated Testimonials** - Testimonial slider

### 10. Layout & Grid (3 components)

Grid layouts and container components.

**Key Components:**

- **Layout Grid** - Animated grid layouts
- **Bento Grid** - Bento-box style grid
- **Container Cover** - Full-screen container

### 11. Data & Visualization (2 components)

Components for displaying data and comparisons.

**Key Components:**

- **Timeline** - Animated timeline component
- **Compare** - Before/after comparison slider

### 12. Cursor & Pointer (3 components)

Cursor-following effects and interactions.

**Key Components:**

- **Following Pointer** - Elements following cursor
- **Pointer Highlight** - Highlight effect on cursor
- **Lens** - Magnifying lens effect

### 13. 3D Components (2 components)

3D visual effects using CSS transforms.

**Key Components:**

- **3D Pin** - Pinterest-style 3D card
- **3D Marquee** - 3D rotating marquee

### 14. Loaders (2 components)

Loading animations and progress indicators.

**Key Components:**

- **Multi-step Loader** - Multi-step loading animation
- **Loader** - Various loading spinners

### 15. Sections & Blocks (3 components)

Pre-built section templates.

**Key Components:**

- **Feature Sections** - Feature showcase templates
- **Cards** - Pre-designed card layouts
- **Hero Sections** - Hero section templates

## Common Patterns

### Dark Mode Support

All Aceternity components support dark mode via Tailwind's dark mode classes:

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  {/* Content */}
</div>
```

### Responsive Design

Components are responsive by default. Use Tailwind's responsive prefixes:

```tsx
<h1 className="text-2xl md:text-4xl lg:text-6xl">
  Responsive Heading
</h1>
```

### Combining Components

Components can be combined for complex layouts:

```tsx
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { MovingBorder } from "@/components/ui/moving-border";

export default function Hero() {
  return (
    <div className="h-screen relative">
      <div className="z-10 relative flex flex-col items-center justify-center h-full">
        <TypewriterEffect words={words} />
        <MovingBorder>
          <button>Get Started</button>
        </MovingBorder>
      </div>
      <BackgroundBeams />
    </div>
  );
}
```

## Best Practices

### 1. Performance Optimization

**Use "use client" directive** - Aceternity components use Framer Motion, requiring client-side rendering:

```tsx
"use client";
import { Component } from "@/components/ui/component";
```

**Lazy load heavy components:**

```tsx
import dynamic from 'next/dynamic';

const HeavyBackground = dynamic(
  () => import('@/components/ui/background-beams'),
  { ssr: false }
);
```

### 2. Accessibility

**Add ARIA labels:**

```tsx
<button aria-label="Open menu">
  <MenuIcon />
</button>
```

**Ensure keyboard navigation:**

```tsx
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>
  Interactive element
</div>
```

### 3. Customization

**Override styles using className:**

```tsx
<BackgroundBeams className="opacity-50" />
```

**Modify component source directly** - Since components are copied to your project, you can edit them:

```tsx
// components/ui/background-beams.tsx
export function BackgroundBeams({ className, myCustomProp }: Props) {
  // Customize as needed
}
```

### 4. Type Safety

**Use TypeScript for prop types:**

```tsx
interface CardProps {
  title: string;
  description: string;
  image?: string;
}

export function Card({ title, description, image }: CardProps) {
  // Component implementation
}
```

## Troubleshooting

### Common Issues

**1. "Module not found: motion"**
```bash
bun add motion
# or: npm install motion
```

**2. "cn is not defined"**
Ensure `lib/utils.ts` exists with the `cn` helper function.

**3. Components not animating**
Verify "use client" directive is at the top of the file.

**4. Tailwind classes not working**
Ensure Tailwind is configured and `globals.css` imports Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**5. Dark mode not working**
Check `tailwind.config.ts` has `darkMode: "class"` configured.

## Edge Cases & Pitfalls

### Mobile Responsiveness & Landscape Mode

Most Aceternity components are tuned for desktop hover and full-viewport heroes. They need explicit handling on small screens and in landscape orientation.

**1. `h-screen` heroes overflow / get cut off in mobile landscape.** A `100vh` hero is taller than a phone in landscape (≈375px tall) and `100vh` also includes the area under mobile browser chrome, so content gets clipped or hidden behind the URL bar. Prefer `min-h-[100svh]` / `min-h-[100dvh]` (small/dynamic viewport units) and a hard floor so it never collapses, plus a landscape override:

```tsx
// Robust hero height across orientations and mobile browser chrome
<section className="relative min-h-[100svh] min-h-[100dvh] w-full overflow-hidden
                    landscape:min-h-[150vh] sm:landscape:min-h-screen">
  <div className="relative z-10 flex min-h-[inherit] flex-col items-center
                  justify-center px-4 py-16 text-center">
    {/* hero content — note py to avoid edge-clipping in landscape */}
  </div>
  <BackgroundBeams />
</section>
```

**2. Hover-only components do nothing on touch.** 3D Card Effect, Card Spotlight, Glare Card, Following Pointer, Direction Aware Hover and similar effects key off `mousemove`/`:hover`, which never fire on touch. Don't ship them as the *only* interaction on mobile — provide a static/animated fallback, and gate the heavy mouse handlers behind a pointer query so you don't waste cycles:

```tsx
"use client";
import { useEffect, useState } from "react";

const useFinePointer = () => {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(mq.matches);
    const on = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
};

// Render the 3D/hover effect only where it works; static card otherwise
{useFinePointer() ? <ThreeDCard {...p} /> : <StaticCard {...p} />}
```

You can also disable transforms purely in CSS with the `hover-none`/`pointer-coarse` variants: `className="[@media(hover:none)]:!transform-none"`.

**3. `HeroParallax` / `MacBookScroll` / `ContainerScroll` jank on mobile.** These use heavy scroll-linked `useScroll`/`useTransform` math and large image grids that are punishing on low-end devices and awkward in landscape. Reduce the row count on mobile, lazy-load below-the-fold images, and consider rendering a simpler static hero under `sm`:

```tsx
const products = isMobile ? allProducts.slice(0, 5) : allProducts;
// images: width/height set + loading="lazy" + sizes attr to avoid CLS
```

**4. `InfiniteMovingCards` / marquee can cause horizontal scroll.** Wrap in a container with `overflow-x-hidden` (or `overflow-x-clip`) on the section, never on `body`, and cap card widths with `max-w-[85vw]` so a single card doesn't exceed the viewport on small phones.

**5. Respect reduced motion.** Heavy animated backgrounds (Vortex, Meteors, Wavy, Aurora) should pause for users who opt out. Add `motion-reduce:hidden` to purely decorative layers, or gate the animation with `useReducedMotion()` from `motion/react`.

### Variant Composition (multiple effects on one hero)

Combining several effect components on a single hero is the most common source of broken layouts. The conflicts are predictable:

**1. Stacking order — give every layer an explicit `z-index`.** Background effects (`BackgroundBeams`, `Aurora`, `Sparkles`, `Spotlight`) render with `absolute inset-0` and will paint *over* your content unless content gets a higher `z`. Establish one stacking context on the wrapper and assign each layer a tier:

```tsx
<section className="relative isolate min-h-[100dvh] overflow-hidden">
  {/* z-0: furthest background */}
  <AuroraBackground className="absolute inset-0 z-0" />
  {/* z-10: mid effect — keep at most ONE full-canvas animated bg + one accent */}
  <SparklesCore className="absolute inset-0 z-10" />
  {/* z-20: content */}
  <div className="relative z-20 flex min-h-[inherit] flex-col items-center justify-center">
    <TextGenerateEffect words="..." />
  </div>
</section>
```

`isolate` on the wrapper is critical — it creates a new stacking context so the children's `z` values don't leak out and fight the rest of the page.

**2. Don't stack two full-canvas animated backgrounds.** Two of {BackgroundBeams, Vortex, Wavy, Aurora, Meteors} on one hero compound their `requestAnimationFrame` loops and tank frame rate, and their gradients muddy each other. Pick one ambient background + one *localized* accent (e.g. `Spotlight` or a `Sparkles` band), not two full-screen ones.

**3. Pointer-event capture.** Full-canvas effects (Spotlight, Following Pointer, canvas backgrounds) can sit on top of and swallow clicks meant for buttons/links beneath them. Add `pointer-events-none` to decorative layers and re-enable only where needed (`pointer-events-auto` on the interactive child).

**4. Transform conflicts.** A 3D/perspective component (3D Card, 3D Pin) nested inside a scroll-transformed parent (HeroParallax, ContainerScroll) compounds `transform` matrices and breaks the perspective. Keep `transform-gpu`/`perspective` components out of scroll-transformed subtrees; place them in sibling sections instead.

**5. Conflicting motion providers / duplicate keys.** Mixing the legacy `framer-motion` and the current `motion` packages in the same tree causes context errors — standardize on `motion` (import from `motion/react`). When combining components that each render lists with internal animation, ensure outer `key` props are unique to avoid AnimatePresence remount glitches.

## Token Efficiency

This skill provides significant token savings by:

- **Pre-vetted component selection** - Saves ~3k tokens exploring component options
- **Installation instructions** - Saves ~2k tokens debugging setup issues
- **Component categorization** - Saves ~2k tokens finding the right component
- **Usage examples** - Saves ~2k tokens writing boilerplate code
- **Troubleshooting guide** - Saves ~1k tokens debugging common issues

**Estimated savings: ~10k tokens (65-70% reduction) per implementation**

**Errors prevented:**
1. Missing motion dependency
2. Incorrect shadcn CLI initialization
3. Missing cn utility function
4. Missing "use client" directive
5. Incorrect registry configuration
6. Wrong Next.js configuration (Pages Router vs App Router)

## When to Load References

Load reference files based on task context:

| If User Asks About... | Load This Reference |
|-----------------------|---------------------|
| New project setup, installation, getting started | `references/quick-start.md` (465 lines) |
| Finding specific components, component categories, CLI commands | `references/component-catalog.md` (635 lines) |
| Usage examples, patterns, troubleshooting | Main SKILL.md (this file) |

**Reference Summary:**
- `quick-start.md` - 5-minute setup guide, first component examples, troubleshooting, project structure
- `component-catalog.md` - Complete list of 100+ components with install commands and use cases

## Additional Resources

- **Official Documentation**: https://ui.aceternity.com/docs
- **Component Gallery**: https://ui.aceternity.com/components
- **Shadcn UI**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion
- **Tailwind CSS**: https://tailwindcss.com

## Related Skills

When using this skill, consider combining with:

- `nextjs` - Next.js framework skill
- `tailwind-v4-shadcn` - Tailwind CSS v4 configuration
- `react-hook-form-zod` - Form validation
- `clerk-auth` - Authentication
- `cloudflare-nextjs` - Cloudflare deployment

## License

This skill documentation is provided under MIT License. Aceternity UI components have their own licensing - check https://ui.aceternity.com for details.

---

**Last Updated**: 2025-12-08
**Version**: 1.1.0
**Maintainer**: Claude Skills Maintainers
