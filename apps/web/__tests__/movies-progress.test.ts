import { describe, it, expect, beforeEach } from "vitest";
import {
  PROGRESS_KEY, continueLabel, episodeState, latestProgress, readAllProgress, readProgress, saveProgress,
  type StorageLike,
} from "@/components/movies/progress";

class FakeStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

describe("movies/progress", () => {
  let store: FakeStorage;
  beforeEach(() => { store = new FakeStorage(); });

  it("saves {seriesSlug, ep, at} and reads it back by series", () => {
    const rec = saveProgress({ seriesSlug: "a-study-in-scarlet", ep: 7, at: 1000 }, store);
    expect(rec).toEqual({ seriesSlug: "a-study-in-scarlet", ep: 7, at: 1000 });
    expect(readProgress("a-study-in-scarlet", store)).toEqual(rec);
    expect(readProgress("frankenstein", store)).toBeUndefined();
    expect(JSON.parse(store.getItem(PROGRESS_KEY)!)).toEqual({ "a-study-in-scarlet": rec });
  });

  it("defaults `at` to now and overwrites the same series", () => {
    const before = Date.now();
    saveProgress({ seriesSlug: "s", ep: 1 }, store);
    saveProgress({ seriesSlug: "s", ep: 3 }, store);
    const p = readProgress("s", store)!;
    expect(p.ep).toBe(3);
    expect(p.at).toBeGreaterThanOrEqual(before);
    expect(Object.keys(readAllProgress(store))).toEqual(["s"]);
  });

  it("tolerates corrupt or foreign JSON", () => {
    store.setItem(PROGRESS_KEY, "{not json");
    expect(readAllProgress(store)).toEqual({});
    store.setItem(PROGRESS_KEY, JSON.stringify([1, 2]));
    expect(readAllProgress(store)).toEqual({});
    store.setItem(PROGRESS_KEY, JSON.stringify({ ok: { ep: 2, at: 5 }, bad: { ep: "x" }, neg: { ep: 0, at: 1 } }));
    expect(readAllProgress(store)).toEqual({ ok: { seriesSlug: "ok", ep: 2, at: 5 } });
  });

  it("returns the record even when storage is unavailable", () => {
    const rec = saveProgress({ seriesSlug: "s", ep: 2, at: 9 }, null);
    expect(rec).toEqual({ seriesSlug: "s", ep: 2, at: 9 });
    expect(readAllProgress(null)).toEqual({});
    expect(latestProgress(null)).toBeUndefined();
  });

  it("latestProgress picks the most recently touched series", () => {
    saveProgress({ seriesSlug: "a", ep: 4, at: 10 }, store);
    saveProgress({ seriesSlug: "b", ep: 1, at: 20 }, store);
    saveProgress({ seriesSlug: "c", ep: 9, at: 15 }, store);
    expect(latestProgress(store)?.seriesSlug).toBe("b");
  });

  it("episodeState: earlier = watched, same = current, later = undefined", () => {
    const p = { seriesSlug: "s", ep: 7, at: 1 };
    expect(episodeState(p, 3)).toBe("watched");
    expect(episodeState(p, 7)).toBe("current");
    expect(episodeState(p, 8)).toBeUndefined();
    expect(episodeState(undefined, 1)).toBeUndefined();
    expect(episodeState(null, 1)).toBeUndefined();
  });

  it("continueLabel", () => {
    expect(continueLabel({ seriesSlug: "s", ep: 7, at: 1 })).toBe("Continue Ep 7");
    expect(continueLabel(null)).toBeUndefined();
  });

  it("uses window.localStorage by default (jsdom)", () => {
    window.localStorage.removeItem(PROGRESS_KEY);
    saveProgress({ seriesSlug: "jsdom", ep: 5, at: 42 });
    expect(readProgress("jsdom")).toEqual({ seriesSlug: "jsdom", ep: 5, at: 42 });
    expect(latestProgress()?.seriesSlug).toBe("jsdom");
    window.localStorage.removeItem(PROGRESS_KEY);
  });
});
