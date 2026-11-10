// apps/web/lib/home.ts
//
// Pure view-model builders for the Home page. Everything here returns plain JSON so
// getStaticProps can hand it straight to the page; the page renders, it never computes.
//
// SERVER-ONLY: this module imports lib/movies.ts (node:fs) for the status-line helpers.
// pages/index.tsx must import it only inside getStaticProps (+ `import type`), never in
// the component body, or the fs import leaks into the client bundle.

import type { Story } from "./content";
import { episodeAspect, seriesStatusParts, type Episode, type Series } from "./movies";
import { formatTrackRuntime, trackStatusParts, type Track } from "./music";
import type { RequestItem } from "./requests";

// ─── Shared shapes ───────────────────────────────────────────────────────────
export type HomeVertical = "stories" | "movies" | "music" | "games";
export type CardRatio = "9:16" | "2:3" | "3:4" | "1:1" | "16:9";
export type CardKind = "Story" | "Episode" | "Single" | "Game";

export const ACCENT: Record<HomeVertical, string> = {
  stories: "#E8B04B",
  movies: "#3DD68C",
  music: "#F0537A",
  games: "#B48CF7",
};

export interface Game {
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  playUrl?: string;
  duration?: string;
  tags?: string[];
  featured?: boolean;
  releaseDate?: string;
}

/** One card in a rail — a straight mapping onto `MediaCard` props. */
export interface CardModel {
  key: string;
  href: string;
  title: string;
  ratio: CardRatio;
  image?: string;
  imagePosition?: string;
  caption: string;
  kind?: CardKind;
  kindAccent?: string;
  chip?: string;
  progress?: number;
  accent?: string;
  width: number;
  playGlyph?: boolean;
  date: string;          // ISO, for ordering
}

/** One card on the slate — a straight mapping onto `VoteCard` props. */
export interface VoteModel {
  id: string;
  title: string;
  author?: string;
  year?: string;
  format?: string;
  votes: number;
  state: "in-production" | "voting";
  note?: string;
  href?: string;
}

export type MoviesRailItem = { type: "card"; card: CardModel } | { type: "slate"; vote: VoteModel };

export interface HeroCta {
  label: string;
  href: string;
  variant: "primary" | "ghost";
  play?: boolean;
}

export interface HeroSlot {
  vertical: HomeVertical;
  accent: string;
  eyebrow: string[];       // status-line parts
  kicker: string;          // "Stories" | "Movies · Sherlock Holmes"
  title: string;
  logline?: string;
  ctas: HeroCta[];
  follow?: { label: string; sub: string; href: string };
  art: { src?: string; ratio: CardRatio; alt: string; href: string; position?: string };
  glow?: string;           // blurred backdrop source
}

