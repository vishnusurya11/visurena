// pages/stories/index.tsx — Stories section landing page (Amber stone)
// Section accent = #f5b831 (amber). Featured story tint bleeds into hero.

import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  VRFade,
  VRTilt,
  VRPoster,
  VRRowHeader,
  Header,
  Footer,
} from "@visurena/ui";
import { VRNewsletter } from "../../components/VRNewsletter";

// ─── Design constants ───────────────────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const AMBER     = "#f5b831";

// ─── Content data ───────────────────────────────────────────────────────────
interface Story {
  slug: string;
  title: string;
  genre: string;
  chapters: number;
  runtime: string;
  date: string;
  featured: boolean;
  image: string;
  tint: string;
  blurb: string;
}

interface TrendingStory {
  slug: string;
  title: string;
  genre: string;
  reads: string;
  tint: string;
  image: string;
}

interface ContinueItem {
  title: string;
  slug: string;
  chapter: string;
  progress: number;
  left: string;
}

interface Shelf {
  id: string;
  label: string;
  tagline: string;
  count: number;
}

const VR_STORIES_LATEST: Story[] = [
  { slug: "lantern-mile",       title: "The Lantern Mile",   genre: "Horror",   chapters: 9,  runtime: "42 min", date: "May 18", featured: true,  image: "https://picsum.photos/seed/lantern-mile/900/1200",       tint: "#7c8fa8", blurb: "A trucker drives an Iowa highway where every fifth mile, the lights forget him." },
  { slug: "bone-tide",          title: "Bone Tide",          genre: "Mystery",  chapters: 12, runtime: "1h 06",  date: "May 14", featured: false, image: "https://picsum.photos/seed/bone-tide/900/1200",          tint: "#6e8b86", blurb: "Eight bodies wash up on a Maine island that has no shore." },
  { slug: "below-the-concrete", title: "Below the Concrete", genre: "Thriller", chapters: 7,  runtime: "38 min", date: "May 11", featured: false, image: "https://picsum.photos/seed/below-the-concrete/900/1200", tint: "#a45d3f", blurb: "She bought the building cheap. Two floors below the lobby, somebody's been waiting." },
  { slug: "saltwater-saints",   title: "Saltwater Saints",   genre: "Horror",   chapters: 15, runtime: "1h 22",  date: "May 09", featured: false, image: "https://picsum.photos/seed/saltwater-saints/900/1200",   tint: "#5d7ea0", blurb: "The fishermen of Esperanza Bay haven't aged since 1962. The tourists do." },
  { slug: "eight-rooms",        title: "Eight Rooms",        genre: "Mystery",  chapters: 8,  runtime: "44 min", date: "May 03", featured: false, image: "https://picsum.photos/seed/eight-rooms/900/1200",        tint: "#9a7e54", blurb: "A locked-room novella set inside a house that has seven." },
  { slug: "hour-of-dogs",       title: "Hour of Dogs",       genre: "Thriller", chapters: 11, runtime: "59 min", date: "Apr 28", featured: false, image: "https://picsum.photos/seed/hour-of-dogs/900/1200",       tint: "#a85a55", blurb: "The hour between dogs and wolves — when neither knows which one it is." },
];

const VR_STORIES_TRENDING: TrendingStory[] = [
  { slug: "pomegranate-house", title: "Pomegranate House", genre: "Horror",   reads: "84.2k", tint: "#a64a52", image: "https://picsum.photos/seed/pomegranate-house/600/800" },
  { slug: "the-velvetine",     title: "The Velvetine",     genre: "Mystery",  reads: "61.8k", tint: "#7a5a99", image: "https://picsum.photos/seed/the-velvetine/600/800" },
  { slug: "hush-maeve",        title: "Hush, Maeve",       genre: "Thriller", reads: "52.1k", tint: "#8a7660", image: "https://picsum.photos/seed/hush-maeve/600/800" },
  { slug: "cathedrals-late",   title: "Cathedrals, Late",  genre: "Horror",   reads: "47.6k", tint: "#536a85", image: "https://picsum.photos/seed/cathedrals-late/600/800" },
  { slug: "lighthouse-19",     title: "Lighthouse 19",     genre: "Mystery",  reads: "41.3k", tint: "#5e8073", image: "https://picsum.photos/seed/lighthouse-19/600/800" },
];

const VR_CONTINUE: ContinueItem[] = [
  { title: "Saltwater Saints", slug: "saltwater-saints", chapter: "Chapter 6 of 15", progress: 0.41, left: "48 min left" },
  { title: "Eight Rooms",      slug: "eight-rooms",      chapter: "Chapter 3 of 8",  progress: 0.34, left: "29 min left" },
  { title: "Hour of Dogs",     slug: "hour-of-dogs",     chapter: "Chapter 9 of 11", progress: 0.82, left: "11 min left" },
];

