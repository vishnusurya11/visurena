import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/pages/index";
import type { Story } from "@/lib/content";

const stories: Story[] = [
  {
    id: "sto_test",
    section: "stories",
    slug: "test-story",
    title: "Test Story",
    status: "live",
    createdAt: "2026-05-01",
    publishAt: "2026-05-01T00:00:00.000Z",
    accent: "#f5b831",
    genre: "Mystery",
    summary: "a quiet test blurb",
    kind: "short",
    readMinutes: 12,
    cover34: "",
    cover169: "",
  },
];

const games = [
  { slug: "test-game", title: "Test Game", description: "a test game", playUrl: "/games/test-game", thumbnail: "", duration: "Endless", tags: ["arcade"] },
];

describe("Home", () => {
  it("renders the hero and a 'New this week' row from real stories + games", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<Home stories={stories} games={games as any} />);
    expect(screen.getByText(/new this week/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Test Story/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Test Game/i).length).toBeGreaterThan(0);
  });
});
