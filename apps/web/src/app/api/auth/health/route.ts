/**
 * Auth Health Check API Route
 * 
 * Provides health check endpoint for authentication system.
 * Uses MCP-integrated utilities for comprehensive checks.
 * 
 * GET /api/auth/health
 */

import { NextRequest, NextResponse } from "next/server";
import { performAuthHealthCheck, verifyRLSPolicies, getAuthConfig } from "@/lib/auth/mcp-utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

// Route segment config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/health
 * 
 * Returns comprehensive auth health check
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkType = searchParams.get("type") || "full";

    if (checkType === "quick") {
      // Quick health check
      const health = await performAuthHealthCheck();
      return NextResponse.json(health);
    }

    if (checkType === "rls") {
      // RLS policy check
      const table = searchParams.get("table") || "users";
      const rlsCheck = await verifyRLSPolicies(table);
      return NextResponse.json(rlsCheck);
    }

    if (checkType === "config") {
      // Configuration check
      const config = await getAuthConfig();
      return NextResponse.json(config);
    }

    // Full health check (default)
    const health = await performAuthHealthCheck();
    const config = await getAuthConfig();
    const rlsCheck = await verifyRLSPolicies("users");

    return createSuccessResponse({
      health,
      config,
      rls: rlsCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : new Error("Health check failed"),
      500,
      "HEALTH_CHECK_ERROR"
    );
  }
}
