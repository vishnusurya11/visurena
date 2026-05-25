import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/pages/index";

describe("Home", () => {
  it("renders the hero and a 'New this week' row of stories", () => {
    render(<Home />);
    expect(screen.getAllByText(/every fifth mile, the lights forget him/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/new this week/i)).toBeInTheDocument();
  });
});
