import { describe, it, expect } from "vitest";
import { formatDuration, formatReleaseDate } from "@/pages/music";

describe("formatDuration", () => {
  it("formats seconds into m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(62)).toBe("1:02");
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(3600)).toBe("60:00");
  });
  it("pads single-digit seconds", () => {
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(69)).toBe("1:09");
  });
  it("handles invalid / negative gracefully", () => {
    expect(formatDuration(-1)).toBe("—");
    expect(formatDuration(Number.NaN)).toBe("—");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatReleaseDate", () => {
  it("formats a valid ISO date into a short human string", () => {
    // Just assert the shape (locale rendering can vary slightly)
    const out = formatReleaseDate("2026-08-02");
    expect(out).toMatch(/Aug\s+\d+,\s*2026/);
  });
  it("returns the input string when unparseable", () => {
    expect(formatReleaseDate("not-a-date")).toBe("not-a-date");
  });
});
