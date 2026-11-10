// components/movies/actions.tsx
//
// Follow and Share. Both are local-only until accounts / the API exist: Follow toggles
// an aria-pressed state, Share uses the Web Share API when present and falls back to
// copying the URL. No network, no analytics.

import React, { useState } from "react";
import { Button } from "@visurena/ui";

export function FollowButton({ title, variant = "secondary", className = "" }: { title: string; variant?: "primary" | "secondary"; className?: string }) {
  const [on, setOn] = useState(false);
  return (
    <span title={on ? `Following ${title}` : `Follow ${title}`}>
      <Button variant={variant} className={className} ariaPressed={on} onClick={() => setOn((v) => !v)}>
        {on ? "Following ✓" : "+ Follow"}
      </Button>
    </span>
  );
}

export function ShareButton({ title, url, className = "" }: { title: string; url?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const href = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      const nav = typeof navigator !== "undefined" ? navigator : undefined;
      if (nav && typeof nav.share === "function") {
        await nav.share({ title, url: href });
        return;
      }
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled or clipboard blocked: nothing to recover */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : "Share"}
      className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-lg px-2 font-mono text-[12px] text-vr-t2 transition-colors duration-fast hover:bg-vr-bg2 hover:text-vr-t1 ${className}`}
      data-share
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 13v6h14v-6" />
      </svg>
      {copied ? <span>Link copied</span> : null}
    </button>
  );
}
