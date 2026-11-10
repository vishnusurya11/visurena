// apps/web/scripts/ingest-studio.test.mjs
// Unit tests for the pure transforms in ingest-studio.mjs. No ffmpeg, no filesystem.
import { describe, it, expect } from "vitest";
import {
  parseArgs, normaliseSlug, stampToDates, toIso, parseUploadKey, parseUploads, deriveStatus,
  formatRuntime, parseFfmpegInfo, parseFfprobeJson, fitFilter, selectMasterCandidates,
  episodeSlug, stillName, splitBookTitle, pickCastIds, buildSeries, carryInProduction,
  mergeCurated, orderKeys, stripUndefined, formatSeriesJson, formatTable,
  classifyAspect, majorityAspect, stillSize, stillFilter,
  parseJsonl, deletedIds, liveEpisodesFromUploads, parseEpisodeTitle, progressFromUploads,
  compilationFromUploads, findPlaylistId, hashCacheKey, posterFilter,
  TRAILER_STILL_SIZE, POSTER_SIZE, CAST_SIZE, TRAILER_MAX_BYTES, STILL_MAX_SIDE,
} from "./ingest-studio.mjs";

// ---------------------------------------------------------------------------------------------
// Fixtures — a 3-chapter ledger shaped like the real visurena_studio files
// ---------------------------------------------------------------------------------------------

const FOLDER = "20260822113400_a-study-in-scarlet";

const PROGRESS = {
  goal: "x",
  episodes: [
    { chapter: 1, title: "A Mr. Sherlock Holmes", state: "published", video_id: "-K2ucdt_mCg", steps_done: ["publish"] },
    { chapter: 2, title: "The Science of Deduction", state: "published", video_id: "P8i7niWhEWo" },
    { chapter: 3, title: "The Lauriston Garden Mystery", state: "published", video_id: "Pkr4HudmQPo" },
  ],
};

const UPLOADS = [
  { key: `${FOLDER}/ep01/dd06d33c`, episode: 1, video_id: "-K2ucdt_mCg", privacy: "public", title: "\"You Have Been in Afghanistan\" — Ep.1", sha8: "dd06d33c", at: "2026-09-12T20:47:02" },
  { key: `${FOLDER}/ep02/f89b2d96`, episode: 2, video_id: "P8i7niWhEWo", privacy: "public", title: "Ep.2", sha8: "f89b2d96", at: "2026-09-13T09:00:01" },
  { key: `${FOLDER}/ep01/dd06d33c#retitle`, episode: 1, video_id: "-K2ucdt_mCg", title: "Sherlock Holmes: A Study in Scarlet — Ep 01/14", at: "2026-09-14T18:36:38" },
  { key: `${FOLDER}/ep03/aed8fe54`, episode: 3, video_id: "Pkr4HudmQPo", waived: null, privacy: "public", title: "Ep.3", sha8: "aed8fe54", at: "2026-09-14T22:40:40" },
].map((r) => JSON.stringify(r)).join("\n") + "\n";

const EXISTING = {
  id: "mov_a-study-in-scarlet", section: "movies", kind: "series", slug: "a-study-in-scarlet",
  title: "A Study in Scarlet", subtitle: "Sherlock Holmes", author: "Arthur Conan Doyle", year: "1887",
  status: "complete", aspect: "9:16", synopsis: "A wounded army doctor…",
  poster: "/movies/a-study-in-scarlet/poster.jpg", accent: "#3DD68C",
  trailer: { file: "/movies/a-study-in-scarlet/trailer-60.mp4", runtime: "1:00", poster: "/movies/a-study-in-scarlet/trailer.jpg" },
  episodes: [{ n: 1, slug: "ep-01", title: "OLD TITLE", youtubeId: "old", publishAt: "2000-01-01T00:00:00Z" }],
  cast: [
    { id: "sherlock_holmes", name: "Sherlock Holmes", role: "Consulting detective" },
    { id: "john_watson", name: "Dr. John Watson", role: "Narrator" },
  ],
  extras: { audiobook: { runtime: "4 h 51 min", chapters: 14 }, casebook: true },
  createdAt: "2026-08-22", publishAt: "2026-09-14T18:36:38Z",
};

const CHARACTERS = {
  sherlock_holmes: { name: "Sherlock Holmes", appearances: 34 },
  john_watson: { name: "John Watson", appearances: 40 },
  g_lestrade: { name: "Lestrade", appearances: 9 },
  group_mormons: { name: "Mormons", appearances: 50 },
  unnamed_constable: { name: "Constable", appearances: 3 },
};

const ASSETS = new Set(["ep01.jpg", "ep02.jpg", "poster.jpg", "glow.jpg", "backdrop.jpg", "trailer.jpg", "trailer-60.mp4", "cast/sherlock_holmes.jpg"]);

// ---------------------------------------------------------------------------------------------

describe("parseArgs", () => {
  it("reads flags and keeps defaults", () => {
    const o = parseArgs(["--library", "L", "--out", "O", "--public", "P", "--ffmpeg", "F", "--force", "--dry-run"], { out: "default" });
    expect(o).toMatchObject({ library: "L", out: "O", public: "P", ffmpeg: "F", force: true, dryRun: true });
  });
  it("rejects unknown flags", () => {
    expect(() => parseArgs(["--nope"])).toThrow(/Unknown argument/);
  });
});

