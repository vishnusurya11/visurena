// pages/stories/[slug].tsx — Single story detail / reader landing (Amber stone)
//
// Color-bleed concept: the Stories section accent (amber) stays in the eyebrow + nav
// dot, while the story-specific TINT saturates the hero glow + chapter hover on this
// page only. Visurena identity (type, chrome) stays constant.

import React, { useRef, useEffect } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  VRFade, VRRowHeader, VRPoster, VRStripe, VRShaderBg, Header, Footer,
} from "@visurena/ui";
import VRNewsletter from "../../components/VRNewsletter";

// ─── Design constants ───────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const AMBER     = "#f5b831";

// ─── Story data (hardcoded; replaced by the content layer later) ──
interface Story {
  slug: string;
  title: string;
  genre: string;
  chapters: number;
  runtime: string;
  tint: string;
  image: string;
  blurb: string;
}

const VR_STORIES: Story[] = [
  { slug: "lantern-mile",       title: "The Lantern Mile",   genre: "Horror",   chapters: 9,  runtime: "42 min", tint: "#7c8fa8", image: "https://picsum.photos/seed/lantern-mile/1600/1000",       blurb: "A trucker drives an Iowa highway where every fifth mile, the lights forget him." },
  { slug: "bone-tide",          title: "Bone Tide",          genre: "Mystery",  chapters: 12, runtime: "1h 06",  tint: "#6e8b86", image: "https://picsum.photos/seed/bone-tide/1600/1000",          blurb: "Eight bodies wash up on a Maine island that has no shore." },
  { slug: "below-the-concrete", title: "Below the Concrete", genre: "Thriller", chapters: 7,  runtime: "38 min", tint: "#a45d3f", image: "https://picsum.photos/seed/below-the-concrete/1600/1000", blurb: "She bought the building cheap. Two floors below the lobby, somebody's been waiting." },
  { slug: "saltwater-saints",   title: "Saltwater Saints",   genre: "Horror",   chapters: 15, runtime: "1h 22",  tint: "#5d7ea0", image: "https://picsum.photos/seed/saltwater-saints/1600/1000",   blurb: "The fishermen of Esperanza Bay haven't aged since 1962. The tourists do." },
  { slug: "eight-rooms",        title: "Eight Rooms",        genre: "Mystery",  chapters: 8,  runtime: "44 min", tint: "#9a7e54", image: "https://picsum.photos/seed/eight-rooms/1600/1000",        blurb: "A locked-room novella set inside a house that has seven." },
  { slug: "hour-of-dogs",       title: "Hour of Dogs",       genre: "Thriller", chapters: 11, runtime: "59 min", tint: "#a85a55", image: "https://picsum.photos/seed/hour-of-dogs/1600/1000",       blurb: "The hour between dogs and wolves — when neither knows which one it is." },
  { slug: "pomegranate-house",  title: "Pomegranate House",  genre: "Horror",   chapters: 10, runtime: "54 min", tint: "#a64a52", image: "https://picsum.photos/seed/pomegranate-house/1600/1000",  blurb: "A girl inherits a house where every room smells faintly of pomegranate — and of someone who left in a hurry." },
  { slug: "the-velvetine",      title: "The Velvetine",      genre: "Mystery",  chapters: 9,  runtime: "48 min", tint: "#7a5a99", image: "https://picsum.photos/seed/the-velvetine/1600/1000",      blurb: "A missing actress, a theatre that closed in 1971, and a velvet seat that is always warm." },
  { slug: "hush-maeve",         title: "Hush, Maeve",        genre: "Thriller", chapters: 8,  runtime: "41 min", tint: "#8a7660", image: "https://picsum.photos/seed/hush-maeve/1600/1000",         blurb: "Maeve keeps a list of everyone who has told her to be quiet. The list is getting shorter." },
  { slug: "cathedrals-late",    title: "Cathedrals, Late",   genre: "Horror",   chapters: 11, runtime: "1h 02",  tint: "#536a85", image: "https://picsum.photos/seed/cathedrals-late/1600/1000",    blurb: "Night-shift cleaners in an empty cathedral discover the building keeps adding rooms." },
  { slug: "lighthouse-19",      title: "Lighthouse 19",      genre: "Mystery",  chapters: 7,  runtime: "36 min", tint: "#5e8073", image: "https://picsum.photos/seed/lighthouse-19/1600/1000",      blurb: "Keeper's log, Lighthouse 19: the light went out on the third night, and so did the town." },
  { slug: "the-glass-brother",  title: "The Glass Brother",  genre: "Thriller", chapters: 10, runtime: "57 min", tint: "#947256", image: "https://picsum.photos/seed/the-glass-brother/1600/1000",  blurb: "Twins, one made of glass. Only one of them remembers which." },
];

