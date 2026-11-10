import { describe, it, expect } from "vitest";
import type { Story } from "@/lib/content";
import type { Series } from "@/lib/movies";
import { getTracks, getTrackBySlug, getFeaturedTrack, formatTrackRuntime, trackStatusParts, type Track } from "@/lib/music";
import {
  getRequests, getSlate, getSlateByFormat, requestsSummary, sortSlate, summarizeRequests, normalizeRequests, loadRequests,
  type RequestItem,
} from "@/lib/requests";
import {
  buildHeroSlots, buildNewThisWeek, buildMoviesRail, buildSlate, moviesRailMeta, latestContentDate,
  formatRuntime, formatDateShort, storyStatusParts, episodeStatusParts, gameStatusParts, storyKindLabel,
  storyCard, episodeCard, trackCard, gameCard, productionNote, seriesVote, CARD_WIDTH, ACCENT, type Game,
} from "@/lib/home";

// ─── Fixtures ────────────────────────────────────────────────────────────────
const story = (over: Partial<Story> = {}): Story => ({
  id: "sto_falls-water", section: "stories", slug: "falls-water", title: "Falls Water", status: "live",
  createdAt: "2026-09-20T10:00:00.000Z", publishAt: "2026-09-20T00:00:00.000Z", accent: "#f5b831",
  genre: "Coming-of-age", summary: "A survivor goes back down the dry waterfall.", kind: "short", readMinutes: 32,
  cover34: "/stories/falls-water/cover_34.jpg", cover169: "/stories/falls-water/cover_169.jpg", ...over,
});

const scarlet: Series = {
  id: "mov_a-study-in-scarlet", section: "movies", kind: "series", slug: "a-study-in-scarlet", title: "A Study in Scarlet",
  subtitle: "Sherlock Holmes", author: "Arthur Conan Doyle", year: "1887", status: "complete", aspect: "9:16",
  synopsis: "A wounded army doctor takes rooms with a stranger.", poster: "/movies/a-study-in-scarlet/poster.jpg",
  glow: "/movies/a-study-in-scarlet/glow.jpg", accent: "#3DD68C",
  trailer: { file: "/movies/a-study-in-scarlet/trailer-60.mp4", runtime: "1:00", poster: "/movies/a-study-in-scarlet/trailer.jpg" },
  episodes: [1, 2, 3, 4].map((n) => ({
    n, slug: `ep-0${n}`, title: `Episode ${n}`, youtubeId: `id${n}`, runtime: "10:0" + n,
    publishAt: `2026-09-1${n}T00:00:00Z`, still: `/movies/a-study-in-scarlet/ep0${n}.jpg`, chapter: n,
  })),
  cast: [], createdAt: "2026-08-22", publishAt: "2026-09-11T00:00:00Z",
};

const frankenstein: Series = {
  id: "mov_frankenstein", section: "movies", kind: "series", slug: "frankenstein", title: "Frankenstein",
  author: "Mary Shelley", year: "1818", status: "in-production", aspect: "9:16", synopsis: "A student builds a living thing.",
  poster: "/movies/frankenstein/poster.jpg", accent: "#3DD68C", episodes: [], cast: [],
  production: { script: true, cast: true, note: "Ep 1 rendering", votes: 517 }, createdAt: "2026-08-25", publishAt: "2026-08-25T23:59:49Z",
};

const shorts: Series = {
  ...scarlet, id: "mov_shorts", kind: "shorts", slug: "scarlet-shorts", title: "Scarlet shorts", trailer: undefined,
  episodes: [
    { n: 1, slug: "tin-box", title: "The tin box", youtubeId: "s1", runtime: "0:58", publishAt: "2026-09-19T00:00:00Z", still: "/s1.jpg" },
    { n: 2, slug: "rache", title: "Rache", youtubeId: "s2", runtime: "0:44", publishAt: "2026-09-18T00:00:00Z", still: "/s2.jpg" },
    { n: 3, slug: "cabman", title: "The cabman", youtubeId: "s3", runtime: "0:59", publishAt: "2026-09-17T00:00:00Z", still: "/s3.jpg" },
  ],
};

