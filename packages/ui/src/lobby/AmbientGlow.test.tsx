import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AmbientGlow, glowTop } from "./AmbientGlow";

describe("glowTop", () => {
  it("appends an alpha byte to a 6-digit hex", () => {
    expect(glowTop("#3DD68C")).toBe("#3DD68C1f");
    expect(glowTop("#3DD68C", 1)).toBe("#3DD68Cff");
    expect(glowTop("#3DD68C", 0)).toBe("#3DD68C00");
  });
  it("falls back to the neutral mix tone for anything else", () => {
    expect(glowTop(undefined)).toBe("#17151A");
    expect(glowTop("var(--vr-accent)")).toBe("#17151A");
    expect(glowTop("#fff")).toBe("#17151A");
  });
});

describe("AmbientGlow", () => {
  it("is decorative, absolutely positioned and capped at 60vh", () => {
    const { container } = render(<div style={{ position: "relative" }}><AmbientGlow accent="#E8B04B" /></div>);
    const glow = container.querySelector("[data-ambient-glow]")!;
    expect(glow).toHaveAttribute("aria-hidden", "true");
    expect(glow.className).toContain("absolute");
    expect(glow.className).toContain("max-h-[60vh]");
    expect(glow.className).toContain("pointer-events-none");
    expect(container.querySelector("img")).toBeNull();
  });

  it("blurs the artwork as web garnish at .45 (hidden under html.native by globals.css)", () => {
    const { container } = render(<AmbientGlow src="/movies/a-study-in-scarlet/glow.jpg" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/movies/a-study-in-scarlet/glow.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img.className).toContain("web-garnish");
    expect(img.style.filter).toBe("blur(40px)");
    expect(img.style.opacity).toBe("0.45");
    expect(img.style.transform).toBe("scale(1.1)");
  });

  it("scales wide (16:9) art further and accepts a custom opacity", () => {
    const { container } = render(<AmbientGlow src="/x.jpg" wide opacity={0.3} />);
    const img = container.querySelector("img")!;
    expect(img.style.transform).toBe("scale(1.9)");
    expect(img.style.opacity).toBe("0.3");
  });

  it("always ends in a gradient to bg-0 so content below stays on black", () => {
    const { container } = render(<AmbientGlow src="/x.jpg" />);
    const layers = container.querySelectorAll("[data-ambient-glow] > div");
    expect(layers.length).toBe(2);
    expect(layers[1].getAttribute("style")).toContain("#0B0C10");
  });
});
