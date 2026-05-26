import { jewel } from "./colors";

export type SectionId = "stories" | "movies" | "music" | "games";

export const SECTIONS = [
  { id: "stories", label: "Stories", stone: "Amber", accent: jewel.amber },
  { id: "movies", label: "Movies", stone: "Emerald", accent: jewel.emerald },
  { id: "music", label: "Music", stone: "Ruby", accent: jewel.ruby },
  { id: "games", label: "Games", stone: "Amethyst", accent: jewel.amethyst },
] as const;

export function sectionAccent(section: string): string {
  return SECTIONS.find((s) => s.id === section)?.accent ?? jewel.ivory;
}
