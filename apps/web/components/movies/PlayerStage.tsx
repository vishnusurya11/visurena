// components/movies/PlayerStage.tsx
//
// The episode page's stage: breadcrumb, 9:16 player (height min(100vh−108px, 800px))
// centred-left on an AmbientGlow of the still, the 400px EpisodePanel to its right
// (drops below the player under 1024px), then the meta block: title, status line,
// Prev/Next, Up next card and the provenance line.

import React from "react";
import Link from "next/link";
import { AmbientGlow, Button, StatusLine } from "@visurena/ui";
import type { Episode, Series, VideoAspect } from "../../lib/movies";
import type { EpisodeProgress } from "./progress";
import { episodeState } from "./progress";
import { aspectOf, episodeHref, episodeStatusParts, seriesHref } from "./helpers";
import { YouTubeLite } from "./YouTubeLite";
import { EpisodePanel } from "./EpisodePanel";
import { ShareButton } from "./actions";

// Stage height = min(100vh − 108px, 800px). Tailwind's scanner needs literal class tokens
// (no template strings), so every aspect gets its classes spelled out here.
//   9:16 — height-driven; width follows (≤ 450px), panel beside it on ≥1024px.
//   1:1  — height-driven too, but the width is capped so box + 32px gap + 400px panel fit
//          the row (100% − 432px); panel beside it on ≥1024px.
//   16:9 — full width; the panel always drops below.
export const STAGE_H_CSS = "min(calc(100vh - 108px), 800px)";

interface StageLayout {
  row: string;      // the flex row holding player + panel
  wrap: string;     // YouTubeLite outer column
  box: string;      // the aspect box
  panel: string;    // EpisodePanel
  meta: string;     // the meta grid under the stage
}

export const STAGE_LAYOUT: Record<VideoAspect, StageLayout> = {
  "9:16": {
    row: "flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center",
    wrap: "w-full max-w-[360px] lg:w-auto lg:max-w-none",
    box: "w-full lg:w-auto lg:h-[min(calc(100vh_-_108px),800px)]",
    panel: "w-full max-h-[520px] lg:w-[400px] lg:shrink-0 lg:max-h-none lg:h-[min(calc(100vh_-_108px),800px)]",
    meta: "mx-auto mt-6 grid max-w-[877px] gap-5 lg:grid-cols-[1fr_400px] lg:gap-x-8",
  },
  "1:1": {
    row: "flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center",
    wrap: "w-full max-w-[560px] lg:max-w-none lg:w-[min(min(calc(100vh_-_108px),800px),calc(100%_-_432px))] lg:shrink-0",
    box: "w-full",
    panel: "w-full max-h-[520px] lg:w-[400px] lg:shrink-0 lg:max-h-none lg:h-[min(calc(100vh_-_108px),800px)]",
    meta: "mx-auto mt-6 grid max-w-[1232px] gap-5 lg:grid-cols-[1fr_400px] lg:gap-x-8",
  },
  "16:9": {
    row: "flex flex-col items-stretch gap-8",
    wrap: "w-full",
    box: "w-full",
    panel: "w-full max-h-[520px]",
    meta: "mt-6 grid gap-5 lg:grid-cols-[1fr_400px] lg:gap-x-8",
  },
};

export interface PlayerStageProps {
  series: Series;
  episode: Episode;
  prev?: Episode;
  next?: Episode;
  embedUrl: string;
  watchUrl: string;
  statusParts: string[];          // seriesStatusParts(series)
  aspect?: VideoAspect;           // episodeAspect(series, episode) from getStaticProps; falls back to aspectOf()
  progress?: EpisodeProgress | null;
  onPlay?: () => void;
}

