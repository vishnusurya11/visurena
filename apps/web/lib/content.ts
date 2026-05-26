// apps/web/lib/content.ts
//
// Build-time content provider for Stories. Server-only — used exclusively inside
// getStaticProps / getStaticPaths, never in client code.
//
// Source today = the local generation drop folder (see ARCHITECTURE.md §6.5–6.9).
// Switchable to S3 in prod via VR_CONTENT_SOURCE (the S3 reader is the only net-new
// piece; pages stay source-agnostic because they only see normalized objects).
//
//   VR_CONTENT_SOURCE    = local | s3      (default: local)
//   VR_CONTENT_LOCAL_DIR = absolute path to the drop root
//                          (default: <repo>/../website_data — sibling of the repo)

import fs from "node:fs";
import path from "node:path";
import { selectLive, type ContentItem } from "@visurena/core";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface StoryScene {
  title?: string;
  prose: string;
}

/** Listing shape (no body) — what cards/landing need. */
export interface Story extends ContentItem {
  kind: "short" | "novel" | "series";
  readMinutes?: number;
  wordCount?: number;
  cover34?: string;   // public URL (3:4)
  cover169?: string;  // public URL (16:9)
}

/** Full shape (with body) — what the reader needs. */
export interface StoryFull extends Story {
  scenes: StoryScene[];
}

// ─── Config ──────────────────────────────────────────────────────────────────
const AMBER = "#f5b831";
const GENRE_TINT: Record<string, string> = {
  Horror: "#7c8fa8",
  Mystery: "#6e8b86",
  Thriller: "#a45d3f",
  Fantasy: "#7a5a99",
  "Sci-Fi": "#5d7ea0",
  Romance: "#a64a52",
};

function contentRoot(): string {
  // s3 mode: `pnpm content:pull` (scripts/pull-content.mjs) syncs the bucket into
  // .content-cache first; we then read it with the same local walker below.
  if (process.env.VR_CONTENT_SOURCE === "s3") {
    return process.env.VR_CONTENT_LOCAL_DIR || path.resolve(process.cwd(), ".content-cache");
  }
  if (process.env.VR_CONTENT_LOCAL_DIR) return process.env.VR_CONTENT_LOCAL_DIR;
  // cwd during `next build` / `next dev` / vitest is apps/web → repo is ../.. → website_data is ../../../
  return path.resolve(process.cwd(), "..", "..", "..", "website_data");
}

function publicRoot(): string {
  return path.join(process.cwd(), "public");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Recursively collect every directory that directly contains a *.json story file. */
function findStoryDirs(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // missing dir (e.g. CI without the drop folder) → skip
    }
    if (entries.some((e) => e.isFile() && e.name.endsWith(".json"))) out.push(dir);
    for (const e of entries) if (e.isDirectory()) walk(path.join(dir, e.name));
  };
  walk(root);
  return out;
}

function findImage(imgDir: string, re: RegExp): string | null {
  try {
    const name = fs.readdirSync(imgDir).find((n) => re.test(n));
    return name ? path.join(imgDir, name) : null;
  } catch {
    return null;
  }
}

/** Copy a source image into public/stories/<slug>/ and return its web path. */
function copyToPublic(slug: string, srcPath: string): string {
  const base = path.basename(srcPath);
  const destDir = path.join(publicRoot(), "stories", slug);
  const dest = path.join(destDir, base);
  try {
    // Skip the copy if the destination is already up to date (dev re-scans every
    // request, so this avoids re-copying multi-MB covers each time).
    const fresh = fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(srcPath).mtimeMs;
    if (!fresh) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcPath, dest);
    }
  } catch {
    /* non-fatal: a missing/locked asset shouldn't break the build */
  }
  return `/stories/${slug}/${base}`; // web path always uses forward slashes
}

