// pages/movies/[series]/[episode].tsx — one episode (Emerald room), Cinema Lobby redesign.
//
// Breadcrumb · PlayerStage (YouTubeLite click-to-load on youtube-nocookie + 400px
// EpisodePanel) · title / status / Prev-Next / Up next / provenance · More from the
// slate. The play click saves {seriesSlug, ep, at} to localStorage.

import React, { useEffect, useState } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { LobbyShell, Section, SectionHeader } from "@visurena/ui";
import { episodeAspect, getEpisode, getSeriesList, seriesStatusParts, youtubeEmbedUrl, youtubeWatchUrl, type Episode, type Series, type VideoAspect } from "../../../lib/movies";
import { readRequestsLocal } from "../../../components/movies/requests-local";
import { episodeHref, slateAfter, toSlateItems, type SlateItem } from "../../../components/movies/helpers";
import { readProgress, saveProgress, type EpisodeProgress } from "../../../components/movies/progress";
import { useLatestProgress } from "../../../components/movies/useProgress";
import { PlayerStage } from "../../../components/movies/PlayerStage";
import { SlateVotes } from "../../../components/movies/SlateVotes";

const SAPPHIRE = "#6C9BFF";

export interface EpisodePageProps {
  section: "movies";
  series: Series;
  episode: Episode;
  prev: Episode | null;
  next: Episode | null;
  statusParts: string[];
  aspect: VideoAspect;             // episodeAspect(series, episode): 9:16 · 1:1 · 16:9
  embedUrl: string;
  watchUrl: string;
  slate: SlateItem[];
  requestsCount: number;
  totalVotes: number;
}

export default function EpisodePage({ series, episode, prev, next, statusParts, aspect, embedUrl, watchUrl, slate, requestsCount, totalVotes }: EpisodePageProps) {
  const [progress, setProgress] = useState<EpisodeProgress | null>(null);
  const last = useLatestProgress();

  useEffect(() => {
    setProgress(readProgress(series.slug) ?? null);
  }, [series.slug]);

  function onPlay() {
    setProgress(saveProgress({ seriesSlug: series.slug, ep: episode.n }));
  }

  return (
    <>
      <Head>
        <title>{`Ep ${episode.n} · ${episode.title} — ${series.title} — Visurena`}</title>
        <meta name="description" content={episode.summary ?? `${series.title}, episode ${episode.n} of ${series.episodes.length}: ${episode.title}.`} />
      </Head>
      <LobbyShell
        vertical="movies"
        nav={{
          requestsCount: requestsCount || undefined,
          continueLabel: last ? `Continue Ep ${last.ep}` : undefined,
          continueHref: last ? episodeHref(last.seriesSlug, last.ep) : undefined,
        }}
      >
        <PlayerStage
          series={series}
          episode={episode}
          prev={prev ?? undefined}
          next={next ?? undefined}
          embedUrl={embedUrl}
          watchUrl={watchUrl}
          statusParts={statusParts}
          aspect={aspect}
          progress={progress}
          onPlay={onPlay}
        />

        {slate.length ? (
          <Section>
            <SectionHeader
              title="More from the slate"
              meta={totalVotes ? `${totalVotes.toLocaleString()} votes this season` : undefined}
              href="/requests"
              hrefLabel="Request board →"
              accent={SAPPHIRE}
            />
            <div style={{ ["--vr-accent" as string]: SAPPHIRE }}>
              <SlateVotes items={slate} layout="rail" requestCard={false} />
            </div>
          </Section>
        ) : null}
      </LobbyShell>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getSeriesList().flatMap((s) => s.episodes.map((e) => ({ params: { series: s.slug, episode: e.slug } }))),
  fallback: false,
});

// Next's static export rejects `undefined` in props; JSON round-trip drops those keys.
const toJson = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const getStaticProps: GetStaticProps<EpisodePageProps, { series: string; episode: string }> = async ({ params }) => {
  const ctx = params ? getEpisode(params.series, params.episode) : undefined;
  if (!ctx) return { notFound: true };
  const requests = readRequestsLocal();
  return {
    props: toJson({
      section: "movies",
      series: ctx.series,
      episode: ctx.episode,
      prev: ctx.prev ?? null,
      next: ctx.next ?? null,
      statusParts: seriesStatusParts(ctx.series),
      aspect: episodeAspect(ctx.series, ctx.episode),
      embedUrl: youtubeEmbedUrl(ctx.episode.youtubeId, { autoplay: true }),
      watchUrl: youtubeWatchUrl(ctx.episode.youtubeId),
      slate: toSlateItems(slateAfter(requests.items, 7, ctx.series.slug), getSeriesList()),
      requestsCount: requests.openRequests,
      totalVotes: requests.totalVotes,
    }),
  };
};
