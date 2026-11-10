import { describe, it, expect } from "vitest";
import path from "node:path";
import { getSeriesList, type Series } from "@/lib/movies";
import { readRequestsLocal } from "@/components/movies/requests-local";
import {
  aspectOf, chaptersFor, episodeCaption, episodeHref, episodeSlug, episodeStatusParts, episodesMeta, hubCounts, initials,
  isMovieRequest, latestEpisodes, movieRequests, primaryEpisode, productionNote, seriesMeta, seriesSubline,
  slateAfter, stillPosition, toSlateItems, trailerRail, type RequestItem,
} from "@/components/movies/helpers";

const real = getSeriesList();
const scarlet = real.find((s) => s.slug === "a-study-in-scarlet")!;
const franken = real.find((s) => s.slug === "frankenstein")!;
const requests = readRequestsLocal();

const items: RequestItem[] = [
  { id: "f", title: "Frankenstein", format: "Episodes", votes: 517, state: "in-production", producedSlug: "frankenstein" },
  { id: "d", title: "Dracula", format: "Episodes", votes: 412, state: "voting" },
  { id: "m", title: "Moby-Dick", format: "Feature", votes: 236, state: "voting" },
  { id: "k", title: "Metamorphosis", format: "Shorts", votes: 152, state: "voting" },
  { id: "g", title: "More arcade", format: "Games", votes: 143, state: "voting" },
  { id: "p", title: "Pride", format: "Episodes", votes: 388, state: "voting" },
];

describe("requests-local", () => {
  it("reads content-local/requests.json", () => {
    expect(requests.openRequests).toBe(312);
    expect(requests.totalVotes).toBe(2850);
    expect(requests.items.length).toBeGreaterThan(5);
    expect(requests.items[0].id).toBe("req_frankenstein");
  });
  it("returns an empty file when missing or corrupt", () => {
    expect(readRequestsLocal(path.resolve("does-not-exist.json"))).toEqual({ season: "", totalVotes: 0, openRequests: 0, items: [] });
    expect(readRequestsLocal(path.resolve(__filename)).items).toEqual([]);
  });
});

describe("movies/helpers · requests", () => {
  it("isMovieRequest keeps Feature/Episodes only", () => {
    expect(items.filter(isMovieRequest).map((r) => r.id)).toEqual(["f", "d", "m", "p"]);
  });
  it("movieRequests: in-production first, then by votes, top N", () => {
    expect(movieRequests(items, 3).map((r) => r.id)).toEqual(["f", "d", "p"]);
    expect(movieRequests(items, Infinity)).toHaveLength(4);
    expect(movieRequests(requests.items, 3).map((r) => r.title)).toEqual(["Frankenstein", "Dracula", "Pride and Prejudice"]);
  });
  it("slateAfter: open votes only, movie formats, excludes the current series", () => {
    expect(slateAfter(items, 3).map((r) => r.id)).toEqual(["d", "p", "m"]);
    expect(slateAfter(items, 3, "frankenstein").map((r) => r.id)).toEqual(["d", "p", "m"]);
    expect(slateAfter(requests.items, 3).map((r) => r.title)).toEqual(["Dracula", "Pride and Prejudice", "The Picture of Dorian Gray"]);
  });
  it("productionNote joins the production flags", () => {
    expect(productionNote(franken)).toBe("Script ✓ · Cast ✓ · Ep 1 rendering");
    expect(productionNote(scarlet)).toBeUndefined();
    expect(productionNote({ production: { script: false } })).toBeUndefined();
  });
  it("toSlateItems links in-production items to their series and carries the note", () => {
    const slate = toSlateItems(movieRequests(items, 3), real);
    expect(slate[0]).toMatchObject({ id: "f", href: "/movies/frankenstein", note: "Script ✓ · Cast ✓ · Ep 1 rendering", state: "in-production" });
    expect(slate[1]).toMatchObject({ id: "d", votes: 412 });
    expect(slate[1].href).toBeUndefined();
    expect(slate[1].note).toBeUndefined();
    // JSON-serialisable for getStaticProps (no undefined values dropped silently by Next)
    expect(() => JSON.stringify(slate)).not.toThrow();
  });
});