describe("normaliseSlug", () => {
  it("strips the stamp and a subtitle after -or-", () => {
    expect(normaliseSlug("20260822113400_a-study-in-scarlet")).toBe("a-study-in-scarlet");
    expect(normaliseSlug("20260825235949_frankenstein-or-the-modern-prometheus")).toBe("frankenstein");
    expect(normaliseSlug("20260825235954_moby-dick-or-the-whale")).toBe("moby-dick");
  });
  it("leaves slugs without a subtitle or stamp alone", () => {
    expect(normaliseSlug("20260827135559_alice-s-adventures-in-wonderland")).toBe("alice-s-adventures-in-wonderland");
    expect(normaliseSlug("dracula")).toBe("dracula");
  });
});

describe("stampToDates", () => {
  it("derives createdAt and an ISO instant from the folder stamp", () => {
    expect(stampToDates("20260825235949_frankenstein")).toEqual({ createdAt: "2026-08-25", createdIso: "2026-08-25T23:59:49Z" });
  });
  it("returns undefined without a stamp", () => {
    expect(stampToDates("frankenstein")).toEqual({ createdAt: undefined, createdIso: undefined });
  });
});

describe("toIso", () => {
  it("appends Z to naive timestamps and keeps zoned ones", () => {
    expect(toIso("2026-09-14T18:36:38")).toBe("2026-09-14T18:36:38Z");
    expect(toIso("2026-09-14 18:36:38")).toBe("2026-09-14T18:36:38Z");
    expect(toIso("2026-09-14T18:36:38Z")).toBe("2026-09-14T18:36:38Z");
    expect(toIso("2026-09-14T18:36:38+02:00")).toBe("2026-09-14T18:36:38+02:00");
    expect(toIso(undefined)).toBeUndefined();
  });
  it("reads a bare date as midnight UTC (the #public rows carry only a date)", () => {
    expect(toIso("2026-09-19")).toBe("2026-09-19T00:00:00Z");
  });
});

describe("parseUploadKey", () => {
  it("extracts the sha8 and the event", () => {
    expect(parseUploadKey(`${FOLDER}/ep01/dd06d33c#retitle`)).toEqual({ sha8: "dd06d33c", event: "retitle" });
    expect(parseUploadKey(`${FOLDER}/ep06/AED8FE54`)).toEqual({ sha8: "aed8fe54", event: "upload" });
    expect(parseUploadKey(undefined)).toEqual({ sha8: undefined, event: "upload" });
  });
});

describe("parseUploads", () => {
  const map = parseUploads(UPLOADS);
  it("keeps one entry per episode", () => {
    expect([...map.keys()].sort()).toEqual([1, 2, 3]);
  });
  it("takes title/at from the latest row but publishedAt from the first upload", () => {
    const ep1 = map.get(1);
    expect(ep1.title).toMatch(/Ep 01\/14/);
    expect(ep1.at).toBe("2026-09-14T18:36:38Z");
    expect(ep1.publishedAt).toBe("2026-09-12T20:47:02Z");
    expect(ep1.videoId).toBe("-K2ucdt_mCg");
  });
  it("carries sha8 through retitle rows that lack it", () => {
    expect(map.get(1).sha8).toBe("dd06d33c");
    expect(map.get(3).sha8).toBe("aed8fe54");
  });
  it("ignores blank and malformed lines", () => {
    const m = parseUploads("\n{not json}\n" + JSON.stringify({ episode: 9, video_id: "x", at: "2026-01-01T00:00:00" }) + "\n");
    expect(m.size).toBe(1);
    expect(m.get(9).publishedAt).toBe("2026-01-01T00:00:00Z");
  });
});

describe("deriveStatus", () => {
  it("complete when every chapter is published", () => {
    expect(deriveStatus(PROGRESS.episodes)).toBe("complete");
  });
  it("airing when some are published", () => {
    expect(deriveStatus([...PROGRESS.episodes, { chapter: 4, state: "takes" }])).toBe("airing");
  });
  it("in-production when none are published, or no ledger", () => {
    expect(deriveStatus([{ chapter: 1, state: "plan" }])).toBe("in-production");
    expect(deriveStatus([])).toBe("in-production");
    expect(deriveStatus(undefined)).toBe("in-production");
  });
  it("does not count a published state without a video id", () => {
    expect(deriveStatus([{ chapter: 1, state: "published" }])).toBe("in-production");
  });
});

describe("formatRuntime", () => {
  it("formats m:ss, rounding to the nearest second", () => {
    expect(formatRuntime(173.93)).toBe("2:54");
    expect(formatRuntime(53.5)).toBe("0:54");
    expect(formatRuntime(0)).toBe("0:00");
    expect(formatRuntime(600)).toBe("10:00");
  });
  it("formats h:mm:ss past an hour", () => {
    expect(formatRuntime(3725)).toBe("1:02:05");
  });
  it("returns undefined for invalid input", () => {
    expect(formatRuntime(NaN)).toBeUndefined();
    expect(formatRuntime(undefined)).toBeUndefined();
    expect(formatRuntime(-1)).toBeUndefined();
  });
});

