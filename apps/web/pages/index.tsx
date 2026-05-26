// pages/index.tsx — Home. Real content only: Stories (from the content folder) +
// Games (from content-config.json). Movies/Music are not real yet, so they're not
// shown here. Journal/Research live under /about now (moved off the homepage).

import React, { useRef, useEffect } from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  VRFade, VRTilt, VRPoster, VRStripe, VRRowHeader, VRMarquee, Header, Footer,
} from "@visurena/ui";
import { getStories, type Story } from "../lib/content";
import contentConfig from "../content-config.json";

// ─── Design constants ───────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const AMBER     = "#f5b831"; // Stories (Amber room)
const AMETHYST  = "#c084fc"; // Games (Amethyst room)

interface Game {
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  playUrl?: string;
  duration?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  releaseDate?: string;
}

interface HomeProps {
  section: "home"; // drives the Diamond hub theme + studio (all-jewel) nebula in _app
  stories: Story[];
  games: Game[];
}

// A normalized card the home rows can render regardless of kind.
interface Card {
  kind: "Story" | "Game";
  accent: string;
  href: string;
  title: string;
  image?: string;
  meta: string;
  blurb?: string;
}

function storyCard(s: Story): Card {
  return {
    kind: "Story",
    accent: s.accent || AMBER,
    href: `/stories/${s.slug}`,
    title: s.title,
    image: s.cover34,
    meta: [s.genre, s.readMinutes ? `${s.readMinutes} min` : null].filter(Boolean).join(" · "),
    blurb: s.summary,
  };
}
function gameCard(g: Game): Card {
  return {
    kind: "Game",
    accent: AMETHYST,
    href: g.playUrl || `/games/${g.slug}`,
    title: g.title,
    image: g.thumbnail,
    meta: [g.duration, g.tags?.[0]].filter(Boolean).join(" · "),
    blurb: g.description,
  };
}

