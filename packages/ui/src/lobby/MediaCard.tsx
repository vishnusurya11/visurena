// The atom: a poster in a hairline frame on bg-2, optional kind chip (top-left, accent text),
// optional ep chip (bottom-left), optional play glyph, an accent floor line when there is
// progress/watched state, and a caption beneath (status line, then title).
// Hover: scale(1.04) + bg-2 under (hover:hover) and (pointer:fine) only — see `.lobby-card` in
// apps/web/styles/globals.css. Focus ring sapphire.
import React from "react";
import Link from "next/link";
import { RATIO_CSS, FOCUS_RING, type Ratio } from "./types";
import { LobbyIcon } from "./icons";

export interface MediaCardProps {
  href: string;
  title: string;
  ratio: Ratio;
  image?: string;
  imagePosition?: string;   // CSS object-position, e.g. "50% 20%"
  imageAlt?: string;        // defaults to "" (the title is in the caption)
  caption?: string;         // status line under the poster, above the title
  kind?: string;            // chip text: "Story" | "Episode" | "Single" | "Game"
  kindAccent?: string;      // hex for the chip text
  chip?: string;            // bottom-left chip, e.g. "Ep 4"
  progress?: number;        // 0..1 → accent floor line
  watched?: boolean;        // ✓ in caption, t3 floor line
  accent?: string;          // hex for the floor line; defaults to --vr-accent
  width?: number | string;  // card width (rails); default 100%
  playGlyph?: boolean;      // centred ▶ (trailers, shorts, music)
  still?: boolean;          // 16:9 frame cropped into a tall box: scale the image (1.2; 1.04 on 9:16)
  lit?: boolean;            // brighter frame (hero art)
  priority?: boolean;       // eager image loading (above the fold)
  className?: string;
}

const CHIP = "absolute rounded px-1.5 py-[3px] font-mono text-[12px] leading-[1.2] tracking-[0.06em] bg-vr-bg0/80";

export function MediaCard(p: MediaCardProps) {
  const width = p.width ?? "100%";
  const accent = p.accent ?? "var(--vr-accent)";
  const hasProgress = typeof p.progress === "number" && p.progress > 0;
  const showFloor = hasProgress || p.watched;
  const pct = p.watched && !hasProgress ? 100 : Math.round(Math.max(0, Math.min(1, p.progress ?? 0)) * 100);
  const scale = p.still ? (p.ratio === "9:16" ? 1.04 : 1.2) : 1;
  return (
    <Link
      href={p.href}
      role="listitem"
      className={`lobby-card group block shrink-0 snap-start rounded-card text-vr-t1 no-underline ${FOCUS_RING} ${p.className ?? ""}`}
      style={{ width }}
      data-media-card
      data-ratio={p.ratio}
    >
      <span
        className={`relative block overflow-hidden rounded-card border bg-vr-bg2 ${p.lit ? "border-[rgba(255,255,255,0.14)]" : "border-hair"}`}
        style={{ aspectRatio: RATIO_CSS[p.ratio] }}
        data-poster
      >
        {p.image ? (
          <img
            src={p.image}
            alt={p.imageAlt ?? ""}
            className="block h-full w-full object-cover"
            style={{ objectPosition: p.imagePosition ?? "50% 50%", transform: scale !== 1 ? `scale(${scale})` : undefined }}
            loading={p.priority ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          // Typeset cover: the fallback when no artwork exists. Never "coming soon".
          <span aria-hidden className="flex h-full w-full flex-col gap-1.5 bg-vr-bg2 p-4" data-typeset>
            {p.kind ? <span className="font-mono text-[12px] tracking-[0.06em] text-vr-t3">{p.kind}</span> : null}
            <span className="mt-1.5 text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-vr-t1">{p.title}</span>
          </span>
        )}
        {p.kind ? (
          <span className={`${CHIP} left-2 top-2`} style={{ color: p.kindAccent ?? accent }} data-kind>{p.kind}</span>
        ) : null}
        {p.chip ? (
          <span className={`${CHIP} bottom-2 left-2 text-vr-t1`} data-chip>{p.chip}</span>
        ) : null}
        {p.playGlyph ? (
          <span aria-hidden className="absolute left-1/2 top-1/2 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-vr-t1 text-vr-bg0" data-play>
            <LobbyIcon name="play" size={12} className="ml-0.5" />
          </span>
        ) : null}
      </span>

      {showFloor ? (
        <span className="mt-[2px] block h-[2px] overflow-hidden rounded-[1px] bg-[rgba(255,255,255,0.08)]" data-floor>
          <span className="block h-full" style={{ width: `${pct}%`, background: p.watched && !hasProgress ? "#7A7975" : accent }} />
        </span>
      ) : null}

      <span className="flex flex-col gap-[2px] px-[2px] pb-1.5 pt-2.5">
        {p.caption ? (
          <span className="truncate font-mono text-[12px] leading-[1.4] tracking-[0.04em] text-vr-t3 tabular-nums" data-caption>
            {p.caption}{p.watched ? " ✓" : ""}
          </span>
        ) : null}
        <span className="line-clamp-2 text-[14px] font-medium leading-[1.3] text-vr-t1">{p.title}</span>
      </span>
    </Link>
  );
}
