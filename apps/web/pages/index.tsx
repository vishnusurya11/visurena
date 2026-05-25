import React, { useRef, useEffect } from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  VRFade, VRTilt, VRPoster, VRStripe, VRRowHeader,
  VRCounter, VRMarquee, VRSplitText, VRShaderBg,
  Header, Footer,
} from "@visurena/ui";

// ─── Design constants ───────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";

const VR_SECTIONS = [
  { id: "stories", slug: "stories", label: "Stories", stone: "Amber",    color: "#f5b831" },
  { id: "movies",  slug: "movies",  label: "Movies",  stone: "Emerald",  color: "#00d97e" },
  { id: "music",   slug: "music",   label: "Music",   stone: "Ruby",     color: "#e91e63" },
  { id: "games",   slug: "games",   label: "Games",   stone: "Amethyst", color: "#c084fc" },
];

// ─── Content data (will be replaced by CMS later) ───────────────
const VR_STORIES_LATEST = [
  { slug: "lantern-mile",       title: "The Lantern Mile",   genre: "Horror",   chapters: 9,  runtime: "42 min", date: "May 18", featured: true,  image: "https://picsum.photos/seed/lantern-mile/900/1200",       tint: "#7c8fa8", blurb: "A trucker drives an Iowa highway where every fifth mile, the lights forget him." },
  { slug: "bone-tide",          title: "Bone Tide",          genre: "Mystery",  chapters: 12, runtime: "1h 06",  date: "May 14", featured: false, image: "https://picsum.photos/seed/bone-tide/900/1200",          tint: "#6e8b86", blurb: "Eight bodies wash up on a Maine island that has no shore." },
  { slug: "below-the-concrete", title: "Below the Concrete", genre: "Thriller", chapters: 7,  runtime: "38 min", date: "May 11", featured: false, image: "https://picsum.photos/seed/below-the-concrete/900/1200", tint: "#a45d3f", blurb: "She bought the building cheap. Two floors below the lobby, somebody's been waiting." },
  { slug: "saltwater-saints",   title: "Saltwater Saints",   genre: "Horror",   chapters: 15, runtime: "1h 22",  date: "May 09", featured: false, image: "https://picsum.photos/seed/saltwater-saints/900/1200",   tint: "#5d7ea0", blurb: "The fishermen of Esperanza Bay haven't aged since 1962. The tourists do." },
  { slug: "eight-rooms",        title: "Eight Rooms",        genre: "Mystery",  chapters: 8,  runtime: "44 min", date: "May 03", featured: false, image: "https://picsum.photos/seed/eight-rooms/900/1200",        tint: "#9a7e54", blurb: "A locked-room novella set inside a house that has seven." },
  { slug: "hour-of-dogs",       title: "Hour of Dogs",       genre: "Thriller", chapters: 11, runtime: "59 min", date: "Apr 28", featured: false, image: "https://picsum.photos/seed/hour-of-dogs/900/1200",       tint: "#a85a55", blurb: "The hour between dogs and wolves — when neither knows which one it is." },
];

const VR_STORIES_TRENDING = [
  { slug: "pomegranate-house", title: "Pomegranate House", genre: "Horror",   reads: "84.2k", tint: "#a64a52", image: "https://picsum.photos/seed/pomegranate-house/600/800" },
  { slug: "the-velvetine",     title: "The Velvetine",     genre: "Mystery",  reads: "61.8k", tint: "#7a5a99", image: "https://picsum.photos/seed/the-velvetine/600/800" },
  { slug: "hush-maeve",        title: "Hush, Maeve",       genre: "Thriller", reads: "52.1k", tint: "#8a7660", image: "https://picsum.photos/seed/hush-maeve/600/800" },
  { slug: "cathedrals-late",   title: "Cathedrals, Late",  genre: "Horror",   reads: "47.6k", tint: "#536a85", image: "https://picsum.photos/seed/cathedrals-late/600/800" },
  { slug: "lighthouse-19",     title: "Lighthouse 19",     genre: "Mystery",  reads: "41.3k", tint: "#5e8073", image: "https://picsum.photos/seed/lighthouse-19/600/800" },
  { slug: "the-glass-brother", title: "The Glass Brother", genre: "Thriller", reads: "38.9k", tint: "#947256", image: "https://picsum.photos/seed/the-glass-brother/600/800" },
];

