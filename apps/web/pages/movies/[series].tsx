// pages/movies/[series].tsx — one series (Emerald room), Cinema Lobby redesign.
//
// SeriesHeader (poster on glow · title · status · synopsis · CTAs) with the first four
// episode rows beside it · optional inline trailer (#trailer) · all episodes in two
// chronological columns · extras tabs (Cast · Audiobook · Casebook · About) · "What
// should we adapt after this?" (3 VoteCards). In-production series render the header
// with the production state and the Follow CTA, no rows.

import React, { useEffect, useState } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Button, EpisodeRow, LobbyShell, Section, SectionHeader } from "@visurena/ui";
import { getSeriesBySlug, getSeriesList, seriesStatusParts, type Series } from "../../lib/movies";
import { seriesYouTubeLinks, type SeriesYouTubeLinks } from "../../lib/youtube";
import { readRequestsLocal } from "../../components/movies/requests-local";
import { episodeHref, episodesMeta, slateAfter, toSlateItems, type SlateItem } from "../../components/movies/helpers";
import { episodeState } from "../../components/movies/progress";
import { useLatestProgress, useSeriesProgress } from "../../components/movies/useProgress";
import { SeriesHeader } from "../../components/movies/SeriesHeader";
import { SeriesTabs } from "../../components/movies/SeriesTabs";
import { SlateVotes } from "../../components/movies/SlateVotes";

const SAPPHIRE = "#6C9BFF";

export interface SeriesPageProps {
  section: "movies";
  series: Series;
  statusParts: string[];
  slate: SlateItem[];
  requestsCount: number;
  totalVotes: number;
  /** Built in getStaticProps so lib/movies (node:fs) never reaches the client bundle. */
  youtube: SeriesYouTubeLinks;
}

export default function SeriesPage({ series, statusParts, slate, requestsCount, totalVotes, youtube }: SeriesPageProps) {
  const progress = useSeriesProgress(series.slug);
  const last = useLatestProgress();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const inProd = series.status === "in-production";
  const eps = series.episodes;
  const half = Math.ceil(eps.length / 2);
  const hasTrailer = !!(series.trailer && (series.trailer.file || series.trailer.youtubeId));

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#trailer" && hasTrailer) setTrailerOpen(true);
  }, [hasTrailer]);

  const row = (e: Series["episodes"][number]) => {
    const st = episodeState(progress, e.n);
    return (
      <EpisodeRow
        key={e.slug}
        n={e.n}
        title={e.title}
        href={episodeHref(series.slug, e)}
        runtime={e.runtime}
        still={e.still}
        watched={st === "watched"}
        current={st === "current"}
      />
    );
  };

  return (
    <>
      <Head>
        <title>{`${series.title} — Movies — Visurena`}</title>
        <meta name="description" content={series.synopsis} />
      </Head>
      <LobbyShell
        vertical="movies"
        nav={{
          requestsCount: requestsCount || undefined,
          continueLabel: last ? `Continue Ep ${last.ep}` : undefined,
          continueHref: last ? episodeHref(last.seriesSlug, last.ep) : undefined,
        }}
      >
        <SeriesHeader
          series={series}
          statusParts={statusParts}
          progress={progress}
          onTrailer={hasTrailer ? () => setTrailerOpen((v) => !v) : undefined}
          trailerOpen={trailerOpen}
          aside={
            !inProd && eps.length ? (
              <div data-first-episodes>
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <h2 className="text-[18px] font-medium text-vr-t1">Episodes</h2>
                  <Link href="#episodes" className="font-mono text-[13px] text-vr-t3 no-underline hover:text-vr-t1">All {eps.length} ↓</Link>
                </div>
                <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.08)]">{eps.slice(0, 4).map(row)}</div>
              </div>
            ) : undefined
          }
        />

        {youtube && (youtube.playlist || youtube.compilation) ? (
          <div className="flex flex-wrap items-center gap-3 pb-6" data-youtube-links>
            {youtube.playlist ? (
              <Button href={youtube.playlist} external variant="secondary" size="sm">Watch in order on YouTube</Button>
            ) : null}
            {youtube.compilation ? (
              <Button href={youtube.compilation.href} external variant="ghost" size="sm">The whole book in one video ↗</Button>
            ) : null}
            <a href={youtube.channel.url} target="_blank" rel="noreferrer" className="font-mono text-[13px] tracking-[0.04em] text-vr-t3 no-underline hover:text-vr-t1">
              {youtube.channel.name}
            </a>
          </div>
        ) : null}

        <div id="trailer" className="scroll-mt-20" />
        {hasTrailer && trailerOpen && series.trailer?.file ? (
          <Section className="!py-4">
            {/* no forced aspect box: the trailer plays at its source aspect, capped at the stage height */}
            <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-card border border-hair bg-vr-bg1" data-trailer>
              <video className="mx-auto block h-auto max-h-[min(calc(100vh_-_108px),800px)] w-auto max-w-full" controls preload="metadata" playsInline poster={series.trailer.poster} src={series.trailer.file}>
                Your browser cannot play this trailer.
              </video>
            </div>
            <p className="mt-2 text-center font-mono text-[12px] text-vr-t3">{["Trailer", series.trailer.runtime, series.title].filter(Boolean).join(" · ")}</p>
          </Section>
        ) : null}

        {!inProd && eps.length ? (
          <Section className="scroll-mt-16">
            <div id="episodes" className="scroll-mt-20" />
            <SectionHeader title={`All ${eps.length} episodes`} meta={episodesMeta(series, progress)} />
            <div className="grid gap-x-10 py-2 md:grid-cols-2" data-all-episodes>
              <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.08)]">{eps.slice(0, half).map(row)}</div>
              <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.08)]">{eps.slice(half).map(row)}</div>
            </div>
          </Section>
        ) : null}

        <Section>
          <SeriesTabs series={series} />
        </Section>

        {slate.length ? (
          <Section>
            <SectionHeader
              title="What should we adapt after this?"
              meta={totalVotes ? `${totalVotes.toLocaleString()} votes this season` : undefined}
              href="/requests"
              hrefLabel="Request board →"
              accent={SAPPHIRE}
            />
            <div style={{ ["--vr-accent" as string]: SAPPHIRE }}>
              <SlateVotes items={slate} layout="grid" />
            </div>
          </Section>
        ) : null}
      </LobbyShell>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getSeriesList().map((s) => ({ params: { series: s.slug } })),
  fallback: false,
});

// Next's static export rejects `undefined` in props; JSON round-trip drops those keys.
const toJson = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const getStaticProps: GetStaticProps<SeriesPageProps, { series: string }> = async ({ params }) => {
  const series = params ? getSeriesBySlug(params.series) : undefined;
  if (!series) return { notFound: true };
  const requests = readRequestsLocal();
  return {
    props: toJson({
      section: "movies",
      series,
      statusParts: seriesStatusParts(series),
      slate: toSlateItems(slateAfter(requests.items, 3, series.slug), getSeriesList()),
      requestsCount: requests.openRequests,
      totalVotes: requests.totalVotes,
      youtube: seriesYouTubeLinks(series),
    }),
  };
};
