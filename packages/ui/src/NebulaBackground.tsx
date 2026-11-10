import React from "react";
import { useTheme } from "./theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * Persistent chaotic starfield + per-section nebula clouds.
 *
 * Stars are hand-distributed random positions in two SVG tiles (far / near) that
 * drift at slightly different rates with `alternate` so there's no loop-jump and
 * the relative speed reads as parallax depth. Per-section nebula clouds sit above
 * the stars as asymmetric radial-gradients tinted by --vr-accent (so each room —
 * Amber / Emerald / Ruby / Amethyst — has its own gas). The "studio" (home)
 * variant also shows all four jewel-room glows for the Diamond hub.
 *
 * Pure CSS + 2 small SVGs. No image-photo, no canvas, no JS animation, no cursor
 * parallax. Reduced motion freezes the drift; the stars stay visible.
 */
export function NebulaBackground({ variant = "section" }: { variant?: "section" | "studio" }) {
  const { accent } = useTheme();
  const reduced = usePrefersReducedMotion();
  return (
    <div
      aria-hidden
      className="vr-nebula"
      data-static={reduced ? "true" : "false"}
      data-variant={variant}
      style={{ ["--vr-accent" as string]: accent }}
    >
      <div className="vr-stars-far" />
      <div className="vr-stars-near" />
      <div className="vr-nebula-clouds" />
      {variant === "studio" && <div className="vr-jewel-glows" />}
    </div>
  );
}