// ─── Small formatters ────────────────────────────────────────────────────────
/** "m:ss" from seconds, "h:mm:ss" past an hour, "—" for nonsense. */
export function formatRuntime(seconds: number): string {
  return formatTrackRuntime(seconds);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "25 Sep 2026" from an ISO date; "" when unparseable. */
export function formatDateShort(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function within(iso: string | undefined, now: Date, days: number): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const diff = now.getTime() - t;
  return diff >= 0 && diff <= days * 86_400_000;
}

// ─── Status lines ────────────────────────────────────────────────────────────
export function storyKindLabel(kind: Story["kind"] | undefined): string {
  return kind === "novel" ? "Novel" : kind === "series" ? "Serial" : "Short story";
}

/** `Short story · Mystery · 12 min` */
export function storyStatusParts(s: Story): string[] {
  return [storyKindLabel(s.kind), s.genre ?? "", s.readMinutes ? `${s.readMinutes} min` : ""].filter(Boolean);
}

/** `Ep 14 · 10:26` */
export function episodeStatusParts(e: Episode): string[] {
  return [`Ep ${e.n}`, e.runtime ?? ""].filter(Boolean);
}

/** `Puzzle · Endless · Browser` */
export function gameStatusParts(g: Game): string[] {
  return [g.tags?.[0] ? cap(g.tags[0]) : "Game", g.duration ?? "", "Browser"].filter(Boolean);
}

// ─── Card mappers ────────────────────────────────────────────────────────────
export const CARD_WIDTH = { story: 180, episode: 160, single: 240, game: 427, railStory: 172, railMovie: 172, railGame: 208 } as const;

export function storyCard(s: Story, width: number = CARD_WIDTH.railStory, withKind = false): CardModel {
  return {
    key: `story:${s.slug}`,
    href: `/stories/${s.slug}`,
    title: s.title,
    ratio: "3:4",
    image: s.cover34 || s.cover || undefined,
    caption: storyStatusParts(s).join(" · "),
    kind: withKind ? "Story" : undefined,
    kindAccent: ACCENT.stories,
    accent: ACCENT.stories,
    width,
    date: s.createdAt || s.publishAt,
  };
}

/**
 * Episode tiles are always 2:3 (object-fit: cover). The still is at its source aspect:
 * a portrait still keeps faces near the top ("50% 20%"); a square or wide one is centred.
 */
export function episodeCard(series: Series, e: Episode, width: number = CARD_WIDTH.railMovie, withKind = false): CardModel {
  return {
    key: `episode:${series.slug}/${e.slug}`,
    href: `/movies/${series.slug}/${e.slug}`,
    title: e.title,
    ratio: "2:3",
    image: e.still,
    imagePosition: episodeAspect(series, e) === "9:16" ? "50% 20%" : "50% 50%",
    caption: episodeStatusParts(e).join(" · "),
    kind: withKind ? "Episode" : undefined,
    kindAccent: ACCENT.movies,
    chip: `Ep ${e.n}`,
    accent: ACCENT.movies,
    width,
    date: e.publishAt,
  };
}

/**
 * A Short on Home's "Latest shorts" shelf: the episode at its own frame (1:1 or 9:16), titled by
 * the episode, captioned by the book, linking to the site's episode page (the player is there).
 */
export function shortCard(series: Series, e: Episode, width = 172): CardModel {
  const aspect = episodeAspect(series, e);
  const ratio: CardRatio = aspect === "9:16" ? "9:16" : aspect === "16:9" ? "16:9" : "1:1";
  return {
    key: `short:${series.slug}/${e.slug}`,
    href: `/movies/${series.slug}/${e.slug}`,
    title: e.title,
    ratio,
    image: e.still,
    imagePosition: ratio === "9:16" ? "50% 20%" : "50% 50%",
    caption: [series.title, `Ep ${e.n}`, e.runtime].filter(Boolean).join(" · "),
    accent: ACCENT.movies,
    width,
    playGlyph: true,
    date: e.publishAt,
  };
}

/** The newest Shorts across every released series, newest first. */
export function buildLatestShorts(latest: Array<{ series: Series; episode: Episode }>, limit = 10): CardModel[] {
  return latest
    .map(({ series, episode }) => shortCard(series, episode))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);
}

/** `55 shorts · 3 series · The Keeper's Lantern on YouTube` */
export function latestShortsMeta(shorts: number, seriesCount: number, channelName: string): string {
  return [`${shorts} ${shorts === 1 ? "short" : "shorts"}`, `${seriesCount} series`, `${channelName} on YouTube`].join(" · ");
}

export function trackCard(t: Track, width: number = CARD_WIDTH.single, withKind = false): CardModel {
  return {
    key: `single:${t.slug}`,
    href: `/music#${t.slug}`,
    title: t.title,
    ratio: "1:1",
    image: t.posterUrl,
    caption: trackStatusParts(t).join(" · "),
    kind: withKind ? "Single" : undefined,
    kindAccent: ACCENT.music,
    accent: ACCENT.music,
    width,
    playGlyph: true,
    date: t.releaseDate,
  };
}

