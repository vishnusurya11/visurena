import React, { useRef, useEffect } from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  VRFade, VRPoster, VRStripe, VRRowHeader,
  VRCounter, VRShaderBg,
  Header, Footer,
} from "@visurena/ui";
import VRNewsletter from "../components/VRNewsletter";

// ─── Design constants ────────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const ACCENT    = "#00d97e"; // emerald

// TODO(future): the full Movies experience (hero, stats, the slate grid, field notes)
// is built below and the format is approved — but the entries (e.g. "Aurelia") are
// placeholders. We show a Coming Soon holding page until real film data exists.
// Flip COMING_SOON to false to restore the full slate.
const COMING_SOON: boolean = true;

function slotColor(slot: string): string {
  const map: Record<string, string> = {
    amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e", violet: "#c084fc", ivory: "#f5efdb",
  };
  return map[slot] ?? "#f5efdb";
}

// ─── Content data ────────────────────────────────────────────────
interface Movie {
  slug: string;
  title: string;
  year: string;
  form: string;
  state: string;
  tint: string;
  featured: boolean;
  image: string;
  log: string;
}

const VR_MOVIES: Movie[] = [
  {
    slug: "aurelia",
    title: "Aurelia",
    year: "Q3 2026",
    form: "Feature film · 94 min",
    state: "In post-production",
    tint: "#b8634a",
    featured: true,
    image: "https://picsum.photos/seed/aurelia-film/900/1200",
    log: "A wedding photographer realizes she's been photographing the same guest at every wedding for ten years.",
  },
  {
    slug: "the-blue-hour",
    title: "The Blue Hour",
    year: "Winter 2026",
    form: "Feature · 102 min",
    state: "Shooting",
    tint: "#4a6885",
    featured: false,
    image: "https://picsum.photos/seed/blue-hour-film/900/1200",
    log: "A grief counsellor accepts a client who has been dead for fourteen years.",
  },
  {
    slug: "small-mercies",
    title: "Small Mercies",
    year: "2027",
    form: "Feature · 88 min",
    state: "Pre-production",
    tint: "#8a7656",
    featured: false,
    image: "https://picsum.photos/seed/small-mercies-film/900/1200",
    log: "Three siblings inherit their mother's restaurant and her last unmade dish.",
  },
  {
    slug: "lateral-roads",
    title: "Lateral Roads",
    year: "2027",
    form: "Short · 22 min",
    state: "Concepting",
    tint: "#946a52",
    featured: false,
    image: "https://picsum.photos/seed/lateral-roads-film/900/1200",
    log: "An anthology of single drives across one nation, ending at the same gas station.",
  },
];

const FIELD_NOTES = [
  {
    title: "Aurelia · the wedding photograph",
    date: "May 17",
    role: "Director's note",
    read: "8 min",
    body: "How the central image got built — one frame at a time, in conversation with three models and a stack of 1970s wedding albums.",
  },
  {
    title: "On colorists, in 2026",
    date: "May 03",
    role: "Field note",
    read: "5 min",
    body: "Replacing the colorist with a model still doesn't get you the colorist's eye. What it does get you, though, is a faster argument.",
  },
  {
    title: "Shooting nothing — a notebook",
    date: "Apr 19",
    role: "Notebook",
    read: "11 min",
    body: "What it's like to direct a feature when the camera is also a model. Mostly: a lot of describing.",
  },
];

