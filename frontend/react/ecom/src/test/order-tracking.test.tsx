import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders } from "#test/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Order Tracking", () => {
  it("renders the track order form", async () => {
    const { TrackOrderPage } = await import(
      "#features/order-tracking/components/TrackOrderPage"
    );
    renderWithProviders(<TrackOrderPage />);

    expect(screen.getByText("Track Your Order")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your phone number"),
    ).toBeInTheDocument();
  });

  it("shows orders when phone number is found", async () => {
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
              orderItems: [],
              orderDate: new Date().toISOString(),
              orderStatusId: 1,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { TrackOrderPage } = await import(
      "#features/order-tracking/components/TrackOrderPage"
    );
    renderWithProviders(<TrackOrderPage />);

    const input = screen.getByPlaceholderText("Enter your phone number");
    await userEvent.type(input, "0550000000");
    await userEvent.click(screen.getByText("Track"));

    await waitFor(() => {
      expect(screen.getByText("Order #1")).toBeInTheDocument();
    });
  });

  it("shows no orders message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { TrackOrderPage } = await import(
      "#features/order-tracking/components/TrackOrderPage"
    );
    renderWithProviders(<TrackOrderPage />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your phone number"),
      "0550000001",
    );
    await userEvent.click(screen.getByText("Track"));

    await waitFor(() => {
      expect(
        screen.getByText("No orders found for this phone number"),
      ).toBeInTheDocument();
    });
  });
});
