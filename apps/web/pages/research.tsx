// pages/research.tsx — Research room (Sapphire stone). Field notes / essays.
// Placeholder for now — themed, empty. Lives under /about.

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { VRFade, Header, Footer } from "@visurena/ui";

const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const SAPPHIRE  = "#4f7cff";

export default function ResearchPage() {
  return (
    <>
      <Head>
        <title>{"Research — Visurena"}</title>
        <meta name="description" content="Visurena Research — field notes and essays on making stories, games, and tools with AI." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <section style={{ padding: "84px clamp(28px, 4vw, 80px) 56px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 30%, ${SAPPHIRE}14 0%, transparent 55%)`, pointerEvents: "none" }} />
            <VRFade style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: SAPPHIRE, textTransform: "uppercase" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: SAPPHIRE, boxShadow: `0 0 16px ${SAPPHIRE}80` }} />
                The Sapphire room · <Link href="/about" className="vr-link" style={{ color: SAPPHIRE }}>About</Link>
              </div>
              <h1 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(80px, 9vw, 144px)", lineHeight: 0.9, margin: 0, color: IVORY, letterSpacing: "-0.03em" }}>Research</h1>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, color: "#cdc6b6", maxWidth: 640, marginTop: 22, marginBottom: 0 }}>
                Field notes and essays on making stories, games, and tools with AI.
              </p>
            </VRFade>
          </section>

          <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center" }}>
            <VRFade>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.3em", color: SAPPHIRE, textTransform: "uppercase", marginBottom: 18 }}>&#9679; Coming soon</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, color: "#cdc6b6", maxWidth: 560, margin: "0 auto" }}>
                The first research notes are on their way. Check back shortly.
              </p>
            </VRFade>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
