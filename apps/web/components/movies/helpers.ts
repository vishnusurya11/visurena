// components/movies/helpers.ts
//
// Pure, client-safe helpers for the Movies pages. Imports ONLY types from lib/movies
// (that module reads node:fs and must stay inside getStaticProps). Anything that needs
// the runtime helpers there (seriesStatusParts, youtube URLs) is computed server-side
// and handed down as props.

import type { Series, Episode, VideoAspect } from "../../lib/movies";
import type { EpisodeProgress, EpisodeState } from "./progress";

/** Client-safe mirror of lib/movies episodeAspect(): per-episode aspect, else the series'. */
export function aspectOf(series: Pick<Series, "aspect">, episode: Pick<Episode, "aspect">): VideoAspect {
  return episode.aspect ?? series.aspect;
}

/** Where to crop a still inside a portrait/2:3 tile: faces sit high in 9:16 frames only. */
export function stillPosition(aspect: VideoAspect): string {
  return aspect === "9:16" ? "50% 20%" : "50% 50%";
}

// ── Requests (content-local/requests.json) ─────────────────────────────────────
export interface RequestItem {
  id: string;
  title: string;
  author?: string;
  year?: string;
  format?: string;                 // "Episodes" | "Feature" | "Shorts" | "Games" | "Stories"
  votes: number;
  state?: "in-production" | "voting";
  producedSlug?: string;           // series slug when in production
}

export interface RequestsFile {
  season: string;
  totalVotes: number;
  openRequests: number;
  items: RequestItem[];
}

/** Serialisable VoteCard input (what pages hand to <SlateVotes>). */
export interface SlateItem {
  id: string;
  title: string;
  author?: string;
  year?: string;
  format?: string;
  votes: number;
  state?: "in-production" | "voting";
  note?: string;
  href?: string;
}

export const MOVIE_FORMATS = ["Feature", "Episodes"] as const;

export function isMovieRequest(r: RequestItem): boolean {
  return (MOVIE_FORMATS as readonly string[]).includes(r.format ?? "");
}

function byProductionThenVotes(a: RequestItem, b: RequestItem): number {
  const ap = a.state === "in-production" ? 0 : 1;
  const bp = b.state === "in-production" ? 0 : 1;
  return ap - bp || b.votes - a.votes;
}

/** Feature/Episodes requests: in-production first, then by votes. */
export function movieRequests(items: RequestItem[], limit = 3): RequestItem[] {
  return items.filter(isMovieRequest).sort(byProductionThenVotes).slice(0, limit);
}

/** "What should we adapt after this?" — open votes only, movie formats, by votes. */
export function slateAfter(items: RequestItem[], limit = 3, excludeSlug?: string): RequestItem[] {
  return items
    .filter((r) => isMovieRequest(r) && r.state !== "in-production" && (!excludeSlug || r.producedSlug !== excludeSlug))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);
}

