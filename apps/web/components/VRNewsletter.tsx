import React from "react";
import { VRFade } from "@visurena/ui";

const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";

interface VRNewsletterProps {
  /** Override the eyebrow label. Defaults to "The Monday Post". */
  eyebrow?: string;
  /** Override the headline. Defaults to the studio copy. */
  headline?: React.ReactNode;
  /** Override the subtext. Defaults to the studio copy. */
  subtext?: string;
  /** Override the subscriber count line. Defaults to the studio copy. */
  subscriberLine?: string;
  /** Override the background color. Defaults to "#050505". */
  background?: string;
}

/**
 * VRNewsletter — reusable newsletter CTA section for the Visurena Studio.
 *
 * Used on the homepage and can be dropped into any page that needs
 * a subscription prompt. All copy is overridable via props.
 */
export function VRNewsletter({
  eyebrow       = "The Monday Post",
  headline,
  subtext       = "One short story, one essay, one piece of music we made that week. No tracking, no ads. Free during open beta.",
  subscriberLine = "2,847 readers subscribed · unsubscribe anytime",
  background    = "#050505",
}: VRNewsletterProps) {
  const defaultHeadline = (
    <>
      New chapters in your inbox,<br />
      <em style={{ fontStyle: "italic", color: "#f5b831" }}>every Monday morning.</em>
    </>
  );

  return (
    <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", background }}>
      <VRFade>
        <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.3em", color: "#f5b831", textTransform: "uppercase", marginBottom: 22 }}>
          &#10022; {eyebrow} &#10022;
        </div>
        <h2 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.95, color: IVORY, letterSpacing: "-0.025em", margin: 0, maxWidth: 1000, marginInline: "auto" }}>
          {headline ?? defaultHeadline}
        </h2>
        <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 20, color: "#a8a18d", marginTop: 28, maxWidth: 640, marginInline: "auto" }}>
          {subtext}
        </p>
        <form
          style={{ display: "inline-flex", gap: 0, marginTop: 44, alignItems: "stretch", width: "min(560px, 100%)" }}
          onSubmit={e => e.preventDefault()}
        >
          <input
            placeholder="your@email"
            type="email"
            style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.22)", borderRight: "none", padding: "16px 22px", color: IVORY, fontFamily: F_BODY, fontSize: 16, outline: "none" }}
          />
          <button
            className="vr-cta"
            type="submit"
            style={{ background: IVORY, color: "#0a0a0a", border: `1px solid ${IVORY}`, padding: "16px 28px", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
          >
            Subscribe
          </button>
        </form>
        <div style={{ marginTop: 22, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: "#5a5345", textTransform: "uppercase" }}>
          {subscriberLine}
        </div>
      </VRFade>
    </section>
  );
}

export default VRNewsletter;
