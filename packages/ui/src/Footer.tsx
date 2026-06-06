import React from "react";
import Link from "next/link";

const VR_SECTIONS = [
  { id: "stories", slug: "stories", stone: "Amber",    color: "#f5b831" },
  { id: "movies",  slug: "movies",  stone: "Emerald",  color: "#00d97e" },
  { id: "music",   slug: "music",   stone: "Ruby",     color: "#e91e63" },
  { id: "games",   slug: "games",   stone: "Amethyst", color: "#c084fc" },
];

const IVORY = "#f5efdb";
const DISPLAY_FONT = "'Newsreader', 'Tiempos Headline', serif";
const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace";
const BODY_FONT = "'Spectral', serif";

type FooterColumn = [string, [string, string][]];

const FOOTER_COLUMNS: FooterColumn[] = [
  ["Read",        [["Stories", "/stories"], ["Web novels", "/stories"], ["Comics", "/stories"]]],
  ["Watch",       [["Movies", "/movies"], ["Shorts", "/movies"]]],
  ["Hear & play", [["Music", "/music"], ["Games", "/games"]]],
  ["About",       [["About", "/about"], ["Journal", "/journal"], ["Research", "/research"]]],
];

export function Footer() {
  return (
    <footer
      style={{
        padding: "96px clamp(28px, 4vw, 80px) 56px",
        background: "rgba(3,3,3,0.6)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
          gap: 56,
          alignItems: "flex-start",
        }}
      >
        {/* Brand column */}
        <div>
          <Link
            href="/"
            style={{
              display: "inline-block",
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 40,
              letterSpacing: "0.18em",
              color: IVORY,
              textTransform: "uppercase" as const,
              textDecoration: "none",
            }}
          >
            VISURENA
          </Link>

          <p
            style={{
              fontFamily: BODY_FONT,
              fontStyle: "italic",
              fontSize: 18,
              color: "#a8a18d",
              marginTop: 22,
              maxWidth: 360,
              lineHeight: 1.4,
            }}
          >
            A studio for everything entertainment — written, scored, made and
            shipped by one person and twelve AI coworkers.
          </p>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 14,
              fontFamily: MONO_FONT,
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "#5a5345",
              textTransform: "uppercase" as const,
            }}
          >
            <span>Estd. MMXXVI</span>
          </div>

          {/* Jewel stone badges */}
          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexWrap: "wrap" as const,
              gap: 14,
              fontFamily: MONO_FONT,
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "#5a5345",
              textTransform: "uppercase" as const,
            }}
          >
            {VR_SECTIONS.map((s) => (
              <span
                key={s.id}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: s.color,
                    display: "inline-block",
                  }}
                />
                {s.stone}
              </span>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {FOOTER_COLUMNS.map(([heading, items]) => (
          <div key={heading}>
            <div
              style={{
                fontFamily: MONO_FONT,
                fontSize: 10,
                letterSpacing: "0.24em",
                color: "#7a7363",
                textTransform: "uppercase" as const,
                marginBottom: 16,
              }}
            >
              {heading}
            </div>
            {items.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="vr-ulink"
                style={{
                  display: "block",
                  fontFamily: BODY_FONT,
                  fontSize: 16,
                  color: "rgba(245,239,219,0.74)",
                  marginBottom: 6,
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO_FONT,
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "#5a5345",
          textTransform: "uppercase" as const,
        }}
      >
        <span>© Visurena 2026 — All entertainment, one studio.</span>
        <span style={{ display: "inline-flex", gap: 18, alignItems: "center" }}>
          <Link
            href="/about"
            className="vr-ulink"
            style={{
              color: "rgba(245,239,219,0.74)",
              textDecoration: "none",
              fontFamily: MONO_FONT,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
            }}
          >
            About
          </Link>
          <span>Terms · Privacy · AI Disclosure · Accessibility</span>
        </span>
      </div>
    </footer>
  );
}
