// pages/stories/index.tsx — Stories hub (Cinema Lobby, amber accent)
//
// Compact hub header → responsive 3:4 MediaCard grid → "Vote on what's next" strip.
// Real content only: stories from lib/content.ts (getStories), requests from
// content-local/requests.json via lib/requests.ts (server-only, in getStaticProps).
// Nothing hidden at first paint, no reveals, no "coming soon".

import React from "react";
import Head from "next/head";
import type { GetStaticProps } from "next";
import { getRequests, requestsSummary, type RequestItem } from "../../lib/requests";
import { LobbyShell, AmbientGlow, Section, SectionHeader, MediaCard, StatusLine, VoteCard } from "@visurena/ui";
import { getStories, type Story } from "../../lib/content";

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

// ─── Story helpers (pure — tested) ───────────────────────────────────────────
const KIND_LABEL: Record<Story["kind"], string> = { short: "Short story", novel: "Novel", series: "Series" };

/** `Short story · Genre · N min` */
export function storyCaption(s: Story): string {
  return [KIND_LABEL[s.kind] ?? "Story", s.genre, s.readMinutes ? `${s.readMinutes} min` : null]
    .filter(Boolean)
    .join(" · ");
}

/** 169 → "2 h 49 min"; 35 → "35 min"; 0 → "0 min" */
export function formatReadTime(minutes: number): string {
  const m = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest} min`;
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}

/** Header status parts: `Short stories · Live · 7 stories · 2 h 49 min` */
export function storiesStatusParts(stories: Story[]): string[] {
  const n = stories.length;
  const total = stories.reduce((acc, s) => acc + (s.readMinutes ?? 0), 0);
  const genres = new Set(stories.map((s) => s.genre).filter(Boolean)).size;
  return [
    "Short stories",
    "Live",
    `${n} ${n === 1 ? "story" : "stories"}`,
    genres ? `${genres} ${genres === 1 ? "genre" : "genres"}` : null,
    total ? `${formatReadTime(total)} of reading` : null,
  ].filter((x): x is string => Boolean(x));
}

// ─── Page ────────────────────────────────────────────────────────────────────
interface StoriesProps {
  section: "stories";
  stories: Story[];
  votes: RequestItem[];
  totalVotes: number;
  openRequests: number;
}

export default function StoriesPage({ stories, votes, totalVotes, openRequests }: StoriesProps) {
  const lead = stories[0];
  return (
    <>
      <Head>
        <title>{"Stories — Visurena"}</title>
        <meta name="description" content="Short stories you can read in one sitting — slow horror, patient mystery, restless thriller." />
      </Head>
      <LobbyShell vertical="stories" nav={{ requestsCount: openRequests }}>
        <header className="relative pb-2 pt-9" data-hub-head>
          <AmbientGlow src={lead?.cover34} accent="#E8B04B" opacity={0.35} />
          <div className="relative">
            <p className="font-mono text-[13px] tracking-[0.04em] text-vr-t2">Stories · Amber room</p>
            <h1 className="mt-3 text-[40px] font-medium leading-[1.02] tracking-[-0.025em] text-vr-t1 md:text-[56px]">Stories</h1>
            <div className="mt-2 h-[3px] w-7 rounded-[2px] bg-vr-accent" aria-hidden />
            <StatusLine parts={storiesStatusParts(stories)} className="mt-[10px]" />
            <p className="mt-3 max-w-[60ch] text-[15px] text-vr-t2">
              Short stories you can read in one sitting. Slow horror, patient mystery, restless thriller.
            </p>
          </div>
        </header>

        <Section>
          <SectionHeader title="All stories" meta="Newest first" />
          <div role="list" aria-label="Stories" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {stories.map((s) => (
              <MediaCard
                key={s.slug}
                href={`/stories/${s.slug}`}
                title={s.title}
                ratio="3:4"
                image={s.cover34}
                caption={storyCaption(s)}
                kind="Story"
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

export const getStaticProps: GetStaticProps<StoriesProps> = async () => {
  const stories = getStories();
  const req = requestsSummary();
  const props: StoriesProps = {
    section: "stories",
    stories,
    votes: pickVotes(getRequests(), "Stories"),
    totalVotes: req.totalVotes,
    openRequests: req.openRequests,
  };
  return { props: JSON.parse(JSON.stringify(props)) };
};
