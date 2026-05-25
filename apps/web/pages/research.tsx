// pages/research.tsx — Research / About page
// Lives at /research. Linked from footer (not main nav).
// Houses: about Visurena, the field notes / essays, AI disclosure, press, contact.

import React from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  VRFade,
  VRRowHeader,
  Header,
  Footer,
} from "@visurena/ui";

// ─── Design constants ───────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";

function slotColor(slot: string): string {
  const map: Record<string, string> = {
    amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e", violet: "#c084fc", ivory: "#f5efdb",
  };
  return map[slot] ?? "#f5efdb";
}

// ─── Content data (hardcoded from shared.jsx VR_RESEARCH) ───────
const VR_RESEARCH = [
  {
    slug: "alone-with-twelve",
    title: "Why I'm building Visurena alone (with twelve AI coworkers)",
    date: "May 21, 2026",
    tag: "Essay",
    read: "11 min",
    sub: "A practical account of what it's like to run a studio by yourself when 'yourself' is twelve models in a trench coat.",
  },
  {
    slug: "writing-with-llm",
    title: "Notes on writing horror with a language model",
    date: "May 09, 2026",
    tag: "Research",
    read: "7 min",
    sub: "What the model knows about fear, and what it learned from me.",
  },
  {
    slug: "music-2026",
    title: "Music generation in 2026 — what's actually usable",
    date: "Apr 22, 2026",
    tag: "Field report",
    read: "14 min",
    sub: "Suno is finally usable. Not for albums — for cues. An honest write-up.",
  },
  {
    slug: "translation-arc",
    title: "On translation: rewriting a story until five languages agree",
    date: "Apr 08, 2026",
    tag: "Essay",
    read: "9 min",
    sub: "The arc that takes a slow-horror story from English into हिंदी and 한국어 without losing the dread.",
  },
  {
    slug: "house-of-jobs",
    title: "The house of jobs — how I split work between AI and me",
    date: "Mar 24, 2026",
    tag: "Essay",
    read: "8 min",
    sub: "Twelve coworkers. Twelve jobs. The map.",
  },
];

// ─── The Twelve split data ───────────────────────────────────────
const THE_TWELVE = [
  { role: "Drafting",        me: "30%", ai: "70%", note: "First drafts of stories. I rewrite by hand from there." },
  { role: "Translation",     me: "10%", ai: "90%", note: "Five languages. Each pass reviewed line by line." },
  { role: "Direction",       me: "85%", ai: "15%", note: "Choices about what something is. Always me." },
  { role: "Music sketching", me: "40%", ai: "60%", note: "Models suggest, I arrange. The cello is always real." },
  { role: "Editing",         me: "70%", ai: "30%", note: "Models tighten. I cut. Models tighten what I cut." },
  { role: "Imagery",         me: "20%", ai: "80%", note: "Generated, then retouched. We disclose everything." },
  { role: "Code",            me: "50%", ai: "50%", note: "This website included. Honest split." },
  { role: "Curation",        me: "100%", ai: "0%", note: "What gets published. What gets killed." },
];

