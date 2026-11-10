import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { getSeriesList, seriesStatusParts } from "@/lib/movies";
import { YouTubeLite } from "@/components/movies/YouTubeLite";
import { Poster } from "@/components/movies/Poster";
import { CastShelf } from "@/components/movies/CastShelf";
import { EpisodePanel } from "@/components/movies/EpisodePanel";
import { PlayerStage } from "@/components/movies/PlayerStage";
import { SeriesHeader } from "@/components/movies/SeriesHeader";
import { SeriesTabs, availableTabs } from "@/components/movies/SeriesTabs";
import { SeriesCard } from "@/components/movies/SeriesCard";
import { SlateVotes } from "@/components/movies/SlateVotes";
import { FollowButton, ShareButton } from "@/components/movies/actions";

const real = getSeriesList();
const scarlet = real.find((s) => s.slug === "a-study-in-scarlet")!;
const franken = real.find((s) => s.slug === "frankenstein")!;
const scarletParts = seriesStatusParts(scarlet);
const frankenParts = seriesStatusParts(franken);
const ep4 = scarlet.episodes[3];
const EMBED = "https://www.youtube-nocookie.com/embed/WN2ktyq8tr0?rel=0&modestbranding=1&playsinline=1&autoplay=1";
const WATCH = "https://www.youtube.com/watch?v=WN2ktyq8tr0";

describe("YouTubeLite", () => {
  it("renders the still + play button and no iframe until clicked; keeps a visible Watch on YouTube link", () => {
    const onPlay = vi.fn();
    const { container } = render(<YouTubeLite embedUrl={EMBED} watchUrl={WATCH} title="Episode 4 · What John Rance Had to Tell" still="/movies/a-study-in-scarlet/ep04.jpg" runtime="10:04" onPlay={onPlay} />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByText("Click to load on YouTube · 10:04")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Watch on YouTube ↗" });
    expect(link).toHaveAttribute("href", WATCH);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");

    fireEvent.click(screen.getByRole("button", { name: /Play Episode 4/ }));
    const iframe = container.querySelector("iframe")!;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("src")).toBe(EMBED);
    expect(iframe.getAttribute("src")).toContain("youtube-nocookie.com");
    expect(iframe.getAttribute("src")).toContain("autoplay=1");
    // the iframe fills the aspect box (no aspect of its own)
    expect(iframe.className).toContain("inset-0");
    expect(iframe.style.aspectRatio).toBe("");
    expect((container.querySelector("[data-player-box]") as HTMLElement).style.aspectRatio).toBe("9 / 16");
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[data-youtube-lite]")?.getAttribute("data-youtube-lite")).toBe("loaded");
    // the link survives the swap
    expect(screen.getByRole("link", { name: "Watch on YouTube ↗" })).toBeInTheDocument();
  });

  it("box aspect follows the aspect prop and the still is object-fit: cover", () => {
    const { container } = render(<YouTubeLite embedUrl={EMBED} watchUrl={WATCH} title="Ep" still="/s.jpg" aspect="1:1" />);
    const box = container.querySelector("[data-player-box]") as HTMLElement;
    expect(box.style.aspectRatio).toBe("1 / 1");
    expect(container.querySelector("img")?.className).toContain("object-cover");
  });

  it("hides a broken still instead of showing a broken image", () => {
    const { container } = render(<YouTubeLite embedUrl={EMBED} watchUrl={WATCH} title="Ep" still="/missing.jpg" />);
    const img = container.querySelector("img")!;
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("button", { name: /Play/ })).toBeInTheDocument();
  });
});

