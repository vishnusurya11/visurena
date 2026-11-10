// apps/web/lib/movies.ts
//
// Build-time content provider for the Movies room: series, episodes, trailers, shorts.
// Server-only — used inside getStaticProps / getStaticPaths. Reads
// <repo>/content-local/series.json, which `pnpm content:ingest-studio` writes from the
// visurena_studio ledgers (SERIES_PROGRESS.json + uploads.jsonl per book).

import fs from "node:fs";
import path from "node:path";

export type SeriesStatus = "airing" | "complete" | "in-production";
export type VideoAspect = "9:16" | "1:1" | "16:9";

export interface Episode {
  n: number;
  slug: string;          // "ep-04"
  title: string;
  youtubeId: string;
  runtime?: string;      // "10:04"
  publishAt: string;     // ISO
  still?: string;        // public URL, scene still at the source aspect
  aspect?: VideoAspect;  // per-episode; falls back to series.aspect
  chapter?: number;
  summary?: string;
}

export interface CastMember {
  id: string;
  name: string;
  role?: string;
  portrait?: string;     // public URL
}

export interface Series {
  id: string;
  section: "movies";
  kind: "series" | "feature" | "shorts";
  slug: string;
  title: string;
  subtitle?: string;     // "Sherlock Holmes"
  author?: string;
  year?: string;
  status: SeriesStatus;
  aspect: VideoAspect;
  synopsis: string;
  poster: string;        // public URL, portrait key art
  backdrop?: string;     // public URL, wide art (optional)
  glow?: string;         // public URL, tiny pre-blurred poster copy
  accent: string;        // hex
  trailer?: { youtubeId?: string; file?: string; runtime?: string; poster?: string };
  /** The book's "all episodes in order" playlist on the channel. */
  playlistId?: string;
  /** The whole book as one regular (non-Short) video. */
  compilation?: { youtubeId: string; title?: string; publishAt?: string };
  episodes: Episode[];
  cast: CastMember[];
  extras?: { audiobook?: { runtime?: string; chapters?: number; href?: string }; casebook?: boolean };
  production?: { script?: boolean; cast?: boolean; note?: string; votes?: number; eta?: string };
  createdAt: string;
  publishAt: string;
}

export interface EpisodeContext {
  series: Series;
  episode: Episode;
  prev?: Episode;
  next?: Episode;
}

function seriesFile(): string {
  if (process.env.VR_SERIES_JSON) return process.env.VR_SERIES_JSON;
  // cwd during next build / dev / vitest is apps/web
  return path.resolve(process.cwd(), "..", "..", "content-local", "series.json");
}

let cache: Series[] | null = null;

export function loadSeries(file = seriesFile()): Series[] {
  if (cache && file === seriesFile()) return cache;
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const list = JSON.parse(raw) as Series[];
  const sorted = [...list].sort((a, b) => (b.publishAt > a.publishAt ? 1 : -1));
  if (file === seriesFile()) cache = sorted;
  return sorted;
}

/** All series, newest first. */
export function getSeriesList(): Series[] {
  return loadSeries();
}

/** Series that have at least one published episode (airing or complete). */
export function getReleasedSeries(): Series[] {
  return getSeriesList().filter((s) => s.episodes.length > 0 && s.status !== "in-production");
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return getSeriesList().find((s) => s.slug === slug);
}

export function getEpisode(seriesSlug: string, episodeSlug: string): EpisodeContext | undefined {
  const series = getSeriesBySlug(seriesSlug);
  if (!series) return undefined;
  const i = series.episodes.findIndex((e) => e.slug === episodeSlug);
  if (i < 0) return undefined;
  return {
    series,
    episode: series.episodes[i],
    prev: i > 0 ? series.episodes[i - 1] : undefined,
    next: i < series.episodes.length - 1 ? series.episodes[i + 1] : undefined,
  };
}

/** Newest episodes across every series, for Home / New this week. */
export function getLatestEpisodes(limit = 8): Array<{ series: Series; episode: Episode }> {
  const all: Array<{ series: Series; episode: Episode }> = [];
  for (const s of getReleasedSeries()) for (const e of s.episodes) all.push({ series: s, episode: e });
  all.sort((a, b) => (b.episode.publishAt > a.episode.publishAt ? 1 : -1));
  return all.slice(0, limit);
}

/** One line the UI can render everywhere: "Series · Complete · 14 episodes · 2 h 20 min". */
export function seriesStatusParts(s: Series): string[] {
  const kind = s.kind === "series" ? "Series" : s.kind === "feature" ? "Feature" : "Shorts";
  if (s.status === "in-production") {
    const p = s.production ?? {};
    return [kind, "In production", p.script ? "Script ✓" : null, p.cast ? "Cast ✓" : null, p.note ?? null]
      .filter((x): x is string => !!x);
  }
  const n = s.episodes.length;
  const total = totalRuntime(s);
  return [kind, s.status === "complete" ? "Complete" : "Airing", `${n} episode${n === 1 ? "" : "s"}`, total, s.year ?? null]
    .filter((x): x is string => !!x);
}

/** "2 h 20 min" from episode runtimes like "10:04". Returns "" if none are known. */
export function totalRuntime(s: Series): string {
  let secs = 0;
  for (const e of s.episodes) {
    if (!e.runtime) continue;
    const [m, sec] = e.runtime.split(":").map(Number);
    if (Number.isFinite(m) && Number.isFinite(sec)) secs += m * 60 + sec;
  }
  if (!secs) return "";
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}

/** The aspect the player stage should use for an episode. */
export function episodeAspect(series: Series, episode: Episode): VideoAspect {
  return episode.aspect ?? series.aspect;
}

/** Every published episode is a Short (the studio's ≤ 3 min rule); count them across series. */
export function countShorts(series: Series[]): number {
  return series.reduce((n, s) => n + (s.status === "in-production" ? 0 : s.episodes.length), 0);
}

export { CHANNEL, channelSubscribeUrl, youtubePlaylistUrl, youtubeShortsUrl, youtubeWatchUrl, youtubeEmbedUrl } from "./youtube";
