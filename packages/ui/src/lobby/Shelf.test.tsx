import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Section, SectionHeader, Shelf } from "./Shelf";

describe("SectionHeader", () => {
  it("renders the title as an h2 with a 3px accent rule under it", () => {
    const { container } = render(<SectionHeader title="Stories" accent="#E8B04B" />);
    expect(screen.getByRole("heading", { level: 2, name: "Stories" })).toBeInTheDocument();
    const rule = container.querySelector<HTMLElement>("[data-rule]")!;
    expect(rule.className).toContain("h-[3px]");
    expect((rule.style.background || rule.style.backgroundColor).toLowerCase()).toMatch(/#e8b04b|rgb\(232, 176, 75\)/);
  });

  it("defaults the rule to the room accent variable", () => {
    const { container } = render(<SectionHeader title="Movies" />);
    expect(container.querySelector("[data-rule]")!.getAttribute("style")).toContain("var(--vr-accent)");
  });

  it("puts meta on the right when there is no link, under the title when there is", () => {
    const { container, rerender } = render(<SectionHeader title="New this week" meta="Across the studio · 8 releases" />);
    const meta = container.querySelector("[data-meta]")!;
    expect(meta).toHaveTextContent("Across the studio · 8 releases");
    expect(meta.parentElement).toBe(container.querySelector("[data-section-header]"));

    rerender(<SectionHeader title="Stories" meta="7 stories" href="/stories" hrefLabel="All stories →" />);
    const link = screen.getByRole("link", { name: "All stories →" });
    expect(link).toHaveAttribute("href", "/stories");
    const under = container.querySelector("[data-meta]")!;
    expect(under.parentElement).toBe(screen.getByRole("heading").parentElement);
  });

  it("supports h3 and a default link label", () => {
    render(<SectionHeader title="Episodes" as="h3" href="/movies/x" />);
    expect(screen.getByRole("heading", { level: 3, name: "Episodes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See all →" })).toBeInTheDocument();
  });
});

describe("Shelf", () => {
  it("is a labelled list that snaps and bleeds into the gutter", () => {
    render(<Shelf ariaLabel="Stories rail"><span role="listitem">a</span><span role="listitem">b</span></Shelf>);
    const list = screen.getByRole("list", { name: "Stories rail" });
    expect(list.className).toContain("snap-x");
    expect(list.className).toContain("-mx-4");
    expect(list.className).toContain("scrollbar-hide");
    expect(list.style.gap).toBe("16px");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("takes a custom gap", () => {
    render(<Shelf gap={12}><span /></Shelf>);
    expect(screen.getByRole("list").style.gap).toBe("12px");
  });
});

describe("Section", () => {
  it("renders a section with the lobby vertical rhythm", () => {
    const { container } = render(<Section ariaLabel="Games"><p>x</p></Section>);
    const sec = container.querySelector("section")!;
    expect(sec).toHaveAttribute("aria-label", "Games");
    expect(sec.className).toContain("pt-6");
    expect(sec).toHaveTextContent("x");
  });
});
