import React, { CSSProperties, ReactNode } from "react";

interface VRPosterProps {
  seed?: number;
  label?: string;
  accent?: string;
  tint?: string;
  image?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function VRPoster({ seed = 0, label, accent = "#1a1a1a", tint, image, style = {}, children }: VRPosterProps) {
  const h = (seed * 47) % 360;
  const baseBg = `linear-gradient(${135 + (seed * 13) % 60}deg, hsl(${h} 18% 9%) 0%, hsl(${(h + 40) % 360} 14% 6%) 100%)`;
  return (
    <div style={{ position: "relative", background: baseBg, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)", ...style }}>
      {/* artwork layer — zooms on card hover (see .vr-poster-img) */}
      {image && <div className="vr-poster-img" style={{ position: "absolute", inset: 0, background: `url("${image}") center/cover no-repeat` }} />}
      {/* cinematic scrim for text legibility + gallery depth */}
      {image && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.32) 52%, rgba(0,0,0,0.82) 100%)" }} />}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(${(seed * 11) % 180}deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)`,
        mixBlendMode: "overlay",
      }} />
      {tint && <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at ${30 + (seed * 17) % 40}% ${30 + (seed * 23) % 40}%, ${tint}40 0%, transparent 55%)`,
        mixBlendMode: image ? "color" : "normal",
        opacity: image ? 0.5 : 1,
      }} />}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: accent, opacity: 0.55 }} />
      {children}
      {label && (
        <div style={{
          position: "absolute", left: 12, bottom: 10,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.32)", textTransform: "uppercase",
        }}>{label}</div>
      )}
    </div>
  );
}
