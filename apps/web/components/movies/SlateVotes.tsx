// components/movies/SlateVotes.tsx
//
// The request-board strip used on all three Movies pages: VoteCards (shared) plus the
// dashed "Request a title →" card. `layout="grid"` = 4 × 172px columns (mockup .vote3);
// `layout="rail"` = horizontal Shelf.

import React from "react";
import Link from "next/link";
import { Shelf, VoteCard } from "@visurena/ui";
import type { SlateItem } from "./helpers";

export interface SlateVotesProps {
  items: SlateItem[];
  layout?: "grid" | "rail";
  requestCard?: boolean;   // append "Request a title →"
  width?: number;
}

export function RequestTitleCard({ width = 172 }: { width?: number }) {
  return (
    <div role="listitem" className="flex shrink-0 snap-start flex-col gap-2" style={{ width }} data-request-card>
      <Link
        href="/requests"
        className="flex flex-1 flex-col items-start justify-center gap-1.5 rounded-tile border border-dashed border-hair-2 bg-transparent p-4 no-underline transition-colors duration-fast hover:bg-vr-bg1"
        style={{ aspectRatio: "2 / 3" }}
      >
        <span aria-hidden className="mb-2 text-[40px] font-light leading-none text-vr-t2">+</span>
        <span className="text-[18px] font-medium leading-tight text-vr-t1">Request a title →</span>
        <span className="font-mono text-[12px] text-vr-t2">A book, a game, an album, anything</span>
      </Link>
      <Link href="/requests" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-hair-2 text-[14px] font-medium text-vr-t1 no-underline hover:bg-vr-bg2">
        Request
      </Link>
    </div>
  );
}

export function SlateVotes({ items, layout = "grid", requestCard = true, width = 172 }: SlateVotesProps) {
  const cards = (
    <>
      {items.map((it) => (
        <VoteCard key={it.id} {...it} width={width} />
      ))}
      {requestCard ? <RequestTitleCard width={width} /> : null}
    </>
  );
  if (layout === "rail") return <Shelf ariaLabel="On the slate">{cards}</Shelf>;
  return (
    <div role="list" className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,172px)]" data-slate-grid>
      {cards}
    </div>
  );
}
