// pages/index.tsx — Home, "Cinema Lobby" (2026-09-25 redesign).
//
// The page renders view models built in getStaticProps (lib/home.ts); it computes nothing
// itself. Everything is visible at first paint: all four hero slots are in the DOM (the
// inactive ones carry `hidden`), rails are plain scroll-snap shelves, and the only
// client-side state is the hero switcher and the Continue row (localStorage, in useEffect,
// so the server renders nothing for it).
//
// IMPORTANT: lib/home.ts and lib/requests.ts import node:fs (via lib/movies.ts). Import
// them here ONLY inside getStaticProps or as `import type`, never in the component body.

import React, { useEffect, useState } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  AmbientGlow, Button, LobbyShell, MediaCard, ProgressBar, Section, SectionHeader, Shelf,
  StatusLine, VoteCard,
} from "@visurena/ui";
import type { CardModel, HeroSlot, MoviesRailItem, VoteModel } from "../lib/home";
import type { RequestsSummary } from "../lib/requests";
import { PROGRESS_KEY } from "../components/movies/progress";

// ─── Props ───────────────────────────────────────────────────────────────────
export interface ContinueIndexEpisode { n: number; slug: string; title: string; still?: string }
export interface ContinueIndexEntry { slug: string; title: string; episodes: ContinueIndexEpisode[] }

export interface HomeProps {
  section: "home";
  hero: HeroSlot[];
  newThisWeek: CardModel[];
  shorts: CardModel[];
  shortsMeta: string;
  channel: { name: string; url: string; subscribeUrl: string };
  stories: CardModel[];
  storiesMeta: string;
  movies: MoviesRailItem[];
  moviesMeta: string;
  music: CardModel[];
  games: CardModel[];
  slate: VoteModel[];
  requests: RequestsSummary;
  continueIndex: Record<string, ContinueIndexEntry>;
  updated: string;         // "25 Sep 2026"
}

// ─── Continue (client-only) ──────────────────────────────────────────────────
/**
 * The Movies player (components/movies/progress.ts, Lane 3) saves `{ [seriesSlug]:
 * { seriesSlug, ep, at } }` under PROGRESS_KEY on play. Re-exported so the tests and any
 * future writer share the one key; the parser below also tolerates an array or a single entry.
 */
export { PROGRESS_KEY };

export interface ProgressEntry { seriesSlug: string; ep: number; at: number; progress?: number }

/** Tolerant parser: accepts one entry, an array of entries, or a {slug: entry} map. */
export function parseProgress(raw: string | null | undefined): ProgressEntry[] {
  if (!raw) return [];
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return []; }
  const list: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "seriesSlug" in (data as object)
      ? [data]
      : data && typeof data === "object"
        ? Object.entries(data as Record<string, unknown>).map(([k, v]) =>
            v && typeof v === "object" ? { seriesSlug: k, ...(v as object) } : null)
        : [];
  const seen = new Set<string>();
  return list
    .filter((e): e is ProgressEntry => {
      const x = e as Partial<ProgressEntry> | null;
      return !!x && typeof x.seriesSlug === "string" && Number.isFinite(Number(x.ep));
    })
    .map((e) => ({ seriesSlug: e.seriesSlug, ep: Number(e.ep), at: Number(e.at) || 0, progress: e.progress }))
    .sort((a, b) => b.at - a.at)
    .filter((e) => (seen.has(e.seriesSlug) ? false : (seen.add(e.seriesSlug), true)));
}

export interface ContinueItem { key: string; title: string; sub: string; href: string; image?: string; progress: number }

