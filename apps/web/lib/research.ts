// apps/web/lib/research.ts
//
// Build-time content provider for Research (a studio page, sapphire; ARCHITECTURE.md D36/D37).
// Server-only — used inside getStaticProps / getStaticPaths.
//
// One article = one self-contained, dated folder in the content drop (same rule as every work, D10/D22):
//   <content root>/research/YYYY/MM/DD/<slug>/
//     item.json      the manifest (single source of truth) — see docs/content-management.md
//     article.md     kind "note":   Markdown (+ optional front-matter), rendered into the Lobby reader
//     report.html    kind "report": a self-contained HTML report, embedded in a sandboxed iframe
//     summary.png    one-screen card (OG image, index card)            optional
//     paper.pdf      print copy beside the page (Google Scholar)       optional
//     data/*         metrics, ledgers, hashes that make the claim checkable
// Assets are copied to public/research/<slug>/ (git-ignored, like public/stories/).
//
// Research is the one section allowed Markdown/HTML bodies (D37); stories stay JSON blocks (D11).

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { selectLive, type ContentItem } from "@visurena/core";
import { contentRoot } from "./content";

// ─── Types ───────────────────────────────────────────────────────────────────
export const RESEARCH_TYPES = ["benchmark", "negative-result", "design-essay", "note", "system"] as const;
export type ResearchType = (typeof RESEARCH_TYPES)[number];
export type ResearchKind = "note" | "report";

export interface MeasuredOn {
  date?: string;
  hardware?: string;
  models?: string[];
  commit?: string;
  n?: number;
  units?: string;
}

export interface ResearchItem extends ContentItem {
  section: "research";
  kind: ResearchKind;
  type: ResearchType;
  version: string;
  updatedAt?: string;
  claim: string;
  headline?: { value: string; label: string };
  measuredOn?: MeasuredOn;
  author: string;
  orcid?: string;
  license?: { text?: string; code?: string };
  doi?: string;
  repo?: string;
  changelog: Array<{ version: string; date: string; note: string }>;
  limitations?: string[];
  /** Public URLs (copied assets). */
  summaryCard?: string;
  pdf?: string;
  report?: string;
  data: Array<{ label: string; href: string }>;
  related?: Array<{ toId: string; type: string; href?: string; label?: string }>;
}

export interface ResearchFull extends ResearchItem {
  /** Rendered article.md (kind "note"). */
  html?: string;
}

export const SAPPHIRE = "#6C9BFF";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://visurena.com").replace(/\/+$/, "");
}

export function researchUrl(slug: string, base = siteUrl()): string {
  return `${base}/research/${slug}/`;
}

// ─── Pure transforms (unit-tested) ───────────────────────────────────────────
const TYPE_LABEL: Record<ResearchType, string> = {
  benchmark: "Benchmark",
  "negative-result": "Negative result",
  "design-essay": "Design essay",
  note: "Note",
  system: "System",
};