const VR_CONTINUE = [
  { title: "Saltwater Saints", slug: "saltwater-saints", chapter: "Chapter 6 of 15", progress: 0.41, left: "48 min left", kind: "Story",  slot: "amber",   seed: 30 },
  { title: "Late Cathedrals",  slug: "late-cathedrals",  chapter: "Track 4 of 12 · listened earlier", progress: 0.33, left: "27 min left", kind: "Music", slot: "ruby",  seed: 31 },
  { title: "Hour of Dogs",     slug: "hour-of-dogs",     chapter: "Chapter 9 of 11", progress: 0.82, left: "11 min left", kind: "Story",  slot: "amber",   seed: 32 },
];

const VR_MOVIES = [
  { slug: "aurelia",       title: "Aurelia",        year: "Q3 2026",     form: "Feature film · 94 min", state: "In post-production", tint: "#b8634a", featured: true,  image: "https://picsum.photos/seed/aurelia-film/900/1200",      log: "A wedding photographer realizes she's been photographing the same guest at every wedding for ten years.", slot: "emerald" },
  { slug: "the-blue-hour", title: "The Blue Hour",  year: "Winter 2026", form: "Feature · 102 min",     state: "Shooting",           tint: "#4a6885", featured: false, image: "https://picsum.photos/seed/blue-hour-film/900/1200",    log: "A grief counsellor accepts a client who has been dead for fourteen years.", slot: "emerald" },
];

const VR_MUSIC = [
  { slug: "late-cathedrals", title: "Late Cathedrals", year: "Aug 2026", form: "12-track album", state: "Mastering", tint: "#4a8a72", featured: true, image: "https://picsum.photos/seed/late-cathedrals/900/900", log: "A slow album scored entirely for empty rooms.", slot: "ruby" },
  { slug: "marrow-songs",    title: "Marrow Songs",    year: "Oct 2026", form: "EP · 5 tracks",  state: "Recording", tint: "#3e7864", featured: false, image: "https://picsum.photos/seed/marrow-songs/900/900",    log: "Five lullabies for adults, scored for cello and ground-floor radiators.", slot: "ruby" },
];

const VR_GAMES = [
  { slug: "velvetine",    title: "Velvetine",    year: "Winter 2026", form: "Narrative thriller · PC / console", state: "Vertical slice", tint: "#7a5a99", featured: true,  image: "https://picsum.photos/seed/velvetine-game/1200/900",   log: "A detective game played by interviewing five people in a house, none of whom believe a crime occurred.", slot: "violet" },
  { slug: "ground-floor", title: "Ground Floor", year: "2027",        form: "Walking sim · PC",                  state: "Concept",        tint: "#8a6bbf", featured: false, image: "https://picsum.photos/seed/ground-floor-game/1200/900", log: "You manage a haunted hotel.", slot: "violet" },
];

const VR_RESEARCH = [
  { slug: "alone-with-twelve",  title: "Why I'm building Visurena alone (with twelve AI coworkers)", date: "May 21, 2026", tag: "Essay",        read: "11 min", sub: "A practical account of what it's like to run a studio by yourself when 'yourself' is twelve models in a trench coat." },
  { slug: "writing-with-llm",   title: "Notes on writing horror with a language model",              date: "May 09, 2026", tag: "Research",     read: "7 min",  sub: "What the model knows about fear, and what it learned from me." },
  { slug: "music-2026",         title: "Music generation in 2026 — what's actually usable",          date: "Apr 22, 2026", tag: "Field report", read: "14 min", sub: "Suno is finally usable. Not for albums — for cues. An honest write-up." },
];

