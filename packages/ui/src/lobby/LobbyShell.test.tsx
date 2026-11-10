import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LobbyShell, LobbyNav, LobbyFooter, AI_LINE, TAGLINE, DEFAULT_FOOTER_COLUMNS } from "./LobbyShell";

const HEX = { stories: "#E8B04B", movies: "#3DD68C", music: "#F0537A", games: "#B48CF7" } as const;

/** jsdom may serialise a hex colour as rgb(); accept either. */
function bgOf(el: Element | null): string {
  const s = (el as HTMLElement | null)?.style;
  return (s?.background || s?.backgroundColor || "").toLowerCase();
}
function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
}
function expectColour(actual: string, hex: string) {
  expect([hex.toLowerCase(), hexToRgb(hex)]).toContain(actual);
}

describe("LobbyShell", () => {
  it("sets --vr-accent from the vertical and renders nav, main, footer and bottom tabs", () => {
    const { container } = render(<LobbyShell vertical="movies"><p>body</p></LobbyShell>);
    const root = container.querySelector<HTMLElement>("[data-vertical='movies']");
    expect(root).not.toBeNull();
    expect(root!.style.getPropertyValue("--vr-accent")).toBe(HEX.movies);
    expect(container.querySelector("[data-lobby-nav]")).not.toBeNull();
    expect(screen.getByRole("main")).toHaveTextContent("body");
    expect(container.querySelector("[data-lobby-footer]")).not.toBeNull();
    expect(container.querySelector("[data-bottom-tabs]")).not.toBeNull();
  });

  it("gives every vertical its own accent and home the warm white", () => {
    const seen = new Set<string>();
    (["stories", "movies", "music", "games"] as const).forEach((v) => {
      const { container, unmount } = render(<LobbyShell vertical={v}><span /></LobbyShell>);
      const accent = container.querySelector<HTMLElement>("[data-vertical]")!.style.getPropertyValue("--vr-accent");
      expect(accent).toBe(HEX[v]);
      seen.add(accent);
      unmount();
    });
    expect(seen.size).toBe(4);
    const { container } = render(<LobbyShell vertical="home"><span /></LobbyShell>);
    expect(container.querySelector<HTMLElement>("[data-vertical]")!.style.getPropertyValue("--vr-accent")).toBe("#F2F1EC");
  });

  it("marks the active vertical with aria-current and an underline in its accent", () => {
    render(<LobbyShell vertical="stories"><span /></LobbyShell>);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const active = within(nav).getByRole("link", { name: "Stories" });
    expect(active).toHaveAttribute("aria-current", "page");
    expectColour(bgOf(active.querySelector("[data-nav-underline]")), HEX.stories);
    ["Movies", "Music", "Games"].forEach((l) =>
      expect(within(nav).getByRole("link", { name: l })).not.toHaveAttribute("aria-current"));
  });

  it("on home no vertical link is current, but the Home tab is", () => {
    render(<LobbyShell vertical="home"><span /></LobbyShell>);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).queryAllByRole("link", { current: "page" })).toHaveLength(0);
    const tabs = screen.getByRole("navigation", { name: "Tabs" });
    expect(within(tabs).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("a studio page (Research) is current in the nav, takes the sapphire accent, and keeps Home's tab", () => {
    const { container } = render(<LobbyShell vertical="home" studio="research"><span /></LobbyShell>);
    expect(container.querySelector<HTMLElement>("[data-vertical]")!.style.getPropertyValue("--vr-accent")).toBe("#6C9BFF");
    expect(container.querySelector("[data-studio='research']")).not.toBeNull();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const research = within(nav).getByRole("link", { name: "Research" });
    expect(research).toHaveAttribute("aria-current", "page");
    expectColour(bgOf(research.querySelector("[data-nav-underline]")), "#6C9BFF");
    expect(within(nav).getByRole("link", { name: /Requests/ })).not.toHaveAttribute("aria-current");
  });

  it("the Requests studio page marks Requests current", () => {
    render(<LobbyShell vertical="home" studio="requests"><span /></LobbyShell>);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: /Requests/ })).toHaveAttribute("aria-current", "page");
  });

  it("passes nav props through and can hide the tabs", () => {
    const { container } = render(
      <LobbyShell vertical="movies" nav={{ requestsCount: 312, continueLabel: "Ep 7 · 4 min left", continueHref: "/movies/a-study-in-scarlet/ep-07" }} hideTabs>
        <span />
      </LobbyShell>
    );
    expect(container.querySelector("[data-bottom-tabs]")).toBeNull();
    expect(container.querySelector("[data-continue-pill]")).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-07");
    expect(screen.getByText("Ep 7 · 4 min left")).toBeInTheDocument();
  });
});

