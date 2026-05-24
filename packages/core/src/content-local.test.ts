import { describe, it, expect } from "vitest";
import { selectLive, latestBySection, type ContentItem } from "./content-local";

const items: ContentItem[] = [
  { id: "a", section: "stories", slug: "a", title: "A", status: "live",
    createdAt: "2026-05-01", publishAt: "2026-05-01T00:00:00Z", accent: "#fff" },
  { id: "b", section: "stories", slug: "b", title: "B", status: "scheduled",
    createdAt: "2026-05-10", publishAt: "2999-01-01T00:00:00Z", accent: "#fff" },
  { id: "c", section: "stories", slug: "c", title: "C", status: "live",
    createdAt: "2026-05-09", publishAt: "2026-05-09T00:00:00Z", accent: "#fff" },
];

describe("content-local", () => {
  it("selectLive returns only live items whose publishAt has passed", () => {
    const live = selectLive(items, new Date("2026-05-20T00:00:00Z"));
    expect(live.map((i) => i.id)).toEqual(["a", "c"]);
  });
  it("latestBySection sorts live items newest-first by publishAt", () => {
    const latest = latestBySection(items, "stories", new Date("2026-05-20T00:00:00Z"));
    expect(latest.map((i) => i.id)).toEqual(["c", "a"]);
  });
});
