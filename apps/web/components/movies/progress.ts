// components/movies/progress.ts
//
// Watch progress for the Movies room, kept in localStorage until accounts exist.
// Shape per series: { seriesSlug, ep, at } — "ep" is the episode number last played,
// "at" is Date.now() at the play click. Everything here is pure over an injectable
// Storage-like object so it can be unit-tested without a browser.

export const PROGRESS_KEY = "vr:progress:movies";

export interface EpisodeProgress {
  seriesSlug: string;
  ep: number;
  at: number;
}

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type EpisodeState = "watched" | "current";

function defaultStore(): StorageLike | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Every series' progress, keyed by series slug. Tolerates missing/corrupt storage. */
export function readAllProgress(store: StorageLike | null = defaultStore()): Record<string, EpisodeProgress> {
  if (!store) return {};
  try {
    const raw = store.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, EpisodeProgress> = {};
    for (const [slug, v] of Object.entries(parsed as Record<string, unknown>)) {
      const p = v as Partial<EpisodeProgress> | null;
      if (p && typeof p.ep === "number" && p.ep > 0 && typeof p.at === "number") {
        out[slug] = { seriesSlug: slug, ep: p.ep, at: p.at };
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function readProgress(seriesSlug: string, store: StorageLike | null = defaultStore()): EpisodeProgress | undefined {
  return readAllProgress(store)[seriesSlug];
}

/** Save {seriesSlug, ep, at}. Returns the saved record (also when storage is unavailable). */
export function saveProgress(
  p: { seriesSlug: string; ep: number; at?: number },
  store: StorageLike | null = defaultStore(),
): EpisodeProgress {
  const rec: EpisodeProgress = { seriesSlug: p.seriesSlug, ep: p.ep, at: p.at ?? Date.now() };
  if (!store) return rec;
  try {
    const all = readAllProgress(store);
    all[p.seriesSlug] = rec;
    store.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* quota / private mode: progress is a convenience, never a failure */
  }
  return rec;
}

/** The most recently touched series, for the nav "Continue" pill. */
export function latestProgress(store: StorageLike | null = defaultStore()): EpisodeProgress | undefined {
  const all = Object.values(readAllProgress(store));
  if (!all.length) return undefined;
  return all.reduce((a, b) => (b.at > a.at ? b : a));
}

/** Episode n relative to the saved progress: earlier = watched, equal = current. */
export function episodeState(progress: EpisodeProgress | undefined | null, n: number): EpisodeState | undefined {
  if (!progress) return undefined;
  if (n < progress.ep) return "watched";
  if (n === progress.ep) return "current";
  return undefined;
}

/** "Continue Ep 7" for buttons and the nav pill. */
export function continueLabel(progress: EpisodeProgress | undefined | null): string | undefined {
  if (!progress) return undefined;
  return `Continue Ep ${progress.ep}`;
}
