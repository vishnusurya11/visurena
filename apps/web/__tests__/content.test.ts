import { describe, it, expect } from "vitest";
import { getLatestStories } from "@/lib/content";

// Content lives outside the repo (the generation drop folder), so this validates the
// adapter's invariants rather than specific titles — it holds whether the folder is
// present (dev) or absent (CI → empty list).
describe("web content adapter", () => {
  it("returns only live stories, newest-first", () => {
    const stories = getLatestStories(new Date("2100-01-01T00:00:00Z"));
    expect(Array.isArray(stories)).toBe(true);

    stories.forEach((s) => {
      expect(s.status).toBe("live");
      expect(s.section).toBe("stories");
      expect(typeof s.slug).toBe("string");
      expect(s.slug.length).toBeGreaterThan(0);
    });

    for (let i = 1; i < stories.length; i++) {
      expect(new Date(stories[i - 1].publishAt).getTime()).toBeGreaterThanOrEqual(
        new Date(stories[i].publishAt).getTime()
      );
    }
  });
});