export function researchTypeLabel(t: ResearchType): string {
  return TYPE_LABEL[t] ?? "Note";
}

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** "2026-10-27" -> "2026-10-27T00:00:00Z"; full ISO kept. */
export function toPublishIso(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00Z` : s;
}

/**
 * item.json (+ which files exist, as public URLs) -> ResearchItem, or null when the manifest is
 * not an article (no slug / title / claim). A draft never goes live; scheduled and live are
 * gated by publishAt at build time (selectLive).
 */
export function normaliseResearch(
  raw: any,
  files: { summary?: string; pdf?: string; report?: string; data?: Array<{ label: string; href: string }>; hasArticle?: boolean } = {},
): ResearchItem | null {
  const slug = str(raw?.slug);
  const title = str(raw?.title);
  const claim = str(raw?.claim);
  if (!slug || !title || !claim) return null;
  const type: ResearchType = (RESEARCH_TYPES as readonly string[]).includes(raw?.type) ? raw.type : "note";
  const kind: ResearchKind = raw?.kind === "report" && files.report ? "report" : "note";
  const createdAt = str(raw?.createdAt) ?? "1970-01-01";
  const publishAt = toPublishIso(raw?.publishAt) ?? toPublishIso(createdAt)!;
  const changelog = Array.isArray(raw?.changelog)
    ? raw.changelog.filter((c: any) => c && str(c.version) && str(c.date)).map((c: any) => ({ version: c.version, date: c.date, note: String(c.note ?? "") }))
    : [];
  const headline = raw?.headline && str(raw.headline.value) ? { value: raw.headline.value, label: String(raw.headline.label ?? "") } : undefined;
  const item: ResearchItem = {
    id: str(raw?.id) ?? `res_${slug}`,
    section: "research",
    slug,
    title,
    status: raw?.status === "draft" ? "draft" : "live",
    createdAt,
    publishAt,
    accent: str(raw?.accent?.primary) ?? SAPPHIRE,
    summary: str(raw?.summary),
    cover: files.summary,
    tags: Array.isArray(raw?.tags) ? raw.tags.filter((t: unknown) => typeof t === "string") : undefined,
    kind,
    type,
    version: str(raw?.version) ?? "1.0.0",
    updatedAt: str(raw?.updatedAt),
    claim,
    headline,
    measuredOn: raw?.measuredOn && typeof raw.measuredOn === "object" ? raw.measuredOn : undefined,
    author: str(raw?.credits?.author) ?? "ViSuReNa",
    orcid: str(raw?.credits?.orcid),
    license: raw?.license && typeof raw.license === "object" ? raw.license : undefined,
    doi: str(raw?.doi),
    repo: str(raw?.repo),
    changelog,
    limitations: Array.isArray(raw?.limitations) ? raw.limitations.filter((l: unknown) => typeof l === "string") : undefined,
    summaryCard: files.summary,
    pdf: files.pdf,
    report: kind === "report" ? files.report : undefined,
    data: files.data ?? [],
    related: Array.isArray(raw?.related) ? raw.related.filter((r: any) => r && str(r.toId) && str(r.type)) : undefined,
  };
  return stripUndefined(item);
}

function stripUndefined<T>(o: T): T {
  if (Array.isArray(o)) return o.map(stripUndefined) as unknown as T;
  if (o && typeof o === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = stripUndefined(v);
    return out as T;
  }
  return o;
}

/** article.md -> HTML. Front-matter is dropped (item.json is the truth); GitHub-flavoured tables kept. */
export function renderNote(markdown: string): string {
  const { content } = matter(String(markdown ?? ""));
  return marked.parse(content, { gfm: true, async: false }) as string;
}

/** "2026-10-27T00:00:00Z" -> "2026/10/27" (the format Google Scholar's citation_publication_date wants). */
export function scholarDate(iso: string): string {
  return String(iso).slice(0, 10).replace(/-/g, "/");
}

/** Google Scholar <meta name=citation_*> tags. citation_pdf_url only when the PDF sits beside the page. */
export function citationMeta(item: ResearchItem, base = siteUrl()): Array<{ name: string; content: string }> {
  const tags = [
    { name: "citation_title", content: item.title },
    { name: "citation_author", content: item.author },
    { name: "citation_publication_date", content: scholarDate(item.publishAt) },
    { name: "citation_publisher", content: "Visurena" },
    { name: "citation_abstract_html_url", content: researchUrl(item.slug, base) },
  ];
  if (item.pdf) tags.push({ name: "citation_pdf_url", content: `${base}${item.pdf}` });
  if (item.doi) tags.push({ name: "citation_doi", content: item.doi });
  return tags;
}

/** schema.org JSON-LD (ScholarlyArticle; a system description is still an article). */
export function researchJsonLd(item: ResearchItem, base = siteUrl()): Record<string, unknown> {
  return stripUndefined({
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: item.title,
    abstract: item.summary ?? item.claim,
    description: item.claim,
    datePublished: item.publishAt.slice(0, 10),
    dateModified: (item.updatedAt ?? item.publishAt).slice(0, 10),
    version: item.version,
    url: researchUrl(item.slug, base),
    image: item.summaryCard ? `${base}${item.summaryCard}` : undefined,
    author: { "@type": "Person", name: item.author, identifier: item.orcid ? `https://orcid.org/${item.orcid}` : undefined },
    publisher: { "@type": "Organization", name: "Visurena", url: base },
    license: item.license?.text ? `https://spdx.org/licenses/${item.license.text}.html` : undefined,
    identifier: item.doi ? `https://doi.org/${item.doi}` : undefined,
    keywords: item.tags?.join(", "),
  });
}

/** A BibTeX @misc entry: the "How to cite" block. Key = visurena<year><first slug word>. */
export function bibtex(item: ResearchItem, base = siteUrl()): string {
  const year = item.publishAt.slice(0, 4);
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][Number(item.publishAt.slice(5, 7)) - 1] ?? "jan";
  const key = `visurena${year}${item.slug.split("-")[0].replace(/[^a-z0-9]/gi, "")}`;
  const esc = (s: string) => s.replace(/[{}]/g, "");
  const lines = [
    `  author       = {${esc(item.author)}}`,
    `  title        = {${esc(item.title)}}`,
    `  year         = {${year}}`,
    `  month        = ${month}`,
    `  version      = {${item.version}}`,
    item.doi ? `  doi          = {${item.doi}}` : null,
    `  url          = {${researchUrl(item.slug, base)}}`,
    `  howpublished = {Visurena Research}`,
  ].filter(Boolean);
  return `@misc{${key},\n${lines.join(",\n")}\n}`;
}

