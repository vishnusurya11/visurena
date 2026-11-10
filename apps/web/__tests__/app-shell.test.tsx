import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ThemeProvider, LobbyShell } from "@visurena/ui";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("app shell (Cinema Lobby)", () => {
  it("renders nav, main and footer with no nebula, starfield or scroll-progress nodes", () => {
    const { container } = render(
      <ThemeProvider section="stories"><LobbyShell vertical="stories"><p>hello</p></LobbyShell></ThemeProvider>
    );
    expect(container.querySelector("[data-lobby-nav]")).not.toBeNull();
    expect(screen.getByRole("main")).toHaveTextContent("hello");
    expect(container.querySelector("[data-lobby-footer]")).not.toBeNull();
    [".vr-nebula", ".vr-stars-far", ".vr-stars-near", ".vr-nebula-clouds", ".vr-jewel-glows", ".vr-scroll-progress", ".vr-galaxy"].forEach((sel) =>
      expect(container.querySelector(sel)).toBeNull());
  });

  it("LobbyShell sets --vr-accent per vertical regardless of the legacy ThemeProvider section", () => {
    const { container } = render(
      <ThemeProvider section="games"><LobbyShell vertical="movies"><p /></LobbyShell></ThemeProvider>
    );
    expect(container.querySelector<HTMLElement>("[data-vertical]")!.style.getPropertyValue("--vr-accent")).toBe("#3DD68C");
  });

  it("_app.tsx loads Geist and keeps the legacy serif link, and drops the nebula + scroll progress", () => {
    const src = read("pages/_app.tsx");
    expect(src).toMatch(/fonts\.googleapis\.com\/css2\?family=Geist:/);
    expect(src).toMatch(/family=Geist\+Mono/);
    expect(src).toMatch(/family=Newsreader/);
    expect(src).not.toMatch(/NebulaBackground|VRScrollProgress/);
    expect(src).toMatch(/ThemeProvider/);
    expect(src).toMatch(/theme-color" content="#0B0C10"/);
  });

  it("globals.css: black room, Geist, content visible at rest, no banned effects, native hook", () => {
    const css = read("styles/globals.css");
    expect(css).toMatch(/html\s*\{[^}]*background:\s*#0B0C10/);
    expect(css).toMatch(/color:\s*#F2F1EC/);
    expect(css).toMatch(/font-family:\s*"Geist"/);
    // .vr-fade no longer hides content before a reveal
    const fade = css.match(/\.vr-fade\s*\{[^}]*\}/)?.[0] ?? "";
    expect(fade).toMatch(/opacity:\s*1/);
    expect(fade).not.toMatch(/opacity:\s*0[^.]/);
    // starfield / nebula / marquee / grain are gone
    expect(css).not.toMatch(/vr-nebula|vr-stars|vr-marquee|vr-scroll-progress|body::after/);
    // banned effects
    expect(css).not.toMatch(/mix-blend-mode|backdrop-filter|text-shadow/);
    expect(css).not.toMatch(/@keyframes/);
    // native mode + rails + focus ring + reduced motion
    expect(css).toMatch(/html\.native \.web-garnish\s*\{\s*display:\s*none/);
    expect(css).toMatch(/\.scrollbar-hide/);
    expect(css).toMatch(/:focus-visible\s*\{\s*outline:\s*2px solid #6C9BFF/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)\s*\{\s*\.lobby-card/);
    // legacy mobile header hacks no longer hit the lobby nav
    expect(css).not.toMatch(/^\s*header nav\s*\{/m);
    expect(css).not.toMatch(/^\s*h1\s*\{/m);
  });
});
