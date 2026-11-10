// components/movies/EpisodePanel.tsx
//
// The 400px side panel next to the player: tabs Episodes (compact EpisodeRows, the
// playing one pinned sticky) · Chapters · About. All three tab bodies are rendered on
// the server; the tab switcher only toggles `hidden`, so content exists at first paint.

import React, { useState } from "react";
import { EpisodeRow, StatusLine } from "@visurena/ui";
import type { Episode, Series } from "../../lib/movies";
import type { EpisodeProgress } from "./progress";
import { episodeState } from "./progress";
import { chaptersFor, episodeHref } from "./helpers";

export type PanelTab = "episodes" | "chapters" | "about";

export interface EpisodePanelProps {
  series: Series;
  current: Episode;
  statusParts: string[];          // seriesStatusParts(series), computed server-side
  progress?: EpisodeProgress | null;
  initialTab?: PanelTab;
  className?: string;
}

const TABS: Array<{ id: PanelTab; label: string }> = [
  { id: "episodes", label: "Episodes" },
  { id: "chapters", label: "Chapters" },
  { id: "about", label: "About" },
];

export function EpisodePanel({ series, current, statusParts, progress, initialTab = "episodes", className = "" }: EpisodePanelProps) {
  const [tab, setTab] = useState<PanelTab>(initialTab);
  const chapters = chaptersFor(current);

  return (
    <aside
      className={`flex flex-col overflow-hidden rounded-card border border-hair bg-vr-bg1 ${className}`}
      aria-label="Episode panel"
      data-episode-panel
    >
      <div role="tablist" aria-label="Panel" className="flex shrink-0 gap-1 border-b border-hair px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`panel-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`relative px-3 py-3.5 text-[14px] font-medium transition-colors duration-fast ${tab === t.id ? "text-vr-t1" : "text-vr-t2 hover:text-vr-t1"}`}
          >
            {t.label}
            {tab === t.id ? <span aria-hidden className="absolute inset-x-3 -bottom-px h-[2px] bg-vr-accent" /> : null}
          </button>
        ))}
      </div>

      <div id="panel-episodes" role="tabpanel" aria-labelledby="panel-tab-episodes" hidden={tab !== "episodes"} className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {series.episodes.map((e) => {
          const isNow = e.n === current.n;
          const st = episodeState(progress, e.n);
          const row = (
            <EpisodeRow
              n={e.n}
              title={e.title}
              href={episodeHref(series.slug, e)}
              runtime={e.runtime}
              still={e.still}
              watched={st === "watched"}
              current={isNow}
              compact
            />
          );
          return isNow ? (
            <div key={e.slug} className="sticky top-0 z-10 bg-vr-bg1" data-pinned>{row}</div>
          ) : (
            <div key={e.slug}>{row}</div>
          );
        })}
      </div>

      <div id="panel-chapters" role="tabpanel" aria-labelledby="panel-tab-chapters" hidden={tab !== "chapters"} className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="font-mono text-[12px] text-vr-t3">Ep {current.n} · {chapters.length} chapter{chapters.length === 1 ? "" : "s"}</div>
        <ol className="mt-2 divide-y divide-[rgba(255,255,255,0.08)]">
          {chapters.map((c) => (
            <li key={c.label} className="flex items-baseline gap-3 py-2.5">
              <span className="w-12 shrink-0 font-mono text-[12px] text-vr-t3 tabular-nums">{c.at}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-vr-t1">{c.title}</span>
                <span className="block font-mono text-[12px] text-vr-t3">{c.label} of the novel</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div id="panel-about" role="tabpanel" aria-labelledby="panel-tab-about" hidden={tab !== "about"} className="min-h-0 flex-1 overflow-y-auto p-4">
        {series.subtitle ? <div className="text-[15px] font-medium text-vr-t2">{series.subtitle}</div> : null}
        <div className="text-[18px] font-medium leading-tight text-vr-t1">{series.title}</div>
        <StatusLine parts={statusParts} accentFirst className="mt-2" size={12} />
        <p className="mt-3 text-[14px] leading-[1.55] text-vr-t2">{series.synopsis}</p>
        {series.author || series.year ? (
          <p className="mt-3 font-mono text-[12px] text-vr-t3">
            Adapted from the {series.year ? `${series.year} ` : ""}novel{series.author ? ` by ${series.author}` : ""} · Played on YouTube
          </p>
        ) : null}
      </div>
    </aside>
  );
}
