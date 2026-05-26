# Realtime Transport — SSE vs WebSockets vs Polling

Build-ready guidance for moving live data from server to screen and keeping it correct across reconnects. This file owns: the transport decision, EventSource/WebSocket lifecycle, reconnection + catch-up, out-of-order handling, heartbeat, tab-visibility, and optimistic UI.

## Contents
- [Decision: which transport](#decision-which-transport)
- [SSE (the 95% case)](#sse-the-95-case)
- [Reconnect: backoff + jitter](#reconnect-backoff--jitter)
- [Catch-up: never lose events](#catch-up-never-lose-events)
- [Out-of-order + duplicate events](#out-of-order--duplicate-events)
- [Heartbeat / liveness](#heartbeat--liveness)
- [Tab visibility: pause + refresh](#tab-visibility-pause--refresh)
- [Connection-state UI](#connection-state-ui)
- [WebSockets (bidirectional only)](#websockets-bidirectional-only)
- [Polling (fallback)](#polling-fallback)
- [Optimistic UI: apply → reconcile → rollback](#optimistic-ui-apply--reconcile--rollback)
- [Sources](#sources)

---

## Decision: which transport

```
Does the CLIENT need to push time-sensitive data to the server in real time?
│
├─ NO  → SSE.  (live scores, leaderboards, standings, feeds, notifications,
│               match status, presence broadcasts) ← 95% of Visurena live UI
│
└─ YES → Is it genuinely interactive/duplex (chat, live match input, lobby
         actions, collaborative draft, matchmaking handshake)?
         │
         ├─ YES → WebSocket
         └─ NO/edge (restricted env, SSE blocked, very low rate, MVP) → Polling
```

**Why SSE wins for read-only live UI:** runs over plain HTTP/1.1+ (no upgrade handshake to debug), the browser **auto-reconnects**, ships **`Last-Event-ID`** for gap-replay for free, passes through most proxies/CDNs, and degrades to standard HTTP routing. WebSockets give you nothing extra for one-way data — only more code (manual reconnect, manual catch-up, heartbeat frames, sticky-session/proxy headaches).

> Default to SSE. Promote to WebSocket only on a concrete bidirectional need.

Caveat to know: SSE over HTTP/1.1 shares the ~6-connections-per-host limit; multiplex live channels into **one** stream, or serve over HTTP/2+ where it's a non-issue.

---

## SSE (the 95% case)

### Server event format
Each event is text. Tag meaningful events with `id:` (your sequence number) so reconnect can replay. `retry:` sets the client's reconnect delay floor.

```
id: 1042
event: score
data: {"matchId":"m-7","home":3,"away":2,"seq":1042}

id: 1043
event: leaderboard
data: {"seq":1043,"rows":[{"id":"p1","rank":1,"score":980,"delta":1}]}

retry: 3000

: heartbeat        ← comment line; keeps the connection warm, no event fired
```

### Client (vanilla EventSource)
```js
const es = new EventSource("/api/tournaments/123/stream"); // browser auto-sends Last-Event-ID on reconnect

es.addEventListener("score", (e) => applyUpdate(JSON.parse(e.data)));
es.addEventListener("leaderboard", (e) => applyUpdate(JSON.parse(e.data)));

es.onopen  = () => setConnState("live");
es.onerror = () => setConnState("reconnecting"); // EventSource retries on its own; just reflect state
```

`EventSource` reconnects automatically and resends the last `id:` it saw as the `Last-Event-ID` request header. **You get reconnect + catch-up for free** — but only if the server actually honors `Last-Event-ID` (see below).

### Custom headers / auth
`EventSource` can't set headers (e.g. `Authorization`). Options: cookie-based auth, a short-lived token in the query string, or use the `@microsoft/fetch-event-source` library (fetch-based SSE) when you need headers, POST bodies, or finer reconnect control.

```js
import { fetchEventSource } from "@microsoft/fetch-event-source";
fetchEventSource("/api/.../stream", {
  headers: { Authorization: `Bearer ${token}` },
  onmessage: (ev) => applyUpdate(JSON.parse(ev.data)),
  onopen:    async () => setConnState("live"),
  onerror:   (err) => { setConnState("reconnecting"); /* throw to stop, return to retry */ },
});
```

Do: rely on native `EventSource` auto-reconnect for the simple case.
Don't: hand-roll a reconnect loop on top of `EventSource` — you'll fight its built-in one.

---

## Reconnect: backoff + jitter

SSE auto-reconnects, but **you still control the cadence** (`retry:` from server, or your own loop for WS/fetch-based SSE). Always **exponential backoff with jitter** so a server blip doesn't trigger a synchronized thundering-herd reconnect.

```js
function nextDelay(attempt, base = 1000, cap = 30000) {
  const exp = Math.min(cap, base * 2 ** attempt);
  return Math.random() * exp;          // full jitter
}
// attempt 0→~0-1s, 1→~0-2s, 2→~0-4s … capped at 30s. Reset attempt to 0 on a clean open.
```

Do: cap the delay (~30s) and reset the counter on a successful open.
Don't: reconnect in a tight loop on error — you'll DDoS your own server and drain mobile batteries.

---

## Catch-up: never lose events

The hard rule of live UI: **a reconnect must not silently skip the events that happened while you were gone.**

**Mechanism — sequence IDs:**
1. Server stamps every event with a monotonic `id:` / `seq`.
2. Client persists the last applied seq.
3. On reconnect, the client tells the server its last seq (SSE: automatic via `Last-Event-ID` header; WS: send it in a `resume` message).
4. **Server replays** everything after that seq from a short buffer/log, then resumes live.
5. If the gap is larger than the buffer (long disconnect), server responds "too far behind" → **client does a full snapshot refetch**, then resumes streaming.

```js
// Server-side SSE catch-up (sketch)
const since = Number(req.headers["last-event-id"] ?? 0);
const missed = eventLog.filter(e => e.id > since);          // bounded ring buffer
if (since && missed.length === eventLog.length && eventLog.length) {
  send({ event: "resync", data: { reason: "buffer-exceeded" } });  // → client refetches snapshot
} else {
  for (const e of missed) send(e);
}
// then continue with live events…
```

Do: keep a bounded server-side event buffer keyed by seq; replay the delta on reconnect.
Don't: just resume the live stream and pretend the gap didn't happen — that's how a score shows 2-1 when it's really 4-1.

---

## Out-of-order + duplicate events

Reconnects, replays, and retries deliver events **out of order and more than once**. Make every apply **idempotent and seq-guarded**.

```js
const lastSeqByEntity = new Map();         // entityId → highest seq applied

function applyUpdate(u) {
  const prev = lastSeqByEntity.get(u.id) ?? -Infinity;
  if (u.seq <= prev) return;               // stale or duplicate → drop
  lastSeqByEntity.set(u.id, u.seq);
  commit(u);                               // safe to apply
}
```

Do: key freshness per entity (`matchId`, `playerId`), not globally — different matches advance independently.
Don't: blindly `setState` on every message; an out-of-order replay will visibly rewind a score.

---

## Heartbeat / liveness

A TCP socket can be silently dead (NAT timeout, sleeping laptop, dropped mobile) while the client thinks it's connected. Detect it.

- **SSE:** server sends a comment line (`: ping\n\n`) every ~15-30s. Client tracks "last message time"; if it exceeds ~2× the heartbeat interval, force-close and let reconnect kick in.
- **WS:** use ping/pong frames (or app-level `{type:"ping"}`); if no pong within the window, `socket.close()` and reconnect.

```js
let lastBeat = Date.now();
// bump lastBeat on EVERY inbound message (data or heartbeat)
setInterval(() => {
  if (Date.now() - lastBeat > 45000) { es.close(); reconnect(); }
}, 15000);
```

Do: treat "no traffic" as "dead" and reconnect proactively.
Don't: trust `readyState` alone — it lies about half-open connections.

---

## Tab visibility: pause + refresh

Backgrounded tabs waste a connection and a CPU; stale tabs show stale scores. Use the Page Visibility API.

```js
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    es.close();                 // or throttle to a low-rate poll
  } else {
    reconnect();                // reopen; Last-Event-ID / resume re-syncs the gap
  }
});
```

Do: on re-focus, reconnect and **re-sync from last seq** (catch-up handles the gap).
Don't: keep a full-rate stream alive in a hidden tab, and don't show whatever number was frozen on screen as if it's current.

---

## Connection-state UI

Surface a small, honest indicator. Silent staleness is the worst outcome — users must know if numbers are live.

| State | Meaning | Treatment |
|---|---|---|
| `live` | Stream open, fresh | Pulsing jewel dot · "LIVE" |
| `reconnecting` | Dropped, retrying | Amber dot · "Reconnecting…" · keep last values dimmed |
| `offline` | Backoff exhausted / offline | Gray dot · "Offline" · "Tap to retry" |
| `resyncing` | Refetching snapshot after long gap | Brief skeleton/spinner on affected widgets |

Do: dim or badge stale data while reconnecting so users don't read old scores as current.
Don't: hide the connection state — and don't blank the whole UI on a transient blip.

---

## WebSockets (bidirectional only)

Use only when the **client pushes** time-sensitive data (chat, live match input, lobby/matchmaking actions, collaborative draft). You now **own** everything SSE gave you free:

```js
function connect(lastSeq) {
  const ws = new WebSocket(url);
  ws.onopen    = () => { ws.send(JSON.stringify({ type: "resume", lastSeq })); setConnState("live"); };
  ws.onmessage = (e) => { const m = JSON.parse(e.data); lastBeat = Date.now();
                          if (m.type !== "pong") applyUpdate(m); };
  ws.onclose   = () => { setConnState("reconnecting");
                         setTimeout(() => connect(lastAppliedSeq), nextDelay(attempt++)); };
  // + heartbeat ping loop, + visibility handling (same patterns as SSE)
}
```

Mandatory for WS: manual reconnect+backoff, `resume`/seq catch-up, app-level heartbeat, idempotent seq-guarded apply, sticky sessions or a shared pub/sub (Redis) behind a load balancer.

Do: send last-seen seq on (re)open and have the server replay the delta.
Don't: pick WS "to be safe" for read-only data — you've signed up for all of the above with zero benefit.

---

## Polling (fallback)

Simple, universal, wasteful. Acceptable as a fallback or for very low update rates.

- Prefer **conditional requests** (`ETag`/`If-None-Match` → `304`) or a `?since=<seq>` delta endpoint to avoid re-sending unchanged data.
- Back off when the tab is hidden; speed up around live moments only if needed.
- Long-polling (hold the request open until data or timeout) is a middle ground — fewer empty round-trips, but ties up a connection.

Do: poll deltas with `?since=<seq>`, not full snapshots every tick.
Don't: poll a heavy endpoint every second for every viewer — that's the cost SSE exists to eliminate.

---

## Optimistic UI: apply → reconcile → rollback

When the user acts in a live context (submit score, check in, react, make a move), update **immediately**, mark it pending, and reconcile against the server's authoritative broadcast.

```js
function optimistic(action) {
  const snapshot = getState(action.target);     // for rollback
  commit({ ...action.optimisticResult, pending: true });

  const timer = setTimeout(() => rollback(snapshot, "timeout"), 8000);

  send(action)
    .then(serverResult => {                       // ack
      clearTimeout(timer);
      commit({ ...serverResult, pending: false }); // SERVER WINS — may differ from guess
    })
    .catch(() => { clearTimeout(timer); rollback(snapshot, "conflict"); });
}
```

Reconciliation rules:
- **Ack:** clear `pending`, replace with server value (authoritative — it can differ; honor it).
- **Nack / conflict / timeout:** roll back to the pre-action snapshot, show a non-blocking error.
- The **server broadcast** (the same SSE/WS event everyone else receives) is the source of truth; optimistic state is a temporary local guess. When the broadcast for your action arrives, it supersedes the optimistic copy.

Do: time out pending actions and roll back if no ack arrives.
Don't: trust the optimistic value over a later server broadcast, and don't leave items stuck "pending" forever.

---

## Sources

- [SSE beat WebSockets for 95% of real-time apps — dev.to/polliog](https://dev.to/polliog/server-sent-events-beat-websockets-for-95-of-real-time-apps)
- [Real-time web apps — debutinfotech.com](https://debutinfotech.com/blog/real-time-web-apps)
- [Using server-sent events — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [EventSource — MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [WebSockets vs SSE — Ably](https://ably.com/blog/websockets-vs-sse)
- [@microsoft/fetch-event-source](https://github.com/Azure/fetch-event-source)
- [Page Visibility API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
