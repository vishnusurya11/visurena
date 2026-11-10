import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Layout, { verticalForTheme } from "../components/Layout";

describe("verticalForTheme", () => {
  it("maps legacy page themes onto Cinema Lobby verticals", () => {
    expect(verticalForTheme("movies")).toBe("movies");
    expect(verticalForTheme("music")).toBe("music");
    expect(verticalForTheme("games")).toBe("games");
    expect(verticalForTheme("story")).toBe("stories");
    expect(verticalForTheme("home")).toBe("home");
    expect(verticalForTheme("blog")).toBe("home");
    expect(verticalForTheme("vr")).toBe("home");
    expect(verticalForTheme(undefined)).toBe("home");
  });
});

describe("Layout (legacy wrapper → LobbyShell)", () => {
  it("wraps children in the lobby shell with the mapped vertical accent", () => {
    const { container } = render(<Layout pageTheme="games"><p>game body</p></Layout>);
    const root = container.querySelector<HTMLElement>("[data-vertical='games']");
    expect(root).not.toBeNull();
    expect(root!.style.getPropertyValue("--vr-accent")).toBe("#B48CF7");
    expect(screen.getByRole("main")).toHaveTextContent("game body");
    expect(container.querySelector("[data-lobby-nav]")).not.toBeNull();
    expect(container.querySelector("[data-lobby-footer]")).not.toBeNull();
    expect(container.querySelector("[data-bottom-tabs]")).not.toBeNull();
  });

  it("renders no legacy chrome (TopStatusBar utility row, old header) inside", () => {
    const { container } = render(<Layout><p>x</p></Layout>);
    expect(container.querySelector("[data-vr-top-utility]")).toBeNull();
    expect(container.querySelector("[data-vertical='home']")).not.toBeNull();
  });
});
