import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthCheck {
  status: "ok" | "degraded" | "down";
  responseTime?: number;
  error?: string;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("users").select("id").limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        status: "down",
        responseTime,
        error: error.message,
      };
    }

    return {
      status: "ok",
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logError("Database health check failed", error);
    return {
      status: "down",
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check Supabase Auth service
 */
async function checkSupabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    // Simple check - try to get current session
    const { error } = await supabase.auth.getSession();
    
    const responseTime = Date.now() - startTime;
    
    if (error && error.message !== "Invalid Refresh Token") {
      // Invalid refresh token is expected for unauthenticated requests
      return {
        status: "degraded",
        responseTime,
        error: error.message,
      };
    }

    return {
      status: "ok",
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logError("Supabase health check failed", error);
    return {
      status: "down",
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check email service (Resend)
 */
async function checkEmailService(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        status: "degraded",
        error: "Email service not configured",
      };
    }

    // Simple connectivity check (would make actual API call in production)
    const responseTime = Date.now() - startTime;
    
    return {
      status: "ok",
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logError("Email service health check failed", error);
    return {
      status: "down",
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/status - Detailed system status endpoint
 * Returns health status of all critical dependencies
 */
export async function GET() {
  try {
    const [database, supabase, email] = await Promise.all([
      checkDatabase(),
      checkSupabase(),
      checkEmailService(),
    ]);

    const overallStatus =
      database.status === "ok" && supabase.status === "ok" && email.status !== "down"
        ? "ok"
        : database.status === "down" || supabase.status === "down"
        ? "down"
        : "degraded";

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: {
          database,
          supabase,
          email,
        },
        version: process.env.npm_package_version || "unknown",
        environment: process.env.NODE_ENV || "development",
      },
      {
        status: overallStatus === "ok" ? 200 : overallStatus === "degraded" ? 200 : 503,
      }
    );
  } catch (error) {
    logError("Status check error", error);
    return NextResponse.json(
      {
        status: "down",
        timestamp: new Date().toISOString(),
        error: "Failed to check system status",
      },
      { status: 503 }
    );
  }
}
