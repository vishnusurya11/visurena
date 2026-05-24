import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
  const { accent } = useTheme();
  return <span data-testid="accent">{accent}</span>;
}

describe("ThemeProvider", () => {
  it("uses the section accent when no item accent is set", () => {
    render(<ThemeProvider section="movies"><Probe /></ThemeProvider>);
    expect(screen.getByTestId("accent").textContent).toBe("#00d97e");
  });
  it("prefers the item accent when provided", () => {
    render(<ThemeProvider section="stories" itemAccent="#7c8fa8"><Probe /></ThemeProvider>);
    expect(screen.getByTestId("accent").textContent).toBe("#7c8fa8");
  });
});
