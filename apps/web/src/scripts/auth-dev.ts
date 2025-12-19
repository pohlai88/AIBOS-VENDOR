/**
 * Auth Development Helper Script
 * 
 * Development utilities for testing and debugging authentication.
 * 
 * Usage:
 *   npx tsx src/scripts/auth-dev.ts [command]
 * 
 * Commands:
 *   health    - Run auth health check
 *   rls       - Check RLS policies
 *   session   - Verify user session
 *   config    - Show auth configuration
 */

import { performAuthHealthCheck, verifyRLSPolicies, getAuthConfig, verifyUserSession, debugAuthState } from "@/lib/auth/mcp-utils";

async function main() {
  const command = process.argv[2] || "help";

  switch (command) {
    case "health":
      console.log("🔍 Running auth health check...\n");
      const health = await performAuthHealthCheck();
      console.log(JSON.stringify(health, null, 2));
      break;

    case "rls":
      console.log("🔒 Checking RLS policies...\n");
      const table = process.argv[3] || "users";
      const rls = await verifyRLSPolicies(table);
      console.log(JSON.stringify(rls, null, 2));
      break;

    case "session":
      console.log("👤 Verifying user session...\n");
      const session = await verifyUserSession();
      console.log(JSON.stringify(session, null, 2));
      break;

    case "config":
      console.log("⚙️  Auth configuration:\n");
      const config = await getAuthConfig();
      console.log(JSON.stringify(config, null, 2));
      break;

    case "debug":
      console.log("🐛 Debug auth state...\n");
      await debugAuthState();
      break;

    case "help":
    default:
      console.log(`
Auth Development Helper

Usage:
  npx tsx src/scripts/auth-dev.ts [command]

Commands:
  health [table]    Run comprehensive auth health check
  rls [table]       Check RLS policies for a table (default: users)
  session           Verify current user session
  config            Show auth configuration
  debug             Debug auth state (development only)
  help              Show this help message

Examples:
  npx tsx src/scripts/auth-dev.ts health
  npx tsx src/scripts/auth-dev.ts rls users
  npx tsx src/scripts/auth-dev.ts session
      `);
      break;
  }
}

main().catch(console.error);
