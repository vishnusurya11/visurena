import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusLine, Button, StateChip, ProgressBar } from "./primitives";

describe("StatusLine", () => {
  it("joins the parts with a middle dot and drops empties", () => {
    const { container } = render(<StatusLine parts={["Series", "Complete", "", null, undefined, false, "14 episodes"]} />);
    expect(container.querySelector("[data-status-line]")).toHaveTextContent("Series · Complete · 14 episodes");
  });
  it("colours only the first part when accentFirst", () => {
    const { container } = render(<StatusLine parts={["Short story", "32 min"]} accentFirst />);
    const spans = container.querySelectorAll("[data-status-line] > span");
    expect(spans[0].className).toContain("text-vr-accent");
    expect(spans[spans.length - 1].className).not.toContain("text-vr-accent");
  });
  it("is mono, tabular and 13px by default, sizable", () => {
    const { container, rerender } = render(<StatusLine parts={["a"]} />);
    const el = container.querySelector<HTMLElement>("[data-status-line]")!;
    expect(el.className).toContain("font-mono");
    expect(el.className).toContain("tabular-nums");
    expect(el.style.fontSize).toBe("13px");
    rerender(<StatusLine parts={["a"]} size={12} />);
    expect(container.querySelector<HTMLElement>("[data-status-line]")!.style.fontSize).toBe("12px");
  });
});

describe("Button", () => {
  it("renders a link when href is given, a button otherwise", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button href="/movies">Start Ep 1</Button>);
    expect(screen.getByRole("link", { name: "Start Ep 1" })).toHaveAttribute("href", "/movies");
    rerender(<Button onClick={onClick}>Vote</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Vote" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("primary is warm white on black; secondary is a hairline; ghost is text only (no accent fills)", () => {
    const { rerender } = render(<Button variant="primary">A</Button>);
    expect(screen.getByRole("button").className).toContain("bg-vr-t1");
    rerender(<Button variant="secondary">A</Button>);
    expect(screen.getByRole("button").className).toContain("border-hair-2");
    rerender(<Button variant="ghost">A</Button>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");
    ["primary", "secondary", "ghost"].forEach((v) => {
      rerender(<Button variant={v as "primary"}>A</Button>);
      expect(screen.getByRole("button").className).not.toContain("bg-vr-accent");
    });
  });
  it("sizes: md 44px, sm 36px, full 48px wide", () => {
    const { rerender } = render(<Button>A</Button>);
    expect(screen.getByRole("button").className).toContain("h-11");
    rerender(<Button size="sm">A</Button>);
    expect(screen.getByRole("button").className).toContain("h-9");
    rerender(<Button size="full">A</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
  it("shows a subline, aria-pressed, aria-label, disabled and the sapphire focus ring", () => {
    render(<Button subline="Get the next story first" ariaPressed ariaLabel="Follow Stories" disabled>+ Follow</Button>);
    const b = screen.getByRole("button", { name: "Follow Stories" });
    expect(b).toHaveAttribute("aria-pressed", "true");
    expect(b).toBeDisabled();
    expect(b.className).toContain("focus-visible:outline-vr-sapphire");
    expect(screen.getByText("Get the next story first")).toBeInTheDocument();
  });
  it("external links open in a new tab safely", () => {
    render(<Button href="https://www.youtube.com/watch?v=x" external>Watch on YouTube ↗</Button>);
    const a = screen.getByRole("link", { name: "Watch on YouTube ↗" });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noreferrer");
  });
});

describe("StateChip", () => {
  it("labels each state in words, overridable", () => {
    const { rerender } = render(<StateChip state="in-production" />);
    expect(screen.getByText("In production")).toHaveAttribute("data-state", "in-production");
    rerender(<StateChip state="complete" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
    rerender(<StateChip state="airing" label="Ep 4 rendering" />);
    expect(screen.getByText("Ep 4 rendering")).toBeInTheDocument();
  });
  it("is a 12px mono label on bg-3 (text carries the state, not colour)", () => {
    render(<StateChip state="new" />);
    const c = screen.getByText("New");
    expect(c.className).toContain("font-mono");
    expect(c.className).toContain("text-[12px]");
    expect(c.className).toContain("bg-vr-bg3");
    expect(c.className).not.toContain("bg-vr-accent");
  });
});

describe("ProgressBar", () => {
  it("exposes a clamped percentage to assistive tech", () => {
    const { rerender } = render(<ProgressBar value={0.62} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62");
    rerender(<ProgressBar value={1.7} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<ProgressBar value={-1} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });
  it("fills with the accent (variable by default, hex when given, t3 when done)", () => {
    const { rerender } = render(<ProgressBar value={0.5} />);
    const fill = () => screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill().style.width).toBe("50%");
    expect(fill().getAttribute("style")).toContain("var(--vr-accent)");
    rerender(<ProgressBar value={0.5} accent="#E8B04B" />);
    expect((fill().style.background || fill().style.backgroundColor).toLowerCase()).toMatch(/#e8b04b|rgb\(232, 176, 75\)/);
    rerender(<ProgressBar value={1} done />);
    expect((fill().style.background || fill().style.backgroundColor).toLowerCase()).toMatch(/#7a7975|rgb\(122, 121, 117\)/);
  });
});