const xmlEsc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 for /research/feed.xml, newest first. */
export function buildFeed(items: ResearchItem[], base = siteUrl()): string {
  const entries = items
    .map((i) => [
      "    <item>",
      `      <title>${xmlEsc(i.title)}</title>`,
      `      <link>${researchUrl(i.slug, base)}</link>`,
      `      <guid isPermaLink="true">${researchUrl(i.slug, base)}</guid>`,
      `      <pubDate>${new Date(i.publishAt).toUTCString()}</pubDate>`,
      `      <category>${xmlEsc(researchTypeLabel(i.type))}</category>`,
      `      <description>${xmlEsc(i.claim)}</description>`,
      "    </item>",
    ].join("\n"))
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Visurena Research</title>",
    `    <link>${base}/research/</link>`,
    "    <description>Measured notes from an AI film studio: benchmarks, negative results and how the studio is built.</description>",
    "    <language>en</language>",
    entries,
    "  </channel>",
    "</rss>",
    "",
  ].filter((l) => l !== "").join("\n") + "\n";
}

/** Newest first; ties by slug so builds are deterministic. */
export function sortResearch<T extends ResearchItem>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.publishAt > a.publishAt ? 1 : b.publishAt < a.publishAt ? -1 : a.slug.localeCompare(b.slug)));
}

/** The 4-line "Measured on" summary: date · hardware · n units · commit. */
export function measuredLine(m?: MeasuredOn): string[] {
  if (!m) return [];
  return [
    m.date ? `Measured ${m.date}` : null,
    m.hardware ?? null,
    typeof m.n === "number" ? `n = ${m.n}${m.units ? ` ${m.units}` : ""}` : null,
    m.commit ?? null,
  ].filter((x): x is string => !!x);
}

// ─── IO ──────────────────────────────────────────────────────────────────────
function publicRoot(): string {
  // VR_PUBLIC_DIR lets tests copy into a temp folder instead of apps/web/public.
  return process.env.VR_PUBLIC_DIR || path.join(process.cwd(), "public");
}

/** Every directory under `root` that holds an item.json. */
function findResearchDirs(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.isFile() && e.name === "item.json")) {
      out.push(dir);
      return; // a work folder is self-contained; never descend into its data/
    }
    for (const e of entries) if (e.isDirectory()) walk(path.join(dir, e.name));
  };
  walk(root);
  return out;
}

/** Copy one file into public/research/<slug>/<rel>; returns its web path, or undefined if absent. */
function publish(slug: string, srcDir: string, rel: string): string | undefined {
  const src = path.join(srcDir, rel);
  if (!fs.existsSync(src)) return undefined;
  const dest = path.join(publicRoot(), "research", slug, rel);
  try {
    const fresh = fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs;
    if (!fresh) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  } catch {
    /* non-fatal: a locked asset must not break the build */
  }
  return `/research/${slug}/${rel.split(path.sep).join("/")}`;
}

function readArticle(dir: string): ResearchFull | null {
  let raw: any;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(dir, "item.json"), "utf8"));
  } catch {
    return null;
  }
  const slug = str(raw?.slug);
  if (!slug) return null;
  const dataDir = path.join(dir, "data");
  let data: Array<{ label: string; href: string }> = [];
  try {
    data = fs.readdirSync(dataDir)
      .filter((n) => fs.statSync(path.join(dataDir, n)).isFile())
      .sort()
      .map((n) => ({ label: n, href: publish(slug, dir, path.join("data", n))! }))
      .filter((d) => d.href);
  } catch {
    /* no data folder */
  }
  const item = normaliseResearch(raw, {
    summary: publish(slug, dir, "summary.png"),
    pdf: publish(slug, dir, "paper.pdf"),
    report: publish(slug, dir, "report.html"),
    data,
  });
  if (!item) return null;
  let html: string | undefined;
  try {
    html = renderNote(fs.readFileSync(path.join(dir, "article.md"), "utf8"));
  } catch {
    /* a report may have no article.md */
  }
  return html ? { ...item, html } : item;
}

let _cache: ResearchFull[] | null = null;

function loadAll(): ResearchFull[] {
  if (_cache) return _cache;
  _cache = findResearchDirs(path.join(contentRoot(), "research"))
    .map(readArticle)
    .filter((r): r is ResearchFull => r !== null);
  return _cache;
}

/** Test hook: forget the per-process cache. */
export function resetResearchCache(): void {
  _cache = null;
}

/** Live articles, newest first, body stripped (for the index). */
export function getResearchList(now: Date = new Date()): ResearchItem[] {
  return sortResearch(selectLive(loadAll(), now) as ResearchFull[]).map(({ html: _html, ...rest }) => rest);
}

/** One live article with its body. */
export function getResearch(slug: string, now: Date = new Date()): ResearchFull | undefined {
  return (selectLive(loadAll(), now) as ResearchFull[]).find((r) => r.slug === slug);
}

/** Write public/research/feed.xml (static export copies it to out/research/feed.xml). */
export function writeResearchFeed(items: ResearchItem[]): string {
  const file = path.join(publicRoot(), "research", "feed.xml");
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buildFeed(items), "utf8");
  } catch {
    /* non-fatal */
  }
  return "/research/feed.xml";
}
