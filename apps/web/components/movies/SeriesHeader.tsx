// components/movies/SeriesHeader.tsx
//
// Series page header: poster (270px, 9:16) on an AmbientGlow, breadcrumb, kicker,
// title, StatusLine, synopsis, CTAs (Continue / Start Ep 1 · Trailer · + Follow · Share)
// and the extras sub-line. `aside` is the third column (the first four episode rows on
// the series page). In-production series render the production state, "Chosen by N
// votes" and the Follow CTA instead of Start.

import React from "react";
import Link from "next/link";
import { AmbientGlow, Button, StatusLine } from "@visurena/ui";
import type { Series } from "../../lib/movies";
import type { EpisodeProgress } from "./progress";
import { episodeHref, primaryEpisode, productionNote, seriesSubline } from "./helpers";
import { Poster } from "./Poster";
import { FollowButton, ShareButton } from "./actions";

export interface SeriesHeaderProps {
  series: Series;
  statusParts: string[];            // seriesStatusParts(series)
  progress?: EpisodeProgress | null;
  aside?: React.ReactNode;
  onTrailer?: () => void;           // when set and the series has a trailer, shows the Trailer button
  trailerOpen?: boolean;
}

export function SeriesHeader({ series, statusParts, progress, aside, onTrailer, trailerOpen }: SeriesHeaderProps) {
  const inProd = series.status === "in-production";
  const primary = primaryEpisode(series, progress);
  const continuing = !!progress && progress.seriesSlug === series.slug && primary?.n === progress.ep;
  const total = series.episodes.length;
  const floor = inProd ? 0 : continuing && total ? primary!.n / total : 1;
  const votes = series.production?.votes;
  const parts = inProd && votes ? [...statusParts, `Chosen by ${votes.toLocaleString()} votes`] : statusParts;
  const who = [series.author, series.year].filter(Boolean).join(" · ");
  const hasTrailer = !!(series.trailer && (series.trailer.file || series.trailer.youtubeId));

  return (
    <section className="relative -mx-4 px-4 pb-2 pt-6 md:-mx-8 md:px-8" data-series-header>
      <AmbientGlow src={series.glow ?? series.poster} accent={series.accent} className="max-h-[60vh]" />
      <div className={`relative z-10 grid items-start gap-8 md:grid-cols-[240px_1fr] ${aside ? "lg:grid-cols-[270px_1fr_480px] lg:gap-10" : "lg:grid-cols-[270px_1fr]"}`}>
        <div className="w-[200px] md:w-[240px] lg:w-[270px]">
          <Poster
            src={series.poster}
            alt={`${series.title} poster`}
            title={series.title}
            who={who}
            chip={inProd ? "In production" : undefined}
            state={inProd ? productionNote(series) : undefined}
            {...({ fetchpriority: "high" } as Record<string, string>)}
          />
          <span className="mt-0.5 block h-[2px] w-full overflow-hidden rounded-[1px] bg-vr-bg3" aria-hidden>
            <i className="block h-full bg-vr-accent" style={{ width: `${Math.round(floor * 100)}%` }} />
          </span>
        </div>

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-2.5 font-mono text-[13px] text-vr-t2" data-breadcrumb>
            <Link href="/movies" className="text-vr-t1 no-underline hover:underline">Movies</Link>
            <span className="text-vr-t3"> › </span>
            <span>{series.title}</span>
          </nav>
          {series.subtitle ? <p className="mb-1.5 text-[15px] font-medium text-vr-t2">{series.subtitle}</p> : null}
          <h1 className="mb-3 text-[40px] font-medium leading-[1.02] tracking-[-0.025em] text-vr-t1 lg:text-[56px]">{series.title}</h1>
          <StatusLine parts={parts} accentFirst />
          <p className="my-4 max-w-[520px] text-[16px] leading-[1.55] text-vr-t2 line-clamp-4">{series.synopsis}</p>

          <div className="flex flex-wrap items-center gap-3" data-series-ctas>
            {inProd ? (
              <FollowButton title={series.title} variant="primary" />
            ) : (
              <>
                {primary ? (
                  <Button href={episodeHref(series.slug, primary)} variant="primary">
                    {continuing ? `Continue Ep ${primary.n}` : "Start Ep 1"}
                  </Button>
                ) : null}
                {continuing && series.episodes[0] ? (
                  <Button href={episodeHref(series.slug, series.episodes[0])} variant="secondary">Start Ep 1</Button>
                ) : null}
                {hasTrailer && onTrailer ? (
                  <Button variant="secondary" onClick={onTrailer} ariaPressed={!!trailerOpen}>Trailer</Button>
                ) : null}
                <FollowButton title={series.title} />
              </>
            )}
            <ShareButton title={series.title} />
          </div>

          {inProd ? (
            <p className="mt-3.5 font-mono text-[13px] text-vr-t3">Followers get Ep 1 the hour it renders · Played on YouTube</p>
          ) : (
            <p className="mt-3.5 font-mono text-[13px] text-vr-t3">{seriesSubline(series)}</p>
          )}
        </div>

        {aside ? <div className="min-w-0 md:col-span-2 lg:col-span-1" data-series-aside>{aside}</div> : null}
      </div>
    </section>
  );
}
