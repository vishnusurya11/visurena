import { describe, it, expect } from "vitest";
import { sectionAccent, SECTIONS } from "./sections";
import { lobbyAccent, lobbyAccentFor } from "./lobby";

describe("section accents (Cinema Lobby)", () => {
  it("maps each section to its lobby accent hex", () => {
    expect(sectionAccent("stories")).toBe("#E8B04B"); // amber
    expect(sectionAccent("movies")).toBe("#3DD68C");  // emerald
    expect(sectionAccent("music")).toBe("#F0537A");   // ruby
    expect(sectionAccent("games")).toBe("#B48CF7");   // amethyst
  });
  it("falls back to the warm-white home accent for unknown sections", () => {
    expect(sectionAccent("unknown")).toBe("#F2F1EC");
    expect(sectionAccent("home")).toBe(lobbyAccent.home);
  });
  it("agrees with lobbyAccentFor for every vertical", () => {
    for (const s of SECTIONS) expect(sectionAccent(s.id)).toBe(lobbyAccentFor(s.id));
  });
  it("lists the four primary sections in order", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(["stories", "movies", "music", "games"]);
  });
});
