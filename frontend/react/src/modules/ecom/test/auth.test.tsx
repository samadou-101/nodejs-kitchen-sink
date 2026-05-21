import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders } from "#ecom/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Admin Auth Forms", () => {
  it("renders admin login form", async () => {
    const { AdminLoginForm } = await import(
      "#ecom/features/auth-admin/components/AdminLoginForm"
    );
    renderWithProviders(<AdminLoginForm onSuccess={() => {}} />);

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("calls onSuccess after admin login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            userId: 1,
            employeeId: null,
            roleNames: ["ADMIN"],
            permissions: [],
            isSuperAdmin: false,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const onSuccess = vi.fn();
    const { AdminLoginForm } = await import(
      "#ecom/features/auth-admin/components/AdminLoginForm"
    );
    renderWithProviders(<AdminLoginForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText("Email"), "admin@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error on invalid admin login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid email or password" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { AdminLoginForm } = await import(
      "#ecom/features/auth-admin/components/AdminLoginForm"
    );
    renderWithProviders(<AdminLoginForm onSuccess={() => {}} />);

    await userEvent.type(screen.getByLabelText("Email"), "bad@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(
        screen.getByText("Please check your input and try again"),
      ).toBeInTheDocument();
    });
  });
});
