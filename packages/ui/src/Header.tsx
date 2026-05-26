import React, { useState, useEffect } from "react";
import Link from "next/link";

const VR_SECTIONS = [
  { id: "stories", slug: "stories", label: "Stories", stone: "Amber",    color: "#f5b831" },
  { id: "movies",  slug: "movies",  label: "Movies",  stone: "Emerald",  color: "#00d97e" },
  { id: "music",   slug: "music",   label: "Music",   stone: "Ruby",     color: "#e91e63" },
  { id: "games",   slug: "games",   label: "Games",   stone: "Amethyst", color: "#c084fc" },
];

const IVORY = "#f5efdb";
const DISPLAY_FONT = "'Newsreader', 'Tiempos Headline', serif";
const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace";

function VRTopUtility() {
  return (
    <div
      data-vr-top-utility
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px clamp(28px, 4vw, 80px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        fontFamily: MONO_FONT,
        fontSize: 10,
        letterSpacing: "0.2em",
        color: "#6f6856",
        textTransform: "uppercase" as const,
        whiteSpace: "nowrap" as const,
        gap: 24,
      }}
    >
      <span>
        <span style={{ color: "#cdc6b6" }}>EN</span> ⁄ ES ⁄ हिं ⁄ 한 ⁄ 中
      </span>
      {/*
        TODO(future): live "reading now" presence counter.
        Removed for now — the number was fabricated and we have no way to capture
        real concurrent-reader data yet. Restore this block once real-time presence
        analytics exist (and feed the count + cadence from live data, not a literal).
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#cdc6b6" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3e9275", display: "inline-block" }} />
          9,841 reading now &nbsp;·&nbsp; new every Monday
        </span>
      */}
      <span>Free during open beta</span>
    </div>
  );
}

function useCurrentSection(): string {
  const [section, setSection] = useState<string>("home");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pathname = window.location.pathname;
    const derived = pathname === "/" ? "home" : pathname.split("/")[1] || "home";
    setSection(derived);
  }, []);

  return section;
}

export function Header() {
  const currentSection = useCurrentSection();

  return (
    <div>
      <VRTopUtility />
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px clamp(28px, 4vw, 80px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10,10,10,0.72)",
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          boxShadow: "0 10px 30px -16px rgba(0,0,0,0.7)",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 30,
            letterSpacing: "0.28em",
            color: IVORY,
            textTransform: "uppercase" as const,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          VISURENA
        </Link>

        {/* Primary nav */}
        <nav
          style={{
            display: "flex",
            gap: 30,
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
          }}
        >
          {/* Home */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              paddingLeft: 4,
              color: currentSection === "home" ? IVORY : "rgba(235,231,218,0.78)",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: IVORY,
                borderRadius: "50%",
                transform: currentSection === "home" ? "scale(1.25)" : "scale(1)",
                transition: "transform 240ms ease",
                boxShadow: currentSection === "home" ? `0 0 12px ${IVORY}` : "none",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            Home
          </Link>

          {/* Section links */}
          {VR_SECTIONS.map((s) => {
            const isActive = s.id === currentSection;
            return (
              <Link
                key={s.id}
                href={`/${s.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  paddingLeft: 4,
                  color: isActive ? s.color : "rgba(235,231,218,0.78)",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: s.color,
                    borderRadius: "50%",
                    transform: isActive ? "scale(1.25)" : "scale(1)",
                    transition: "transform 240ms ease",
                    boxShadow: isActive ? `0 0 12px ${s.color}` : "none",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                {s.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "#a8a18d",
            textTransform: "uppercase" as const,
          }}
        >
          {/*
            TODO(future): real Search — HIDDEN until it works. Was a placeholder that just
            linked to /stories; there is no search index or results UI yet. Restore the
            <Link> below and wire it to a real search page/overlay once content search exists.

            <Link href="/stories" style={{ display: "inline-flex", gap: 8, alignItems: "center", textDecoration: "none", color: "#a8a18d" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Search
            </Link>
          */}
          {/*
            TODO(future): real auth — HIDDEN until it works. The Sign in button had no
            action. Restore the <button> below and wire it to AWS Cognito (Google / Apple /
            Facebook / email+password) per ARCHITECTURE.md. AWS stores credentials, never us.

            <button style={{ fontFamily: MONO_FONT, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: IVORY, padding: "8px 18px", border: "1px solid rgba(255,255,255,0.22)", background: "transparent", cursor: "pointer" }}>
              Sign in
            </button>
          */}
        </div>
      </header>
    </div>
  );
}
