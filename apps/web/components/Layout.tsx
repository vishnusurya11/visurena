import React from 'react';
import { LobbyShell, type Vertical } from '@visurena/ui';

interface LayoutProps {
  children: React.ReactNode;
  pageTheme?: 'home' | 'movies' | 'music' | 'games' | 'story' | 'blog' | 'vr';
}

/** Legacy page theme → Cinema Lobby vertical (sets --vr-accent, nav active state, bottom tab). */
export function verticalForTheme(pageTheme?: LayoutProps['pageTheme']): Vertical {
  switch (pageTheme) {
    case 'movies': return 'movies';
    case 'music': return 'music';
    case 'games': return 'games';
    case 'story': return 'stories';
    default: return 'home';
  }
}

/** Thin wrapper kept for the untouched legacy pages (games/*, story, vr-world): same import, new shell. */
const Layout: React.FC<LayoutProps> = ({ children, pageTheme }) => {
  return <LobbyShell vertical={verticalForTheme(pageTheme)}>{children}</LobbyShell>;
};

export default Layout;
