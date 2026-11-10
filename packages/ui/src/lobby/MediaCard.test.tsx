import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MediaCard } from "./MediaCard";
import { RATIO_CSS } from "./types";

function bg(el: Element | null) {
  const s = (el as HTMLElement | null)?.style;
  return (s?.background || s?.backgroundColor || "").toLowerCase();
}

describe("MediaCard", () => {
  it("is a link to the item, titled, with the ratio on the poster", () => {
    const { container } = render(<MediaCard href="/stories/falls-water" title="Falls Water" ratio="3:4" image="/x.jpg" />);
    const link = screen.getByRole("listitem");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/stories/falls-water");
    expect(link).toHaveAttribute("data-ratio", "3:4");
    expect(screen.getByText("Falls Water")).toBeInTheDocument();
    const poster = container.querySelector<HTMLElement>("[data-poster]")!;
    expect(poster.getAttribute("style")).toContain("aspect-ratio");
    expect(RATIO_CSS["3:4"]).toBe("3 / 4");
  });

  it("uses the hover class that globals.css scopes to (hover:hover) and (pointer:fine)", () => {
    render(<MediaCard href="/x" title="X" ratio="1:1" />);
    expect(screen.getByRole("listitem").className).toContain("lobby-card");
    expect(screen.getByRole("listitem").className).toContain("focus-visible:outline-vr-sapphire");
  });

  it("renders the image with object-position, lazy by default, eager when priority", () => {
    const { container, rerender } = render(<MediaCard href="/x" title="X" ratio="2:3" image="/still.jpg" imagePosition="50% 20%" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/still.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img.style.objectPosition).toBe("50% 20%");
    rerender(<MediaCard href="/x" title="X" ratio="2:3" image="/still.jpg" priority imageAlt="Ep 4 still" />);
    expect(container.querySelector("img")).toHaveAttribute("loading", "eager");
    expect(container.querySelector("img")).toHaveAttribute("alt", "Ep 4 still");
  });

  it("scales a 16:9 still cropped into a tall box (1.2; 1.04 on 9:16)", () => {
    const { container, rerender } = render(<MediaCard href="/x" title="X" ratio="2:3" image="/s.jpg" still />);
    expect(container.querySelector("img")!.style.transform).toBe("scale(1.2)");
    rerender(<MediaCard href="/x" title="X" ratio="9:16" image="/s.jpg" still />);
    expect(container.querySelector("img")!.style.transform).toBe("scale(1.04)");
    rerender(<MediaCard href="/x" title="X" ratio="9:16" image="/s.jpg" />);
    expect(container.querySelector("img")!.style.transform).toBe("");
  });

  it("falls back to a typeset cover when there is no artwork (never empty)", () => {
    const { container } = render(<MediaCard href="/movies/frankenstein" title="Frankenstein" ratio="2:3" kind="Series" />);
    expect(container.querySelector("img")).toBeNull();
    const cover = container.querySelector("[data-typeset]")!;
    expect(cover).toHaveTextContent("Frankenstein");
    expect(cover).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the kind chip in its accent and the ep chip in t1", () => {
    const { container } = render(<MediaCard href="/x" title="X" ratio="2:3" image="/s.jpg" kind="Episode" kindAccent="#3DD68C" chip="Ep 14" />);
    const kind = container.querySelector<HTMLElement>("[data-kind]")!;
    expect(kind).toHaveTextContent("Episode");
    expect(kind.style.color.toLowerCase()).toMatch(/#3dd68c|rgb\(61, 214, 140\)/);
    expect(container.querySelector("[data-chip]")).toHaveTextContent("Ep 14");
  });

  it("caption sits above the title and carries the watched tick", () => {
    const { container, rerender } = render(<MediaCard href="/x" title="A Mr. Sherlock Holmes" ratio="2:3" image="/s.jpg" caption="Ep 1 · 10:12" />);
    const cap = container.querySelector("[data-caption]")!;
    expect(cap).toHaveTextContent("Ep 1 · 10:12");
    expect(cap.compareDocumentPosition(screen.getByText("A Mr. Sherlock Holmes")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    rerender(<MediaCard href="/x" title="A Mr. Sherlock Holmes" ratio="2:3" image="/s.jpg" caption="Ep 1 · 10:12" watched />);
    expect(container.querySelector("[data-caption]")).toHaveTextContent("Ep 1 · 10:12 ✓");
  });

  it("draws the floor line only for progress or watched state", () => {
    const { container, rerender } = render(<MediaCard href="/x" title="X" ratio="2:3" />);
    expect(container.querySelector("[data-floor]")).toBeNull();

    rerender(<MediaCard href="/x" title="X" ratio="2:3" progress={0.62} accent="#3DD68C" />);
    const fill = container.querySelector<HTMLElement>("[data-floor] > span")!;
    expect(fill.style.width).toBe("62%");
    expect(bg(fill)).toMatch(/#3dd68c|rgb\(61, 214, 140\)/);

    rerender(<MediaCard href="/x" title="X" ratio="2:3" watched />);
    const done = container.querySelector<HTMLElement>("[data-floor] > span")!;
    expect(done.style.width).toBe("100%");
    expect(bg(done)).toMatch(/#7a7975|rgb\(122, 121, 117\)/);
  });

  it("defaults the floor line to the room accent variable", () => {
    const { container } = render(<MediaCard href="/x" title="X" ratio="2:3" progress={0.5} />);
    const fill = container.querySelector<HTMLElement>("[data-floor] > span")!;
    expect(fill.getAttribute("style")).toContain("var(--vr-accent)");
  });

  it("clamps progress into 0..1", () => {
    const { container } = render(<MediaCard href="/x" title="X" ratio="2:3" progress={4} />);
    expect(container.querySelector<HTMLElement>("[data-floor] > span")!.style.width).toBe("100%");
  });

  it("renders the play glyph and honours width / lit", () => {
    const { container } = render(<MediaCard href="/x" title="Trailer" ratio="9:16" image="/t.jpg" playGlyph width={160} lit />);
    expect(container.querySelector("[data-play] svg")).toHaveAttribute("data-icon", "play");
    expect(screen.getByRole("listitem").style.width).toBe("160px");
    expect(container.querySelector("[data-poster]")!.className).toContain("rgba(255,255,255,0.14)");
  });
});