export function gameCard(g: Game, width: number = CARD_WIDTH.railGame, withKind = false): CardModel {
  return {
    key: `game:${g.slug}`,
    href: g.playUrl || `/games/${g.slug}`,
    title: g.title,
    ratio: "16:9",
    image: g.thumbnail,
    caption: gameStatusParts(g).join(" · "),
    kind: withKind ? "Game" : undefined,
    kindAccent: ACCENT.games,
    accent: ACCENT.games,
    width,
    date: g.releaseDate ?? "",
  };
}

// ─── Hero ────────────────────────────────────────────────────────────────────
/**
 * One slot per vertical that has something to show, in room order
 * Stories · Movies · Music · Games. Slot 0 (the default without JS) is the newest story.
 */
export function buildHeroSlots(
  stories: Story[],
  series: Series[],
  tracks: Track[],
  games: Game[],
  now: Date = new Date(),
): HeroSlot[] {
  const slots: HeroSlot[] = [];

  // Lead with the newest story that has cover art; a coverless story would be a blank hero.
  const story = stories.find((x) => x.cover34 || x.cover169) ?? stories[0];
  if (story) {
    const isNew = within(story.createdAt, now, 7);
    const parts = storyStatusParts(story);
    slots.push({
      vertical: "stories",
      accent: ACCENT.stories,
      eyebrow: isNew ? [parts[0], "New this week", ...parts.slice(1)] : parts,
      kicker: "Stories",
      title: story.title,
      logline: story.summary,
      ctas: [
        { label: "Read it", href: `/stories/${story.slug}`, variant: "primary" },
        { label: "All stories", href: "/stories", variant: "ghost" },
      ],
      follow: { label: "+ Follow", sub: "Get the next story first", href: "/stories" },
      art: { src: story.cover34 || story.cover, ratio: "3:4", alt: `${story.title} cover`, href: `/stories/${story.slug}` },
      glow: story.cover169 || story.cover34 || story.cover,
    });
  }

  const released = series.filter((s) => s.status !== "in-production" && s.episodes.length > 0);
  const show = released[0] ?? series[0];
  if (show) {
    const inProd = show.status === "in-production" || show.episodes.length === 0;
    const first = show.episodes[0];
    const ctas: HeroCta[] = inProd
      ? [{ label: "+ Follow", href: `/movies/${show.slug}`, variant: "primary" }, { label: "All movies", href: "/movies", variant: "ghost" }]
      : [
          { label: `Play Ep ${first.n}`, href: `/movies/${show.slug}/${first.slug}`, variant: "primary", play: true },
          { label: "Trailer", href: `/movies/${show.slug}#trailer`, variant: "ghost" },
        ];
    slots.push({
      vertical: "movies",
      accent: ACCENT.movies,
      eyebrow: seriesStatusParts(show),
      kicker: show.subtitle ? `Movies · ${show.subtitle}` : "Movies",
      title: show.title,
      logline: show.synopsis,
      ctas,
      follow: inProd ? undefined : { label: "+ Follow", sub: "Get the next series first", href: `/movies/${show.slug}` },
      art: { src: show.poster, ratio: "9:16", alt: `${show.title} poster`, href: `/movies/${show.slug}`, position: "50% 12%" },
      glow: show.glow || show.backdrop || show.poster,
    });
  }

  const track = tracks.find((t) => t.featured) ?? tracks[0];
  if (track) {
    slots.push({
      vertical: "music",
      accent: ACCENT.music,
      eyebrow: trackStatusParts(track),
      kicker: "Music",
      title: track.title,
      logline: track.story,
      ctas: [
        { label: "Play", href: `/music#${track.slug}`, variant: "primary", play: true },
        { label: "All music", href: "/music", variant: "ghost" },
      ],
      art: { src: track.posterUrl, ratio: "1:1", alt: `${track.title} cover`, href: `/music#${track.slug}` },
      glow: track.posterUrl,
    });
  }

  const game = games.find((g) => g.featured) ?? games[0];
  if (game) {
    const href = game.playUrl || `/games/${game.slug}`;
    slots.push({
      vertical: "games",
      accent: ACCENT.games,
      eyebrow: ["Game", ...gameStatusParts(game).slice(0, 1), "Browser", "No install"],
      kicker: "Games",
      title: game.title,
      logline: game.description,
      ctas: [
        { label: "Play now", href, variant: "primary" },
        { label: "All games", href: "/games", variant: "ghost" },
      ],
      art: { src: game.thumbnail, ratio: "16:9", alt: game.title, href },
      glow: game.thumbnail,
    });
  }

  return slots;
}

