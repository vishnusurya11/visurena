---
name: realtime-live-ui
description: Build real-time and live-data frontend features for tournaments and social play — choosing SSE vs WebSockets vs polling, live scores/leaderboards, presence/online indicators, reconnect + missed-event catch-up, and optimistic UI with rollback. Includes tournament/stats data viz — single/double-elimination brackets, round-robin standings, Swiss pairings, and leaderboard/stat charts. Use when building or wiring live scores, real-time leaderboards, tournament brackets, presence/online dots, matchmaking lobbies, live match pages, activity feeds, or ANY WebSocket/SSE/polling-driven UI that must update without a refresh. Triggers — "live score", "leaderboard updates in real time", "show who's online", "reconnect", "optimistic", "bracket", "standings", "EventSource", "websocket", "stream the results". Chart styling defers to ui-ux-pro-max; animated number/score transitions defer to motion-framer; tournament screen/IA patterns live in entertainment-platform-ui.
---

# Realtime Live UI

Owns the **data-shape + live-binding + bracket structure** layer for Visurena tournaments and social play: how live data flows from server to screen, how it survives flaky networks, and how it renders into brackets, standings, and leaderboards. Chart *aesthetics* defer elsewhere (see Cross-references); this skill decides the transport, the reconnection contract, and the bracket data model.

## The one decision that matters first: transport

Most "real-time" UI is **server → client only** (scores tick up, a leaderboard reshuffles, a presence dot flips). For that, **SSE is the default and correct choice** — and reaching for WebSockets is the single most common over-engineering mistake here.

| You need… | Use | Why |
|---|---|---|
| Live scores, leaderboards, standings, feeds, notifications, match-status, presence broadcasts (server → client) | **SSE (EventSource)** | One-way over plain HTTP, **auto-reconnect built in**, `Last-Event-ID` catch-up for free, no upgrade handshake, works through proxies/CDNs. The 95% case. |
| Chat, live match input, lobby/matchmaking actions, collaborative draft, anything client → server in real time | **WebSocket** | Full-duplex. Only pay this complexity when the client genuinely pushes time-sensitive data. |
| Legacy/restricted env, very low update rate, SSE/WS blocked, MVP stub | **Polling (or long-poll) fallback** | Dead simple, but wasteful at scale and laggy. A fallback, not a destination. |

**Rule of thumb:** Start with SSE. Switch to WebSockets only when you hit a *concrete* bidirectional requirement — not "it feels more real-time." A live scoreboard does not need a duplex socket.

Do: default to SSE for live scores and leaderboards.
Don't: open a WebSocket just to *receive* updates — you're paying for a duplex pipe you only read from.

→ Full decision tree, EventSource setup, reconnect/backoff, catch-up, and optimistic UI: **`references/realtime-transport.md`**

## The non-negotiables of any live connection

Whatever transport you pick, these are not optional — skipping them is how live UIs rot in production:

1. **Reconnect with exponential backoff + jitter.** Networks die. SSE auto-reconnects but you still control `retry:` and must surface state. WS reconnection is fully manual — never leave a dead socket.
2. **Catch up on missed events.** While disconnected, the world moved. Use **sequence/event IDs**: SSE sends `Last-Event-ID` on reconnect so the server replays the gap; for WS, send your last-seen seq and request a delta. Never silently drop the gap — a leaderboard frozen 30s behind is worse than no leaderboard.
3. **Handle out-of-order + duplicate events.** Reconnects and retries cause both. Key updates by `(entityId, seq)` and ignore anything not newer than what you've applied.
4. **Heartbeat / liveness.** Server sends periodic pings (SSE comment lines or WS ping frames). If none arrive within a window, treat the connection as dead and reconnect — don't trust the socket to know.
5. **Pause on hidden tab, refresh on focus.** Use `document.visibilitychange`: drop or throttle the stream when the tab is backgrounded; on re-focus, reconnect and **re-sync from last seq** (don't trust stale state).
6. **Always show connection state to the user.** A small dot/label: Live · Reconnecting · Offline. Silent staleness destroys trust — users must know whether numbers are current.

Do: tag every meaningful event with an incrementing id so reconnect can replay.
Don't: assume "it reconnected" means "it didn't miss anything."

## Optimistic UI (when the client acts)

For user actions in live contexts (submit a score, check in, react, send a move): **apply locally immediately, mark the item `pending`, then reconcile on server ack — and roll back on conflict.**

- Apply optimistic change → render with a subtle pending affordance.
- On `ack`: clear pending, replace with server-authoritative value (it may differ — server wins).
- On `nack`/timeout/conflict: roll back to the pre-action state and surface a non-blocking error.
- The **server's broadcast is the source of truth**; optimistic state is a temporary local guess.

Do: show the action instantly and reconcile against the server's broadcast.
Don't: leave optimistic state stuck "pending" forever if the ack never comes — time it out and roll back.

→ Optimistic apply/reconcile/rollback patterns: **`references/realtime-transport.md`**

## Brackets, standings & leaderboards

Render each tournament format in its **natural shape** — forcing one layout onto all of them is the classic bracket failure (Liquipedia's dense brackets are legible *because* upper and lower stay co-viewable and the structure mirrors the format).

| Format | Shape | Data model essence |
|---|---|---|
| **Single elimination** | One tree, left → right (or top → down) | Each match → `nextMatchId` (winner advances) |
| **Double elimination** | **Upper (winners) + lower (losers) brackets, co-viewable** | Match → `nextMatchId` (winner) **and** `nextLoserMatchId` (loser drops to lower) |
| **Round robin** | No tree — a **standings table** (everyone plays everyone) | Matrix of results → computed W/L/draw, points, tiebreakers |
| **Swiss** | Rounds; pairings by record | Per-round pairings + cumulative score/Buchholz |

**Leaderboards/standings:** sortable columns, **sticky header**, **rank delta** indicators (▲/▼ vs previous), and stable row identity so live re-sorts animate instead of teleport.

Binding live updates in: apply the seq-keyed update → update the cell/match → animate the **rank/score change** (delegate the actual number tween to `motion-framer`). Keep row keys stable so React reorders rather than remounts.

Do: keep double-elim upper + lower on screen together; make large brackets pan/scroll/zoom and responsive.
Don't: cram a 64-player bracket into a fixed viewport with no scroll, and don't re-key rows on every update (kills enter/exit animation).

Libraries/patterns: **`@g-loot/react-tournament-brackets`** (`SingleEliminationBracket`, `DoubleEliminationBracket`, `Match`, `SVGViewer`) for React; **D3** for custom/Observable-style bracket layouts and stat charts.

→ Bracket data models, render approaches per format, sortable/sticky/delta leaderboards, and live-binding: **`references/brackets-leaderboards.md`**

## Visurena north-star

Charcoal-premium dark, lightly animated, dynamic + optimized AI-entertainment hub. Live elements (scores, "LIVE" badges, presence dots, progress) use the jewel accent + motion to read as *alive*, never noisy. Performance-first: stream deltas, not full payloads; skeleton then hydrate.

## Cross-references

- **Chart aesthetics + the 25-chart-type catalog** → `ui-ux-pro-max`. This skill owns chart *data shape*, not styling.
- **Animated number / score / rank transitions** → `motion-framer`.
- **Tournament screen & IA patterns** (match pages, registration, check-in, schedules) → `entertainment-platform-ui` → `references/tournaments.md`.
- **Award-winning polish** → `../modern-web-design/references/award-winning-playbook.md`.

See `references/` for build-ready code-shaped specs and the Sources list at the bottom of each file.
