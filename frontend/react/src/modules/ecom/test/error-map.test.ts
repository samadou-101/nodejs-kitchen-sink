import { describe, it, expect } from "vitest";
import { getErrorMessage } from "#ecom/shared/lib/error-map";

describe("error-map", () => {
  it("maps VALIDATION_ERROR", () => {
    expect(getErrorMessage("VALIDATION_ERROR")).toBe(
      "Please check your input and try again",
    );
  });

  it("maps NOT_FOUND", () => {
    expect(getErrorMessage("NOT_FOUND")).toBe(
      "The requested resource was not found",
    );
  });

  it("maps FORBIDDEN", () => {
    expect(getErrorMessage("FORBIDDEN")).toBe(
      "You do not have permission to perform this action",
    );
  });

  it("maps CONFLICT", () => {
    expect(getErrorMessage("CONFLICT")).toBe(
      "This operation could not be completed due to a conflict",
    );
  });

  it("passes through InsufficientStockError message", () => {
    expect(
      getErrorMessage(
        "InsufficientStockError",
        "Product #5 has only 2 available",
      ),
    ).toBe("Product #5 has only 2 available");
  });

  it("returns fallback for unknown code", () => {
    expect(getErrorMessage("UNKNOWN")).toBe("An unexpected error occurred");
  });
});