function slotColor(slot: string): string {
  const map: Record<string, string> = { amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e", violet: "#c084fc", ivory: "#f5efdb" };
  return map[slot] ?? "#f5efdb";
}

// ─── Hero ────────────────────────────────────────────────────────
function VRHomeHero() {
  const featured = VR_STORIES_LATEST.find(s => s.featured) ?? VR_STORIES_LATEST[0];
  const sectionColor = "#f5b831"; // amber
  const tint = featured.tint;

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
        if (bgRef.current)    bgRef.current.style.transform    = `translate3d(${-x * 32}px, ${-y * 32}px, 0)`;
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

  return (
    <section data-vr-hero ref={heroRef} style={{ position: "relative", height: "88vh", minHeight: 720, maxHeight: 1000, overflow: "hidden", isolation: "isolate" }}>
      <div ref={bgRef} style={{ position: "absolute", inset: "-8%", willChange: "transform" }}>
        <div className="vr-hero-zoom" style={{ width: "100%", height: "100%", backgroundImage: `url("${featured.image}")`, backgroundSize: "cover", backgroundPosition: "center 28%", backgroundRepeat: "no-repeat" }} />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "screen", pointerEvents: "none" }}>
        <VRShaderBg colors={["#f5b831", "#e91e63", "#00d97e", "#c084fc"]} />
      </div>

      <div ref={glowRef} style={{ position: "absolute", inset: "-10%", willChange: "transform", pointerEvents: "none" }}>
        <div style={{ position: "absolute", right: "8%", top: "14%", width: "60%", height: "72%", background: `radial-gradient(ellipse at center, ${tint}55 0%, ${tint}10 35%, transparent 65%)`, filter: "blur(20px)" }} />
        <div style={{ position: "absolute", left: "-6%", bottom: "-10%", width: "62%", height: "60%", background: `radial-gradient(ellipse at center, ${sectionColor}28 0%, transparent 65%)`, filter: "blur(30px)" }} />
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.0) 18%, rgba(10,10,10,0.0) 42%, rgba(10,10,10,0.85) 88%, rgba(10,10,10,1) 100%), linear-gradient(90deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.18) 38%, rgba(10,10,10,0.0) 65%, rgba(10,10,10,0.3) 100%)` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 78% 38%, ${tint}45 0%, transparent 55%)`, mixBlendMode: "screen", opacity: 0.6 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 -120px 200px 0 rgba(0,0,0,0.55), inset 0 0 280px 60px rgba(0,0,0,0.55)" }} />

      <VRFade style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", top: 120, display: "flex", alignItems: "center", gap: 14, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#cdc6b6", flexWrap: "wrap" }}>
        <span style={{ color: sectionColor, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, background: sectionColor, borderRadius: "50%", display: "inline-block" }} />
          From the Amber room · Stories
        </span>
        <VRStripe color="#5a5345" width={48} />
        <span>Visurena Original — Horror — 9 chapters — 42 min</span>
      </VRFade>

      <div ref={titleRef} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", right: "clamp(28px, 4vw, 80px)", bottom: 170, maxWidth: 1100, willChange: "transform" }}>
        <VRFade delay={80}>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#a8a18d", textTransform: "uppercase", marginBottom: 14 }}>
            This week&apos;s lead · Issue N&ordm; 014
          </div>
          <h1 className="vr-halo" style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 8vw, 124px)", lineHeight: 0.95, margin: 0, letterSpacing: "-0.025em", color: IVORY }}>
            <VRSplitText stagger={28}>The Lantern</VRSplitText>{" "}
            <em style={{ fontStyle: "italic", color: sectionColor }}><VRSplitText stagger={28}>Mile</VRSplitText></em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 600, marginTop: 24, marginBottom: 0 }}>
            {featured.blurb}
          </p>
        </VRFade>
      </div>

      <VRFade delay={140} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", bottom: 64, display: "flex", gap: 14 }}>
        <Link href={`/stories/${featured.slug}`} className="vr-cta vr-cta-solid vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", background: IVORY, color: "#0a0a0a", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset" }}>
          <span style={{ width: 0, height: 0, borderLeft: "9px solid #0a0a0a", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }} />
          Read Chapter One
        </Link>
        <button className="vr-cta vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", border: "1px solid rgba(255,255,255,0.22)", color: IVORY, fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", background: "rgba(20,18,16,0.4)", backdropFilter: "blur(10px)", cursor: "pointer" }}>&thinsp;&#43; Save for later</button>
      </VRFade>

      <VRFade delay={200} style={{ position: "absolute", right: "clamp(28px, 4vw, 80px)", bottom: 64, display: "flex", alignItems: "center", gap: 18, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#7a7363", textTransform: "uppercase" }}>
        <span>Today&apos;s lead &middot; 01 &#8260; 05</span>
        <div style={{ display: "flex", gap: 8 }}>
          {VR_SECTIONS.map((s, i) => (
            <span key={s.id} style={{ width: i === 0 ? 32 : 8, height: 2, background: i === 0 ? s.color : "rgba(255,255,255,0.25)", transition: "background 320ms ease" }} />
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── Stats ───────────────────────────────────────────────────────
function VRHomeStats() {
  return (
    <section style={{ padding: "56px clamp(28px, 4vw, 80px)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,8,0.5)" }}>
      <VRFade style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr", gap: 64, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 48, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase" }}>
          {([
            { n: 14,  suffix: "",    label: "Stories published" },
            { n: 32,  suffix: "k+",  label: "Weekly readers" },
            { n: 8,   suffix: "",    label: "Languages" },
            { staticVal: "MMXXVI",   label: "Founded" },
          ] as Array<{ n?: number; suffix?: string; staticVal?: string; label: string }>).map(({ n, suffix, staticVal, label }) => (
            <div key={label}>
              <div style={{ fontFamily: F_DISPLAY, fontSize: 42, lineHeight: 1, color: IVORY, letterSpacing: "-0.02em", marginBottom: 8, fontWeight: F_WEIGHT }}>
                {staticVal ? staticVal : (<><VRCounter value={n!} duration={1600} format={(v: number) => String(Math.round(v))} />{suffix}</>)}
              </div>
              <div>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, paddingLeft: 48, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { q: "Read it with the lights low. The second time, you’ll notice the lantern was never the point.", who: "Anon, third reader" },
            { q: "The first thing I’ve read in years that asked for my attention and earned it back.", who: "R. — Lisbon" },
          ].map((r, i) => (
            <div key={i}>
              <div style={{ fontFamily: F_DISPLAY, fontStyle: "italic", fontSize: 42, lineHeight: 0.8, color: "#f5b831", marginBottom: -6 }}>&ldquo;</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 16, lineHeight: 1.45, color: "#cdc6b6", margin: 0 }}>{r.q}</p>
              <div style={{ marginTop: 14, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#7a7363", textTransform: "uppercase" }}>&mdash; {r.who}</div>
            </div>
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── Continue ────────────────────────────────────────────────────
function VRHomeContinue() {
  const items = VR_CONTINUE.map(c => {
    const story = VR_STORIES_LATEST.find(s => s.slug === c.slug);
    const music = VR_MUSIC.find(m => m.slug === c.slug);
    const item = story || music;
    return { ...c, tint: item?.tint, image: item?.image };
  });

  return (
    <section style={{ padding: "72px clamp(28px, 4vw, 80px) 48px" }}>
      <VRRowHeader eyebrow="Welcome back, Asha" title="Continue across Visurena" meta="3 things in progress" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 32 }}>
        {items.map((c, i) => {
          const ac = slotColor(c.slot);
          return (
            <VRFade key={i} delay={i * 80}>
              <Link href={c.kind === "Music" ? "/music" : `/stories/${c.slug}`} className="vr-card vr-sheen vr-link" style={{ textDecoration: "none", display: "block" }}>
                <div className="vr-elevated-soft" style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 22, alignItems: "center", padding: 18, background: "linear-gradient(180deg, #161412, #100e0c)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <VRPoster seed={c.seed} accent={ac} tint={c.tint} image={c.image} style={{ width: 120, height: 168 }}>
                    <div style={{ position: "absolute", inset: 0, padding: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{ fontFamily: F_DISPLAY, fontSize: 16, lineHeight: 1.0, color: IVORY }}>{c.title}</div>
                    </div>
                  </VRPoster>
                  <div>
                    <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: ac, textTransform: "uppercase", marginBottom: 8 }}>&#9654; Resume &middot; {c.kind}</div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: 26, lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{c.title}</div>
                    <div style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 14, color: "#a8a18d", marginTop: 6 }}>{c.chapter}</div>
                    <div style={{ marginTop: 18, height: 2, background: "rgba(255,255,255,0.08)", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${c.progress * 100}%`, background: ac }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
                      <span>{Math.round(c.progress * 100)}% in</span>
                      <span>{c.left}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </VRFade>
          );
        })}
      </div>
    </section>
  );
}

// ─── New across ──────────────────────────────────────────────────
function VRHomeNewAcross() {
  const items = [
    { kind: "Story",  slot: "amber",   href: `/stories/${VR_STORIES_LATEST[0].slug}`, title: VR_STORIES_LATEST[0].title, tint: VR_STORIES_LATEST[0].tint, image: VR_STORIES_LATEST[0].image, meta: `${VR_STORIES_LATEST[0].chapters} ch · ${VR_STORIES_LATEST[0].runtime}`, blurb: VR_STORIES_LATEST[0].blurb, date: VR_STORIES_LATEST[0].date, seed: 11 },
    { kind: "Movie",  slot: "emerald", href: "/movies",                               title: VR_MOVIES[1].title,          tint: VR_MOVIES[1].tint,          image: VR_MOVIES[1].image,          meta: VR_MOVIES[1].form,                                                        blurb: VR_MOVIES[1].log,            date: VR_MOVIES[1].year, seed: 12 },
    { kind: "Story",  slot: "amber",   href: `/stories/${VR_STORIES_LATEST[2].slug}`, title: VR_STORIES_LATEST[2].title, tint: VR_STORIES_LATEST[2].tint, image: VR_STORIES_LATEST[2].image, meta: `${VR_STORIES_LATEST[2].chapters} ch · ${VR_STORIES_LATEST[2].runtime}`, blurb: VR_STORIES_LATEST[2].blurb, date: VR_STORIES_LATEST[2].date, seed: 13 },
    { kind: "Music",  slot: "ruby",    href: "/music",                                title: VR_MUSIC[1].title,           tint: VR_MUSIC[1].tint,           image: VR_MUSIC[1].image,           meta: VR_MUSIC[1].form,                                                         blurb: VR_MUSIC[1].log,             date: VR_MUSIC[1].year,  seed: 14 },
    { kind: "Game",   slot: "violet",  href: "/games",                                title: VR_GAMES[0].title,           tint: VR_GAMES[0].tint,           image: VR_GAMES[0].image,           meta: VR_GAMES[0].form,                                                         blurb: VR_GAMES[0].log,             date: VR_GAMES[0].year,  seed: 15 },
    { kind: "Story",  slot: "amber",   href: `/stories/${VR_STORIES_LATEST[4].slug}`, title: VR_STORIES_LATEST[4].title, tint: VR_STORIES_LATEST[4].tint, image: VR_STORIES_LATEST[4].image, meta: `${VR_STORIES_LATEST[4].chapters} ch · ${VR_STORIES_LATEST[4].runtime}`, blurb: VR_STORIES_LATEST[4].blurb, date: VR_STORIES_LATEST[4].date, seed: 16 },
  ];

  return (
    <section style={{ padding: "44px clamp(28px, 4vw, 80px) 56px" }}>
      <VRRowHeader eyebrow="Across the studio" title="New this week" meta="A mix from every section · Published every Monday" right="See all →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18, marginTop: 32 }}>
        {items.map((c, i) => {
          const ac = slotColor(c.slot);
          return (
            <VRFade key={i} delay={i * 60}>
              <Link href={c.href} className="vr-card vr-sheen vr-link" style={{ display: "block", textDecoration: "none" }}>
                <article style={{ position: "relative" }} className="vr-elevated-soft">
                  <VRPoster seed={c.seed} accent={ac} tint={c.tint} image={c.image} style={{ width: "100%", aspectRatio: "3/4", marginBottom: 14 }}>
                    <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.2em", color: ac, textTransform: "uppercase" }}>&#9679; {c.kind}</span>
                        <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>NEW</span>
                      </div>
                      <div style={{ fontFamily: F_DISPLAY, fontSize: 22, lineHeight: 1.0, color: IVORY, letterSpacing: "-0.01em" }}>{c.title}</div>
                    </div>
                    <div className="vr-card-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
                      <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#cdc6b6", textTransform: "uppercase", marginBottom: 6 }}>{c.meta}</div>
                      <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 12, lineHeight: 1.35, color: "#cdc6b6", margin: 0 }}>{c.blurb}</p>
                    </div>
                  </VRPoster>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
                    <span>{c.meta}</span><span>{c.date}</span>
                  </div>
                </article>
              </Link>
            </VRFade>
          );
        })}
      </div>
    </section>
  );
}

// ─── Trending ────────────────────────────────────────────────────
function VRHomeTrending() {
  const items = [
    { ...VR_STORIES_TRENDING[0], kind: "Story",  slot: "amber",   href: `/stories/${VR_STORIES_TRENDING[0].slug}`, seed: 50 },
    { ...VR_STORIES_TRENDING[1], kind: "Story",  slot: "amber",   href: `/stories/${VR_STORIES_TRENDING[1].slug}`, seed: 51 },
    { title: VR_MUSIC[0].title,  kind: "Music",  slot: "ruby",    href: "/music",   seed: 52, tint: VR_MUSIC[0].tint,  image: VR_MUSIC[0].image,  reads: "29.4k plays" },
    { ...VR_STORIES_TRENDING[2], kind: "Story",  slot: "amber",   href: `/stories/${VR_STORIES_TRENDING[2].slug}`, seed: 53 },
    { title: VR_GAMES[0].title,  kind: "Game",   slot: "violet",  href: "/games",   seed: 54, tint: VR_GAMES[0].tint,  image: VR_GAMES[0].image,  reads: "18.2k waiting" },
    { title: VR_MOVIES[0].title, kind: "Movie",  slot: "emerald", href: "/movies",  seed: 55, tint: VR_MOVIES[0].tint, image: VR_MOVIES[0].image, reads: "12.6k saved" },
  ];

  return (
    <section style={{ padding: "56px clamp(28px, 4vw, 80px) 72px", background: "rgba(8,8,8,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <VRRowHeader eyebrow="Reader Charts" title="Trending across the studio" meta="Updated every Sunday · 03:00 UTC" right="Full chart →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18, marginTop: 44 }}>
        {items.map((s, i) => {
          const ac = slotColor(s.slot);
          return (
            <VRFade key={i} delay={i * 60}>
              <Link href={s.href} className="vr-card vr-link" style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "end", gap: 0, minWidth: 0, textDecoration: "none" }}>
                <div style={({ fontFamily: F_DISPLAY, fontSize: "clamp(110px, 9vw, 160px)", lineHeight: 0.78, color: "transparent", WebkitTextStroke: `1.2px ${ac}`, fontWeight: F_WEIGHT, marginRight: -8, marginBottom: -4, alignSelf: "end" } as React.CSSProperties)}>{i + 1}</div>
                <VRPoster seed={s.seed} accent={ac} tint={s.tint} image={s.image} style={{ width: "100%", aspectRatio: "3/4", minWidth: 0 }}>
                  <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: ac, textTransform: "uppercase" }}>&#9679; {s.kind}</span>
                    <div>
                      <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(14px, 1.2vw, 18px)", lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{s.title}</div>
                      <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", marginTop: 6, textTransform: "uppercase" }}>{s.reads}</div>
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

// ─── Marquee ─────────────────────────────────────────────────────
function VRHomeMarquee() {
  return (
    <section style={{ padding: "48px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,7,0.45)", overflow: "hidden" }}>
      <VRMarquee speed={42} gap={64}>
        {VR_SECTIONS.map(s => (
          <React.Fragment key={s.id}>
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

// ─── Section spotlights ──────────────────────────────────────────
function VRHomeSectionSpotlights() {
  const tiles = VR_SECTIONS.map(s => ({
    ...s,
    count: ({ stories: "14 published · 142 in shelves", movies: "4 in slate · 1 in post", music: "1 album · 1 EP in studio", games: "1 in vertical slice" } as Record<string, string>)[s.id] ?? "",
    tag:   ({ stories: "Read", movies: "Watch", music: "Hear", games: "Play" } as Record<string, string>)[s.id] ?? "Explore",
  }));

  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px" }}>
      <VRRowHeader eyebrow="One studio · four rooms" title="What we make" meta="Stories live now. The rest, slowly — by Visurena." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 36 }}>
        {tiles.map((t, i) => (
          <VRFade key={t.id} delay={i * 60}>
            <VRTilt>
              <Link href={`/${t.slug}`} className="vr-link vr-shelf-tile vr-elevated" style={{ position: "relative", display: "block", aspectRatio: "5/4", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                <VRPoster seed={i + 200} accent={t.color} tint={t.color} style={{ position: "absolute", inset: 0 }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 25%, ${t.color}30 0%, transparent 60%)` }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.88) 100%)" }} />
                </VRPoster>
                <div style={{ position: "absolute", inset: 0, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: t.color, textTransform: "uppercase", marginBottom: 10 }}>&#9679; {t.tag} &middot; {t.stone} stone</div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(48px, 5vw, 76px)", lineHeight: 0.9, color: IVORY, letterSpacing: "-0.025em", fontWeight: F_WEIGHT }}>{t.label}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 15, color: "#cdc6b6", margin: 0, maxWidth: 260, lineHeight: 1.4 }}>{t.count}</p>
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

// ─── Slate ───────────────────────────────────────────────────────
function VRHomeSlate() {
  const slate = [
    { ...VR_MOVIES[0], section: "Movies", slot: "emerald", route: "/movies" },
    { ...VR_MUSIC[0],  section: "Music",  slot: "ruby",    route: "/music"  },
    { ...VR_GAMES[0],  section: "Games",  slot: "violet",  route: "/games"  },
  ];

  return (
    <section style={{ padding: "72px clamp(28px, 4vw, 80px) 72px", background: "rgba(7,7,7,0.45)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <VRRowHeader eyebrow="The Slate" title="Coming to Visurena" meta="Stories first. Then film, music, games — every section, eventually." right="Full release calendar →" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 36 }}>
        {slate.map((c, i) => {
          const ac = slotColor(c.slot);
          return (
            <VRFade key={c.title} delay={i * 60}>
              <Link href={c.route} className="vr-card vr-link" style={{ display: "block", textDecoration: "none" }}>
                <VRPoster seed={i + 300} accent={ac} tint={c.tint} image={c.image} style={{ width: "100%", aspectRatio: "4/5", marginBottom: 18 }}>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.85) 100%), radial-gradient(circle at 30% 30%, ${c.tint}40 0%, transparent 60%)` }} />
                  <div style={{ position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: ac, textTransform: "uppercase" }}>&#9679; {c.section}</div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(32px, 3vw, 44px)", lineHeight: 1.0, color: IVORY, letterSpacing: "-0.015em", fontWeight: F_WEIGHT }}>{c.title}</div>
                  </div>
                </VRPoster>
                <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: ac, textTransform: "uppercase", marginBottom: 6 }}>Expected &middot; {c.year}</div>
                <div style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 14, color: "#a8a18d" }}>{c.form}</div>
                <div style={{ marginTop: 8, fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#5a5345", textTransform: "uppercase" }}>{c.state}</div>
              </Link>
            </VRFade>
          );
        })}
      </div>
    </section>
  );
}

// ─── From the studio ─────────────────────────────────────────────
function VRHomeFromStudio() {
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px" }}>
      <VRRowHeader eyebrow="About · Field notes blog" title="From the journal" meta="Essays on writing, music, films, games — and how AI helps make them" right="All essays · About →" accentOverride={IVORY} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 36, marginTop: 36 }}>
        {VR_RESEARCH.slice(0, 3).map((b, i) => (
          <VRFade key={b.slug} delay={i * 80}>
            <Link href="/research" className="vr-card vr-link" style={{ display: "block", borderTop: `1px solid ${i === 0 ? IVORY : "rgba(255,255,255,0.12)"}`, paddingTop: 20, textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase", marginBottom: 22 }}>
                <span style={{ color: i === 0 ? IVORY : "#7a7363" }}>{b.tag}</span><span>{b.date}</span>
              </div>
              <h3 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: i === 0 ? 44 : 28, lineHeight: 1.05, color: IVORY, margin: 0, letterSpacing: "-0.015em" }}>{b.title}</h3>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 15, color: "#a8a18d", marginTop: 14 }}>{b.sub}</p>
              <div style={{ marginTop: 22, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase" }}>{b.read} read &rarr;</div>
            </Link>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Newsletter ──────────────────────────────────────────────────
function VRNewsletter() {
  return (
    <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,5,0.4)" }}>
      <VRFade>
        <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.3em", color: "#f5b831", textTransform: "uppercase", marginBottom: 22 }}>&#10022; The Monday Post &#10022;</div>
        <h2 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.95, color: IVORY, letterSpacing: "-0.025em", margin: 0, maxWidth: 1000, marginInline: "auto" }}>
          New chapters in your inbox,<br />
          <em style={{ fontStyle: "italic", color: "#f5b831" }}>every Monday morning.</em>
        </h2>
        <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 20, color: "#a8a18d", marginTop: 28, maxWidth: 640, marginInline: "auto" }}>
          One short story, one essay, one piece of music we made that week. No tracking, no ads. Free during open beta.
        </p>
        <form style={{ display: "inline-flex", gap: 0, marginTop: 44, alignItems: "stretch", width: "min(560px, 100%)" }} onSubmit={e => e.preventDefault()}>
          <input placeholder="your@email" style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.22)", borderRight: "none", padding: "16px 22px", color: IVORY, fontFamily: F_BODY, fontSize: 16, outline: "none" }} />
          <button className="vr-cta" type="submit" style={{ background: IVORY, color: "#0a0a0a", border: `1px solid ${IVORY}`, padding: "16px 28px", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Subscribe</button>
        </form>
        <div style={{ marginTop: 22, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#5a5345", textTransform: "uppercase" }}>
          2,847 readers subscribed &middot; unsubscribe anytime
        </div>
      </VRFade>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Head><title>{"Visurena — Stories, Films, Music, Games"}</title></Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <VRHomeHero />
          <VRHomeStats />
          <VRHomeContinue />
          <VRHomeNewAcross />
          <VRHomeTrending />
          <VRHomeMarquee />
          <VRHomeSectionSpotlights />
          <VRHomeSlate />
          <VRHomeFromStudio />
          <VRNewsletter />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { section: "home" } };
};