// ─── Normalizer (generation JSON → StoryFull) ────────────────────────────────
function readStory(dir: string): StoryFull | null {
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return null;
  }
  const jsonName = entries.find((n) => n.endsWith(".json"));
  if (!jsonName) return null;

  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(dir, jsonName), "utf8"));
  } catch {
    return null;
  }

  const slug = jsonName.replace(/\.json$/, "");
  const folder = path.basename(dir);
  const kind: Story["kind"] = folder.endsWith("_short")
    ? "short"
    : raw?.tier?.id === "novel" || raw?.tier?.id === "series"
      ? raw.tier.id
      : "short";

  const genre = typeof raw.genre === "string" ? cap(raw.genre) : undefined;

  const scenes: StoryScene[] =
    Array.isArray(raw.scenes) && raw.scenes.length
      ? raw.scenes.map((s: any) => ({
          title: typeof s.title === "string" ? s.title : undefined,
          prose: String(s.prose ?? ""),
        }))
      : [{ prose: String(raw.prose ?? "") }];

  const imgDir = path.join(dir, "images");
  const src34 = findImage(imgDir, /^cover_34\./i);
  const src169 = findImage(imgDir, /^cover_169\./i);
  const cover34 = src34 ? copyToPublic(slug, src34) : undefined;
  const cover169 = src169 ? copyToPublic(slug, src169) : undefined;

  // Publish on build (scheduling deferred — ARCHITECTURE §6.9). `createdAt` keeps the
  // FULL timestamp so same-day stories order correctly (newest first); `publishAt` is
  // midnight UTC of that day so a story is never hidden by a same-day time comparison.
  const created = String(raw.created_at ?? "");
  const day = created.slice(0, 10) || "1970-01-01";

  return {
    id: typeof raw.id === "string" ? raw.id : `sto_${slug}`,
    section: "stories",
    slug,
    title: typeof raw.title === "string" ? raw.title : slug,
    status: "live",
    createdAt: created || day,
    publishAt: `${day}T00:00:00.000Z`,
    accent: (genre && GENRE_TINT[genre]) || AMBER,
    genre,
    summary: raw.logline || raw.promise || undefined,
    cover: cover34,
    cover34,
    cover169,
    kind,
    readMinutes: raw?.totals?.read_minutes,
    wordCount: raw?.totals?.word_count,
    tags: Array.isArray(raw.reedsy_tags) ? raw.reedsy_tags : undefined,
    scenes,
  };
}

// ─── Public API (memoized per build) ─────────────────────────────────────────
let _cache: StoryFull[] | null = null;

function loadAll(): StoryFull[] {
  // Scan + parse once per process (cheap, no per-request re-scan). To pick up newly
  // added/edited content, restart the dev server (or re-run the build). See README/§6.7.
  if (_cache) return _cache;
  const dirs = findStoryDirs(path.join(contentRoot(), "stories"));
  _cache = dirs.map(readStory).filter((s): s is StoryFull => s !== null);
  return _cache;
}

/** Project a full story down to its listing fields (drops the body). */
function toListing(s: StoryFull): Story {
  return {
    id: s.id,
    section: s.section,
    slug: s.slug,
    title: s.title,
    status: s.status,
    createdAt: s.createdAt,
    publishAt: s.publishAt,
    accent: s.accent,
    genre: s.genre,
    summary: s.summary,
    cover: s.cover,
    tags: s.tags,
    kind: s.kind,
    readMinutes: s.readMinutes,
    wordCount: s.wordCount,
    cover34: s.cover34,
    cover169: s.cover169,
  };
}

/** Live stories, newest-first, body stripped (for listings). */
export function getStories(now: Date = new Date()): Story[] {
  return (selectLive(loadAll(), now) as StoryFull[])
    .filter((s) => s.section === "stories")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toListing);
}

/** One story with its body, by slug (no live filter — used by the reader). */
export function getStory(slug: string): StoryFull | undefined {
  return loadAll().find((s) => s.slug === slug);
}

/** Back-compat alias kept for existing imports/tests. */
export function getLatestStories(now: Date = new Date()): Story[] {
  return getStories(now);
}
