import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VoteCard } from "./VoteCard";

describe("VoteCard", () => {
  it("typesets format, title, author · year and a tabular vote count in sapphire", () => {
    const { container } = render(<VoteCard id="dracula" title="Dracula" author="Bram Stoker" year="1897" format="Episodes" votes={1204} />);
    expect(screen.getByRole("listitem")).toHaveAttribute("data-state", "voting");
    expect(screen.getByText("Episodes")).toBeInTheDocument();
    expect(screen.getByText("Dracula")).toBeInTheDocument();
    expect(screen.getByText("Bram Stoker · 1897")).toBeInTheDocument();
    const num = container.querySelector("[data-votes]")!;
    expect(num).toHaveTextContent("1,204");
    expect(num.className).toContain("text-vr-sapphire");
    expect(num.className).toContain("tabular-nums");
    expect(screen.getByText("votes")).toBeInTheDocument();
    expect(container.querySelector("[data-cover]")!.className).toContain("aspect-[2/3]");
  });

  it("defaults to a 172px column and accepts a width", () => {
    const { rerender } = render(<VoteCard id="a" title="A" votes={1} />);
    expect(screen.getByRole("listitem").style.width).toBe("172px");
    rerender(<VoteCard id="a" title="A" votes={1} width="100%" />);
    expect(screen.getByRole("listitem").style.width).toBe("100%");
  });

  it("votes once: count +1, label flips, aria-pressed, callback fired a single time", () => {
    const onVote = vi.fn();
    const { container } = render(<VoteCard id="moby-dick" title="Moby-Dick" votes={236} onVote={onVote} />);
    const btn = screen.getByRole("button", { name: "Vote" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);
    expect(container.querySelector("[data-votes]")).toHaveTextContent("237");
    const pressed = screen.getByRole("button", { name: "Voted ✓" });
    expect(pressed).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(pressed);
    expect(container.querySelector("[data-votes]")).toHaveTextContent("237");
    expect(onVote).toHaveBeenCalledTimes(1);
    expect(onVote).toHaveBeenCalledWith("moby-dick");
  });

  it("in production: sapphire edge, chip, note, count in t1 marked chosen, + Follow to the series", () => {
    const { container } = render(
      <VoteCard id="frankenstein" title="Frankenstein" author="Mary Shelley" year="1818" votes={517} state="in-production" note="Script ✓ · Cast ✓ · Ep 1 rendering" href="/movies/frankenstein" />
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-state", "in-production");
    expect(container.querySelector("[data-cover]")!.className).toContain("border-l-vr-sapphire");
    expect(screen.getByText("In production")).toHaveAttribute("data-state", "in-production");
    expect(container.querySelector("[data-note]")).toHaveTextContent("Script ✓ · Cast ✓ · Ep 1 rendering");
    const num = container.querySelector("[data-votes]")!;
    expect(num).toHaveTextContent("517");
    expect(num.className).toContain("text-vr-t1");
    expect(screen.getByText("votes · chosen")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Vote" })).toBeNull();
    const follow = screen.getByRole("link", { name: "+ Follow" });
    expect(follow).toHaveAttribute("href", "/movies/frankenstein");
    const coverLinks = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === "/movies/frankenstein");
    expect(coverLinks.length).toBe(2);
  });

  it("the vote button never uses an accent fill", () => {
    render(<VoteCard id="a" title="A" votes={1} />);
    expect(screen.getByRole("button", { name: "Vote" }).className).toContain("border-hair-2");
    expect(screen.getByRole("button", { name: "Vote" }).className).not.toContain("bg-vr-accent");
  });
});
