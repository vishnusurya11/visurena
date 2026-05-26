# Search & Discovery UX

Build-ready patterns for finding and discovering content on Visurena catalog
screens. Behavior + states live here; **visual styling defers** to
`ui-ux-pro-max`/`frontend-design` (look), `motion-framer`/`gsap-scrolltrigger`
(rail animation), `ui-styling` (skeletons/inputs). Engines named below are
**examples, not requirements** — the patterns are vendor-neutral.

## Contents

1. [Instant / typeahead search](#1-instant--typeahead-search)
2. [Faceted filters](#2-faceted-filters)
3. [Recommendation rails](#3-recommendation-rails)
4. [Empty, loading, zero-result, error states](#4-states)
5. [Keyboard navigation & a11y](#5-keyboard-navigation--a11y)
6. [Search engines (vendor-neutral)](#6-search-engines)

---

## 1. Instant / typeahead search

**Why:** Users expect results as they type. But naive "request per keystroke"
floods the network, wastes the main thread (INP), and lets **stale responses
overwrite fresh ones**. The fix is debounce + abort + ordered state.

**Pattern: debounce input, abort in-flight request, track async state.**

```tsx
function useTypeahead(fetchResults: (q: string, signal: AbortSignal) => Promise<Result[]>) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'idle'|'loading'|'success'|'empty'|'error'>('idle');
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setState('idle'); setResults([]); return; }

    const ctrl = new AbortController();
    const t = setTimeout(async () => {          // debounce ~200-300ms
      setState('loading');
      try {
        const r = await fetchResults(q, ctrl.signal);
        setResults(r);
        setState(r.length ? 'success' : 'empty');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setState('error');
      }
    }, 250);

    return () => { clearTimeout(t); ctrl.abort(); };  // cancel pending + in-flight
  }, [query, fetchResults]);

  return { query, setQuery, state, results };
}
```

- DO debounce ~200-300ms — long enough to skip mid-word keystrokes, short enough
  to feel instant.
- DO `AbortController.abort()` the previous request on each new keystroke so a slow
  earlier response can't clobber a newer one (race condition).
- DO show a tiny inline spinner in the field on `loading`, not a full-screen
  blocker — search should never feel like a page load.
- DO keep the last good results visible while the next query loads (avoid flicker
  to empty), then swap.
- DON'T search on every keystroke with no debounce/abort. DON'T block typing while
  a request is in flight. DON'T clear results to empty between queries (flicker).

**Suggestions / scopes**
- Show recent searches and popular/trending queries when the field is focused but
  empty (turns a blank box into discovery).
- Offer scope chips (All · Movies · Music · Games · Stories) so users narrow the
  vertical — Visurena is multi-vertical; a global search must disambiguate.

---

## 2. Faceted filters

Facets let users refine a large result set by attributes (genre, year, rating,
type, platform, duration).

- DO show **active-filter chips** in a row above results, each with an "×" to
  remove, plus a single **"Clear all."** Users must always see and undo what's
  applied.
- DO show **result counts** per facet value (e.g. "Action (128)") and live-update
  the total ("342 results") as filters change — confirms the action did something.
- DO reflect filter state in the **URL** (`?genre=action&year=2020-2026`) so a
  filtered view is shareable, back-button-safe, and crawlable.
- DO debounce/batch rapid facet toggles before refetching, same as typeahead.
- DON'T hide active filters in a collapsed drawer with no summary — users lose
  track and think results are broken.
- DON'T let a filter combo silently produce zero results with no path back — route
  to the zero-result state (below) with a "relax filters" suggestion.
- DON'T reset unrelated filters when one changes (unless they're genuinely
  incompatible — then say so).

```tsx
// Active-filter chips
{activeFilters.map(f => (
  <Chip key={f.key} onRemove={() => remove(f.key)}>{f.label}: {f.value} ×</Chip>
))}
{activeFilters.length > 0 && <button onClick={clearAll}>Clear all</button>}
<span className="result-count">{total} results</span>
```

---

## 3. Recommendation rails

Horizontally-scrollable sections that drive discovery: "Trending now,"
"Because you watched Inception," "New releases," "Top in Music this week,"
"Continue watching."

- DO make each rail a horizontally scrollable section with a clear title and an
  optional "See all" → full grid (which reuses the catalog-performance patterns).
- DO label **why** an item is recommended ("Because you watched …") — explainable
  recs build trust and engagement.
- DO mix evergreen rails (Trending, New) with personalized rails (Because you…,
  For you) so the page works for both cold-start and known users.
- DO lazy-load rails below the fold and their images (see catalog-performance §4).
- DO reserve rail height before data loads (CLS, see catalog-performance §6).
- DON'T virtualize a short fixed rail (10-15 cards) — unnecessary; use native
  horizontal scroll with `scroll-snap`. Virtualize only "See all" full grids.
- DON'T block the page on a slow recs API — render the rest, fill the rail when
  it resolves (skeleton meanwhile).

**Card visuals and rail reveal/scroll animation are NOT this skill's job:**
look → `ui-ux-pro-max`/`frontend-design`; motion → `gsap-scrolltrigger`/
`motion-framer`. This skill owns the rail's data/loading/scroll behavior only.

---

## 4. States

Every search/discovery surface must explicitly design all of these. A missing
state reads as "broken" and kills the premium feel.

| State | When | Do |
|-------|------|----|
| **Idle / empty field** | Search focused, no query | Show recent + trending searches, scope chips — make the void useful. |
| **Loading** | Request in flight | Inline spinner in field; skeleton result rows; keep last results visible. |
| **Success** | Results returned | Show results + count; preserve scroll on pagination. |
| **Zero-result** | Valid query, no matches | Acknowledge clearly + **offer a way forward** (see below). |
| **Error** | Request failed/timed out | Friendly message + **Retry** button; don't show a raw error or blank grid. |

**Zero-result done right** (the highest-leverage state):
- Confirm what was searched ("No results for 'inceptoin'").
- Suggest a correction / "Did you mean …?" if the engine supports it.
- Offer to **relax filters** ("Clear genre filter to see 128 more").
- Fall back to discovery — show Trending / popular rails so the screen is never
  a dead end.

- DON'T render an empty grid with no message. DON'T show a spinner that never
  resolves (always timeout → error). DON'T dump a stack trace or HTTP code at users.

---

## 5. Keyboard navigation & a11y

- DO make the typeahead an ARIA combobox: ↑/↓ move the active suggestion, Enter
  selects, Esc clears/closes, focus stays in the input. Use
  `role="combobox"` + `aria-expanded` + `aria-activedescendant`.
- DO make facet controls real, labeled, focusable inputs (checkbox/radio), not
  click-only `<div>`s.
- DO make rails keyboard-scrollable and each card a focusable link/button with a
  visible focus ring.
- DO announce result counts to screen readers via an `aria-live="polite"` region
  ("342 results") so non-visual users get the same feedback.
- DON'T trap focus, and DON'T make Enter inside the search field submit-and-reload
  if you're doing instant results (it should navigate to full results, not bounce).

---

## 6. Search engines

Pattern-first: the UX above is engine-agnostic. When you need a real search
backend for typeahead/facets/relevance, these are common choices (pick per
infra/budget — **not** required by this skill):

- **Algolia InstantSearch** — hosted, fast, batteries-included React widgets for
  typeahead + facets; quickest path to a polished search UI.
- **Meilisearch** — open-source, self-hostable, typo-tolerant, great DX for
  instant search.
- **Typesense** — open-source, typo-tolerant, low-latency; another strong
  self-host option.

Whichever engine: the front-end still owns debounce, abort, the state machine,
filter chips, URL sync, and the empty/error states described above.

## Sources

- https://www.algolia.com/doc/ (InstantSearch)
- https://www.meilisearch.com/
- https://web.dev/articles/vitals
- https://strapi.io/blog/frontend-performance-checklist
