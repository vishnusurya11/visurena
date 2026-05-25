import React, { useRef, useEffect } from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  VRFade,
  VRPoster,
  VRStripe,
  VRRowHeader,
  VRCounter,
  VRShaderBg,
  Header,
  Footer,
} from "@visurena/ui";
import { VRNewsletter } from "../components/VRNewsletter";

// ─── Design constants ────────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";

// ─── Section accent ──────────────────────────────────────────────
const ACCENT = "#e91e63"; // ruby

function slotColor(slot: string): string {
  const map: Record<string, string> = {
    amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e", violet: "#c084fc", ivory: "#f5efdb",
  };
  return map[slot] ?? "#f5efdb";
}

// ─── Content data (inline from shared.jsx > VR_MUSIC) ───────────
interface MusicItem {
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

const VR_MUSIC: MusicItem[] = [
  {
    slug: "late-cathedrals",
    title: "Late Cathedrals",
    year: "Aug 2026",
    form: "12-track album",
    state: "Mastering",
    tint: "#4a8a72",
    featured: true,
    image: "https://picsum.photos/seed/late-cathedrals/900/900",
    log: "A slow album scored entirely for empty rooms — cathedrals, hotel lobbies, parking garages at 4 a.m.",
  },
  {
    slug: "marrow-songs",
    title: "Marrow Songs",
    year: "Oct 2026",
    form: "EP · 5 tracks",
    state: "Recording",
    tint: "#3e7864",
    featured: false,
    image: "https://picsum.photos/seed/marrow-songs/900/900",
    log: "Five lullabies for adults, scored for cello and ground-floor radiators.",
  },
  {
    slug: "the-mile-pieces",
    title: "The Mile Pieces",
    year: "2027",
    form: "Original score",
    state: "Writing",
    tint: "#5e8a78",
    featured: false,
    image: "https://picsum.photos/seed/the-mile-pieces/900/900",
    log: "Score for the audio narration of The Lantern Mile — drone, brass, distant trucks.",
  },
];

interface TeamNote {
  title: string;
  date: string;
  role: string;
  read: string;
  body: string;
}

const TEAM_NOTES: TeamNote[] = [
  {
    title: "Late Cathedrals — the empty-room rule",
    date: "May 14",
    role: "Liner note",
    read: "6 min",
    body: "Every track on this album was tracked in a space designed for nothing — parking garage, hotel lobby, abandoned chapel. Why that matters.",
  },
  {
    title: "What a model can do for a cello",
    date: "Apr 27",
    role: "Field note",
    read: "9 min",
    body: "A practical guide to layering a model-generated bed under a real cello pass. Mostly about not making it sound like a model.",
  },
  {
    title: "The Mile Pieces — first sketch",
    date: "Apr 02",
    role: "Sketch",
    read: "3 min",
    body: "The opening drone for the audio narration of The Lantern Mile. Trucks at 4am. Listen with headphones.",
  },
];

// ─── Hero ────────────────────────────────────────────────────────
function MusicHero() {
  const featured = VR_MUSIC.find(i => i.featured) ?? VR_MUSIC[0];

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
      ref={heroRef}
      style={{ position: "relative", height: "88vh", minHeight: 720, overflow: "hidden", isolation: "isolate" }}
    >
      {/* Background image + Ken Burns zoom */}
      <div ref={bgRef} style={{ position: "absolute", inset: "-8%", willChange: "transform" }}>
        <div
          className="vr-hero-zoom"
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url("${featured.image}")`,
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Nebula shader */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.32, mixBlendMode: "screen", pointerEvents: "none" }}>
        <VRShaderBg colors={[ACCENT, featured.tint, ACCENT, IVORY]} />
      </div>

      {/* Parallax glow layer */}
      <div
        ref={glowRef}
        style={{ position: "absolute", inset: "-10%", willChange: "transform", pointerEvents: "none" }}
      >
        <div style={{
          position: "absolute", right: "8%", top: "14%", width: "60%", height: "70%",
          background: `radial-gradient(ellipse at center, ${ACCENT}45 0%, ${ACCENT}10 35%, transparent 65%)`,
          filter: "blur(24px)",
        }} />
        <div style={{
          position: "absolute", left: "-6%", bottom: "-10%", width: "60%", height: "60%",
          background: `radial-gradient(ellipse at center, ${featured.tint}25 0%, transparent 65%)`,
          filter: "blur(34px)",
        }} />
      </div>

      {/* Vignette + gradient overlays */}
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
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        boxShadow: "inset 0 -120px 200px 0 rgba(0,0,0,0.55), inset 0 0 280px 60px rgba(0,0,0,0.55)",
      }} />

      {/* Section breadcrumb */}
      <VRFade style={{
        position: "absolute", left: "clamp(28px, 4vw, 80px)", top: 120,
        display: "flex", alignItems: "center", gap: 14,
        fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "#cdc6b6", flexWrap: "wrap",
      }}>
        <span style={{ color: ACCENT, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 6, height: 6, background: ACCENT,
            borderRadius: "50%", display: "inline-block",
            boxShadow: `0 0 14px ${ACCENT}`,
          }} />
          The Ruby room &middot; Music
        </span>
        <VRStripe color="#5a5345" width={48} />
        <span>Coming &middot; {featured.year} &middot; {featured.form}</span>
      </VRFade>

      {/* Title block */}
      <div
        ref={titleRef}
        style={{
          position: "absolute", left: "clamp(28px, 4vw, 80px)", bottom: 200,
          maxWidth: 1000, willChange: "transform",
        }}
      >
        <VRFade delay={80}>
          <div style={{
            fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em",
            color: "#a8a18d", textTransform: "uppercase", marginBottom: 14,
          }}>
            Music &middot; Lead album in production
          </div>
          <h1 className="vr-halo" style={{
            fontFamily: F_DISPLAY, fontWeight: F_WEIGHT,
            fontSize: "clamp(60px, 9vw, 148px)", lineHeight: 0.94,
            margin: 0, letterSpacing: "-0.03em", color: IVORY,
          }}>
            {featured.title}
          </h1>
          <p style={{
            fontFamily: F_BODY, fontStyle: "italic",
            fontSize: 22, lineHeight: 1.4, color: "#cdc6b6",
            maxWidth: 640, marginTop: 24, marginBottom: 0,
          }}>
            {featured.log}
          </p>
          <div style={{
            marginTop: 28, fontFamily: F_MONO, fontSize: 10,
            letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase",
          }}>
            &#9680; {featured.state} &middot; Albums, EPs and original scores. Music as quiet as the rest of the studio.
          </div>
        </VRFade>
      </div>

      {/* CTAs */}
      <VRFade delay={140} style={{
        position: "absolute", left: "clamp(28px, 4vw, 80px)", bottom: 80,
        display: "flex", gap: 14,
      }}>
        <button
          className="vr-cta vr-cta-solid vr-link"
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "16px 30px", background: IVORY, color: "#0a0a0a",
            fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em",
            textTransform: "uppercase", border: "none", cursor: "pointer",
            boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset",
          }}
        >
          &#9711; Notify me &mdash; {featured.year}
        </button>
        <Link
          href="#field-notes"
          className="vr-cta vr-link"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 24px", border: "1px solid rgba(255,255,255,0.22)",
            color: IVORY, fontFamily: F_MONO, fontSize: 11,
            letterSpacing: "0.2em", textTransform: "uppercase",
            background: "rgba(20,18,16,0.4)", backdropFilter: "blur(10px)",
            textDecoration: "none",
          }}
        >
          &#8599; Behind the sessions
        </Link>
      </VRFade>
    </section>
  );
}

// ─── Pillar + Stats strip ────────────────────────────────────────
function MusicPillar() {
  return (
    <section style={{
      padding: "84px clamp(28px, 4vw, 80px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(8,8,8,0.5)",
    }}>
      <VRFade style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 80,
        alignItems: "center",
      }}>
        {/* Pillar text */}
        <div>
          <div style={{
            fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em",
            color: ACCENT, textTransform: "uppercase", marginBottom: 18,
          }}>
            Why we make music
          </div>
          <p style={{
            fontFamily: F_DISPLAY, fontStyle: "italic",
            fontSize: 36, lineHeight: 1.2, color: IVORY,
            letterSpacing: "-0.015em", margin: 0,
          }}>
            Stories need rooms. Films need air. Music is how we build both — patiently, slowly, without an algorithm telling us what should chart.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 48,
          justifyContent: "flex-end",
          fontFamily: F_MONO, fontSize: 10,
          letterSpacing: "0.2em", color: "#7a7363",
          textTransform: "uppercase",
        }}>
          {([
            { n: VR_MUSIC.length, suffix: "",   label: "On the slate",    isCounter: true  },
            { n: 1,               suffix: "",   label: "In production",   isCounter: true  },
            { n: null,            suffix: "",   label: "First release",   staticVal: "2026" },
            { n: null,            suffix: "",   label: "Founded",         staticVal: "MMXXVI" },
          ] as Array<{ n: number | null; suffix: string; label: string; isCounter: boolean; staticVal?: string }>).map(({ n, suffix, label, isCounter, staticVal }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: F_DISPLAY, fontSize: 48, lineHeight: 1,
                color: IVORY, letterSpacing: "-0.02em",
                marginBottom: 6, fontWeight: F_WEIGHT,
              }}>
                {staticVal
                  ? staticVal
                  : isCounter && n !== null
                    ? <><VRCounter value={n} duration={1400} format={(v: number) => String(Math.round(v))} />{suffix}</>
                    : `${n}${suffix}`}
              </div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── Music slate grid ────────────────────────────────────────────
function MusicSlate() {
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 72px" }}>
      <VRRowHeader
        eyebrow="The Slate · Ruby"
        title="In production"
        meta="What we&apos;re making right now — and what&apos;s coming next"
      />
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(VR_MUSIC.length, 4)}, 1fr)`,
        gap: 24,
        marginTop: 40,
      }}>
        {VR_MUSIC.map((item, i) => (
          <VRFade key={item.slug} delay={i * 80}>
            <article className="vr-card vr-elevated-soft" style={{ position: "relative" }}>
              <VRPoster
                seed={i + 110}
                accent={ACCENT}
                tint={item.tint}
                image={item.image}
                style={{ width: "100%", aspectRatio: "1/1" }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%), radial-gradient(circle at 30% 30%, ${item.tint}40 0%, transparent 60%)`,
                }} />
                <div style={{
                  position: "absolute", inset: 0, padding: 22,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <div style={{
                    fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em",
                    color: ACCENT, textTransform: "uppercase",
                  }}>
                    &bull; {item.state}
                  </div>
                  <div style={{
                    fontFamily: F_DISPLAY,
                    fontSize: "clamp(28px, 2.6vw, 38px)",
                    lineHeight: 1.0, color: IVORY,
                    letterSpacing: "-0.015em", fontWeight: F_WEIGHT,
                  }}>
                    {item.title}
                  </div>
                </div>
              </VRPoster>
              <div style={{
                marginTop: 18, fontFamily: F_MONO, fontSize: 10,
                letterSpacing: "0.22em", color: ACCENT,
                textTransform: "uppercase", marginBottom: 6,
              }}>
                Expected &middot; {item.year}
              </div>
              <div style={{ fontFamily: F_BODY, fontSize: 15, color: "#cdc6b6" }}>{item.form}</div>
              <p style={{
                fontFamily: F_BODY, fontStyle: "italic",
                fontSize: 14, color: "#7a7363", marginTop: 10,
              }}>
                {item.log}
              </p>
            </article>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Field notes / editorial ─────────────────────────────────────
function MusicFieldNotes() {
  return (
    <section
      id="field-notes"
      style={{
        padding: "84px clamp(28px, 4vw, 80px) 72px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(7,7,7,0.45)",
      }}
    >
      <VRRowHeader
        eyebrow="From the studio (live room)"
        title="Field notes"
        meta="Sessions, sketches, the half-finished things."
        right="All notes →"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36, marginTop: 40 }}>
        {TEAM_NOTES.map((note, i) => (
          <VRFade key={note.title} delay={i * 80}>
            <article style={{
              borderTop: `1px solid ${i === 0 ? ACCENT : "rgba(255,255,255,0.12)"}`,
              paddingTop: 20,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.18em",
                color: "#7a7363", textTransform: "uppercase", marginBottom: 22,
              }}>
                <span style={{ color: i === 0 ? ACCENT : "#7a7363" }}>{note.role}</span>
                <span>{note.date}</span>
              </div>
              <h3 style={{
                fontFamily: F_DISPLAY, fontWeight: F_WEIGHT,
                fontSize: i === 0 ? 36 : 26, lineHeight: 1.05,
                color: IVORY, margin: 0, letterSpacing: "-0.015em",
              }}>
                {note.title}
              </h3>
              <p style={{
                fontFamily: F_BODY, fontStyle: "italic",
                fontSize: 15, color: "#a8a18d", marginTop: 14,
              }}>
                {note.body}
              </p>
              <div style={{
                marginTop: 22, fontFamily: F_MONO, fontSize: 10,
                letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase",
              }}>
                {note.read} read &rarr;
              </div>
            </article>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function MusicPage() {
  return (
    <>
      <Head>
        <title>{"Music — Visurena"}</title>
        <meta name="description" content="Albums, EPs and original scores from Visurena Studio. Music as quiet as the rest of the studio." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <MusicHero />
          <MusicPillar />
          <MusicSlate />
          <MusicFieldNotes />
          <VRNewsletter
            eyebrow="The Ruby Room"
            headline={
              <>
                New music in your inbox,<br />
                <em style={{ fontStyle: "italic", color: ACCENT }}>before it ships.</em>
              </>
            }
            subtext="Studio dispatches — liner notes, sketches, first listens. No algorithm, no ads. Free during open beta."
            background="#050505"
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { section: "music" } };
};