describe("parseFfmpegInfo", () => {
  const banner = [
    "Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'master.mp4':",
    "  Duration: 00:02:53.93, start: 0.000000, bitrate: 2932 kb/s",
    "  Stream #0:0[0x1](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709/bt709/iec61966-2-1, progressive), 768x1344, 2669 kb/s, 23.99 fps, 24 tbr, 12288 tbn (default)",
    "  Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 258 kb/s (default)",
  ].join("\n");
  it("reads duration and the video frame size, not the codec tag", () => {
    expect(parseFfmpegInfo(banner)).toEqual({ durationSec: 173.93, width: 768, height: 1344 });
  });
  it("reads a PNG banner with no duration", () => {
    const png = "  Duration: N/A, bitrate: N/A\n  Stream #0:0: Video: png, rgb24(pc, gbr/unknown/unknown), 1368x768, 25 fps, 25 tbr, 25 tbn";
    expect(parseFfmpegInfo(png)).toEqual({ durationSec: undefined, width: 1368, height: 768 });
  });
  it("reads a size followed by SAR", () => {
    const s = "  Stream #0:0: Video: h264, yuv420p, 1920x1080 [SAR 1:1 DAR 16:9], 24 fps";
    expect(parseFfmpegInfo(s)).toMatchObject({ width: 1920, height: 1080 });
  });
  it("is empty on garbage", () => {
    expect(parseFfmpegInfo("")).toEqual({ durationSec: undefined, width: undefined, height: undefined });
  });
});

describe("parseFfprobeJson", () => {
  it("reads the video stream and format duration", () => {
    const j = JSON.stringify({ streams: [{ codec_type: "audio" }, { codec_type: "video", width: 768, height: 768 }], format: { duration: "161.3" } });
    expect(parseFfprobeJson(j)).toEqual({ durationSec: 161.3, width: 768, height: 768 });
  });
  it("tolerates bad json", () => {
    expect(parseFfprobeJson("nope")).toEqual({});
  });
});

describe("classifyAspect", () => {
  it("classifies by width/height ratio: <0.8 portrait, 0.8–1.25 square, else landscape", () => {
    expect(classifyAspect(768, 1344)).toBe("9:16");
    expect(classifyAspect(1080, 1920)).toBe("9:16");
    expect(classifyAspect(768, 768)).toBe("1:1");
    expect(classifyAspect(1536, 1536)).toBe("1:1");
    expect(classifyAspect(1000, 800)).toBe("1:1");   // 1.25 inclusive
    expect(classifyAspect(800, 1000)).toBe("1:1");   // 0.8 inclusive
    expect(classifyAspect(799, 1000)).toBe("9:16");
    expect(classifyAspect(1920, 1080)).toBe("16:9");
    expect(classifyAspect(1260, 1000)).toBe("16:9");
  });
  it("is undefined without a frame size", () => {
    expect(classifyAspect(undefined, undefined)).toBeUndefined();
    expect(classifyAspect(0, 100)).toBeUndefined();
  });
});

describe("majorityAspect", () => {
  it("returns the most common episode aspect, first seen wins a tie", () => {
    expect(majorityAspect([{ aspect: "9:16" }, { aspect: "1:1" }, { aspect: "1:1" }])).toBe("1:1");
    expect(majorityAspect([{ aspect: "9:16" }, { aspect: "1:1" }])).toBe("9:16");
    expect(majorityAspect([{ aspect: "16:9" }, {}, { aspect: "16:9" }, { aspect: "1:1" }])).toBe("16:9");
  });
  it("is undefined with no measured episodes", () => {
    expect(majorityAspect([])).toBeUndefined();
    expect(majorityAspect([{ n: 1 }])).toBeUndefined();
    expect(majorityAspect(undefined)).toBeUndefined();
  });
});

describe("stillSize / stillFilter", () => {
  it("keeps the source aspect with the longest side 960", () => {
    expect(STILL_MAX_SIDE).toBe(960);
    expect(stillSize(768, 768)).toEqual([960, 960]);
    expect(stillSize(1536, 1536)).toEqual([960, 960]);
    expect(stillSize(1080, 1920)).toEqual([540, 960]);
    expect(stillSize(1920, 1080)).toEqual([960, 540]);
    expect(stillSize(768, 1344)).toEqual([548, 960]); // 4:7 studio master, even width
  });
  it("never crops", () => {
    expect(stillFilter(768, 768)).toBe("scale=960:960");
    expect(stillFilter(768, 1344)).toBe("scale=548:960");
    expect(stillFilter(1920, 1080)).toBe("scale=960:540");
  });
  it("falls back to a square without dimensions", () => {
    expect(stillSize(undefined, undefined)).toEqual([960, 960]);
  });
});

describe("fitFilter (poster, trailer poster, cast — fixed frames)", () => {
  it("only scales a source already at the target aspect", () => {
    expect(fitFilter(1080, 1920, ...TRAILER_STILL_SIZE)).toBe("scale=540:960");
    expect(fitFilter(540, 960, ...POSTER_SIZE)).toBe("scale=720:1280");
  });
  it("trims the studio 768x1344 (4:7) sources by 6 px a side instead of distorting them", () => {
    expect(fitFilter(768, 1344, ...TRAILER_STILL_SIZE)).toBe("crop=756:1344:6:0,scale=540:960");
    expect(fitFilter(768, 1344, ...POSTER_SIZE)).toBe("crop=756:1344:6:0,scale=720:1280");
  });
  it("centre-crops a square source to 9:16", () => {
    expect(fitFilter(768, 768, ...TRAILER_STILL_SIZE)).toBe("crop=432:768:168:0,scale=540:960");
  });
  it("centre-crops a 16:9 source to 9:16", () => {
    expect(fitFilter(1920, 1080, ...TRAILER_STILL_SIZE)).toBe("crop=608:1080:656:0,scale=540:960");
  });
  it("centre-crops a landscape portrait to 3:4", () => {
    expect(fitFilter(1368, 768, ...CAST_SIZE)).toBe("crop=576:768:396:0,scale=480:640");
  });
  it("crops height when the source is taller than the target", () => {
    expect(fitFilter(600, 1200, ...TRAILER_STILL_SIZE)).toBe("crop=600:1067:0:66,scale=540:960");
  });
  it("falls back to scale without dimensions", () => {
    expect(fitFilter(undefined, undefined, ...TRAILER_STILL_SIZE)).toBe("scale=540:960");
  });
});

