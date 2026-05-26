import type { ContentItem, SectionId } from "./content-types";
export type { ContentItem, SectionId } from "./content-types";

export function selectLive(items: ContentItem[], now: Date = new Date()): ContentItem[] {
  return items.filter(
    (i) => i.status === "live" && new Date(i.publishAt).getTime() <= now.getTime()
  );
}

export function latestBySection(
  items: ContentItem[],
  section: SectionId,
  now: Date = new Date()
): ContentItem[] {
  return selectLive(items, now)
    .filter((i) => i.section === section)
    .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
}
