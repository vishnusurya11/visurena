// StatusLine, Button, StateChip, ProgressBar: the small vocabulary every page shares.
import React from "react";
import Link from "next/link";
import { FOCUS_RING, type ItemState } from "./types";

export interface StatusLineProps {
  parts: Array<string | null | undefined | false>;
  accentFirst?: boolean;   // first part in the accent colour ("Series", "Short story")
  className?: string;
  size?: 12 | 13 | 14;
}

/** `{Format} · {State} · {Count} · {Runtime}`: the one metadata voice (mono, tabular, t2). */
export function StatusLine({ parts, accentFirst, className = "", size = 13 }: StatusLineProps) {
  const p = parts.filter((x): x is string => typeof x === "string" && x.length > 0);
  return (
    <div
      className={`font-mono leading-[1.4] tracking-[0.04em] text-vr-t2 tabular-nums ${className}`}
      style={{ fontSize: size }}
      data-status-line
    >
      {p.map((x, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span className="text-vr-t3"> · </span> : null}
          <span className={i === 0 && accentFirst ? "text-vr-accent" : undefined}>{x}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "full";
  children: React.ReactNode;
  subline?: string;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  ariaPressed?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  external?: boolean;       // plain <a target="_blank" rel="noreferrer">
}

// Accent is a mark, never a button fill: primary = t1 on bg-0, secondary = hairline, ghost = text.
const VARIANT: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-vr-t1 text-vr-bg0 hover:bg-white",
  secondary: "border border-hair-2 bg-transparent text-vr-t1 hover:border-[rgba(255,255,255,0.22)] hover:bg-vr-bg2",
  ghost: "bg-transparent text-vr-t2 hover:text-vr-t1",
};
const SIZE: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3.5 text-[14px]",
  md: "h-11 px-5 text-[15px]",
  full: "h-12 w-full px-5 text-[15px]",
};

export function Button({
  href, onClick, variant = "secondary", size = "md", children, subline, icon, className = "",
  type = "button", ariaPressed, ariaLabel, disabled, external,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg font-medium leading-none no-underline transition-colors duration-fast active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 ${VARIANT[variant]} ${SIZE[size]} ${FOCUS_RING} ${className}`;
  const inner = (
    <>
      {icon ? <span aria-hidden className="inline-flex">{icon}</span> : null}
      <span>{children}</span>
    </>
  );
  const el = href ? (
    external ? (
      <a href={href} className={cls} aria-label={ariaLabel} target="_blank" rel="noreferrer">{inner}</a>
    ) : (
      <Link href={href} className={cls} aria-label={ariaLabel}>{inner}</Link>
    )
  ) : (
    <button type={type} onClick={onClick} className={cls} aria-pressed={ariaPressed} aria-label={ariaLabel} disabled={disabled}>{inner}</button>
  );
  if (!subline) return el;
  return (
    <span className={`inline-flex flex-col items-start gap-1 ${size === "full" ? "w-full" : ""}`}>
      {el}
      <span className="text-[12px] tracking-[0.02em] text-vr-t3">{subline}</span>
    </span>
  );
}

const STATE_LABEL: Record<ItemState, string> = {
  airing: "Airing", complete: "Complete", "in-production": "In production", voting: "Voting",
  new: "New", live: "Live", scheduled: "Scheduled",
};

/** Mono 12px label on bg-3, 4px radius. Text, not colour, carries the state. */
export function StateChip({ state, label, className = "" }: { state: ItemState; label?: string; className?: string }) {
  return (
    <span
      className={`inline-block w-max rounded px-2 py-1 font-mono text-[12px] leading-[1.2] tracking-[0.06em] text-vr-t1 bg-vr-bg3 ${className}`}
      data-state={state}
    >
      {label ?? STATE_LABEL[state]}
    </span>
  );
}

export function ProgressBar({ value, accent, className = "", done }: { value: number; accent?: string; className?: string; done?: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span
      className={`block h-[2px] w-full overflow-hidden rounded-[1px] bg-[rgba(255,255,255,0.08)] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="block h-full" style={{ width: `${pct}%`, background: done ? "#7A7975" : accent ?? "var(--vr-accent)" }} />
    </span>
  );
}
