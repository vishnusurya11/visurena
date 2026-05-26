import { describe, it, expect } from "vitest";
import { sectionAccent, SECTIONS } from "./sections";

describe("section accents", () => {
  it("maps each section to its jewel stone", () => {
    expect(sectionAccent("stories")).toBe("#f5b831"); // amber
    expect(sectionAccent("movies")).toBe("#00d97e");  // emerald
    expect(sectionAccent("music")).toBe("#e91e63");   // ruby
    expect(sectionAccent("games")).toBe("#c084fc");   // amethyst
  });
  it("falls back to ivory for unknown sections", () => {
    expect(sectionAccent("unknown")).toBe("#f5efdb");
  });
  it("lists the four primary sections in order", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(["stories", "movies", "music", "games"]);
  });
});
