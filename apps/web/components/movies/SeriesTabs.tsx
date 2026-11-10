// components/movies/SeriesTabs.tsx
//
// Series page extras: Cast · Audiobook · Casebook · About. The audiobook lives HERE and
// only here (owner correction: it is not a music item). Tabs only appear when their data
// exists; About always does. All panels are in the DOM; the switcher toggles `hidden`.

import React, { useState } from "react";
import { StatusLine, Button } from "@visurena/ui";
import type { Series } from "../../lib/movies";
import { CastShelf } from "./CastShelf";

export type SeriesTab = "cast" | "audiobook" | "casebook" | "about";

export function availableTabs(s: Series): Array<{ id: SeriesTab; label: string }> {
  const tabs: Array<{ id: SeriesTab; label: string }> = [];
  if (s.cast.length) tabs.push({ id: "cast", label: "Cast" });
  if (s.extras?.audiobook) tabs.push({ id: "audiobook", label: "Audiobook" });
  if (s.extras?.casebook) tabs.push({ id: "casebook", label: "Casebook" });
  tabs.push({ id: "about", label: "About the adaptation" });
  return tabs;
}

export function SeriesTabs({ series }: { series: Series }) {
  const tabs = availableTabs(series);
  const [tab, setTab] = useState<SeriesTab>(tabs[0].id);
  const ab = series.extras?.audiobook;

  return (
    <div data-series-tabs>
      <div role="tablist" aria-label="Extras" className="mb-3 flex gap-1 overflow-x-auto border-b border-hair scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`series-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`series-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`relative whitespace-nowrap px-3.5 py-3 text-[15px] font-medium transition-colors duration-fast ${tab === t.id ? "text-vr-t1" : "text-vr-t2 hover:text-vr-t1"}`}
          >
            {t.label}
            {tab === t.id ? <span aria-hidden className="absolute inset-x-3.5 -bottom-px h-[2px] bg-vr-accent" /> : null}
          </button>
        ))}
      </div>

      {series.cast.length ? (
        <div id="series-panel-cast" role="tabpanel" aria-labelledby="series-tab-cast" hidden={tab !== "cast"}>
          <CastShelf cast={series.cast} />
        </div>
      ) : null}

      {ab ? (
        <div id="series-panel-audiobook" role="tabpanel" aria-labelledby="series-tab-audiobook" hidden={tab !== "audiobook"} className="max-w-[640px] py-2">
          <div className="text-[22px] font-medium leading-tight text-vr-t1">{series.title} — the audiobook</div>
          <StatusLine
            parts={["Audiobook", ab.runtime ?? null, typeof ab.chapters === "number" ? `${ab.chapters} chapters` : null, series.year ?? null]}
            accentFirst
            className="mt-2"
          />
          <p className="mt-3 text-[15px] leading-[1.55] text-vr-t2">
            The whole novel, read chapter by chapter in the same order the episodes follow. Listen to a chapter before its episode, or after.
          </p>
          {ab.href ? (
            <div className="mt-4"><Button href={ab.href} variant="secondary">Listen</Button></div>
          ) : (
            <p className="mt-3 font-mono text-[12px] text-vr-t3">Each chapter is linked from its episode page.</p>
          )}
        </div>
      ) : null}

      {series.extras?.casebook ? (
        <div id="series-panel-casebook" role="tabpanel" aria-labelledby="series-tab-casebook" hidden={tab !== "casebook"} className="py-2">
          <p className="max-w-[640px] text-[15px] leading-[1.55] text-vr-t2">
            One case sheet per episode: what Holmes saw, what Watson missed, and the chapter of the novel each scene comes from.
          </p>
          <ol className="mt-3 grid gap-x-10 md:grid-cols-2">
            {series.episodes.map((e) => (
              <li key={e.slug} className="flex items-baseline gap-3 border-b border-hair py-2">
                <span className="w-7 shrink-0 font-mono text-[13px] text-vr-t3 tabular-nums">{String(e.n).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 text-[14px] font-medium text-vr-t1">{e.title}</span>
                {typeof e.chapter === "number" ? <span className="shrink-0 font-mono text-[12px] text-vr-t3">Ch. {e.chapter}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div id="series-panel-about" role="tabpanel" aria-labelledby="series-tab-about" hidden={tab !== "about"} className="max-w-[640px] py-2">
        <StatusLine parts={[series.author ?? null, series.year ?? null, series.subtitle ?? null]} className="mb-2" />
        <p className="text-[15px] leading-[1.55] text-vr-t2">{series.synopsis}</p>
        <p className="mt-3 text-[15px] leading-[1.55] text-vr-t2">
          {series.author && series.year
            ? `Adapted from ${series.author}'s ${series.year} novel, one chapter per episode, in the order the book tells it.`
            : "Adapted one chapter per episode, in the order the book tells it."}{" "}
          Every frame is generated with AI tools; every cut, line and choice is made by one person. Episodes play on YouTube.
        </p>
      </div>
    </div>
  );
}
