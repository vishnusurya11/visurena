// < 768px navigation: Home · Stories · Movies · Music · Games. 48px items, 24px icons, 12px labels.
// The active item is t1 with its icon stroked in the vertical's accent (Home = sapphire).
import React from "react";
import Link from "next/link";
import { lobbyAccentFor } from "@visurena/design-tokens";
import { FOCUS_RING, SAPPHIRE, type Vertical } from "./types";
import { LobbyIcon, type LobbyIconName } from "./icons";

export const BOTTOM_TABS: Array<{ id: Vertical; label: string; href: string; icon: LobbyIconName }> = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "stories", label: "Stories", href: "/stories", icon: "book" },
  { id: "movies", label: "Movies", href: "/movies", icon: "play" },
  { id: "music", label: "Music", href: "/music", icon: "music" },
  { id: "games", label: "Games", href: "/games", icon: "game" },
];

export interface BottomTabsProps {
  active?: Vertical;
  className?: string;
}

export function BottomTabs({ active, className = "" }: BottomTabsProps) {
  return (
    <nav
      aria-label="Tabs"
      data-bottom-tabs
      className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-hair bg-vr-bg0 px-1 md:hidden ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {BOTTOM_TABS.map((t) => {
        const on = active === t.id;
        const accent = t.id === "home" ? SAPPHIRE : lobbyAccentFor(t.id);
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[12px] font-medium no-underline ${on ? "text-vr-t1" : "text-vr-t3"} ${FOCUS_RING}`}
            data-tab={t.id}
          >
            <LobbyIcon name={t.icon} size={24} variant="stroke" style={on ? { color: accent } : undefined} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
