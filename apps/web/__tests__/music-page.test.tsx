import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import MusicPage, {
  trackCaption,
  musicStatusParts,
  sortTracksNewest,
  pickVotes,
  getStaticProps,
  type Track,
} from "@/pages/music";
import type { RequestItem } from "@/lib/requests";

// jsdom does not implement media playback; the tile calls play() after a click.
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", { configurable: true, value: vi.fn(() => Promise.resolve()) });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", { configurable: true, value: vi.fn() });
});

const tracks: Track[] = [
  {
    slug: "somebody-knew-my-name", title: "Somebody Knew My Name",
    videoUrl: "/music/somebody-knew-my-name/video.mp4", posterUrl: "/music/somebody-knew-my-name/poster.jpg",
    genreTags: "Cinematic orchestral folk-pop", seconds: 62, releaseDate: "2026-08-02", featured: true, tint: "#c07dd9",
    story: "A boy nobody wanted discovers he was known all along.",
  },
  {
    slug: "last-train", title: "Last Train",
    videoUrl: "/music/last-train/video.mp4", posterUrl: "/music/last-train/poster.jpg",
    genreTags: "Anime ending ballad", seconds: 125, releaseDate: "2026-08-01", featured: false, tint: "#5c8fd6",
    story: "She finally boards the train herself.",
  },
] as Track[];

const requests: RequestItem[] = [
  { id: "req_frankenstein", title: "Frankenstein", format: "Episodes", votes: 517, state: "in-production", producedSlug: "frankenstein" },
  { id: "req_dracula", title: "Dracula", format: "Episodes", votes: 412, state: "voting" },
  { id: "req_pride", title: "Pride and Prejudice", format: "Episodes", votes: 388, state: "voting" },
  { id: "req_more-arcade", title: "More arcade games", format: "Games", votes: 143, state: "voting" },
];

describe("music helpers", () => {
  it("trackCaption follows `Single · Released · m:ss`", () => {
    expect(trackCaption(tracks[0])).toBe("Single · Released · 1:02");
    expect(trackCaption(tracks[1])).toBe("Single · Released · 2:05");
  });
  it("musicStatusParts sums the runtime and counts tracks", () => {
    expect(musicStatusParts(tracks)).toEqual(["Singles", "Released", "2 tracks", "3:07 of music", "Music videos"]);
    expect(musicStatusParts([tracks[0]])).toEqual(["Singles", "Released", "1 track", "1:02 of music", "Music videos"]);
    expect(musicStatusParts([])).toEqual(["Singles", "Released", "0 tracks", "0:00 of music", "Music videos"]);
  });
  it("sortTracksNewest orders by releaseDate desc without mutating", () => {
    const input = [tracks[1], tracks[0]];
    const out = sortTracksNewest(input);
    expect(out.map((t) => t.slug)).toEqual(["somebody-knew-my-name", "last-train"]);
    expect(input[0].slug).toBe("last-train");
  });
});

describe("getStaticProps", () => {
  it("keeps section='music', serves only the singles, and 3 votes", async () => {
    const res = (await getStaticProps({} as never)) as { props: { section: string; tracks: Track[]; votes: RequestItem[] } };
    expect(res.props.section).toBe("music");
    expect(res.props.tracks.length).toBeGreaterThan(0);
    expect(res.props.tracks.some((t) => /audiobook|scarlet/i.test(t.title))).toBe(false);
    expect(res.props.tracks.every((t) => t.videoUrl && t.posterUrl && t.seconds > 0)).toBe(true);
    expect(res.props.votes).toHaveLength(3);
  });
});

describe("MusicPage", () => {
  const votes = pickVotes(requests, "Music");
  function renderPage() {
    return render(<MusicPage section="music" tracks={tracks} votes={votes} totalVotes={2850} openRequests={312} />);
  }

  it("renders the hub header with the status line", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Music" })).toBeInTheDocument();
    expect(screen.getByText("2 tracks")).toBeInTheDocument();
    expect(document.querySelector("[data-vertical='music']")).not.toBeNull();
  });

  it("renders a 1:1 poster card per single with a play glyph and no <video> before a click", () => {
    const { container } = renderPage();
    const grid = screen.getByRole("list", { name: "Singles" });
    const cards = within(grid).getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText("Single · Released · 1:02")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Somebody Knew My Name")).toBeInTheDocument();
    expect(cards[0].querySelector("img")).toHaveAttribute("src", "/music/somebody-knew-my-name/poster.jpg");
    expect(container.querySelectorAll("video")).toHaveLength(0);
    // play glyph: one [data-play] per single (Lane 1 renders it as an SVG icon)
    expect(grid.querySelectorAll("[data-play]")).toHaveLength(2);
    expect(cards[0].querySelector("[data-play]")).not.toBeNull();
  });

  it("plays the video inline (poster, controls, no autoplay attribute) after a click, and closes again", () => {
    const { container } = renderPage();
    const grid = screen.getByRole("list", { name: "Singles" });
    const first = within(grid).getAllByRole("listitem")[0];
    fireEvent.click(first);

    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("src", "/music/somebody-knew-my-name/video.mp4");
    expect(video).toHaveAttribute("poster", "/music/somebody-knew-my-name/poster.jpg");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(screen.getByText(/Now playing/)).toBeInTheDocument();
    // the other single is still a card
    expect(within(grid).getAllByRole("listitem")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(container.querySelectorAll("video")).toHaveLength(0);
    expect(within(grid).getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders the vote strip (top 3 by votes since no Music format exists)", () => {
    renderPage();
    const strip = screen.getByRole("list", { name: "Requests" });
    const cards = within(strip).getAllByRole("listitem");
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText("Frankenstein")).toBeInTheDocument();
    expect(within(cards[1]).getByText("Dracula")).toBeInTheDocument();
  });

  it("has no 'coming soon', newsletter or reveal wrappers", () => {
    const { container } = renderPage();
    expect(container.textContent).not.toMatch(/coming soon|newsletter|inbox/i);
    expect(container.querySelector(".vr-fade")).toBeNull();
  });
});
