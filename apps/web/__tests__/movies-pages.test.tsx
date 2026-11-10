import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import MoviesHub, { getStaticProps as hubProps, type MoviesHubProps } from "@/pages/movies";
import SeriesPage, { getStaticPaths as seriesPaths, getStaticProps as seriesProps, type SeriesPageProps } from "@/pages/movies/[series]";
import EpisodePage, { getStaticPaths as episodePaths, getStaticProps as episodeProps, type EpisodePageProps } from "@/pages/movies/[series]/[episode]";
import { PROGRESS_KEY, readProgress } from "@/components/movies/progress";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (params: Record<string, string>) => ({ params } as any);
async function props<T>(fn: (c: unknown) => unknown, params: Record<string, string> = {}): Promise<T> {
  const r = (await fn(ctx(params))) as { props?: T; notFound?: boolean };
  if (!r.props) throw new Error(`no props: ${JSON.stringify(r)}`);
  return r.props;
}

describe("/movies hub", () => {
  it("getStaticProps builds from series.json + requests.json", async () => {
    const p = await props<MoviesHubProps>(hubProps as never);
    expect(p.section).toBe("movies");
    expect(p.series.map((s) => s.slug)).toEqual(["a-study-in-scarlet", "frankenstein"]);
    expect(p.statusParts["a-study-in-scarlet"][0]).toBe("Series");
    expect(p.requests.openRequests).toBe(312);
    expect(p.slate.map((s) => s.title)).toEqual(["Frankenstein", "Dracula", "Pride and Prejudice"]);
    expect(() => JSON.stringify(p)).not.toThrow();
  });

  it("renders header counts, both series cards, latest episodes, trailers and the slate — no 'coming soon'", async () => {
    const p = await props<MoviesHubProps>(hubProps as never);
    const { container } = render(<MoviesHub {...p} />);
    expect(screen.getByRole("heading", { level: 1, name: "Movies" })).toBeInTheDocument();
    expect(container.querySelector("[data-hub-head] [data-status-line]")).toHaveTextContent("1 series complete · 14 episodes · 1 trailer · 9 titles in development · Played on YouTube");
    expect(container.querySelectorAll("[data-series-card]")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Start Ep 1" })).toHaveAttribute("href", "/movies/a-study-in-scarlet/ep-01");
    expect(screen.getByRole("button", { name: "+ Follow" })).toBeInTheDocument();

    const rails = container.querySelectorAll("[data-shelf]");
    expect(rails.length).toBeGreaterThanOrEqual(2);
    const latest = within(rails[0] as HTMLElement).getAllByRole("listitem");
    expect(latest).toHaveLength(14);
    const scarlet = p.series[0];
    const newest = [...scarlet.episodes].sort((a, b) => (b.publishAt > a.publishAt ? 1 : -1))[0];
    expect(latest[0]).toHaveTextContent(`Ep ${newest.n}`);
    expect(latest[0]).toHaveTextContent(newest.title);
    expect(latest[0]).toHaveAttribute("href", `/movies/a-study-in-scarlet/${newest.slug}`);
    const trailers = within(rails[1] as HTMLElement).getAllByRole("listitem");
    expect(trailers).toHaveLength(3);
    expect(trailers[0]).toHaveTextContent(`Trailer · ${scarlet.trailer!.runtime}`);

    expect(screen.getByRole("heading", { name: "In development" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-vote-card]")).toHaveLength(3);
    expect(container.querySelector("[data-request-card]")).not.toBeNull();
    expect(container.textContent?.toLowerCase()).not.toContain("coming soon");
    expect(container.querySelector("[data-lobby-nav]")).not.toBeNull();
  });
});

describe("/movies/[series]", () => {
  it("getStaticPaths lists every series; getStaticProps 404s unknown slugs", async () => {
    const paths = (await seriesPaths(ctx({}))) as unknown as { paths: Array<{ params: { series: string } }>; fallback: boolean };
    expect(paths.paths.map((p) => p.params.series)).toEqual(["a-study-in-scarlet", "frankenstein"]);
    expect(paths.fallback).toBe(false);
    expect(await seriesProps(ctx({ series: "nope" }))).toEqual({ notFound: true });
  });

  it("released series: header, first four rows, all 14 in two columns, tabs, slate", async () => {
    const p = await props<SeriesPageProps>(seriesProps as never, { series: "a-study-in-scarlet" });
    expect(p.statusParts.slice(0, 3)).toEqual(["Series", "Complete", "14 episodes"]);
    expect(p.statusParts[p.statusParts.length - 1]).toBe("1887");
    expect(p.slate.map((s) => s.title)).toEqual(["Dracula", "Pride and Prejudice", "The Picture of Dorian Gray"]);
    const { container } = render(<SeriesPage {...p} />);
    expect(screen.getByRole("heading", { level: 1, name: "A Study in Scarlet" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-first-episodes] [data-episode-row]")).toHaveLength(4);
    const cols = container.querySelectorAll("[data-all-episodes] > div");
    expect(cols).toHaveLength(2);
    expect(cols[0].querySelectorAll("[data-episode-row]")).toHaveLength(7);
    expect(cols[1].querySelectorAll("[data-episode-row]")).toHaveLength(7);
    expect(screen.getByRole("heading", { name: "All 14 episodes" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Audiobook" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What should we adapt after this?" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-vote-card]")).toHaveLength(3);
    // trailer opens inline on the Trailer button, no autoplay
    expect(container.querySelector("[data-trailer]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Trailer" }));
    const video = container.querySelector("[data-trailer] video")!;
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toBe("/movies/a-study-in-scarlet/trailer-60.mp4");
    expect(video.hasAttribute("autoplay")).toBe(false);
  });

  it("in-production series: header with Follow + Chosen by 517 votes, no rows", async () => {
    const p = await props<SeriesPageProps>(seriesProps as never, { series: "frankenstein" });
    const { container } = render(<SeriesPage {...p} />);
    expect(screen.getByRole("heading", { level: 1, name: "Frankenstein" })).toBeInTheDocument();
    expect(container.querySelector("[data-series-header] [data-status-line]")).toHaveTextContent("Chosen by 517 votes");
    expect(screen.getByRole("button", { name: "+ Follow" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-episode-row]")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Trailer" })).toBeNull();
    expect(container.textContent?.toLowerCase()).not.toContain("coming soon");
  });
});

describe("/movies/[series]/[episode]", () => {
  beforeEach(() => window.localStorage.removeItem(PROGRESS_KEY));

  it("getStaticPaths lists every episode; props carry nocookie embed + watch URLs", async () => {
    const paths = (await episodePaths(ctx({}))) as unknown as { paths: Array<{ params: { series: string; episode: string } }> };
    expect(paths.paths).toHaveLength(14);
    expect(paths.paths[3].params).toEqual({ series: "a-study-in-scarlet", episode: "ep-04" });
    const p = await props<EpisodePageProps>(episodeProps as never, { series: "a-study-in-scarlet", episode: "ep-04" });
    expect(p.embedUrl).toBe("https://www.youtube-nocookie.com/embed/WN2ktyq8tr0?rel=0&modestbranding=1&playsinline=1&autoplay=1");
    expect(p.watchUrl).toBe("https://www.youtube.com/watch?v=WN2ktyq8tr0");
    expect(p.aspect).toBe(p.episode.aspect ?? p.series.aspect);
    expect(["9:16", "1:1", "16:9"]).toContain(p.aspect);
    expect(p.prev?.slug).toBe("ep-03");
    expect(p.next?.slug).toBe("ep-05");
    expect(p.slate).toHaveLength(7);
    expect(() => JSON.stringify(p)).not.toThrow();
    expect(await episodeProps(ctx({ series: "a-study-in-scarlet", episode: "ep-99" }))).toEqual({ notFound: true });
    const first = await props<EpisodePageProps>(episodeProps as never, { series: "a-study-in-scarlet", episode: "ep-01" });
    expect(first.prev).toBeNull();
  });

  it("renders the stage and saves progress to localStorage on play", async () => {
    const p = await props<EpisodePageProps>(episodeProps as never, { series: "a-study-in-scarlet", episode: "ep-04" });
    const { container } = render(<EpisodePage {...p} />);
    expect(container.querySelector("[data-player-stage]")?.getAttribute("data-aspect")).toBe(p.aspect);
    // a square episode renders a square stage on the real page too
    const sq = render(<EpisodePage {...p} aspect="1:1" episode={{ ...p.episode, aspect: "1:1" }} />);
    expect((sq.container.querySelector("[data-player-box]") as HTMLElement).style.aspectRatio).toBe("1 / 1");
    sq.unmount();
    expect(container.querySelector("[data-breadcrumb]")).toHaveTextContent("Movies › A Study in Scarlet › Ep 4 of 14");
    expect(screen.getByRole("heading", { level: 1, name: "What John Rance Had to Tell" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Watch on YouTube ↗" })).toHaveAttribute("href", p.watchUrl);
    expect(container.querySelector("iframe")).toBeNull();
    expect(readProgress("a-study-in-scarlet")).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: /Play Episode 4/ }));
    expect(container.querySelector("iframe")?.getAttribute("src")).toContain("youtube-nocookie.com/embed/WN2ktyq8tr0");
    const saved = readProgress("a-study-in-scarlet")!;
    expect(saved).toMatchObject({ seriesSlug: "a-study-in-scarlet", ep: 4 });
    expect(typeof saved.at).toBe("number");
    // status line now reflects the saved state
    expect(container.querySelector("[data-episode-meta] [data-status-line]")).toHaveTextContent("In progress");
    expect(screen.getByRole("heading", { name: "More from the slate" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-vote-card]")).toHaveLength(7);
  });
});
