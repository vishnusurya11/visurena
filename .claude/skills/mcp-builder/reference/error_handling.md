# MCP Server Error Handling, Retries, Auth & Timeouts

Robust error handling is what separates a demo MCP server from a production one. This reference covers the patterns an MCP server must get right: protocol vs. tool errors, rate limits, retries with backoff, timeouts, and auth/token refresh. Examples are TypeScript (`@modelcontextprotocol/sdk` 1.x) but the principles apply to FastMCP/Python identically.

## Table of contents
1. Two kinds of errors: protocol vs. tool
2. Actionable error messages
3. Timeouts
4. Retries with exponential backoff + jitter
5. Rate limits (HTTP 429 + Retry-After)
6. Auth and token refresh (401 handling)
7. Reusable resilient request helper
8. Checklist

---

## 1. Two kinds of errors: protocol vs. tool

There are two distinct failure layers, and they are reported differently:

- **Protocol errors** — malformed request, unknown tool/method, transport failure. These propagate as JSON-RPC errors (the SDK handles most automatically). Let the SDK throw these.
- **Tool/application errors** — the tool ran but the *task* failed (API 404, business rule violation, downstream timeout). Return these as a normal tool result with **`isError: true`**, so the model sees the message and can recover, retry, or ask the user.

```typescript
// Tool-level failure: report, don't throw.
return {
  content: [{ type: "text", text: "Error: project 'acme-42' not found. List projects first to get a valid ID." }],
  isError: true,
};
```

**Rule of thumb:** if the LLM could plausibly do something useful with the error (fix an arg, retry, pick a different tool), return `isError: true` with guidance. Reserve thrown exceptions for genuine protocol/programming faults.

---

## 2. Actionable error messages

The audience for an error string is an LLM agent. Tell it what went wrong AND what to do next.

| Bad | Good |
|---|---|
| `Error: 404` | `Error: Resource not found. Verify the ID with list_resources before retrying.` |
| `Error: 403` | `Error: Permission denied. This token lacks 'repo:write' scope.` |
| `Error: invalid input` | `Error: 'limit' must be 1-100, got 500. Retry with a smaller value.` |

Never leak secrets (tokens, full auth headers, internal stack traces) into error text returned to the model or client.

---

## 3. Timeouts

Every outbound network call must have a timeout — without one, a hung upstream hangs the whole tool call.

```typescript
import axios, { AxiosError } from "axios";

const REQUEST_TIMEOUT_MS = 30_000;

const response = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
// axios throws AxiosError with code "ECONNABORTED" on timeout
```

With native `fetch`, use `AbortSignal.timeout`:
```typescript
const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
```

Surface timeouts as a retryable, actionable error: `"Error: upstream request timed out after 30s. The service may be slow; retry shortly."`

---

## 4. Retries with exponential backoff + jitter

Retry only **transient** failures: 429, 5xx, timeouts, connection resets. Never retry 4xx like 400/401/403/404 — they won't fix themselves. Use exponential backoff (1s, 2s, 4s, 8s…) with a cap and **jitter** (randomization) to avoid synchronized retry storms.

```typescript
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 4, baseMs = 500, capMs = 8_000 } = {}
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      const isTimeout = (err as AxiosError).code === "ECONNABORTED";
      const retryable = isTimeout || (status !== undefined && RETRYABLE_STATUS.has(status));
      if (!retryable || attempt >= maxRetries) throw err;

      // Respect Retry-After if the server sent one (seconds or HTTP-date).
      const retryAfter = retryAfterMs((err as AxiosError).response?.headers);
      const backoff = Math.min(capMs, baseMs * 2 ** attempt);
      const jitter = Math.random() * backoff * 0.25; // full-ish jitter
      const delay = retryAfter ?? backoff + jitter;

      await new Promise((r) => setTimeout(r, delay));
      attempt++;
    }
  }
}

function retryAfterMs(headers: any): number | undefined {
  const h = headers?.["retry-after"];
  if (!h) return undefined;
  const secs = Number(h);
  if (!Number.isNaN(secs)) return secs * 1000;
  const date = Date.parse(h);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}
```

