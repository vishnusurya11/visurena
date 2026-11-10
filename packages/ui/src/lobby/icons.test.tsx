import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LobbyIcon } from "./icons";

describe("LobbyIcon", () => {
  it("play is a filled 12-unit glyph; the rest are 24-unit 1.6px strokes", () => {
    const { container, rerender } = render(<LobbyIcon name="play" size={12} />);
    let svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", "0 0 12 12");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("stroke", "none");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    rerender(<LobbyIcon name="search" />);
    svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("stroke-width", "1.6");
    expect(svg).toHaveAttribute("width", "20");
  });

  it("can force a stroked play (bottom tabs) and carries its name", () => {
    const { container } = render(<LobbyIcon name="play" variant="stroke" size={24} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("data-icon", "play");
    expect(svg).toHaveAttribute("width", "24");
  });
});
