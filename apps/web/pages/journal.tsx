// pages/journal.tsx — Journal room (Pearl stone). Build log / editorial.
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
const PEARL     = "#c0c8e0";

export default function JournalPage() {
  return (
    <>
      <Head>
        <title>{"Journal — Visurena"}</title>
        <meta name="description" content="The Visurena Journal — the build log: what we shipped, why, and how." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <section style={{ padding: "84px clamp(28px, 4vw, 80px) 56px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 30%, ${PEARL}12 0%, transparent 55%)`, pointerEvents: "none" }} />
            <VRFade style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: PEARL, textTransform: "uppercase" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: PEARL, boxShadow: `0 0 16px ${PEARL}80` }} />
                The Pearl room · <Link href="/about" className="vr-link" style={{ color: PEARL }}>About</Link>
              </div>
              <h1 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(80px, 9vw, 144px)", lineHeight: 0.9, margin: 0, color: IVORY, letterSpacing: "-0.03em" }}>Journal</h1>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, color: "#cdc6b6", maxWidth: 640, marginTop: 22, marginBottom: 0 }}>
                The build log — what we shipped, why, and how it was made.
              </p>
            </VRFade>
          </section>

          <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center" }}>
            <VRFade>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.3em", color: PEARL, textTransform: "uppercase", marginBottom: 18 }}>&#9679; Coming soon</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, color: "#cdc6b6", maxWidth: 560, margin: "0 auto" }}>
                The first journal entries are being written. Check back shortly.
              </p>
            </VRFade>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