/** "Script ✓ · Cast ✓ · Ep 1 rendering" from a series' production block. */
export function productionNote(s: Pick<Series, "production"> | undefined): string | undefined {
  const p = s?.production;
  if (!p) return undefined;
  const parts = [p.script ? "Script ✓" : null, p.cast ? "Cast ✓" : null, p.note ?? null].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

/** Request items → serialisable VoteCard props; in-production items link to their series. */
export function toSlateItems(items: RequestItem[], seriesList: Series[] = []): SlateItem[] {
  return items.map((r) => {
    const produced = r.producedSlug ? seriesList.find((s) => s.slug === r.producedSlug) : undefined;
    return {
      id: r.id,
      title: r.title,
      author: r.author,
      year: r.year,
      format: r.format,
      votes: r.votes,
      state: r.state,
      note: r.state === "in-production" ? productionNote(produced) : undefined,
      href: produced ? `/movies/${produced.slug}` : undefined,
    };
  });
}

// ── Series / episodes ──────────────────────────────────────────────────────────
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function episodeSlug(n: number): string {
  return `ep-${pad2(n)}`;
}

export function episodeHref(seriesSlug: string, ep: Pick<Episode, "slug"> | number): string {
  const slug = typeof ep === "number" ? episodeSlug(ep) : ep.slug;
  return `/movies/${seriesSlug}/${slug}`;
}

export function seriesHref(seriesSlug: string): string {
  return `/movies/${seriesSlug}`;
}

export function isReleased(s: Series): boolean {
  return s.episodes.length > 0 && s.status !== "in-production";
}

/** Newest episodes across released series. Ties on publishAt fall back to episode number. */
export function latestEpisodes(seriesList: Series[], limit = 8): Array<{ series: Series; episode: Episode }> {
  const all: Array<{ series: Series; episode: Episode }> = [];
  for (const s of seriesList) if (isReleased(s)) for (const e of s.episodes) all.push({ series: s, episode: e });
  all.sort((a, b) => {
    if (a.episode.publishAt !== b.episode.publishAt) return b.episode.publishAt > a.episode.publishAt ? 1 : -1;
    return b.episode.n - a.episode.n;
  });
  return all.slice(0, limit);
}

/** "1 series complete · 14 episodes · 1 trailer · 9 titles in development · Played on YouTube". */
export function hubCounts(seriesList: Series[], requests: Pick<RequestsFile, "items">): string[] {
  const complete = seriesList.filter((s) => s.status === "complete").length;
  const airing = seriesList.filter((s) => s.status === "airing").length;
  const episodes = seriesList.filter((s) => s.kind !== "shorts").reduce((n, s) => n + s.episodes.length, 0);
  const trailers = seriesList.filter((s) => s.trailer && (s.trailer.file || s.trailer.youtubeId)).length;
  const shorts = seriesList.filter((s) => s.kind === "shorts").reduce((n, s) => n + s.episodes.length, 0);
  // Titles in development = every Feature/Episodes request (the in-production one included).
  const inDev = movieRequests(requests.items, Infinity).length;
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  return [
    complete ? `${complete} series complete` : null,
    airing ? `${plural(airing, "series airing", "series airing")}` : null,
    episodes ? plural(episodes, "episode") : null,
    trailers ? plural(trailers, "trailer") : null,
    shorts ? plural(shorts, "short") : null,
    inDev ? plural(inDev, "title in development", "titles in development") : null,
    "Played on YouTube",
  ].filter((x): x is string => !!x);
}

/** "1 complete · 1 in production" for the Series section meta. */
export function seriesMeta(seriesList: Series[]): string {
  const c = seriesList.filter((s) => s.status === "complete").length;
  const a = seriesList.filter((s) => s.status === "airing").length;
  const p = seriesList.filter((s) => s.status === "in-production").length;
  return [c ? `${c} complete` : null, a ? `${a} airing` : null, p ? `${p} in production` : null]
    .filter(Boolean)
    .join(" · ");
}

export interface RailItem {
  key: string;
  href: string;
  title: string;
  caption: string;
  image?: string;
  chip?: string;
  playGlyph?: boolean;
}

/** Trailers & shorts rail. Shorts only if a shorts series exists; pads to ≥3 with latest episodes. */
export function trailerRail(seriesList: Series[], minItems = 3): RailItem[] {
  const out: RailItem[] = [];
  for (const s of seriesList) {
    if (s.trailer && (s.trailer.file || s.trailer.youtubeId)) {
      out.push({
        key: `trailer-${s.slug}`,
        href: `${seriesHref(s.slug)}#trailer`,
        title: s.title,
        caption: ["Trailer", s.trailer.runtime].filter(Boolean).join(" · "),
        image: s.trailer.poster ?? s.poster,
        playGlyph: true,
      });
    }
  }
  for (const s of seriesList) {
    if (s.kind !== "shorts") continue;
    for (const e of s.episodes) {
      out.push({
        key: `short-${s.slug}-${e.slug}`,
        href: episodeHref(s.slug, e),
        title: e.title,
        caption: ["Short", e.runtime].filter(Boolean).join(" · "),
        image: e.still,
        playGlyph: true,
      });
    }
  }
  if (out.length < minItems) {
    const longForm = seriesList.filter((s) => s.kind !== "shorts");
    for (const { series, episode } of latestEpisodes(longForm, minItems - out.length)) {
      out.push({
        key: `ep-${series.slug}-${episode.slug}`,
        href: episodeHref(series.slug, episode),
        title: episode.title,
        caption: [`Ep ${episode.n}`, episode.runtime].filter(Boolean).join(" · "),
        image: episode.still,
        chip: `Ep ${episode.n}`,
      });
    }
  }
  return out;
}

/** "Ep 4 · 10:04 · Chapter 4 · Watched" */
export function episodeStatusParts(e: Pick<Episode, "n" | "runtime" | "chapter">, state?: EpisodeState): string[] {
  return [
    `Ep ${e.n}`,
    e.runtime ?? null,
    typeof e.chapter === "number" ? `Chapter ${e.chapter}` : null,
    state === "watched" ? "Watched" : state === "current" ? "In progress" : null,
  ].filter((x): x is string => !!x);
}

/** Episode caption for cards: "Ep 4 · 10:04" */
export function episodeCaption(e: Pick<Episode, "n" | "runtime">): string {
  return [`Ep ${e.n}`, e.runtime].filter(Boolean).join(" · ");
}

export interface ChapterMarker {
  label: string;      // "Chapter 4"
  title: string;      // episode title (the book chapter this episode adapts)
  at: string;         // "0:00"
}

/** Chapter markers for the panel. One per adapted book chapter until real cue points exist. */
export function chaptersFor(e: Pick<Episode, "title" | "chapter" | "n">): ChapterMarker[] {
  const n = typeof e.chapter === "number" ? e.chapter : e.n;
  return [{ label: `Chapter ${n}`, title: e.title, at: "0:00" }];
}

const HONORIFICS = new Set(["dr", "dr.", "mr", "mr.", "mrs", "mrs.", "ms", "ms.", "sir", "inspector", "the"]);

/** "Tobias Gregson" → "TG", "Inspector Lestrade" → "L", "Dr. John Watson" → "JW". */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => w && !HONORIFICS.has(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/** Which episode the primary CTA should open: saved progress or Ep 1. */
export function primaryEpisode(s: Series, progress?: EpisodeProgress | null): Episode | undefined {
  if (!s.episodes.length) return undefined;
  if (progress && progress.seriesSlug === s.slug) {
    const hit = s.episodes.find((e) => e.n === progress.ep);
    if (hit) return hit;
  }
  return s.episodes[0];
}

/** "Chronological · 6 watched · Ep 7 in progress" */
export function episodesMeta(s: Series, progress?: EpisodeProgress | null): string {
  const parts = ["Chronological"];
  if (progress && progress.seriesSlug === s.slug) {
    const watched = s.episodes.filter((e) => e.n < progress.ep).length;
    if (watched) parts.push(`${watched} watched`);
    parts.push(`Ep ${progress.ep} in progress`);
  }
  return parts.join(" · ");
}

/** "Played on YouTube · Audiobook 4 h 51 min · Casebook · Cast sheets" */
export function seriesSubline(s: Series): string {
  const parts = ["Played on YouTube"];
  const ab = s.extras?.audiobook;
  if (ab) parts.push(["Audiobook", ab.runtime].filter(Boolean).join(" "));
  if (s.extras?.casebook) parts.push("Casebook");
  if (s.cast.length) parts.push("Cast sheets");
  return parts.join(" · ");
}
