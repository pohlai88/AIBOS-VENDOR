import { NextResponse } from "next/server";

// Route segment config following Next.js 16 best practices
// Health check should always be fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

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
