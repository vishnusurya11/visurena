import React, { useEffect, useRef } from "react";
import { useTheme } from "./theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/** The four jewel verticals — used for the "studio" (home) multi-color galaxy. */
const JEWELS = ["#f5b831", "#e91e63", "#00d97e", "#c084fc"]; // amber, ruby, emerald, violet

/**
 * Persistent "nebula-gas" galaxy. A deep-space base, four large radial-gradient gas
 * clouds that drift slowly (transform/opacity only — GPU-friendly), and a twinkling
 * starfield. Honors prefers-reduced-motion (freezes drift + twinkle).
 *
 * - variant="section" (default): every cloud is tinted by the active section accent,
 *   cross-fading via a CSS transition when you move between sections.
 * - variant="studio": the home/hub look — each cloud takes a different jewel so the
 *   whole studio (Stories/Music/Movies/Games) is present at once.
 */
export function NebulaBackground({ variant = "section" }: { variant?: "section" | "studio" }) {
  const { accent } = useTheme();
  const reduced = usePrefersReducedMotion();
  const studio = variant === "studio";
  const cloud = (i: number): React.CSSProperties | undefined =>
    studio ? { background: `radial-gradient(circle at center, ${JEWELS[i]} 0%, transparent 60%)` } : undefined;

  // Subtle cursor parallax — the gas layer drifts opposite the pointer for spatial depth.
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        if (layerRef.current) layerRef.current.style.transform = `translate3d(${x * -26}px, ${y * -26}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [reduced]);

  return (
    <div aria-hidden className="vr-nebula" data-static={reduced ? "true" : "false"}
         data-variant={variant} style={{ ["--vr-accent" as string]: accent }}>
      <span className="vr-stars" />
      <div ref={layerRef} className="vr-nebula-parallax">
        <span className="vr-cloud vr-cloud-1" style={cloud(0)} />
        <span className="vr-cloud vr-cloud-2" style={cloud(1)} />
        <span className="vr-cloud vr-cloud-3" style={cloud(2)} />
        <span className="vr-cloud vr-cloud-4" style={cloud(3)} />
      </div>
      <span className="vr-grain" />
    </div>
  );
}
