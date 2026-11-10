import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StoryPage from "@/pages/stories/[slug]";
import type { Story, StoryScene } from "@/lib/content";

const mockStory: Story & { scenes: StoryScene[] } = {
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
  scenes: [
    { title: "The First", prose: "Hello world.\n\nSecond paragraph here." },
    { title: "The Second", prose: "Another scene begins.\n\nWith another paragraph." },
  ],
};

describe("StoryReader (solid reading sheet behind prose)", () => {
  it("renders the read section with a solid background — nebula does NOT bleed through behind prose", () => {
    render(<StoryPage story={mockStory} related={[]} />);
    const read = document.getElementById("read");
    expect(read).toBeTruthy();
    const styleAttr = read!.getAttribute("style") || "";
    // The whole point of this rewrite: the reader has its own opaque surface.
    expect(styleAttr).toMatch(/background:\s*#[0-9a-fA-F]{3,6}|background:\s*rgb\(/);
    expect(styleAttr).not.toMatch(/transparent/i);
    expect(styleAttr).not.toMatch(/rgba\([^)]+,\s*0(\.0+)?\s*\)/); // not fully transparent rgba
  });

  it("splits prose into paragraphs on blank lines and renders all of them", () => {
    render(<StoryPage story={mockStory} related={[]} />);
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
    expect(screen.getByText(/Second paragraph here/)).toBeInTheDocument();
    expect(screen.getByText(/Another scene begins/)).toBeInTheDocument();
    expect(screen.getByText(/With another paragraph/)).toBeInTheDocument();
  });

  it("renders a ✦ scene break between consecutive scenes", () => {
    render(<StoryPage story={mockStory} related={[]} />);
    const breaks = document.querySelectorAll('[aria-hidden="true"]');
    const hasOrnament = Array.from(breaks).some((el) => el.textContent?.includes("✦"));
    expect(hasOrnament).toBe(true);
  });

  it("uses warm off-white body color (NOT pure #FFF) and a comfortable reading size", () => {
    render(<StoryPage story={mockStory} related={[]} />);
    const proseEl = document.querySelector(".vr-prose-p") as HTMLElement | null;
    expect(proseEl).toBeTruthy();
    const s = (proseEl!.getAttribute("style") || "").toLowerCase();
    // jsdom may serialise as #ede6d6 OR rgb(237, 230, 214); accept either.
    expect(s).toMatch(/color:\s*(#ede6d6|rgb\(\s*237\s*,\s*230\s*,\s*214\s*\))/);
    // No pure white (#fff / white / rgb(255,255,255)) — kills halation on dark surface.
    expect(s).not.toMatch(/color:\s*(#fff(\b|;)|white(\b|;)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/);
    expect(s).toMatch(/font-size:\s*(18|19|20)px/);
    expect(s).toMatch(/line-height:\s*1\.[567]/);
  });
});
