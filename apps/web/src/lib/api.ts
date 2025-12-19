import type { ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || "Request failed",
      response.status,
      errorData
    );
  }

  return response.json();
}