describe("Poster", () => {
  it("typesets when there is no src, and falls back on image error", () => {
    const { container, rerender } = render(<Poster alt="x" title="Frankenstein" who="Mary Shelley · 1818" chip="In production" state="Script ✓ · Cast ✓" />);
    expect(container.querySelector("[data-poster]")?.getAttribute("data-poster")).toBe("typeset");
    expect(screen.getByText("Frankenstein")).toBeInTheDocument();
    expect(screen.getByText("In production")).toBeInTheDocument();
    expect(screen.getByText("Script ✓ · Cast ✓")).toBeInTheDocument();

    rerender(<Poster src="/movies/frankenstein/poster.jpg" alt="Frankenstein poster" title="Frankenstein" who="Mary Shelley · 1818" chip="In production" />);
    expect(container.querySelector("[data-poster]")?.getAttribute("data-poster")).toBe("image");
    fireEvent.error(screen.getByRole("img", { name: "Frankenstein poster" }));
    expect(container.querySelector("[data-poster]")?.getAttribute("data-poster")).toBe("typeset");
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("CastShelf", () => {
  it("renders portraits and swaps a broken portrait for initials", () => {
    const { container } = render(<CastShelf cast={scarlet.cast} />);
    expect(container.querySelectorAll("[data-cast-member]")).toHaveLength(6);
    expect(screen.getByText("Consulting detective")).toBeInTheDocument();
    const img = screen.getByRole("img", { name: "Tobias Gregson" });
    fireEvent.error(img);
    expect(screen.getByLabelText("Tobias Gregson")).toHaveTextContent("TG");
  });
  it("renders initials when no portrait is given, nothing when the cast is empty", () => {
    const { container } = render(<CastShelf cast={[{ id: "l", name: "Inspector Lestrade", role: "Scotland Yard" }]} />);
    expect(container.querySelector("[data-initials]")).toHaveTextContent("L");
    const empty = render(<CastShelf cast={[]} />);
    expect(empty.container.querySelector("[data-cast-shelf]")).toBeNull();
  });
});

describe("EpisodePanel", () => {
  it("lists every episode compactly, pins the current one, and switches tabs", () => {
    const { container } = render(<EpisodePanel series={scarlet} current={ep4} statusParts={scarletParts} progress={{ seriesSlug: scarlet.slug, ep: 7, at: 1 }} />);
    expect(container.querySelectorAll("[data-episode-row]")).toHaveLength(14);
    const pinned = container.querySelector("[data-pinned] [data-episode-row]")!;
    expect(pinned).toHaveAttribute("aria-current", "true");
    expect(pinned).toHaveTextContent("What John Rance Had to Tell");
    expect(container.querySelector("[data-pinned]")!.className).toContain("sticky");
    // watched state comes from progress (eps 1–6 → done bars); the rest have no bar
    const bars = container.querySelectorAll("#panel-episodes [role='progressbar']");
    expect(bars).toHaveLength(6);

    expect(screen.getByRole("tab", { name: "Episodes" })).toHaveAttribute("aria-selected", "true");
    expect(container.querySelector("#panel-chapters")).toHaveAttribute("hidden");
    fireEvent.click(screen.getByRole("tab", { name: "Chapters" }));
    expect(container.querySelector("#panel-chapters")).not.toHaveAttribute("hidden");
    expect(container.querySelector("#panel-episodes")).toHaveAttribute("hidden");
    expect(screen.getByText("Chapter 4 of the novel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "About" }));
    expect(within(container.querySelector("#panel-about")!).getByText(scarlet.synopsis)).toBeInTheDocument();
    expect(within(container.querySelector("#panel-about")!).getByText(/Adapted from the 1887 novel by Arthur Conan Doyle/)).toBeInTheDocument();
  });
});

describe("PlayerStage", () => {
  it("breadcrumb, stage, meta, prev/next, up next and provenance line", () => {
    const onPlay = vi.fn();
    const { container } = render(
      <PlayerStage series={scarlet} episode={ep4} prev={scarlet.episodes[2]} next={scarlet.episodes[4]} embedUrl={EMBED} watchUrl={WATCH} statusParts={scarletParts} progress={null} onPlay={onPlay} />,
    );
    const crumb = container.querySelector("[data-breadcrumb]")!;
    expect(crumb).toHaveTextContent("Movies › A Study in Scarlet › Ep 4 of 14");
    expect(within(crumb as HTMLElement).getByRole("link", { name: "A Study in Scarlet" })).toHaveAttribute("href", "/movies/a-study-in-scarlet");
    expect(container.querySelector("[data-ambient-glow]")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "What John Rance Had to Tell" })).toBeInTheDocument();
    expect(container.querySelector("[data-episode-meta] [data-status-line]")).toHaveTextContent(`Ep 4 · ${ep4.runtime} · Chapter 4`);
    expect(screen.getByRole("link", { name: "‹ Ep 3" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-03");
    expect(screen.getByRole("link", { name: "Ep 5 ›" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-05");
    const up = container.querySelector("[data-up-next]")!;
    expect(up).toHaveTextContent("Up next");
    expect(up).toHaveTextContent("Ep 5 · Our Advertisement Brings a Visitor");
    expect(container.querySelector("[data-provenance]")).toHaveTextContent("Every frame generated with AI. Every cut chosen by one person.");
    expect(container.querySelector("[data-episode-panel]")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Play Episode 4/ }));
    expect(onPlay).toHaveBeenCalled();
  });
  it("stage aspect follows the episode: 1:1 → square box, 9:16 → portrait, 16:9 → wide with the panel below", () => {
    const square = { ...ep4, aspect: "1:1" as const };
    const r1 = render(<PlayerStage series={scarlet} episode={square} embedUrl={EMBED} watchUrl={WATCH} statusParts={scarletParts} aspect="1:1" />);
    let box = r1.container.querySelector("[data-player-box]") as HTMLElement;
    expect(box.style.aspectRatio).toBe("1 / 1");
    expect(box.getAttribute("data-aspect")).toBe("1:1");
    expect(r1.container.querySelector("[data-player-stage]")?.getAttribute("data-aspect")).toBe("1:1");
    expect(r1.container.querySelector("[data-stage-row]")?.className).toContain("lg:flex-row");
    fireEvent.click(r1.getByRole("button", { name: /Play Episode 4/ }));
    const iframe = r1.container.querySelector("[data-player-box] iframe") as HTMLElement;
    expect(iframe.className).toContain("inset-0");
    expect(iframe.style.aspectRatio).toBe("");
    r1.unmount();

    // no explicit aspect prop → derived from episode.aspect ?? series.aspect
    const portraitSeries = { ...scarlet, aspect: "9:16" as const };
    const r2 = render(<PlayerStage series={portraitSeries} episode={{ ...ep4, aspect: undefined }} embedUrl={EMBED} watchUrl={WATCH} statusParts={scarletParts} />);
    box = r2.container.querySelector("[data-player-box]") as HTMLElement;
    expect(box.style.aspectRatio).toBe("9 / 16");
    expect(box.className).toContain("lg:h-[min(calc(100vh_-_108px),800px)]");
    r2.unmount();

    const r3 = render(<PlayerStage series={portraitSeries} episode={{ ...ep4, aspect: "16:9" }} embedUrl={EMBED} watchUrl={WATCH} statusParts={scarletParts} />);
    box = r3.container.querySelector("[data-player-box]") as HTMLElement;
    expect(box.style.aspectRatio).toBe("16 / 9");
    expect(r3.container.querySelector("[data-stage-row]")?.className).not.toContain("lg:flex-row");
    expect(box.className).toBe("relative overflow-hidden rounded-card border border-hair bg-vr-bg1 w-full");
  });

  it("last episode: no Next, up-next points back to the series", () => {
    const last = scarlet.episodes[13];
    const { container } = render(<PlayerStage series={scarlet} episode={last} prev={scarlet.episodes[12]} embedUrl={EMBED} watchUrl={WATCH} statusParts={scarletParts} />);
    expect(screen.queryByRole("link", { name: /Ep 15/ })).toBeNull();
    expect(container.querySelector("[data-up-next]")).toHaveAttribute("href", "/movies/a-study-in-scarlet");
    expect(container.querySelector("[data-up-next]")).toHaveTextContent("Back to A Study in Scarlet");
  });
});

describe("SeriesHeader", () => {
  it("released series without progress: Start Ep 1 · Trailer · + Follow · Share", () => {
    const onTrailer = vi.fn();
    render(<SeriesHeader series={scarlet} statusParts={scarletParts} progress={null} onTrailer={onTrailer} />);
    expect(screen.getByRole("heading", { level: 1, name: "A Study in Scarlet" })).toBeInTheDocument();
    expect(screen.getByText("Sherlock Holmes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start Ep 1" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-01");
    expect(screen.queryByText(/Continue Ep/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Trailer" }));
    expect(onTrailer).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "+ Follow" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByText("Played on YouTube · Audiobook 4 h 51 min · Casebook · Cast sheets")).toBeInTheDocument();
  });
  it("with progress: Continue Ep 7 primary plus a Start Ep 1 secondary", () => {
    render(<SeriesHeader series={scarlet} statusParts={scarletParts} progress={{ seriesSlug: scarlet.slug, ep: 7, at: 1 }} />);
    expect(screen.getByRole("link", { name: "Continue Ep 7" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-07");
    expect(screen.getByRole("link", { name: "Start Ep 1" })).toBeInTheDocument();
  });
  it("in-production series: production state, Chosen by 517 votes, Follow CTA, typeset poster fallback", () => {
    const { container } = render(<SeriesHeader series={franken} statusParts={frankenParts} />);
    expect(container.querySelector("[data-status-line]")).toHaveTextContent("Series · In production · Script ✓ · Cast ✓ · Ep 1 rendering · Chosen by 517 votes");
    expect(screen.queryByText(/Start Ep 1/)).toBeNull();
    const follow = screen.getByRole("button", { name: "+ Follow" });
    fireEvent.click(follow);
    expect(screen.getByRole("button", { name: "Following ✓" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.error(screen.getByRole("img", { name: "Frankenstein poster" }));
    expect(container.querySelector("[data-poster]")?.getAttribute("data-poster")).toBe("typeset");
    expect(screen.getByText("Mary Shelley · 1818")).toBeInTheDocument();
  });
  it("renders the aside column when given", () => {
    const { container } = render(<SeriesHeader series={scarlet} statusParts={scarletParts} aside={<div data-testid="aside">rows</div>} />);
    expect(container.querySelector("[data-series-aside]")).toHaveTextContent("rows");
  });
});

describe("SeriesTabs", () => {
  it("shows Cast · Audiobook · Casebook · About for Scarlet; audiobook lives here", () => {
    expect(availableTabs(scarlet).map((t) => t.id)).toEqual(["cast", "audiobook", "casebook", "about"]);
    const { container } = render(<SeriesTabs series={scarlet} />);
    expect(screen.getByRole("tab", { name: "Cast" })).toHaveAttribute("aria-selected", "true");
    expect(container.querySelectorAll("[data-cast-member]")).toHaveLength(6);
    fireEvent.click(screen.getByRole("tab", { name: "Audiobook" }));
    expect(container.querySelector("#series-panel-audiobook")).not.toHaveAttribute("hidden");
    expect(container.querySelector("#series-panel-audiobook [data-status-line]")).toHaveTextContent("Audiobook · 4 h 51 min · 14 chapters · 1887");
    fireEvent.click(screen.getByRole("tab", { name: "Casebook" }));
    expect(within(container.querySelector("#series-panel-casebook")!).getByText("The Conclusion")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "About the adaptation" }));
    expect(within(container.querySelector("#series-panel-about")!).getByText(/Arthur Conan Doyle's 1887 novel/)).toBeInTheDocument();
  });
  it("in-production series only gets About", () => {
    expect(availableTabs(franken).map((t) => t.id)).toEqual(["about"]);
    render(<SeriesTabs series={franken} />);
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    expect(screen.getByText(/Mary Shelley's 1818 novel/)).toBeInTheDocument();
  });
});

describe("SeriesCard", () => {
  it("released: Start Ep 1 + Trailer; in production: Follow + typeset poster", () => {
    const { container } = render(
      <>
        <SeriesCard series={scarlet} statusParts={scarletParts} progress={null} />
        <SeriesCard series={franken} statusParts={frankenParts} progress={null} />
      </>,
    );
    expect(screen.getByRole("link", { name: "Start Ep 1" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-01");
    expect(screen.getByRole("link", { name: "Trailer" })).toHaveAttribute("href", "/movies/a-study-in-scarlet#trailer");
    expect(screen.getByText("Next series")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Follow" })).toBeInTheDocument();
    const fr = container.querySelector('[data-series-card="frankenstein"]') as HTMLElement;
    expect(fr).toHaveTextContent("Chosen by 517 votes");
    fireEvent.error(within(fr).getByRole("img", { name: "Frankenstein poster" }));
    expect(fr.querySelector("[data-poster]")?.getAttribute("data-poster")).toBe("typeset");
  });
  it("with progress shows Continue Ep N", () => {
    render(<SeriesCard series={scarlet} statusParts={scarletParts} progress={{ seriesSlug: scarlet.slug, ep: 7, at: 1 }} />);
    expect(screen.getByRole("link", { name: "Continue Ep 7" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-07");
  });
});

describe("SlateVotes", () => {
  const items = [
    { id: "f", title: "Frankenstein", author: "Mary Shelley", year: "1818", format: "Episodes", votes: 517, state: "in-production" as const, note: "Script ✓", href: "/movies/frankenstein" },
    { id: "d", title: "Dracula", author: "Bram Stoker", year: "1897", format: "Episodes", votes: 412, state: "voting" as const },
  ];
  it("grid renders VoteCards plus the Request a title card", () => {
    const { container } = render(<SlateVotes items={items} />);
    expect(container.querySelectorAll("[data-vote-card]")).toHaveLength(2);
    expect(container.querySelector("[data-request-card]")).toHaveTextContent("Request a title →");
    expect(screen.getByRole("link", { name: /Request a title/ })).toHaveAttribute("href", "/requests");
    expect(screen.getByText("517")).toBeInTheDocument();
  });
  it("rail without the request card", () => {
    const { container } = render(<SlateVotes items={items} layout="rail" requestCard={false} />);
    expect(container.querySelector("[data-shelf]")).not.toBeNull();
    expect(container.querySelector("[data-request-card]")).toBeNull();
  });
});

describe("actions", () => {
  it("FollowButton toggles", () => {
    render(<FollowButton title="X" />);
    const b = screen.getByRole("button", { name: "+ Follow" });
    expect(b).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(b);
    expect(screen.getByRole("button", { name: "Following ✓" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Following ✓" }));
    expect(screen.getByRole("button", { name: "+ Follow" })).toBeInTheDocument();
  });
  it("ShareButton copies the URL when Web Share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<ShareButton title="X" url="https://visurena.com/movies/x" />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    await screen.findByRole("button", { name: "Link copied" });
    expect(writeText).toHaveBeenCalledWith("https://visurena.com/movies/x");
  });
});
