import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContentCard } from "./ContentCard";

describe("ContentCard", () => {
  it("shows title, genre, and links to the item", () => {
    render(<ContentCard section="stories" slug="lantern-mile" title="The Lantern Mile" genre="Horror" accent="#7c8fa8" />);
    expect(screen.getByText("The Lantern Mile")).toBeInTheDocument();
    expect(screen.getByText("Horror")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/stories/lantern-mile");
  });
});
