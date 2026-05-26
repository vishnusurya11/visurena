# Brackets, Standings & Leaderboards

Build-ready data models and rendering for the four tournament formats, plus sortable/sticky/delta leaderboards and how to bind live updates into them. This file owns **bracket structure + standings data shape + live-binding**. Chart *aesthetics* and the chart-type catalog → `ui-ux-pro-max`; number/rank tweening → `motion-framer`.

## Contents
- [Core principle: render the format's natural shape](#core-principle-render-the-formats-natural-shape)
- [Single elimination](#single-elimination)
- [Double elimination (upper + lower)](#double-elimination-upper--lower)
- [Round robin (standings table)](#round-robin-standings-table)
- [Swiss](#swiss)
- [Rendering brackets at scale](#rendering-brackets-at-scale)
- [Leaderboards & standings tables](#leaderboards--standings-tables)
- [Stat charts](#stat-charts)
- [Binding live updates into brackets & leaderboards](#binding-live-updates-into-brackets--leaderboards)
- [Libraries & references](#libraries--references)
- [Sources](#sources)

---

## Core principle: render the format's natural shape

Each format has a *shape that matches how it actually works*. Forcing all of them into one layout is the canonical bracket failure. Liquipedia's famously dense brackets stay legible precisely because the structure mirrors the format and **upper + lower brackets are co-viewable**.

| Format | Natural shape | One-loss-out? |
|---|---|---|
| Single elimination | One tree → final | Yes |
| Double elimination | Upper tree + lower tree, side-by-side/stacked | No (second chance via lower) |
| Round robin | A **table**, not a tree (everyone plays everyone) | No |
| Swiss | Round-by-round pairings + running standings | No |

Do: pick the renderer that fits the format.
Don't: shoehorn round-robin (which has no tree) into a bracket tree — it produces nonsense.

---

## Single elimination

One tree; the winner of each match advances along `nextMatchId`.

```ts
type MatchState = "SCHEDULED" | "RUNNING" | "DONE" | "WALK_OVER";

interface Match {
  id: string;
  name?: string;              // "Quarterfinal 1"
  round: number;              // 1 = first round, grows toward the final
  nextMatchId: string | null; // where the WINNER goes; null = grand final
  state: MatchState;
  startTime?: string;
  participants: Participant[];  // 0–2 filled; empty slots = TBD / bye
}

interface Participant {
  id: string;
  name: string;
  seed?: number;
  score?: number;            // live-updatable
  isWinner?: boolean;
  status?: "PLAYED" | "NO_SHOW" | "WALK_OVER" | null;
  resultText?: string;       // "3-1", "W", "BYE"
}
```

Notes:
- A **bye** = a match with one participant whose `nextMatchId` auto-advances them; render it muted, not as a fake game.
- `round` drives column placement; vertical position is computed so each match sits midway between its two feeders.
- Seeding determines round-1 pairings (1 vs N, 2 vs N-1, …) and bracket position.

---

## Double elimination (upper + lower)

Two linked trees: losers in the **upper (winners)** bracket drop into the **lower (losers)** bracket and can still reach the grand final. The key extra field is **`nextLoserMatchId`**.

```ts
interface DoubleElimMatch extends Match {
  bracket: "UPPER" | "LOWER";
  nextMatchId: string | null;       // winner advances (within its bracket / to grand final)
  nextLoserMatchId: string | null;  // loser DROPS to this lower-bracket match (upper only)
}
// Grand final may be a single match or "bracket reset" (two matches) if the lower seed wins game 1.
```

Layout: render **upper and lower co-viewable** — side-by-side columns or upper-on-top / lower-below, with the grand final bridging them. Never hide the lower bracket behind a tab; the whole point of double-elim is seeing the second-chance path.

`@g-loot/react-tournament-brackets` models this directly: keep the same match structure and set `nextMatchId` + `nextLooserMatchId` (their spelling) per match; the `DoubleEliminationBracket` component lays out both halves.

```jsx
import { DoubleEliminationBracket, Match, SVGViewer } from "@g-loot/react-tournament-brackets";

<DoubleEliminationBracket
  matches={{ upper, lower }}
  matchComponent={Match}
  svgWrapper={({ children, ...props }) => (
    <SVGViewer width={1200} height={800} {...props}>{children}</SVGViewer>
  )}
/>
```

Do: keep upper + lower on screen together; label which bracket each match belongs to.
Don't: tab away the lower bracket or drop the `nextLoserMatchId` link (losers vanish into the void).

---

## Round robin (standings table)

No tree. Everyone plays everyone; the artifact is a **computed standings table** (optionally a results grid/matrix).

```ts
interface RoundRobinResult { homeId: string; awayId: string; homeScore: number; awayScore: number; }

interface StandingRow {
  id: string; name: string;
  played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; diff: number;
  points: number;            // e.g. win=3, draw=1
  rank: number;
  rankDelta: number;         // vs previous snapshot: + up, - down, 0 same
}
```

Compute standings from results, then sort by points → tiebreakers (head-to-head, diff, GF). A **results matrix** (rows = teams, cols = opponents) is a nice secondary view. Standings are the headline.

Do: make tiebreaker order explicit and deterministic.
Don't: render round-robin as a bracket tree.

---

## Swiss

Fixed number of rounds; each round pairs players with **similar records** (no elimination). Need per-round pairings plus cumulative score and a strength-of-schedule tiebreaker (Buchholz).

```ts
interface SwissRound {
  round: number;
  pairings: { p1: string; p2: string | "BYE"; result?: "P1" | "P2" | "DRAW" }[];
}
interface SwissStanding extends StandingRow { buchholz: number; }  // sum of opponents' scores
```

Render: a **standings table** as the primary view + an expandable per-round pairing list. Same shape as round-robin standings, plus Buchholz.

---

## Rendering brackets at scale

A 64-player bracket will not fit a viewport. Plan for size from the start.

- **Pan / zoom / scroll:** wrap in a pan-zoom surface (g-loot ships `SVGViewer`; for D3 use `d3-zoom`). Provide fit-to-screen + zoom controls.
- **Responsive:** on mobile, allow horizontal scroll and/or a round-by-round focused view; never squash matches into illegibility.
- **Minimap / round jumper** for deep brackets so users can navigate to the round they care about.
- **Stable layout math:** column = `round`; a match's vertical center = midpoint of its two feeder matches. Keep this deterministic so live updates don't reflow the tree.
- **Highlight a participant's path** through the bracket on hover/select — huge for legibility in dense brackets (a Liquipedia strength).

Do: make brackets pan/scroll/zoom and offer fit-to-screen.
Don't: render a large bracket into a fixed box with hidden overflow.

---

## Leaderboards & standings tables

The live-data workhorse. Requirements:

- **Sortable columns** — click to sort; show the active sort + direction.
- **Sticky header** (and often sticky rank/name column) so context survives scrolling long boards.
- **Rank delta** — ▲ / ▼ / – vs the previous snapshot, ideally with the magnitude (`▲2`).
- **Stable row identity** — key rows by participant `id`, NOT array index, so a live re-sort **animates** (rows slide to new positions) instead of teleporting/remounting.
- **Highlight the current user's row** and keep it findable (e.g. a pinned "your rank" strip when off-screen).
- **Skeleton then hydrate**; show stale/dimmed values while reconnecting (see transport file).

```tsx
// Stable keys are what make re-sorts animate. Tween via motion-framer.
{rows.map(r => (
  <LeaderboardRow key={r.id} row={r}>{/* rank, name, score, delta */}</LeaderboardRow>
))}
```

Do: key by id and let the list reorder; animate the move.
Don't: re-key on sort/update (React remounts every row → no enter/exit/move animation, visual flicker).

---

## Stat charts

This skill owns the **data shape** going into charts; styling and the 25-chart-type catalog live in `ui-ux-pro-max`.

- Score-over-time / momentum → line/area series `{ t, value }[]` per participant.
- Win-rate / category breakdown → bar/stacked-bar `{ label, value }[]`.
- Head-to-head / form → small multiples or sparklines per row.
- Provide tidy, chart-agnostic data (arrays of `{x,y}` or labeled values); let the chart layer pick the visual.

Do: hand the chart layer clean tidy data; defer color/axes/legend styling to `ui-ux-pro-max`.
Don't: bake chart visual styling into this layer.

---

## Binding live updates into brackets & leaderboards

Connect the transport layer (`realtime-transport.md`) to these structures:

1. Receive a seq-keyed update (`{ matchId|playerId, seq, ... }`) and pass it through the **idempotent, seq-guarded apply** (drop stale/duplicate — see transport file).
2. **Brackets:** locate the match by id, update participant `score`/`state`/`isWinner`; when `state` flips to `DONE`, advance the winner along `nextMatchId` (and drop the loser via `nextLoserMatchId` in double-elim). Keep layout positions fixed so the tree doesn't reflow.
3. **Leaderboards:** update the changed rows, recompute `rank` + `rankDelta` vs the previous snapshot, re-sort. Because rows are keyed by id, the list reorders smoothly.
4. **Animate the change** — number tween on score, slide on rank move, a brief flash/pulse on the updated cell. Delegate the actual number/position animation to **`motion-framer`**; this layer just decides *what changed*.
5. **Live affordances:** a `RUNNING` match gets a "LIVE" badge + pulse; recently-changed rows get a transient highlight.

Do: animate rank/score changes from the *previous* state so the motion is meaningful.
Don't: blow away and rebuild the whole table/tree on each event (kills animation + perf, and risks applying stale data).

---

## Libraries & references

- **`@g-loot/react-tournament-brackets`** — React: `SingleEliminationBracket`, `DoubleEliminationBracket`, `Match`, `MATCH_STATES`, `SVGViewer`. Simple data structures, custom `matchComponent` for full visual control, double-finals via `nextLooserMatchId`.
- **D3** — for custom bracket layouts (Observable's single-elimination examples), pan/zoom (`d3-zoom`), and stat charts when you need full control.
- **Liquipedia** — study for dense-but-legible brackets: co-viewable upper/lower, clear round labeling, path highlighting. Learn from its strengths and its density pitfalls.

---

## Sources

- [g-loot/react-tournament-brackets — GitHub](https://github.com/g-loot/react-tournament-brackets)
- [@g-loot/react-tournament-brackets — npm](https://www.npmjs.com/package/@g-loot/react-tournament-brackets)
- [Single-elimination bracket (D3) — Observable](https://observablehq.com/@d3/single-elimination-bracket)
- [d3-zoom — GitHub](https://github.com/d3/d3-zoom)
- [Real-time web apps — debutinfotech.com](https://debutinfotech.com/blog/real-time-web-apps)
