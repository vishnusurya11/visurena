---
name: landing-page
description: "Generate a complete, deployable landing page from a brief. Produces a single self-contained HTML file with Tailwind CSS (via CDN), responsive design, dark mode, semantic HTML, and OG meta tags. Sections: hero with CTA, features, social proof, pricing (optional), FAQ, footer. Use when building a marketing page, product launch page, coming soon page, or any standalone landing page. Triggers: 'landing page', 'create a page', 'marketing page', 'launch page', 'coming soon page', 'one-page site'."
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
compatibility: claude-code-only
---

# Landing Page Generator

Generate a complete, deployable landing page as a single HTML file. No build step, no dependencies — open it in a browser or deploy anywhere.

> ## ⭐ Make it award-winning — on par with the best sites in the world
> A landing page is the most-judged surface, so the bar is **world-class, "wow"-tier**. Deep standard (in the `modern-web-design` skill):
> **→ [`../modern-web-design/references/award-winning-playbook.md`](../modern-web-design/references/award-winning-playbook.md)** (typography ratios, charcoal premium dark, tasteful/slight motion, subtle parallax, performance budgets, AI-slop kill-list, pre-ship checklist).
>
> **This project = Visurena, an AI-powered entertainment hub.** These defaults **supersede the generic ones below**:
> - **Charcoal premium dark by default** — background `#0E0E0E`–`#121212` (never pure `#000` and not the plain slate/blue default), elevation via lighter surfaces, **one disciplined accent** used only on CTAs/highlights. OKLCH or hex tokens via CSS custom properties.
> - **Distinctive fonts, not the system stack** — pair a characterful display face + a clean body (e.g. Fraunces/Clash Display/Space Grotesk for display) loaded via Google Fonts `<link rel="preload">` or self-hosted WOFF2; fluid `clamp()` sizing; oversized hero headline.
> - **Slightly animated** — tasteful scroll reveals (opacity + `translateY(16–32px)`, fire **once**, ease-out ~0.5s) via a tiny IntersectionObserver, plus **subtle parallax (5–15%)** and hover micro-interactions. Add GSAP via CDN only if the brief wants richer scroll choreography. Animate transform/opacity only; respect `prefers-reduced-motion` (swap to opacity/none).
> - **Asymmetric, editorial layout** — break centered-hero-+-3-cards; use intentional alignment, varied column widths, a bento feature grid, generous negative space on an 8px scale.
> - **One signature "wow" moment** (e.g. an animated/parallax hero), calm everywhere else; real copy and real assets (zero Lorem ipsum, zero AI-slop from the kill-list).

## Workflow

### 1. Gather the Brief

Ask the user for:

| Field | Required | Example |
|-------|----------|---------|
| Business/product name | Yes | "Acme Plumbing" |
| Value proposition | Yes | "24/7 emergency plumbing across Newcastle" |
| Target audience | Yes | "Homeowners in the Hunter Valley" |
| Primary CTA | Yes | "Call Now" / "Get a Quote" / "Sign Up" |
| Secondary CTA | No | "Learn More" / "View Pricing" |
| Brand colours | No | Primary: #1E40AF, accent: #F59E0B |
| Logo URL or text | No | URL to logo image, or just use business name |
| Phone / email | No | For contact section |
| Sections wanted | No | Default: hero, features, testimonials, FAQ, footer |

If no brand colours provided, suggest using the `color-palette` skill to generate them, or use a sensible default (slate/blue).

### 2. Generate the HTML

**Start from the complete, working skeleton:** `references/skeleton.html`. It is a
copy-paste, single-file landing page with every section (nav + mobile menu, hero, features,
social proof, pricing, CTA form, FAQ, footer), Tailwind via CDN, OG/Twitter meta, FAQPage
JSON-LD, no-flash dark mode, scroll reveals, form validation, and `prefers-reduced-motion`
handling. Read it, then adapt the copy/colours/sections to the brief — don't rebuild from
scratch.

Structure of the single HTML file:

