// /research and /research/[slug]: render from props, and build props from a temp content drop.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import ResearchIndex, { getStaticProps as indexProps, type ResearchIndexProps } from "@/pages/research";
import ResearchArticle, { getStaticPaths as articlePaths, getStaticProps as articleProps, type ResearchArticleProps } from "@/pages/research/[slug]";
import { resetResearchCache } from "@/lib/research";

const ITEM = {
  slug: "anime-upscaler-jitter",
  title: "The sharper upscaler made the walls boil",
  claim: "Denoise + Real-ESRGAN animevideov3 jitters 51–58 % less than RTX VSR.",
  type: "benchmark",
  kind: "note",
  status: "live",
  createdAt: "2026-10-18",
  publishAt: "2026-10-01",
  version: "1.0.0",
  headline: { value: "−51 to −58 %", label: "background jitter vs RTX VSR" },
  summary: "Abstract text.",
  measuredOn: { date: "2026-10-18", hardware: "RTX 4090", n: 3, units: "takes" },
  limitations: ["Three takes from one look.", "Not measured at a hard cut."],
  credits: { author: "ViSuReNa" },
  license: { text: "CC-BY-4.0", code: "Apache-2.0" },
  changelog: [{ version: "1.0.0", date: "2026-10-22", note: "First publication." }],
};

let root: string;
let pub: string;
const env = { ...process.env };

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "vr-rp-"));
  pub = fs.mkdtempSync(path.join(os.tmpdir(), "vr-rp-pub-"));
  process.env.VR_CONTENT_LOCAL_DIR = root;
  process.env.VR_PUBLIC_DIR = pub;
  process.env.NEXT_PUBLIC_SITE_URL = "https://alpha.example.com/";
  delete process.env.VR_CONTENT_SOURCE;
  const put = (rel: string, body: string) => {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  };
  const d = "research/2026/10/01/anime-upscaler-jitter";
  put(`${d}/item.json`, JSON.stringify(ITEM));
  put(`${d}/article.md`, "## Results\n\n| arm | jit |\n|---|---|\n| av3 | 0.309 |\n");
  put(`${d}/summary.png`, "png");
  put(`${d}/data/rulers_C.json`, "{}");
  const r = "research/2026/09/30/story-department";
  put(`${r}/item.json`, JSON.stringify({ ...ITEM, slug: "story-department", title: "The Story Department", kind: "report", type: "system", publishAt: "2026-09-30", headline: undefined, limitations: undefined }));
  put(`${r}/report.html`, "<!doctype html><title>r</title><script>1</script>");
  resetResearchCache();
});

afterAll(() => {
  process.env = env;
  resetResearchCache();
  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(pub, { recursive: true, force: true });
});

async function indexP(): Promise<ResearchIndexProps> {
  const res = (await indexProps({} as never)) as { props: ResearchIndexProps };
  return res.props;
}
async function articleP(slug: string): Promise<ResearchArticleProps> {
  const res = (await articleProps({ params: { slug } } as never)) as { props: ResearchArticleProps };
  return res.props;
}

