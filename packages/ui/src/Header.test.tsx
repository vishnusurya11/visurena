import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "./Header";

describe("Header (legacy, untouched detail pages)", () => {
  it("renders the wordmark and primary sections", () => {
    render(<Header />);
    expect(screen.getByText("VISURENA")).toBeInTheDocument();
    ["Stories", "Movies", "Music", "Games"].forEach((s) =>
      expect(screen.getByRole("link", { name: s })).toBeInTheDocument());
  });
  it("hides Sign in and Search until they work (no dead controls)", () => {
    render(<Header />);
    expect(screen.queryByRole("button", { name: /sign in/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /search/i })).toBeNull();
  });
});
