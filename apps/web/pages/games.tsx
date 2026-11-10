// pages/games.tsx — Games hub (Cinema Lobby, amethyst accent)
//
// Compact hub header → responsive 16:9 MediaCard grid (`Arcade · N min · Browser`)
// → "Vote on what's next" strip. Games come from content-config.json; requests from
// content-local/requests.json. Every game links to its existing /games/<slug> page.

import React from "react";
import Head from "next/head";
import type { GetStaticProps } from "next";
import { getRequests, requestsSummary, type RequestItem } from "../lib/requests";
import { LobbyShell, AmbientGlow, Section, SectionHeader, MediaCard, StatusLine, VoteCard } from "@visurena/ui";
import contentConfig from "../content-config.json";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Game {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  playUrl?: string;
  duration?: string;      // "Endless" | "Level-based" | "Match-based" | "Wave-based"
  releaseDate?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  players?: string;
  controls?: string;
  difficulty?: string;
}

const GAMES: Game[] = (contentConfig.games as Game[]) ?? [];

// ─── Requests: the vote strip ────────────────────────────────────────────────
/**
 * Pick the vote strip: items whose format matches the vertical first (by votes),
 * then the top remaining items by votes until `n` are filled. Never returns more than `n`.
 */
export function pickVotes(items: RequestItem[], format: string, n = 3): RequestItem[] {
  const byVotes = (a: RequestItem, b: RequestItem) => b.votes - a.votes;
  const match = items.filter((r) => r.format === format).sort(byVotes);
  const rest = items.filter((r) => r.format !== format).sort(byVotes);
  return [...match, ...rest].slice(0, n);
}

// ─── Game helpers (pure — tested) ────────────────────────────────────────────
function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** First tag, capitalised ("arcade" → "Arcade"); "Arcade" when untagged. */
export function gameFormat(g: Pick<Game, "tags">): string {
  const t = g.tags?.[0];
  return t ? cap(t) : "Arcade";
}

/**
 * Typical session length in minutes, derived from the run structure in content-config
 * (there is no per-game minutes field yet). Endless runs are short loops; level and
 * wave games run longer; a match is quick.
 */
export function sessionMinutes(g: Pick<Game, "duration">): number {
  switch ((g.duration ?? "").toLowerCase()) {
    case "match-based": return 3;
    case "endless": return 5;
    case "wave-based": return 6;
    case "level-based": return 8;
    default: return 5;
  }
}

/** `Arcade · N min · Browser` */
export function gameCaption(g: Pick<Game, "tags" | "duration">): string {
  return [gameFormat(g), `${sessionMinutes(g)} min`, "Browser"].join(" · ");
}

export function gameHref(g: Pick<Game, "playUrl" | "slug">): string {
  return g.playUrl || `/games/${g.slug}`;
}

/** Header status parts: `Arcade · Playable · 10 games · 6 genres · Browser · Free` */
export function gamesStatusParts(games: Game[]): string[] {
  const n = games.length;
  const genres = new Set(games.map(gameFormat)).size;
  return [
    "Arcade",
    "Playable",
    `${n} ${n === 1 ? "game" : "games"}`,
    genres ? `${genres} ${genres === 1 ? "genre" : "genres"}` : null,
    "Browser",
    "Free",
  ].filter((x): x is string => Boolean(x));
}

// ─── Page ────────────────────────────────────────────────────────────────────
interface GamesProps {
  section: "games";
  games: Game[];
  votes: RequestItem[];
  totalVotes: number;
  openRequests: number;
}

export default function GamesPage({ games, votes, totalVotes, openRequests }: GamesProps) {
  const lead = games.find((g) => g.featured) ?? games[0];
  return (
    <>
      <Head>
        <title>{"Games — Visurena"}</title>
        <meta name="description" content="Arcade classics reimagined — play instantly in your browser. No installs, no accounts, no ads." />
      </Head>
      <LobbyShell vertical="games" nav={{ requestsCount: openRequests }}>
        <header className="relative pb-2 pt-9" data-hub-head>
          <AmbientGlow src={lead?.thumbnail} accent="#B48CF7" opacity={0.35} />
          <div className="relative">
            <p className="font-mono text-[13px] tracking-[0.04em] text-vr-t2">Games · Amethyst room</p>
            <h1 className="mt-3 text-[40px] font-medium leading-[1.02] tracking-[-0.025em] text-vr-t1 md:text-[56px]">Games</h1>
            <div className="mt-2 h-[3px] w-7 rounded-[2px] bg-vr-accent" aria-hidden />
            <StatusLine parts={gamesStatusParts(games)} className="mt-[10px]" />
            <p className="mt-3 max-w-[60ch] text-[15px] text-vr-t2">
              Arcade classics, reimagined. Play instantly in your browser — no installs, no accounts, no ads.
            </p>
          </div>
        </header>

        <Section>
          <SectionHeader title="All games" meta="Keyboard or touch · saves your best score" />
          <div role="list" aria-label="Games" className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {games.map((g) => (
              <MediaCard
                key={g.slug}
                href={gameHref(g)}
                title={g.title}
                ratio="16:9"
                image={g.thumbnail}
                caption={gameCaption(g)}
                kind="Game"
              />
            ))}
          </div>
        </Section>

        <Section>
          <SectionHeader
            title="Vote on what's next"
            meta={totalVotes ? `${totalVotes.toLocaleString()} votes this season` : undefined}
            href="/requests"
            hrefLabel="Request board →"
          />
          <div role="list" aria-label="Requests" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {votes.map((r) => (
              <VoteCard
                key={r.id}
                id={r.id}
                title={r.title}
                author={r.author}
                year={r.year}
                format={r.format}
                votes={r.votes}
                state={r.state}
                href={r.state === "in-production" && r.producedSlug ? `/movies/${r.producedSlug}` : undefined}
                width="100%"
              />
            ))}
          </div>
        </Section>
      </LobbyShell>
    </>
  );
}

export const getStaticProps: GetStaticProps<GamesProps> = async () => {
  const req = requestsSummary();
  const props: GamesProps = {
    section: "games",
    games: GAMES,
    votes: pickVotes(getRequests(), "Games"),
    totalVotes: req.totalVotes,
    openRequests: req.openRequests,
  };
  return { props: JSON.parse(JSON.stringify(props)) };
};
