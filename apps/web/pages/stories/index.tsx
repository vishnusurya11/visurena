// pages/stories/index.tsx — Stories section landing (Amber room)
//
// Real content only — driven by the local content provider (lib/content.ts).
// Masthead → featured (latest) → the catalogue grid → newsletter. No placeholders.

import React from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { VRFade, VRPoster, VRRowHeader, Header, Footer } from "@visurena/ui";
import { VRNewsletter } from "../../components/VRNewsletter";
import { getStories, type Story } from "../../lib/content";

// ─── Design constants ───────────────────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const AMBER     = "#f5b831";

interface StoriesProps {
  stories: Story[];
}

function metaLine(s: Story): string {
  return [s.genre, s.readMinutes ? `${s.readMinutes} min` : null].filter(Boolean).join(" · ");
}

// ─── Masthead ────────────────────────────────────────────────────────────────
function Masthead({ stats }: { stats: { n: string; label: string }[] }) {
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 56px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 30%, ${AMBER}10 0%, transparent 55%)`, pointerEvents: "none" }} />
      <VRFade style={{ position: "relative", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: AMBER, boxShadow: `0 0 16px ${AMBER}80` }} />
            The Amber room
          </div>
          <h1 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(80px, 9vw, 144px)", lineHeight: 0.9, margin: 0, color: IVORY, letterSpacing: "-0.03em" }}>Stories</h1>
          <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, color: "#cdc6b6", maxWidth: 600, marginTop: 22, marginBottom: 0 }}>
            Short stories you can read in one sitting. Slow horror, patient mystery, restless thriller.
          </p>
        </div>
        <div style={{ display: "flex", gap: 48, justifyContent: "flex-end", fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase", paddingBottom: 12 }}>
          {stats.map(({ n, label }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: F_DISPLAY, fontSize: 44, lineHeight: 1, color: IVORY, letterSpacing: "-0.02em", marginBottom: 6, fontWeight: F_WEIGHT }}>{n}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── Featured ────────────────────────────────────────────────────────────────
function Featured({ story }: { story: Story }) {
  const tint = story.accent || AMBER;
  const words = story.title.split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words[words.length - 1];

  return (
    <section style={{ position: "relative", padding: "84px clamp(28px, 4vw, 80px)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 60%, ${tint}25 0%, transparent 55%)`, pointerEvents: "none" }} />
      <VRFade style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 64, alignItems: "center" }}>
        <VRPoster seed={1} accent={AMBER} tint={tint} image={story.cover34} style={{ width: "100%", aspectRatio: "3/4" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, padding: 36, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: AMBER, textTransform: "uppercase", marginBottom: 12 }}>&#9733; Latest story</div>
            <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(48px, 5vw, 76px)", lineHeight: 0.95, color: IVORY, letterSpacing: "-0.02em", fontWeight: F_WEIGHT }}>{story.title}</div>
          </div>
        </VRPoster>

        <div>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 14 }}>&#9679; {metaLine(story)}</div>
          <h2 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(64px, 7vw, 108px)", lineHeight: 0.92, color: IVORY, letterSpacing: "-0.025em", margin: 0 }}>
            {lead}{lead ? <br /> : null}<em style={{ fontStyle: "italic", color: tint }}>{last}</em>
          </h2>
          {story.summary && (
            <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 560, marginTop: 24 }}>{story.summary}</p>
          )}
          <div style={{ marginTop: 36 }}>
            <Link href={`/stories/${story.slug}`} className="vr-cta vr-cta-solid vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", background: IVORY, color: "#0a0a0a", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset" }}>
              <span style={{ width: 0, height: 0, borderLeft: "9px solid #0a0a0a", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }} />
              Read it
            </Link>
          </div>
        </div>
      </VRFade>
    </section>
  );
}

