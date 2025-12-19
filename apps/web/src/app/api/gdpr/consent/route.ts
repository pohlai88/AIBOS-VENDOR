import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordPrivacyPolicyAcceptance, getUserConsentStatus } from "@/lib/gdpr";
import { logError } from "@/lib/logger";

/**
 * GET /api/gdpr/consent - Get user consent status
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const status = await getUserConsentStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    logError("Failed to get consent status", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gdpr/consent - Record privacy policy acceptance
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { error: "Policy version is required" },
        { status: 400 }
      );
    }

    const success = await recordPrivacyPolicyAcceptance(user.id, version);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to record consent" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Privacy policy acceptance recorded",
    });
  } catch (error) {
    logError("Failed to record consent", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