const games: Game[] = [
  { slug: "cosmic-defense", title: "Cosmic Defense", thumbnail: "/images/cosmic-defense-thumb.svg", playUrl: "/games/cosmic-defense", duration: "Endless", tags: ["arcade", "shooter"], releaseDate: "2025-01-27", featured: true, description: "Defend Earth." },
  { slug: "neon-tetris", title: "Neon Tetris", thumbnail: "/images/neon-tetris-thumb.svg", playUrl: "/games/neon-tetris", duration: "Endless", tags: ["puzzle"], releaseDate: "2025-01-27" },
];

const requests: RequestItem[] = [
  { id: "req_dracula", title: "Dracula", author: "Bram Stoker", year: "1897", format: "Episodes", votes: 412, state: "voting" },
  { id: "req_frankenstein", title: "Frankenstein", author: "Mary Shelley", year: "1818", format: "Episodes", votes: 517, state: "in-production", producedSlug: "frankenstein" },
  { id: "req_moby", title: "Moby-Dick", format: "Feature", votes: 236, state: "voting" },
  { id: "req_arcade", title: "More arcade games", format: "Games", votes: 143, state: "voting" },
];

// ─── lib/music ───────────────────────────────────────────────────────────────
describe("lib/music", () => {
  it("getTracks returns exactly the two singles and never an audiobook", () => {
    const tracks = getTracks();
    expect(tracks.map((t) => t.slug).sort()).toEqual(["last-train", "somebody-knew-my-name"]);
    expect(JSON.stringify(tracks).toLowerCase()).not.toContain("audiobook");
    for (const t of tracks) {
      expect(t.videoUrl).toMatch(/^\/music\/.+\/video\.mp4$/);
      expect(t.posterUrl).toMatch(/^\/music\/.+\/poster\.jpg$/);
      expect(t.seconds).toBeGreaterThan(0);
      expect(t.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof t.featured).toBe("boolean");
      expect(t.tint).toMatch(/^#/);
      expect(t.story.length).toBeGreaterThan(20);
      expect(t.genreTags.length).toBeGreaterThan(0);
    }
  });
  it("getTracks is newest-first, featured first on ties, and returns a copy", () => {
    const a = getTracks();
    const b = getTracks();
    expect(a).not.toBe(b);
    expect(a[0].featured).toBe(true);
    for (let i = 1; i < a.length; i++) expect(a[i - 1].releaseDate >= a[i].releaseDate).toBe(true);
  });
  it("getTrackBySlug / getFeaturedTrack", () => {
    expect(getTrackBySlug("last-train")?.title).toBe("Last Train");
    expect(getTrackBySlug("nope")).toBeUndefined();
    expect(getFeaturedTrack()?.slug).toBe("somebody-knew-my-name");
  });
  it("formatTrackRuntime", () => {
    expect(formatTrackRuntime(0)).toBe("0:00");
    expect(formatTrackRuntime(62)).toBe("1:02");
    expect(formatTrackRuntime(3661)).toBe("1:01:01");
    expect(formatTrackRuntime(-1)).toBe("—");
    expect(formatTrackRuntime(Number.NaN)).toBe("—");
  });
  it("trackStatusParts follows the status-line grammar", () => {
    const t: Track = { ...getTracks()[0], seconds: 222 };
    expect(trackStatusParts(t)).toEqual(["Single", "Released", "3:42"]);
  });
});

// ─── lib/requests ────────────────────────────────────────────────────────────
describe("lib/requests", () => {
  it("reads content-local/requests.json", () => {
    const all = getRequests();
    expect(all.length).toBeGreaterThan(0);
    expect(all.find((r) => r.id === "req_frankenstein")?.state).toBe("in-production");
  });
  it("getSlate puts in-production first, then by votes desc", () => {
    const slate = getSlate();
    expect(slate[0].state).toBe("in-production");
    const voting = slate.filter((r) => r.state === "voting");
    for (let i = 1; i < voting.length; i++) expect(voting[i - 1].votes).toBeGreaterThanOrEqual(voting[i].votes);
    expect(getSlate(3)).toHaveLength(3);
  });
  it("sortSlate is pure and tie-breaks by title", () => {
    const sorted = sortSlate(requests);
    expect(sorted.map((r) => r.id)).toEqual(["req_frankenstein", "req_dracula", "req_moby", "req_arcade"]);
    expect(requests[0].id).toBe("req_dracula"); // input untouched
    const tie = sortSlate([{ ...requests[2], title: "Zed" }, { ...requests[2], id: "x", title: "Alpha" }]);
    expect(tie[0].title).toBe("Alpha");
  });
  it("getSlateByFormat filters case-insensitively in slate order", () => {
    const f = getSlateByFormat(["feature", "EPISODES"]);
    expect(f.length).toBeGreaterThan(0);
    expect(f.every((r) => ["Feature", "Episodes"].includes(String(r.format)))).toBe(true);
    expect(getSlateByFormat(["Games"], 1)).toHaveLength(1);
  });
  it("requestsSummary / summarizeRequests", () => {
    const s = requestsSummary();
    expect(s.totalVotes).toBe(2850);
    expect(s.openRequests).toBe(312);
    expect(s.votesLine).toBe("2,850 votes this season");
    expect(s.inProduction).toBe(1);
    expect(s.count).toBe(getRequests().length);
    const empty = summarizeRequests({ season: "", totalVotes: 0, openRequests: 0, items: [] });
    expect(empty.votesLine).toBe("0 votes this season");
  });
  it("normalizeRequests coerces junk and derives totals when missing", () => {
    const n = normalizeRequests({ items: [{ title: "A", votes: "12" }, { nope: 1 }, { title: "B", votes: -4, state: "in-production", id: "b" }] });
    expect(n.items).toHaveLength(2);
    expect(n.items[0]).toMatchObject({ id: "req_a", format: "Request", votes: 12, state: "voting" });
    expect(n.items[1]).toMatchObject({ id: "b", votes: 0, state: "in-production" });
    expect(n.totalVotes).toBe(12);
    expect(n.openRequests).toBe(2);
    expect(normalizeRequests(null).items).toEqual([]);
  });
  it("loadRequests returns an empty file for a missing path", () => {
    expect(loadRequests("Z:/definitely/missing.json")).toEqual({ season: "", totalVotes: 0, openRequests: 0, items: [] });
  });
});

// ─── lib/home: formatters + status lines ─────────────────────────────────────
describe("lib/home formatters", () => {
  it("formatRuntime", () => {
    expect(formatRuntime(222)).toBe("3:42");
    expect(formatRuntime(3600)).toBe("1:00:00");
    expect(formatRuntime(-5)).toBe("—");
  });
  it("formatDateShort", () => {
    expect(formatDateShort("2026-09-25T10:00:00Z")).toBe("25 Sep 2026");
    expect(formatDateShort("2026-01-02")).toBe("2 Jan 2026");
    expect(formatDateShort("garbage")).toBe("");
    expect(formatDateShort(undefined)).toBe("");
  });
  it("status lines follow `{Format} · {State} · {Count} · {Runtime}`", () => {
    expect(storyStatusParts(story())).toEqual(["Short story", "Coming-of-age", "32 min"]);
    expect(storyStatusParts(story({ genre: undefined, readMinutes: undefined, kind: "novel" }))).toEqual(["Novel"]);
    expect(storyKindLabel("series")).toBe("Serial");
    expect(episodeStatusParts(scarlet.episodes[3])).toEqual(["Ep 4", "10:04"]);
    expect(episodeStatusParts({ ...scarlet.episodes[0], runtime: undefined })).toEqual(["Ep 1"]);
    expect(gameStatusParts(games[1])).toEqual(["Puzzle", "Endless", "Browser"]);
    expect(gameStatusParts({ slug: "x", title: "X" })).toEqual(["Game", "Browser"]);
  });
});

// ─── lib/home: card mappers ──────────────────────────────────────────────────
describe("lib/home card mappers", () => {
  it("storyCard", () => {
    const c = storyCard(story(), 180, true);
    expect(c).toMatchObject({ href: "/stories/falls-water", ratio: "3:4", image: "/stories/falls-water/cover_34.jpg", kind: "Story", kindAccent: ACCENT.stories, width: 180, caption: "Short story · Coming-of-age · 32 min" });
    expect(storyCard(story()).kind).toBeUndefined();
    expect(storyCard(story({ cover34: undefined, cover: "/c.jpg" })).image).toBe("/c.jpg");
  });
  it("episodeCard", () => {
    const c = episodeCard(scarlet, scarlet.episodes[3]);
    expect(c).toMatchObject({ href: "/movies/a-study-in-scarlet/ep-04", ratio: "2:3", chip: "Ep 4", caption: "Ep 4 · 10:04", accent: ACCENT.movies, date: "2026-09-14T00:00:00Z" });
  });
  it("episodeCard keeps 2:3 and positions the still by its source aspect (portrait top, square/wide centred)", () => {
    // series.aspect is 9:16 → portrait default
    expect(episodeCard(scarlet, scarlet.episodes[0]).imagePosition).toBe("50% 20%");
    // per-episode aspect wins: square + wide stills are centred, tile stays 2:3
    const sq = episodeCard(scarlet, { ...scarlet.episodes[1], aspect: "1:1" });
    expect(sq).toMatchObject({ ratio: "2:3", imagePosition: "50% 50%" });
    expect(episodeCard(scarlet, { ...scarlet.episodes[2], aspect: "16:9" }).imagePosition).toBe("50% 50%");
    expect(episodeCard(scarlet, { ...scarlet.episodes[2], aspect: "9:16" }).imagePosition).toBe("50% 20%");
  });
  it("trackCard", () => {
    const c = trackCard(getTracks()[1]);
    expect(c).toMatchObject({ href: "/music#last-train", ratio: "1:1", playGlyph: true, width: CARD_WIDTH.single, caption: "Single · Released · 1:02" });
  });
  it("gameCard", () => {
    const c = gameCard(games[0]);
    expect(c).toMatchObject({ href: "/games/cosmic-defense", ratio: "16:9", width: CARD_WIDTH.railGame, caption: "Arcade · Endless · Browser" });
    expect(gameCard({ slug: "s", title: "S" }).href).toBe("/games/s");
  });
});

// ─── lib/home: hero ──────────────────────────────────────────────────────────
describe("buildHeroSlots", () => {
  const now = new Date("2026-09-25T00:00:00Z");
  it("one slot per vertical in room order; default is the newest story", () => {
    const slots = buildHeroSlots([story(), story({ slug: "older", title: "Older", createdAt: "2026-01-01T00:00:00Z" })], [scarlet, frankenstein], getTracks(), games, now);
    expect(slots.map((s) => s.vertical)).toEqual(["stories", "movies", "music", "games"]);
    expect(slots[0].title).toBe("Falls Water");
    expect(slots[0].eyebrow).toEqual(["Short story", "New this week", "Coming-of-age", "32 min"]);
    expect(slots[0].ctas.map((c) => c.label)).toEqual(["Read it", "All stories"]);
    expect(slots[0].follow?.sub).toBe("Get the next story first");
    expect(slots[0].art).toMatchObject({ ratio: "3:4", href: "/stories/falls-water" });
    expect(slots[0].glow).toBe("/stories/falls-water/cover_169.jpg");
  });
  it("story loses 'New this week' after 7 days", () => {
    const [s] = buildHeroSlots([story({ createdAt: "2026-09-01T00:00:00Z" })], [], [], [], now);
    expect(s.eyebrow).toEqual(["Short story", "Coming-of-age", "32 min"]);
  });
  it("movies slot uses the released series with Play Ep 1 + Trailer + Follow", () => {
    const m = buildHeroSlots([], [frankenstein, scarlet], [], [], now)[0];
    expect(m.vertical).toBe("movies");
    expect(m.title).toBe("A Study in Scarlet");
    expect(m.kicker).toBe("Movies · Sherlock Holmes");
    expect(m.eyebrow[0]).toBe("Series");
    expect(m.eyebrow).toContain("Complete");
    expect(m.ctas.map((c) => c.label)).toEqual(["Play Ep 1", "Trailer"]);
    expect(m.ctas[0]).toMatchObject({ href: "/movies/a-study-in-scarlet/ep-01", play: true, variant: "primary" });
    expect(m.follow?.sub).toBe("Get the next series first");
    expect(m.art.ratio).toBe("9:16");
  });
  it("movies slot falls back to an in-production series with a Follow CTA", () => {
    const m = buildHeroSlots([], [frankenstein], [], [], now)[0];
    expect(m.title).toBe("Frankenstein");
    expect(m.eyebrow).toContain("In production");
    expect(m.ctas[0]).toMatchObject({ label: "+ Follow", href: "/movies/frankenstein" });
    expect(m.follow).toBeUndefined();
  });
  it("music slot is the featured single; games slot is the featured game", () => {
    const [mu, g] = buildHeroSlots([], [], getTracks(), games, now);
    expect(mu).toMatchObject({ vertical: "music", title: "Somebody Knew My Name", eyebrow: ["Single", "Released", "1:02"] });
    expect(mu.ctas[0]).toMatchObject({ label: "Play", play: true });
    expect(g).toMatchObject({ vertical: "games", title: "Cosmic Defense", eyebrow: ["Game", "Arcade", "Browser", "No install"] });
    expect(g.ctas.map((c) => c.label)).toEqual(["Play now", "All games"]);
    expect(g.art.ratio).toBe("16:9");
  });
  it("skips verticals with nothing to show", () => {
    expect(buildHeroSlots([], [], [], [], now)).toEqual([]);
    expect(buildHeroSlots([], [], [], games, now).map((s) => s.vertical)).toEqual(["games"]);
  });
});

// ─── lib/home: new this week ─────────────────────────────────────────────────
describe("buildNewThisWeek", () => {
  const eps = scarlet.episodes.map((episode) => ({ series: scarlet, episode }));
  it("returns 8 mixed cards, interleaved so no kind floods the rail, newest kind first", () => {
    const cards = buildNewThisWeek([story(), story({ slug: "b", title: "B", createdAt: "2026-09-10T00:00:00Z" })], eps, getTracks(), games);
    expect(cards).toHaveLength(8);
    // newest lane is stories (2026-09-20), then episodes (09-14), then tracks (08-02), then games (2025)
    expect(cards.slice(0, 4).map((c) => c.kind)).toEqual(["Story", "Episode", "Single", "Game"]);
    expect(cards[0].title).toBe("Falls Water");
    expect(cards[1].chip).toBe("Ep 4");
    expect(new Set(cards.map((c) => c.key)).size).toBe(8);
  });
  it("kind + ratio + width per kind", () => {
    const cards = buildNewThisWeek([story()], eps.slice(0, 1), getTracks().slice(0, 1), games.slice(0, 1));
    const byKind = Object.fromEntries(cards.map((c) => [c.kind, c]));
    expect(byKind.Story).toMatchObject({ ratio: "3:4", width: 180 });
    expect(byKind.Episode).toMatchObject({ ratio: "2:3", width: 160 });
    expect(byKind.Single).toMatchObject({ ratio: "1:1", width: 240 });
    expect(byKind.Game).toMatchObject({ ratio: "16:9", width: 427 });
  });
  it("stops early when there is less than the limit, and honours limit", () => {
    expect(buildNewThisWeek([story()], [], [], [])).toHaveLength(1);
    expect(buildNewThisWeek([story()], eps, getTracks(), games, 3)).toHaveLength(3);
    expect(buildNewThisWeek([], [], [], [])).toEqual([]);
  });
});

// ─── lib/home: movies rail ───────────────────────────────────────────────────
describe("buildMoviesRail", () => {
  it("series card · 3 latest episodes · trailer · in-production card", () => {
    const rail = buildMoviesRail([scarlet, frankenstein]);
    const keys = rail.map((i) => (i.type === "card" ? i.card.key : `slate:${i.vote.id}`));
    expect(keys).toEqual([
      "series:a-study-in-scarlet",
      "episode:a-study-in-scarlet/ep-04", "episode:a-study-in-scarlet/ep-03", "episode:a-study-in-scarlet/ep-02",
      "trailer:a-study-in-scarlet",
      "slate:series:frankenstein",
    ]);
    const first = rail[0];
    expect(first.type === "card" && first.card).toMatchObject({ ratio: "2:3", caption: "Series · Complete · 4 ep", progress: 1, href: "/movies/a-study-in-scarlet" });
    const trailer = rail[4];
    expect(trailer.type === "card" && trailer.card).toMatchObject({ playGlyph: true, caption: "Trailer · 1:00", image: "/movies/a-study-in-scarlet/trailer.jpg" });
    const slate = rail[5];
    expect(slate.type === "slate" && slate.vote).toMatchObject({ title: "Frankenstein", votes: 517, state: "in-production", note: "Script ✓ · Cast ✓ · Ep 1 rendering", href: "/movies/frankenstein", format: "Series" });
  });
  it("adds up to 2 shorts (newest) as 9:16 cards when a shorts series exists", () => {
    const rail = buildMoviesRail([scarlet, shorts]);
    const s = rail.filter((i) => i.type === "card" && i.card.key.startsWith("short:"));
    expect(s).toHaveLength(2);
    expect(s[0].type === "card" && s[0].card).toMatchObject({ title: "The tin box", ratio: "9:16", caption: "Short · 0:58", width: 132 });
    // shorts series is never the lead
    expect(rail[0].type === "card" && rail[0].card.key).toBe("series:a-study-in-scarlet");
  });
  it("no trailer card without trailer data; airing series has 0 progress; empty input → []", () => {
    const airing: Series = { ...scarlet, status: "airing", trailer: undefined };
    const rail = buildMoviesRail([airing]);
    expect(rail.some((i) => i.type === "card" && i.card.key.startsWith("trailer:"))).toBe(false);
    expect(rail[0].type === "card" && rail[0].card).toMatchObject({ progress: 0, caption: "Series · Airing · 4 ep" });
    expect(buildMoviesRail([])).toEqual([]);
  });
  it("moviesRailMeta / productionNote / seriesVote", () => {
    expect(moviesRailMeta([frankenstein, scarlet])).toBe("A Study in Scarlet · Series · Complete · 4 episodes · 40 min");
    expect(moviesRailMeta([])).toBe("");
    expect(productionNote(frankenstein)).toBe("Script ✓ · Cast ✓ · Ep 1 rendering");
    expect(productionNote({ ...frankenstein, production: { votes: 1 } })).toBeUndefined();
    expect(productionNote(scarlet)).toBeUndefined();
    expect(seriesVote({ ...frankenstein, production: undefined }).votes).toBe(0);
  });
});

// ─── lib/home: slate + updated line ──────────────────────────────────────────
describe("buildSlate / latestContentDate", () => {
  it("maps requests to VoteCards and borrows the produced series' note + link", () => {
    const slate = buildSlate(sortSlate(requests), [frankenstein]);
    expect(slate[0]).toMatchObject({ id: "req_frankenstein", state: "in-production", note: "Script ✓ · Cast ✓ · Ep 1 rendering", href: "/movies/frankenstein" });
    expect(slate[1]).toMatchObject({ id: "req_dracula", state: "voting", author: "Bram Stoker", year: "1897", votes: 412 });
    expect(slate[1].href).toBeUndefined();
    expect(slate[1].note).toBeUndefined();
    // in-production without a matching series still links, just without a note
    expect(buildSlate([requests[1]], [])[0]).toMatchObject({ href: "/movies/frankenstein", note: undefined });
  });
  it("latestContentDate picks the newest date across all content", () => {
    expect(latestContentDate([story()], [scarlet], getTracks(), games)).toBe("2026-09-20T10:00:00.000Z");
    expect(latestContentDate([], [scarlet], [], [])).toBe("2026-09-14T00:00:00Z");
    expect(latestContentDate([], [], [], [])).toBe("");
    expect(latestContentDate([], [], [], [{ slug: "x", title: "x", releaseDate: "bad" }])).toBe("");
  });
});

describe("buildHeroSlots story pick (regression)", () => {
  it("leads with the newest story that has cover art, skipping a newer coverless one", () => {
    const now = new Date("2026-09-25T00:00:00Z");
    const coverless = story({ slug: "carrier-wave", title: "Carrier Wave", createdAt: "2026-09-24T00:00:00Z", cover34: undefined, cover169: undefined });
    const slots = buildHeroSlots([coverless, story()], [scarlet], getTracks(), games, now);
    expect(slots[0].vertical).toBe("stories");
    expect(slots[0].title).toBe("Falls Water");
  });
  it("falls back to the newest story when none has art", () => {
    const now = new Date("2026-09-25T00:00:00Z");
    const a = story({ slug: "a", title: "A", cover34: undefined, cover169: undefined });
    const b = story({ slug: "b", title: "B", cover34: undefined, cover169: undefined });
    expect(buildHeroSlots([a, b], [scarlet], getTracks(), games, now)[0].title).toBe("A");
  });
});
