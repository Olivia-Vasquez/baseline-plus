import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadinessGauge } from "./readinessGauge";

describe("ReadinessGauge", () => {
  it("renders the score as text", () => {
    render(<ReadinessGauge score={72} />);
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("sets strokeDasharray proportional to the score", () => {
    const { container } = render(<ReadinessGauge score={45} />);
    const paths = container.querySelectorAll("path");
    const foreground = paths[1];
    expect(foreground).toHaveAttribute("stroke-dasharray", "45 100");
  });

  it("handles boundary scores of 0 and 100", () => {
    const zero = render(<ReadinessGauge score={0} />);
    expect(zero.container.querySelectorAll("path")[1]).toHaveAttribute("stroke-dasharray", "0 100");

    const full = render(<ReadinessGauge score={100} />);
    expect(full.container.querySelectorAll("path")[1]).toHaveAttribute("stroke-dasharray", "100 100");
  });
});