export function PlayerStage({ series, episode, prev, next, embedUrl, watchUrl, statusParts, aspect, progress, onPlay }: PlayerStageProps) {
  const total = series.episodes.length;
  const state = episodeState(progress, episode.n);
  const stillFailedFallback = episode.still ?? series.poster;
  const a: VideoAspect = aspect ?? aspectOf(series, episode);
  const L = STAGE_LAYOUT[a];

  return (
    <section className="relative -mx-4 px-4 pb-2 pt-4 md:-mx-8 md:px-8" data-player-stage data-aspect={a}>
      <AmbientGlow src={stillFailedFallback} accent={series.accent} className="max-h-[60vh]" />
      <div className="relative z-10">
        <nav aria-label="Breadcrumb" className="mb-3 font-mono text-[13px] text-vr-t2" data-breadcrumb>
          <Link href="/movies" className="text-vr-t1 no-underline hover:underline">Movies</Link>
          <span className="text-vr-t3"> › </span>
          <Link href={seriesHref(series.slug)} className="text-vr-t1 no-underline hover:underline">{series.title}</Link>
          <span className="text-vr-t3"> › </span>
          <span>Ep {episode.n} of {total}</span>
        </nav>

        <div className={L.row} data-stage-row>
          <YouTubeLite
            embedUrl={embedUrl}
            watchUrl={watchUrl}
            title={`Episode ${episode.n} · ${episode.title}`}
            still={episode.still}
            runtime={episode.runtime}
            aspect={a}
            onPlay={onPlay}
            className={L.wrap}
            boxClassName={L.box}
          />
          <EpisodePanel
            series={series}
            current={episode}
            statusParts={statusParts}
            progress={progress}
            className={L.panel}
          />
        </div>

        <div className={L.meta} data-episode-meta>
          <div className="min-w-0">
            <h1 className="text-[30px] font-medium leading-[1.05] tracking-[-0.02em] text-vr-t1 md:text-[40px]">{episode.title}</h1>
            <StatusLine parts={episodeStatusParts(episode, state)} className="mt-2" />
          </div>

          {next ? (
            <Link
              href={episodeHref(series.slug, next)}
              className="flex items-center gap-3.5 rounded-card border border-hair bg-vr-bg1 p-3 no-underline transition-colors duration-fast hover:bg-vr-bg2 lg:col-start-2 lg:row-span-2 lg:row-start-1"
              data-up-next
            >
              <span className="relative h-[71px] w-10 shrink-0 overflow-hidden rounded border border-hair bg-vr-bg2">
                {next.still ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={next.still} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[12px] text-vr-t3">Up next</span>
                <b className="block truncate text-[15px] font-medium text-vr-t1">Ep {next.n} · {next.title}</b>
                <span className="block font-mono text-[12px] text-vr-t3">{[next.runtime, "Plays on YouTube"].filter(Boolean).join(" · ")}</span>
              </span>
            </Link>
          ) : (
            <Link
              href={seriesHref(series.slug)}
              className="flex items-center gap-3.5 rounded-card border border-hair bg-vr-bg1 p-3 no-underline transition-colors duration-fast hover:bg-vr-bg2 lg:col-start-2 lg:row-span-2 lg:row-start-1"
              data-up-next
            >
              <span className="min-w-0">
                <span className="block font-mono text-[12px] text-vr-t3">That was the last episode</span>
                <b className="block text-[15px] font-medium text-vr-t1">Back to {series.title}</b>
                <span className="block font-mono text-[12px] text-vr-t3">Cast · Audiobook · Casebook</span>
              </span>
            </Link>
          )}

          <div className="flex items-center gap-2 lg:col-start-1" data-episode-actions>
            {prev ? <Button href={episodeHref(series.slug, prev)} variant="secondary">‹ Ep {prev.n}</Button> : null}
            {next ? <Button href={episodeHref(series.slug, next)} variant="secondary">Ep {next.n} ›</Button> : null}
            <span className="flex-1" />
            <ShareButton title={`${series.title} · Ep ${episode.n}`} />
          </div>

          <p className="border-t border-hair pt-2 font-mono text-[13px] text-vr-t2 lg:col-span-2" data-provenance>
            Every frame generated with AI. Every cut chosen by one person.{" "}
            <Link href="/about" className="text-vr-t1 no-underline hover:underline">How this was made →</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
