// pages/research/[slug].tsx — one research article (a studio page, sapphire; ARCHITECTURE.md D36/D37).
//
// Layout, same for every article: type · date · version → title → headline number → claim →
// "measured on" → body (a rendered note, or a self-contained HTML report in a sandboxed iframe)
// → what it does not show → data → how to cite (BibTeX) → licence → changelog.
// <head> carries the canonical URL, Open Graph, Google Scholar citation_* tags and
// schema.org ScholarlyArticle JSON-LD, all built in getStaticProps.
//
// IMPORTANT: lib/research.ts imports node:fs — use it only inside getStaticProps / getStaticPaths.

import React, { useState } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { LobbyShell, StatusLine } from "@visurena/ui";
import type { ResearchFull } from "../../lib/research";

export interface ResearchArticleProps {
  section: "research";
  article: ResearchFull;
  typeLabel: string;
  measured: string[];
  canonical: string;
  ogImage?: string;
  citation: Array<{ name: string; content: string }>;
  jsonLd: string;
  bibtex: string;
}

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vr-sapphire";
const H2 = "mb-3 mt-0 text-[20px] font-medium text-vr-t1";

function CopyBibtex({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        try {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked: the block stays selectable */
        }
      }}
      className={`h-8 rounded-lg border border-hair-2 px-3 font-mono text-[12px] tracking-[0.04em] text-vr-t1 hover:bg-vr-bg2 ${FOCUS}`}
      data-copy-bibtex
    >
      {copied ? "Copied" : "Copy BibTeX"}
    </button>
  );
}

