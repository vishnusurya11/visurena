#!/usr/bin/env node
// apps/web/scripts/ingest-studio.mjs
//
// Ingest the visurena_studio library into the web app:
//   library/<stamp>_<book-slug>/{SERIES_PROGRESS.json, uploads.jsonl, episodes/, title/, trailer/, cast/}
//     -> content-local/series.json           (one Series object per book, same shape as lib/movies.ts)
//     -> apps/web/public/movies/<slug>/**    (episode stills, poster, glow, trailer poster + mp4, cast)
//
// Usage (from apps/web):
//   node scripts/ingest-studio.mjs [--library <dir>] [--out <series.json>] [--public <dir>]
//                                  [--ffmpeg <exe>] [--ffprobe <exe>] [--force] [--dry-run]
//
// Rules (see docs/content-management.md "Ingest from visurena_studio"):
//   * The ledger is the truth for episodes, ids, dates, status, runtimes and asset paths.
//   * Editorial fields (subtitle, author, year, synopsis, accent, cast roles, extras, production)
//     are read back from the existing series.json and overlaid — the ledger never overwrites them.
//   * A book folder WITHOUT SERIES_PROGRESS.json is included only when the existing series.json
//     already lists it (as "in-production"); every other book is skipped.
//   * The published cut of an episode is the master*.mp4 whose sha256 starts with the upload
//     ledger's sha8; fallback master.mp4, then the newest master_*.mp4.
//   * Episode stills keep the SOURCE aspect (longest side 960; square masters -> 960x960) and each
//     episode carries `aspect` ("9:16" | "1:1" | "16:9") measured from its published cut; the
//     series `aspect` is the majority across published episodes. Poster / trailer poster / cast
//     portraits are still centre-cropped to their fixed frames.
//   * Media work is skipped when the output exists and is newer than its inputs (--force overrides).
//   * No dependencies: ffmpeg/ffprobe are spawned; without ffprobe the `ffmpeg -i` banner is parsed.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------------------------

export const STILL_MAX_SIDE = 960;      // episode stills keep the source aspect, longest side 960
export const TRAILER_STILL_SIZE = [540, 960];
export const POSTER_SIZE = [720, 1280];
export const GLOW_SIZE = [64, 114];
export const CAST_SIZE = [480, 640];
export const TRAILER_MAX_BYTES = 25 * 1024 * 1024;
export const TRAILER_FRAME_AT = 2;
export const STILL_AT_FRACTION = 0.4;
export const JPEG_Q = 3; // mjpeg qscale 2..31; 3 ≈ JPEG quality 85
export const DEFAULT_ACCENT = "#3DD68C";
export const DEFAULT_CAST_COUNT = 6;

/** Editorial fields that the existing series.json owns; the ledger never overwrites them. */
export const CURATED_KEYS = ["kind", "subtitle", "author", "year", "synopsis", "accent", "extras", "production"];

// ---------------------------------------------------------------------------------------------
// Pure transforms (unit-tested in ingest-studio.test.mjs)
// ---------------------------------------------------------------------------------------------

export function parseArgs(argv, defaults = {}) {
  const out = { force: false, dryRun: false, ...defaults };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--library") out.library = next();
    else if (a === "--out") out.out = next();
    else if (a === "--public") out.public = next();
    else if (a === "--ffmpeg") out.ffmpeg = next();
    else if (a === "--ffprobe") out.ffprobe = next();
    else if (a === "--force") out.force = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return out;
}

/** `20260825235949_frankenstein-or-the-modern-prometheus` -> `frankenstein` */
export function normaliseSlug(folderName) {
  const base = String(folderName).replace(/^\d{14}_/, "");
  const cut = base.split("-or-")[0];
  return cut.replace(/-+$/, "");
}

/** `20260822113400` -> { createdAt: "2026-08-22", createdIso: "2026-08-22T11:34:00Z" } */
export function stampToDates(folderName) {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})_/.exec(String(folderName));
  if (!m) return { createdAt: undefined, createdIso: undefined };
  const [, y, mo, d, h, mi, s] = m;
  return { createdAt: `${y}-${mo}-${d}`, createdIso: `${y}-${mo}-${d}T${h}:${mi}:${s}Z` };
}

