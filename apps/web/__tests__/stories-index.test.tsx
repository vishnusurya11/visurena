import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StoriesPage, {
  pickVotes,
  storyCaption,
  formatReadTime,
  storiesStatusParts,
  getStaticProps,
} from "@/pages/stories/index";
import type { Story } from "@/lib/content";
import type { RequestItem } from "@/lib/requests";

function story(over: Partial<Story>): Story {
  return {
    id: "sto_x",
    section: "stories",
    slug: "x",
    title: "X",
    status: "live",
    createdAt: "2026-05-01",
    publishAt: "2026-05-01T00:00:00.000Z",
    accent: "#f5b831",
    kind: "short",
    ...over,
  };
}

const stories: Story[] = [
  story({ slug: "falls-water", title: "Falls Water", genre: "Coming-of-age", readMinutes: 32, cover34: "/stories/falls-water/cover_34.jpg" }),
  story({ slug: "as-promised", title: "As Promised", genre: "Drama", readMinutes: 18 }),
  story({ slug: "one-mitten", title: "One Mitten", genre: "Drama", readMinutes: 12 }),
];

const requests: RequestItem[] = [
  { id: "req_frankenstein", title: "Frankenstein", format: "Episodes", votes: 517, state: "in-production", producedSlug: "frankenstein" },
  { id: "req_dracula", title: "Dracula", format: "Episodes", votes: 412, state: "voting" },
  { id: "req_pride", title: "Pride and Prejudice", format: "Episodes", votes: 388, state: "voting" },
  { id: "req_more-arcade", title: "More arcade games", format: "Games", votes: 143, state: "voting" },
  { id: "req_horror", title: "A horror story collection", format: "Stories", votes: 128, state: "voting" },
];

describe("storyCaption", () => {
  it("follows `Short story · Genre · N min`", () => {
    expect(storyCaption(stories[0])).toBe("Short story · Coming-of-age · 32 min");
  });
  it("drops missing parts and maps kinds", () => {
    expect(storyCaption(story({ kind: "novel" }))).toBe("Novel");
    expect(storyCaption(story({ kind: "series", genre: "Mystery" }))).toBe("Series · Mystery");
  });
});

describe("formatReadTime", () => {
  it("formats minutes into h/min", () => {
    expect(formatReadTime(35)).toBe("35 min");
    expect(formatReadTime(60)).toBe("1 h");
    expect(formatReadTime(169)).toBe("2 h 49 min");
    expect(formatReadTime(0)).toBe("0 min");
    expect(formatReadTime(-5)).toBe("0 min");
  });
});

describe("storiesStatusParts", () => {
  it("counts stories, genres and total reading time", () => {
    expect(storiesStatusParts(stories)).toEqual(["Short stories", "Live", "3 stories", "2 genres", "1 h 2 min of reading"]);
  });
  it("singularises and omits empty counts", () => {
    expect(storiesStatusParts([story({})])).toEqual(["Short stories", "Live", "1 story"]);
  });
});

describe("pickVotes", () => {
  it("puts format matches first, then fills to n by votes", () => {
    expect(pickVotes(requests, "Stories").map((r) => r.id)).toEqual(["req_horror", "req_frankenstein", "req_dracula"]);
  });
  it("falls back to the top n by votes when nothing matches", () => {
    expect(pickVotes(requests, "Music").map((r) => r.id)).toEqual(["req_frankenstein", "req_dracula", "req_pride"]);
  });
  it("never exceeds n and handles empty input", () => {
    expect(pickVotes(requests, "Episodes", 2)).toHaveLength(2);
    expect(pickVotes([], "Stories")).toEqual([]);
  });
});

describe("getStaticProps", () => {
  it("keeps section='stories' and serves 3 votes with the Stories request first", async () => {
    const res = (await getStaticProps({} as never)) as { props: { section: string; stories: Story[]; votes: RequestItem[]; openRequests: number } };
    expect(res.props.section).toBe("stories");
    expect(Array.isArray(res.props.stories)).toBe(true);
    expect(res.props.votes).toHaveLength(3);
    expect(res.props.votes[0].format).toBe("Stories");
    expect(res.props.openRequests).toBeGreaterThan(0);
  });
});

describe("StoriesPage", () => {
  const votes = pickVotes(requests, "Stories");
  function renderPage() {
    return render(<StoriesPage section="stories" stories={stories} votes={votes} totalVotes={2850} openRequests={312} />);
  }

  it("renders the hub header with the status line and description", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Stories" })).toBeInTheDocument();
    expect(screen.getByText("3 stories")).toBeInTheDocument();
    expect(screen.getByText(/read in one sitting/i)).toBeInTheDocument();
    expect(document.querySelector("[data-vertical='stories']")).not.toBeNull();
  });

  it("renders one 3:4 card per story linking to its reader page", () => {
    renderPage();
    const grid = screen.getByRole("list", { name: "Stories" });
    const cards = within(grid).getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute("href", "/stories/falls-water");
    expect(within(cards[0]).getByText("Short story · Coming-of-age · 32 min")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Falls Water")).toBeInTheDocument();
  });

  it("renders the vote strip with three VoteCards, format matches first", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Vote on what's next" })).toBeInTheDocument();
    const strip = screen.getByRole("list", { name: "Requests" });
    const cards = within(strip).getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText("A horror story collection")).toBeInTheDocument();
    expect(within(cards[1]).getByRole("link", { name: /Frankenstein/ })).toHaveAttribute("href", "/movies/frankenstein");
    expect(screen.getByRole("link", { name: "Request board →" })).toHaveAttribute("href", "/requests");
  });

  it("shows no 'coming soon' and no hidden-at-first-paint wrappers", () => {
    const { container } = renderPage();
    expect(container.textContent).not.toMatch(/coming soon/i);
    expect(container.querySelector(".vr-fade")).toBeNull();
  });
});
