import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders } from "#ecom/test/test-utils";
import { screen, waitFor } from "@testing-library/react";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Employee Orders", () => {
  it("renders assigned orders list", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              orderId: 1,
              customer: {
                name: "Ahmed",
                phone: "0550000000",
                address: "",
                email: "",
              },
              orderItems: [{ productId: 1, price: 1000, quantity: 2 }],
              orderDate: new Date().toISOString(),
              orderStatusId: 1,
              employeeId: 1,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { AssignedOrdersList } = await import(
      "#ecom/features/employee-orders/components/AssignedOrdersList"
    );
    renderWithProviders(<AssignedOrdersList />);

    await waitFor(() => {
      expect(screen.getByText("Order #1")).toBeInTheDocument();
    });
  });

  it("shows confirm and reject buttons for pending orders", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              orderId: 1,
              customer: { name: "Ahmed", phone: "0550000000", address: "", email: "" },
              orderItems: [{ productId: 1, price: 1000, quantity: 2 }],
              orderDate: new Date().toISOString(),
              orderStatusId: 1,
              employeeId: 1,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { AssignedOrdersList } = await import(
      "#ecom/features/employee-orders/components/AssignedOrdersList"
    );
    renderWithProviders(<AssignedOrdersList />);

    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
      expect(screen.getByText("Reject")).toBeInTheDocument();
    });
  });

  it("shows empty message when no orders assigned", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { AssignedOrdersList } = await import(
      "#ecom/features/employee-orders/components/AssignedOrdersList"
    );
    renderWithProviders(<AssignedOrdersList />);

    await waitFor(() => {
      expect(
        screen.getByText("No orders assigned to you"),
      ).toBeInTheDocument();
    });
  });
});
