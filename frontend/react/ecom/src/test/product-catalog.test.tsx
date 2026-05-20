import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithProviders } from "#test/test-utils";
import { screen, waitFor } from "@testing-library/react";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        success: true,
        data: [{ id: 1, name: "Test Product", price: 1000, categoryId: 1 }],
        meta: { page: 1, limit: 20, total: 1 },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Product Catalog", () => {
  it("renders product list", async () => {
    const { ProductCatalogPage } = await import(
      "#features/product-catalog/components/ProductCatalogPage"
    );
    renderWithProviders(<ProductCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("shows empty state when no products", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [],
          meta: { page: 1, limit: 20, total: 0 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { ProductCatalogPage } = await import(
      "#features/product-catalog/components/ProductCatalogPage"
    );
    renderWithProviders(<ProductCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText("No products found")).toBeInTheDocument();
    });
  });

  it("renders search bar", async () => {
    const { SearchBar } = await import(
      "#features/product-catalog/components/SearchBar"
    );
    renderWithProviders(<SearchBar value="" onChange={() => {}} />);

    expect(
      screen.getByPlaceholderText("Search products..."),
    ).toBeInTheDocument();
  });
});
