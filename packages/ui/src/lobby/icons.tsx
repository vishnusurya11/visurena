// Inline line icons (1.6px stroke, round caps) copied from the mockup's <symbol> sheet.
// `play` is a filled glyph in a 12-unit box; everything else is a 24-unit stroked path.
import React from "react";

export type LobbyIconName = "play" | "search" | "home" | "book" | "music" | "game" | "user" | "list" | "share";

const PATHS: Record<LobbyIconName, React.ReactNode> = {
  play: <path d="M2 1.2v9.6L10.5 6z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  book: <path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" />,
  music: <><circle cx="7" cy="17" r="3" /><circle cx="17" cy="15" r="3" /><path d="M10 17V6l10-2v11" /></>,
  game: <><rect x="3" y="8" width="18" height="10" rx="4" /><path d="M8 11v4M6 13h4M15.5 12h.01M18 14h.01" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  list: <path d="M5 7h14M5 12h14M5 17h9" />,
  share: <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />,
};

export interface LobbyIconProps {
  name: LobbyIconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** `fill` paints the glyph solid; `stroke` outlines it. Defaults to fill for `play`, stroke otherwise. */
  variant?: "fill" | "stroke";
}

export function LobbyIcon({ name, size = 20, className = "", style, variant }: LobbyIconProps) {
  const mode = variant ?? (name === "play" ? "fill" : "stroke");
  const viewBox = name === "play" ? "0 0 12 12" : "0 0 24 24";
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      data-icon={name}
      fill={mode === "fill" ? "currentColor" : "none"}
      stroke={mode === "stroke" ? "currentColor" : "none"}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
