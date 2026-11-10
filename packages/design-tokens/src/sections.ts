import { lobbyAccent } from "./lobby";

export type SectionId = "stories" | "movies" | "music" | "games";

// Cinema Lobby accents (2026-09-25): amber / emerald / ruby / amethyst on black.
export const SECTIONS = [
  { id: "stories", label: "Stories", stone: "Amber", accent: lobbyAccent.stories },
  { id: "movies", label: "Movies", stone: "Emerald", accent: lobbyAccent.movies },
  { id: "music", label: "Music", stone: "Ruby", accent: lobbyAccent.music },
  { id: "games", label: "Games", stone: "Amethyst", accent: lobbyAccent.games },
] as const;

/** Section id → accent hex; anything else (home, blog, unknown) → the warm-white home accent. */
export function sectionAccent(section: string): string {
  return SECTIONS.find((s) => s.id === section)?.accent ?? lobbyAccent.home;
}