// ─── Catalogue card ──────────────────────────────────────────────────────────
function StoryCard({ story, seed }: { story: Story; seed: number }) {
  const tint = story.accent || AMBER;
  return (
    <article className="vr-card" style={{ position: "relative" }}>
      <Link href={`/stories/${story.slug}`} className="vr-link" style={{ textDecoration: "none", display: "block" }}>
        <VRPoster seed={seed} accent={AMBER} tint={tint} image={story.cover34} style={{ width: "100%", aspectRatio: "3/4", marginBottom: 14 }}>
          <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {story.genre && <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.2em", color: AMBER, textTransform: "uppercase" }}>{story.genre}</span>}
              <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>NEW</span>
            </div>
            <div style={{ fontFamily: F_DISPLAY, fontSize: 24, lineHeight: 1.0, color: IVORY, letterSpacing: "-0.01em" }}>{story.title}</div>
          </div>
          {story.summary && (
            <div className="vr-card-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
              <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#cdc6b6", textTransform: "uppercase", marginBottom: 6 }}>{metaLine(story)}</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 12, lineHeight: 1.35, color: "#cdc6b6", margin: 0 }}>{story.summary}</p>
            </div>
          )}
        </VRPoster>
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
        <span>{metaLine(story)}</span>
        <span>{story.createdAt.slice(0, 10)}</span>
      </div>
    </article>
  );
}

// ─── Trending (ranked) ───────────────────────────────────────────────────────
// Same numbered design as before, but driven by real data. Reads-counts are gone
// (no analytics yet); ranking is newest-first until live stats exist.
function Trending({ stories }: { stories: Story[] }) {
  const ranked = stories.slice(0, 8);
  return (
    <section style={{ padding: "56px clamp(28px, 4vw, 80px) 72px", background: "rgba(8,8,8,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <VRRowHeader eyebrow="Reader charts" title="Trending this week" meta="Ranked newest-first until live stats land" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 28, marginTop: 44 }}>
        {ranked.map((s, i) => {
          const tint = s.accent || AMBER;
          return (
            <VRFade key={s.slug} delay={i * 70}>
              <Link href={`/stories/${s.slug}`} className="vr-card vr-link" style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "end", gap: 0, minWidth: 0, textDecoration: "none" }}>
                <div style={({ fontFamily: F_DISPLAY, fontSize: "clamp(110px, 9vw, 180px)", lineHeight: 0.78, color: "transparent", WebkitTextStroke: `1.2px ${AMBER}`, fontWeight: F_WEIGHT, marginRight: -8, marginBottom: -4, alignSelf: "end" }) as React.CSSProperties}>{i + 1}</div>
              <VRPoster seed={i + 50} accent={AMBER} tint={tint} image={s.cover34} style={{ width: "100%", aspectRatio: "3/4", minWidth: 0 }}>
                <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  {s.genre && <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: AMBER, textTransform: "uppercase" }}>{s.genre}</span>}
                  <div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(16px, 1.4vw, 22px)", lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{s.title}</div>
                    {s.readMinutes && <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", marginTop: 6, textTransform: "uppercase" }}>{s.readMinutes} min read</div>}
                  </div>
                </div>
              </VRPoster>
              </Link>
            </VRFade>
          );
        })}
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StoriesPage({ stories }: StoriesProps) {
  const featured = stories[0];
  const genres = Array.from(new Set(stories.map((s) => s.genre).filter(Boolean)));
  const stats = [
    { n: String(stories.length), label: stories.length === 1 ? "Story" : "Stories" },
    { n: String(genres.length), label: genres.length === 1 ? "Genre" : "Genres" },
  ];

  return (
    <>
      <Head>
        <title>{"Stories — Visurena"}</title>
        <meta name="description" content="Short stories you can read in one sitting — slow horror, patient mystery, restless thriller." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <Masthead stats={stats} />

          {featured ? (
            <>
              <Featured story={featured} />
              <Trending stories={stories} />
              <section style={{ padding: "56px clamp(28px, 4vw, 80px) 64px" }}>
                <VRRowHeader eyebrow="Latest · Stories" title="The catalogue" meta={`${stories.length} ${stories.length === 1 ? "story" : "stories"}`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18, marginTop: 32 }}>
                  {stories.map((s, i) => (
                    <VRFade key={s.slug} delay={i * 50}><StoryCard story={s} seed={i + 10} /></VRFade>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center" }}>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 18 }}>&#9679; Coming soon</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, color: "#cdc6b6", maxWidth: 540, margin: "0 auto" }}>The first stories are on their way. Check back shortly.</p>
            </section>
          )}

          <VRNewsletter
            eyebrow="The Monday Post"
            headline={<>One story a week,<br /><em style={{ fontStyle: "italic", color: AMBER }}>in your inbox.</em></>}
            subtext="Horror, mystery, thriller — a new short story every Monday. No tracking, no ads. Free during open beta."
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<StoriesProps> = async () => {
  const stories = getStories();
  return { props: JSON.parse(JSON.stringify({ stories })) };
};
