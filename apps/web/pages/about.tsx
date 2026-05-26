// pages/about.tsx — About hub. Houses two rooms: Journal (Pearl) + Research (Sapphire).
// Each room has its own jewel theme; the pages are placeholders for now.

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { VRFade, VRTilt, VRPoster, Header, Footer } from "@visurena/ui";

const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";

const ROOMS = [
  { slug: "journal",  label: "Journal",  stone: "Pearl",    color: "#c0c8e0", blurb: "The build log — what we shipped, why, and how it was made." },
  { slug: "research", label: "Research", stone: "Sapphire", color: "#4f7cff", blurb: "Field notes and essays on making stories, games, and tools with AI." },
];

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>{"About — Visurena"}</title>
        <meta name="description" content="About Visurena — the Journal (build log) and Research (field notes)." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          {/* Masthead */}
          <section style={{ padding: "84px clamp(28px, 4vw, 80px) 56px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <VRFade>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: IVORY, textTransform: "uppercase" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: IVORY, boxShadow: `0 0 16px ${IVORY}80` }} />
                About Visurena
              </div>
              <h1 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(80px, 9vw, 144px)", lineHeight: 0.9, margin: 0, color: IVORY, letterSpacing: "-0.03em" }}>About</h1>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, color: "#cdc6b6", maxWidth: 640, marginTop: 22, marginBottom: 0 }}>
                How Visurena is made, and what we&apos;re learning along the way — two rooms below.
              </p>
            </VRFade>
          </section>

          {/* Two rooms */}
          <section style={{ padding: "64px clamp(28px, 4vw, 80px) 96px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
              {ROOMS.map((r, i) => (
                <VRFade key={r.slug} delay={i * 80}>
                  <VRTilt>
                    <Link href={`/${r.slug}`} className="vr-link vr-shelf-tile vr-elevated" style={{ position: "relative", display: "block", aspectRatio: "16/10", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                      <VRPoster seed={i + 400} accent={r.color} tint={r.color} style={{ position: "absolute", inset: 0 }}>
                        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 25%, ${r.color}30 0%, transparent 60%)` }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.88) 100%)" }} />
                      </VRPoster>
                      <div style={{ position: "absolute", inset: 0, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: r.color, textTransform: "uppercase" }}>&#9679; The {r.stone} room</div>
                        <div>
                          <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(48px, 5vw, 80px)", lineHeight: 0.9, color: IVORY, letterSpacing: "-0.025em", fontWeight: F_WEIGHT, marginBottom: 14 }}>{r.label}</div>
                          <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 16, color: "#cdc6b6", margin: 0, maxWidth: 420 }}>{r.blurb}</p>
                          <span style={{ display: "inline-flex", marginTop: 18, fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.22em", color: IVORY, textTransform: "uppercase", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${r.color}` }}>Enter &rarr;</span>
                        </div>
                      </div>
                    </Link>
                  </VRTilt>
                </VRFade>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
