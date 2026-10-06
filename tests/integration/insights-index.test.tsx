import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect } from "vitest";
import { InsightsIndex } from "@/components/insights/insights-index";
afterEach(cleanup);
const items = Array.from({ length: 5 }, (_, i) => ({
  slug: `fixture-${i}`,
  title: `Article ${i}`,
  excerpt: i === 2 ? "Queue reliability" : "Product thinking",
  category: i % 2 ? "Product" : "Engineering",
  publishedAt: null,
}));
describe("Insights collection", () => {
  it("combines category and excerpt search, clears an empty result and retains the featured article", async () => {
    const user = userEvent.setup();
    render(<InsightsIndex items={items} locale="en" />);
    const index = screen.getByRole("region", { name: "LATEST THINKING" });
    await user.click(screen.getByRole("button", { name: "Engineering" }));
    expect(within(index).getAllByRole("article")).toHaveLength(3);
    await user.type(screen.getByRole("searchbox"), "Queue");
    expect(within(index).getAllByRole("article")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Product" }));
    expect(within(index).queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText("No insights match this selection.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(within(index).getAllByRole("article")).toHaveLength(5);
  });
  it("omits unnecessary search and category controls for a small collection", () => {
    render(<InsightsIndex items={items.slice(0, 1)} locale="ar" />);
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "الكل" })).toBeNull();
    expect(screen.queryByRole("time")).toBeNull();
  });
});
