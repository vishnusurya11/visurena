import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider, NebulaBackground } from "@visurena/ui";

describe("app shell", () => {
  it("renders a persistent nebula layer with drifting gas clouds and a starfield", () => {
    const { container } = render(
      <ThemeProvider section="stories"><NebulaBackground /></ThemeProvider>
    );
    expect(container.querySelector(".vr-nebula")).not.toBeNull();
    expect(container.querySelectorAll(".vr-cloud").length).toBe(4);
    expect(container.querySelector(".vr-stars")).not.toBeNull();
  });
});