describe("/research (index)", () => {
  it("builds JSON-safe cards newest first, with type counts, the feed and the env's canonical URL", async () => {
    const p = await indexP();
    expect(p.cards.map((c) => c.slug)).toEqual(["anime-upscaler-jitter", "story-department"]);
    expect(p.cards[0]).toMatchObject({ typeLabel: "Benchmark", date: "2026-10-01", version: "1.0.0", measured: ["Measured 2026-10-18", "RTX 4090", "n = 3 takes"] });
    expect(p.types).toEqual([{ id: "benchmark", label: "Benchmark", count: 1 }, { id: "system", label: "System", count: 1 }]);
    expect(p.feed).toBe("/research/feed.xml");
    expect(p.canonical).toBe("https://alpha.example.com/research/");
    expect(fs.existsSync(path.join(pub, "research", "feed.xml"))).toBe(true);
    expect(JSON.parse(JSON.stringify(p))).toEqual(p);
  });

  it("renders as a studio page: Research is current in the nav, sapphire accent", async () => {
    const { container } = render(<ResearchIndex {...(await indexP())} />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "page");
    expect(container.querySelector("[data-studio='research']")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Research" })).toBeInTheDocument();
  });

  it("shows claim, headline number and a link per card; filters by type", async () => {
    const { container } = render(<ResearchIndex {...(await indexP())} />);
    const card = container.querySelector("[data-research-card='anime-upscaler-jitter']")!;
    expect(within(card as HTMLElement).getByRole("link", { name: ITEM.title })).toHaveAttribute("href", "/research/anime-upscaler-jitter");
    expect(card.querySelector("[data-headline]")).toHaveTextContent("−51 to −58 %");
    expect(card).toHaveTextContent(ITEM.claim);
    fireEvent.click(screen.getByRole("button", { name: /System/ }));
    expect(container.querySelector("[data-research-card='anime-upscaler-jitter']")).toBeNull();
    expect(container.querySelector("[data-research-card='story-department']")).not.toBeNull();
    expect(screen.getByRole("button", { name: /System/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders an honest empty state with no articles", () => {
    const { container } = render(<ResearchIndex cards={[]} types={[]} />);
    expect(container.querySelector("[data-research-empty]")).not.toBeNull();
  });
});

describe("/research/[slug] (article)", () => {
  it("has one static path per live article", async () => {
    const res = (await articlePaths({} as never)) as { paths: Array<{ params: { slug: string } }>; fallback: boolean };
    expect(res.paths.map((p) => p.params.slug).sort()).toEqual(["anime-upscaler-jitter", "story-department"]);
    expect(res.fallback).toBe(false);
  });

  it("returns notFound for an unknown slug", async () => {
    expect(await articleProps({ params: { slug: "nope" } } as never)).toEqual({ notFound: true });
  });

  it("builds citation meta, JSON-LD (script-safe) and BibTeX against the env's site URL", async () => {
    const p = await articleP("anime-upscaler-jitter");
    expect(p.canonical).toBe("https://alpha.example.com/research/anime-upscaler-jitter/");
    expect(p.ogImage).toBe("https://alpha.example.com/research/anime-upscaler-jitter/summary.png");
    expect(p.citation).toContainEqual({ name: "citation_publication_date", content: "2026/10/01" });
    expect(p.jsonLd).not.toContain("<");
    expect(JSON.parse(p.jsonLd)["@type"]).toBe("ScholarlyArticle");
    expect(p.bibtex).toContain("url          = {https://alpha.example.com/research/anime-upscaler-jitter/}");
    expect(JSON.parse(JSON.stringify(p))).toEqual(p);
  });

  it("renders a note: headline, claim, the rendered body, limits, data, cite block and changelog", async () => {
    const { container } = render(<ResearchArticle {...(await articleP("anime-upscaler-jitter"))} />);
    expect(screen.getByRole("heading", { level: 1, name: ITEM.title })).toBeInTheDocument();
    expect(container.querySelector("[data-headline]")).toHaveTextContent("−51 to −58 %");
    expect(container.querySelector("[data-claim]")).toHaveTextContent(ITEM.claim);
    expect(container.querySelector("[data-article-body] table")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "What this does not show" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "rulers_C.json ↓" })).toHaveAttribute("href", "/research/anime-upscaler-jitter/data/rulers_C.json");
    expect(container.querySelector("[data-bibtex]")).toHaveTextContent("@misc{visurena2026anime,");
    expect(container.querySelector("[data-changelog]")).toHaveTextContent("v1.0.0");
    expect(container.querySelector("iframe")).toBeNull();
    expect(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "page");
  });

  it("renders a report inside a sandboxed iframe (scripts, no same-origin) with a full-screen link", async () => {
    const { container } = render(<ResearchArticle {...(await articleP("story-department"))} />);
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", "/research/story-department/report.html");
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts allow-popups");
    expect(screen.getByRole("link", { name: "Open full screen ↗" })).toHaveAttribute("href", "/research/story-department/report.html");
    expect(container.querySelector("[data-headline]")).toBeNull();
  });
});