describe("selectMasterCandidates", () => {
  it("puts master.mp4 first, then the newest master_* files, ignoring previews", () => {
    const names = selectMasterCandidates([
      { name: "master_iter1.mp4", mtimeMs: 10 },
      { name: "preview_iter2.mp4", mtimeMs: 99 },
      { name: "master_r2v.mp4", mtimeMs: 30 },
      { name: "master.mp4", mtimeMs: 5 },
      { name: "master_iter3.mp4", mtimeMs: 30 },
      { name: "master_withends.mp4", mtimeMs: 20 },
      { name: "notes.txt", mtimeMs: 100 },
    ]);
    expect(names).toEqual(["master.mp4", "master_iter3.mp4", "master_r2v.mp4", "master_withends.mp4", "master_iter1.mp4"]);
  });
  it("is empty without candidates", () => {
    expect(selectMasterCandidates([{ name: "preview_iter1.mp4", mtimeMs: 1 }])).toEqual([]);
    expect(selectMasterCandidates(undefined)).toEqual([]);
  });
});

describe("naming helpers", () => {
  it("pads episode numbers", () => {
    expect(episodeSlug(4)).toBe("ep-04");
    expect(episodeSlug(14)).toBe("ep-14");
    expect(stillName(1)).toBe("ep01");
  });
});

describe("splitBookTitle", () => {
  it("splits title; subtitle and title-cases the subtitle", () => {
    expect(splitBookTitle("Frankenstein; or, the modern prometheus")).toEqual({ title: "Frankenstein", subtitle: "or, the Modern Prometheus" });
  });
  it("returns the whole string as title when there is no semicolon", () => {
    expect(splitBookTitle("A Study in Scarlet")).toEqual({ title: "A Study in Scarlet", subtitle: undefined });
  });
});

describe("pickCastIds", () => {
  it("prefers the editorial list from the existing entry", () => {
    expect(pickCastIds(EXISTING.cast, [])).toEqual(["sherlock_holmes", "john_watson"]);
  });
  it("otherwise takes the most-seen named characters, skipping groups and unnamed", () => {
    const chars = Object.entries(CHARACTERS).map(([id, c]) => ({ id, ...c }));
    expect(pickCastIds([], chars, 2)).toEqual(["john_watson", "sherlock_holmes"]);
    expect(pickCastIds(undefined, chars)).toEqual(["john_watson", "sherlock_holmes", "g_lestrade"]);
  });
});

