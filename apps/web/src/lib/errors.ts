import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function createErrorResponse(
  error: unknown,
  statusCode?: number,
  code?: string
): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    console.error("API Error:", error.message, error.stack);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        code: code,
      },
      { status: statusCode || 500 }
    );
  }

  console.error("Unknown error:", error);
  return NextResponse.json(
    {
      error: "Internal server error",
      code: code,
    },
    { status: statusCode || 500 }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

