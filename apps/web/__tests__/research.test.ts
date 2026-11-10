// lib/research.ts — the Research content provider: manifest normalising, citation metadata,
// feed, and the folder reader (against a temp content drop, never the real one).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  normaliseResearch, renderNote, scholarDate, citationMeta, researchJsonLd, bibtex, buildFeed,
  sortResearch, measuredLine, researchTypeLabel, toPublishIso, researchUrl,
  getResearchList, getResearch, resetResearchCache, writeResearchFeed, type ResearchItem,
} from "../lib/research";

const BASE = "https://visurena.com";

const RAW = {
  id: "res_UPSCALE",
  section: "research",
  slug: "anime-upscaler-jitter",
  kind: "note",
  type: "benchmark",
  status: "live",
  createdAt: "2026-10-18",
  publishAt: "2026-10-22",
  version: "1.0.0",
  title: "The sharper upscaler made the walls boil",
  claim: "Denoise + Real-ESRGAN animevideov3 jitters 51–58 % less than RTX VSR.",
  headline: { value: "−51 to −58 %", label: "background jitter vs RTX VSR" },
  summary: "Abstract.",
  measuredOn: { date: "2026-10-18", hardware: "RTX 4090", n: 3, units: "takes × 124 frames", commit: "visurena-studio@abc1234" },
  tags: ["upscaling", "anime"],
  credits: { author: "ViSuReNa" },
  license: { text: "CC-BY-4.0", code: "Apache-2.0" },
  changelog: [{ version: "1.0.0", date: "2026-10-22", note: "First publication." }, { bad: true }],
};

describe("normaliseResearch", () => {
  it("projects item.json into a ResearchItem", () => {
    const r = normaliseResearch(RAW, { summary: "/research/anime-upscaler-jitter/summary.png" })!;
    expect(r).toMatchObject({
      id: "res_UPSCALE", section: "research", slug: "anime-upscaler-jitter", kind: "note", type: "benchmark",
      status: "live", publishAt: "2026-10-22T00:00:00Z", version: "1.0.0", author: "ViSuReNa",
      accent: "#6C9BFF", cover: "/research/anime-upscaler-jitter/summary.png", summaryCard: "/research/anime-upscaler-jitter/summary.png",
    });
    expect(r.changelog).toEqual([{ version: "1.0.0", date: "2026-10-22", note: "First publication." }]);
    expect(r.data).toEqual([]);
    expect("pdf" in r).toBe(false); // no undefined keys: getStaticProps must stay JSON-serialisable
  });
  it("rejects a folder that is not an article (no slug, title or claim)", () => {
    expect(normaliseResearch({ ...RAW, claim: "" })).toBeNull();
    expect(normaliseResearch({ ...RAW, slug: undefined })).toBeNull();
    expect(normaliseResearch(null)).toBeNull();
  });
  it("keeps a draft a draft and treats scheduled as live-at-publishAt", () => {
    expect(normaliseResearch({ ...RAW, status: "draft" })!.status).toBe("draft");
    expect(normaliseResearch({ ...RAW, status: "scheduled" })!.status).toBe("live");
  });
  it("is a report only when report.html exists", () => {
    expect(normaliseResearch({ ...RAW, kind: "report" })!.kind).toBe("note");
    const r = normaliseResearch({ ...RAW, kind: "report" }, { report: "/research/x/report.html" })!;
    expect(r.kind).toBe("report");
    expect(r.report).toBe("/research/x/report.html");
  });
  it("falls back for unknown types and missing dates", () => {
    const r = normaliseResearch({ ...RAW, type: "rant", publishAt: undefined })!;
    expect(r.type).toBe("note");
    expect(r.publishAt).toBe("2026-10-18T00:00:00Z");
  });
});