// ─── Hero (the latest story) ─────────────────────────────────────
function HomeHero({ story }: { story?: Story }) {
  const tint = story?.accent || AMBER;
  const bg = story?.cover169 || story?.cover34 || "";
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
        if (bgRef.current)    bgRef.current.style.transform    = `translate3d(${-x * 28}px, ${-y * 28}px, 0)`;
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

  const title = story?.title ?? "Visurena";
  const head = title.split(" ").slice(0, -1).join(" ");
  const tail = title.split(" ").slice(-1).join(" ");
  const meta = story
    ? ["A Visurena Original", story.genre, story.readMinutes ? `${story.readMinutes} min read` : null].filter(Boolean).join(" — ")
    : "Stories & games, made in the open";

  return (
    <section data-vr-hero ref={heroRef} style={{ position: "relative", height: "88vh", minHeight: 720, maxHeight: 1000, overflow: "hidden", isolation: "isolate" }}>
      <div ref={bgRef} style={{ position: "absolute", inset: "-8%", willChange: "transform" }}>
        <div className="vr-hero-zoom" style={{
          width: "100%", height: "100%",
          background: bg ? `url("${bg}") center 28% / cover no-repeat` : `radial-gradient(ellipse at 70% 35%, ${tint}55 0%, #0a0a0a 70%)`,
        }} />
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.0) 18%, rgba(10,10,10,0.0) 42%, rgba(10,10,10,0.85) 88%, rgba(10,10,10,1) 100%), linear-gradient(90deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.18) 38%, rgba(10,10,10,0.0) 65%, rgba(10,10,10,0.3) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 78% 38%, ${tint}45 0%, transparent 55%)`, mixBlendMode: "screen", opacity: 0.6 }} />

      <VRFade style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", top: 120, display: "flex", alignItems: "center", gap: 14, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#cdc6b6", flexWrap: "wrap" }}>
        <span style={{ color: AMBER, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, background: AMBER, borderRadius: "50%", display: "inline-block", boxShadow: `0 0 12px ${AMBER}` }} />
          {story ? "This week's lead · Stories" : "Visurena"}
        </span>
        <VRStripe color="#5a5345" width={48} />
        <span>{meta}</span>
      </VRFade>

      <div ref={titleRef} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", right: "clamp(28px, 4vw, 80px)", bottom: 170, maxWidth: 1100, willChange: "transform" }}>
        <VRFade delay={80}>
          <h1 className="vr-halo" style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 8vw, 132px)", lineHeight: 0.94, margin: 0, letterSpacing: "-0.03em", color: IVORY }}>
            {head}{head ? <br /> : null}<em style={{ fontStyle: "italic", color: tint, textShadow: `0 4px 40px ${tint}80` }}>{tail}</em>
          </h1>
          {story?.summary && (
            <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 620, marginTop: 24, marginBottom: 0 }}>
              {story.summary}
            </p>
          )}
        </VRFade>
      </div>

      {story && (
        <VRFade delay={140} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", bottom: 64, display: "flex", gap: 14 }}>
          <Link href={`/stories/${story.slug}`} className="vr-cta vr-cta-solid vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", background: IVORY, color: "#0a0a0a", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset" }}>
            <span style={{ width: 0, height: 0, borderLeft: "9px solid #0a0a0a", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }} />
            Read it
          </Link>
          <Link href="/stories" className="vr-cta vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", border: "1px solid rgba(255,255,255,0.22)", color: IVORY, fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", background: "rgba(20,18,16,0.4)", backdropFilter: "blur(10px)", textDecoration: "none" }}>
            All stories
          </Link>
        </VRFade>
      )}
    </section>
  );
}

// ─── New this week (real stories + games) ────────────────────────
function HomeNewThisWeek({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;
  return (
    <section style={{ padding: "64px clamp(28px, 4vw, 80px) 56px" }}>
      <VRRowHeader eyebrow="Across the studio" title="New this week" meta="Fresh stories and games" right="See all →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18, marginTop: 32 }}>
        {cards.map((c, i) => (
          <VRFade key={c.kind + c.href} delay={i * 50}>
            <Link href={c.href} className="vr-card vr-sheen vr-link" style={{ display: "block", textDecoration: "none" }}>
              <article style={{ position: "relative" }} className="vr-elevated-soft">
                <VRPoster seed={i + 10} accent={c.accent} tint={c.accent} image={c.image} style={{ width: "100%", aspectRatio: "3/4", marginBottom: 14 }}>
                  <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.2em", color: c.accent, textTransform: "uppercase" }}>&#9679; {c.kind}</span>
                      <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>NEW</span>
                    </div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: 22, lineHeight: 1.0, color: IVORY, letterSpacing: "-0.01em" }}>{c.title}</div>
                  </div>
                  {c.blurb && (
                    <div className="vr-card-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
                      <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#cdc6b6", textTransform: "uppercase", marginBottom: 6 }}>{c.meta}</div>
                      <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 12, lineHeight: 1.35, color: "#cdc6b6", margin: 0 }}>{c.blurb}</p>
                    </div>
                  )}
                </VRPoster>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
                  <span>{c.meta}</span><span>{c.kind}</span>
                </div>
              </article>
            </Link>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Trending (ranked, real) ─────────────────────────────────────
function HomeTrending({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;
  return (
    <section style={{ padding: "56px clamp(28px, 4vw, 80px) 72px", background: "rgba(8,8,8,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <VRRowHeader eyebrow="Reader charts" title="Trending across the studio" meta="Ranked newest-first until live stats land" right="Full chart →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 44 }}>
        {cards.slice(0, 6).map((c, i) => (
          <VRFade key={c.kind + c.href} delay={i * 60}>
            <Link href={c.href} className="vr-card vr-link" style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "end", gap: 0, minWidth: 0, textDecoration: "none" }}>
              <div style={({ fontFamily: F_DISPLAY, fontSize: "clamp(110px, 9vw, 170px)", lineHeight: 0.78, color: "transparent", WebkitTextStroke: `1.2px ${c.accent}`, fontWeight: F_WEIGHT, marginRight: -8, marginBottom: -4, alignSelf: "end" }) as React.CSSProperties}>{i + 1}</div>
              <VRPoster seed={i + 50} accent={c.accent} tint={c.accent} image={c.image} style={{ width: "100%", aspectRatio: "3/4", minWidth: 0 }}>
                <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: c.accent, textTransform: "uppercase" }}>&#9679; {c.kind}</span>
                  <div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(14px, 1.2vw, 18px)", lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{c.title}</div>
                    {c.meta && <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", marginTop: 6, textTransform: "uppercase" }}>{c.meta}</div>}
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

// ─── Marquee (brand flourish) ────────────────────────────────────
function HomeMarquee() {
  const items = [
    { label: "Stories", stone: "Amber", color: AMBER },
    { label: "Games", stone: "Amethyst", color: AMETHYST },
  ];
  return (
    <section style={{ padding: "44px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,7,0.45)", overflow: "hidden" }}>
      <VRMarquee speed={42} gap={64}>
        {items.map((s) => (
          <React.Fragment key={s.label}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily: F_DISPLAY, fontSize: "clamp(48px, 6vw, 84px)", fontWeight: F_WEIGHT, letterSpacing: "-0.02em", color: IVORY }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: s.color, boxShadow: `0 0 24px ${s.color}` }} />
              {s.label}
              <span style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: "clamp(20px, 2.4vw, 32px)", color: s.color }}>{s.stone}</span>
            </span>
            <span style={{ fontFamily: F_DISPLAY, fontStyle: "italic", color: "#3a3528", fontSize: "clamp(48px, 6vw, 84px)" }}>&#183;</span>
          </React.Fragment>
        ))}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily: F_DISPLAY, fontSize: "clamp(48px, 6vw, 84px)", fontWeight: F_WEIGHT, letterSpacing: "-0.02em", color: "#5a5345", fontStyle: "italic" }}>&#10022; Visurena &#10022;</span>
        <span style={{ fontFamily: F_DISPLAY, fontStyle: "italic", color: "#3a3528", fontSize: "clamp(48px, 6vw, 84px)" }}>&#183;</span>
      </VRMarquee>
    </section>
  );
}

// ─── Spotlights (the two live rooms) ─────────────────────────────
function HomeSpotlights({ storyCount, gameCount }: { storyCount: number; gameCount: number }) {
  const tiles = [
    { slug: "stories", label: "Stories", stone: "Amber",    color: AMBER,    tag: "Read", count: `${storyCount} ${storyCount === 1 ? "story" : "stories"} live` },
    { slug: "games",   label: "Games",   stone: "Amethyst", color: AMETHYST, tag: "Play", count: `${gameCount} ${gameCount === 1 ? "game" : "games"} to play` },
  ];
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px" }}>
      <VRRowHeader eyebrow="One studio · two rooms live" title="What we make" meta="Stories and games now. Film and music, slowly — by Visurena." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18, marginTop: 36 }}>
        {tiles.map((t, i) => (
          <VRFade key={t.slug} delay={i * 60}>
            <VRTilt>
              <Link href={`/${t.slug}`} className="vr-link vr-shelf-tile vr-elevated" style={{ position: "relative", display: "block", aspectRatio: "16/9", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                <VRPoster seed={i + 200} accent={t.color} tint={t.color} style={{ position: "absolute", inset: 0 }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 25%, ${t.color}30 0%, transparent 60%)` }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.88) 100%)" }} />
                </VRPoster>
                <div style={{ position: "absolute", inset: 0, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: t.color, textTransform: "uppercase", marginBottom: 10 }}>&#9679; {t.tag} &middot; {t.stone} stone</div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(48px, 5vw, 80px)", lineHeight: 0.9, color: IVORY, letterSpacing: "-0.025em", fontWeight: F_WEIGHT }}>{t.label}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 15, color: "#cdc6b6", margin: 0 }}>{t.count}</p>
                    <span style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.22em", color: IVORY, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${t.color}` }}>Enter &rarr;</span>
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

