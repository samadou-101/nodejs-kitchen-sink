import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

describe("useCart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty cart", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds an item to the cart", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      productId: 1,
      name: "Test",
      price: 100,
      quantity: 1,
    });
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(100);
  });

  it("increments quantity when adding existing item", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });
    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(200);
  });

  it("removes an item", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });
    act(() => {
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("updates quantity", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });
    act(() => {
      result.current.updateQuantity(1, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalPrice).toBe(500);
  });

  it("removes item when quantity reaches 0", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });
    act(() => {
      result.current.updateQuantity(1, 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("persists to localStorage", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Persist", price: 200 });
    });

    const stored = JSON.parse(localStorage.getItem("ecom-cart") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].productId).toBe(1);
  });

  it("restores from localStorage", async () => {
    localStorage.setItem(
      "ecom-cart",
      JSON.stringify([{ productId: 1, name: "Saved", price: 300, quantity: 2 }]),
    );

    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Saved");
    expect(result.current.totalPrice).toBe(600);
  });

  it("clears the cart", async () => {
    const { useCart } = await import("#features/shopping-cart/hooks/use-cart");
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, name: "Test", price: 100 });
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.items).toHaveLength(0);
    expect(localStorage.getItem("ecom-cart")).toBe("[]");
  });
});
