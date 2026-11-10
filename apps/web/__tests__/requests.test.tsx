import { render, screen, within, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import RequestsPage, { boardStatusParts, validateRequestTitle, thanksMessage, REQUEST_FORMATS, type RequestsPageProps } from "@/pages/requests";

afterEach(cleanup); // explicit: don't rely on RTL's auto-cleanup detection

const props: RequestsPageProps = {
  section: "home",
  slate: [
    { id: "req_frankenstein", title: "Frankenstein", author: "Mary Shelley", year: "1818", format: "Episodes", votes: 517, state: "in-production", note: "Script ✓ · Cast ✓ · Ep 1 rendering", href: "/movies/frankenstein" },
    { id: "req_dracula", title: "Dracula", author: "Bram Stoker", year: "1897", format: "Episodes", votes: 412, state: "voting" },
    { id: "req_moby", title: "Moby-Dick", author: "Herman Melville", year: "1851", format: "Feature", votes: 236, state: "voting" },
    { id: "req_arcade", title: "More arcade games", format: "Games", votes: 143, state: "voting" },
  ],
  summary: { season: "2026-autumn", totalVotes: 2850, openRequests: 312, count: 4, inProduction: 1, votesLine: "2,850 votes this season" },
};

describe("Requests page", () => {
  it("renders the header with totals and the requests count in the nav", () => {
    render(<RequestsPage {...props} />);
    expect(screen.getByRole("heading", { level: 1, name: "Requests" })).toBeInTheDocument();
    const status = document.querySelector("[data-board-head] [data-status-line]") as HTMLElement;
    expect(status.textContent).toBe("4 on the board · 2,850 votes this season · 312 open requests · 1 in production");
    expect(screen.getByText("(312)")).toBeInTheDocument();
    expect(screen.getByText("Season 2026-autumn")).toBeInTheDocument();
  });

  it("renders the slate as a grid of VoteCards, in the order given, with local voting", () => {
    render(<RequestsPage {...props} />);
    const list = screen.getByRole("list", { name: "On the slate" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByText("Frankenstein")).toBeInTheDocument();
    expect(within(items[0]).getByText(/In production/)).toBeInTheDocument();
    expect(within(items[0]).getByRole("link", { name: "+ Follow" })).toHaveAttribute("href", "/movies/frankenstein");
    expect(within(items[1]).getByText("412")).toBeInTheDocument();
    const vote = within(items[1]).getByRole("button", { name: "Vote" });
    fireEvent.click(vote);
    expect(within(items[1]).getByText("413")).toBeInTheDocument();
    expect(within(items[1]).getByRole("button", { name: "Voted ✓" })).toHaveAttribute("aria-pressed", "true");
  });

  it("request form: validates, then shows a local thanks line and clears the title (no network)", () => {
    render(<RequestsPage {...props} />);
    const form = screen.getByRole("form", { name: "Request a title" });
    const title = within(form).getByLabelText("Title") as HTMLInputElement;
    const submit = within(form).getByRole("button", { name: "Submit request" });
    expect(submit).toHaveAttribute("type", "submit");

    fireEvent.click(submit);
    expect(within(form).getByRole("alert")).toHaveTextContent(/at least two characters/);
    expect(within(form).queryByRole("status")).not.toBeInTheDocument();

    fireEvent.change(title, { target: { value: "  The Time Machine " } });
    fireEvent.change(within(form).getByLabelText("Format"), { target: { value: "Feature" } });
    fireEvent.submit(form);
    expect(within(form).queryByRole("alert")).not.toBeInTheDocument();
    expect(within(form).getByRole("status")).toHaveTextContent('Thanks — "The Time Machine" (Feature) is noted on this device.');
    expect(within(form).getByRole("status")).toHaveTextContent(/sign-in/i);
    expect(title.value).toBe("");
    expect(within(form).getByText(/Sign-in required once accounts land/)).toBeInTheDocument();
  });

  it("offers the expected formats", () => {
    render(<RequestsPage {...props} />);
    const select = screen.getByLabelText("Format") as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual([...REQUEST_FORMATS]);
  });

  it("renders with an empty slate and no summary", () => {
    render(<RequestsPage section="home" />);
    expect(screen.getByText(/be the first to request a title/i)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "On the slate" })).not.toBeInTheDocument();
    const status = document.querySelector("[data-board-head] [data-status-line]") as HTMLElement;
    expect(status.textContent).toBe("0 on the board · 0 votes this season · 0 open requests");
  });
});

describe("requests helpers", () => {
  it("boardStatusParts omits 'in production' when zero", () => {
    expect(boardStatusParts({ season: "", totalVotes: 10, openRequests: 2, count: 3, inProduction: 0, votesLine: "10 votes this season" }))
      .toEqual(["3 on the board", "10 votes this season", "2 open requests"]);
    expect(boardStatusParts(props.summary)).toHaveLength(4);
  });
  it("validateRequestTitle", () => {
    expect(validateRequestTitle("")).toMatch(/at least two/);
    expect(validateRequestTitle(" a ")).toMatch(/at least two/);
    expect(validateRequestTitle("ok")).toBeNull();
    expect(validateRequestTitle("x".repeat(121))).toMatch(/under 120/);
    expect(validateRequestTitle("x".repeat(120))).toBeNull();
  });
  it("thanksMessage trims the title and names the format", () => {
    expect(thanksMessage("  Dune ", "Feature")).toMatch(/^Thanks — "Dune" \(Feature\) is noted/);
    expect(thanksMessage("Dune", "Feature")).toMatch(/nothing has left your browser/);
  });
});
