import { render, screen, within, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Home, { PROGRESS_KEY, parseProgress, buildContinue, type HomeProps, type ContinueIndexEntry } from "@/pages/index";
import type { CardModel, HeroSlot, VoteModel } from "@/lib/home";
import { saveProgress } from "@/components/movies/progress";

// ─── Fixtures (plain JSON, exactly what getStaticProps ships) ───────────────
const hero: HeroSlot[] = [
  { vertical: "stories", accent: "#E8B04B", eyebrow: ["Short story", "New this week", "Coming-of-age", "32 min"], kicker: "Stories", title: "Falls Water", logline: "A survivor goes back down.", ctas: [{ label: "Read it", href: "/stories/falls-water", variant: "primary" }, { label: "All stories", href: "/stories", variant: "ghost" }], follow: { label: "+ Follow", sub: "Get the next story first", href: "/stories" }, art: { src: "/s.jpg", ratio: "3:4", alt: "Falls Water cover", href: "/stories/falls-water" }, glow: "/s169.jpg" },
  { vertical: "movies", accent: "#3DD68C", eyebrow: ["Series", "Complete", "14 episodes"], kicker: "Movies · Sherlock Holmes", title: "A Study in Scarlet", logline: "A wounded army doctor.", ctas: [{ label: "Play Ep 1", href: "/movies/a-study-in-scarlet/ep-01", variant: "primary", play: true }, { label: "Trailer", href: "/movies/a-study-in-scarlet#trailer", variant: "ghost" }], art: { src: "/p.jpg", ratio: "9:16", alt: "A Study in Scarlet poster", href: "/movies/a-study-in-scarlet" } },
  { vertical: "music", accent: "#F0537A", eyebrow: ["Single", "Released", "1:02"], kicker: "Music", title: "Last Train", ctas: [{ label: "Play", href: "/music#last-train", variant: "primary", play: true }], art: { src: "/m.jpg", ratio: "1:1", alt: "Last Train cover", href: "/music#last-train" } },
  { vertical: "games", accent: "#B48CF7", eyebrow: ["Game", "Puzzle", "Browser", "No install"], kicker: "Games", title: "Neon Tetris", ctas: [{ label: "Play now", href: "/games/neon-tetris", variant: "primary" }], art: { src: "/g.svg", ratio: "16:9", alt: "Neon Tetris", href: "/games/neon-tetris" } },
];

const card = (over: Partial<CardModel>): CardModel => ({
  key: "k", href: "/x", title: "X", ratio: "3:4", caption: "Short story · Drama · 10 min", width: 172, date: "2026-09-01", ...over,
});

const storyCards = ["Falls Water", "As Promised", "Glass and Granite", "One Mitten", "Rich Ground", "Slack Water", "The Mortar Line"]
  .map((t, i) => card({ key: `story:${i}`, href: `/stories/${i}`, title: t }));

const frankenstein: VoteModel = { id: "series:frankenstein", title: "Frankenstein", author: "Mary Shelley", year: "1818", format: "Series", votes: 517, state: "in-production", note: "Script ✓ · Cast ✓ · Ep 1 rendering", href: "/movies/frankenstein" };

const props: HomeProps = {
  section: "home",
  hero,
  newThisWeek: [
    card({ key: "n1", title: "Falls Water", kind: "Story", width: 180 }),
    card({ key: "n2", title: "The Conclusion", kind: "Episode", ratio: "2:3", chip: "Ep 14", caption: "Ep 14 · 10:26", width: 160 }),
    card({ key: "n3", title: "Last Train", kind: "Single", ratio: "1:1", caption: "Single · Released · 1:02", playGlyph: true, width: 240 }),
    card({ key: "n4", title: "Neon Tetris", kind: "Game", ratio: "16:9", caption: "Puzzle · Endless · Browser", width: 427 }),
  ],
  shorts: [
    card({ key: "short:jekyll/ep-01", href: "/movies/jekyll/ep-01", title: "Story of the Door", ratio: "1:1", caption: "Dr Jekyll and Mr Hyde · Ep 1 · 2:20", playGlyph: true }),
    card({ key: "short:wotw/ep-27", href: "/movies/wotw/ep-27", title: "The Epilogue", ratio: "1:1", caption: "The War of the Worlds · Ep 27 · 2:10", playGlyph: true }),
  ],
  shortsMeta: "42 shorts · 3 series · The Keeper's Lantern on YouTube",
  channel: { name: "The Keeper's Lantern", url: "https://www.youtube.com/@TheKeepersLantern", subscribeUrl: "https://www.youtube.com/@TheKeepersLantern?sub_confirmation=1" },
  stories: storyCards,
  storiesMeta: "7 stories · 2 h 49 min of reading",
  movies: [
    { type: "card", card: card({ key: "series:scarlet", title: "A Study in Scarlet", ratio: "2:3", caption: "Series · Complete · 14 ep", progress: 1 }) },
    { type: "card", card: card({ key: "ep14", title: "The Conclusion", ratio: "2:3", chip: "Ep 14", caption: "Ep 14 · 10:26" }) },
    { type: "card", card: card({ key: "trailer", title: "A Study in Scarlet", ratio: "2:3", caption: "Trailer · 1:00", playGlyph: true }) },
    { type: "slate", vote: frankenstein },
  ],
  moviesMeta: "A Study in Scarlet · Series · Complete · 14 episodes · 2 h 20 min",
  music: [
    card({ key: "single:somebody", href: "/music#somebody-knew-my-name", title: "Somebody Knew My Name", ratio: "1:1", caption: "Single · Released · 1:02", image: "/music/somebody-knew-my-name/poster.jpg" }),
    card({ key: "single:last-train", href: "/music#last-train", title: "Last Train", ratio: "1:1", caption: "Single · Released · 1:02", image: "/music/last-train/poster.jpg" }),
  ],
  games: Array.from({ length: 10 }, (_, i) => card({ key: `game:${i}`, href: `/games/${i}`, title: `Game ${i}`, ratio: "16:9", caption: "Arcade · Endless · Browser", width: 208 })),
  slate: [
    { id: "req_frankenstein", title: "Frankenstein", author: "Mary Shelley", year: "1818", format: "Episodes", votes: 517, state: "in-production", note: "Script ✓ · Cast ✓ · Ep 1 rendering", href: "/movies/frankenstein" },
    { id: "req_dracula", title: "Dracula", author: "Bram Stoker", year: "1897", format: "Episodes", votes: 412, state: "voting" },
    { id: "req_moby", title: "Moby-Dick", author: "Herman Melville", year: "1851", format: "Feature", votes: 236, state: "voting" },
  ],
  requests: { season: "2026-autumn", totalVotes: 2850, openRequests: 312, count: 12, inProduction: 1, votesLine: "2,850 votes this season" },
  continueIndex: {
    "a-study-in-scarlet": {
      slug: "a-study-in-scarlet", title: "A Study in Scarlet",
      episodes: Array.from({ length: 14 }, (_, i) => ({ n: i + 1, slug: `ep-${String(i + 1).padStart(2, "0")}`, title: i === 6 ? "Light in the Darkness" : `Episode ${i + 1}`, still: `/ep${i + 1}.jpg` })),
    },
  },
  updated: "25 Sep 2026",
};

beforeEach(() => { window.localStorage.clear(); });
afterEach(cleanup); // explicit: don't rely on RTL's auto-cleanup detection

// ─── Page ────────────────────────────────────────────────────────────────────
describe("Home page", () => {
  it("renders the shell with the requests count and the sections in mockup order", () => {
    render(<Home {...props} />);
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByText("(312)")).toBeInTheDocument();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["New this week", "Latest shorts", "Stories", "Movies", "Music", "Games", "On the slate"]);
    expect(screen.getByText(/Across the studio · 4 releases/)).toBeInTheDocument();
    expect(screen.getByText("7 stories · 2 h 49 min of reading")).toBeInTheDocument();
    expect(screen.getByText("A Study in Scarlet · Series · Complete · 14 episodes · 2 h 20 min")).toBeInTheDocument();
    expect(screen.getByText("2,850 votes this season")).toBeInTheDocument();
  });

  it("hero: all four slots are in the DOM, only the first (newest story) is visible without JS", () => {
    render(<Home {...props} />);
    const slots = document.querySelectorAll("[data-hero-slot]");
    expect(slots).toHaveLength(4);
    expect(slots[0]).toBeVisible();
    expect(slots[1]).not.toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "Falls Water" })).toBeVisible();
    // `hidden: true`: role queries skip hidden subtrees by default, and that is the point here
    expect(screen.getByRole("heading", { level: 1, name: "A Study in Scarlet", hidden: true })).not.toBeVisible();
    // eyebrow status line + CTAs + follow subline
    expect(screen.getByText("New this week", { selector: "[data-status-line] span" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read it" })).toHaveAttribute("href", "/stories/falls-water");
    expect(screen.getByText("Get the next story first")).toBeInTheDocument();
    // art: 4 posters, first visible with eager priority, floor line present
    const arts = within(document.querySelector("[data-hero-art]") as HTMLElement).getAllByRole("link", { hidden: true });
    expect(arts).toHaveLength(4);
    expect(arts[0]).toBeVisible();
    expect(arts[0]).toHaveAttribute("href", "/stories/falls-water");
    expect(arts[0].querySelector("img")).toHaveAttribute("fetchpriority", "high");
    expect(arts[1]).not.toBeVisible();
    // jsdom ignores Tailwind, so also pin the classes: a `block` class beats the `hidden`
    // attribute in real browsers (the bug that stacked all four posters).
    expect(arts[0].classList.contains("block")).toBe(true);
    arts.slice(1).forEach((a) => {
      expect(a.classList.contains("hidden")).toBe(true);
      expect(a.classList.contains("block")).toBe(false);
    });
  });

  it("hero strip: tabs are labelled by room and switch the visible slot, art, accent and glow", () => {
    render(<Home {...props} />);
    const tablist = screen.getByRole("tablist", { name: /featured by room/i });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Stories", "Movies", "Music", "Games"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    const section = document.querySelector("[data-hero]") as HTMLElement;
    expect(section.getAttribute("data-slot")).toBe("stories");
    expect(section.style.getPropertyValue("--vr-accent")).toBe("#E8B04B");

    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("heading", { level: 1, name: "A Study in Scarlet" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "Falls Water", hidden: true })).not.toBeVisible();
    expect(screen.getByRole("link", { name: "Play Ep 1" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-01");
    expect(section.getAttribute("data-slot")).toBe("movies");
    expect(section.style.getPropertyValue("--vr-accent")).toBe("#3DD68C");
    const glowImg = section.querySelector("[data-ambient-glow] img");
    expect(glowImg).toHaveAttribute("src", "/p.jpg"); // movies slot has no glow → poster

    fireEvent.click(tabs[3]);
    expect(screen.getByRole("heading", { level: 1, name: "Neon Tetris" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Play now" })).toBeVisible();
  });

  it("Latest shorts: one card per short linking to the episode page, the channel line and a Subscribe link", () => {
    const { container } = render(<Home {...props} />);
    const shelf = screen.getByRole("list", { name: "Latest shorts" });
    expect(within(shelf).getAllByRole("listitem")).toHaveLength(2);
    const first = within(shelf).getAllByRole("listitem")[0];
    expect(first.closest("a") ?? first.querySelector("a")).toHaveAttribute("href", "/movies/jekyll/ep-01");
    expect(screen.getByText("42 shorts · 3 series · The Keeper's Lantern on YouTube")).toBeInTheDocument();
    const line = container.querySelector("[data-channel-line]")!;
    const subscribe = within(line as HTMLElement).getByRole("link", { name: "Subscribe on YouTube" });
    expect(subscribe).toHaveAttribute("href", "https://www.youtube.com/@TheKeepersLantern?sub_confirmation=1");
    expect(subscribe).toHaveAttribute("target", "_blank");
  });

  it("hides the Latest shorts shelf when nothing is published", () => {
    render(<Home {...props} shorts={[]} />);
    expect(screen.queryByRole("list", { name: "Latest shorts" })).toBeNull();
  });

  it("rails: New this week shows kind chips per kind; Stories rail has 7 cards", () => {
    render(<Home {...props} />);
    const ntw = screen.getByRole("list", { name: "New this week" });
    expect(within(ntw).getAllByRole("listitem")).toHaveLength(4);
    // the kind chip proper ([data-kind]); the typeset fallback cover echoes the kind too
    const chips = Array.from(ntw.querySelectorAll("[data-kind]")).map((el) => el.textContent);
    expect(chips).toEqual(["Story", "Episode", "Single", "Game"]);
    expect(within(ntw).getByText("Ep 14", { selector: "[data-chip]" })).toBeInTheDocument();
    const stories = screen.getByRole("list", { name: "Stories" });
    expect(within(stories).getAllByRole("listitem")).toHaveLength(7);
    // title appears in the caption and, with no artwork, in the typeset fallback too
    expect(within(stories).getAllByText("The Mortar Line").length).toBeGreaterThan(0);
    expect(within(stories).getAllByText("Short story · Drama · 10 min")).toHaveLength(7);
  });

  it("movies rail mixes media cards with the in-production vote card", () => {
    render(<Home {...props} />);
    const movies = screen.getByRole("list", { name: "Movies" });
    expect(within(movies).getAllByRole("listitem")).toHaveLength(4);
    expect(within(movies).getByText("Trailer · 1:00")).toBeInTheDocument();
    const vote = movies.querySelector("[data-vote-card]") as HTMLElement;
    expect(within(vote).getByText("Frankenstein")).toBeInTheDocument();
    expect(within(vote).getByText("517")).toBeInTheDocument();
    expect(within(vote).getByText("Script ✓ · Cast ✓ · Ep 1 rendering")).toBeInTheDocument();
    expect(within(vote).getByRole("link", { name: "+ Follow" })).toHaveAttribute("href", "/movies/frankenstein");
  });

  it("music rail shows the two singles only — never an audiobook", () => {
    render(<Home {...props} />);
    const music = screen.getByRole("list", { name: "Music" });
    const rows = within(music).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(music).getByText("Somebody Knew My Name")).toBeInTheDocument();
    expect(within(music).getByText("Last Train")).toBeInTheDocument();
    expect(rows[1]).toHaveAttribute("href", "/music#last-train");
    expect(document.body.textContent?.toLowerCase()).not.toContain("audiobook");
  });

  it("games rail renders every game (6 visible + peek is a layout concern)", () => {
    render(<Home {...props} />);
    expect(within(screen.getByRole("list", { name: "Games" })).getAllByRole("listitem")).toHaveLength(10);
  });

  it("on the slate: in-production first, votes, then the 'Request a title' card linking to /requests", () => {
    render(<Home {...props} />);
    const slate = screen.getByRole("list", { name: "On the slate" });
    const items = within(slate).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByText("Frankenstein")).toBeInTheDocument();
    expect(within(items[0]).getByText(/In production/)).toBeInTheDocument();
    expect(within(items[1]).getByText("412")).toBeInTheDocument();
    expect(within(items[1]).getByRole("button", { name: "Vote" })).toBeInTheDocument();
    expect(items[3]).toHaveAttribute("href", "/requests");
    expect(within(items[3]).getByText("Request a title →")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request board →" })).toHaveAttribute("href", "/requests");
  });

  it("Continue renders nothing without progress (SSR-equivalent) …", () => {
    render(<Home {...props} />);
    expect(screen.queryByRole("heading", { name: "Continue" })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Continue" })).not.toBeInTheDocument();
  });

  it("… and appears from localStorage progress after mount", async () => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ seriesSlug: "a-study-in-scarlet", ep: 7, at: 1 }));
    render(<Home {...props} />);
    const list = await screen.findByRole("list", { name: "Continue" });
    const row = within(list).getByRole("listitem");
    expect(row).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-07");
    expect(within(row).getByText("A Study in Scarlet")).toBeInTheDocument();
    expect(within(row).getByText("Light in the Darkness")).toBeInTheDocument();
    expect(within(row).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Continue" })).toBeInTheDocument());
  });

  it("reads exactly what the Movies player writes (components/movies/progress.ts)", async () => {
    expect(PROGRESS_KEY).toBe("vr:progress:movies");
    saveProgress({ seriesSlug: "a-study-in-scarlet", ep: 3 }, window.localStorage);
    render(<Home {...props} />);
    const list = await screen.findByRole("list", { name: "Continue" });
    expect(within(list).getByRole("listitem")).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-03");
    expect(within(list).getByText("Ep 3 of 14")).toBeInTheDocument();
  });

  it("ignores progress for unknown series or episodes", () => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([{ seriesSlug: "nope", ep: 1, at: 2 }, { seriesSlug: "a-study-in-scarlet", ep: 99, at: 1 }]));
    render(<Home {...props} />);
    expect(screen.queryByRole("list", { name: "Continue" })).not.toBeInTheDocument();
  });

  it("'How this studio works' line with the updated date and the How it's made link", () => {
    render(<Home {...props} />);
    expect(screen.getByText(/Updated 25 Sep 2026/)).toBeInTheDocument();
    expect(screen.getByText(/one person and a set of AI tools/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How it's made →" })).toHaveAttribute("href", "/about");
  });

  it("renders with no data at all (empty props) without crashing", () => {
    render(<Home section="home" />);
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
  });

  it("never uses text-shadow, backdrop-filter, mix-blend-mode or a coming-soon promise", () => {
    const { container } = render(<Home {...props} />);
    const html = container.innerHTML.toLowerCase();
    expect(html).not.toContain("text-shadow");
    expect(html).not.toContain("backdrop-filter");
    expect(html).not.toContain("backdrop-blur");
    expect(html).not.toContain("mix-blend");
    expect(html).not.toContain("coming soon");
    expect(html).not.toContain("opacity-0");
  });
});

// ─── Continue helpers ────────────────────────────────────────────────────────
describe("parseProgress", () => {
  it("accepts a single entry, an array, or a map keyed by series slug; newest first; deduped", () => {
    expect(parseProgress(JSON.stringify({ seriesSlug: "a", ep: 2, at: 5 }))).toEqual([{ seriesSlug: "a", ep: 2, at: 5, progress: undefined }]);
    expect(parseProgress(JSON.stringify([{ seriesSlug: "a", ep: 1, at: 1 }, { seriesSlug: "b", ep: 3, at: 9 }, { seriesSlug: "a", ep: 4, at: 7 }])).map((e) => `${e.seriesSlug}:${e.ep}`)).toEqual(["b:3", "a:4"]);
    expect(parseProgress(JSON.stringify({ a: { ep: "2", at: 1, progress: 0.4 }, b: { ep: 1 } }))).toEqual([
      { seriesSlug: "a", ep: 2, at: 1, progress: 0.4 },
      { seriesSlug: "b", ep: 1, at: 0, progress: undefined },
    ]);
  });
  it("rejects junk", () => {
    expect(parseProgress(null)).toEqual([]);
    expect(parseProgress("")).toEqual([]);
    expect(parseProgress("{not json")).toEqual([]);
    expect(parseProgress("42")).toEqual([]);
    expect(parseProgress(JSON.stringify([{ ep: 1 }, { seriesSlug: "a", ep: "x" }, null]))).toEqual([]);
  });
});

describe("buildContinue", () => {
  const index: Record<string, ContinueIndexEntry> = props.continueIndex;
  it("maps entries onto the shipped series index with `Ep n of N · title` and a fractional floor", () => {
    const [item] = buildContinue([{ seriesSlug: "a-study-in-scarlet", ep: 7, at: 1 }], index);
    expect(item).toEqual({ key: "a-study-in-scarlet/ep-07", title: "A Study in Scarlet", sub: "Ep 7 of 14 · Light in the Darkness", href: "/movies/a-study-in-scarlet/ep-07", image: "/ep7.jpg", progress: 0.5 });
  });
  it("prefers an explicit 0..1 progress, drops unknowns, honours limit", () => {
    expect(buildContinue([{ seriesSlug: "a-study-in-scarlet", ep: 2, at: 1, progress: 0.25 }], index)[0].progress).toBe(0.25);
    expect(buildContinue([{ seriesSlug: "a-study-in-scarlet", ep: 2, at: 1, progress: 7 }], index)[0].progress).toBeCloseTo(2 / 14);
    expect(buildContinue([{ seriesSlug: "zzz", ep: 1, at: 1 }, { seriesSlug: "a-study-in-scarlet", ep: 0, at: 1 }], index)).toEqual([]);
    const many = [1, 2, 3, 4].map((ep) => ({ seriesSlug: "a-study-in-scarlet", ep, at: ep }));
    expect(buildContinue(many, index)).toHaveLength(3);
    expect(buildContinue(many, index, 1)).toHaveLength(1);
  });
});