```
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <!-- charset, viewport, title, description, canonical -->
  <!-- OG + Twitter card meta (og:image 1200x630) -->
  <!-- No-flash dark-mode IIFE (BEFORE Tailwind) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class', theme: { extend: { colors: {...} } } }</script>
  <!-- FAQPage JSON-LD -->
</head>
<body>
  <!-- Skip link · Nav (+ mobile menu) · Hero · Features · Social Proof
       · Pricing (optional) · CTA form · FAQ (details/summary) · Footer -->
  <!-- Scripts: year, dark toggle, mobile menu, IntersectionObserver reveal, form validation -->
</body>
</html>
```

**No-flash dark mode** — this must run in `<head>` *before* Tailwind loads, or the page
flashes light then snaps to dark:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
</script>
```

**Tailwind CDN note:** `https://cdn.tailwindcss.com` is the v3 Play CDN (supports the inline
`tailwind.config` used here) — great for prototypes, not for high-traffic production (ship a
compiled build then). For Tailwind v4, the browser script is
`https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4` with config via a
`<style type="text/tailwindcss">@theme { --color-... }</style>` block instead of
`tailwind.config`.

### 3. Section Patterns

#### Navigation
- Sticky top nav with logo/name + anchor links to sections
- Mobile hamburger menu (CSS-only or minimal JS)
- CTA button in nav (right-aligned)

#### Hero
- Full-width, above the fold
- Headline (h1) — the value proposition, not the business name
- Subheadline — supporting detail, 1-2 sentences
- Primary CTA button (large, contrasting colour)
- Optional: hero image placeholder or gradient background
- Pattern: text-left on desktop (60/40 split with image), centred on mobile

#### Features / Services
- 3-6 items in a responsive grid (1 col mobile, 2-3 cols desktop)
- Each: icon placeholder + heading + short description
- Use semantic headings (h2 for section, h3 for items)

#### Social Proof / Testimonials
- 2-3 testimonial cards with quote, name, role/company
- Star rating if applicable
- Alternative: logo bar of client/partner logos

#### Pricing (optional)
- 2-3 tier cards (basic/pro/enterprise pattern)
- Highlighted "recommended" tier
- Feature comparison list per tier
- CTA button per tier

#### FAQ
- Accordion pattern (details/summary — no JS needed)
- 4-6 common questions
- Schema.org FAQPage markup for SEO

#### Footer
- Business name, contact info, social links
- Legal links (privacy, terms) as placeholders
- Copyright year (use JS for auto-update)

### 4. Technical Requirements

**Responsive**: Mobile-first with three breakpoints
```
Default: mobile (< 640px)
sm: 640px+ (tablet)
lg: 1024px+ (desktop)
```

**Dark mode**: Three-state toggle (light/dark/system)
- CSS custom properties for colours
- `.dark` class on `<html>` — no CSS media query
- Small JS snippet for toggle + localStorage persistence

**Accessibility**:
- Proper heading hierarchy (h1 → h2 → h3, no skips)
- Alt text placeholders on all images
- Focus-visible styles on interactive elements
- Sufficient colour contrast (4.5:1 minimum)
- Skip-to-content link

**SEO**:
- Semantic HTML5 elements (header, main, section, footer)
- OG meta tags (title, description, image, url)
- Twitter card meta tags
- Canonical URL
- JSON-LD for LocalBusiness if it's a local business (reference `seo-local-business` skill)

**Performance**:
- No JS required for core content rendering
- Lazy-load images (`loading="lazy"`)
- System font stack (no external font requests)
- Single file — no external CSS/JS beyond Tailwind CDN

### 5. Colour Application

If user provides brand colours, configure Tailwind inline:

```html
<script>
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E40AF', light: '#3B82F6', dark: '#1E3A8A' },
        accent: { DEFAULT: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
      }
    }
  }
}
</script>
```

If no colours provided, use Tailwind's built-in palette (slate for neutrals, blue for primary).

### 6. Output

Write the file to the user's specified location, or default to `./index.html`.

After generating:
1. Tell the user how to preview: `open index.html` (macOS) or `python3 -m http.server` for a local server
2. Suggest deployment options: drag to Cloudflare Pages, Netlify drop, or `wrangler deploy` for Workers
3. List placeholder content that needs replacing (images, testimonials, phone numbers)

## Quality Rules