---

## 5. Rate limits (HTTP 429 + Retry-After)

429 is a retryable error with a special rule: **honor the `Retry-After` header** when present instead of your own backoff. The helper above already does this. Additional defenses for chatty servers:

- Cache idempotent GET responses for a short TTL to cut request volume.
- Paginate/limit results so a single tool call doesn't fan out into hundreds of requests.
- If you control concurrency, queue requests rather than firing them all at once.

When retries are exhausted, return an actionable `isError`: `"Error: rate limit exceeded and retries exhausted. Wait ~60s before trying again."`

---

## 6. Auth and token refresh (401 handling)

For OAuth-style services, access tokens expire. Handle 401 by refreshing **once**, then retrying the original request. Refresh failure is fatal (don't loop).

```typescript
let accessToken = process.env.SERVICE_TOKEN!;
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Collapse concurrent refreshes so N parallel 401s trigger ONE refresh.
  if (!refreshing) {
    refreshing = (async () => {
      const res = await axios.post(`${AUTH_URL}/token`, {
        grant_type: "refresh_token",
        refresh_token: process.env.SERVICE_REFRESH_TOKEN,
      });
      accessToken = res.data.access_token;
      return accessToken;
    })().finally(() => { refreshing = null; });
  }
  return refreshing;
}

async function authedRequest<T>(call: (token: string) => Promise<T>): Promise<T> {
  try {
    return await call(accessToken);
  } catch (err) {
    if ((err as AxiosError).response?.status === 401) {
      const fresh = await refreshAccessToken(); // refresh once
      return await call(fresh);                 // retry once
    }
    throw err;
  }
}
```

Notes:
- **Collapse concurrent refreshes** (the `refreshing` promise) so parallel tool calls don't each trigger a refresh and invalidate each other.
- Store tokens in env vars / a secrets manager, never in code. Never return tokens in tool output.
- For the MCP spec's own OAuth flow for *remote* servers (clients authenticating to your server), see the SDK's OAuth helpers and the Authorization section of the MCP spec — that's a separate concern from your server authenticating to an upstream API, which is what this section covers.

---

## 7. Reusable resilient request helper

Compose timeout + retry + auth into one client function your tools call:

```typescript
async function apiRequest<T>(path: string, opts: { method?: string; data?: unknown; params?: unknown } = {}): Promise<T> {
  return withRetry(() =>
    authedRequest((token) =>
      axios({
        method: opts.method ?? "GET",
        url: `${API_BASE_URL}${path}`,
        data: opts.data,
        params: opts.params,
        timeout: REQUEST_TIMEOUT_MS,
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      }).then((r) => r.data as T)
    )
  );
}
```

Then each tool stays simple and just maps caught errors to `isError` messages via a `handleApiError(err)` helper (see `node_mcp_server.md` → Error Handling).

---

## 8. Checklist

- [ ] Tool failures return `{ isError: true }` with an actionable message (not thrown)
- [ ] Every network call has a timeout
- [ ] Transient failures (429/5xx/timeout) retried with exponential backoff + jitter
- [ ] `Retry-After` header honored for 429
- [ ] Non-retryable 4xx are NOT retried
- [ ] 401 triggers a single token refresh + retry; concurrent refreshes collapsed
- [ ] No secrets or raw stack traces in returned error text
- [ ] On stdio transport, all logs go to stderr (stdout is the protocol channel)

## References
- MCP specification (Authorization, tool results, errors): https://modelcontextprotocol.io/ (fetch pages with `.md` suffix; start from https://modelcontextprotocol.io/sitemap.xml)
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk · npm: https://www.npmjs.com/package/@modelcontextprotocol/sdk
- HTTP 429 / Retry-After (MDN): https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429 and https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
