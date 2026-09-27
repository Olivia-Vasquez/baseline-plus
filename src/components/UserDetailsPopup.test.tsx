import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UserDetailsPopup } from "./UserDetailsPopup";

describe("UserDetailsPopup", () => {
  it("opens the dialog when the trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserDetailsPopup />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open account details" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "account-dialog-title");
  });

  it("closes the dialog when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<UserDetailsPopup />);
    await user.click(screen.getByRole("button", { name: "Open account details" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserDetailsPopup />);
    await user.click(screen.getByRole("button", { name: "Open account details" }));

    await user.click(screen.getByRole("button", { name: "Close account details" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog when clicking the overlay outside the panel", async () => {
    const user = userEvent.setup();
    const { container } = render(<UserDetailsPopup />);
    await user.click(screen.getByRole("button", { name: "Open account details" }));

    const overlay = container.querySelector(".overlay, [class*='overlay']");
    expect(overlay).toBeTruthy();
    await user.click(overlay as Element);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("switches between account and subscription tabs", async () => {
    const user = userEvent.setup();
    render(<UserDetailsPopup />);
    await user.click(screen.getByRole("button", { name: "Open account details" }));

    expect(screen.getByRole("tab", { name: /account/i })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: /subscription/i }));
    expect(screen.getByRole("tab", { name: /subscription/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Free preview")).toBeInTheDocument();
  });

  it("wraps focus from the last to the first focusable element on Tab", async () => {
    const user = userEvent.setup();
    render(<UserDetailsPopup />);
    await user.click(screen.getByRole("button", { name: "Open account details" }));

    const closeButton = screen.getByRole("button", { name: "Close account details" });
    expect(closeButton).toHaveFocus();
  });
});
