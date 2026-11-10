// Section, SectionHeader, Shelf. The section header carries the vertical's accent as its mark:
// a 28×3 rule under the title. Meta sits under the title when there is a link on the right,
// otherwise on the right (mockup: "New this week … Across the studio · 8 releases").
import React from "react";
import Link from "next/link";
import { FOCUS_RING } from "./types";

export interface SectionHeaderProps {
  title: string;
  meta?: string;          // "7 stories · 2 h 49 min of reading"
  href?: string;
  hrefLabel?: string;     // "All stories →"
  accent?: string;        // hex; 3px rule under the title. Defaults to --vr-accent.
  as?: "h2" | "h3";
  className?: string;
}

const META = "font-mono text-[13px] leading-[1.4] tracking-[0.04em] text-vr-t3 tabular-nums";

export function SectionHeader({ title, meta, href, hrefLabel, accent, as: Tag = "h2", className = "" }: SectionHeaderProps) {
  const size = Tag === "h3" ? "text-[17px] leading-[1.25]" : "text-[22px] leading-[1.2]";
  return (
    <div className={`mb-1.5 flex items-end justify-between gap-4 ${className}`} data-section-header>
      <div className="flex flex-col gap-1.5">
        <Tag className={`${size} font-medium tracking-[-0.01em] text-vr-t1`}>
          {title}
          <span aria-hidden className="mt-2 block h-[3px] w-7 rounded-[2px]" style={{ background: accent ?? "var(--vr-accent)" }} data-rule />
        </Tag>
        {meta && href ? <span className={META} data-meta>{meta}</span> : null}
      </div>
      {href ? (
        <Link href={href} className={`shrink-0 ${META} text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS_RING}`}>{hrefLabel ?? "See all →"}</Link>
      ) : meta ? (
        <span className={`shrink-0 ${META}`} data-meta>{meta}</span>
      ) : null}
    </div>
  );
}

export interface ShelfProps {
  children: React.ReactNode;
  ariaLabel?: string;
  gap?: number;           // px, default 16
  className?: string;
}

/** Scroll-snap rail bleeding into the page gutter. Children set their own width. */
export function Shelf({ children, ariaLabel, gap = 16, className = "" }: ShelfProps) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={`-mx-4 flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain px-4 py-3 scrollbar-hide md:-mx-8 md:px-8 ${className}`}
      style={{ gap, scrollPaddingInline: "var(--vr-gutter, 16px)" }}
      data-shelf
    >
      {children}
    </div>
  );
}

export function Section({ children, className = "", ariaLabel }: { children: React.ReactNode; className?: string; ariaLabel?: string }) {
  return <section aria-label={ariaLabel} className={`pb-3.5 pt-6 ${className}`}>{children}</section>;
}
