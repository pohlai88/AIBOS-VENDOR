import { NextRequest, NextResponse } from "next/server";

export type APIVersion = "v1" | "v2";

export interface VersionInfo {
  version: APIVersion;
  deprecated: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  migrationGuide?: string;
}

/**
 * Get API version from request
 * Supports both URL-based (/api/v1/...) and header-based versioning
 */
export function getAPIVersion(request: NextRequest): APIVersion {
  // Check URL path first
  const path = request.nextUrl.pathname;
  const urlVersionMatch = path.match(/^\/api\/(v\d+)\//);
  if (urlVersionMatch) {
    const version = urlVersionMatch[1] as APIVersion;
    if (version === "v1" || version === "v2") {
      return version;
    }
  }

  // Check Accept header
  const acceptHeader = request.headers.get("accept");
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/version[=:](\d+)/i);
    if (versionMatch && versionMatch[1]) {
      const versionNum = parseInt(versionMatch[1], 10);
      if (versionNum === 1) return "v1";
      if (versionNum === 2) return "v2";
    }
  }

  // Default to v1
  return "v1";
}

/**
 * Get version information
 */
export function getVersionInfo(version: APIVersion): VersionInfo {
  const versions: Record<APIVersion, VersionInfo> = {
    v1: {
      version: "v1",
      deprecated: false,
    },
    v2: {
      version: "v2",
      deprecated: false,
    },
  };

  return versions[version] || versions.v1;
}

/**
 * Add version headers to response
 */
export function addVersionHeaders(
  response: NextResponse,
  version: APIVersion,
  info: VersionInfo
): NextResponse {
  response.headers.set("API-Version", version);

  if (info.deprecated) {
    response.headers.set("Deprecated", "true");
    if (info.deprecationDate) {
      response.headers.set("Deprecation-Date", info.deprecationDate);
    }
    if (info.sunsetDate) {
      response.headers.set("Sunset-Date", info.sunsetDate);
    }
    if (info.migrationGuide) {
      response.headers.set("Link", `<${info.migrationGuide}>; rel="deprecation"`);
    }
  }

  return response;
}

/**
 * Create versioned error response
 */
export function createVersionedErrorResponse(
  message: string,
  status: number,
  version: APIVersion,
  details?: Record<string, unknown>
): NextResponse {
  const info = getVersionInfo(version);
  const response = NextResponse.json(
    {
      error: message,
      version,
      ...details,
    },
    { status }
  );

  return addVersionHeaders(response, version, info);
}
