// Shorts on the site: the channel constants, YouTube URL helpers, the Home "Latest shorts"
// shelf builders, and the series page's playlist / whole-book links. Fixtures only — never the
// live series.json, whose numbers move every time the studio publishes.
import { describe, it, expect } from "vitest";
import {
  CHANNEL, channelSubscribeUrl, youtubePlaylistUrl, youtubeShortsUrl, countShorts,
  type Episode, type Series,
} from "@/lib/movies";
import { shortCard, buildLatestShorts, latestShortsMeta } from "@/lib/home";
import { seriesYouTubeLinks } from "@/lib/youtube";

const ep = (n: number, publishAt: string, extra: Partial<Episode> = {}): Episode => ({
  n, slug: `ep-${String(n).padStart(2, "0")}`, title: `Chapter ${n}`, youtubeId: `vid${n}`, publishAt,
  runtime: "2:30", still: `/movies/x/ep${String(n).padStart(2, "0")}.jpg`, ...extra,
});

const series = (slug: string, episodes: Episode[], extra: Partial<Series> = {}): Series => ({
  id: `mov_${slug}`, section: "movies", kind: "series", slug, title: slug.toUpperCase(), status: "complete",
  aspect: "1:1", synopsis: "", poster: `/movies/${slug}/poster.jpg`, accent: "#3DD68C", episodes, cast: [],
  createdAt: "2026-09-01", publishAt: episodes[0]?.publishAt ?? "2026-09-01T00:00:00Z", ...extra,
});

describe("channel + URL helpers", () => {
  it("names the verified channel", () => {
    expect(CHANNEL).toEqual({
      name: "The Keeper's Lantern", handle: "@TheKeepersLantern", id: "UCyjo8L-DEJaeGuufUqMpigw",
      url: "https://www.youtube.com/@TheKeepersLantern",
    });
    expect(channelSubscribeUrl()).toBe("https://www.youtube.com/@TheKeepersLantern?sub_confirmation=1");
  });
  it("builds playlist and shorts URLs", () => {
    expect(youtubePlaylistUrl("PLO5yijZWcZlY")).toBe("https://www.youtube.com/playlist?list=PLO5yijZWcZlY");
    expect(youtubeShortsUrl("bHj8WAY4rWE")).toBe("https://www.youtube.com/shorts/bHj8WAY4rWE");
  });
  it("counts published episodes as shorts, skipping in-production series", () => {
    const a = series("a", [ep(1, "2026-09-01T00:00:00Z"), ep(2, "2026-09-02T00:00:00Z")]);
    const b = series("b", [ep(1, "2026-10-01T00:00:00Z")], { status: "airing" });
    const c = series("c", [], { status: "in-production" });
    expect(countShorts([a, b, c])).toBe(3);
  });
});

describe("shortCard", () => {
  const s = series("wotw", [ep(1, "2026-09-19T03:43:45Z")]);
  it("keeps the episode's own frame and links to the site's episode page", () => {
    const c = shortCard(s, s.episodes[0]);
    expect(c).toMatchObject({
      key: "short:wotw/ep-01", href: "/movies/wotw/ep-01", title: "Chapter 1", ratio: "1:1",
      image: "/movies/x/ep01.jpg", imagePosition: "50% 50%", caption: "WOTW · Ep 1 · 2:30", playGlyph: true,
      date: "2026-09-19T03:43:45Z",
    });
  });
  it("portrait episodes stay 9:16 with the still anchored high", () => {
    const c = shortCard(s, { ...s.episodes[0], aspect: "9:16" });
    expect(c.ratio).toBe("9:16");
    expect(c.imagePosition).toBe("50% 20%");
  });
  it("drops a missing runtime from the caption", () => {
    expect(shortCard(s, { ...s.episodes[0], runtime: undefined }).caption).toBe("WOTW · Ep 1");
  });
});

describe("buildLatestShorts", () => {
  const a = series("a", [ep(1, "2026-09-12T00:00:00Z"), ep(2, "2026-09-13T00:00:00Z")]);
  const b = series("b", [ep(1, "2026-10-21T01:32:21+00:00")]);
  const latest = [
    { series: a, episode: a.episodes[0] },
    { series: b, episode: b.episodes[0] },
    { series: a, episode: a.episodes[1] },
  ];
  it("orders newest first across series and respects the limit", () => {
    expect(buildLatestShorts(latest).map((c) => c.key)).toEqual(["short:b/ep-01", "short:a/ep-02", "short:a/ep-01"]);
    expect(buildLatestShorts(latest, 2)).toHaveLength(2);
    expect(buildLatestShorts([])).toEqual([]);
  });
});

describe("seriesYouTubeLinks", () => {
  it("links the playlist and the whole-book video when the series has them", () => {
    const s = series("wotw", [ep(1, "2026-09-19T00:00:00Z")], { playlistId: "PLO5yijZWcZlY", compilation: { youtubeId: "HSn8Gl7mnyA", title: "Full" } });
    expect(seriesYouTubeLinks(s)).toEqual({
      channel: { name: "The Keeper's Lantern", url: "https://www.youtube.com/@TheKeepersLantern" },
      playlist: "https://www.youtube.com/playlist?list=PLO5yijZWcZlY",
      compilation: { href: "https://www.youtube.com/watch?v=HSn8Gl7mnyA", title: "Full" },
    });
  });
  it("carries only the channel otherwise (no undefined keys for getStaticProps)", () => {
    const links = seriesYouTubeLinks(series("x", []));
    expect(Object.keys(links)).toEqual(["channel"]);
  });
});

describe("latestShortsMeta", () => {
  it("reads count, series and channel, singular when one", () => {
    expect(latestShortsMeta(42, 3, "The Keeper's Lantern")).toBe("42 shorts · 3 series · The Keeper's Lantern on YouTube");
    expect(latestShortsMeta(1, 1, "X")).toBe("1 short · 1 series · X on YouTube");
  });
});