describe("buildSeries", () => {
  const uploads = parseUploads(UPLOADS);
  const series = buildSeries({
    folderName: FOLDER, progress: PROGRESS, uploads, book: { title: "A Study in Scarlet", author: "Arthur Conan Doyle" },
    existing: EXISTING, characters: CHARACTERS, assets: ASSETS,
    runtimes: { 1: 173.93, 2: 161.3 }, trailer: { runtimeSec: 53.5 },
    frames: { 1: { width: 768, height: 1344 }, 2: { width: 768, height: 768 }, 3: { width: 1536, height: 1536 } },
  });

  it("keeps the identity fields and the slug", () => {
    expect(series).toMatchObject({ id: "mov_a-study-in-scarlet", section: "movies", kind: "series", slug: "a-study-in-scarlet" });
  });
  it("writes a measured aspect per episode and the majority on the series", () => {
    expect(series.episodes.map((e) => e.aspect)).toEqual(["9:16", "1:1", "1:1"]);
    expect(series.aspect).toBe("1:1");
    const unmeasured = buildSeries({ folderName: FOLDER, progress: PROGRESS, uploads, existing: EXISTING });
    expect(unmeasured.episodes.every((e) => e.aspect === undefined)).toBe(true);
    expect(unmeasured.aspect).toBe("9:16"); // existing value stands in while nothing is measured
  });
  it("derives status, dates and episodes from the ledger, not the existing file", () => {
    expect(series.status).toBe("complete");
    expect(series.episodes).toHaveLength(3);
    expect(series.episodes[0]).toEqual({
      n: 1, slug: "ep-01", title: "A Mr. Sherlock Holmes", youtubeId: "-K2ucdt_mCg", runtime: "2:54", aspect: "9:16",
      publishAt: "2026-09-12T20:47:02Z", chapter: 1, still: "/movies/a-study-in-scarlet/ep01.jpg",
    });
    expect(series.episodes[2].still).toBeUndefined(); // ep03.jpg not in assets
    expect(series.episodes[2].runtime).toBeUndefined();
    expect(series.publishAt).toBe("2026-09-12T20:47:02Z");
    expect(series.createdAt).toBe("2026-08-22");
  });
  it("overlays the editorial fields from the existing entry", () => {
    expect(series).toMatchObject({ subtitle: "Sherlock Holmes", author: "Arthur Conan Doyle", year: "1887", synopsis: "A wounded army doctor…", accent: "#3DD68C" });
    expect(series.extras).toEqual(EXISTING.extras);
    expect(series.production).toBeUndefined();
  });
  it("points at the assets that exist on disk", () => {
    expect(series.poster).toBe("/movies/a-study-in-scarlet/poster.jpg");
    expect(series.glow).toBe("/movies/a-study-in-scarlet/glow.jpg");
    expect(series.backdrop).toBe("/movies/a-study-in-scarlet/backdrop.jpg");
    expect(series.trailer).toEqual({ file: "/movies/a-study-in-scarlet/trailer-60.mp4", runtime: "0:54", poster: "/movies/a-study-in-scarlet/trailer.jpg" });
  });
  it("uses the existing cast ids and roles, with portraits only where the jpg exists", () => {
    expect(series.cast).toEqual([
      { id: "sherlock_holmes", name: "Sherlock Holmes", role: "Consulting detective", portrait: "/movies/a-study-in-scarlet/cast/sherlock_holmes.jpg" },
      { id: "john_watson", name: "Dr. John Watson", role: "Narrator" },
    ]);
  });
  it("works with no existing entry (fresh book)", () => {
    const fresh = buildSeries({ folderName: "20260901000000_dracula", progress: { episodes: [{ chapter: 1, title: "Jonathan Harker's Journal", state: "published", video_id: "abc" }] }, uploads: new Map(), book: { title: "Dracula", author: "Bram Stoker" }, characters: CHARACTERS });
    expect(fresh).toMatchObject({ id: "mov_dracula", slug: "dracula", title: "Dracula", author: "Bram Stoker", status: "complete", synopsis: "", poster: "/movies/dracula/poster.jpg" });
    expect(fresh.subtitle).toBeUndefined();
    expect(fresh.glow).toBeUndefined();
    expect(fresh.trailer).toBeUndefined();
    expect(fresh.episodes[0].publishAt).toBe("2026-09-01T00:00:00Z");
    expect(fresh.cast.map((c) => c.id)).toEqual(["john_watson", "sherlock_holmes", "g_lestrade"]);
    expect(fresh.publishAt).toBe("2026-09-01T00:00:00Z");
  });
  it("marks a partly published ledger as airing and lists only published episodes", () => {
    const s = buildSeries({ folderName: FOLDER, progress: { episodes: [...PROGRESS.episodes, { chapter: 4, title: "Next", state: "takes" }] }, uploads });
    expect(s.status).toBe("airing");
    expect(s.episodes.map((e) => e.n)).toEqual([1, 2, 3]);
  });
});

describe("carryInProduction", () => {
  const existing = {
    id: "mov_frankenstein", section: "movies", kind: "series", slug: "frankenstein", title: "Frankenstein",
    status: "in-production", aspect: "9:16", synopsis: "…", poster: "/movies/frankenstein/poster.jpg", accent: "#3DD68C",
    episodes: [], cast: [], production: { script: true, cast: true, note: "Ep 1 rendering", votes: 517 },
    createdAt: "2026-08-25", publishAt: "2026-08-25T23:59:49Z",
  };
  it("keeps the entry and adds glow/backdrop when the files exist", () => {
    const out = carryInProduction(existing, new Set(["poster.jpg", "glow.jpg"]));
    expect(out).toMatchObject({ ...existing, glow: "/movies/frankenstein/glow.jpg" });
    expect(out.backdrop).toBeUndefined();
    expect(Object.keys(out).indexOf("glow")).toBe(Object.keys(out).indexOf("poster") + 1);
  });
  it("drops a stale glow when the file is gone", () => {
    const out = carryInProduction({ ...existing, glow: "/movies/frankenstein/glow.jpg" }, new Set());
    expect(out.glow).toBeUndefined();
    expect(out.production).toEqual(existing.production);
  });
});

describe("mergeCurated", () => {
  it("returns the generated entry when there is nothing to merge", () => {
    const g = { id: "x", slug: "x", episodes: [], cast: [] };
    expect(mergeCurated(undefined, g)).toEqual(g);
  });
  it("overlays editorial fields but never ledger fields", () => {
    const generated = buildSeries({ folderName: FOLDER, progress: PROGRESS, uploads: parseUploads(UPLOADS), characters: CHARACTERS, assets: ASSETS });
    const merged = mergeCurated(EXISTING, generated);
    expect(merged.subtitle).toBe("Sherlock Holmes");
    expect(merged.year).toBe("1887");
    expect(merged.extras).toEqual(EXISTING.extras);
    expect(merged.episodes).toHaveLength(3);
    expect(merged.episodes[0].title).toBe("A Mr. Sherlock Holmes");
    expect(merged.cast[0]).toMatchObject({ id: "sherlock_holmes", role: "Consulting detective" });
    expect(merged.status).toBe("complete");
    expect(merged.production).toBeUndefined();
  });
  it("keeps production only while in-production", () => {
    const merged = mergeCurated({ production: { votes: 1 } }, { status: "in-production", episodes: [], cast: [] });
    expect(merged.production).toEqual({ votes: 1 });
  });
});

