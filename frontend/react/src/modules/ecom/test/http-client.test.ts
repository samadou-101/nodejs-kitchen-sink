import { describe, it, expect, vi, afterEach } from "vitest";

describe("HTTP Client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns data on successful response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { id: 1 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { api } = await import("#ecom/shared/api/http-client");
    const result = await api.get<{ id: number }>("/api/ecom/products");
    expect(result).toEqual({ id: 1 });
  });

  it("throws ApiError on error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "NOT_FOUND", message: "Product not found" },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { api, ApiError } = await import("#ecom/shared/api/http-client");

    try {
      await api.get("/api/ecom/product/999");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as { code: string; message: string }).code).toBe("NOT_FOUND");
      expect((err as { code: string; message: string }).message).toBe("Product not found");
    }
  });

  it("includes credentials: include in requests", async () => {
    let requestInit: RequestInit | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        requestInit = init;
        return new Response(JSON.stringify({ success: true, data: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    );

    const { api } = await import("#ecom/shared/api/http-client");
    await api.get("/test");
    expect(requestInit?.credentials).toBe("include");
  });
});
