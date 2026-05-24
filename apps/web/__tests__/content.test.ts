import { describe, it, expect } from "vitest";
import { getLatestStories } from "@/lib/content";

describe("web content adapter", () => {
  it("returns live stories newest-first", () => {
    const stories = getLatestStories(new Date("2026-06-01T00:00:00Z"));
    expect(stories.length).toBeGreaterThanOrEqual(6);
    expect(stories[0].slug).toBe("lantern-mile");
    stories.forEach((s) => expect(s.status).toBe("live"));
  });
});