const VR_SHELVES: Shelf[] = [
  { id: "horror",   label: "Horror",   tagline: "Slow rooms, long hallways.",      count: 47 },
  { id: "mystery",  label: "Mystery",  tagline: "Patient questions, kept honest.", count: 38 },
  { id: "thriller", label: "Thriller", tagline: "Less time than you think.",       count: 31 },
];

// ─── Section masthead ────────────────────────────────────────────────────────
interface MastheadStat {
  n: string;
  label: string;
}

interface SectionMastheadProps {
  stone: string;
  title: string;
  sub: string;
  stats: MastheadStat[];
}

function VRStoriesMasthead({ stone, title, sub, stats }: SectionMastheadProps) {
  return (
    <section style={{
      padding: "84px clamp(28px, 4vw, 80px) 56px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Faint amber glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 80% 30%, ${AMBER}10 0%, transparent 55%)`,
        pointerEvents: "none",
      }} />

      <VRFade style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 64,
        alignItems: "flex-end",
      }}>
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 24,
            fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em",
            color: AMBER, textTransform: "uppercase",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: AMBER, boxShadow: `0 0 16px ${AMBER}80` }} />
            The {stone} room
          </div>
          <h1 style={{
            fontFamily: F_DISPLAY, fontWeight: F_WEIGHT,
            fontSize: "clamp(80px, 9vw, 144px)", lineHeight: 0.9, margin: 0,
            color: IVORY, letterSpacing: "-0.03em",
          }}>{title}</h1>
          <p style={{
            fontFamily: F_BODY, fontStyle: "italic",
            fontSize: 22, color: "#cdc6b6", maxWidth: 600,
            marginTop: 22, marginBottom: 0,
          }}>{sub}</p>
        </div>
        <div style={{
          display: "flex", gap: 48, justifyContent: "flex-end",
          fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em",
          color: "#7a7363", textTransform: "uppercase", paddingBottom: 12,
        }}>
          {stats.map(({ n, label }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: F_DISPLAY, fontSize: 44, lineHeight: 1,
                color: IVORY, letterSpacing: "-0.02em", marginBottom: 6, fontWeight: F_WEIGHT,
              }}>{n}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── Featured story block ────────────────────────────────────────────────────
function VRStoryFeaturedBlock({ story }: { story: Story }) {
  const words = story.title.split(" ");
  const leadWords = words.slice(0, -1).join(" ");
  const lastWord  = words[words.length - 1];

  return (
    <section style={{
      position: "relative",
      padding: "84px clamp(28px, 4vw, 80px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 70% 60%, ${story.tint}25 0%, transparent 55%)`,
        pointerEvents: "none",
      }} />
      <VRFade style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr",
        gap: 64,
        alignItems: "center",
      }}>
        {/* Poster */}
        <VRPoster seed={1} accent={AMBER} tint={story.tint} image={story.image} style={{ width: "100%", aspectRatio: "3/4" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, padding: 36, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: AMBER, textTransform: "uppercase", marginBottom: 12 }}>
              &#9733; This week&apos;s lead
            </div>
            <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(48px, 5vw, 76px)", lineHeight: 0.95, color: IVORY, letterSpacing: "-0.02em", fontWeight: F_WEIGHT }}>
              {story.title}
            </div>
          </div>
        </VRPoster>

        {/* Detail */}
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 14 }}>
            &#9679; {story.genre} &middot; {story.chapters} chapters &middot; {story.runtime}
          </div>
          <h2 style={{
            fontFamily: F_DISPLAY, fontWeight: F_WEIGHT,
            fontSize: "clamp(64px, 7vw, 108px)", lineHeight: 0.92,
            color: IVORY, letterSpacing: "-0.025em", margin: 0,
          }}>
            {leadWords}<br />
            <em style={{ fontStyle: "italic", color: AMBER }}>{lastWord}</em>
          </h2>
          <p style={{
            fontFamily: F_BODY, fontStyle: "italic",
            fontSize: 22, lineHeight: 1.4, color: "#cdc6b6",
            maxWidth: 560, marginTop: 24,
          }}>
            {story.blurb}
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
            <Link
              href={`/stories/${story.slug}`}
              className="vr-cta vr-cta-solid vr-link"
              style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                padding: "16px 30px", background: IVORY, color: "#0a0a0a",
                fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em",
                textTransform: "uppercase", textDecoration: "none",
                boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset",
              }}
            >
              <span style={{ width: 0, height: 0, borderLeft: "9px solid #0a0a0a", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }} />
              Read Chapter One
            </Link>
            <button
              className="vr-cta vr-link"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 24px", border: "1px solid rgba(255,255,255,0.22)",
                color: IVORY, fontFamily: F_MONO, fontSize: 11,
                letterSpacing: "0.2em", textTransform: "uppercase",
                background: "rgba(20,18,16,0.4)", backdropFilter: "blur(10px)",
                cursor: "pointer",
              }}
            >
              &#43; Save
            </button>
          </div>
        </div>
      </VRFade>
    </section>
  );
}

