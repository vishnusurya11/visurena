import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the wordmark and primary sections", () => {
    render(<Header />);
    expect(screen.getByText("VISURENA")).toBeInTheDocument();
    ["Stories", "Movies", "Music", "Games"].forEach((s) =>
      expect(screen.getByRole("link", { name: s })).toBeInTheDocument());
  });
  it("shows a Sign In affordance", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
