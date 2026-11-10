// pages/requests.tsx — the request board. Header with totals, the slate as a grid of
// VoteCards (in-production first, then by votes), and a "Request a title" form stub.
//
// The form sends nothing: submit → preventDefault → local "thanks" state. Submitting real
// requests (and counting real votes) needs sign-in + the Phase 2 API; the copy says so.

import React, { useState } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { LobbyShell, Section, SectionHeader, StatusLine, Button, VoteCard } from "@visurena/ui";
import type { VoteModel } from "../lib/home";
import type { RequestsSummary } from "../lib/requests";

export interface RequestsPageProps {
  section: "home";
  slate: VoteModel[];
  summary: RequestsSummary;
}

export const REQUEST_FORMATS = ["Episodes", "Feature", "Shorts", "Stories", "Music", "Games", "Other"] as const;

/** Header status line: `12 on the board · 2,850 votes this season · 312 open requests · 1 in production`. */
export function boardStatusParts(s: RequestsSummary): string[] {
  return [
    `${s.count} on the board`,
    s.votesLine,
    `${s.openRequests.toLocaleString("en-US")} open requests`,
    s.inProduction ? `${s.inProduction} in production` : "",
  ].filter(Boolean);
}

/** Pure form rule: a request needs a title of at least two characters. */
export function validateRequestTitle(title: string): string | null {
  const t = title.trim();
  if (t.length < 2) return "Give it a title (at least two characters).";
  if (t.length > 120) return "Keep the title under 120 characters.";
  return null;
}

/** The local "thanks" line after a (fake) submit. */
export function thanksMessage(title: string, format: string): string {
  return `Thanks — "${title.trim()}" (${format}) is noted on this device. Requests will be sent to the board once sign-in lands; nothing has left your browser yet.`;
}

function RequestForm() {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<string>(REQUEST_FORMATS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState<string | null>(null);

  const field = "min-h-[44px] w-full rounded-lg border border-hair bg-vr-bg1 px-3 text-[14px] text-vr-t1 placeholder:text-vr-t3 focus:border-hair-2 focus:outline-none";

  return (
    <form
      className="grid max-w-[640px] gap-4"
      aria-label="Request a title"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const err = validateRequestTitle(title);
        setError(err);
        if (err) return;
        setThanks(thanksMessage(title, format));
        setTitle("");
        setNote("");
      }}
    >
      <label className="grid gap-1.5 text-[13px] text-vr-t2">
        Title
        <input className={field} name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A book, a game, an album, anything" autoComplete="off" />
      </label>
      <label className="grid gap-1.5 text-[13px] text-vr-t2">
        Format
        <select className={field} name="format" value={format} onChange={(e) => setFormat(e.target.value)}>
          {REQUEST_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-[13px] text-vr-t2">
        Why this one? (optional)
        <textarea className={`${field} min-h-[96px] py-2`} name="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
      </label>
      {error ? <p role="alert" className="font-mono text-[12px] text-vr-ruby">{error}</p> : null}
      {thanks ? <p role="status" className="rounded-lg border border-hair bg-vr-bg1 p-3 text-[14px] text-vr-t1">{thanks}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary">Submit request</Button>
        <span className="font-mono text-[12px] text-vr-t3">Sign-in required once accounts land · nothing is sent yet</span>
      </div>
    </form>
  );
}

export default function RequestsPage({ slate = [], summary }: Partial<RequestsPageProps>) {
  const s: RequestsSummary = summary ?? { season: "", totalVotes: 0, openRequests: 0, count: slate.length, inProduction: 0, votesLine: "0 votes this season" };
  return (
    <>
      <Head>
        <title>{"Requests — Visurena"}</title>
        <meta name="description" content="Vote for what the studio makes next. The top of the board goes into production." />
      </Head>
      <LobbyShell vertical="home" studio="requests" nav={{ requestsCount: s.openRequests }}>
        <header className="pb-2 pt-10 md:pt-12" data-board-head>
          <h1 className="text-[36px] font-medium leading-[1.05] tracking-[-0.02em] text-vr-t1 md:text-[48px]">Requests</h1>
          <div className="mt-2 h-[3px] w-8 rounded-full" style={{ background: "#6C9BFF" }} />
          <StatusLine parts={boardStatusParts(s)} className="mt-3" />
          <p className="mt-3 max-w-[640px] text-[16px] leading-[1.55] text-vr-t2">
            Vote for what the studio makes next. The top of the board goes into production; what&apos;s in production stays on the board until it ships.
          </p>
        </header>

        <Section>
          <SectionHeader title="On the slate" meta={s.season ? `Season ${s.season}` : undefined} accent="#6C9BFF" />
          {slate.length ? (
            <div role="list" aria-label="On the slate" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {slate.map((v) => (
                <VoteCard key={v.id} id={v.id} title={v.title} author={v.author} year={v.year} format={v.format} votes={v.votes} state={v.state} note={v.note} href={v.href} width="100%" />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-vr-t2">The board is open — be the first to request a title below.</p>
          )}
        </Section>

        <Section>
          <SectionHeader title="Request a title" meta="A book, a game, an album, anything" accent="#6C9BFF" as="h2" />
          <RequestForm />
        </Section>
      </LobbyShell>
    </>
  );
}

export const getStaticProps: GetStaticProps<RequestsPageProps> = async () => {
  const { getSlate, requestsSummary } = await import("../lib/requests");
  const { getSeriesList } = await import("../lib/movies");
  const { buildSlate } = await import("../lib/home");
  const props: RequestsPageProps = {
    section: "home",
    slate: buildSlate(getSlate(), getSeriesList()),
    summary: requestsSummary(),
  };
  return { props: JSON.parse(JSON.stringify(props)) };
};
