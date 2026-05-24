import { latestBySection, type ContentItem } from "@visurena/core";
import storiesJson from "../../../content-local/stories.json";

const stories = storiesJson as ContentItem[];

export function getLatestStories(now: Date = new Date()): ContentItem[] {
  return latestBySection(stories, "stories", now);
}
