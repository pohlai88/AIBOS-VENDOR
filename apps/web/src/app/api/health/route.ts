import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/health - Simple health check endpoint
 * Used by load balancers and monitoring systems
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ai-bos-vendor-portal",
    },
    { status: 200 }
  );
}
