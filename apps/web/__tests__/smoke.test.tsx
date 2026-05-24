import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello() { return <h1>Visurena</h1>; }

describe("test tooling", () => {
  it("renders a component", () => {
    render(<Hello />);
    expect(screen.getByRole("heading", { name: "Visurena" })).toBeInTheDocument();
  });
});