/** Progress entries + the series index the page shipped → up to `limit` Continue rows. */
export function buildContinue(
  entries: ProgressEntry[],
  index: Record<string, ContinueIndexEntry>,
  limit = 3,
): ContinueItem[] {
  const out: ContinueItem[] = [];
  for (const e of entries) {
    const s = index[e.seriesSlug];
    if (!s) continue;
    const ep = s.episodes.find((x) => x.n === e.ep);
    if (!ep) continue;
    const total = s.episodes.length;
    const progress = typeof e.progress === "number" && e.progress >= 0 && e.progress <= 1
      ? e.progress
      : total ? ep.n / total : 0;
    out.push({
      key: `${s.slug}/${ep.slug}`,
      title: s.title,
      sub: [`Ep ${ep.n} of ${total}`, ep.title].join(" · "),
      href: `/movies/${s.slug}/${ep.slug}`,
      image: ep.still,
      progress,
    });
    if (out.length >= limit) break;
  }
  return out;
}

function readContinue(index: Record<string, ContinueIndexEntry>): ContinueItem[] {
  try {
    return buildContinue(parseProgress(window.localStorage.getItem(PROGRESS_KEY)), index);
  } catch {
    return [];
  }
}

// ─── Hero ────────────────────────────────────────────────────────────────────
const ART_BOX: Record<HeroSlot["art"]["ratio"], string> = {
  "9:16": "h-[320px] md:h-[376px]",
  "2:3": "h-[320px] md:h-[376px]",
  "3:4": "h-[320px] md:h-[376px]",
  "1:1": "h-[280px] md:h-[340px]",
  "16:9": "w-full max-w-[420px] md:w-[520px] md:max-w-none",
};
const RATIO: Record<HeroSlot["art"]["ratio"], string> = {
  "9:16": "9 / 16", "2:3": "2 / 3", "3:4": "3 / 4", "1:1": "1 / 1", "16:9": "16 / 9",
};
const PLAY = <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 1.2v9.6L10.5 6z" fill="currentColor" /></svg>;

