// pages/stories/[slug].tsx — Single story: continuous reader (Amber room)
//
// Shorts read in one sitting: hero → slim info bar → the full prose, with the
// generated scenes rendered as quiet section breaks. Data comes from the local
// content provider (lib/content.ts); nothing here is hardcoded.

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import { VRFade, VRStripe, Header, Footer } from "@visurena/ui";
import { VRNewsletter } from "../../components/VRNewsletter";
import { getStories, getStory, type Story, type StoryScene } from "../../lib/content";

// ─── Design constants ───────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const AMBER     = "#f5b831";

interface StoryProps {
  story: Story & { scenes: StoryScene[] };
  related: Story[];
}

function paragraphs(prose: string): string[] {
  return prose.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

// ─── Hero ────────────────────────────────────────────────────────
function StoryHero({ story }: { story: StoryProps["story"] }) {
  const tint = story.accent || AMBER;
  const bg = story.cover169 || story.cover34 || "";
  const heroRef  = useRef<HTMLElement>(null);
  const bgRef    = useRef<HTMLDivElement>(null);
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
        if (bgRef.current)    bgRef.current.style.transform    = `translate3d(${-x * 26}px, ${-y * 26}px, 0)`;
        if (titleRef.current) titleRef.current.style.transform = `translate3d(${-x * 12}px, ${-y * 12}px, 0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      [bgRef, titleRef].forEach((ref) => { if (ref.current) ref.current.style.transform = ""; });
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); hero.removeEventListener("mousemove", onMove); hero.removeEventListener("mouseleave", onLeave); };
  }, []);

  const head = story.title.split(" ").slice(0, -1).join(" ");
  const tail = story.title.split(" ").slice(-1).join(" ");
  const meta = [story.genre, story.readMinutes ? `${story.readMinutes} min read` : null]
    .filter(Boolean).join(" · ");

  return (
    <section ref={heroRef} style={{ position: "relative", height: "86vh", minHeight: 680, maxHeight: 980, overflow: "hidden", isolation: "isolate" }}>
      <div ref={bgRef} style={{ position: "absolute", inset: "-8%", willChange: "transform" }}>
        <div className="vr-hero-zoom" style={{
          width: "100%", height: "100%",
          background: bg
            ? `url("${bg}") center 30% / cover no-repeat`
            : `radial-gradient(ellipse at 70% 35%, ${tint}55 0%, #0a0a0a 70%)`,
        }} />
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.0) 20%, rgba(10,10,10,0.0) 42%, rgba(10,10,10,0.88) 88%, rgba(10,10,10,1) 100%), linear-gradient(90deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.16) 40%, rgba(10,10,10,0.0) 70%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 78% 40%, ${tint}45 0%, transparent 55%)`, mixBlendMode: "screen", opacity: 0.65 }} />

      <VRFade style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", top: 120, display: "flex", alignItems: "center", gap: 14, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#cdc6b6", flexWrap: "wrap" }}>
        <Link href="/stories" className="vr-link" style={{ color: AMBER, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, background: AMBER, borderRadius: "50%", boxShadow: `0 0 14px ${AMBER}` }} />
          Stories · The Amber room
        </Link>
        {meta && (<><VRStripe color="#5a5345" width={48} /><span>{meta}</span></>)}
      </VRFade>

      <div ref={titleRef} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", right: "clamp(28px, 4vw, 80px)", bottom: 150, maxWidth: 1000, willChange: "transform" }}>
        <VRFade delay={80}>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#a8a18d", textTransform: "uppercase", marginBottom: 16 }}>
            A Visurena Original
          </div>
          <h1 className="vr-halo" style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 9vw, 148px)", lineHeight: 0.94, margin: 0, letterSpacing: "-0.03em", color: IVORY }}>
            {head}{head ? <br /> : null}
            <em style={{ fontStyle: "italic", color: tint, textShadow: `0 4px 40px ${tint}80` }}>{tail}</em>
          </h1>
          {story.summary && (
            <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 700, marginTop: 30, marginBottom: 0 }}>
              {story.summary}
            </p>
          )}
        </VRFade>
      </div>
    </section>
  );
}

// ─── Reader rail: left-gutter scene ToC + progress + time-left ───
// Lives in the empty left margin so it never covers the prose. Fades in once the
// reader scrolls into view; collapses to dots (then hides) on narrow screens.
function ReaderRail({ story }: { story: StoryProps["story"] }) {
  const accent = story.accent || AMBER;
  const total = story.readMinutes ?? 0;
  const scenes = story.scenes;
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [w, setW] = useState(1280);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const reader = document.getElementById("read");
    if (!reader) return;
    const els = Array.from(reader.querySelectorAll<HTMLElement>("[data-scene-index]"));
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setW(window.innerWidth);
        const vh = window.innerHeight;
        const rTop = reader.getBoundingClientRect().top + window.scrollY;
        const denom = Math.max(1, reader.offsetHeight - vh);
        setProgress(Math.min(1, Math.max(0, (window.scrollY - rTop) / denom)));
        // Only show once the reader is in view — keeps it off the hero.
        setVisible(reader.getBoundingClientRect().top < vh * 0.6);
        const line = vh * 0.4; // a scene is "current" once its top passes ~40% of the viewport
        let idx = 0;
        for (let i = 0; i < els.length; i++) {
          if (els[i].getBoundingClientRect().top <= line) idx = i;
        }
        setActive(idx);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Portal target is document.body — only available after mount.
  useEffect(() => setMounted(true), []);

  if (w < 720) return null; // too narrow for a gutter rail — reading is full-width
  const labelled = w >= 1100;
  const left = total ? Math.max(0, Math.ceil(total * (1 - progress))) : 0;
  const jump = (i: number) => document.getElementById(`scene-${i}`)?.scrollIntoView({ behavior: "smooth" });

  const rail = (
    <nav
      aria-label="Scenes"
      style={{
        position: "fixed",
        left: labelled ? "max(24px, calc(50vw - 600px))" : 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        fontFamily: F_MONO,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 300ms ease",
      }}
    >
      {scenes.map((s, i) => {
        const state = i === active ? "active" : i < active ? "done" : "todo";
        return (
          <button
            key={i}
            onClick={() => jump(i)}
            title={`${i + 1}. ${s.title || `Scene ${i + 1}`}`}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative", padding: "0 0 22px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            {i < scenes.length - 1 && (
              <span style={{ position: "absolute", left: 5, top: 14, bottom: -8, width: 2, background: "rgba(255,255,255,0.10)" }}>
                <span style={{ position: "absolute", left: 0, top: 0, width: "100%", height: i < active ? "100%" : "0%", background: accent, transition: "height 300ms ease" }} />
              </span>
            )}
            <span style={{
              width: 12, height: 12, borderRadius: "50%", flex: "none", marginTop: 1, transition: "all 250ms ease",
              border: state === "todo" ? "1px solid #7a7363" : "none",
              background: state === "active" ? accent : state === "done" ? `${accent}80` : "transparent",
              boxShadow: state === "active" ? `0 0 14px ${accent}` : "none",
              transform: state === "active" ? "scale(1.15)" : "scale(1)",
            }} />
            {labelled && (
              <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", maxWidth: 160, lineHeight: 1.4, color: state === "active" ? IVORY : "#7a7363", transition: "color 250ms ease" }}>
                {i + 1} · {s.title || `Scene ${i + 1}`}
              </span>
            )}
          </button>
        );
      })}
      {total > 0 && (
        <div style={{ marginTop: 24, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7a7363" }}>
          {labelled ? `~${left} min left` : `${left}m`}
        </div>
      )}
    </nav>
  );

  return mounted ? createPortal(rail, document.body) : null;
}

// ─── Reader ──────────────────────────────────────────────────────
function StoryReader({ story }: { story: StoryProps["story"] }) {
  const tint = story.accent || AMBER;
  return (
    <section id="read" style={{ padding: "96px clamp(28px, 4vw, 80px) 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {story.scenes.map((scene, si) => (
          <div key={si} id={`scene-${si}`} data-scene-index={si} style={{ scrollMarginTop: 90 }}>
            {si > 0 && (
              <div aria-hidden style={{ textAlign: "center", color: tint, fontFamily: F_DISPLAY, fontSize: 22, letterSpacing: "0.5em", margin: "44px 0 40px", opacity: 0.8 }}>
                ✦
              </div>
            )}
            {paragraphs(scene.prose).map((p, pi) => (
              <p key={pi} className="vr-prose-p" style={{
                fontFamily: F_BODY, fontSize: 20, lineHeight: 1.75,
                color: "#e6e1d2", margin: "0 0 1.35em",
              }}>
                {p}
              </p>
            ))}
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 56, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.34em", color: "#5a5345", textTransform: "uppercase" }}>
          ✦ End ✦
        </div>
      </div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────
function StoryAbout({ story }: { story: StoryProps["story"] }) {
  const rows = [
    story.genre ? { lbl: "Genre", val: story.genre } : null,
    story.readMinutes ? { lbl: "Length", val: `${story.readMinutes} min · ${story.wordCount ? story.wordCount.toLocaleString() + " words" : "short story"}` } : null,
    { lbl: "Published", val: story.createdAt.slice(0, 10) },
  ].filter(Boolean) as { lbl: string; val: string }[];

  return (
    <section style={{ padding: "72px clamp(28px, 4vw, 80px)", background: "rgba(7,7,7,0.45)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 18 }}>About this story</div>
        {rows.map((r) => (
          <div key={r.lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#7a7363", textTransform: "uppercase" }}>{r.lbl}</span>
            <span style={{ fontFamily: F_BODY, fontSize: 15, color: IVORY }}>{r.val}</span>
          </div>
        ))}
        {story.tags && story.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
            {story.tags.map((t) => (
              <span key={t} style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#a8a18d", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.14)", padding: "6px 12px" }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Related ─────────────────────────────────────────────────────
function RelatedCard({ story }: { story: Story }) {
  const tint = story.accent || AMBER;
  return (
    <Link href={`/stories/${story.slug}`} className="vr-card vr-sheen vr-link" style={{ display: "block", textDecoration: "none" }}>
      <div style={{
        width: "100%", aspectRatio: "3/4", marginBottom: 14, position: "relative", overflow: "hidden",
        background: story.cover34 ? `url("${story.cover34}") center/cover no-repeat` : `radial-gradient(ellipse at 40% 30%, ${tint}55 0%, #14110f 75%)`,
        border: "1px solid rgba(255,255,255,0.08)",
      }} />
      {story.genre && <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.22em", color: "#7a7363", textTransform: "uppercase", marginBottom: 6 }}>{story.genre}</div>}
      <div style={{ fontFamily: F_DISPLAY, fontSize: 22, color: IVORY, letterSpacing: "-0.01em" }}>{story.title}</div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function StoryPage({ story, related }: StoryProps) {
  return (
    <>
      <Head>
        <title>{`${story.title} — Visurena Stories`}</title>
        {story.summary && <meta name="description" content={story.summary} />}
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <StoryHero story={story} />
          <ReaderRail story={story} />
          <StoryReader story={story} />
          <StoryAbout story={story} />

          {related.length > 0 && (
            <section style={{ padding: "72px clamp(28px, 4vw, 80px)" }}>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMBER, textTransform: "uppercase", marginBottom: 28 }}>From the Amber room · More stories</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
                {related.map((s, i) => (
                  <VRFade key={s.slug} delay={i * 60}><RelatedCard story={s} /></VRFade>
                ))}
              </div>
            </section>
          )}

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
  paths: getStories().map((s) => ({ params: { slug: s.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<StoryProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const story = getStory(slug);
  if (!story) return { notFound: true };

  const related = getStories()
    .filter((s) => s.slug !== slug && (!story.genre || s.genre === story.genre))
    .slice(0, 4);

  // JSON round-trip strips `undefined` (Next requires serializable props).
  return { props: JSON.parse(JSON.stringify({ story, related })) };
};
