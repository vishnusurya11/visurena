import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BottomTabs, BOTTOM_TABS } from "./BottomTabs";

describe("BottomTabs", () => {
  it("renders Home · Stories · Movies · Music · Games in order with their routes", () => {
    render(<BottomTabs />);
    const nav = screen.getByRole("navigation", { name: "Tabs" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(["Home", "Stories", "Movies", "Music", "Games"]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/stories", "/movies", "/music", "/games"]);
    expect(BOTTOM_TABS).toHaveLength(5);
  });

  it("is hidden from 768px up (md:hidden) and sits fixed at the bottom", () => {
    const { container } = render(<BottomTabs />);
    const nav = container.querySelector("[data-bottom-tabs]")!;
    expect(nav.className).toContain("md:hidden");
    expect(nav.className).toContain("fixed");
    expect(nav.className).toContain("bottom-0");
  });

  it("marks the active tab with aria-current and strokes its icon in the vertical accent", () => {
    render(<BottomTabs active="music" />);
    const nav = screen.getByRole("navigation", { name: "Tabs" });
    const music = within(nav).getByRole("link", { name: "Music" });
    expect(music).toHaveAttribute("aria-current", "page");
    const icon = music.querySelector("svg") as SVGElement;
    expect(icon.style.color.toLowerCase()).toMatch(/#f0537a|rgb\(240, 83, 122\)/);
    expect(icon.getAttribute("stroke")).toBe("currentColor");
    ["Home", "Stories", "Movies", "Games"].forEach((l) => {
      const a = within(nav).getByRole("link", { name: l });
      expect(a).not.toHaveAttribute("aria-current");
      expect((a.querySelector("svg") as SVGElement).style.color).toBe("");
    });
  });

  it("uses sapphire for the Home tab (system colour, not a vertical)", () => {
    render(<BottomTabs active="home" />);
    const home = screen.getByRole("link", { name: "Home" });
    expect((home.querySelector("svg") as SVGElement).style.color.toLowerCase()).toMatch(/#6c9bff|rgb\(108, 155, 255\)/);
  });

  it("every icon is 24px and every item is a 48px square target", () => {
    const { container } = render(<BottomTabs />);
    container.querySelectorAll("[data-tab]").forEach((a) => {
      expect(a.className).toContain("h-12");
      expect(a.className).toContain("w-12");
      expect(a.querySelector("svg")).toHaveAttribute("width", "24");
    });
  });
});
