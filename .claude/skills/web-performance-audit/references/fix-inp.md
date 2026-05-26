# Fixing INP (Interaction to Next Paint)

**Good ≤ 200 ms at p75** (200–500 = needs improvement, > 500 = poor). INP became a Core Web Vital on **12 March 2024**, replacing FID. Unlike FID (first interaction's input delay only), **INP measures the latency of nearly all interactions across the whole session** and reports a representative worst value.

## Three phases of an interaction

```
[ Input delay ]──[ Processing duration ]──[ Presentation delay ]
   main thread        your event             render the next
   busy when input    handlers run           frame
   arrives
```

The attribution build (`onINP` → `interactionTarget`, `interactionType`, `inputDelay`, `processingDuration`, `presentationDelay`, `loadState`) tells you **which element** and **which phase** is slow. Optimize the dominant phase:
- High **input delay** → main thread busy with other JS (long tasks, hydration, third-party). Break up / defer that work.
- High **processing duration** → your handler does too much. Split it, yield, do less synchronously.
- High **presentation delay** → too much DOM/layout/paint after the handler. Simplify DOM, avoid big synchronous reflows.

## 1. Break up long tasks — yield to the main thread

Any task > 50 ms blocks input. Chunk work and yield between chunks.

```js
// scheduler.yield() (Chrome; Firefox positive signal, not in Safari yet)
// puts the continuation at the FRONT of the queue — better than setTimeout.
async function processInChunks(items) {
  for (const item of items) {
    doWork(item);
    if (shouldYield()) await yieldToMain();
  }
}

function shouldYield() {
  // Yield if there's pending input OR we've run a while.
  return navigator.scheduling?.isInputPending?.() ?? false;
}

function yieldToMain() {
  if ('scheduler' in window && 'yield' in scheduler) {
    return scheduler.yield();               // best
  }
  return new Promise((resolve) => setTimeout(resolve, 0)); // fallback (back of queue)
}
```

A time-based fallback if `isInputPending` is unavailable:

```js
let lastYield = performance.now();
function shouldYield() {
  if (performance.now() - lastYield > 50) { lastYield = performance.now(); return true; }
  return false;
}
```

## 2. Respond visually first, defer the heavy work

The user must *see* a response in the next frame; do the expensive part after.

```js
button.addEventListener('click', () => {
  // 1. Cheap, immediate visual feedback (paints next frame → low INP)
  button.classList.add('is-loading');

  // 2. Push expensive work off the interaction's critical path
  requestAnimationFrame(() => setTimeout(() => {
    const result = expensiveCompute();
    renderResult(result);
    button.classList.remove('is-loading');
  }, 0));
});
```

## 3. React 18+: mark non-urgent updates

```jsx
import { startTransition, useDeferredValue } from 'react';

function onChange(e) {
  setQuery(e.target.value);                 // urgent: keep the input responsive
  startTransition(() => setResults(filter(e.target.value))); // non-urgent: can be interrupted
}
// or:
const deferredQuery = useDeferredValue(query);
```

## 4. Reduce JS shipped & hydration cost (SPA INP killer)

Hydration runs a burst of long tasks right when users first try to interact → terrible INP.
- **Ship less client JS:** route-level code splitting, dynamic import (see bundle-analysis.md).
- **Server Components / islands / partial hydration:** Next.js RSC, Astro islands, Qwik resumability, SvelteKit. Hydrate interactive parts only.
- **Hydrate on visibility/idle** for below-the-fold widgets.
- Defer non-critical components: `const Chart = dynamic(() => import('./Chart'), { ssr: false });`

## 5. Avoid layout thrashing

Interleaving DOM reads and writes forces synchronous reflow inside your handler → high presentation delay.

```js
// BAD: read, write, read, write → forced reflow each loop
els.forEach((el) => { const w = el.offsetWidth; el.style.width = w + 10 + 'px'; });

// GOOD: batch all reads, then all writes
const widths = els.map((el) => el.offsetWidth);
els.forEach((el, i) => { el.style.width = widths[i] + 10 + 'px'; });
```

## 6. Move heavy compute to a Web Worker

Parsing, crunching, image work, etc. off the main thread entirely:

```js
const worker = new Worker(new URL('./crunch.worker.js', import.meta.url), { type: 'module' });
worker.postMessage(bigInput);
worker.onmessage = (e) => render(e.data);   // main thread stays free for input
```

## 7. Tame third-party scripts (frequent hidden cause)

Analytics, tag managers, chat widgets, ad/embed scripts run on the main thread and inflate input delay.
- Load with `async`/`defer`; load on interaction/idle, not at startup.
- Use a **facade** (e.g., load the real chat/video only on click).
- Consider a worker sandbox (Partytown) for tag managers.
- Audit them in DevTools Performance → attribute long tasks to their origin.

## Pitfalls
- **No single culprit:** INP is the worst-ish interaction across the *whole session*. You can't eyeball it — use the attribution build / DevTools Interactions track. Guessing wastes time.
- `setTimeout(…, 0)` yields to the **back** of the queue — other tasks may run first; prefer `scheduler.yield()`.
- `scheduler.yield()` isn't in Safari yet — always ship a fallback.
- Debounce input handlers, but the *visual* response should still be immediate.
- Big synchronous state updates / re-rendering huge lists on every keystroke → virtualize and defer.
- Over-using `will-change` raises memory and can hurt paint/INP.

## Docs
- INP — https://web.dev/articles/inp
- Optimize INP — https://web.dev/articles/optimize-inp
- Optimize long tasks — https://web.dev/articles/optimize-long-tasks
- scheduler.yield (MDN) — https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield
- scheduler.yield (Chrome blog) — https://developer.chrome.com/blog/use-scheduler-yield
- isInputPending — https://developer.mozilla.org/en-US/docs/Web/API/Scheduling/isInputPending
- React startTransition — https://react.dev/reference/react/startTransition