describe("small helpers", () => {
  it("toPublishIso", () => {
    expect(toPublishIso("2026-10-22")).toBe("2026-10-22T00:00:00Z");
    expect(toPublishIso("2026-10-22T08:00:00Z")).toBe("2026-10-22T08:00:00Z");
    expect(toPublishIso("")).toBeUndefined();
  });
  it("scholarDate uses slashes", () => {
    expect(scholarDate("2026-10-22T00:00:00Z")).toBe("2026/10/22");
  });
  it("researchTypeLabel", () => {
    expect(researchTypeLabel("negative-result")).toBe("Negative result");
    expect(researchTypeLabel("benchmark")).toBe("Benchmark");
  });
  it("researchUrl ends with a slash (trailingSlash export)", () => {
    expect(researchUrl("x", BASE)).toBe("https://visurena.com/research/x/");
  });
  it("measuredLine reads date, hardware, n and commit", () => {
    expect(measuredLine(RAW.measuredOn)).toEqual(["Measured 2026-10-18", "RTX 4090", "n = 3 takes × 124 frames", "visurena-studio@abc1234"]);
    expect(measuredLine(undefined)).toEqual([]);
  });
});

describe("renderNote", () => {
  it("renders Markdown with tables and drops the front-matter", () => {
    const html = renderNote("---\ntitle: X\n---\n## Results\n\n| a | b |\n|---|---|\n| 1 | 2 |\n");
    expect(html).toContain("<h2");
    expect(html).toContain("<table>");
    expect(html).not.toContain("title: X");
  });
});

describe("citation metadata", () => {
  const item = normaliseResearch(RAW)!;
  it("emits the Google Scholar tags, with the PDF and DOI only when they exist", () => {
    const names = citationMeta(item, BASE).map((t) => t.name);
    expect(names).toEqual(["citation_title", "citation_author", "citation_publication_date", "citation_publisher", "citation_abstract_html_url"]);
    const full = citationMeta({ ...item, pdf: "/research/anime-upscaler-jitter/paper.pdf", doi: "10.5281/zenodo.1" }, BASE);
    expect(full).toContainEqual({ name: "citation_pdf_url", content: "https://visurena.com/research/anime-upscaler-jitter/paper.pdf" });
    expect(full).toContainEqual({ name: "citation_doi", content: "10.5281/zenodo.1" });
    expect(full).toContainEqual({ name: "citation_publication_date", content: "2026/10/22" });
  });
  it("builds ScholarlyArticle JSON-LD", () => {
    const ld = researchJsonLd(item, BASE);
    expect(ld).toMatchObject({
      "@type": "ScholarlyArticle", headline: item.title, datePublished: "2026-10-22", version: "1.0.0",
      url: "https://visurena.com/research/anime-upscaler-jitter/", license: "https://spdx.org/licenses/CC-BY-4.0.html",
    });
    expect(JSON.stringify(ld)).not.toContain("undefined");
  });
  it("builds a BibTeX @misc entry", () => {
    const b = bibtex({ ...item, doi: "10.5281/zenodo.1" }, BASE);
    expect(b.startsWith("@misc{visurena2026anime,")).toBe(true);
    expect(b).toContain("month        = oct");
    expect(b).toContain("doi          = {10.5281/zenodo.1}");
    expect(b).toContain("url          = {https://visurena.com/research/anime-upscaler-jitter/}");
    expect(bibtex(item, BASE)).not.toContain("doi");
  });
});

describe("buildFeed / sortResearch", () => {
  const a = normaliseResearch(RAW)!;
  const b = normaliseResearch({ ...RAW, slug: "older", title: "Older <&>", publishAt: "2026-10-01" })!;
  it("sorts newest first", () => {
    expect(sortResearch([b, a]).map((x) => x.slug)).toEqual(["anime-upscaler-jitter", "older"]);
  });
  it("writes escaped RSS 2.0 with one item per article", () => {
    const xml = buildFeed([a, b], BASE);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain("Older &lt;&amp;&gt;");
    expect(xml).toContain("<link>https://visurena.com/research/older/</link>");
    expect(xml).toContain("<category>Benchmark</category>");
  });
});