export default function ResearchArticle({ article: a, typeLabel, measured, canonical, ogImage, citation, jsonLd, bibtex }: ResearchArticleProps) {
  const published = a.publishAt.slice(0, 10);
  return (
    <>
      <Head>
        <title>{`${a.title} — Research — Visurena`}</title>
        <meta name="description" content={a.claim} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={a.title} />
        <meta property="og:description" content={a.claim} />
        <meta property="og:url" content={canonical} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        {citation.map((t) => <meta key={t.name + t.content} name={t.name} content={t.content} />)}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </Head>
      <LobbyShell vertical="home" studio="research">
        <article className="pb-12" data-research-article={a.slug}>
          <header className="max-w-[880px] pb-8 pt-8 md:pt-12">
            <nav aria-label="Breadcrumb" className="font-mono text-[12px] tracking-[0.04em] text-vr-t3">
              <Link href="/research" className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>Research</Link>
              <span aria-hidden> / </span>
              <span>{typeLabel}</span>
            </nav>
            <StatusLine className="mt-5" size={12} accentFirst parts={[typeLabel, `Published ${published}`, `v${a.version}`, a.updatedAt && a.updatedAt.slice(0, 10) !== published ? `Updated ${a.updatedAt.slice(0, 10)}` : null, a.author]} />
            <h1 className="mt-3 text-[34px] font-medium leading-[1.08] tracking-[-0.015em] text-vr-t1 [text-wrap:balance] md:text-[48px]">{a.title}</h1>
            {a.headline ? (
              <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1" data-headline>
                <span className="font-mono text-[40px] font-medium leading-none tracking-[-0.02em] text-vr-sapphire tabular-nums md:text-[52px]">{a.headline.value}</span>
                <span className="text-[16px] text-vr-t2">{a.headline.label}</span>
              </p>
            ) : null}
            <p className="mt-5 max-w-[68ch] text-[19px] leading-[1.5] text-vr-t1 [text-wrap:pretty]" data-claim>{a.claim}</p>
            {measured.length ? <StatusLine className="mt-4 text-vr-t3" size={12} parts={measured} /> : null}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] tracking-[0.04em]">
              {a.pdf ? <a href={a.pdf} className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>PDF ↓</a> : null}
              {a.repo ? <a href={a.repo} target="_blank" rel="noreferrer" className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>Code ↗</a> : null}
              {a.doi ? <a href={`https://doi.org/${a.doi}`} className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>doi:{a.doi}</a> : null}
              <a href="#cite" className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>How to cite ↓</a>
            </div>
          </header>

          {a.summary ? (
            <section className="mb-8 max-w-[760px] rounded-card border border-hair bg-vr-bg1 p-5" aria-label="Abstract" data-abstract>
              <h2 className="m-0 mb-2 font-mono text-[12px] font-normal uppercase tracking-[0.12em] text-vr-t3">Abstract</h2>
              <p className="m-0 text-[15px] leading-[1.6] text-vr-t2 [text-wrap:pretty]">{a.summary}</p>
            </section>
          ) : null}

          {a.kind === "report" && a.report ? (
            <section aria-label="Report" className="mb-10" data-report>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 font-mono text-[12px] tracking-[0.04em] text-vr-t3">
                <span>Interactive report · runs in its own sandbox</span>
                <a href={a.report} target="_blank" rel="noreferrer" className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>Open full screen ↗</a>
              </div>
              <iframe
                src={a.report}
                title={a.title}
                sandbox="allow-scripts allow-popups"
                loading="lazy"
                className="block h-[82vh] min-h-[560px] w-full rounded-card border border-hair bg-vr-bg1"
              />
            </section>
          ) : null}

          {a.html ? (
            <div className="vr-prose max-w-[760px]" data-article-body dangerouslySetInnerHTML={{ __html: a.html }} />
          ) : null}

          {/* min-w-0 on the children: a grid item's min width is its content, and one long BibTeX
              line would otherwise widen the column past a phone screen. */}
          <div className="mt-12 grid max-w-[1040px] gap-10 border-t border-hair pt-10 lg:grid-cols-2 [&>*]:min-w-0">
            {a.limitations?.length ? (
              <section aria-labelledby="limits">
                <h2 id="limits" className={H2}>What this does not show</h2>
                <ul className="m-0 list-disc space-y-2 pl-5 text-[15px] leading-[1.55] text-vr-t2">
                  {a.limitations.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </section>
            ) : null}

            {a.data.length ? (
              <section aria-labelledby="data">
                <h2 id="data" className={H2}>Data</h2>
                <ul className="m-0 list-none space-y-1.5 p-0 font-mono text-[13px]">
                  {a.data.map((d) => (
                    <li key={d.href}><a href={d.href} className={`text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS}`}>{d.label} ↓</a></li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="cite" className="lg:col-span-2" data-cite>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="cite" className="m-0 text-[20px] font-medium text-vr-t1">How to cite</h2>
                <CopyBibtex text={bibtex} />
              </div>
              <pre className="m-0 overflow-x-auto rounded-card border border-hair bg-vr-bg1 p-4 font-mono text-[13px] leading-[1.55] text-vr-t1" data-bibtex>{bibtex}</pre>
              <p className="mt-3 text-[13px] text-vr-t3">
                Text {a.license?.text ?? "CC-BY-4.0"} · code {a.license?.code ?? "Apache-2.0"} · cite the version you read.
              </p>
            </section>

            {a.changelog.length ? (
              <section aria-labelledby="changes" className="lg:col-span-2">
                <h2 id="changes" className={H2}>Changelog</h2>
                <ol className="m-0 list-none space-y-1.5 p-0 font-mono text-[13px] text-vr-t2" data-changelog>
                  {a.changelog.map((c) => (
                    <li key={c.version + c.date}><span className="text-vr-t1">v{c.version}</span> · {c.date} · <span className="font-sans">{c.note}</span></li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        </article>
      </LobbyShell>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { getResearchList } = await import("../../lib/research");
  return { paths: getResearchList().map((r) => ({ params: { slug: r.slug } })), fallback: false };
};

export const getStaticProps: GetStaticProps<ResearchArticleProps, { slug: string }> = async ({ params }) => {
  const { getResearch, researchTypeLabel, measuredLine, citationMeta, researchJsonLd, bibtex, researchUrl, siteUrl } = await import("../../lib/research");
  const article = params ? getResearch(params.slug) : undefined;
  if (!article) return { notFound: true };
  const base = siteUrl();
  const props: ResearchArticleProps = {
    section: "research",
    article,
    typeLabel: researchTypeLabel(article.type),
    measured: measuredLine(article.measuredOn),
    canonical: researchUrl(article.slug, base),
    ogImage: article.summaryCard ? `${base}${article.summaryCard}` : undefined,
    citation: citationMeta(article, base),
    // `<` escaped so the JSON can never close the <script> it sits in.
    jsonLd: JSON.stringify(researchJsonLd(article, base)).replace(/</g, "\\u003c"),
    bibtex: bibtex(article, base),
  };
  return { props: JSON.parse(JSON.stringify(props)) };
};
