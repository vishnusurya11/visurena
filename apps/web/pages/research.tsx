// pages/research.tsx — Research index (a studio page, sapphire; ARCHITECTURE.md D36).
//
// Measured notes from the studio: benchmarks, negative results, design essays, system
// descriptions. Each card leads with its claim and its headline number, then says what it was
// measured on. Filter by type (client state only). The articles come from the content drop
// (research/YYYY/MM/DD/<slug>/item.json) through lib/research.ts, at build time.
//
// IMPORTANT: lib/research.ts imports node:fs — use it only inside getStaticProps.

import React, { useMemo, useState } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { LobbyShell, StatusLine } from "@visurena/ui";
import type { ResearchItem, ResearchType } from "../lib/research";

export interface ResearchCard {
  slug: string;
  title: string;
  claim: string;
  type: ResearchType;
  typeLabel: string;
  kind: ResearchItem["kind"];
  date: string;        // "2026-10-22"
  version: string;
  headline?: { value: string; label: string };
  measured: string[];
  summaryCard?: string;
  pdf?: string;
  doi?: string;
}

export interface ResearchIndexProps {
  section: "research";
  cards: ResearchCard[];
  types: Array<{ id: ResearchType; label: string; count: number }>;
  feed: string;
  canonical: string;
}

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vr-sapphire";

function Card({ c }: { c: ResearchCard }) {
  return (
    <article className="relative flex flex-col gap-3 rounded-card border border-hair bg-vr-bg1 p-5 md:p-6" data-research-card={c.slug}>
      <StatusLine parts={[c.typeLabel, c.date, `v${c.version}`, c.kind === "report" ? "Interactive report" : null]} accentFirst size={12} />
      <h2 className="text-[22px] font-medium leading-[1.2] text-vr-t1 [text-wrap:balance]">
        <Link href={`/research/${c.slug}`} className={`text-vr-t1 no-underline after:absolute after:inset-0 hover:underline ${FOCUS}`}>
          {c.title}
        </Link>
      </h2>
      {c.headline ? (
        <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1" data-headline>
          <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.01em] text-vr-sapphire tabular-nums">{c.headline.value}</span>
          <span className="text-[14px] text-vr-t2">{c.headline.label}</span>
        </p>
      ) : null}
      <p className="m-0 max-w-[72ch] text-[15px] leading-[1.55] text-vr-t2 [text-wrap:pretty]">{c.claim}</p>
      {c.measured.length ? <StatusLine parts={c.measured} size={12} className="text-vr-t3" /> : null}
      {c.pdf || c.doi ? (
        <div className="relative z-10 flex flex-wrap gap-4 font-mono text-[12px] tracking-[0.04em]">
          {c.pdf ? <a href={c.pdf} className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>PDF ↓</a> : null}
          {c.doi ? <a href={`https://doi.org/${c.doi}`} className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>doi:{c.doi}</a> : null}
        </div>
      ) : null}
    </article>
  );
}

export default function ResearchIndex({ cards = [], types = [], feed = "/research/feed.xml", canonical = "" }: Partial<ResearchIndexProps>) {
  const [filter, setFilter] = useState<ResearchType | "all">("all");
  const shown = useMemo(() => (filter === "all" ? cards : cards.filter((c) => c.type === filter)), [cards, filter]);

  return (
    <>
      <Head>
        <title>{"Research — Visurena"}</title>
        <meta name="description" content="Measured notes from an AI film studio run by one person: benchmarks, negative results, and how the studio is built." />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <link rel="alternate" type="application/rss+xml" title="Visurena Research" href={feed} />
      </Head>
      <LobbyShell vertical="home" studio="research">
        <header className="max-w-[880px] pb-8 pt-10 md:pb-10 md:pt-14">
          <p className="m-0 font-mono text-[12px] uppercase tracking-[0.12em] text-vr-sapphire">Research · the studio, measured</p>
          <h1 className="mt-3 text-[44px] font-medium leading-[1.02] tracking-[-0.02em] text-vr-t1 md:text-[64px]">Research</h1>
          <p className="mt-4 max-w-[62ch] text-[17px] leading-[1.55] text-vr-t2 [text-wrap:pretty]">
            Measured notes from an AI film studio run by one person: what was compared, on what, how many times, and what it
            does not show. Negative results are published as negative results.
          </p>
          <StatusLine
            className="mt-4"
            size={12}
            parts={[`${cards.length} ${cards.length === 1 ? "article" : "articles"}`, "Text CC BY 4.0", "Code Apache-2.0"]}
          />
        </header>

        {types.length > 1 ? (
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2 pb-6" data-research-filters>
            {[{ id: "all" as const, label: "All", count: cards.length }, ...types].map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`h-8 rounded-2xl border px-3 font-mono text-[12px] tracking-[0.04em] transition-colors duration-fast ${FOCUS} ${
                  filter === t.id ? "border-vr-sapphire text-vr-t1" : "border-hair-2 text-vr-t2 hover:text-vr-t1"
                }`}
              >
                {t.label} <span className="text-vr-t3 tabular-nums">{t.count}</span>
              </button>
            ))}
          </div>
        ) : null}

        {shown.length ? (
          <div className="grid gap-4 pb-12 lg:grid-cols-2" data-research-list>
            {shown.map((c) => <Card key={c.slug} c={c} />)}
          </div>
        ) : (
          <p className="pb-16 text-[15px] text-vr-t2" data-research-empty>The first notes are being written up. The feed below will carry them.</p>
        )}

        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hair py-6 font-mono text-[12px] tracking-[0.04em] text-vr-t3" data-research-foot>
          <a href={feed} className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>RSS feed</a>
          <span>Every article carries a BibTeX block and a version history.</span>
          <Link href="/about" className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>How the studio works →</Link>
        </section>
      </LobbyShell>
    </>
  );
}

export const getStaticProps: GetStaticProps<ResearchIndexProps> = async () => {
  const { getResearchList, researchTypeLabel, measuredLine, writeResearchFeed, siteUrl, RESEARCH_TYPES } = await import("../lib/research");
  const items = getResearchList();
  const feed = writeResearchFeed(items);
  const cards: ResearchCard[] = items.map((i) => ({
    slug: i.slug,
    title: i.title,
    claim: i.claim,
    type: i.type,
    typeLabel: researchTypeLabel(i.type),
    kind: i.kind,
    date: i.publishAt.slice(0, 10),
    version: i.version,
    headline: i.headline,
    measured: measuredLine(i.measuredOn),
    summaryCard: i.summaryCard,
    pdf: i.pdf,
    doi: i.doi,
  }));
  const types = RESEARCH_TYPES
    .map((id) => ({ id, label: researchTypeLabel(id), count: cards.filter((c) => c.type === id).length }))
    .filter((t) => t.count > 0);
  const props: ResearchIndexProps = { section: "research", cards, types, feed, canonical: `${siteUrl()}/research/` };
  return { props: JSON.parse(JSON.stringify(props)) };
};