1. **No placeholder lorem ipsum** — generate realistic placeholder text based on the business type
2. **No broken layouts** — test the responsive grid mentally: 1 col → 2 col → 3 col
3. **No inline styles** — use Tailwind classes exclusively
4. **Real interactions** — smooth scroll to sections, working accordion, working dark mode toggle
5. **Accessible by default** — don't sacrifice accessibility for aesthetics
6. **Australian conventions** — if the business is Australian, use +61 phone format, Australian spelling, ABN placeholder

## Edge Cases & Pitfalls

- **Missing OG image** — if the user has no `og:image`, the link preview is blank/ugly. Generate
  a 1200×630 placeholder (e.g. `https://placehold.co/1200x630/1E40AF/FFFFFF?text=Brand`) and
  flag that it must be replaced with a real image at a real, absolute HTTPS URL (relative URLs
  and `localhost` paths don't render in social scrapers). Always include `og:image:width`/
  `:height`/`:alt`.
- **Dark-mode flash (FOUC)** — the theme script must be a synchronous IIFE in `<head>` *before*
  the Tailwind script. Putting the toggle logic only at the bottom of `<body>` causes a flash.
- **Image CLS (layout shift)** — every `<img>` needs `width`+`height` attributes (or a CSS
  `aspect-ratio` wrapper) so the browser reserves space. Missing dimensions = content jumps as
  images load and tanks the CLS score.
- **Lazy loading the hero** — use `loading="lazy"` on *below-the-fold* images only. The
  above-the-fold hero image should be eager (default / `loading="eager"` / `fetchpriority="high"`)
  or it loads late and hurts LCP.
- **Form has no backend** — a static landing page can't process submissions. Wire `action` to a
  form service (Formspree, Netlify Forms, Cloudflare) or flag it clearly. Always add real
  client-side validation (`required`, `type`, `pattern`, `minlength`) with `novalidate` +
  visible error messages, plus accessible `aria-describedby` error wiring.
- **FAQ JSON-LD mismatch** — the structured-data questions/answers must match the *visible*
  on-page text exactly, or Google ignores it. Keep one `FAQPage` per page.
- **Tailwind CDN in production** — the Play CDN is dev-only; for a real deployment, compile a
  Tailwind build (or accept the CDN for a quick prototype and say so).
- **Anchor links hidden under sticky nav** — add `scroll-margin-top` (or Tailwind
  `scroll-mt-20`) to section targets so the sticky header doesn't cover the heading.
- **`prefers-reduced-motion`** — gate scroll reveals/animations; the skeleton resets `.reveal`
  to visible and disables smooth scroll under reduced motion. Never ship motion that can't be
  turned off.
- **Contrast on accent buttons** — bright accent (e.g. amber) needs dark text, not white, to
  hit 4.5:1. Verify the CTA button's text/bg pair.

## References

- Tailwind CSS — Play CDN: https://tailwindcss.com/docs/installation/play-cdn
- Tailwind CSS — Dark mode (class strategy): https://tailwindcss.com/docs/dark-mode
- MDN — HTML semantic elements (`<header>`, `<main>`, `<section>`, `<footer>`): https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html
- MDN — `<details>`/`<summary>` (no-JS accordion): https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
- MDN — Lazy loading images: https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading
- MDN — Client-side form validation: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
- The Open Graph protocol: https://ogp.me/
- schema.org — FAQPage: https://schema.org/FAQPage
- Google — Mark up FAQs (FAQPage structured data): https://developers.google.com/search/docs/appearance/structured-data/faqpage
- WCAG 2.2 SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- web.dev — Cumulative Layout Shift (CLS): https://web.dev/articles/cls
- Local: `references/skeleton.html` (complete working single-file template)

## Variations

| Request | Approach |
|---------|----------|
| "Coming soon page" | Hero only + email signup form + countdown timer |
| "Product launch" | Hero + features + pricing + CTA-heavy |
| "Portfolio" | Hero + project grid + about + contact |
| "Event page" | Hero + schedule + speakers + venue + register CTA |
| "App download" | Hero + features + screenshots + app store badges |

Adapt the section selection to match the page purpose. Not every page needs pricing or FAQ.