// ─── New this week ───────────────────────────────────────────────────────────
/**
 * 8 mixed cards. Each kind is sorted newest-first, then the kinds are interleaved
 * (round-robin, kinds ordered by their own newest date) so one busy room can't flood
 * the rail. Kind chip + ratio per kind: Story 3:4 · Episode 2:3 · Single 1:1 · Game 16:9.
 */
export function buildNewThisWeek(
  stories: Story[],
  episodes: Array<{ series: Series; episode: Episode }>,
  tracks: Track[],
  games: Game[],
  limit = 8,
): CardModel[] {
  const byDateDesc = (a: CardModel, b: CardModel) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  const lanes: CardModel[][] = [
    stories.map((s) => storyCard(s, CARD_WIDTH.story, true)).sort(byDateDesc),
    episodes.map(({ series, episode }) => episodeCard(series, episode, CARD_WIDTH.episode, true)).sort(byDateDesc),
    tracks.map((t) => trackCard(t, CARD_WIDTH.single, true)).sort(byDateDesc),
    games.map((g) => gameCard(g, CARD_WIDTH.game, true)).sort(byDateDesc),
  ]
    .filter((lane) => lane.length > 0)
    .sort((a, b) => byDateDesc(a[0], b[0]));

  const out: CardModel[] = [];
  const idx = lanes.map(() => 0);
  while (out.length < limit) {
    let took = false;
    for (let i = 0; i < lanes.length && out.length < limit; i++) {
      const card = lanes[i][idx[i]];
      if (!card) continue;
      out.push(card);
      idx[i]++;
      took = true;
    }
    if (!took) break;
  }
  return out;
}