// ─── Newsletter (signup form hidden until wired — see TODO) ──────
function HomeNewsletter() {
  return (
    <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,5,0.4)" }}>
      <VRFade>
        <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.3em", color: IVORY, textTransform: "uppercase", marginBottom: 22 }}>&#10022; The Monday Post &#10022;</div>
        <h2 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.95, color: IVORY, letterSpacing: "-0.025em", margin: 0, maxWidth: 1000, marginInline: "auto" }}>
          New work in your inbox,<br />
          <em style={{ fontStyle: "italic", color: IVORY, textShadow: "0 0 28px rgba(245,239,219,0.45)" }}>every Monday morning.</em>
        </h2>
        <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 20, color: "#a8a18d", marginTop: 28, maxWidth: 640, marginInline: "auto" }}>
          One short story and one game we made that week. No tracking, no ads. Free during open beta.
        </p>
        {/*
          TODO(future): real newsletter signup — FORM HIDDEN until it works. It only
          preventDefault()'d and discarded the email (no list/storage/capture endpoint).
          Restore the <form> below and wire it to a real subscribe API (success/error states).

          <form style={{ display: "inline-flex", gap: 0, marginTop: 44, alignItems: "stretch", width: "min(560px, 100%)" }} onSubmit={e => e.preventDefault()}>
            <input placeholder="your@email" style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.22)", borderRight: "none", padding: "16px 22px", color: IVORY, fontFamily: F_BODY, fontSize: 16, outline: "none" }} />
            <button className="vr-cta" type="submit" style={{ background: IVORY, color: "#0a0a0a", border: `1px solid ${IVORY}`, padding: "16px 28px", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Subscribe</button>
          </form>
        */}
      </VRFade>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function Home({ stories = [], games = [] }: Partial<HomeProps>) {
  const featured = stories[0];
  const storyCards = stories.map(storyCard);
  const gameCards = games.map(gameCard);
  // "New this week" = the newest few across both kinds (stories lead, then games).
  const newCards = [...storyCards.slice(0, 4), ...gameCards.slice(0, 4)].slice(0, 8);
  // Trending = stories (newest) then top games.
  const trendingCards = [...storyCards, ...gameCards].slice(0, 6);

  return (
    <>
      <Head><title>{"Visurena — A demand-driven AI content studio"}</title></Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <HomeHero story={featured} />
          <HomeNewThisWeek cards={newCards} />
          <HomeTrending cards={trendingCards} />
          <HomeMarquee />
          <HomeSpotlights storyCount={stories.length} gameCount={games.length} />
          <HomeNewsletter />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const stories = getStories();
  const games = ((contentConfig as { games?: Game[] }).games ?? []) as Game[];
  return { props: JSON.parse(JSON.stringify({ section: "home", stories, games })) };
};