/** Naive ledger timestamps ("2026-09-14T18:36:38") are treated as UTC. */
export function toIso(at) {
  if (!at) return undefined;
  const s = String(at).trim().replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00Z`;
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(s) ? s : `${s}Z`;
}

/** `…/ep01/dd06d33c#retitle` -> { sha8: "dd06d33c", event: "retitle" }; a key without `#` is an upload. */
export function parseUploadKey(key) {
  const s = String(key || "");
  const [base, event] = s.split("#");
  const m = /\/([0-9a-f]{8})$/i.exec(base);
  return { sha8: m ? m[1].toLowerCase() : undefined, event: event || "upload" };
}

/**
 * uploads.jsonl -> Map<episodeNumber, { videoId, title, at, publishedAt, sha8 }>.
 *  - videoId / title / at : from the latest row (retitles included)
 *  - publishedAt          : `at` of the earliest upload row (retitle rows are events, not publishes)
 *  - sha8                 : from `sha8` or the key, carried across rows
 */
export function parseUploads(text) {
  const map = new Map();
  for (const line of String(text || "").split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    let row;
    try { row = JSON.parse(t); } catch { continue; }
    const ep = Number(row.episode);
    if (!Number.isFinite(ep)) continue;
    const key = parseUploadKey(row.key);
    const at = toIso(row.at);
    const sha8 = row.sha8 || key.sha8;
    const prev = map.get(ep) || {};
    const latest = !prev.at || String(at) >= String(prev.at);
    const entry = {
      videoId: latest ? row.video_id || prev.videoId : prev.videoId || row.video_id,
      title: latest ? row.title || prev.title : prev.title || row.title,
      at: latest ? at : prev.at,
      publishedAt: prev.publishedAt,
      sha8: (latest ? sha8 || prev.sha8 : prev.sha8 || sha8),
    };
    if (key.event === "upload" && (!entry.publishedAt || String(at) < String(entry.publishedAt))) entry.publishedAt = at;
    map.set(ep, entry);
  }
  for (const e of map.values()) if (!e.publishedAt) e.publishedAt = e.at;
  return map;
}

// ---------------------------------------------------------------------------------------------
// Books without SERIES_PROGRESS.json (War of the Worlds, Jekyll & Hyde, every book after Scarlet):
// uploads.jsonl is the only record. It is append-only and mixes row types (uploads, `#public`
// flips, privacy / deleted / shorts_poll events, compilation rows), and its timestamps mix naive
// local times with UTC, so FILE ORDER is the truth, never the clock.
// ---------------------------------------------------------------------------------------------

/** jsonl text -> rows, file order kept; blank and broken lines skipped. */
export function parseJsonl(text) {
  const rows = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try { rows.push(JSON.parse(t)); } catch { /* a torn line is not a row */ }
  }
  return rows;
}

const truthy = (v) => v === true || /^(true|1|yes)$/i.test(String(v ?? ""));

/** Every video id the ledger deleted. Two spellings: {"event":"deleted"} and {"deleted": "True"}. */
export function deletedIds(rows) {
  const out = new Set();
  for (const r of rows || []) if (r?.video_id && (r.event === "deleted" || truthy(r.deleted))) out.add(r.video_id);
  return out;
}

/** Fold the ledger into one record per video id: episode, title, sha8, last privacy, dates, order. */
function foldVideos(rows, keep) {
  const deleted = deletedIds(rows);
  const videos = new Map();
  (rows || []).forEach((r, i) => {
    const id = r?.video_id;
    if (!id || deleted.has(id) || !keep(r)) return;
    const v = videos.get(id) || { videoId: id, episode: r.episode, order: i };
    if (r.title) v.title = r.title; // a #retitle row carries the newer title
    v.sha8 = v.sha8 || r.sha8 || parseUploadKey(r.key).sha8;
    if (r.privacy) v.privacy = r.privacy;
    const at = toIso(r.at);
    if (at && !v.uploadedAt) v.uploadedAt = at;
    if (at && r.privacy === "public" && !v.publicAt) v.publicAt = at;
    videos.set(id, v);
  });
  for (const v of videos.values()) {
    // The moment it went live: the later of the upload and the first public flip.
    v.publishedAt = [v.uploadedAt, v.publicAt].filter(Boolean).sort().pop();
  }
  return videos;
}

/**
 * uploads.jsonl rows -> Map<episodeNumber, { videoId, title, sha8, at, publishedAt, duplicates? }>,
 * public episodes only. A deleted id never counts; a video's privacy is its LAST value in the
 * file; when an episode has several public uploads the newest (last in the file) wins and the
 * others are listed in `duplicates` so the owner can unlist them.
 */
export function liveEpisodesFromUploads(rows) {
  const videos = foldVideos(rows, (r) => Number.isFinite(Number(r.episode)));
  const byEp = new Map();
  for (const v of videos.values()) {
    if (v.privacy !== "public") continue;
    const ep = Number(v.episode);
    const list = byEp.get(ep) || [];
    list.push(v);
    byEp.set(ep, list);
  }
  const out = new Map();
  for (const [ep, list] of byEp) {
    list.sort((a, b) => a.order - b.order);
    const v = list[list.length - 1];
    const entry = { videoId: v.videoId, title: v.title, sha8: v.sha8, at: v.publishedAt, publishedAt: v.publishedAt };
    if (list.length > 1) entry.duplicates = list.slice(0, -1).map((x) => x.videoId);
    out.set(ep, entry);
  }
  return out;
}

/** `… — Ep 16/27 — "The Exodus from London"` -> { n: 16, total: 27, title: "The Exodus from London" } */
export function parseEpisodeTitle(s) {
  const m = /\bEp\s*(\d+)\s*\/\s*(\d+)\s*[—–-]\s*["“]?(.+?)["”]?\s*$/.exec(String(s || ""));
  return m ? { n: Number(m[1]), total: Number(m[2]), title: m[3].trim() } : {};
}

/**
 * The SERIES_PROGRESS.json shape buildSeries reads, made from liveEpisodesFromUploads():
 * chapters 1..total, published where the ledger has a public video, "planned" otherwise.
 * The total comes from the "Ep NN/TT" titles, else the highest published chapter.
 */
export function progressFromUploads(live) {
  const parsed = [...(live || new Map())].map(([ep, v]) => [ep, parseEpisodeTitle(v.title), v]);
  const total = Math.max(0, ...parsed.map(([ep, t]) => Math.max(ep, t.total || 0)));
  const byEp = new Map(parsed.map(([ep, t, v]) => [ep, { t, v }]));
  const episodes = [];
  for (let chapter = 1; chapter <= total; chapter++) {
    const hit = byEp.get(chapter);
    if (!hit) { episodes.push({ chapter, state: "planned" }); continue; }
    episodes.push(stripUndefined({ chapter, title: hit.t.title || hit.v.title, state: "published", video_id: hit.v.videoId }));
  }
  return { episodes };
}