// ─── Movies rail ─────────────────────────────────────────────────────────────
export function productionNote(s: Series): string | undefined {
  const p = s.production;
  if (!p) return undefined;
  const parts = [p.script ? "Script ✓" : "", p.cast ? "Cast ✓" : "", p.note ?? ""].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

export function seriesVote(s: Series): VoteModel {
  return {
    id: `series:${s.slug}`,
    title: s.title,
    author: s.author,
    year: s.year,
    format: s.kind === "series" ? "Series" : s.kind === "feature" ? "Feature" : "Shorts",
    votes: s.production?.votes ?? 0,
    state: "in-production",
    note: productionNote(s),
    href: `/movies/${s.slug}`,
  };
}

/**
 * Series card · 3 latest episodes · trailer · 2 shorts (if any) · in-production card.
 * The lead series is the newest released one; shorts come from any `kind: "shorts"` series.
 */
export function buildMoviesRail(series: Series[]): MoviesRailItem[] {
  const out: MoviesRailItem[] = [];
  const released = series.filter((s) => s.status !== "in-production" && s.episodes.length > 0 && s.kind !== "shorts");
  const lead = released[0];

  if (lead) {
    const n = lead.episodes.length;
    out.push({
      type: "card",
      card: {
        key: `series:${lead.slug}`,
        href: `/movies/${lead.slug}`,
        title: lead.title,
        ratio: "2:3",
        image: lead.poster,
        imagePosition: "50% 12%",
        caption: [seriesStatusParts(lead)[0], lead.status === "complete" ? "Complete" : "Airing", `${n} ep`].join(" · "),
        progress: lead.status === "complete" ? 1 : 0,
        accent: ACCENT.movies,
        width: CARD_WIDTH.railMovie,
        date: lead.publishAt,
      },
    });
    const latest = [...lead.episodes].sort((a, b) => (a.publishAt < b.publishAt ? 1 : -1)).slice(0, 3);
    for (const e of latest) out.push({ type: "card", card: episodeCard(lead, e) });
    if (lead.trailer && (lead.trailer.file || lead.trailer.youtubeId)) {
      out.push({
        type: "card",
        card: {
          key: `trailer:${lead.slug}`,
          href: `/movies/${lead.slug}#trailer`,
          title: lead.title,
          ratio: "2:3",
          image: lead.trailer.poster || lead.episodes[1]?.still || lead.poster,
          imagePosition: "50% 45%",
          caption: ["Trailer", lead.trailer.runtime ?? ""].filter(Boolean).join(" · "),
          accent: ACCENT.movies,
          width: CARD_WIDTH.railMovie,
          playGlyph: true,
          date: lead.publishAt,
        },
      });
    }
  }

  const shorts = series.filter((s) => s.kind === "shorts" && s.episodes.length > 0).flatMap((s) => s.episodes.map((e) => ({ s, e })));
  shorts.sort((a, b) => (a.e.publishAt < b.e.publishAt ? 1 : -1));
  for (const { s, e } of shorts.slice(0, 2)) {
    out.push({
      type: "card",
      card: {
        key: `short:${s.slug}/${e.slug}`,
        href: `/movies/${s.slug}/${e.slug}`,
        title: e.title,
        ratio: "9:16",
        image: e.still,
        caption: ["Short", e.runtime ?? ""].filter(Boolean).join(" · "),
        accent: ACCENT.movies,
        width: 132,
        date: e.publishAt,
      },
    });
  }

  for (const s of series.filter((x) => x.status === "in-production")) out.push({ type: "slate", vote: seriesVote(s) });
  return out;
}

/** `A Study in Scarlet · Series · Complete · 14 episodes · 2 h 20 min` for the rail header. */
export function moviesRailMeta(series: Series[]): string {
  const lead = series.find((s) => s.status !== "in-production" && s.episodes.length > 0) ?? series[0];
  if (!lead) return "";
  return [lead.title, ...seriesStatusParts(lead).filter((p) => p !== lead.year)].join(" · ");
}

// ─── Slate ───────────────────────────────────────────────────────────────────
/** Requests → VoteCards. In-production requests borrow the produced series' note + link. */
export function buildSlate(requests: RequestItem[], series: Series[] = []): VoteModel[] {
  return requests.map((r) => {
    const produced = r.producedSlug ? series.find((s) => s.slug === r.producedSlug) : undefined;
    return {
      id: r.id,
      title: r.title,
      author: r.author,
      year: r.year,
      format: r.format,
      votes: r.votes,
      state: r.state,
      note: r.state === "in-production" && produced ? productionNote(produced) : undefined,
      href: r.state === "in-production" && r.producedSlug ? `/movies/${r.producedSlug}` : undefined,
    };
  });
}

// ─── "Updated …" line ────────────────────────────────────────────────────────
/** Newest content date across everything on the page (ISO), or "" when nothing. */
export function latestContentDate(
  stories: Story[],
  series: Series[],
  tracks: Track[],
  games: Game[],
): string {
  const dates: string[] = [
    ...stories.map((s) => s.createdAt || s.publishAt),
    ...series.flatMap((s) => [s.publishAt, ...s.episodes.map((e) => e.publishAt)]),
    ...tracks.map((t) => t.releaseDate),
    ...games.map((g) => g.releaseDate ?? ""),
  ].filter((d) => d && !Number.isNaN(new Date(d).getTime()));
  if (!dates.length) return "";
  return dates.reduce((max, d) => (new Date(d).getTime() > new Date(max).getTime() ? d : max));
}
