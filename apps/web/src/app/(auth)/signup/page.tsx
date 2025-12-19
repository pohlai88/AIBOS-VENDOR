"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@aibos/ui";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState<"vendor" | "company">("vendor");
  const [tenantOption, setTenantOption] = useState<"join" | "create" | "default">("default");
  const [tenantSlug, setTenantSlug] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          organizationName,
          role,
          tenantSlug: tenantOption === "join" ? tenantSlug : undefined,
          tenantName: tenantOption === "create" ? tenantName : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-background-elevated border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              minLength={8}
            />

            <Input
              type="text"
              label="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Account Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "vendor" | "company")}
                className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent"
                disabled={loading}
              >
                <option value="vendor">Vendor</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tenant
              </label>
              <select
                value={tenantOption}
                onChange={(e) => setTenantOption(e.target.value as "join" | "create" | "default")}
                className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent mb-2"
                disabled={loading}
              >
                <option value="default">Use Default Tenant</option>
                <option value="join">Join Existing Tenant</option>
                <option value="create">Create New Tenant</option>
              </select>

              {tenantOption === "join" && (
                <Input
                  type="text"
                  label="Tenant Slug"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="acme-corp"
                  disabled={loading}
                  helperText="Enter the slug of the tenant you want to join"
                />
              )}

              {tenantOption === "create" && (
                <Input
                  type="text"
                  label="Tenant Name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Acme Corporation"
                  disabled={loading}
                  helperText="Name for your new tenant"
                />
              )}
            </div>

            {error && (
              <div className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-foreground-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-400 hover:text-primary-300"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

