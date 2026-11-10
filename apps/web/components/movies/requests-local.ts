// components/movies/requests-local.ts
//
// Server-only reader for <repo>/content-local/requests.json, used inside the Movies
// pages' getStaticProps. Lane 2 owns lib/requests.ts (the general board module); this
// is the Movies room's tiny local read so the two lanes do not collide.

import fs from "node:fs";
import path from "node:path";
import type { RequestsFile } from "./helpers";

const EMPTY: RequestsFile = { season: "", totalVotes: 0, openRequests: 0, items: [] };

function requestsFile(): string {
  if (process.env.VR_REQUESTS_JSON) return process.env.VR_REQUESTS_JSON;
  // cwd during next build / dev / vitest is apps/web
  return path.resolve(process.cwd(), "..", "..", "content-local", "requests.json");
}

export function readRequestsLocal(file = requestsFile()): RequestsFile {
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return EMPTY;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<RequestsFile>;
    return {
      season: parsed.season ?? "",
      totalVotes: parsed.totalVotes ?? 0,
      openRequests: parsed.openRequests ?? 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return EMPTY;
  }
}