describe("movies/helpers · series", () => {
  it("episode slugs and hrefs", () => {
    expect(episodeSlug(4)).toBe("ep-04");
    expect(episodeSlug(14)).toBe("ep-14");
    expect(episodeHref("a-study-in-scarlet", 4)).toBe("/movies/a-study-in-scarlet/ep-04");
    expect(episodeHref("a-study-in-scarlet", scarlet.episodes[0])).toBe("/movies/a-study-in-scarlet/ep-01");
  });
  it("latestEpisodes: newest first, ties broken by episode number, released series only", () => {
    const l = latestEpisodes(real, 3);
    const byDate = [...scarlet.episodes].sort((a, b) => (b.publishAt > a.publishAt ? 1 : b.publishAt < a.publishAt ? -1 : b.n - a.n));
    expect(l.map((x) => x.episode.n)).toEqual(byDate.slice(0, 3).map((e) => e.n));
    expect(latestEpisodes(real, 100)).toHaveLength(14);
    expect(latestEpisodes([franken], 5)).toEqual([]);
    // same publishAt → higher episode number first
    const tied: Series = { ...scarlet, episodes: scarlet.episodes.slice(0, 3).map((e) => ({ ...e, publishAt: "2026-09-14T00:00:00Z" })) };
    expect(latestEpisodes([tied], 3).map((x) => x.episode.n)).toEqual([3, 2, 1]);
  });
  it("hubCounts reads like the mockup subline", () => {
    const parts = hubCounts(real, requests);
    expect(parts[0]).toBe("1 series complete");
    expect(parts).toContain("14 episodes");
    expect(parts).toContain("1 trailer");
    expect(parts).toContain("9 titles in development");
    expect(parts[parts.length - 1]).toBe("Played on YouTube");
    expect(parts.some((p) => /shorts/.test(p))).toBe(false);
  });
  it("seriesMeta", () => {
    expect(seriesMeta(real)).toBe("1 complete · 1 in production");
    expect(seriesMeta([{ ...scarlet, status: "airing" }])).toBe("1 airing");
  });
  it("trailerRail: trailer first, pads to ≥3 with latest episodes when no shorts exist", () => {
    const rail = trailerRail(real);
    expect(rail).toHaveLength(3);
    expect(rail[0]).toMatchObject({ href: "/movies/a-study-in-scarlet#trailer", caption: `Trailer · ${scarlet.trailer!.runtime}`, playGlyph: true, title: "A Study in Scarlet" });
    const [a, b] = latestEpisodes(real, 2);
    expect(rail[1]).toMatchObject({ href: episodeHref(a.series.slug, a.episode), chip: `Ep ${a.episode.n}` });
    expect(rail[2]).toMatchObject({ href: episodeHref(b.series.slug, b.episode) });
  });
  it("trailerRail includes shorts when a shorts series exists", () => {
    const shorts: Series = {
      ...scarlet, id: "x", slug: "scarlet-shorts", kind: "shorts", title: "Shorts", trailer: undefined,
      episodes: [{ n: 1, slug: "the-tin-box", title: "The tin box", youtubeId: "abc", publishAt: "2026-09-20T00:00:00Z", runtime: "0:58" }],
    };
    const rail = trailerRail([scarlet, shorts]);
    const newest = latestEpisodes([scarlet], 1)[0].episode;
    // shorts are never used as padding, so the third item is a long-form episode
    expect(rail.map((r) => r.caption)).toEqual([`Trailer · ${scarlet.trailer!.runtime}`, "Short · 0:58", episodeCaption(newest)]);
  });
  it("episodeStatusParts / episodeCaption / chaptersFor", () => {
    const ep = { ...scarlet.episodes[3], runtime: undefined };
    expect(episodeStatusParts(ep)).toEqual(["Ep 4", "Chapter 4"]);
    expect(episodeStatusParts({ ...ep, runtime: "10:04" }, "watched")).toEqual(["Ep 4", "10:04", "Chapter 4", "Watched"]);
    expect(episodeStatusParts(ep, "current")).toEqual(["Ep 4", "Chapter 4", "In progress"]);
    expect(episodeCaption({ n: 4, runtime: "10:04" })).toBe("Ep 4 · 10:04");
    expect(episodeCaption({ n: 4 })).toBe("Ep 4");
    expect(chaptersFor(ep)).toEqual([{ label: "Chapter 4", title: "What John Rance Had to Tell", at: "0:00" }]);
    expect(chaptersFor({ n: 2, title: "T" })[0].label).toBe("Chapter 2");
  });
  it("aspectOf mirrors lib/movies episodeAspect; stillPosition crops high only for portrait", () => {
    expect(aspectOf(scarlet, scarlet.episodes[0])).toBe(scarlet.episodes[0].aspect ?? scarlet.aspect);
    expect(aspectOf({ aspect: "9:16" }, { aspect: "1:1" })).toBe("1:1");
    expect(aspectOf({ aspect: "9:16" }, {})).toBe("9:16");
    expect(stillPosition("9:16")).toBe("50% 20%");
    expect(stillPosition("1:1")).toBe("50% 50%");
    expect(stillPosition("16:9")).toBe("50% 50%");
  });
  it("initials drop honorifics", () => {
    expect(initials("Tobias Gregson")).toBe("TG");
    expect(initials("Inspector Lestrade")).toBe("L");
    expect(initials("Dr. John Watson")).toBe("JW");
    expect(initials("Sherlock Holmes")).toBe("SH");
  });
  it("primaryEpisode: saved progress or Ep 1", () => {
    expect(primaryEpisode(scarlet)?.n).toBe(1);
    expect(primaryEpisode(scarlet, { seriesSlug: "a-study-in-scarlet", ep: 7, at: 1 })?.n).toBe(7);
    expect(primaryEpisode(scarlet, { seriesSlug: "other", ep: 7, at: 1 })?.n).toBe(1);
    expect(primaryEpisode(scarlet, { seriesSlug: "a-study-in-scarlet", ep: 99, at: 1 })?.n).toBe(1);
    expect(primaryEpisode(franken)).toBeUndefined();
  });
  it("episodesMeta and seriesSubline", () => {
    expect(episodesMeta(scarlet)).toBe("Chronological");
    expect(episodesMeta(scarlet, { seriesSlug: "a-study-in-scarlet", ep: 7, at: 1 })).toBe("Chronological · 6 watched · Ep 7 in progress");
    expect(seriesSubline(scarlet)).toBe("Played on YouTube · Audiobook 4 h 51 min · Casebook · Cast sheets");
    expect(seriesSubline(franken)).toBe("Played on YouTube");
  });
});
