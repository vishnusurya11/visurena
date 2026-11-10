// Mirror of src/colors.ts + src/lobby.ts for Tailwind (CJS so tailwind.config can require it).
// `vr-*` = the Cinema Lobby system (2026-09-25 redesign). `jewel-*` / `ink-*` = legacy, kept
// until the remaining pages are migrated.
module.exports = {
  theme: {
    extend: {
      colors: {
        // ── Cinema Lobby ─────────────────────────────────────────────
        vr: {
          bg0: "#0B0C10", bg1: "#141518", bg2: "#1C1D21", bg3: "#26272B",
          t1: "#F2F1EC", t2: "#A9A8A3", t3: "#7A7975",
          amber: "#E8B04B", emerald: "#3DD68C", ruby: "#F0537A", amethyst: "#B48CF7", sapphire: "#6C9BFF",
          accent: "var(--vr-accent)",
        },
        // ── legacy ───────────────────────────────────────────────────
        jewel: {
          amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e",
          amethyst: "#c084fc", sapphire: "#5b8def", ivory: "#f5efdb",
        },
        ink: { DEFAULT: "#101012", black: "#0a0a0b", raise: "#16161a" },
      },
      borderColor: {
        hair: "rgba(255,255,255,0.08)",
        "hair-2": "rgba(255,255,255,0.16)",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        // legacy
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: { label: "0.06em", legacy: "0.18em" },
      borderRadius: { card: "8px", tile: "10px" },
      transitionDuration: { fast: "150ms", normal: "220ms", slow: "400ms" },
      transitionTimingFunction: { vr: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
};
