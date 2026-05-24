// Mirror of src/colors.ts for Tailwind (CJS so tailwind.config can require it).
module.exports = {
  theme: {
    extend: {
      colors: {
        jewel: {
          amber: "#f5b831", ruby: "#e91e63", emerald: "#00d97e",
          amethyst: "#c084fc", sapphire: "#5b8def", ivory: "#f5efdb",
        },
        ink: { DEFAULT: "#101012", black: "#0a0a0b", raise: "#16161a" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { label: "0.18em" },
    },
  },
};