describe("orderKeys / stripUndefined", () => {
  it("orders known keys canonically and appends unknown ones", () => {
    expect(Object.keys(orderKeys({ zzz: 1, slug: "s", id: "i", poster: undefined }))).toEqual(["id", "slug", "zzz"]);
  });
  it("removes undefined recursively", () => {
    expect(stripUndefined({ a: undefined, b: [{ c: undefined, d: 1 }] })).toEqual({ b: [{ d: 1 }] });
  });
});

describe("formatSeriesJson", () => {
  const list = [orderKeys(buildSeries({ folderName: FOLDER, progress: PROGRESS, uploads: parseUploads(UPLOADS), existing: EXISTING, assets: ASSETS }))];
  const text = formatSeriesJson(list);
  it("round-trips through JSON.parse", () => {
    expect(JSON.parse(text)).toEqual(list);
  });
  it("keeps each episode and cast member on one line", () => {
    const lines = text.split("\n");
    expect(lines.filter((l) => /"slug": "ep-0\d"/.test(l))).toHaveLength(3);
    expect(lines.find((l) => l.includes('"n": 1'))).toMatch(/^\s+\{ "n": 1, "slug": "ep-01", .*\},?$/);
    expect(lines.find((l) => l.includes('"id": "sherlock_holmes"'))).toMatch(/^\s+\{ "id": "sherlock_holmes"/);
    expect(text.endsWith("\n")).toBe(true);
  });
  it("prints empty arrays inline", () => {
    expect(formatSeriesJson([{ episodes: [], cast: [] }])).toBe('[\n  {\n    "episodes": [],\n    "cast": []\n  }\n]\n');
  });
});

describe("formatTable", () => {
  it("aligns columns and humanises sizes", () => {
    const t = formatTable([{ file: "a/ep01.jpg", bytes: 51200, status: "written" }, { file: "a/trailer-60.mp4", bytes: 24059530, status: "copied" }, { file: "x", bytes: undefined, status: "skipped" }]);
    const lines = t.split("\n");
    expect(lines[0]).toMatch(/^a\/ep01\.jpg\s+50 KB\s{2}written$/);
    expect(lines[1]).toMatch(/^a\/trailer-60\.mp4\s+22\.9 MB\s{2}copied$/);
    expect(lines[2]).toMatch(/^x\s+-\s{2}skipped$/);
  });
});

describe("constants", () => {
  it("caps the trailer at 25 MB", () => {
    expect(TRAILER_MAX_BYTES).toBe(26214400);
  });
});

// ─── Books without SERIES_PROGRESS.json: the upload ledger is the only record ─────────────────
// Rows copied from the shapes in library/<book>/uploads.jsonl (War of the Worlds, 2026-10).
const WOTW = "20260827135508_the-war-of-the-worlds";
const T = (n, title) => `H. G. Wells: The War of the Worlds — Ep ${String(n).padStart(2, "0")}/27 — "${title}"`;
const LEDGER = [
  { key: `${WOTW}/ep01/2ca8a6fa`, episode: 1, video_id: "VwS0kox9DSA", privacy: "private", title: T(1, "The Eve of the War"), sha8: "2ca8a6fa", at: "2026-09-19T03:43:45" },
  { key: `${WOTW}#ep01#public`, episode: 1, video_id: "VwS0kox9DSA", privacy: "public", at: "2026-09-19" },
  { at: "2026-09-30T10:37:41+00:00", episode: 14, video_id: "NJnkwmNbe_Y", event: "privacy", privacy: "public", sha8: "abf09823" },
  { at: "2026-09-30T19:42:45+00:00", episode: 14, video_id: "NJnkwmNbe_Y", event: "deleted", sha8: "abf09823" },
  { key: `${WOTW}/ep14/994ee36f`, episode: 14, video_id: "7wobwpVglJE", privacy: "private", title: T(14, "In London"), sha8: "994ee36f", at: "2026-09-30T12:43:37" },
  { at: "2026-09-30T19:43:43+00:00", episode: 14, video_id: "7wobwpVglJE", event: "privacy", privacy: "public", sha8: "994ee36f" },
  { key: `${WOTW}/ep16/0198e382`, episode: 16, video_id: "qXqY1ge1RMo", privacy: "public", title: T(16, "The Exodus from London"), sha8: "0198e382", at: "2026-10-01T23:17:51" },
  { key: `${WOTW}/ep16/3969b71b`, episode: 16, video_id: "keQliW8rWNE", privacy: "public", title: T(16, "The Exodus from London"), sha8: "3969b71b", at: "2026-10-03T15:40:38" },
  { key: `${WOTW}/ep19/3d50bb64`, episode: 19, video_id: "miyD94a5pAk", privacy: "private", title: T(19, "The Handling-Machine"), sha8: "3d50bb64", at: "2026-10-07T17:39:42" },
  { event: "shorts_poll", video_id: "miyD94a5pAk", status: 200, at: "2026-10-07T17:40:44" },
  { key: `${WOTW}/ep20/8550f5bf`, episode: 20, video_id: "MrnjXsIilpc", privacy: "private", title: T(20, "The Days of Imprisonment"), sha8: "8550f5bf", at: "2026-10-07T21:46:39" },
  { at: "2026-10-08T04:46:39+00:00", episode: 20, video_id: "MrnjXsIilpc", event: "privacy", privacy: "public", sha8: "8550f5bf" },
  { key: `${WOTW}/compilation/0310aa4d`, episode: "compilation", video_id: "7grcwgBJ9S0", privacy: "public", title: "The War of the Worlds — The Complete Book", sha8: "0310aa4d", at: "2026-10-10T23:23:54+00:00" },
  { key: `${WOTW}/compilation/23887a2d`, episode: "compilation", video_id: "HSn8Gl7mnyA", privacy: "public", title: "The War of the Worlds — Full Adaptation, All 27 Chapters", sha8: "23887a2d", at: "2026-10-11T02:29:01+00:00" },
  { key: `${WOTW}/compilation/7grcwgBJ9S0`, episode: "compilation", video_id: "7grcwgBJ9S0", deleted: "True", at: "2026-10-11T04:24:21+00:00" },
];
const LEDGER_TEXT = LEDGER.map((r) => JSON.stringify(r)).join("\n") + "\nnot json\n\n";

describe("parseJsonl", () => {
  it("keeps file order and skips blank and broken lines", () => {
    const rows = parseJsonl(LEDGER_TEXT);
    expect(rows).toHaveLength(LEDGER.length);
    expect(rows[0].video_id).toBe("VwS0kox9DSA");
    expect(parseJsonl("")).toEqual([]);
    expect(parseJsonl(undefined)).toEqual([]);
  });
});

describe("deletedIds", () => {
  it("reads both spellings of a deletion", () => {
    expect([...deletedIds(LEDGER)].sort()).toEqual(["7grcwgBJ9S0", "NJnkwmNbe_Y"]);
  });
  it("ignores a falsy deleted flag", () => {
    expect(deletedIds([{ video_id: "x", deleted: false }, { video_id: "y", deleted: "False" }]).size).toBe(0);
  });
});

describe("liveEpisodesFromUploads", () => {
  const live = liveEpisodesFromUploads(LEDGER);
  it("lists only episodes with a public, undeleted video", () => {
    expect([...live.keys()].sort((a, b) => a - b)).toEqual([1, 14, 16, 20]); // 19 is still private
  });
  it("never picks a deleted video (ep14 was replaced by a re-cut)", () => {
    expect(live.get(14)).toMatchObject({ videoId: "7wobwpVglJE", sha8: "994ee36f" });
  });
  it("picks the newest public upload when an episode has several (ep16)", () => {
    expect(live.get(16)).toMatchObject({ videoId: "keQliW8rWNE", sha8: "3969b71b", duplicates: ["qXqY1ge1RMo"] });
  });
  it("dates an episode by the later of its upload and its public flip", () => {
    expect(live.get(1).publishedAt).toBe("2026-09-19T03:43:45Z");
    expect(live.get(20).publishedAt).toBe("2026-10-08T04:46:39+00:00");
    expect(live.get(16).publishedAt).toBe("2026-10-03T15:40:38Z");
  });
  it("carries the upload title", () => {
    expect(live.get(14).title).toBe(T(14, "In London"));
  });
});

describe("parseEpisodeTitle", () => {
  it("splits the YouTube title into number, total and chapter title", () => {
    expect(parseEpisodeTitle(T(16, "The Exodus from London"))).toEqual({ n: 16, total: 27, title: "The Exodus from London" });
    expect(parseEpisodeTitle('Robert Louis Stevenson: Dr Jekyll and Mr Hyde — Ep 01/10 — "Story of the Door"')).toEqual({ n: 1, total: 10, title: "Story of the Door" });
  });
  it("returns nothing it cannot read", () => {
    expect(parseEpisodeTitle("A Study in Scarlet — Full Adaptation")).toEqual({});
    expect(parseEpisodeTitle(undefined)).toEqual({});
  });
});

describe("progressFromUploads", () => {
  it("builds the SERIES_PROGRESS shape: published rows from the ledger, the rest planned up to the total", () => {
    const p = progressFromUploads(liveEpisodesFromUploads(LEDGER));
    expect(p.episodes).toHaveLength(27);
    expect(p.episodes[0]).toEqual({ chapter: 1, title: "The Eve of the War", state: "published", video_id: "VwS0kox9DSA" });
    expect(p.episodes[1]).toEqual({ chapter: 2, state: "planned" });
    expect(p.episodes.filter((e) => e.state === "published").map((e) => e.chapter)).toEqual([1, 14, 16, 20]);
    expect(deriveStatus(p.episodes)).toBe("airing");
  });
  it("is complete when every planned chapter is public", () => {
    const one = liveEpisodesFromUploads([{ key: "b/ep01/aaaaaaaa", episode: 1, video_id: "v1", privacy: "public", title: 'X: Y — Ep 01/01 — "Only"', at: "2026-10-20T00:00:00" }]);
    expect(deriveStatus(progressFromUploads(one).episodes)).toBe("complete");
  });
  it("falls back to the highest published chapter when no title states a total", () => {
    const m = new Map([[2, { videoId: "v2", title: "untitled" }]]);
    expect(progressFromUploads(m).episodes.map((e) => e.state)).toEqual(["planned", "published"]);
  });
  it("feeds buildSeries end to end (no SERIES_PROGRESS.json)", () => {
    const live = liveEpisodesFromUploads(LEDGER);
    const s = buildSeries({ folderName: WOTW, progress: progressFromUploads(live), uploads: live, book: { title: "The war of the worlds", author: "H. G. Wells" } });
    expect(s.status).toBe("airing");
    expect(s.episodes.map((e) => [e.n, e.chapter, e.youtubeId])).toEqual([[1, 1, "VwS0kox9DSA"], [2, 14, "7wobwpVglJE"], [3, 16, "keQliW8rWNE"], [4, 20, "MrnjXsIilpc"]]);
    expect(s.episodes[2].publishAt).toBe("2026-10-03T15:40:38Z");
  });
});

describe("compilationFromUploads", () => {
  it("returns the live whole-book video, skipping the deleted one", () => {
    expect(compilationFromUploads(LEDGER)).toEqual({ youtubeId: "HSn8Gl7mnyA", title: "The War of the Worlds — Full Adaptation, All 27 Chapters", publishAt: "2026-10-11T02:29:01+00:00" });
  });
  it("skips a compilation made private and returns undefined when there is none", () => {
    const rows = [
      { episode: "compilation", video_id: "old", privacy: "public", title: "A", at: "2026-10-01T00:00:00" },
      { episode: "compilation", video_id: "old", privacy: "private", replaced_by: "new" },
    ];
    expect(compilationFromUploads(rows)).toBeUndefined();
    expect(compilationFromUploads([])).toBeUndefined();
  });
});

describe("findPlaylistId", () => {
  it("prefers the ledger's own playlist row", () => {
    expect(findPlaylistId([{ event: "playlist", playlist_id: "PLrow" }], ["list=PLtext"])).toBe("PLrow");
  });
  it("else reads the first playlist link in the given texts", () => {
    expect(findPlaylistId([], [undefined, "All episodes in order: https://www.youtube.com/playlist?list=PLO5yijZWcZlY\n"])).toBe("PLO5yijZWcZlY");
  });
  it("returns undefined when nothing links one", () => {
    expect(findPlaylistId([], ["no link"])).toBeUndefined();
  });
});

describe("posterFilter", () => {
  it("crops a portrait title card to the poster frame, as before (Scarlet ep01 is 768x1344)", () => {
    expect(posterFilter(768, 1344)).toEqual({ vf: fitFilter(768, 1344, ...POSTER_SIZE) });
  });
  it("fits a square title card whole over a blurred cover of itself, so its lettering survives", () => {
    const f = posterFilter(2048, 2048);
    expect(f.vf).toBeUndefined();
    expect(f.filterComplex).toContain("split=2");
    expect(f.filterComplex).toContain("scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280");
    expect(f.filterComplex).toContain("[fg]scale=720:-2");
    expect(f.filterComplex).toContain("overlay=0:(H-h)/2");
  });
  it("does the same for a landscape card, and falls back to a plain scale with no size", () => {
    expect(posterFilter(2560, 1088).filterComplex).toBeDefined();
    expect(posterFilter(undefined, undefined)).toEqual({ vf: "scale=720:1280" });
  });
});

describe("hashCacheKey", () => {
  it("changes when the size or the mtime changes, so a rewritten master is re-hashed", () => {
    const a = hashCacheKey("cut/master_r2v.mp4", { size: 100, mtimeMs: 1000.4 });
    expect(a).toMatch(/master_r2v\.mp4\|100\|1000$/);
    expect(hashCacheKey("cut/master_r2v.mp4", { size: 101, mtimeMs: 1000 })).not.toBe(a);
    expect(hashCacheKey("cut/master_r2v.mp4", { size: 100, mtimeMs: 2000 })).not.toBe(a);
  });
});

describe("buildSeries — a failed probe keeps the last known runtime and aspect", () => {
  it("falls back to the existing entry's values for the same YouTube id", () => {
    const progress = { episodes: [{ chapter: 9, title: "The Flower of Utah", state: "published", video_id: "Me9h8oQwx6E" }] };
    const existing = { episodes: [{ n: 1, youtubeId: "Me9h8oQwx6E", runtime: "2:31", aspect: "1:1" }] };
    const s = buildSeries({ folderName: FOLDER, progress, uploads: new Map(), existing, runtimes: {}, frames: {} });
    expect(s.episodes[0]).toMatchObject({ runtime: "2:31", aspect: "1:1" });
  });
  it("never carries values across to a different video (a re-cut is re-measured)", () => {
    const progress = { episodes: [{ chapter: 9, title: "X", state: "published", video_id: "NEW" }] };
    const existing = { episodes: [{ n: 1, youtubeId: "OLD", runtime: "2:31", aspect: "1:1" }] };
    const s = buildSeries({ folderName: FOLDER, progress, uploads: new Map(), existing });
    expect(s.episodes[0].runtime).toBeUndefined();
    expect(s.episodes[0].aspect).toBeUndefined();
  });
});

describe("buildSeries — compilation and playlist", () => {
  const base = { folderName: WOTW, progress: { episodes: [{ chapter: 1, title: "A", state: "published", video_id: "v1" }] }, uploads: new Map() };
  it("writes the compilation and playlist when the ledger has them", () => {
    const s = buildSeries({ ...base, compilation: { youtubeId: "HSn8Gl7mnyA", title: "Full" }, playlistId: "PLO5yijZWcZlY" });
    expect(s.compilation).toEqual({ youtubeId: "HSn8Gl7mnyA", title: "Full" });
    expect(s.playlistId).toBe("PLO5yijZWcZlY");
  });
  it("keeps an editorial playlistId when the ledger has none (Jekyll's playlist is not linked locally)", () => {
    expect(buildSeries({ ...base, existing: { playlistId: "PLG7jS28mfkpo" } }).playlistId).toBe("PLG7jS28mfkpo");
    expect(buildSeries(base).playlistId).toBeUndefined();
  });
});
