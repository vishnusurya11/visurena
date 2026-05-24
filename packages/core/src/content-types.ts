export type SectionId = "stories" | "movies" | "music" | "games" | "research";
export type ContentStatus = "draft" | "scheduled" | "live";

export interface Chapter {
  n: number;
  title: string;
  body?: string;        // path to body JSON (unused in Phase 1 listing)
  publishAt?: string;
  status?: "writing" | "scheduled" | "live";
}

export interface ContentItem {
  id: string;
  section: SectionId;
  slug: string;
  title: string;
  status: ContentStatus;
  createdAt: string;     // ISO date
  publishAt: string;     // ISO datetime
  accent: string;        // hex — drives per-item immersion
  genre?: string;
  summary?: string;
  cover?: string;        // image url/path
  tags?: string[];
  chapters?: Chapter[];
  reads?: string;        // display string e.g. "84.2k"
}