/** The live whole-book video: the last public, undeleted compilation upload. */
export function compilationFromUploads(rows) {
  const videos = [...foldVideos(rows, (r) => r.episode === "compilation").values()]
    .filter((v) => v.privacy === "public")
    .sort((a, b) => a.order - b.order);
  const v = videos[videos.length - 1];
  return v ? stripUndefined({ youtubeId: v.videoId, title: v.title, publishAt: v.publishedAt }) : undefined;
}

/** The book's playlist: the ledger's own `playlist` row first, else the first link in `texts`. */
export function findPlaylistId(rows, texts = []) {
  const own = (rows || []).filter((r) => r?.event === "playlist" && r.playlist_id).pop();
  if (own) return own.playlist_id;
  for (const t of texts) {
    const m = /list=([\w-]+)/.exec(String(t ?? ""));
    if (m) return m[1];
  }
  return undefined;
}

/** all published -> complete; some -> airing; none -> in-production */
export function deriveStatus(episodes) {
  const list = Array.isArray(episodes) ? episodes : [];
  const published = list.filter((e) => e && e.state === "published" && e.video_id).length;
  if (list.length > 0 && published === list.length) return "complete";
  if (published > 0) return "airing";
  return "in-production";
}

/** 173.93 -> "2:54"; 3725 -> "1:02:05"; NaN -> undefined */
export function formatRuntime(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) return undefined;
  const total = Math.round(n);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** Parse the `ffmpeg -i` banner (stderr) -> { durationSec, width, height }. */
export function parseFfmpegInfo(stderr) {
  const text = String(stderr || "");
  let durationSec;
  const d = /Duration:\s*(\d+):(\d{2}):(\d{2}(?:\.\d+)?)/.exec(text);
  if (d) durationSec = Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]);
  let width, height;
  const videoLine = text.split(/\r?\n/).find((l) => /Stream #.*Video:/.test(l));
  if (videoLine) {
    // ", 768x1344," or ", 768x1344 [SAR" — never the codec tag "0x31637661".
    const m = /,\s*(\d{2,5})x(\d{2,5})(?=\s*(?:\[|,|$))/.exec(videoLine);
    if (m) { width = Number(m[1]); height = Number(m[2]); }
  }
  return { durationSec, width, height };
}

/** Parse `ffprobe -print_format json -show_streams -show_format` output. */
export function parseFfprobeJson(json) {
  let data;
  try { data = typeof json === "string" ? JSON.parse(json) : json; } catch { return {}; }
  const v = (data.streams || []).find((s) => s.codec_type === "video") || {};
  const dur = Number(data.format?.duration ?? v.duration);
  return {
    durationSec: Number.isFinite(dur) ? dur : undefined,
    width: v.width ? Number(v.width) : undefined,
    height: v.height ? Number(v.height) : undefined,
  };
}

/**
 * ffmpeg -vf filter that centre-crops the source to the target aspect and scales to dstW x dstH.
 * Sources already at the target aspect (±0.5 %) are only scaled.
 */
export function fitFilter(srcW, srcH, dstW, dstH) {
  const scale = `scale=${dstW}:${dstH}`;
  if (!(srcW > 0 && srcH > 0)) return scale;
  const target = dstW / dstH;
  const src = srcW / srcH;
  if (Math.abs(src - target) / target < 0.005) return scale;
  let cw = srcW, ch = srcH, x = 0, y = 0;
  if (src > target) { cw = Math.round(srcH * target); x = Math.floor((srcW - cw) / 2); }
  else { ch = Math.round(srcW / target); y = Math.floor((srcH - ch) / 2); }
  return `crop=${cw}:${ch}:${x}:${y},${scale}`;
}

/**
 * The series poster from a title card. A portrait card (within 15 % of 9:16) is centre-cropped as
 * before. A square or landscape card (every book after Scarlet) would lose its lettering to a
 * 9:16 crop, so it is fitted whole, centred over a darkened, blurred cover of itself.
 * Returns { vf } for `-vf` or { filterComplex } for `-filter_complex`.
 */
export function posterFilter(srcW, srcH, dstW = POSTER_SIZE[0], dstH = POSTER_SIZE[1]) {
  if (!(srcW > 0 && srcH > 0)) return { vf: fitFilter(srcW, srcH, dstW, dstH) };
  const target = dstW / dstH;
  if (Math.abs(srcW / srcH - target) / target < 0.15) return { vf: fitFilter(srcW, srcH, dstW, dstH) };
  return {
    filterComplex:
      `[0:v]split=2[bg][fg];` +
      `[bg]scale=${dstW}:${dstH}:force_original_aspect_ratio=increase,crop=${dstW}:${dstH},boxblur=24:2,eq=brightness=-0.12[b];` +
      `[fg]scale=${dstW}:-2[f];[b][f]overlay=0:(H-h)/2`,
  };
}

/** Frame size -> "9:16" | "1:1" | "16:9" (w/h < 0.8 portrait, 0.8–1.25 square, else landscape). */
export function classifyAspect(width, height) {
  if (!(width > 0 && height > 0)) return undefined;
  const r = width / height;
  if (r < 0.8) return "9:16";
  if (r <= 1.25) return "1:1";
  return "16:9";
}

/** The most common `aspect` across episodes; ties go to the first seen; undefined when none. */
export function majorityAspect(episodes) {
  const counts = new Map();
  for (const e of episodes || []) if (e?.aspect) counts.set(e.aspect, (counts.get(e.aspect) || 0) + 1);
  let best;
  for (const [aspect, n] of counts) if (!best || n > best.n) best = { aspect, n };
  return best?.aspect;
}

/** Still size at the SOURCE aspect with the longest side = `max`, even dimensions. */
export function stillSize(width, height, max = STILL_MAX_SIDE) {
  if (!(width > 0 && height > 0)) return [max, max];
  const even = (n) => Math.max(2, Math.round(n / 2) * 2);
  return width >= height ? [max, even((height * max) / width)] : [even((width * max) / height), max];
}

/** ffmpeg -vf for an episode still: scale only, no crop — CSS object-fit crops per card. */
export function stillFilter(width, height) {
  const [w, h] = stillSize(width, height);
  return `scale=${w}:${h}`;
}

/**
 * Order candidate cut files for an episode: master.mp4 first, then master_*.mp4 newest first.
 * `entries` = [{ name, mtimeMs }]. preview_*.mp4 and anything else is ignored.
 */
export function selectMasterCandidates(entries) {
  const list = (entries || []).filter((e) => /^master(?:_[\w-]+)?\.mp4$/i.test(e.name));
  const first = list.filter((e) => e.name.toLowerCase() === "master.mp4");
  const rest = list
    .filter((e) => e.name.toLowerCase() !== "master.mp4")
    .sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0) || a.name.localeCompare(b.name));
  return [...first, ...rest].map((e) => e.name);
}

