// Numbered episode row: 9:16 still, number, title, runtime, tick / progress.
// Default (series page, 2 columns): 56×100 still, grid 56px 32px 1fr, hairline under each row,
// 2px left edge in the accent when current. Compact (episode-page panel): 72px rows, 40×71 still,
// grid 40px 28px 1fr auto, runtime on the right, current row sticky.
import React from "react";
import Link from "next/link";
import { ProgressBar } from "./primitives";
import { FOCUS_RING } from "./types";

export interface EpisodeRowProps {
  n: number;
  title: string;
  href: string;
  runtime?: string;
  date?: string;
  still?: string;
  stillPosition?: string;  // object-position for the still
  progress?: number;       // 0..1
  watched?: boolean;
  current?: boolean;
  compact?: boolean;       // 72px rows for the side panel
}

const MONO = "font-mono text-[12px] leading-[1.4] tracking-[0.04em] text-vr-t3 tabular-nums";

export function EpisodeRow(p: EpisodeRowProps) {
  const num = String(p.n).padStart(2, "0");
  const hasProgress = typeof p.progress === "number" && p.progress > 0;
  const img = p.still ? (
    <img
      src={p.still}
      alt=""
      className="block h-full w-full object-cover"
      style={{ objectPosition: p.stillPosition ?? "50% 50%", transform: "scale(1.04)" }}
      loading="lazy"
      decoding="async"
    />
  ) : null;

  if (p.compact) {
    return (
      <Link
        href={p.href}
        aria-current={p.current ? "true" : undefined}
        className={`grid h-[72px] grid-cols-[40px_28px_1fr_auto] items-center gap-3 border-b border-l-2 border-b-hair pl-3.5 pr-4 no-underline transition-colors duration-fast hover:bg-vr-bg2 ${FOCUS_RING} ${
          p.current ? "sticky top-0 z-[1] border-l-vr-accent bg-vr-bg2" : "border-l-transparent"
        }`}
        data-episode-row
        data-compact
      >
        <span className="relative block h-[71px] w-10 overflow-hidden rounded border border-hair bg-vr-bg2">{img}</span>
        <span className={MONO}>{num}</span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <b className="truncate text-[14px] font-medium leading-[1.3] text-vr-t1">{p.title}</b>
          {p.watched || hasProgress ? (
            <ProgressBar value={p.watched && !hasProgress ? 1 : p.progress ?? 0} done={p.watched && !hasProgress} className="!w-24" />
          ) : null}
        </span>
        <span className={MONO}>{p.runtime}</span>
      </Link>
    );
  }

  const meta = [p.runtime, p.date].filter(Boolean).join(" · ");
  const tail = p.current ? "Now playing" : p.watched ? "Watched ✓" : null;
  return (
    <Link
      href={p.href}
      aria-current={p.current ? "true" : undefined}
      className={`grid grid-cols-[56px_32px_1fr] items-center gap-3.5 rounded-r-card border-b border-l-2 border-b-hair py-2 pl-2.5 pr-2 no-underline transition-colors duration-fast hover:bg-vr-bg2 ${FOCUS_RING} ${
        p.current ? "border-l-vr-accent bg-vr-bg1" : "border-l-transparent"
      }`}
      data-episode-row
    >
      <span className="relative block h-[100px] w-14 overflow-hidden rounded-md border border-hair bg-vr-bg2">{img}</span>
      <span className={MONO}>{num}</span>
      <span className="flex min-w-0 flex-col gap-1">
        <b className="line-clamp-2 text-[15px] font-medium leading-[1.3] text-vr-t1">{p.title}</b>
        <span className={MONO}>{[meta, tail].filter(Boolean).join(" · ")}</span>
        {hasProgress && !p.watched ? <ProgressBar value={p.progress ?? 0} className="mt-0.5 max-w-[160px]" /> : null}
      </span>
    </Link>
  );
}
