export type Vertical = "home" | "stories" | "movies" | "music" | "games";
export type Ratio = "9:16" | "2:3" | "3:4" | "1:1" | "16:9";
export type ItemState = "airing" | "complete" | "in-production" | "voting" | "new" | "live" | "scheduled";

export const RATIO_CSS: Record<Ratio, string> = {
  "9:16": "9 / 16",
  "2:3": "2 / 3",
  "3:4": "3 / 4",
  "1:1": "1 / 1",
  "16:9": "16 / 9",
};

export const VERTICALS: Array<{ id: Exclude<Vertical, "home">; label: string; href: string }> = [
  { id: "stories", label: "Stories", href: "/stories" },
  { id: "movies", label: "Movies", href: "/movies" },
  { id: "music", label: "Music", href: "/music" },
  { id: "games", label: "Games", href: "/games" },
];

/** Keyboard focus ring: 2px sapphire, 2px offset. Sapphire is the system colour, never a vertical. */
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vr-sapphire";

/** The system (non-vertical) accent: links, focus rings, vote digits, the Requests underline. */
export const SAPPHIRE = "#6C9BFF";