export const pad2 = (n) => String(n).padStart(2, "0");
export const episodeSlug = (n) => `ep-${pad2(n)}`;
export const stillName = (n) => `ep${pad2(n)}`;

const SMALL_WORDS = new Set(["a", "an", "and", "of", "or", "in", "on", "to", "the"]);

/** "Frankenstein; or, the modern prometheus" -> { title: "Frankenstein", subtitle: "or, the Modern Prometheus" } */
export function splitBookTitle(raw) {
  const s = String(raw || "").trim();
  const idx = s.indexOf(";");
  if (idx < 0) return { title: s, subtitle: undefined };
  const title = s.slice(0, idx).trim();
  const subtitle = s
    .slice(idx + 1)
    .trim()
    .split(/\s+/)
    .map((w) => {
      const core = w.replace(/[^a-z]/gi, "").toLowerCase();
      if (SMALL_WORDS.has(core)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
  return { title, subtitle: subtitle || undefined };
}

/**
 * Which cast ids to publish: the ids the existing entry already lists (editorial choice);
 * otherwise the `count` named characters with the most appearances.
 * `characters` = [{ id, name, appearances }].
 */
export function pickCastIds(existingCast, characters, count = DEFAULT_CAST_COUNT) {
  if (Array.isArray(existingCast) && existingCast.length) return existingCast.map((c) => c.id);
  return (characters || [])
    .filter((c) => c && c.id && !/^(group_|unnamed_)/.test(c.id))
    .sort((a, b) => (b.appearances || 0) - (a.appearances || 0) || a.id.localeCompare(b.id))
    .slice(0, count)
    .map((c) => c.id);
}

/**
 * Ledger -> Series (the shape in apps/web/lib/movies.ts).
 * @param {object} p
 * @param {string} p.folderName          e.g. "20260822113400_a-study-in-scarlet"
 * @param {object} p.progress            parsed SERIES_PROGRESS.json
 * @param {Map}    p.uploads             parseUploads()
 * @param {object} [p.book]              parsed source/book.json ({ title, author })
 * @param {object} [p.existing]          the current series.json entry for this slug (editorial overlay)
 * @param {object} [p.characters]        { id: { name, appearances } } from cast/<id>/character.json
 * @param {Set}    [p.assets]            relative paths that exist under public/movies/<slug>/ (posix)
 * @param {object} [p.runtimes]          { [episodeNumber]: seconds }
 * @param {object} [p.frames]            { [episodeNumber]: { width, height } } of the published cut
 * @param {object} [p.trailer]           { runtimeSec }
 */
export function buildSeries(p) {
  const slug = normaliseSlug(p.folderName);
  const { createdAt, createdIso } = stampToDates(p.folderName);
  const assets = p.assets || new Set();
  const has = (rel) => assets.has(rel);
  const url = (rel) => `/movies/${slug}/${rel}`;
  const existing = p.existing || {};

  const ledgerEpisodes = [...(p.progress?.episodes || [])].sort((a, b) => (a.chapter || 0) - (b.chapter || 0));
  const status = deriveStatus(ledgerEpisodes);

  // A probe can fail transiently (a busy disk); the last measured values of the SAME video stand in.
  const knownByVideo = new Map((existing.episodes || []).filter((e) => e?.youtubeId).map((e) => [e.youtubeId, e]));

  const episodes = [];
  for (const le of ledgerEpisodes) {
    if (le.state !== "published" || !le.video_id) continue;
    const n = episodes.length + 1;
    const up = p.uploads?.get(le.chapter) || p.uploads?.get(n);
    const ep = {
      n,
      slug: episodeSlug(n),
      title: le.title,
      youtubeId: le.video_id || up?.videoId,
    };
    const known = knownByVideo.get(ep.youtubeId);
    const runtime = formatRuntime(p.runtimes?.[le.chapter] ?? p.runtimes?.[n]) || known?.runtime;
    if (runtime) ep.runtime = runtime;
    const frame = p.frames?.[le.chapter] ?? p.frames?.[n];
    const aspect = classifyAspect(frame?.width, frame?.height) || known?.aspect;
    if (aspect) ep.aspect = aspect;
    ep.publishAt = up?.publishedAt || up?.at || createdIso;
    ep.chapter = le.chapter;
    if (has(`${stillName(n)}.jpg`)) ep.still = url(`${stillName(n)}.jpg`);
    episodes.push(ep);
  }

  const bookTitle = splitBookTitle(p.book?.title || existing.title || slug);
  const series = {
    id: `mov_${slug}`,
    section: "movies",
    kind: existing.kind || "series",
    slug,
    title: existing.title || bookTitle.title,
    subtitle: existing.subtitle ?? bookTitle.subtitle,
    author: existing.author ?? p.book?.author,
    year: existing.year,
    status,
    // Measured from the published cuts; the existing value only stands in while nothing is published.
    aspect: majorityAspect(episodes) || existing.aspect || "9:16",
    synopsis: existing.synopsis ?? "",
    poster: url("poster.jpg"),
  };
  if (has("backdrop.jpg")) series.backdrop = url("backdrop.jpg");
  if (has("glow.jpg")) series.glow = url("glow.jpg");
  series.accent = existing.accent || DEFAULT_ACCENT;

  if (has("trailer-60.mp4") || has("trailer.jpg")) {
    const trailer = {};
    if (has("trailer-60.mp4")) trailer.file = url("trailer-60.mp4");
    const rt = formatRuntime(p.trailer?.runtimeSec) || existing.trailer?.runtime;
    if (rt) trailer.runtime = rt;
    if (has("trailer.jpg")) trailer.poster = url("trailer.jpg");
    if (existing.trailer?.youtubeId) trailer.youtubeId = existing.trailer.youtubeId;
    series.trailer = trailer;
  }

  series.episodes = episodes;
  if (p.compilation?.youtubeId) series.compilation = p.compilation;
  const playlistId = p.playlistId || existing.playlistId;
  if (playlistId) series.playlistId = playlistId;

  const characters = p.characters || {};
  const charList = Object.entries(characters).map(([id, c]) => ({ id, ...c }));
  const existingById = new Map((existing.cast || []).map((c) => [c.id, c]));
  series.cast = pickCastIds(existing.cast, charList).map((id) => {
    const ex = existingById.get(id) || {};
    const member = { id, name: ex.name || characters[id]?.name || id };
    if (ex.role) member.role = ex.role;
    if (has(`cast/${id}.jpg`)) member.portrait = url(`cast/${id}.jpg`);
    return member;
  });

  if (existing.extras) series.extras = existing.extras;
  if (existing.production && status === "in-production") series.production = existing.production;

  series.createdAt = existing.createdAt || createdAt;
  series.publishAt = episodes.length ? episodes.map((e) => e.publishAt).sort()[0] : createdIso;

  return stripUndefined(series);
}

/** Carry an in-production entry (no ledger yet) forward, refreshing only what exists on disk. */
export function carryInProduction(existing, assets = new Set()) {
  const slug = existing.slug;
  const url = (rel) => `/movies/${slug}/${rel}`;
  const out = { ...existing, status: "in-production", episodes: [], cast: existing.cast || [] };
  out.poster = existing.poster || url("poster.jpg");
  if (assets.has("glow.jpg")) out.glow = url("glow.jpg"); else delete out.glow;
  if (assets.has("backdrop.jpg")) out.backdrop = url("backdrop.jpg"); else delete out.backdrop;
  return orderKeys(out);
}

const KEY_ORDER = [
  "id", "section", "kind", "slug", "title", "subtitle", "author", "year", "status", "aspect",
  "synopsis", "poster", "backdrop", "glow", "accent", "trailer", "playlistId", "compilation", "episodes", "cast", "extras",
  "production", "createdAt", "publishAt",
];

export function orderKeys(obj) {
  const out = {};
  for (const k of KEY_ORDER) if (obj[k] !== undefined) out[k] = obj[k];
  for (const k of Object.keys(obj)) if (!(k in out) && obj[k] !== undefined) out[k] = obj[k];
  return out;
}

export function stripUndefined(obj) {
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = stripUndefined(v);
    return out;
  }
  return obj;
}

/** Overlay the editorial fields of `existing` onto the freshly generated Series. */
export function mergeCurated(existing, generated) {
  if (!existing) return orderKeys(generated);
  const out = { ...generated };
  for (const k of CURATED_KEYS) if (existing[k] !== undefined) out[k] = existing[k];
  if (out.status !== "in-production") delete out.production;
  if (existing.title) out.title = existing.title;
  if (existing.createdAt) out.createdAt = existing.createdAt;
  if (existing.cast?.length) {
    // The editorial cast list owns which ids appear and in what order; the ledger adds portraits.
    const genById = new Map((out.cast || []).map((c) => [c.id, c]));
    out.cast = existing.cast.map((ex) => {
      const g = genById.get(ex.id) || {};
      const member = { id: ex.id, name: ex.name || g.name || ex.id };
      if (ex.role) member.role = ex.role;
      if (g.portrait) member.portrait = g.portrait;
      return member;
    });
  }
  return orderKeys(out);
}

/** Pretty JSON: 2-space indent, but leaf objects (episodes, cast, trailer, production) on one line. */
export function formatSeriesJson(list) {
  const isLeaf = (v) => v && typeof v === "object" && !Array.isArray(v) &&
    Object.values(v).every((x) => x === null || typeof x !== "object");
  const fmt = (v, ind) => {
    const pad = "  ".repeat(ind);
    const padIn = "  ".repeat(ind + 1);
    if (Array.isArray(v)) {
      if (!v.length) return "[]";
      return `[\n${v.map((x) => padIn + fmt(x, ind + 1)).join(",\n")}\n${pad}]`;
    }
    if (v && typeof v === "object") {
      const entries = Object.entries(v).filter(([, x]) => x !== undefined);
      if (!entries.length) return "{}";
      if (isLeaf(v)) return `{ ${entries.map(([k, x]) => `${JSON.stringify(k)}: ${JSON.stringify(x)}`).join(", ")} }`;
      return `{\n${entries.map(([k, x]) => `${padIn}${JSON.stringify(k)}: ${fmt(x, ind + 1)}`).join(",\n")}\n${pad}}`;
    }
    return JSON.stringify(v);
  };
  return fmt(list, 0) + "\n";
}

/** Summary rows -> aligned text table. rows = [{ file, bytes, status }] */
export function formatTable(rows) {
  const fmtBytes = (b) => (b == null ? "-" : b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
  const r = rows.map((x) => [x.file, fmtBytes(x.bytes), x.status]);
  const w = [0, 0, 0].map((_, i) => Math.max(...r.map((c) => c[i].length), 0));
  return r.map((c) => `${c[0].padEnd(w[0])}  ${c[1].padStart(w[1])}  ${c[2]}`).join("\n");
}

// ---------------------------------------------------------------------------------------------
// IO helpers
// ---------------------------------------------------------------------------------------------

const exists = (p) => { try { fs.accessSync(p); return true; } catch { return false; } };
const mtime = (p) => { try { return fs.statSync(p).mtimeMs; } catch { return -Infinity; } };
const size = (p) => { try { return fs.statSync(p).size; } catch { return undefined; } };
const readJson = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; } };

function upToDate(out, inputs, force) {
  if (force || !exists(out)) return false;
  const o = mtime(out);
  return inputs.every((i) => mtime(i) <= o);
}

function sha256Prefix(file, len = 8) {
  const h = crypto.createHash("sha256");
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(4 * 1024 * 1024);
    let n;
    while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
  } finally { fs.closeSync(fd); }
  return h.digest("hex").slice(0, len);
}

