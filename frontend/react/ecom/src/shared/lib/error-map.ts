const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "Please check your input and try again",
  NOT_FOUND: "The requested resource was not found",
  FORBIDDEN: "You do not have permission to perform this action",
  AUTHORIZATION_ERROR: "You do not have permission to perform this action",
  CONFLICT: "This operation could not be completed due to a conflict",
};

export function getErrorMessage(code: string, message?: string): string {
  if (code === "InsufficientStockError" && message) {
    return message;
  }
  return errorMessages[code] ?? message ?? "An unexpected error occurred";
}
