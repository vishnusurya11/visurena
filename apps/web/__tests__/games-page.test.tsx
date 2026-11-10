import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GamesPage, {
  gameFormat,
  sessionMinutes,
  gameCaption,
  gameHref,
  gamesStatusParts,
  pickVotes,
  getStaticProps,
  type Game,
} from "@/pages/games";
import type { RequestItem } from "@/lib/requests";

const games: Game[] = [
  { id: "g1", slug: "cosmic-defense", title: "Cosmic Defense", thumbnail: "/images/cosmic-defense-thumb.svg", playUrl: "/games/cosmic-defense", duration: "Endless", tags: ["arcade", "shooter"], featured: true },
  { id: "g2", slug: "neon-tetris", title: "Neon Tetris", thumbnail: "/images/neon-tetris-thumb.svg", playUrl: "/games/neon-tetris", duration: "Level-based", tags: ["puzzle"] },
  { id: "g3", slug: "pong-championship", title: "Pong Championship", duration: "Match-based", tags: ["sports"] },
];

const requests: RequestItem[] = [
  { id: "req_frankenstein", title: "Frankenstein", format: "Episodes", votes: 517, state: "in-production", producedSlug: "frankenstein" },
  { id: "req_dracula", title: "Dracula", format: "Episodes", votes: 412, state: "voting" },
  { id: "req_more-arcade", title: "More arcade games", format: "Games", votes: 143, state: "voting" },
];

describe("game helpers", () => {
  it("gameFormat capitalises the first tag and defaults to Arcade", () => {
    expect(gameFormat({ tags: ["arcade", "shooter"] })).toBe("Arcade");
    expect(gameFormat({ tags: ["puzzle"] })).toBe("Puzzle");
    expect(gameFormat({})).toBe("Arcade");
    expect(gameFormat({ tags: [] })).toBe("Arcade");
  });
  it("sessionMinutes maps run structure to a session length", () => {
    expect(sessionMinutes({ duration: "Endless" })).toBe(5);
    expect(sessionMinutes({ duration: "Level-based" })).toBe(8);
    expect(sessionMinutes({ duration: "Match-based" })).toBe(3);
    expect(sessionMinutes({ duration: "Wave-based" })).toBe(6);
    expect(sessionMinutes({})).toBe(5);
  });
  it("gameCaption follows `Arcade · N min · Browser`", () => {
    expect(gameCaption(games[0])).toBe("Arcade · 5 min · Browser");
    expect(gameCaption(games[1])).toBe("Puzzle · 8 min · Browser");
  });
  it("gameHref prefers playUrl and falls back to /games/<slug>", () => {
    expect(gameHref(games[0])).toBe("/games/cosmic-defense");
    expect(gameHref(games[2])).toBe("/games/pong-championship");
  });
  it("gamesStatusParts counts games and genres", () => {
    expect(gamesStatusParts(games)).toEqual(["Arcade", "Playable", "3 games", "3 genres", "Browser", "Free"]);
    expect(gamesStatusParts([games[0]])).toEqual(["Arcade", "Playable", "1 game", "1 genre", "Browser", "Free"]);
  });
});

describe("getStaticProps", () => {
  it("keeps section='games', loads every configured game and 3 votes with Games first", async () => {
    const res = (await getStaticProps({} as never)) as { props: { section: string; games: Game[]; votes: RequestItem[] } };
    expect(res.props.section).toBe("games");
    expect(res.props.games.length).toBeGreaterThan(0);
    expect(res.props.games.every((g) => g.slug && g.title)).toBe(true);
    expect(res.props.votes).toHaveLength(3);
    expect(res.props.votes[0].format).toBe("Games");
  });
});

describe("GamesPage", () => {
  const votes = pickVotes(requests, "Games");
  function renderPage() {
    return render(<GamesPage section="games" games={games} votes={votes} totalVotes={2850} openRequests={312} />);
  }

  it("renders the hub header with status line", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Games" })).toBeInTheDocument();
    expect(screen.getByText("3 games")).toBeInTheDocument();
    expect(document.querySelector("[data-vertical='games']")).not.toBeNull();
  });

  it("renders a 16:9 card per game linking to its play page with the status caption", () => {
    renderPage();
    const grid = screen.getByRole("list", { name: "Games" });
    const cards = within(grid).getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute("href", "/games/cosmic-defense");
    expect(cards[2]).toHaveAttribute("href", "/games/pong-championship");
    expect(within(cards[0]).getByText("Arcade · 5 min · Browser")).toBeInTheDocument();
    expect(within(cards[1]).getByText("Neon Tetris")).toBeInTheDocument();
  });

  it("renders the vote strip with the Games request first", () => {
    renderPage();
    const strip = screen.getByRole("list", { name: "Requests" });
    const cards = within(strip).getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText("More arcade games")).toBeInTheDocument();
  });

  it("has no 'coming soon', tag-filter buttons or reveal wrappers", () => {
    const { container } = renderPage();
    expect(container.textContent).not.toMatch(/coming soon/i);
    expect(container.querySelector(".vr-fade")).toBeNull();
    expect(screen.queryByRole("button", { name: /^all$/i })).toBeNull();
  });
});