const CH_TITLES = [
  "Mile Zero", "The Yellow Sign", "Donna's", "Without Headlights", "Interlude",
  "The Lantern", "Two-Forty-Seven", "The Cold Cab", "Mile End", "The Turn-Off",
  "Salt", "After Hours", "The Third Night", "Embers", "Mile's End",
];
const CH_RUNTIME = ["6 min", "5 min", "8 min", "4 min", "5 min", "7 min", "6 min", "5 min", "9 min"];

type ChapterState = "read" | "monday" | "writing";

// ─── Hero ────────────────────────────────────────────────────────
function VRStoryHero({ story }: { story: Story }) {
  const tint = story.tint;
  const heroRef  = useRef<HTMLElement>(null);
  const bgRef    = useRef<HTMLDivElement>(null);
  const glowRef  = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof window === "undefined") return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (bgRef.current)    bgRef.current.style.transform    = `translate3d(${-x * 30}px, ${-y * 30}px, 0)`;
        if (glowRef.current)  glowRef.current.style.transform  = `translate3d(${x * 48}px, ${y * 48}px, 0)`;
        if (titleRef.current) titleRef.current.style.transform = `translate3d(${-x * 14}px, ${-y * 14}px, 0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      [bgRef, glowRef, titleRef].forEach(ref => { if (ref.current) ref.current.style.transform = ""; });
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); hero.removeEventListener("mousemove", onMove); hero.removeEventListener("mouseleave", onLeave); };
  }, []);

  const titleHead = story.title.split(" ").slice(0, -1).join(" ");
  const titleTail = story.title.split(" ").slice(-1).join(" ");

  return (
    <section ref={heroRef} style={{ position: "relative", height: "92vh", minHeight: 760, maxHeight: 1040, overflow: "hidden", isolation: "isolate" }}>
      <div ref={bgRef} style={{ position: "absolute", inset: "-8%", willChange: "transform" }}>
        <div className="vr-hero-zoom" style={{ width: "100%", height: "100%", backgroundImage: `url("${story.image}")`, backgroundSize: "cover", backgroundPosition: "center 30%", backgroundRepeat: "no-repeat" }} />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: 0.32, mixBlendMode: "screen", pointerEvents: "none" }}>
        <VRShaderBg colors={[AMBER, tint, "#00d97e", IVORY]} />
      </div>

      <div ref={glowRef} style={{ position: "absolute", inset: "-10%", willChange: "transform", pointerEvents: "none" }}>
        <div style={{ position: "absolute", right: "10%", top: "15%", width: "55%", height: "70%", background: `radial-gradient(ellipse at center, ${tint}60 0%, ${tint}1c 35%, transparent 65%)`, filter: "blur(24px)" }} />
        <div style={{ position: "absolute", left: "8%", top: "30%", width: "40%", height: "40%", background: `radial-gradient(ellipse at center, ${AMBER}18 0%, transparent 65%)`, filter: "blur(40px)" }} />
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.0) 18%, rgba(10,10,10,0.0) 42%, rgba(10,10,10,0.85) 88%, rgba(10,10,10,1) 100%), linear-gradient(90deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.18) 38%, rgba(10,10,10,0.0) 65%, rgba(10,10,10,0.3) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 78% 40%, ${tint}50 0%, transparent 55%)`, mixBlendMode: "screen", opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 -120px 200px 0 rgba(0,0,0,0.55), inset 0 0 280px 60px rgba(0,0,0,0.55)" }} />

      <VRFade style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", top: 120, display: "flex", alignItems: "center", gap: 14, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#cdc6b6", flexWrap: "wrap" }}>
        <Link href="/stories" className="vr-link" style={{ color: AMBER, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, background: AMBER, borderRadius: "50%", boxShadow: `0 0 14px ${AMBER}` }} />
          Stories · The Amber room
        </Link>
        <VRStripe color="#5a5345" width={48} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, background: tint, borderRadius: "50%" }} />
          {story.genre} · {story.chapters} chapters · {story.runtime}
        </span>
      </VRFade>

      <div ref={titleRef} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", right: "clamp(28px, 4vw, 80px)", bottom: 200, maxWidth: 1000, willChange: "transform" }}>
        <VRFade delay={80}>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#a8a18d", textTransform: "uppercase", marginBottom: 16 }}>
            A Visurena Original · Issue N&ordm; 014
          </div>
          <h1 className="vr-halo" style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(64px, 9vw, 152px)", lineHeight: 0.94, margin: 0, letterSpacing: "-0.03em", color: IVORY }}>
            {titleHead}{titleHead ? <br /> : null}
            <em style={{ fontStyle: "italic", color: tint, textShadow: `0 4px 40px ${tint}80` }}>{titleTail}</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 700, marginTop: 32, marginBottom: 0 }}>
            {story.blurb}
          </p>
        </VRFade>
      </div>
    </section>
  );
}