// ─── The folder reader, against a temp drop ────────────────────────────────────
describe("getResearchList / getResearch (temp content drop)", () => {
  let root: string;
  let pub: string;
  const env = { ...process.env };

  const write = (rel: string, body: string) => {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  };

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "vr-research-"));
    pub = fs.mkdtempSync(path.join(os.tmpdir(), "vr-public-"));
    process.env.VR_CONTENT_LOCAL_DIR = root;
    process.env.VR_PUBLIC_DIR = pub;
    delete process.env.VR_CONTENT_SOURCE;
    const dir = "research/2026/10/22/anime-upscaler-jitter";
    write(`${dir}/item.json`, JSON.stringify(RAW));
    write(`${dir}/article.md`, "## The claim\n\nText.\n");
    write(`${dir}/summary.png`, "png");
    write(`${dir}/data/rulers_C.json`, "{}");
    write(`${dir}/data/nested/ignored.json`, "{}");
    const rep = "research/2026/10/21/story-department";
    write(`${rep}/item.json`, JSON.stringify({ ...RAW, slug: "story-department", kind: "report", type: "system", publishAt: "2026-10-21" }));
    write(`${rep}/report.html`, "<!doctype html><title>r</title>");
    write("research/2026/10/23/future/item.json", JSON.stringify({ ...RAW, slug: "future", publishAt: "2099-01-01" }));
    write("research/2026/10/23/draft/item.json", JSON.stringify({ ...RAW, slug: "draft", status: "draft" }));
    write("research/2026/10/23/broken/item.json", "{ not json");
  });
  beforeEach(() => resetResearchCache());
  afterAll(() => {
    process.env = env;
    resetResearchCache();
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(pub, { recursive: true, force: true });
  });

  it("lists live articles only, newest first, without bodies", () => {
    const list = getResearchList(new Date("2026-10-23T00:00:00Z"));
    expect(list.map((r) => r.slug)).toEqual(["anime-upscaler-jitter", "story-department"]);
    expect("html" in list[0]).toBe(false);
  });
  it("copies assets into public/research/<slug>/ and links them", () => {
    const r = getResearch("anime-upscaler-jitter", new Date("2026-10-23T00:00:00Z"))!;
    expect(r.summaryCard).toBe("/research/anime-upscaler-jitter/summary.png");
    expect(r.data).toEqual([{ label: "rulers_C.json", href: "/research/anime-upscaler-jitter/data/rulers_C.json" }]);
    expect(fs.existsSync(path.join(pub, "research", "anime-upscaler-jitter", "summary.png"))).toBe(true);
    expect(r.html).toContain("<h2");
  });
  it("serves a report through its copied report.html", () => {
    const r = getResearch("story-department", new Date("2026-10-23T00:00:00Z"))!;
    expect(r.kind).toBe("report");
    expect(r.report).toBe("/research/story-department/report.html");
    expect(fs.existsSync(path.join(pub, "research", "story-department", "report.html"))).toBe(true);
  });
  it("hides drafts and future articles from a direct lookup too", () => {
    const now = new Date("2026-10-23T00:00:00Z");
    expect(getResearch("draft", now)).toBeUndefined();
    expect(getResearch("future", now)).toBeUndefined();
  });
  it("writes the feed into public/research/feed.xml", () => {
    const href = writeResearchFeed(getResearchList(new Date("2026-10-23T00:00:00Z")));
    expect(href).toBe("/research/feed.xml");
    expect(fs.readFileSync(path.join(pub, "research", "feed.xml"), "utf8").match(/<item>/g)).toHaveLength(2);
  });
  it("returns an empty list when the drop has no research folder", () => {
    process.env.VR_CONTENT_LOCAL_DIR = path.join(root, "nope");
    resetResearchCache();
    expect(getResearchList()).toEqual([]);
    process.env.VR_CONTENT_LOCAL_DIR = root;
  });
});

// Type-only guard: the shape the pages import.
const _typed: ResearchItem | undefined = undefined;
void _typed;
