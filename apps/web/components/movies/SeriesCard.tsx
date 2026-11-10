// components/movies/SeriesCard.tsx
//
// Hub "Series" card (mockup .scard): 180px 9:16 poster + kicker, title, status line,
// 4-line synopsis and CTAs. Released: Continue/Start Ep 1 · Trailer. In production:
// typeset poster (until the file exists), "Chosen by N votes" and + Follow.

import React from "react";
import Link from "next/link";
import { Button, StatusLine } from "@visurena/ui";
import type { Series } from "../../lib/movies";
import type { EpisodeProgress } from "./progress";
import { episodeHref, primaryEpisode, productionNote, seriesHref } from "./helpers";
import { Poster } from "./Poster";
import { FollowButton } from "./actions";

export interface SeriesCardProps {
  series: Series;
  statusParts: string[];
  progress?: EpisodeProgress | null;
}

export function SeriesCard({ series, statusParts, progress }: SeriesCardProps) {
  const inProd = series.status === "in-production";
  const primary = primaryEpisode(series, progress);
  const continuing = !!progress && progress.seriesSlug === series.slug && primary?.n === progress.ep;
  const votes = series.production?.votes;
  const parts = inProd && votes ? [...statusParts, `Chosen by ${votes.toLocaleString()} votes`] : statusParts;
  const who = [series.author, series.year].filter(Boolean).join(" · ");
  const hasTrailer = !!(series.trailer && (series.trailer.file || series.trailer.youtubeId));

  return (
    <article className="flex flex-col gap-5 rounded-card border border-hair bg-vr-bg1 p-4 sm:flex-row sm:items-start" data-series-card={series.slug}>
      <Link href={seriesHref(series.slug)} className="block w-[160px] shrink-0 no-underline sm:w-[180px]" aria-label={`${series.title} — series page`}>
        <Poster
          src={series.poster}
          alt={`${series.title} poster`}
          title={series.title}
          who={who}
          chip={inProd ? "In production" : undefined}
          state={inProd ? productionNote(series) : undefined}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[15px] font-medium text-vr-t2">{inProd ? "Next series" : series.subtitle ?? "Series"}</span>
        <Link href={seriesHref(series.slug)} className="text-[26px] font-medium leading-[1.1] tracking-[-0.02em] text-vr-t1 no-underline hover:underline">
          {series.title}
        </Link>
        <StatusLine parts={parts} accentFirst size={12} />
        <p className="text-[14px] leading-[1.5] text-vr-t2 line-clamp-4">{series.synopsis}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {inProd ? (
            <>
              <FollowButton title={series.title} variant="primary" />
              <Button href={seriesHref(series.slug)} variant="secondary">Series page</Button>
            </>
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
              {hasTrailer ? <Button href={`${seriesHref(series.slug)}#trailer`} variant="secondary">Trailer</Button> : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
