// pages/music.tsx — Music hub (Cinema Lobby, ruby accent)
//
// Compact hub header → 1:1 poster grid with a play glyph (click plays the music
// video inline with its poster; no autoplay on load) → "Vote on what's next" strip.
// Tracks come from lib/music.ts (getTracks); requests from content-local/requests.json.
// Only the singles live here — the audiobook belongs to the series page (owner rule).

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import type { GetStaticProps } from "next";
import { getRequests, requestsSummary, type RequestItem } from "../lib/requests";
import { LobbyShell, AmbientGlow, Section, SectionHeader, MediaCard, StatusLine, VoteCard, Button } from "@visurena/ui";
import { getTracks, trackStatusParts, type Track } from "../lib/music";

export type { Track };

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

// ─── Small helpers (pure — tested) ──────────────────────────────────────────
/** 62 → "1:02"; invalid → "—" */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatReleaseDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** `Single · Released · m:ss` (the shared status-line grammar from lib/music) */
export function trackCaption(t: Track): string {
  return trackStatusParts(t).join(" · ");
}

/** Header status parts: `Singles · Released · 2 tracks · 2:04` */
export function musicStatusParts(tracks: Array<Pick<Track, "seconds">>): string[] {
  const n = tracks.length;
  const total = tracks.reduce((acc, t) => acc + (Number.isFinite(t.seconds) ? t.seconds : 0), 0);
  return ["Singles", "Released", `${n} ${n === 1 ? "track" : "tracks"}`, `${formatDuration(total)} of music`, "Music videos"];
}

/** Newest release first; stable for equal dates. */
export function sortTracksNewest<T extends Pick<Track, "releaseDate">>(tracks: T[]): T[] {
  return [...tracks].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
}

// ─── Track tile: MediaCard (play glyph) → inline <video> after a click ─────────
function TrackTile({ track }: { track: Track }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start playback only after the user's click mounted the player (never on page load).
  useEffect(() => {
    if (!playing) return;
    const v = videoRef.current;
    if (v && typeof v.play === "function") {
      try {
        const p = v.play();
        if (p && typeof (p as Promise<void>).catch === "function") (p as Promise<void>).catch(() => {});
      } catch {
        /* jsdom / blocked autoplay: the controls are visible, the user can press play */
      }
    }
  }, [playing]);

  if (!playing) {
    return (
      <div
        id={track.slug}
        data-track-tile
        onClickCapture={(e) => {
          // The card is a link for no-JS / SSR; with JS a click plays inline instead.
          e.preventDefault();
          e.stopPropagation();
          setPlaying(true);
        }}
      >
        <MediaCard
          href={`/music#${track.slug}`}
          title={track.title}
          ratio="1:1"
          image={track.posterUrl}
          caption={trackCaption(track)}
          kind="Single"
          playGlyph
        />
      </div>
    );
  }

  return (
    <figure id={track.slug} data-track-tile data-playing className="m-0">
      <div className="relative overflow-hidden rounded-card border border-hair bg-vr-bg1" style={{ aspectRatio: "1 / 1" }}>
        <video
          ref={videoRef}
          src={track.videoUrl}
          poster={track.posterUrl}
          controls
          playsInline
          preload="metadata"
          aria-label={`${track.title} — music video`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-[3px] h-[2px] w-full bg-vr-bg3"><div className="h-full w-full bg-vr-accent" /></div>
      <figcaption className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-mono text-[12px] text-vr-t3 tabular-nums">{trackCaption(track)} · Now playing</div>
          <div className="line-clamp-2 text-[14px] font-medium leading-snug text-vr-t1">{track.title}</div>
        </div>
        <Button variant="ghost" onClick={() => setPlaying(false)}>Close</Button>
      </figcaption>
      {track.story ? <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-vr-t2">{track.story}</p> : null}
    </figure>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
interface MusicProps {
  section: "music";
  tracks: Track[];
  votes: RequestItem[];
  totalVotes: number;
  openRequests: number;
}

export default function MusicPage({ tracks, votes, totalVotes, openRequests }: MusicProps) {
  const lead = tracks[0];
  return (
    <>
      <Head>
        <title>{"Music — Visurena"}</title>
        <meta name="description" content="Original songs, original art, and the story each one is telling." />
      </Head>
      <LobbyShell vertical="music" nav={{ requestsCount: openRequests }}>
        <header className="relative pb-2 pt-9" data-hub-head>
          <AmbientGlow src={lead?.posterUrl} accent="#F0537A" opacity={0.35} />
          <div className="relative">
            <p className="font-mono text-[13px] tracking-[0.04em] text-vr-t2">Music · Ruby room</p>
            <h1 className="mt-3 text-[40px] font-medium leading-[1.02] tracking-[-0.025em] text-vr-t1 md:text-[56px]">Music</h1>
            <div className="mt-2 h-[3px] w-7 rounded-[2px] bg-vr-accent" aria-hidden />
            <StatusLine parts={musicStatusParts(tracks)} className="mt-[10px]" />
            <p className="mt-3 max-w-[60ch] text-[15px] text-vr-t2">
              Original songs, original art, and the story each one is telling — released as short music videos.
            </p>
          </div>
        </header>

        <Section>
          <SectionHeader title="Singles" meta="Newest first · press play to watch here" />
          <div role="list" aria-label="Singles" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tracks.map((t) => (
              <TrackTile key={t.slug} track={t} />
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

export const getStaticProps: GetStaticProps<MusicProps> = async () => {
  const req = requestsSummary();
  const props: MusicProps = {
    section: "music",
    tracks: sortTracksNewest(getTracks()),
    votes: pickVotes(getRequests(), "Music"),
    totalVotes: req.totalVotes,
    openRequests: req.openRequests,
  };
  return { props: JSON.parse(JSON.stringify(props)) };
};