// ─── Hero ────────────────────────────────────────────────────────
function VRResearchHero() {
  return (
    <section style={{
      padding: "120px clamp(28px, 4vw, 80px) 96px",
      textAlign: "center",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${IVORY}10 0%, transparent 55%)`,
        pointerEvents: "none",
      }} />
      <VRFade style={{ position: "relative" }}>
        <div style={{
          fontFamily: F_MONO,
          fontSize: 10,
          letterSpacing: "0.32em",
          color: IVORY,
          textTransform: "uppercase",
          marginBottom: 24,
        }}>
          &#10022; About Visurena &middot; Field Notes &#10022;
        </div>
        <h1 className="vr-halo" style={{
          fontFamily: F_DISPLAY,
          fontWeight: F_WEIGHT,
          fontSize: "clamp(72px, 9vw, 144px)",
          lineHeight: 0.92,
          margin: 0,
          color: IVORY,
          letterSpacing: "-0.03em",
          maxWidth: 1100,
          marginInline: "auto",
        }}>
          One person. <em style={{ fontStyle: "italic" }}>Twelve coworkers.</em><br />
          None of them human.
        </h1>
        <p style={{
          fontFamily: F_BODY,
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.45,
          color: "#cdc6b6",
          maxWidth: 760,
          marginInline: "auto",
          marginTop: 36,
        }}>
          Visurena is a studio of one &mdash; writing stories, scoring music, directing films, building games, all alongside a small set of AI models doing the work that used to need ten companies. This page is the part where we explain how.
        </p>
      </VRFade>
    </section>
  );
}

// ─── The Twelve ──────────────────────────────────────────────────
function VRResearchTheTwelve() {
  return (
    <section style={{
      padding: "84px clamp(28px, 4vw, 80px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <VRRowHeader
        eyebrow="The team"
        title="The twelve"
        meta="How the work is divided — honestly"
        accentOverride={IVORY}
      />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 18,
        marginTop: 40,
      }}>
        {THE_TWELVE.map((t, i) => (
          <VRFade key={t.role} delay={i * 50}>
            <div className="vr-elevated-soft" style={{
              background: "linear-gradient(180deg, rgba(20,18,16,0.85), rgba(10,10,10,0.7))",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 24,
            }}>
              <div style={{
                fontFamily: F_MONO,
                fontSize: 10,
                letterSpacing: "0.24em",
                color: IVORY,
                textTransform: "uppercase",
                marginBottom: 16,
              }}>
                {t.role}
              </div>
              {/* Split bar — human / model */}
              <div style={{
                display: "flex",
                height: 6,
                background: "rgba(255,255,255,0.08)",
                marginBottom: 14,
              }}>
                <div style={{ width: t.me, background: IVORY }} />
                <div style={{ width: t.ai, background: "rgba(255,255,255,0.18)" }} />
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: F_MONO,
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "#7a7363",
                textTransform: "uppercase",
                marginBottom: 14,
              }}>
                <span>{t.me} me</span>
                <span>{t.ai} model</span>
              </div>
              <p style={{
                fontFamily: F_BODY,
                fontStyle: "italic",
                fontSize: 14,
                lineHeight: 1.4,
                color: "#cdc6b6",
                margin: 0,
              }}>
                {t.note}
              </p>
            </div>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Essays / Field Notes ─────────────────────────────────────────
function VRResearchEssays() {
  return (
    <section style={{
      padding: "96px clamp(28px, 4vw, 80px) 72px",
      background: "rgba(7,7,7,0.45)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <VRRowHeader
        eyebrow="Field notes"
        title="Essays from the studio"
        meta="Writing about the work, while the work happens"
        accentOverride={IVORY}
        right="All essays &rarr;"
      />
      <div style={{ marginTop: 44 }}>
        {VR_RESEARCH.map((b, i) => (
          <VRFade key={b.slug} delay={i * 50}>
            <Link
              href={`/research/${b.slug}`}
              className="vr-link"
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1.4fr 0.8fr 0.6fr 24px",
                alignItems: "center",
                gap: 28,
                padding: "30px 0",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
                color: "inherit",
                transition: "padding 200ms ease, background 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "linear-gradient(90deg, rgba(232,227,214,0.04), transparent)";
                (e.currentTarget as HTMLElement).style.paddingLeft = "16px";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "";
                (e.currentTarget as HTMLElement).style.paddingLeft = "0";
              }}
            >
              <div style={{
                fontFamily: F_MONO,
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "#5d5849",
              }}>
                014.{String(i + 1).padStart(3, "0")}
              </div>
              <div>
                <div style={{
                  fontFamily: F_DISPLAY,
                  fontSize: 32,
                  lineHeight: 1.05,
                  color: IVORY,
                  letterSpacing: "-0.01em",
                }}>
                  {b.title}
                </div>
                <div style={{
                  fontFamily: F_BODY,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#8a8474",
                  marginTop: 8,
                }}>
                  {b.sub}
                </div>
              </div>
              <div style={{
                fontFamily: F_MONO,
                fontSize: 11,
                letterSpacing: "0.18em",
                color: IVORY,
                textTransform: "uppercase",
              }}>
                {b.tag}
              </div>
              <div style={{
                fontFamily: F_MONO,
                fontSize: 11,
                color: "#8a8474",
              }}>
                {b.date} &middot; {b.read}
              </div>
              <div style={{
                fontFamily: F_DISPLAY,
                fontSize: 24,
                color: "#5d5849",
              }}>
                &rarr;
              </div>
            </Link>
          </VRFade>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
      </div>
    </section>
  );
}

// ─── Disclosure / Contact ─────────────────────────────────────────
function VRResearchDisclosure() {
  return (
    <section style={{ padding: "96px clamp(28px, 4vw, 80px) 96px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr",
        gap: 64,
        alignItems: "flex-start",
      }}>
        <VRFade>
          <div style={{
            fontFamily: F_MONO,
            fontSize: 10,
            letterSpacing: "0.28em",
            color: IVORY,
            textTransform: "uppercase",
            marginBottom: 18,
          }}>
            AI disclosure
          </div>
          <h2 style={{
            fontFamily: F_DISPLAY,
            fontWeight: F_WEIGHT,
            fontSize: 56,
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-0.02em",
            color: IVORY,
          }}>
            <em style={{ fontStyle: "italic" }}>Made with models. Said out loud.</em>
          </h2>
          <p style={{
            fontFamily: F_BODY,
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.5,
            color: "#cdc6b6",
            marginTop: 22,
            maxWidth: 580,
          }}>
            Every Visurena release ships with a brief production note saying what models were used where. Stories, music cues, film stills, voice narration &mdash; all disclosed. We don&apos;t think it makes the work worse. We think it makes the work honest.
          </p>
        </VRFade>

        <VRFade delay={120}>
          <div style={{
            fontFamily: F_MONO,
            fontSize: 10,
            letterSpacing: "0.24em",
            color: "#7a7363",
            textTransform: "uppercase",
            marginBottom: 14,
          }}>
            Press
          </div>
          <p style={{
            fontFamily: F_BODY,
            fontSize: 16,
            color: "#cdc6b6",
            marginTop: 0,
          }}>
            Materials, photography of the studio, and director&apos;s biography.
          </p>
          <a
            href="mailto:hello@visurena.com"
            className="vr-link"
            style={{
              marginTop: 14,
              display: "inline-block",
              fontFamily: F_MONO,
              fontSize: 10,
              letterSpacing: "0.24em",
              color: IVORY,
              textTransform: "uppercase",
              paddingBottom: 4,
              borderBottom: `1px solid ${IVORY}`,
              textDecoration: "none",
            }}
          >
            Download press kit &rarr;
          </a>
        </VRFade>

        <VRFade delay={160}>
          <div style={{
            fontFamily: F_MONO,
            fontSize: 10,
            letterSpacing: "0.24em",
            color: "#7a7363",
            textTransform: "uppercase",
            marginBottom: 14,
          }}>
            Contact
          </div>
          <p style={{
            fontFamily: F_BODY,
            fontSize: 16,
            color: "#cdc6b6",
            marginTop: 0,
          }}>
            hello@visurena.com &middot; For collaborations, festivals, distribution.
          </p>
          <a
            href="mailto:hello@visurena.com"
            className="vr-link"
            style={{
              marginTop: 14,
              display: "inline-block",
              fontFamily: F_MONO,
              fontSize: 10,
              letterSpacing: "0.24em",
              color: IVORY,
              textTransform: "uppercase",
              paddingBottom: 4,
              borderBottom: `1px solid ${IVORY}`,
              textDecoration: "none",
            }}
          >
            Send a note &rarr;
          </a>
        </VRFade>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function Research() {
  return (
    <>
      <Head>
        <title>{"Research — Visurena"}</title>
      </Head>
      <div className="vr-app" style={{
        background: "transparent",
        color: IVORY,
        fontFamily: F_BODY,
        fontSize: 16,
        lineHeight: 1.55,
      }}>
        <Header />
        <main className="vr-page">
          <VRResearchHero />
          <VRResearchTheTwelve />
          <VRResearchEssays />
          <VRResearchDisclosure />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { section: "stories" } };
};
