import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider, NebulaBackground } from "@visurena/ui";

describe("app shell", () => {
  it("renders a persistent nebula layer with three clouds", () => {
    const { container } = render(
      <ThemeProvider section="stories"><NebulaBackground /></ThemeProvider>
    );
    expect(container.querySelector(".vr-nebula")).not.toBeNull();
    expect(container.querySelectorAll(".vr-cloud").length).toBe(3);
  });
});