describe("LobbyNav", () => {
  it("renders the wordmark, the four verticals, then the studio pages Requests (with its count) and Research", () => {
    render(<LobbyNav requestsCount={312} />);
    expect(screen.getByRole("link", { name: "Visurena home" })).toHaveAttribute("href", "/");
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/stories", "/movies", "/music", "/games", "/requests", "/research",
    ]);
    expect(within(nav).getByRole("link", { name: /Requests \(312\)/ })).toBeInTheDocument();
  });

  it("underlines Requests in sapphire when it is the active page", () => {
    const { container } = render(<LobbyNav active="requests" />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const req = within(nav).getByRole("link", { name: /Requests/ });
    expect(req).toHaveAttribute("aria-current", "page");
    expectColour(bgOf(req.querySelector("[data-nav-underline]")), "#6C9BFF");
    expect(container.querySelector("[data-requests-chip]")).toHaveAttribute("aria-current", "page");
  });

  it("keeps a Requests chip for < 768px with the count in sapphire", () => {
    const { container } = render(<LobbyNav requestsCount={1204} />);
    const chip = container.querySelector("[data-requests-chip]")!;
    expect(chip).toHaveAttribute("href", "/requests");
    expect(chip.className).toContain("md:hidden");
    expect(chip.querySelector("b")).toHaveTextContent("1,204");
  });

  it("shows the Continue pill only with both label and href", () => {
    const { container, rerender } = render(<LobbyNav continueLabel="Ep 7 · 4 min left" />);
    expect(container.querySelector("[data-continue-pill]")).toBeNull();
    rerender(<LobbyNav continueLabel="Ep 7 · 4 min left" continueHref="/movies/x/ep-07" />);
    expect(container.querySelector("[data-continue-pill]")).toHaveAttribute("href", "/movies/x/ep-07");
  });

  it("renders search and account only when they have somewhere to go (no dead controls)", () => {
    const { rerender } = render(<LobbyNav />);
    expect(screen.queryByRole("link", { name: "Search" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Your account" })).toBeNull();
    rerender(<LobbyNav searchHref="/search" accountHref="/account" accountInitial="V" />);
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute("href", "/search");
    const avatar = screen.getByRole("link", { name: "Your account" });
    expect(avatar).toHaveAttribute("href", "/account");
    expect(avatar).toHaveTextContent("V");
  });

  it("uses no backdrop-filter or blur on the bar", () => {
    const { container } = render(<LobbyNav />);
    const header = container.querySelector("[data-lobby-nav]")!;
    expect(header.className).not.toMatch(/backdrop|blur/);
  });
});

describe("LobbyFooter", () => {
  it("renders the wordmark, tagline, the four vertical columns plus Studio, and the AI line", () => {
    render(<LobbyFooter />);
    expect(screen.getByText("VISURENA")).toBeInTheDocument();
    expect(screen.getByText(TAGLINE)).toBeInTheDocument();
    ["Stories", "Movies", "Music", "Games", "Studio"].forEach((h) =>
      expect(screen.getByRole("heading", { level: 4, name: h })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "All stories" })).toHaveAttribute("href", "/stories");
    expect(screen.getByRole("link", { name: "Request board" })).toHaveAttribute("href", "/requests");
    expect(screen.getByText(AI_LINE)).toBeInTheDocument();
    expect(screen.getByText(/© Visurena 2026/)).toBeInTheDocument();
    expect(DEFAULT_FOOTER_COLUMNS.map((c) => c.title)).toEqual(["Stories", "Movies", "Music", "Games", "Studio"]);
  });

  it("states the language as a line, not a dead select (translations are deferred)", () => {
    const { container } = render(<LobbyFooter />);
    expect(container.querySelector("select")).toBeNull();
    expect(container.querySelector("[data-language]")).toHaveTextContent("Language · English");
  });

  it("accepts custom columns", () => {
    render(<LobbyFooter columns={[{ title: "Movies", links: [{ label: "A Study in Scarlet", href: "/movies/a-study-in-scarlet" }] }]} />);
    expect(screen.getByRole("link", { name: "A Study in Scarlet" })).toHaveAttribute("href", "/movies/a-study-in-scarlet");
    expect(screen.queryByRole("heading", { name: "Studio" })).toBeNull();
  });
});
