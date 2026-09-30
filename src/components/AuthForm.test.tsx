import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authClientMock, routerMock } = vi.hoisted(() => ({
  authClientMock: {
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
  },
  routerMock: { replace: vi.fn(), refresh: vi.fn() },
}));

vi.mock("@/lib/auth-client", () => ({ authClient: authClientMock }));
vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));

import { AuthForm } from "./AuthForm";

beforeEach(() => {
  authClientMock.signIn.email.mockReset();
  authClientMock.signUp.email.mockReset();
  routerMock.replace.mockReset();
  routerMock.refresh.mockReset();
});

describe("AuthForm", () => {
  it("creates an account and confirms that verification email was sent", async () => {
    const user = userEvent.setup();
    authClientMock.signUp.email.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    render(<AuthForm localVerificationLink />);

    await user.click(screen.getByRole("button", { name: "Create account" }));
    await user.type(screen.getByLabelText("Name"), "Sam Example");
    await user.type(screen.getByLabelText("Email"), "  SAM@example.com ");
    await user.type(screen.getByLabelText("Password"), "a-secure-password");
    await user.click(within(screen.getByRole("form", { name: "Create account form" })).getByRole("button"));

    expect(authClientMock.signUp.email).toHaveBeenCalledWith({
      name: "Sam Example",
      email: "sam@example.com",
      password: "a-secure-password",
      callbackURL: "/home",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("verification link printed in the development server terminal");
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("logs in and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    authClientMock.signIn.email.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    render(<AuthForm localVerificationLink={false} />);

    await user.type(screen.getByLabelText("Email"), "sam@example.com");
    await user.type(screen.getByLabelText("Password"), "a-secure-password");
    await user.click(within(screen.getByRole("form", { name: "Log in form" })).getByRole("button"));

    expect(authClientMock.signIn.email).toHaveBeenCalledWith({ email: "sam@example.com", password: "a-secure-password" });
    expect(routerMock.replace).toHaveBeenCalledWith("/home");
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("shows an email verification message for an unverified account", async () => {
    const user = userEvent.setup();
    authClientMock.signIn.email.mockResolvedValue({
      data: null,
      error: { message: "Email not verified" },
    });
    render(<AuthForm localVerificationLink={false} />);

    await user.type(screen.getByLabelText("Email"), "sam@example.com");
    await user.type(screen.getByLabelText("Password"), "a-secure-password");
    await user.click(within(screen.getByRole("form", { name: "Log in form" })).getByRole("button"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Verify your email");
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});