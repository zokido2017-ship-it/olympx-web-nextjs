import axios from "axios";

type LaravelValidationErrors = Record<string, string[]>;

type LaravelErrorBody = {
  message?: string;
  errors?: LaravelValidationErrors;
};

export const DUPLICATE_MOBILE_MESSAGE =
  "This mobile number is already registered. Please log in instead.";

/** First human-readable message from a Sportxo/Laravel API error payload. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }

  const data = error.response?.data as LaravelErrorBody | undefined;

  if (data?.errors) {
    const firstField = Object.values(data.errors).find((messages) => messages?.length);
    if (firstField?.[0]) {
      return firstField[0];
    }
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}

export function isDuplicateMobileError(error: unknown): boolean {
  const message = getApiErrorMessage(error, "").toLowerCase();
  return (
    message.includes("already") ||
    message.includes("exists") ||
    message.includes("taken")
  );
}
