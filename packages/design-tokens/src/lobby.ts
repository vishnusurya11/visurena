// Cinema Lobby tokens (2026-09-25 redesign). Single source for web + future React Native.
// Every value here is expressible as a hex, a number, or a bezier tuple — nothing web-only.

export const lobbySurface = {
  bg0: "#0B0C10", // page
  bg1: "#141518", // section / card
  bg2: "#1C1D21", // raised / hover
  bg3: "#26272B", // overlay / menu / player chrome
  hair: "rgba(255,255,255,0.08)",
  hair2: "rgba(255,255,255,0.16)",
} as const;

export const lobbyText = {
  t1: "#F2F1EC", // warm white
  t2: "#A9A8A3", // body / meta
  t3: "#7A7975", // captions / disabled (floor for 12px on bg1)
  onAccent: "#0B0C10",
} as const;

export const lobbyAccent = {
  stories: "#E8B04B", // amber
  movies: "#3DD68C",  // emerald
  music: "#F0537A",   // ruby
  games: "#B48CF7",   // amethyst
  system: "#6C9BFF",  // sapphire: links, focus rings — never a vertical
  home: "#F2F1EC",
} as const;

export type LobbyVertical = keyof typeof lobbyAccent;

export function lobbyAccentFor(vertical: string): string {
  return (lobbyAccent as Record<string, string>)[vertical] ?? lobbyAccent.home;
}

export const lobbyMotion = {
  fast: 150,
  normal: 220,
  slow: 400,
  accentFade: 1200,
  ease: [0.22, 1, 0.36, 1] as const,
  easeCss: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const lobbyType = {
  displayXl: 64, displayLg: 48, displayMd: 36,
  titleLg: 28, titleMd: 22, titleSm: 18,
  bodyLg: 18, body: 16, bodySm: 14, label: 12,
  lineTight: 1.05, lineTitle: 1.2, lineBody: 1.55,
} as const;

export const lobbySpace = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96] as const;

export const lobbyRadius = { poster: 8, card: 10, button: 8, chip: 999, sheet: 20 } as const;
