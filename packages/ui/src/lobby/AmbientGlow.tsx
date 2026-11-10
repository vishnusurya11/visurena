// The only light source: a blurred copy of the artwork under a gradient to bg-0, capped at 60vh.
// Parent must be `position: relative`; siblings need `position: relative; z-index: 1`.
// The blur is web garnish (class web-garnish, hidden under html.native); on native the same slot
// is a two-stop gradient from the item accent, which is also the no-image fallback here.
import React from "react";

export interface AmbientGlowProps {
  src?: string;
  accent?: string;      // hex; used for the fallback gradient
  opacity?: number;     // default .45
  wide?: boolean;       // 16:9 source art: scale 1.9 so the blur fills a tall glow
  className?: string;
}

const BG0 = "#0B0C10";
const MIX = "#17151A";

/** `#RRGGBB` + alpha → `#RRGGBBAA`; anything else falls back to the neutral mix tone. */
export function glowTop(accent: string | undefined, alpha = 0.12): string {
  if (!accent || !/^#[0-9a-f]{6}$/i.test(accent)) return MIX;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
  return `${accent}${a}`;
}

export function AmbientGlow({ src, accent, opacity = 0.45, wide, className = "" }: AmbientGlowProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-full max-h-[60vh] overflow-hidden ${className}`}
      data-ambient-glow
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${glowTop(accent)} 0%, ${BG0} 100%)` }} />
      {src ? (
        <img
          src={src}
          alt=""
          className="web-garnish absolute inset-0 h-full w-full object-cover"
          style={{ filter: "blur(40px)", transform: wide ? "scale(1.9)" : "scale(1.1)", opacity }}
          loading="eager"
          decoding="async"
        />
      ) : null}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG0} 100%)` }} />
    </div>
  );
}
