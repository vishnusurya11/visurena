// apps/web/lib/requests.ts
//
// The request board ("On the slate"): what people have asked the studio to make next.
// Server-only reader (fs) for <repo>/content-local/requests.json + pure helpers that the
// tests exercise directly. Voting is local-only until the API exists (Phase 2).

import fs from "node:fs";
import path from "node:path";

export type RequestState = "in-production" | "voting";
export type RequestFormat = "Episodes" | "Feature" | "Shorts" | "Games" | "Stories" | string;

export interface RequestItem {
  id: string;
  title: string;
  author?: string;
  year?: string;
  format: RequestFormat;
  votes: number;
  state: RequestState;
  producedSlug?: string;   // in-production → the /movies/[series] slug
}

export interface RequestsFile {
  season: string;
  totalVotes: number;
  openRequests: number;
  items: RequestItem[];
}

export interface RequestsSummary {
  season: string;
  totalVotes: number;
  openRequests: number;
  count: number;           // items on the board
  inProduction: number;
  /** "2,850 votes this season" */
  votesLine: string;
}

function requestsFile(): string {
  if (process.env.VR_REQUESTS_JSON) return process.env.VR_REQUESTS_JSON;
  // cwd during next build / dev / vitest is apps/web
  return path.resolve(process.cwd(), "..", "..", "content-local", "requests.json");
}

const EMPTY: RequestsFile = { season: "", totalVotes: 0, openRequests: 0, items: [] };

let cache: RequestsFile | null = null;

export function loadRequests(file = requestsFile()): RequestsFile {
  if (cache && file === requestsFile()) return cache;
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return EMPTY;
  }
  const parsed = normalizeRequests(JSON.parse(raw));
  if (file === requestsFile()) cache = parsed;
  return parsed;
}

/** Coerce whatever is on disk into a well-formed RequestsFile (pure). */
export function normalizeRequests(input: unknown): RequestsFile {
  const o = (input && typeof input === "object" ? input : {}) as Partial<RequestsFile>;
  const items = Array.isArray(o.items) ? o.items : [];
  const clean: RequestItem[] = items
    .filter((it): it is RequestItem => !!it && typeof it === "object" && typeof (it as RequestItem).title === "string")
    .map((it) => ({
      id: typeof it.id === "string" && it.id ? it.id : `req_${slugify(it.title)}`,
      title: it.title,
      author: it.author || undefined,
      year: it.year ? String(it.year) : undefined,
      format: typeof it.format === "string" && it.format ? it.format : "Request",
      votes: Number.isFinite(Number(it.votes)) ? Math.max(0, Math.floor(Number(it.votes))) : 0,
      state: it.state === "in-production" ? "in-production" : "voting",
      producedSlug: it.producedSlug || undefined,
    }));
  return {
    season: typeof o.season === "string" ? o.season : "",
    totalVotes: Number.isFinite(Number(o.totalVotes)) ? Number(o.totalVotes) : clean.reduce((n, it) => n + it.votes, 0),
    openRequests: Number.isFinite(Number(o.openRequests)) ? Number(o.openRequests) : clean.length,
    items: clean,
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Every request as written in the file (original order). */
export function getRequests(): RequestItem[] {
  return loadRequests().items;
}

/** Board order (pure): in-production first, then by votes desc, then title. */
export function sortSlate(items: RequestItem[]): RequestItem[] {
  const rank = (it: RequestItem) => (it.state === "in-production" ? 0 : 1);
  return [...items].sort((a, b) => rank(a) - rank(b) || b.votes - a.votes || a.title.localeCompare(b.title));
}

/** The slate: in-production first, then by votes. Optional `limit`. */
export function getSlate(limit?: number): RequestItem[] {
  const sorted = sortSlate(getRequests());
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/** Requests whose format is one of `formats` (case-insensitive), in slate order. */
export function getSlateByFormat(formats: string[], limit?: number): RequestItem[] {
  const want = new Set(formats.map((f) => f.toLowerCase()));
  const out = getSlate().filter((it) => want.has(String(it.format).toLowerCase()));
  return typeof limit === "number" ? out.slice(0, limit) : out;
}

/** Totals for headers and the nav count (pure over a RequestsFile). */
export function summarizeRequests(file: RequestsFile): RequestsSummary {
  const inProduction = file.items.filter((it) => it.state === "in-production").length;
  return {
    season: file.season,
    totalVotes: file.totalVotes,
    openRequests: file.openRequests,
    count: file.items.length,
    inProduction,
    votesLine: `${file.totalVotes.toLocaleString("en-US")} votes this season`,
  };
}

export function requestsSummary(): RequestsSummary {
  return summarizeRequests(loadRequests());
}
