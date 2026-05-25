import React, { CSSProperties } from "react";
import { useTheme } from "./theme";
import { VRFade } from "./VRFade";
import { VRStripe } from "./VRStripe";

interface VRRowHeaderProps {
  eyebrow: string;
  title: string;
  meta?: string;
  right?: string;
  onRightClick?: () => void;
  accentOverride?: string;
}

export function VRRowHeader({ eyebrow, title, meta, right, onRightClick, accentOverride }: VRRowHeaderProps) {
  const { accent } = useTheme();
  const ac = accentOverride || accent;
  const ink = "#f5efdb";
  return (
    <VRFade style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
      <div style={{ maxWidth: 880 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" as const }}>
          <span style={{ width: 6, height: 6, background: ac, borderRadius: "50%" }} />
          <span style={{ color: ac }}>{eyebrow}</span>
          {meta && <><VRStripe color="#3a3528" width={48} /><span style={{ color: "#7a7363" }}>{meta}</span></>}
        </div>
        <h2 style={{
          fontFamily: "'Newsreader', 'Tiempos Headline', serif", fontWeight: 600,
          fontSize: "clamp(40px, 4.6vw, 64px)", lineHeight: 1.0, margin: 0,
          color: ink, letterSpacing: "-0.02em",
        }}>{title}</h2>
      </div>
      {right && (
        <a className="vr-link vr-cta" onClick={onRightClick} style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.22em", color: ac,
          textTransform: "uppercase" as const, paddingBottom: 6, borderBottom: `1px solid ${ac}`,
          whiteSpace: "nowrap" as const, cursor: "pointer",
        }}>{right}</a>
      )}
    </VRFade>
  );
}