function resolveTools(opts) {
  const candidates = [opts.ffmpeg, process.env.FFMPEG, "C:/Users/vishn/bin/ffmpeg.exe", "ffmpeg"].filter(Boolean);
  let ffmpeg;
  for (const c of candidates) {
    const r = spawnSync(c, ["-version"], { encoding: "utf8" });
    if (!r.error && r.status === 0) { ffmpeg = c; break; }
  }
  if (!ffmpeg) throw new Error("ffmpeg not found (pass --ffmpeg <path> or set FFMPEG)");
  const probeCandidates = [opts.ffprobe, process.env.FFPROBE, path.join(path.dirname(ffmpeg), "ffprobe.exe"), path.join(path.dirname(ffmpeg), "ffprobe"), "ffprobe"].filter(Boolean);
  let ffprobe;
  for (const c of probeCandidates) {
    const r = spawnSync(c, ["-version"], { encoding: "utf8" });
    if (!r.error && r.status === 0) { ffprobe = c; break; }
  }
  return { ffmpeg, ffprobe };
}

function probe(tools, file) {
  if (tools.ffprobe) {
    const r = spawnSync(tools.ffprobe, ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file], { encoding: "utf8" });
    if (r.status === 0) return parseFfprobeJson(r.stdout);
  }
  const r = spawnSync(tools.ffmpeg, ["-hide_banner", "-i", file], { encoding: "utf8" });
  return parseFfmpegInfo(r.stderr);
}

