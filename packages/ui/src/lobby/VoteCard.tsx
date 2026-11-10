// Slate / Request board card: a typeset 2:3 cover on bg-2, format line, title, author · year,
// big tabular vote count in sapphire (the system colour), and a neutral hairline Vote button.
// In production: 2px sapphire left edge, "In production" chip, count in t1, + Follow.
// Voting state is local until the API exists.
import React, { useState } from "react";
import Link from "next/link";
import { Button, StateChip } from "./primitives";
import { FOCUS_RING } from "./types";

export interface VoteCardProps {
  id: string;
  title: string;
  author?: string;
  year?: string;
  format?: string;            // "Episodes" | "Feature" | "Shorts" | "Games" | "Stories"
  votes: number;
  state?: "in-production" | "voting";
  note?: string;              // "Script ✓ · Cast ✓ · Ep 1 rendering"
  href?: string;              // in-production → the series page
  width?: number | string;
  onVote?: (id: string) => void;
  className?: string;
}

export function VoteCard(p: VoteCardProps) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(p.votes);
  const inProd = p.state === "in-production";
  const who = [p.author, p.year].filter(Boolean).join(" · ");

  const cover = (
    <span
      className={`relative flex aspect-[2/3] w-full flex-col gap-1.5 rounded-card border border-hair bg-vr-bg2 px-3.5 pb-3 pt-3.5 ${inProd ? "border-l-2 border-l-vr-sapphire pl-[13px]" : ""}`}
      data-cover
    >
      {inProd ? (
        <StateChip state="in-production" />
      ) : (
        <span className="font-mono text-[12px] tracking-[0.06em] text-vr-t3">{p.format ?? "Request"}</span>
      )}
      <span className="mt-0.5 text-[20px] font-medium leading-[1.15] tracking-[-0.015em] text-vr-t1">{p.title}</span>
      {who ? <span className="font-mono text-[12px] tracking-[0.04em] text-vr-t2">{who}</span> : null}
      {p.note ? <span className="mt-1.5 font-mono text-[12px] leading-[1.5] tracking-[0.04em] text-vr-t2" data-note>{p.note}</span> : null}
      <span className="mt-auto flex flex-col gap-0.5">
        <span
          className={`font-mono text-[32px] font-medium leading-none tracking-[-0.01em] tabular-nums ${inProd ? "text-vr-t1" : "text-vr-sapphire"}`}
          data-votes
        >
          {count.toLocaleString("en-US")}
        </span>
        <span className="font-mono text-[12px] tracking-[0.04em] text-vr-t3">votes{inProd ? " · chosen" : ""}</span>
      </span>
    </span>
  );

  return (
    <div
      role="listitem"
      className={`lobby-card flex shrink-0 snap-start flex-col rounded-card ${p.className ?? ""}`}
      style={{ width: p.width ?? 172 }}
      data-vote-card
      data-state={p.state ?? "voting"}
    >
      {p.href ? (
        <Link href={p.href} className={`block rounded-card no-underline ${FOCUS_RING}`}>{cover}</Link>
      ) : (
        cover
      )}
      {inProd ? (
        <Button href={p.href} variant="secondary" size="sm" className="mt-2.5 w-full">+ Follow</Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="mt-2.5 w-full"
          ariaPressed={voted}
          onClick={() => {
            if (voted) return;
            setVoted(true);
            setCount((c) => c + 1);
            p.onVote?.(p.id);
          }}
        >
          {voted ? "Voted ✓" : "Vote"}
        </Button>
      )}
    </div>
  );
}
