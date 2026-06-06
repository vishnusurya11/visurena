import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider, NebulaBackground } from "@visurena/ui";

describe("app shell", () => {
  it("renders a persistent galaxy photo layer, parallax, and a starfield", () => {
    const { container } = render(
      <ThemeProvider section="stories"><NebulaBackground /></ThemeProvider>
    );
    expect(container.querySelector(".vr-nebula")).not.toBeNull();
    expect(container.querySelector(".vr-galaxy")).not.toBeNull();
    expect(container.querySelector(".vr-nebula-parallax")).not.toBeNull();
    expect(container.querySelectorAll(".vr-stars").length).toBeGreaterThanOrEqual(2);
  });

  it("re-tints the galaxy per section via --vr-galaxy-hue", () => {
    const music = render(
      <ThemeProvider section="music"><NebulaBackground /></ThemeProvider>
    );
    const musicHue = music.container
      .querySelector<HTMLElement>(".vr-nebula")!
      .style.getPropertyValue("--vr-galaxy-hue");
    const movies = render(
      <ThemeProvider section="movies"><NebulaBackground /></ThemeProvider>
    );
    const moviesHue = movies.container
      .querySelector<HTMLElement>(".vr-nebula")!
      .style.getPropertyValue("--vr-galaxy-hue");
    // Music ≈ the source pink (near 0°); Movies (emerald) is rotated well away from it.
    expect(Math.abs(parseFloat(musicHue))).toBeLessThan(30);
    expect(Math.abs(parseFloat(moviesHue))).toBeGreaterThan(90);
  });
});