function ffmpeg(tools, args) {
  const r = spawnSync(tools.ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg failed (${args.join(" ")}):\n${r.stderr}`);
}

/**
 * Masters are 0.2–0.9 GB each on the studio's spinning disk; hashing them on every run starves
 * renders. A file's prefix is cached by (path, size, mtime) — any rewrite changes the key.
 */
export function hashCacheKey(file, st) {
  return `${path.resolve(file)}|${st.size}|${Math.round(st.mtimeMs)}`;
}
const hashCache = { file: undefined, data: {}, dirty: false };
function loadHashCache(file) {
  hashCache.file = file;
  hashCache.data = readJson(file, {});
}
function saveHashCache() {
  if (!hashCache.dirty || !hashCache.file) return;
  fs.mkdirSync(path.dirname(hashCache.file), { recursive: true });
  fs.writeFileSync(hashCache.file, JSON.stringify(hashCache.data), "utf8");
}
function cachedSha256Prefix(file, len) {
  const key = hashCacheKey(file, fs.statSync(file));
  if (!hashCache.data[key]) { hashCache.data[key] = sha256Prefix(file, 16); hashCache.dirty = true; }
  return hashCache.data[key].slice(0, len);
}

function findPublishedCut(cutDir, sha8) {
  if (!exists(cutDir)) return undefined;
  const entries = fs.readdirSync(cutDir).map((name) => ({ name, mtimeMs: mtime(path.join(cutDir, name)) }));
  const candidates = selectMasterCandidates(entries);
  if (!candidates.length) return undefined;
  if (sha8) {
    for (const name of candidates) {
      if (cachedSha256Prefix(path.join(cutDir, name), sha8.length) === sha8) return { file: path.join(cutDir, name), matched: true };
    }
  }
  return { file: path.join(cutDir, candidates[0]), matched: false };
}

function listAssets(dir) {
  const set = new Set();
  if (!exists(dir)) return set;
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(d, e.name), r); else set.add(r);
    }
  };
  walk(dir, "");
  return set;
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------

export async function main(argv = process.argv.slice(2)) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const appDir = path.resolve(here, "..");
  const opts = parseArgs(argv, {
    library: process.env.VR_STUDIO_LIBRARY || path.resolve(appDir, "..", "..", "..", "visurena_studio", "library"),
    out: path.resolve(appDir, "..", "..", "content-local", "series.json"),
    public: path.resolve(appDir, "public", "movies"),
  });
  if (opts.help) {
    console.log("node scripts/ingest-studio.mjs [--library <dir>] [--out <series.json>] [--public <dir>] [--ffmpeg <exe>] [--ffprobe <exe>] [--force] [--dry-run]");
    return 0;
  }
  if (!exists(opts.library)) throw new Error(`Library not found: ${opts.library}`);

  const tools = resolveTools(opts);
  console.log(`library : ${opts.library}\nout     : ${opts.out}\npublic  : ${opts.public}\nffmpeg  : ${tools.ffmpeg}\nffprobe : ${tools.ffprobe || "(none — parsing `ffmpeg -i`)"}\n`);

  loadHashCache(path.resolve(appDir, "node_modules", ".cache", "ingest-studio", "sha256.json"));
  const existingList = readJson(opts.out, []);
  const existingBySlug = new Map(existingList.map((s) => [s.slug, s]));
  const rows = [];
  const notes = [];
  const record = (file, status) => rows.push({ file: path.relative(opts.public, file).replace(/\\/g, "/"), bytes: size(file), status });

  /** Run one ffmpeg job unless the output is fresh. */
  const job = (out, inputs, args, label) => {
    if (upToDate(out, inputs, opts.force)) { record(out, "up-to-date"); return; }
    if (opts.dryRun) { record(out, `would write (${label})`); return; }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    ffmpeg(tools, args(out));
    record(out, `written (${label})`);
  };

  const result = [];
  const folders = fs.readdirSync(opts.library, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{14}_/.test(e.name))
    .map((e) => e.name)
    .sort();

  let skipped = 0;
  for (const folderName of folders) {
    const dir = path.join(opts.library, folderName);
    const slug = normaliseSlug(folderName);
    const existing = existingBySlug.get(slug);
    const progressFile = path.join(dir, "SERIES_PROGRESS.json");
    const pubDir = path.join(opts.public, slug);

    const uploadsFile = path.join(dir, "uploads.jsonl");
    const uploadsText = exists(uploadsFile) ? fs.readFileSync(uploadsFile, "utf8") : "";
    const ledgerRows = parseJsonl(uploadsText);
    const live = liveEpisodesFromUploads(ledgerRows);
    const hasProgress = exists(progressFile);

    if (!hasProgress && !live.size) {
      if (existing) {
        result.push(carryInProduction(existing, listAssets(pubDir)));
        console.log(`${slug}: no SERIES_PROGRESS.json and no public upload — carried forward as in-production`);
      } else skipped++;
      continue;
    }

    // SERIES_PROGRESS.json stays the truth where it exists (Scarlet); every later book is read
    // from its upload ledger alone.
    const progress = hasProgress ? readJson(progressFile, { episodes: [] }) : progressFromUploads(live);
    const uploads = hasProgress ? parseUploads(uploadsText) : live;
    const book = readJson(path.join(dir, "source", "book.json"), undefined);
    const compilation = compilationFromUploads(ledgerRows);
    const readText = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return undefined; } };
    const playlistId = findPlaylistId(ledgerRows, [
      readText(path.join(dir, "compilation", "youtube.json")),
      readText(path.join(dir, "episodes", "ep01", "youtube.json")),
    ]);
    for (const [ep, v] of live) {
      if (v.duplicates) notes.push(`${slug} ep${pad2(ep)}: ${v.duplicates.length + 1} public uploads — the site uses ${v.videoId}; consider unlisting ${v.duplicates.join(", ")}`);
    }
    console.log(`${slug}: ${progress.episodes?.length || 0} chapters, ${live.size} public on YouTube (${hasProgress ? "SERIES_PROGRESS.json" : "uploads.jsonl"})${compilation ? ", compilation " + compilation.youtubeId : ""}${playlistId ? ", playlist " + playlistId : ""}`);

    // Characters (for names / fallback cast selection)
    const characters = {};
    const castDir = path.join(dir, "cast");
    if (exists(castDir)) {
      for (const id of fs.readdirSync(castDir)) {
        const c = readJson(path.join(castDir, id, "character.json"), undefined);
        if (c) characters[id] = { name: c.name, appearances: c.appearances };
      }
    }

    // --- Episode stills + runtimes ---------------------------------------------------------
    const runtimes = {};
    const frames = {};
    const published = [...(progress.episodes || [])]
      .sort((a, b) => (a.chapter || 0) - (b.chapter || 0))
      .filter((e) => e.state === "published" && e.video_id);
    published.forEach((le, i) => {
      const n = i + 1;
      const cutDir = path.join(dir, "episodes", `ep${pad2(le.chapter)}`, "cut");
      const cut = findPublishedCut(cutDir, uploads.get(le.chapter)?.sha8);
      if (!cut) { notes.push(`${slug} ep${pad2(n)}: no master*.mp4 in ${cutDir}`); return; }
      const info = probe(tools, cut.file);
      if (info.durationSec) runtimes[le.chapter] = info.durationSec;
      if (info.width && info.height) frames[le.chapter] = { width: info.width, height: info.height };
      const still = path.join(pubDir, `${stillName(n)}.jpg`);
      const label = `${path.basename(cut.file)}${cut.matched ? "" : " (sha8 not matched)"} ${info.width}x${info.height} ${classifyAspect(info.width, info.height)} ${formatRuntime(info.durationSec)} → ${stillSize(info.width, info.height).join("x")}`;
      if (!info.durationSec) { notes.push(`${slug} ep${pad2(n)}: could not probe ${cut.file}`); return; }
      const at = (info.durationSec * STILL_AT_FRACTION).toFixed(2);
      job(still, [cut.file], (out) => ["-ss", at, "-i", cut.file, "-frames:v", "1", "-vf", stillFilter(info.width, info.height), "-q:v", String(JPEG_Q), out], label);
    });

    // --- Poster + glow -----------------------------------------------------------------------
    const titlePng = path.join(dir, "title", "ep01.png");
    const poster = path.join(pubDir, "poster.jpg");
    if (exists(titlePng)) {
      const info = probe(tools, titlePng);
      const pf = posterFilter(info.width, info.height);
      const filterArgs = pf.vf ? ["-vf", pf.vf] : ["-filter_complex", pf.filterComplex];
      job(poster, [titlePng], (out) => ["-i", titlePng, ...filterArgs, "-frames:v", "1", "-q:v", String(JPEG_Q), out], `title/ep01.png ${info.width}x${info.height}${pf.vf ? "" : " (fitted over blur)"}`);
    } else notes.push(`${slug}: no title/ep01.png — poster not written (UI falls back to the typeset card)`);
    if (exists(poster)) {
      job(path.join(pubDir, "glow.jpg"), [poster], (out) => ["-i", poster, "-vf", `scale=${GLOW_SIZE[0]}:${GLOW_SIZE[1]}`, "-q:v", "5", out], "from poster.jpg");
    }

    // --- Trailer -----------------------------------------------------------------------------
    let trailerInfo;
    const trailerDir = path.join(dir, "trailer", "main");
    const trailerSrc = exists(trailerDir) ? fs.readdirSync(trailerDir).filter((f) => /^TRAILER60-.*\.mp4$/i.test(f)).map((f) => path.join(trailerDir, f))[0] : undefined;
    if (trailerSrc) {
      const info = probe(tools, trailerSrc);
      trailerInfo = { runtimeSec: info.durationSec };
      job(path.join(pubDir, "trailer.jpg"), [trailerSrc], (out) => ["-ss", String(TRAILER_FRAME_AT), "-i", trailerSrc, "-frames:v", "1", "-vf", fitFilter(info.width, info.height, ...TRAILER_STILL_SIZE), "-q:v", String(JPEG_Q), out], `${path.basename(trailerSrc)} @${TRAILER_FRAME_AT}s`);
      const bytes = size(trailerSrc);
      const trailerOut = path.join(pubDir, "trailer-60.mp4");
      if (bytes <= TRAILER_MAX_BYTES) {
        if (upToDate(trailerOut, [trailerSrc], opts.force)) record(trailerOut, "up-to-date");
        else if (opts.dryRun) record(trailerOut, "would copy");
        else { fs.mkdirSync(pubDir, { recursive: true }); fs.copyFileSync(trailerSrc, trailerOut); record(trailerOut, `copied (${(bytes / 1024 / 1024).toFixed(1)} MB)`); }
      } else notes.push(`${slug}: trailer-60.mp4 skipped — ${(bytes / 1024 / 1024).toFixed(1)} MB exceeds ${TRAILER_MAX_BYTES / 1024 / 1024} MB`);
    }

    // --- Cast portraits ----------------------------------------------------------------------
    const castIds = pickCastIds(existing?.cast, Object.entries(characters).map(([id, c]) => ({ id, ...c })));
    for (const id of castIds) {
      const src = path.join(castDir, id, "portrait.png");
      if (!exists(src)) { notes.push(`${slug}: cast/${id}/portrait.png missing`); continue; }
      const info = probe(tools, src);
      job(path.join(pubDir, "cast", `${id}.jpg`), [src], (out) => ["-i", src, "-vf", fitFilter(info.width, info.height, ...CAST_SIZE), "-q:v", String(JPEG_Q), out], `${info.width}x${info.height}`);
    }

    // --- Series object ------------------------------------------------------------------------
    const generated = buildSeries({
      folderName, progress, uploads, book, existing, characters,
      assets: listAssets(pubDir), runtimes, frames, trailer: trailerInfo, compilation, playlistId,
    });
    result.push(mergeCurated(existing, generated));
  }

  // Keep the order of the existing file for known slugs; new slugs go last, newest first.
  const rank = (s) => { const i = existingList.findIndex((e) => e.slug === s.slug); return i < 0 ? Number.MAX_SAFE_INTEGER : i; };
  result.sort((a, b) => rank(a) - rank(b) || String(b.publishAt).localeCompare(String(a.publishAt)));

  saveHashCache();
  if (!opts.dryRun) {
    fs.mkdirSync(path.dirname(opts.out), { recursive: true });
    fs.writeFileSync(opts.out, formatSeriesJson(result), "utf8");
  }

  console.log(`\n${formatTable(rows)}\n`);
  console.log(`series  : ${result.map((s) => `${s.slug} (${s.status}, ${s.episodes.length} ep)`).join(", ")}`);
  console.log(`skipped : ${skipped} book folder(s) without SERIES_PROGRESS.json and not listed in series.json`);
  console.log(`${opts.dryRun ? "would write" : "wrote"}   : ${opts.out} (${size(opts.out) ?? 0} bytes)`);
  if (notes.length) console.log(`\nnotes:\n${notes.map((n) => `  - ${n}`).join("\n")}`);
  return 0;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().then((code) => process.exit(code)).catch((err) => { console.error(err.message || err); process.exit(1); });
}
