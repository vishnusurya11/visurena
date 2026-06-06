import React, { useEffect, useRef } from "react";
import { useTheme } from "./theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/** Dominant hue of the source galaxy photo (pink/magenta). Used to compute per-section
 *  hue-rotation so the photo re-tints to each vertical's accent (Music ≈ source → no shift). */
const GALAXY_BASE_HUE = 332;

/** Hue (0–360) of a hex color, or null for near-greys (e.g. the ivory home accent). */
function hexToHue(hex: string): number | null {
  const m = hex.replace("#", "");
  if (m.length < 6) return null;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.04) return null; // desaturated → keep the photo's native pink
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/**
 * Persistent galaxy background — a real NASA nebula photo as the base, with a slow
 * Ken-Burns drift, cursor parallax, animated twinkle stars, and a readability scrim.
 * Honors prefers-reduced-motion (freezes drift + twinkle).
 *
 * The photo re-tints per section via CSS `hue-rotate` (set through --vr-galaxy-hue):
 * Music keeps the source pink/magenta, other sections rotate toward their accent.
 * `variant` is kept for API compatibility (studio = home hub) but both render the photo.
 */
export function NebulaBackground({ variant = "section" }: { variant?: "section" | "studio" }) {
  const { accent } = useTheme();
  const reduced = usePrefersReducedMotion();

  const accentHue = hexToHue(accent);
  // Home (studio) shows the photo's native pink/magenta (the hero look). Section pages rotate
  // the source pink toward their accent; a null accent hue (desaturated) keeps native color.
  const galaxyHue =
    variant === "studio" || accentHue == null
      ? 0
      : ((accentHue - GALAXY_BASE_HUE + 540) % 360) - 180;

  // Subtle cursor parallax — the galaxy layer drifts opposite the pointer for spatial depth.
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
        if (layerRef.current) layerRef.current.style.transform = `translate3d(${x * -22}px, ${y * -22}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [reduced]);

  return (
    <div aria-hidden className="vr-nebula" data-static={reduced ? "true" : "false"}
         data-variant={variant}
         style={{ ["--vr-accent" as string]: accent, ["--vr-galaxy-hue" as string]: `${galaxyHue}deg` }}>
      <div ref={layerRef} className="vr-nebula-parallax">
        <span className="vr-galaxy" />
        <span className="vr-stars vr-stars-near" />
      </div>
      <span className="vr-stars vr-stars-mid" />
      <span className="vr-galaxy-scrim" />
      <span className="vr-grain" />
    </div>
  );
}