// ─── Section Hero ────────────────────────────────────────────────
function MoviesHero() {
  const featured = VR_MOVIES.find(m => m.featured) ?? VR_MOVIES[0];
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
        if (bgRef.current)    bgRef.current.style.transform    = `translate3d(${-x * 28}px, ${-y * 28}px, 0)`;
        if (glowRef.current)  glowRef.current.style.transform  = `translate3d(${x * 48}px, ${y * 48}px, 0)`;
        if (titleRef.current) titleRef.current.style.transform = `translate3d(${-x * 14}px, ${-y * 14}px, 0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      [bgRef, glowRef, titleRef].forEach(ref => {
        if (ref.current) ref.current.style.transform = "";
      });
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      data-vr-hero
      ref={heroRef}
      style={{ position: "relative", height: "88vh", minHeight: 720, maxHeight: 1000, overflow: "hidden", isolation: "isolate" }}
    >
      {/* Ken Burns background */}
      <div ref={bgRef} style={{ position: "absolute", inset: "-8%", willChange: "transform" }}>
        <div
          className="vr-hero-zoom"
          style={{
            width: "100%", height: "100%",
            backgroundImage: `url("${featured.image}")`,
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Shader background overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.32, mixBlendMode: "screen", pointerEvents: "none" }}>
        <VRShaderBg colors={[ACCENT, tint, ACCENT, IVORY]} />
      </div>

      {/* Parallax glow orbs */}
      <div
        ref={glowRef}
        style={{ position: "absolute", inset: "-10%", willChange: "transform", transition: "transform 320ms cubic-bezier(.2,.7,.2,1)", pointerEvents: "none" }}
      >
        <div style={{
          position: "absolute", right: "8%", top: "14%", width: "60%", height: "70%",
          background: `radial-gradient(ellipse at center, ${ACCENT}45 0%, ${ACCENT}10 35%, transparent 65%)`,
          filter: "blur(24px)",
        }} />
        <div style={{
          position: "absolute", left: "-6%", bottom: "-10%", width: "60%", height: "60%",
          background: `radial-gradient(ellipse at center, ${tint}25 0%, transparent 65%)`,
          filter: "blur(34px)",
        }} />
      </div>

      {/* Gradient overlays */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.0) 18%, rgba(10,10,10,0.0) 42%, rgba(10,10,10,0.85) 88%, rgba(10,10,10,1) 100%),
          linear-gradient(90deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.18) 38%, rgba(10,10,10,0.0) 65%, rgba(10,10,10,0.3) 100%)
        `,
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 78% 38%, ${ACCENT}45 0%, transparent 55%)`,
        mixBlendMode: "screen", opacity: 0.6,
      }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 -120px 200px 0 rgba(0,0,0,0.55), inset 0 0 280px 60px rgba(0,0,0,0.55)" }} />

      {/* Breadcrumb row */}
      <VRFade style={{
        position: "absolute", left: "clamp(28px, 4vw, 80px)", top: 120,
        display: "flex", alignItems: "center", gap: 14,
        fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
        color: "#cdc6b6", flexWrap: "wrap",
      }}>
        <span style={{ color: ACCENT, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, background: ACCENT, borderRadius: "50%", display: "inline-block", boxShadow: `0 0 14px ${ACCENT}` }} />
          The Emerald room &middot; Movies
        </span>
        <VRStripe color="#5a5345" width={48} />
        <span>Coming &middot; {featured.year} &middot; {featured.form}</span>
      </VRFade>

      {/* Title block */}
      <div
        ref={titleRef}
        style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", bottom: 200, maxWidth: 1000, willChange: "transform", transition: "transform 240ms cubic-bezier(.2,.7,.2,1)" }}
      >
        <VRFade delay={80}>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#a8a18d", textTransform: "uppercase", marginBottom: 14 }}>
            Movies &middot; Lead title in production
          </div>
          <h1
            className="vr-halo"
            style={{
              fontFamily: F_DISPLAY, fontWeight: F_WEIGHT,
              fontSize: "clamp(60px, 9vw, 148px)", lineHeight: 0.94,
              margin: 0, letterSpacing: "-0.03em", color: IVORY,
            }}
          >
            {featured.title}
          </h1>
          <p style={{
            fontFamily: F_BODY, fontStyle: "italic",
            fontSize: 22, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 640, marginTop: 24, marginBottom: 0,
          }}>
            {featured.log}
          </p>
          <div style={{ marginTop: 28, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase" }}>
            &#9680; {featured.state} &middot; Original films and shorts from the studio. Slow stories, restless cameras.
          </div>
        </VRFade>
      </div>

      {/* CTAs */}
      <VRFade delay={140} style={{ position: "absolute", left: "clamp(28px, 4vw, 80px)", bottom: 80, display: "flex", gap: 14 }}>
        <button
          className="vr-cta vr-cta-solid"
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "16px 30px", background: IVORY, color: "#0a0a0a",
            fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset",
            border: "none", cursor: "pointer",
          }}
        >
          &#9711; Notify me &mdash; {featured.year}
        </button>
        <button
          className="vr-cta"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 24px", border: "1px solid rgba(255,255,255,0.22)", color: IVORY,
            fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            background: "rgba(20,18,16,0.4)", backdropFilter: "blur(10px)", cursor: "pointer",
          }}
        >
          &nearr; Behind the scenes
        </button>
      </VRFade>
    </section>
  );
}

// ─── Stats / Pillar ──────────────────────────────────────────────
function MoviesStats() {
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,8,0.5)" }}>
      <VRFade style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "center" }}>
        {/* Pillar text */}
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: ACCENT, textTransform: "uppercase", marginBottom: 18 }}>
            Why we make films
          </div>
          <p style={{ fontFamily: F_DISPLAY, fontStyle: "italic", fontSize: 36, lineHeight: 1.2, color: IVORY, letterSpacing: "-0.015em", margin: 0 }}>
            Because some stories only land at 24 frames a second. Visurena makes films the way it makes everything else &mdash; small crews, big ambition, no genre embarrassment.
          </p>
        </div>

        {/* Counters */}
        <div style={{ display: "flex", gap: 48, justifyContent: "flex-end", fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase" }}>
          {([
            { n: VR_MOVIES.length, suffix: "", label: "On the slate",     staticVal: null },
            { n: 1,                suffix: "", label: "In production",    staticVal: null },
            { n: null,             suffix: "", label: "First release",    staticVal: "2026" },
            { n: null,             suffix: "", label: "Founded",          staticVal: "MMXXVI" },
          ] as Array<{ n: number | null; suffix: string; label: string; staticVal: string | null }>).map(({ n, suffix, label, staticVal }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: F_DISPLAY, fontSize: 48, lineHeight: 1, color: IVORY, letterSpacing: "-0.02em", marginBottom: 6, fontWeight: F_WEIGHT }}>
                {staticVal
                  ? staticVal
                  : <><VRCounter value={n!} duration={1600} format={(v: number) => String(Math.round(v))} />{suffix}</>
                }
              </div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── The Slate grid ───────────────────────────────────────────────
function MoviesSlate() {
  const cols = Math.min(VR_MOVIES.length, 4);
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px" }}>
      <VRRowHeader
        eyebrow="The Slate · Emerald"
        title="In production"
        meta="What we're making right now — and what's coming next"
        accentOverride={ACCENT}
      />
      <div
        style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24, marginTop: 40 }}
      >
        {VR_MOVIES.map((movie, i) => (
          <VRFade key={movie.slug} delay={i * 80}>
            <Link href={`/movies/${movie.slug}`} className="vr-card vr-link" style={{ display: "block", textDecoration: "none" }}>
              <article className="vr-elevated-soft" style={{ position: "relative" }}>
                <VRPoster
                  seed={i + 110}
                  accent={ACCENT}
                  tint={movie.tint}
                  image={movie.image}
                  style={{ width: "100%", aspectRatio: "4/5" }}
                >
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%), radial-gradient(circle at 30% 30%, ${movie.tint}40 0%, transparent 60%)`,
                  }} />
                  <div style={{ position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase" }}>
                      &#9679; {movie.state}
                    </div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(28px, 2.6vw, 38px)", lineHeight: 1.0, color: IVORY, letterSpacing: "-0.015em", fontWeight: F_WEIGHT }}>
                      {movie.title}
                    </div>
                  </div>
                </VRPoster>
              </article>
              <div style={{ marginTop: 18, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase", marginBottom: 6 }}>
                Expected &middot; {movie.year}
              </div>
              <div style={{ fontFamily: F_BODY, fontSize: 15, color: "#cdc6b6" }}>{movie.form}</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 14, color: "#7a7363", marginTop: 10 }}>{movie.log}</p>
            </Link>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Field Notes ──────────────────────────────────────────────────
function MoviesFieldNotes() {
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,7,0.45)" }}>
      <VRRowHeader
        eyebrow="From the cutting room"
        title="Field notes"
        meta="Production notes, behind-the-lens dispatches."
        right="All notes &rarr;"
        accentOverride={ACCENT}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36, marginTop: 40 }}>
        {FIELD_NOTES.map((note, i) => (
          <VRFade key={note.title} delay={i * 80}>
            <article style={{ borderTop: `1px solid ${i === 0 ? ACCENT : "rgba(255,255,255,0.12)"}`, paddingTop: 20 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.18em", color: "#7a7363",
                textTransform: "uppercase", marginBottom: 22,
              }}>
                <span style={{ color: i === 0 ? ACCENT : "#7a7363" }}>{note.role}</span>
                <span>{note.date}</span>
              </div>
              <h3 style={{
                fontFamily: F_DISPLAY, fontWeight: F_WEIGHT,
                fontSize: i === 0 ? 36 : 26, lineHeight: 1.05, color: IVORY,
                margin: 0, letterSpacing: "-0.015em",
              }}>
                {note.title}
              </h3>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 15, color: "#a8a18d", marginTop: 14 }}>
                {note.body}
              </p>
              <div style={{ marginTop: 22, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase" }}>
                {note.read} read &rarr;
              </div>
            </article>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Coming soon (holding page) ──────────────────────────────────
function MoviesComingSoon() {
  return (
    <section style={{ position: "relative", minHeight: "78vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "160px clamp(28px, 4vw, 80px) 120px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 42%, ${ACCENT}22 0%, transparent 60%)`, pointerEvents: "none" }} />
      <VRFade style={{ position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: ACCENT, textTransform: "uppercase", marginBottom: 28 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 16px ${ACCENT}` }} />
          The Emerald room &middot; Movies
        </div>
        <h1 className="vr-halo" style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(72px, 10vw, 160px)", lineHeight: 0.9, margin: 0, color: IVORY, letterSpacing: "-0.03em" }}>Movies</h1>
        <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 620, margin: "26px auto 0" }}>
          Original films and shorts from the studio. Slow stories, restless cameras.
        </p>
        <div style={{ marginTop: 34, fontFamily: F_MONO, fontSize: 12, letterSpacing: "0.3em", color: ACCENT, textTransform: "uppercase" }}>
          &#9680; Coming soon
        </div>
      </VRFade>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function Movies() {
  return (
    <>
      <Head>
        <title>{"Movies — Visurena"}</title>
        <meta name="description" content="Original films and shorts from the Visurena studio. Slow stories, restless cameras." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          {COMING_SOON ? (
            <MoviesComingSoon />
          ) : (
            <>
              <MoviesHero />
              <MoviesStats />
              <MoviesSlate />
              <MoviesFieldNotes />
            </>
          )}
          <VRNewsletter
            eyebrow="The Monday Post"
            headline={
              <>
                Films you&apos;ll want to see,<br />
                <em style={{ fontStyle: "italic", color: ACCENT }}>when they&apos;re ready.</em>
              </>
            }
            subtext="Get notified when Aurelia and the rest of the slate are released. No tracking, no ads. Free during open beta."
            // TODO(future): restore subscriberLine once we have real signup counts (was a fabricated "2,847 readers subscribed")
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { section: "movies" } };
};
