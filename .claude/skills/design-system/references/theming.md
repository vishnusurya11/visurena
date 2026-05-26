# Theming — light/dark + per-vertical accents, web & mobile

Theming = swapping what **semantic** tokens point at, never renaming them and never
touching components. Two axes: light/dark (mode) and movies/music/games/stories/
tournaments (vertical accent). They compose.

## Contents
- [Mental model](#mental-model)
- [Web: raw vars + @theme inline](#web-raw-vars--theme-inline)
- [shadcn semantic pairs](#shadcn-semantic-pairs)
- [Per-vertical accents (web)](#per-vertical-accents-web)
- [Mobile: NativeWind vars() + useColorScheme](#mobile-nativewind-vars--usecolorscheme)
- [Per-vertical accents (mobile)](#per-vertical-accents-mobile)
- [Do / Don't](#do--dont)
- [Sources](#sources)

## Mental model

- **Mode** (light/dark) swaps the *whole* semantic palette — every `--background`,
  `--foreground`, surface, border.
- **Vertical** swaps **only** the accent primitive that `--accent` points at. Everything
  else stays.
- Because components read semantic tokens (`--primary`, `--accent`), they re-theme for
  free. WHY this matters: you maintain ~5 small accent overrides, not 5 component forks.

Suggested vertical accents (charcoal-friendly, one disciplined accent each):

| Vertical | Accent |
|---|---|
| movies | crimson |
| music | magenta |
| games | emerald |
| stories | amber |
| tournaments | azure |

## Web: raw vars + @theme inline

Tailwind v4 is **CSS-first** — no `tailwind.config.js`. Define raw values in
`:root` / `.dark`, then expose them to utilities with `@theme inline`. Importing the
compiled `tokens.css` (from Style Dictionary) gives you the primitives; this file maps
them to the shadcn semantic names.

```css
/* apps/web/app/globals.css */
@import "tailwindcss";
@import "@visurena/tokens/build/web/tokens.css"; /* primitives as var() */

@custom-variant dark (&:is(.dark *));

:root {
  color-scheme: light;
  --background: var(--color-primitive-charcoal-100);
  --foreground: var(--color-primitive-charcoal-950);
  --card: oklch(0.99 0 0);
  --card-foreground: var(--color-primitive-charcoal-950);
  --primary: var(--color-primitive-charcoal-900);
  --primary-foreground: var(--color-primitive-charcoal-100);
  --muted: oklch(0.95 0 270);
  --muted-foreground: oklch(0.45 0 270);
  --accent: var(--color-primitive-amber-500);
  --accent-foreground: var(--color-primitive-charcoal-950);
  --border: oklch(0.90 0 270);
  --input: oklch(0.90 0 270);
  --ring: var(--color-primitive-amber-500);
  --radius: 0.75rem; /* ~12px, medium — charcoal premium, not pill */
}

.dark {
  color-scheme: dark; /* tells the UA to render dark form controls/scrollbars */
  --background: var(--color-primitive-charcoal-900);   /* ~L 0.16, NOT #000 */
  --foreground: var(--color-primitive-charcoal-100);   /* ~L 0.96 */
  --card: var(--color-primitive-charcoal-800);         /* elevated ~L 0.20 */
  --card-foreground: var(--color-primitive-charcoal-100);
  --primary: var(--color-primitive-amber-500);
  --primary-foreground: var(--color-primitive-charcoal-950);
  --muted: var(--color-primitive-charcoal-800);
  --muted-foreground: var(--color-primitive-charcoal-400);
  --accent: var(--color-primitive-amber-500);
  --accent-foreground: var(--color-primitive-charcoal-950);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 12%);
  --ring: var(--color-primitive-amber-500);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
}
```

Toggle `.dark` on `<html>` with `next-themes`. For the exact toggle wiring, install
steps, and v3→v4 migration gotchas, **defer to `tailwind-theme-builder`** — this skill
owns the token mapping, that one owns the plumbing.

## shadcn semantic pairs

Adopt shadcn's convention so any shadcn/ui or React Native Reusables component drops in.
Each surface ships with its **foreground** partner so text contrast is guaranteed:

`--background`/`--foreground`, `--card`/`--card-foreground`,
`--popover`/`--popover-foreground`, `--primary`/`--primary-foreground`,
`--secondary`/`--secondary-foreground`, `--muted`/`--muted-foreground`,
`--accent`/`--accent-foreground`, `--destructive`/`--destructive-foreground`,
`--border`, `--input`, `--ring`, `--radius`, `--chart-1`…`--chart-5`.

WHY pairs: you never have to guess what text color sits on a surface — the pair already
encodes a verified contrast relationship. Keep that invariant in every theme.

## Per-vertical accents (web)

Set `data-vertical` on a route layout (or `<html>`) and override **only** the accent
primitive. Everything downstream — buttons, links, rings, focus — follows.

```css
[data-vertical="movies"]      { --accent: var(--color-primitive-crimson-500);  --ring: var(--color-primitive-crimson-500); }
[data-vertical="music"]       { --accent: var(--color-primitive-magenta-500);  --ring: var(--color-primitive-magenta-500); }
[data-vertical="games"]       { --accent: var(--color-primitive-emerald-500);  --ring: var(--color-primitive-emerald-500); }
[data-vertical="stories"]     { --accent: var(--color-primitive-amber-500);    --ring: var(--color-primitive-amber-500); }
[data-vertical="tournaments"] { --accent: var(--color-primitive-azure-500);    --ring: var(--color-primitive-azure-500); }
```
```tsx
// apps/web/app/(verticals)/movies/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <section data-vertical="movies">{children}</section>;
}
```
This composes with mode: `.dark [data-vertical="movies"]` inherits dark surfaces +
crimson accent automatically. **Always re-check `--accent-foreground` contrast against
the new accent** — a foreground that passed on amber may fail on crimson.

## Mobile: NativeWind vars() + useColorScheme

NativeWind v4 supports CSS custom properties via **`vars()`** and reads the OS theme via
**`useColorScheme()`**. Same token names, same mental model as web. Define the semantic
vars per mode and apply them at the root through a context provider.

```ts
// apps/mobile/lib/theme.ts
import { vars } from 'nativewind';
import { tokens } from '@visurena/tokens/build/native/tokens'; // typed primitives

export const themes = {
  light: vars({
    '--background': tokens.color.primitive.charcoal[100],
    '--foreground': tokens.color.primitive.charcoal[950],
    '--card': '#ffffff',
    '--primary': tokens.color.primitive.charcoal[900],
    '--accent': tokens.color.primitive.amber[500],
    '--accent-foreground': tokens.color.primitive.charcoal[950],
    '--ring': tokens.color.primitive.amber[500],
  }),
  dark: vars({
    '--background': tokens.color.primitive.charcoal[900], // NOT #000
    '--foreground': tokens.color.primitive.charcoal[100],
    '--card': tokens.color.primitive.charcoal[800],
    '--primary': tokens.color.primitive.amber[500],
    '--accent': tokens.color.primitive.amber[500],
    '--accent-foreground': tokens.color.primitive.charcoal[950],
    '--ring': tokens.color.primitive.amber[500],
  }),
};
```
```tsx
// apps/mobile/app/_layout.tsx
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { themes } from '~/lib/theme';

export default function Root({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  return <View style={themes[colorScheme ?? 'dark']} className="flex-1 bg-background">{children}</View>;
}
```
Use the same Tailwind class names as web (`bg-background`, `text-foreground`,
`bg-accent`) so a component's markup is portable.

## Per-vertical accents (mobile)

`vars()` cascades like CSS custom properties — wrap a vertical's screens in a `View`
whose `style` overrides `--accent` (and `--ring`). It inherits the active mode's
surfaces from the parent.

```tsx
import { vars } from 'nativewind';
import { tokens } from '@visurena/tokens/build/native/tokens';

const verticalAccent = (c: string) => vars({ '--accent': c, '--ring': c });

// movies screen group
<View style={verticalAccent(tokens.color.primitive.crimson[500])} className="flex-1">
  {/* children read bg-accent / ring-ring and pick up crimson */}
</View>
```

## Do / Don't

- **Do** keep semantic token names identical across mode and vertical — only repoint them.
- **Don't** rename `--accent` to `--movies-accent`. That re-forks every consumer.
- **Do** set `color-scheme` per mode (web) so native controls render correctly.
- **Don't** override surfaces inside a vertical — verticals change **accent only**.
- **Do** re-verify accent-foreground contrast after every accent swap, in both modes.

## Sources

- shadcn theming — https://ui.shadcn.com/docs/theming
- shadcn + Tailwind v4 — https://ui.shadcn.com/docs/tailwind-v4
- Tailwind theme — https://tailwindcss.com/docs/theme
- NativeWind themes — https://www.nativewind.dev/docs/guides/themes
