// Cinema Lobby shell: one 60px nav, main, footer, bottom tabs under 768px. Sets --vr-accent from
// the vertical so every child can use `text-vr-accent` / `bg-vr-accent` / `border-vr-accent`.
// Values mirror the approved mockup (redesign/site/mockup-lobby.html): nav grid 1fr auto 1fr,
// 15px/500 links with a 2px accent underline, 44px icon buttons, 36px Continue pill, 44px avatar;
// footer 2fr + 5 columns, 14px links, mono bottom line. No backdrop-filter, no text-shadow.
import React from "react";
import Link from "next/link";
import { lobbyAccentFor } from "@visurena/design-tokens";
import { VERTICALS, FOCUS_RING, SAPPHIRE, type Vertical } from "./types";
import { LobbyIcon } from "./icons";
import { BottomTabs } from "./BottomTabs";

/** Pages that are the studio speaking (not a vertical): sapphire, listed after the four rooms. */
export type StudioPage = "requests" | "research";

export interface LobbyNavProps {
  active?: Vertical | StudioPage;
  requestsCount?: number;
  continueLabel?: string;   // "Ep 7 · 4 min left"
  continueHref?: string;
  /** Renders the search icon button when set. Off by default: no search index exists yet. */
  searchHref?: string;
  /** Renders the account avatar when set. Off by default: no auth exists yet. */
  accountHref?: string;
  accountInitial?: string;
}

const NAV_LINK = `relative flex h-full items-center gap-1.5 whitespace-nowrap text-[15px] font-medium no-underline transition-colors duration-fast ${FOCUS_RING}`;

