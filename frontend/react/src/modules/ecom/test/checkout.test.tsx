import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderWithProviders } from "#ecom/test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

beforeEach(() => {
  localStorage.setItem(
    "ecom-cart",
    JSON.stringify([{ productId: 1, name: "Test", price: 1000, quantity: 2 }]),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("Checkout", () => {
  it("renders checkout form with cart items", async () => {
    const { CheckoutForm } = await import(
      "#ecom/features/order-checkout/components/CheckoutForm"
    );
    renderWithProviders(
      <div id="root"><CheckoutForm onSuccess={() => {}} /></div>,
    );

    await waitFor(() => {
      expect(screen.getByText("Checkout")).toBeInTheDocument();
    });
  });

  it("shows empty cart message when no items", async () => {
    localStorage.setItem("ecom-cart", JSON.stringify([]));
    const { CheckoutForm } = await import(
      "#ecom/features/order-checkout/components/CheckoutForm"
    );
    renderWithProviders(<CheckoutForm onSuccess={() => {}} />);

    await waitFor(() => {
      expect(
        screen.getByText("Add items to your cart first"),
      ).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: { orderId: 1 } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { CheckoutForm } = await import(
      "#ecom/features/order-checkout/components/CheckoutForm"
    );
    renderWithProviders(<CheckoutForm onSuccess={() => {}} />);

    const submitBtn = screen.getByText("Place Order (COD)");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Phone is required")).toBeInTheDocument();
      expect(screen.getByText("Address is required")).toBeInTheDocument();
      expect(screen.getByText("City is required")).toBeInTheDocument();
    });
  });

  it("submits order successfully", async () => {
    let capturedBody: string | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = init?.body as string;
        return new Response(
          JSON.stringify({ success: true, data: { orderId: 5 } }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    );

    const onSuccess = vi.fn();
    const { CheckoutForm } = await import(
      "#ecom/features/order-checkout/components/CheckoutForm"
    );
    renderWithProviders(<CheckoutForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText("Name"), "Ahmed");
    await userEvent.type(screen.getByLabelText("Phone"), "0550000000");
    await userEvent.type(screen.getByLabelText("Address"), "123 Main St");
    await userEvent.type(screen.getByLabelText("City"), "Algiers");

    await userEvent.click(screen.getByText("Place Order (COD)"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(5);
    });

    const body = JSON.parse(capturedBody ?? "{}");
    expect(body.name).toBe("Ahmed");
    expect(body.items).toHaveLength(1);
  });
});
