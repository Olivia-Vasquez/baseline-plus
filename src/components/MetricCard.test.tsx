import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders as a static box when no href is provided", () => {
    render(<MetricCard value={1234} label="Steps" />);
    expect(screen.getByText("1234")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(<MetricCard value="900" label="Move calories" href="/home/move-calories" />);
    const link = screen.getByRole("link", { name: /move calories: 900\. view details/i });
    expect(link).toHaveAttribute("href", "/home/move-calories");
  });
});