function NavLink({
  href, label, accent, active, count,
}: { href: string; label: string; accent: string; active: boolean; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${NAV_LINK} ${active ? "text-vr-t1" : "text-vr-t2 hover:text-vr-t1"}`}
    >
      {label}
      {typeof count === "number" ? (
        <span className="font-mono text-[13px] tracking-[0.04em] text-vr-t2 tabular-nums">({count.toLocaleString("en-US")})</span>
      ) : null}
      {active ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: accent }} data-nav-underline /> : null}
    </Link>
  );
}

export function LobbyNav({
  active, requestsCount, continueLabel, continueHref, searchHref, accountHref, accountInitial = "V",
}: LobbyNavProps) {
  return (
    <header
      className="sticky top-0 z-50 h-14 border-b border-hair bg-[rgba(11,12,16,0.92)] text-vr-t1 md:h-[60px]"
      data-lobby-nav
    >
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[1fr_auto] items-center px-4 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <Link href="/" aria-label="Visurena home" className={`text-[15px] font-medium tracking-[0.06em] text-vr-t1 no-underline ${FOCUS_RING}`}>
          VISURENA
        </Link>

        <nav aria-label="Primary" className="hidden h-full gap-7 justify-self-center md:flex">
          {VERTICALS.map((v) => (
            <NavLink key={v.id} href={v.href} label={v.label} accent={lobbyAccentFor(v.id)} active={active === v.id} />
          ))}
          <NavLink href="/requests" label="Requests" accent={SAPPHIRE} active={active === "requests"} count={requestsCount} />
          <NavLink href="/research" label="Research" accent={SAPPHIRE} active={active === "research"} />
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {/* < 768px: Requests lives in the top bar as a chip (the bottom tabs carry the four rooms). */}
          <Link
            href="/requests"
            aria-current={active === "requests" ? "page" : undefined}
            className={`mr-1 inline-flex h-8 items-center gap-1.5 rounded-2xl border border-hair-2 px-2.5 font-mono text-[12px] tracking-[0.04em] text-vr-t1 no-underline md:hidden ${FOCUS_RING}`}
            data-requests-chip
          >
            Requests
            {typeof requestsCount === "number" ? <b className="font-medium text-vr-sapphire tabular-nums">{requestsCount.toLocaleString("en-US")}</b> : null}
          </Link>

          {searchHref ? (
            <Link
              href={searchHref}
              aria-label="Search"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-vr-t2 transition-colors duration-fast hover:bg-vr-bg2 hover:text-vr-t1 ${FOCUS_RING}`}
            >
              <LobbyIcon name="search" size={20} />
            </Link>
          ) : null}

          {continueLabel && continueHref ? (
            <Link
              href={continueHref}
              className={`hidden h-9 items-center gap-2 rounded-[18px] border border-hair-2 bg-vr-bg1 pl-3 pr-3.5 text-vr-t1 no-underline transition-colors duration-fast hover:bg-vr-bg2 md:inline-flex ${FOCUS_RING}`}
              data-continue-pill
            >
              <LobbyIcon name="play" size={12} />
              <span className="font-mono text-[13px] tracking-[0.04em] tabular-nums">{continueLabel}</span>
            </Link>
          ) : null}

          {accountHref ? (
            <Link
              href={accountHref}
              aria-label="Your account"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-hair bg-vr-bg3 text-[14px] font-medium text-vr-t1 no-underline ${FOCUS_RING}`}
              data-avatar
            >
              {accountInitial}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export interface FooterColumn { title: string; links: Array<{ label: string; href: string }> }

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  { title: "Stories", links: [{ label: "All stories", href: "/stories" }] },
  { title: "Movies", links: [{ label: "Movies hub", href: "/movies" }] },
  { title: "Music", links: [{ label: "All music", href: "/music" }] },
  { title: "Games", links: [{ label: "All games", href: "/games" }] },
  {
    title: "Studio",
    links: [
      { label: "Request board", href: "/requests" },
      { label: "About", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Research", href: "/research" },
    ],
  },
];

export interface LobbyFooterProps {
  columns?: FooterColumn[];
  tagline?: string;
  language?: string;
  year?: number;
}

export const TAGLINE = "Stories, movies, music, games. You choose what’s next.";
export const AI_LINE = "Every frame on this site is generated with AI tools. Every cut, line and choice is made by one person.";

export function LobbyFooter({
  columns = DEFAULT_FOOTER_COLUMNS,
  tagline = TAGLINE,
  language = "English",
  year = 2026,
}: LobbyFooterProps) {
  return (
    <footer className="mt-4 border-t border-hair bg-vr-bg0 pb-8 pt-10 text-vr-t2" data-lobby-footer>
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid grid-cols-2 gap-7 md:grid-cols-3 lg:grid-cols-[2fr_repeat(5,1fr)]">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <span className="text-[15px] font-medium tracking-[0.06em] text-vr-t1">VISURENA</span>
            <p className="mt-3.5 max-w-[240px] text-[14px] text-vr-t2">{tagline}</p>
          </div>
          {columns.map((c) => (
            <div key={c.title} className="flex flex-col gap-2">
              <h4 className="mb-1 text-[14px] font-medium text-vr-t1">{c.title}</h4>
              {c.links.map((l) => (
                <Link key={l.href + l.label} href={l.href} className={`text-[14px] text-vr-t2 no-underline hover:text-vr-t1 ${FOCUS_RING}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-between gap-6 border-t border-hair pt-5 font-mono text-[12px] tracking-[0.04em] text-vr-t3">
          {/* Multi-language is deferred (ARCHITECTURE.md), so this is a line, not a dead select. */}
          <span data-language>Language · {language}</span>
          <p className="max-w-[60ch]">{AI_LINE}</p>
          <span>© Visurena {year}</span>
        </div>
      </div>
    </footer>
  );
}

export interface LobbyShellProps {
  vertical: Vertical;
  children: React.ReactNode;
  nav?: Omit<LobbyNavProps, "active">;
  footer?: LobbyFooterProps;
  /** Hide the < 768px bottom tab bar (e.g. inside a full-screen game). */
  hideTabs?: boolean;
  /** A studio page (Requests, Research): current in the nav, sapphire accent. Use with vertical="home". */
  studio?: StudioPage;
}

export function LobbyShell({ vertical, children, nav, footer, hideTabs, studio }: LobbyShellProps) {
  const accent = studio ? SAPPHIRE : lobbyAccentFor(vertical);
  const active = studio ?? (vertical === "home" ? undefined : vertical);
  return (
    <div
      data-vertical={vertical}
      data-studio={studio}
      style={{ ["--vr-accent" as string]: accent }}
      className={`flex min-h-screen flex-col bg-vr-bg0 font-sans text-vr-t1 antialiased ${hideTabs ? "" : "pb-14 md:pb-0"}`}
    >
      <LobbyNav active={active} {...nav} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 md:px-8">{children}</main>
      <LobbyFooter {...footer} />
      {hideTabs ? null : <BottomTabs active={vertical} />}
    </div>
  );
}
