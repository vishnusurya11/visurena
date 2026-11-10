// pages/movies.tsx — the Movies hub (Emerald room), Cinema Lobby redesign.
//
// Header with counts · Series (released card + in-production card) · Latest episodes
// rail · Trailers & shorts · In development (request board slice). Everything here comes
// from content-local/series.json + requests.json via getStaticProps; nothing is
// hard-coded and nothing is "coming soon".

import React from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { AmbientGlow, LobbyShell, MediaCard, Section, SectionHeader, Shelf, StatusLine } from "@visurena/ui";
import { getSeriesList, seriesStatusParts, type Series } from "../lib/movies";
import { readRequestsLocal } from "../components/movies/requests-local";
import {
  aspectOf, episodeCaption, episodeHref, hubCounts, latestEpisodes, movieRequests, seriesHref, seriesMeta,
  stillPosition, toSlateItems, trailerRail, type RequestsFile, type SlateItem,
} from "../components/movies/helpers";
import { episodeState } from "../components/movies/progress";
import { useLatestProgress } from "../components/movies/useProgress";
import { SeriesCard } from "../components/movies/SeriesCard";
import { SlateVotes } from "../components/movies/SlateVotes";

const SAPPHIRE = "#6C9BFF";

export interface MoviesHubProps {
  section: "movies";
  series: Series[];
  statusParts: Record<string, string[]>;
  requests: RequestsFile;
  slate: SlateItem[];
}

export default function MoviesHub({ series, statusParts, requests, slate }: MoviesHubProps) {
  const latest = latestEpisodes(series, 14);
  const rail = trailerRail(series);
  const last = useLatestProgress();
  const released = series.filter((s) => s.status !== "in-production" && s.episodes.length);
  const glowSrc = latest[0]?.episode.still ?? released[0]?.poster;
  const trailers = series.filter((s) => s.trailer && (s.trailer.file || s.trailer.youtubeId)).length;
  const shorts = series.filter((s) => s.kind === "shorts").reduce((n, s) => n + s.episodes.length, 0);

  return (
    <>
      <Head>
        <title>Movies — Visurena</title>
        <meta name="description" content="Series, trailers and shorts from the Visurena studio. Every frame generated with AI, every cut chosen by one person. Played on YouTube." />
      </Head>
      <LobbyShell
        vertical="movies"
        nav={{
          requestsCount: requests.openRequests || undefined,
          continueLabel: last ? `Continue Ep ${last.ep}` : undefined,
          continueHref: last ? episodeHref(last.seriesSlug, last.ep) : undefined,
        }}
      >
        <section className="relative -mx-4 px-4 pb-2 pt-9 md:-mx-8 md:px-8" data-hub-head>
          <AmbientGlow src={glowSrc} accent="#3DD68C" className="max-h-[60vh]" />
          <div className="relative z-10">
            <p className="mb-3.5 font-mono text-[13px] text-vr-t2">Movies · Emerald room</p>
            <h1 className="text-[40px] font-medium leading-none tracking-[-0.025em] text-vr-t1 md:text-[56px]">Movies</h1>
            <div className="mt-2 h-[3px] w-7 rounded-full bg-vr-accent" aria-hidden />
            <StatusLine parts={hubCounts(series, requests)} className="mt-2.5" />
          </div>
        </section>

        <Section>
          <SectionHeader title="Series" meta={seriesMeta(series)} />
          <div className="grid gap-4 py-2 lg:grid-cols-2" data-series-grid>
            {series.map((s) => (
              <SeriesCard key={s.slug} series={s} statusParts={statusParts[s.slug] ?? []} progress={last?.seriesSlug === s.slug ? last : null} />
            ))}
          </div>
        </Section>

        {latest.length ? (
          <Section>
            <SectionHeader
              title="Latest episodes"
              meta={`${released.map((s) => s.title).join(" · ")} · newest first`}
              href={released.length === 1 ? seriesHref(released[0].slug) : undefined}
              hrefLabel="Series page →"
            />
            <Shelf ariaLabel="Latest episodes">
              {latest.map(({ series: s, episode: e }) => {
                const st = last?.seriesSlug === s.slug ? episodeState(last, e.n) : undefined;
                return (
                  <MediaCard
                    key={`${s.slug}-${e.slug}`}
                    href={episodeHref(s.slug, e)}
                    title={e.title}
                    ratio="2:3"
                    width={172}
                    image={e.still}
                    imagePosition={stillPosition(aspectOf(s, e))}
                    chip={`Ep ${e.n}`}
                    caption={st === "current" ? `${episodeCaption(e)} · Continue` : episodeCaption(e)}
                    watched={st === "watched"}
                    progress={st === "watched" ? 1 : undefined}
                    accent={st === "watched" ? "#7A7975" : undefined}
                  />
                );
              })}
            </Shelf>
          </Section>
        ) : null}

        {rail.length ? (
          <Section>
            <SectionHeader
              title="Trailers & shorts"
              meta={[trailers ? `${trailers} trailer${trailers === 1 ? "" : "s"}` : null, shorts ? `${shorts} shorts` : null].filter(Boolean).join(" · ") || undefined}
            />
            <Shelf ariaLabel="Trailers and shorts">
              {rail.map((it) => (
                <MediaCard key={it.key} href={it.href} title={it.title} ratio="9:16" width={148} image={it.image} caption={it.caption} chip={it.chip} playGlyph={it.playGlyph} />
              ))}
            </Shelf>
          </Section>
        ) : null}

        {slate.length ? (
          <Section>
            <SectionHeader title="In development" meta="Feature requests on the slate" href="/requests" hrefLabel="Request board →" accent={SAPPHIRE} />
            <div style={{ ["--vr-accent" as string]: SAPPHIRE }}>
              <SlateVotes items={slate} layout="grid" />
            </div>
          </Section>
        ) : null}
      </LobbyShell>
    </>
  );
}

// Next's static export rejects `undefined` in props; JSON round-trip drops those keys.
const toJson = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const getStaticProps: GetStaticProps<MoviesHubProps> = async () => {
  const series = getSeriesList();
  const requests = readRequestsLocal();
  const statusParts: Record<string, string[]> = {};
  for (const s of series) statusParts[s.slug] = seriesStatusParts(s);
  return {
    props: toJson({
      section: "movies",
      series,
      statusParts,
      requests,
      slate: toSlateItems(movieRequests(requests.items, 3), series),
    }),
  };
};
