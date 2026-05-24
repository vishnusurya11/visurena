import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/pages/index";
import { getLatestStories } from "@/lib/content";

describe("Home", () => {
  it("renders the hero and a 'New this week' row of stories", () => {
    const stories = getLatestStories(new Date("2026-06-01T00:00:00Z"));
    render(<Home stories={stories} />);
    expect(screen.getByRole("heading", { name: /the lantern mile/i })).toBeInTheDocument();
    expect(screen.getByText(/new this week/i)).toBeInTheDocument();
  });
});
