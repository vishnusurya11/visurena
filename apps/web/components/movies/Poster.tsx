// components/movies/Poster.tsx
//
// A lit poster that never shows a broken-image icon: if the file is missing (or no src
// is given) it renders the typeset cover from the mockup (.cover-type): chip, title,
// author · year, production state. Used for series key art and the Frankenstein card.

import React, { useState } from "react";

export interface PosterProps {
  src?: string;
  alt: string;
  title: string;
  who?: string;          // "Mary Shelley · 1818"
  chip?: string;         // "In production"
  state?: string;        // "Script ✓ · Cast ✓ · Ep 1 rendering"
  ratio?: "9:16" | "2:3" | "3:4";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

const RATIO: Record<NonNullable<PosterProps["ratio"]>, string> = { "9:16": "9 / 16", "2:3": "2 / 3", "3:4": "3 / 4" };

export function Poster({ src, alt, title, who, chip, state, ratio = "9:16", fetchPriority, className = "" }: PosterProps) {
  const [failed, setFailed] = useState(false);
  const typeset = !src || failed;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-card border border-hair bg-vr-bg2 ${className}`}
      style={{ aspectRatio: RATIO[ratio] }}
      data-poster={typeset ? "typeset" : "image"}
    >
      {typeset ? (
        <div className="flex h-full w-full flex-col gap-1.5 p-4">
          {chip ? (
            <span className="w-max rounded bg-vr-bg3 px-2 py-1 font-mono text-[12px] leading-tight tracking-[0.06em] text-vr-t1">{chip}</span>
          ) : null}
          <span className="mt-1.5 text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-vr-t1">{title}</span>
          {who ? <span className="font-mono text-[12px] text-vr-t2">{who}</span> : null}
          {state ? <span className="mt-auto font-mono text-[12px] leading-[1.5] text-vr-t2">{state}</span> : null}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          decoding="async"
          // React 18 passes unknown camelCase attrs through lower-cased; fetchpriority is a valid HTML attr.
          {...(fetchPriority ? ({ fetchpriority: fetchPriority } as Record<string, string>) : {})}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
