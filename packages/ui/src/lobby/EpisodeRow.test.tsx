import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EpisodeRow } from "./EpisodeRow";

const base = { n: 4, title: "What John Rance Had to Tell", href: "/movies/a-study-in-scarlet/ep-04", runtime: "10:04" };

describe("EpisodeRow (series page)", () => {
  it("shows the zero-padded number, title and runtime, linking to the episode", () => {
    render(<EpisodeRow {...base} date="12 Sep" />);
    const row = screen.getByRole("link");
    expect(row).toHaveAttribute("href", base.href);
    expect(row).toHaveAttribute("data-episode-row");
    expect(row).not.toHaveAttribute("data-compact");
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText(base.title)).toBeInTheDocument();
    expect(screen.getByText("10:04 · 12 Sep")).toBeInTheDocument();
  });

  it("renders the still at 56×100 with its object-position", () => {
    const { container } = render(<EpisodeRow {...base} still="/movies/a-study-in-scarlet/ep04.jpg" stillPosition="50% 20%" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/movies/a-study-in-scarlet/ep04.jpg");
    expect(img.style.objectPosition).toBe("50% 20%");
    expect(img.parentElement!.className).toContain("h-[100px]");
    expect(img.parentElement!.className).toContain("w-14");
  });

  it("marks watched with a tick and current with aria-current, accent edge and Now playing", () => {
    const { rerender } = render(<EpisodeRow {...base} watched />);
    expect(screen.getByText("10:04 · Watched ✓")).toBeInTheDocument();
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
    rerender(<EpisodeRow {...base} current />);
    const row = screen.getByRole("link");
    expect(row).toHaveAttribute("aria-current", "true");
    expect(row.className).toContain("border-l-vr-accent");
    expect(screen.getByText("10:04 · Now playing")).toBeInTheDocument();
  });

  it("shows a progress bar for partial progress only", () => {
    const { rerender } = render(<EpisodeRow {...base} progress={0.62} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62");
    rerender(<EpisodeRow {...base} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    rerender(<EpisodeRow {...base} progress={0.62} watched />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});

describe("EpisodeRow compact (episode panel)", () => {
  it("is a 72px row with the runtime on the right and a 40×71 thumb", () => {
    const { container } = render(<EpisodeRow {...base} compact still="/s.jpg" />);
    const row = screen.getByRole("link");
    expect(row).toHaveAttribute("data-compact");
    expect(row.className).toContain("h-[72px]");
    expect(screen.getByText("10:04")).toBeInTheDocument();
    expect(container.querySelector("img")!.parentElement!.className).toContain("h-[71px]");
  });

  it("pins the current row (sticky) with the accent edge", () => {
    render(<EpisodeRow {...base} compact current />);
    const row = screen.getByRole("link");
    expect(row).toHaveAttribute("aria-current", "true");
    expect(row.className).toContain("sticky");
    expect(row.className).toContain("border-l-vr-accent");
  });

  it("shows a full t3 bar when watched and an accent bar for progress", () => {
    const { rerender } = render(<EpisodeRow {...base} compact watched />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    const fill = bar.firstElementChild as HTMLElement;
    expect((fill.style.background || fill.style.backgroundColor).toLowerCase()).toMatch(/#7a7975|rgb\(122, 121, 117\)/);
    rerender(<EpisodeRow {...base} compact progress={0.4} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    rerender(<EpisodeRow {...base} compact />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
