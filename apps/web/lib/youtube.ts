// apps/web/lib/youtube.ts
//
// Pure YouTube helpers (no node:fs), safe to import from components and pages' render code.
// lib/movies.ts re-exports these for server code.

import type { Series } from "./movies";

/** The studio's YouTube channel (verified live 2026-10-22). Episodes publish here as Shorts. */
export const CHANNEL = {
  name: "The Keeper's Lantern",
  handle: "@TheKeepersLantern",
  id: "UCyjo8L-DEJaeGuufUqMpigw",
  url: "https://www.youtube.com/@TheKeepersLantern",
} as const;

export function channelSubscribeUrl(): string {
  return `${CHANNEL.url}?sub_confirmation=1`;
}

export function youtubePlaylistUrl(id: string): string {
  return `https://www.youtube.com/playlist?list=${id}`;
}

export function youtubeShortsUrl(id: string): string {
  return `https://www.youtube.com/shorts/${id}`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string, opts: { autoplay?: boolean; start?: number } = {}): string {
  const q = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (opts.autoplay) q.set("autoplay", "1");
  if (opts.start) q.set("start", String(opts.start));
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`;
}

export interface SeriesYouTubeLinks {
  channel: { name: string; url: string };
  playlist?: string;
  compilation?: { href: string; title?: string };
}

/** A series' links out to YouTube: the in-order playlist and the whole book as one video. */
export function seriesYouTubeLinks(s: Series): SeriesYouTubeLinks {
  const out: SeriesYouTubeLinks = { channel: { name: CHANNEL.name, url: CHANNEL.url } };
  if (s.playlistId) out.playlist = youtubePlaylistUrl(s.playlistId);
  if (s.compilation?.youtubeId) out.compilation = { href: youtubeWatchUrl(s.compilation.youtubeId), title: s.compilation.title };
  return out;
}