function Hero({ slots }: { slots: HeroSlot[] }) {
  const [active, setActive] = useState(0);
  if (!slots.length) return null;
  const cur = slots[Math.min(active, slots.length - 1)];
  return (
    <section className="relative -mx-4 md:-mx-8" data-hero data-slot={cur.vertical} style={{ ["--vr-accent" as string]: cur.accent }}>
      <AmbientGlow src={cur.glow ?? cur.art.src} accent={cur.accent} wide={cur.art.ratio === "16:9"} />
      <div className="relative px-4 md:px-8">
        <div className="grid items-center gap-6 pt-6 md:min-h-[420px] md:grid-cols-[1fr_auto] md:gap-16 md:pt-0">
          <div className="min-w-0">
            {slots.map((s, i) => (
              <div key={s.vertical} hidden={i !== active} data-hero-slot={s.vertical} className="max-w-[640px]">
                <StatusLine parts={s.eyebrow} size={13} className="mb-3" />
                <p className="mb-1.5 text-[15px] font-medium text-vr-t2">{s.kicker}</p>
                <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-vr-t1 md:text-[64px]">{s.title}</h1>
                {s.logline ? <p className="mb-6 mt-4 max-w-[520px] text-[17px] leading-[1.55] text-vr-t2">{s.logline}</p> : null}
                <div className="flex flex-wrap items-center gap-3">
                  {s.ctas.map((c) => (
                    <Button key={c.label} href={c.href} variant={c.variant === "primary" ? "primary" : "secondary"} icon={c.play ? PLAY : undefined}>
                      {c.label}
                    </Button>
                  ))}
                  {s.follow ? <Button href={s.follow.href} variant="secondary" subline={s.follow.sub}>{s.follow.label}</Button> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="order-first flex flex-col items-start md:order-none md:items-end" data-hero-art>
            {slots.map((s, i) => (
              <Link
                key={s.vertical}
                href={s.art.href}
                hidden={i !== active}
                className={`${i === active ? "block" : "hidden"} overflow-hidden rounded-card border border-hair bg-vr-bg2 ${ART_BOX[s.art.ratio]}`}
                style={{ aspectRatio: RATIO[s.art.ratio] }}
                aria-label={s.art.alt}
              >
                {s.art.src ? (
                  <img src={s.art.src} alt={s.art.alt} className="h-full w-full object-cover" style={{ objectPosition: s.art.position ?? "50% 50%" }} {...(i === 0 ? ({ fetchpriority: "high" } as Record<string, string>) : {})} decoding="async" />
                ) : (
                  <span className="flex h-full w-full items-end p-4 text-[20px] font-medium text-vr-t1">{s.title}</span>
                )}
              </Link>
            ))}
            <div className="mt-[3px] h-[2px] w-full self-stretch bg-vr-bg3" aria-hidden><div className="h-full w-full" style={{ background: cur.accent }} /></div>
          </div>
        </div>
        <div role="tablist" aria-label="Featured by room" className="mt-5 flex h-10 items-stretch gap-7 overflow-x-auto border-t border-hair scrollbar-hide md:mt-6">
          {slots.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.vertical}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`hero-${s.vertical}`}
                onClick={() => setActive(i)}
                className={`relative px-0.5 text-[14px] font-medium transition-colors duration-fast ${on ? "" : "text-vr-t3 hover:text-vr-t1"}`}
                style={on ? { color: s.accent } : undefined}
              >
                {on ? <span aria-hidden className="absolute inset-x-0 -top-px h-[2px]" style={{ background: s.accent }} /> : null}
                {s.kicker.split(" · ")[0]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Rails ───────────────────────────────────────────────────────────────────
function Card({ c }: { c: CardModel }) {
  return (
    <MediaCard
      href={c.href}
      title={c.title}
      ratio={c.ratio}
      image={c.image}
      imagePosition={c.imagePosition}
      caption={c.caption}
      kind={c.kind}
      kindAccent={c.kindAccent}
      chip={c.chip}
      progress={c.progress}
      accent={c.accent}
      width={c.width}
      playGlyph={c.playGlyph}
    />
  );
}

function Vote({ v, width }: { v: VoteModel; width?: number | string }) {
  return (
    <VoteCard
      id={v.id}
      title={v.title}
      author={v.author}
      year={v.year}
      format={v.format}
      votes={v.votes}
      state={v.state}
      note={v.note}
      href={v.href}
      width={width}
    />
  );
}

/** "Listen" row: 1:1 cover · title · status line · play glyph. Music rail only. */
function ListenRow({ c }: { c: CardModel }) {
  return (
    <Link href={c.href} role="listitem" className="flex items-center gap-4 rounded-tile border border-hair bg-vr-bg1 p-3 no-underline transition-colors duration-fast hover:bg-vr-bg2" data-listen-row>
      <span className="block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-card border border-hair bg-vr-bg2">
        {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-vr-t1">{c.title}</span>
        <StatusLine parts={c.caption.split(" · ")} size={12} className="mt-1" />
      </span>
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hair-2 text-vr-t1">{PLAY}</span>
    </Link>
  );
}

function ContinueRow({ item }: { item: ContinueItem }) {
  return (
    <Link href={item.href} role="listitem" className="flex items-center gap-4 rounded-tile border border-hair bg-vr-bg1 p-3 no-underline transition-colors duration-fast hover:bg-vr-bg2" data-continue-row>
      <span className="block w-[72px] shrink-0 overflow-hidden rounded-card border border-hair bg-vr-bg2" style={{ aspectRatio: "3 / 4" }}>
        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" style={{ objectPosition: "50% 20%" }} loading="lazy" decoding="async" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-vr-t1">{item.title}</span>
        <StatusLine parts={item.sub.split(" · ")} size={12} className="mt-1" />
        <ProgressBar value={item.progress} accent="#3DD68C" className="mt-2" />
      </span>
    </Link>
  );
}

function RequestTitleCard() {
  return (
    <Link href="/requests" role="listitem" className="flex w-[172px] shrink-0 snap-start flex-col gap-2 no-underline" data-request-card>
      <span className="flex flex-1 flex-col justify-center rounded-tile border border-dashed border-hair-2 p-4" style={{ aspectRatio: "2 / 3" }}>
        <span className="mb-2 text-[40px] font-light leading-none text-vr-t2" aria-hidden>+</span>
        <span className="text-[18px] font-medium leading-tight text-vr-t1">Request a title →</span>
        <span className="mt-1 font-mono text-[12px] text-vr-t2">A book, a game, an album, anything</span>
      </span>
      <span className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-hair-2 text-[14px] font-medium text-vr-t1">Request</span>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
// Stable defaults: a fresh `{}`/`[]` per render would re-fire the effects below every
// render (new reference → effect → setState → render → …) and starve the event loop.
const EMPTY_INDEX: Record<string, ContinueIndexEntry> = {};
const NONE: never[] = [];

export default function Home(props: Partial<HomeProps>) {
  const {
    hero = NONE, newThisWeek = NONE, shorts = NONE, shortsMeta = "", channel, stories = NONE, storiesMeta = "",
    movies = NONE, moviesMeta = "", music = NONE, games = NONE, slate = NONE, requests, continueIndex = EMPTY_INDEX,
    updated = "",
  } = props;
  const [cont, setCont] = useState<ContinueItem[]>([]);
  useEffect(() => {
    const items = readContinue(continueIndex);
    // Only commit when there is something to show: the server rendered nothing, and an
    // empty → empty update would still schedule a re-render.
    if (items.length) setCont(items);
  }, [continueIndex]);

  return (
    <>
      <Head>
        <title>{"Visurena — A demand-driven AI content studio"}</title>
        <meta name="description" content="Stories, movies, music, games. You choose what's next." />
      </Head>
      <LobbyShell vertical="home" nav={{ requestsCount: requests?.openRequests }}>
        <Hero slots={hero} />

        {newThisWeek.length > 0 && (
          <Section>
            <SectionHeader title="New this week" meta={`Across the studio · ${newThisWeek.length} releases`} accent="#7A7975" />
            <Shelf ariaLabel="New this week" className="items-start">
              {newThisWeek.map((c) => <Card key={c.key} c={c} />)}
            </Shelf>
          </Section>
        )}

        {shorts.length > 0 && (
          <Section>
            <SectionHeader title="Latest shorts" meta={shortsMeta} href="/movies" hrefLabel="All series →" accent="#3DD68C" />
            <Shelf ariaLabel="Latest shorts" className="items-start">
              {shorts.map((c) => <Card key={c.key} c={c} />)}
            </Shelf>
            {channel ? (
              <div className="mt-4 flex flex-wrap items-center gap-3" data-channel-line>
                <Button href={channel.subscribeUrl} external variant="secondary" size="sm">Subscribe on YouTube</Button>
                <a href={channel.url} target="_blank" rel="noreferrer" className="font-mono text-[13px] tracking-[0.04em] text-vr-t2 no-underline hover:text-vr-t1">
                  {channel.name} · every episode as a Short
                </a>
              </div>
            ) : null}
          </Section>
        )}

        {stories.length > 0 && (
          <Section>
            <SectionHeader title="Stories" meta={storiesMeta} href="/stories" hrefLabel="All stories →" accent="#E8B04B" />
            <Shelf ariaLabel="Stories">
              {stories.map((c) => <Card key={c.key} c={c} />)}
            </Shelf>
          </Section>
        )}

        {movies.length > 0 && (
          <Section>
            <SectionHeader title="Movies" meta={moviesMeta} href="/movies" hrefLabel="All movies →" accent="#3DD68C" />
            <Shelf ariaLabel="Movies" className="items-start">
              {movies.map((m) => (m.type === "card" ? <Card key={m.card.key} c={m.card} /> : <Vote key={m.vote.id} v={m.vote} width={172} />))}
            </Shelf>
          </Section>
        )}

        {music.length > 0 && (
          <Section>
            <SectionHeader title="Music" meta={`${music.length} singles · Released`} href="/music" hrefLabel="All music →" accent="#F0537A" />
            <div role="list" aria-label="Music" className="grid gap-4 md:grid-cols-2">
              {music.map((c) => <ListenRow key={c.key} c={c} />)}
            </div>
          </Section>
        )}

        {games.length > 0 && (
          <Section>
            <SectionHeader title="Games" meta={`${games.length} games · Browser · No install`} href="/games" hrefLabel="All games →" accent="#B48CF7" />
            <Shelf ariaLabel="Games">
              {games.map((c) => <Card key={c.key} c={c} />)}
            </Shelf>
          </Section>
        )}

        {slate.length > 0 && (
          <Section>
            <SectionHeader title="On the slate" meta={requests?.votesLine} href="/requests" hrefLabel="Request board →" accent="#6C9BFF" />
            <Shelf ariaLabel="On the slate" className="items-stretch">
              {slate.map((v) => <Vote key={v.id} v={v} width={172} />)}
              <RequestTitleCard />
            </Shelf>
          </Section>
        )}

        {cont.length > 0 && (
          <Section>
            <SectionHeader title="Continue" meta="Picked up from this browser" href="/movies" hrefLabel="All movies →" accent="#7A7975" />
            <div role="list" aria-label="Continue" className="grid gap-4 md:grid-cols-3">
              {cont.map((item) => <ContinueRow key={item.key} item={item} />)}
            </div>
          </Section>
        )}

        <section className="pb-7 pt-2" data-how>
          <p className="max-w-[900px] text-[15px] leading-[1.55] text-vr-t2">
            {updated ? <span className="font-mono text-[13px] text-vr-t3">Updated {updated} · </span> : null}
            Visurena is one person and a set of AI tools making stories, movies, music and games in the open.
            Every frame is generated; every cut is chosen. Vote on what we make next.{" "}
            <Link href="/about" className="border-b border-hair-2 text-vr-t1 no-underline">How it&apos;s made →</Link>
          </p>
        </section>
      </LobbyShell>
    </>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const { getStories } = await import("../lib/content");
  const { getSeriesList, getLatestEpisodes, getReleasedSeries, countShorts, CHANNEL, channelSubscribeUrl } = await import("../lib/movies");
  const { getTracks } = await import("../lib/music");
  const { getSlate, requestsSummary } = await import("../lib/requests");
  const home = await import("../lib/home");
  const contentConfig = (await import("../content-config.json")).default as { games?: import("../lib/home").Game[] };

  const stories = getStories();
  const series = getSeriesList();
  const tracks = getTracks();
  const games = contentConfig.games ?? [];
  const now = new Date();

  const totalRead = stories.reduce((n, s) => n + (s.readMinutes ?? 0), 0);
  const storiesMeta = [
    `${stories.length} ${stories.length === 1 ? "story" : "stories"}`,
    totalRead ? `${Math.floor(totalRead / 60) ? `${Math.floor(totalRead / 60)} h ` : ""}${totalRead % 60} min of reading` : "",
  ].filter(Boolean).join(" · ");

  const continueIndex: Record<string, ContinueIndexEntry> = {};
  for (const s of series) {
    if (!s.episodes.length) continue;
    continueIndex[s.slug] = { slug: s.slug, title: s.title, episodes: s.episodes.map((e) => ({ n: e.n, slug: e.slug, title: e.title, still: e.still })) };
  }

  const props: HomeProps = {
    section: "home",
    hero: home.buildHeroSlots(stories, series, tracks, games, now),
    newThisWeek: home.buildNewThisWeek(stories, getLatestEpisodes(3), tracks, games),
    shorts: home.buildLatestShorts(getLatestEpisodes(10), 10),
    shortsMeta: home.latestShortsMeta(countShorts(series), getReleasedSeries().length, CHANNEL.name),
    channel: { name: CHANNEL.name, url: CHANNEL.url, subscribeUrl: channelSubscribeUrl() },
    stories: stories.slice(0, 7).map((s) => home.storyCard(s)),
    storiesMeta,
    movies: home.buildMoviesRail(series),
    moviesMeta: home.moviesRailMeta(series),
    music: tracks.map((t) => home.trackCard(t)),
    games: games.map((g) => home.gameCard(g)),
    slate: home.buildSlate(getSlate(), series),
    requests: requestsSummary(),
    continueIndex,
    updated: home.formatDateShort(home.latestContentDate(stories, series, tracks, games)),
  };
  return { props: JSON.parse(JSON.stringify(props)) };
};
