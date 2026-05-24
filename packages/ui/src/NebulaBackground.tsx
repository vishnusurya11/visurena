import React from "react";
import { useTheme } from "./theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * Persistent jewel "nebula gas". Three large radial-gradient clouds drift slowly
 * (transform/opacity only — GPU-friendly). Color comes from the active theme accent,
 * cross-fading via a CSS transition. Honors prefers-reduced-motion (freezes drift).
 */
export function NebulaBackground() {
  const { accent } = useTheme();
  const reduced = usePrefersReducedMotion();
  return (
    <div aria-hidden className="vr-nebula" data-static={reduced ? "true" : "false"}
         style={{ ["--vr-accent" as string]: accent }}>
      <span className="vr-cloud vr-cloud-1" />
      <span className="vr-cloud vr-cloud-2" />
      <span className="vr-cloud vr-cloud-3" />
      <span className="vr-grain" />
    </div>
  );
}