// ─── Info bar — sticky controls just below the hero ───
function VRStoryInfoBar({ story }: { story: Story }) {
  return (
    <section style={{
      padding: "20px clamp(28px, 4vw, 80px)",
      background: "linear-gradient(180deg, rgba(10,10,10,0.9) 0%, rgba(6,6,6,0.85) 100%)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      boxShadow: `0 0 80px -20px ${story.tint}40`,
      position: "sticky", top: 0, zIndex: 30,
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 36, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#a8a18d", textTransform: "uppercase" }}>
          <span style={{ color: AMBER }}>★ ★ ★ ★ ★</span>
          <span>4.8</span><span>·</span>
          <span>2,140 readers</span><span>·</span>
          <span>Audio · 5 languages</span>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="vr-cta vr-cta-solid vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 26px", background: IVORY, color: "#0a0a0a", border: "none", cursor: "pointer", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset" }}>
            <span style={{ width: 0, height: 0, borderLeft: "9px solid #0a0a0a", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }} />
            Read Chapter One
          </button>
          <button className="vr-cta vr-link" style={{ padding: "14px 22px", border: "1px solid rgba(255,255,255,0.22)", color: IVORY, background: "transparent", cursor: "pointer", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>&#43; Save</button>
          <button className="vr-cta vr-link" style={{ padding: "14px 22px", border: "1px solid rgba(255,255,255,0.22)", color: IVORY, background: "transparent", cursor: "pointer", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>&#9834; Audio</button>
        </div>
      </div>
    </section>
  );
}

// ─── Related story card ───────────────────────────────────────────
function RelatedCard({ story, seed }: { story: Story; seed: number }) {
  return (
    <Link href={`/stories/${story.slug}`} className="vr-card vr-sheen vr-link" style={{ display: "block", textDecoration: "none" }}>
      <VRPoster seed={seed} accent={AMBER} tint={story.tint} image={story.image} style={{ width: "100%", aspectRatio: "3/4", marginBottom: 14 }} />
      <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.22em", color: "#7a7363", textTransform: "uppercase", marginBottom: 6 }}>{story.genre} · {story.chapters} ch</div>
      <div style={{ fontFamily: F_DISPLAY, fontSize: 22, color: IVORY, letterSpacing: "-0.01em" }}>{story.title}</div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function StoryPage({ slug }: { slug: string }) {
  const story = VR_STORIES.find(s => s.slug === slug) ?? VR_STORIES[0];
  const tint = story.tint;

  const chapters = Array.from({ length: story.chapters }).map((_, i) => {
    const state: ChapterState = i < 5 ? "read" : i === 5 ? "monday" : "writing";
    return {
      n: i + 1,
      title: CH_TITLES[i] ?? `Chapter ${i + 1}`,
      runtime: CH_RUNTIME[i] ?? "—",
      state,
    };
  });

  const related = VR_STORIES.filter(s => s.slug !== story.slug && s.genre === story.genre).slice(0, 4);
  const filler = VR_STORIES.filter(s => s.slug !== story.slug && !related.includes(s));
  while (related.length < 4 && filler.length) related.push(filler.shift()!);

  return (
    <>
      <Head><title>{`${story.title} — Visurena Stories`}</title></Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <VRStoryHero story={story} />
          <VRStoryInfoBar story={story} />

          {/* Body: chapters + side rail */}
          <section style={{ padding: "84px clamp(28px, 4vw, 80px)", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 96, alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <VRFade>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 24 }}>
                ● Chapters · 5 of {story.chapters} live
              </div>
              <h2 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: 56, lineHeight: 1, margin: 0, marginBottom: 32, letterSpacing: "-0.02em", color: IVORY }}>
                The Index
              </h2>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                {chapters.map(c => (
                  <Link
                    key={c.n}
                    href={`/stories/${story.slug}`}
                    className="vr-link"
                    style={{ display: "grid", gridTemplateColumns: "auto 60px 1fr auto 24px", alignItems: "center", gap: 22, padding: "26px 0", borderBottom: "1px solid rgba(255,255,255,0.10)", transition: "background 200ms ease, padding 200ms ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(90deg, ${tint}10, transparent)`; e.currentTarget.style.paddingLeft = "16px"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.paddingLeft = "0"; }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.state === "read" ? IVORY : c.state === "monday" ? AMBER : "transparent", border: c.state === "writing" ? "1px solid #5a5345" : "none", boxShadow: c.state === "monday" ? `0 0 14px ${AMBER}` : "none" }} />
                    <span style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.22em", color: "#7a7363" }}>{String(c.n).padStart(2, "0")}</span>
                    <span style={{ fontFamily: F_DISPLAY, fontSize: 28, color: c.state === "writing" ? "#5a5345" : IVORY, letterSpacing: "-0.01em" }}>{c.title}</span>
                    <span style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase", textAlign: "right" }}>
                      {c.state === "read" ? `Read · ${c.runtime}` : c.state === "monday" ? "Available Monday" : "In writing"}
                    </span>
                    <span style={{ fontFamily: F_DISPLAY, fontSize: 22, color: c.state === "writing" ? "#3a3528" : IVORY }}>&rarr;</span>
                  </Link>
                ))}
              </div>
            </VRFade>

            <VRFade delay={120}>
              <div style={{ position: "sticky", top: 96 }}>
                <div className="vr-elevated-soft" style={{ background: "linear-gradient(180deg, rgba(20,18,16,0.85), rgba(10,10,10,0.7))", border: "1px solid rgba(255,255,255,0.06)", padding: 28 }}>
                  <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 14 }}>
                    Your reading mode
                  </div>
                  {[
                    { lbl: "Format",   val: "Read · Listen · Both", note: "Audio narration available in English" },
                    { lbl: "Language", val: "English", note: "ES · हिंदी · 한국어 · 中文 also live" },
                    { lbl: "Reader",   val: "Comfortable", note: "Type size, line height, line width" },
                    { lbl: "Continue", val: "Chapter 6 (Monday)", note: `You've read 5 / ${story.chapters}` },
                  ].map(r => (
                    <div key={r.lbl} style={{ padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#7a7363", textTransform: "uppercase" }}>{r.lbl}</span>
                        <span style={{ fontFamily: F_BODY, fontSize: 15, color: IVORY }}>{r.val}</span>
                      </div>
                      <div style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 13, color: "#7a7363", marginTop: 4 }}>{r.note}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 28 }}>
                  <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: "#7a7363", textTransform: "uppercase", marginBottom: 14 }}>About this story</div>
                  <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: "#cdc6b6", margin: 0 }}>
                    Written across four winter mornings in 2026. First draft by Visurena and Claude. Revised by hand. Audio narrated by a model trained on Visurena&apos;s reading voice. Translated into five languages by separate model passes, each reviewed line-by-line.
                  </p>
                  <Link href="/research" className="vr-link" style={{ display: "inline-block", marginTop: 18, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", paddingBottom: 4, borderBottom: `1px solid ${AMBER}` }}>
                    Read the field notes &rarr;
                  </Link>
                </div>
              </div>
            </VRFade>
          </section>

          {/* Reader's notes */}
          <section style={{ padding: "96px clamp(28px, 4vw, 80px)", background: "rgba(7,7,7,0.45)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 50%, ${tint}18 0%, transparent 60%)`, pointerEvents: "none" }} />
            <VRFade>
              <div style={{ position: "relative", textAlign: "center", maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.32em", color: AMBER, textTransform: "uppercase", marginBottom: 22 }}>
                  &#10022; Reader&apos;s Notes &#10022;
                </div>
                <blockquote style={{ fontFamily: F_DISPLAY, fontStyle: "italic", fontSize: "clamp(38px, 5vw, 72px)", lineHeight: 1.1, color: IVORY, letterSpacing: "-0.02em", margin: 0 }}>
                  &ldquo;Read it with the lights low. <span style={{ color: tint }}>Read it twice.</span> The second time, you&apos;ll notice the point was never the obvious one.&rdquo;
                </blockquote>
                <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.28em", color: "#7a7363", textTransform: "uppercase", marginTop: 32 }}>
                  &mdash; Anon, third reader · One of 2,140 reviewers
                </div>
              </div>
            </VRFade>
          </section>

          {/* Related */}
          <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px" }}>
            <VRRowHeader eyebrow="From the Amber room" title="If you liked this, try" meta="More from Visurena Stories" right="All stories &rarr;" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 36 }}>
              {related.map((s, i) => (
                <VRFade key={s.slug} delay={i * 60}>
                  <RelatedCard story={s} seed={i + 70} />
                </VRFade>
              ))}
            </div>
          </section>

          <VRNewsletter
            eyebrow="The Amber Room"
            headline={<>One story a week,<br /><em style={{ fontStyle: "italic", color: AMBER }}>in your inbox.</em></>}
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: VR_STORIES.map(s => ({ params: { slug: s.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = (params?.slug as string) ?? VR_STORIES[0].slug;
  return { props: { section: "stories", slug } };
};