// ─── Continue reading ────────────────────────────────────────────────────────
function VRStoriesContinue() {
  const items = VR_CONTINUE.map((c, i) => {
    const story = VR_STORIES_LATEST.find(s => s.slug === c.slug);
    return { ...c, tint: story?.tint, image: story?.image, seed: 30 + i };
  });

  return (
    <section style={{ padding: "72px clamp(28px, 4vw, 80px) 48px" }}>
      <VRRowHeader eyebrow="Welcome back, Asha" title="Continue reading" meta="3 stories in progress" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 32 }}>
        {items.map((c, i) => (
          <VRFade key={c.title} delay={i * 80}>
            <Link
              href={`/stories/${c.slug}`}
              className="vr-card vr-sheen vr-link"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div className="vr-elevated-soft" style={{
                display: "grid", gridTemplateColumns: "120px 1fr", gap: 22,
                alignItems: "center", padding: 18,
                background: "linear-gradient(180deg, #161412, #100e0c)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <VRPoster seed={c.seed} accent={AMBER} tint={c.tint} image={c.image} style={{ width: 120, height: 168 }}>
                  <div style={{ position: "absolute", inset: 0, padding: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: 16, lineHeight: 1.0, color: IVORY }}>{c.title}</div>
                  </div>
                </VRPoster>
                <div>
                  <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: AMBER, textTransform: "uppercase", marginBottom: 8 }}>
                    &#9654; Resume
                  </div>
                  <div style={{ fontFamily: F_DISPLAY, fontSize: 24, lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{c.title}</div>
                  <div style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 14, color: "#a8a18d", marginTop: 6 }}>{c.chapter}</div>
                  <div style={{ marginTop: 18, height: 2, background: "rgba(255,255,255,0.08)", position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${c.progress * 100}%`, background: AMBER }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
                    <span>{Math.round(c.progress * 100)}% read</span>
                    <span>{c.left}</span>
                  </div>
                </div>
              </div>
            </Link>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Story card ──────────────────────────────────────────────────────────────
function VRStoryCard({ story, seed }: { story: Story; seed: number }) {
  return (
    <article className="vr-card" style={{ position: "relative" }}>
      <Link href={`/stories/${story.slug}`} className="vr-link" style={{ textDecoration: "none", display: "block" }}>
        <VRPoster seed={seed} accent={AMBER} tint={story.tint} image={story.image} style={{ width: "100%", aspectRatio: "3/4", marginBottom: 14 }}>
          <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.2em", color: AMBER, textTransform: "uppercase" }}>{story.genre}</span>
              <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>NEW</span>
            </div>
            <div style={{ fontFamily: F_DISPLAY, fontSize: 24, lineHeight: 1.0, color: IVORY, letterSpacing: "-0.01em" }}>{story.title}</div>
          </div>
          <div className="vr-card-overlay" style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 60%)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16,
          }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: IVORY, color: "#0a0a0a", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 0, height: 0, borderLeft: "8px solid #0a0a0a", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", marginLeft: 2 }} />
              </span>
              <span style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.4)", color: IVORY, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: F_BODY, fontSize: 18 }}>&#43;</span>
            </div>
            <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#cdc6b6", textTransform: "uppercase", marginBottom: 6 }}>
              {story.chapters} ch &middot; {story.runtime}
            </div>
            <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 12, lineHeight: 1.35, color: "#cdc6b6", margin: 0 }}>{story.blurb}</p>
          </div>
        </VRPoster>
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
        <span>{story.chapters} ch &middot; {story.runtime}</span>
        <span>{story.date}</span>
      </div>
    </article>
  );
}

// ─── New this week ───────────────────────────────────────────────────────────
function VRStoriesNewThisWeek() {
  return (
    <section style={{ padding: "44px clamp(28px, 4vw, 80px) 56px" }}>
      <VRRowHeader eyebrow="Latest · Stories" title="New this week" meta="6 stories — published Mondays" right="See all 142 →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18, marginTop: 32 }}>
        {VR_STORIES_LATEST.map((story, i) => (
          <VRFade key={story.slug} delay={i * 50}>
            <VRStoryCard story={story} seed={i + 10} />
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Genre shelves ───────────────────────────────────────────────────────────
function VRStoriesShelves() {
  return (
    <section style={{
      padding: "72px clamp(28px, 4vw, 80px) 72px",
      background: "rgba(8,8,8,0.5)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <VRRowHeader eyebrow="The Shelves" title="By the way you read" meta="Three genres, slowly built — many more to come" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginTop: 36 }}>
        {VR_SHELVES.map((shelf, i) => (
          <VRFade key={shelf.id} delay={i * 80}>
            <VRTilt>
              <Link
                href={`/stories#${shelf.id}`}
                className="vr-link vr-shelf-tile"
                style={{
                  position: "relative", display: "block",
                  aspectRatio: "4/5", overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none",
                }}
              >
                <VRPoster seed={i + 200} accent={AMBER} tint={AMBER} style={{ position: "absolute", inset: 0 }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 30%, ${AMBER}24 0%, transparent 55%)` }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)" }} />
                </VRPoster>
                <div style={{ position: "absolute", inset: 0, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 10 }}>
                      &#9679; {shelf.count} stories
                    </div>
                    <div style={{
                      fontFamily: F_DISPLAY, fontSize: "clamp(56px, 6.4vw, 92px)",
                      lineHeight: 0.95, color: IVORY, letterSpacing: "-0.025em", fontWeight: F_WEIGHT,
                    }}>
                      {shelf.label}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 18, color: "#cdc6b6", margin: 0, marginBottom: 22, maxWidth: 320 }}>
                      {shelf.tagline}
                    </p>
                    <div style={{
                      fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.22em", color: IVORY,
                      textTransform: "uppercase", display: "inline-flex", alignItems: "center",
                      gap: 12, paddingBottom: 6, borderBottom: `1px solid ${AMBER}`,
                    }}>
                      Browse the shelf &rarr;
                    </div>
                  </div>
                </div>
              </Link>
            </VRTilt>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Trending ────────────────────────────────────────────────────────────────
function VRStoriesTrending() {
  return (
    <section style={{ padding: "72px clamp(28px, 4vw, 80px) 72px" }}>
      <VRRowHeader eyebrow="Reader Charts" title="Trending this week" meta="Updated every Sunday · 03:00 UTC" right="Top 50 →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 28, marginTop: 44 }}>
        {VR_STORIES_TRENDING.slice(0, 5).map((story, i) => (
          <VRFade key={story.slug} delay={i * 70}>
            <Link
              href={`/stories/${story.slug}`}
              className="vr-card vr-link"
              style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "end", gap: 0, minWidth: 0, textDecoration: "none" }}
            >
              <div style={({
                fontFamily: F_DISPLAY,
                fontSize: "clamp(140px, 11vw, 200px)",
                lineHeight: 0.78,
                color: "transparent",
                WebkitTextStroke: `1.2px ${AMBER}`,
                fontWeight: F_WEIGHT,
                marginRight: -10,
                marginBottom: -4,
                alignSelf: "end",
              }) as React.CSSProperties}>{i + 1}</div>
              <VRPoster seed={i + 50} accent={AMBER} tint={story.tint} image={story.image} style={{ width: "100%", aspectRatio: "3/4", minWidth: 0 }}>
                <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: AMBER, textTransform: "uppercase" }}>{story.genre}</span>
                  <div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(16px, 1.4vw, 22px)", lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{story.title}</div>
                    <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", marginTop: 6, textTransform: "uppercase" }}>{story.reads} reads</div>
                  </div>
                </div>
              </VRPoster>
            </Link>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StoriesPage() {
  const featured = VR_STORIES_LATEST.find(s => s.featured) ?? VR_STORIES_LATEST[0];

  return (
    <>
      <Head>
        <title>{"Stories — Visurena"}</title>
        <meta name="description" content="Short stories, novellas and web novels. Slow horror, patient mystery, restless thriller. One every Monday." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <VRStoriesMasthead
            stone="Amber"
            title="Stories"
            sub="Short stories, novellas and web novels. Slow horror, patient mystery, restless thriller. One every Monday."
            stats={[
              { n: "14",  label: "Published" },
              { n: "142", label: "On the shelves" },
              { n: "8",   label: "Languages" },
            ]}
          />
          <VRStoryFeaturedBlock story={featured} />
          <VRStoriesContinue />
          <VRStoriesNewThisWeek />
          <VRStoriesShelves />
          <VRStoriesTrending />
          <VRNewsletter
            eyebrow="The Monday Post"
            headline={
              <>
                One story a week,<br />
                <em style={{ fontStyle: "italic", color: AMBER }}>in your inbox.</em>
              </>
            }
            subtext="Horror, mystery, thriller — one chapter every Monday morning. No tracking, no ads. Free during open beta."
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
