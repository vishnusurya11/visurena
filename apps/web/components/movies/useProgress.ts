// components/movies/useProgress.ts
//
// React bindings for progress.ts. SSR renders "no progress"; the real value arrives
// after mount so static HTML is identical for every visitor.

import { useEffect, useState } from "react";
import { latestProgress, readProgress, type EpisodeProgress } from "./progress";

export function useSeriesProgress(seriesSlug: string): EpisodeProgress | null {
  const [p, setP] = useState<EpisodeProgress | null>(null);
  useEffect(() => {
    setP(readProgress(seriesSlug) ?? null);
  }, [seriesSlug]);
  return p;
}

export function useLatestProgress(): EpisodeProgress | null {
  const [p, setP] = useState<EpisodeProgress | null>(null);
  useEffect(() => {
    setP(latestProgress() ?? null);
  }, []);
  return p;
}
