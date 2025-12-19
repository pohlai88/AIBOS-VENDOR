"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { FormField } from "@/components/auth/FormField";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { SignupFormData } from "@/types/auth";

export default function SignupPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState<"vendor" | "company">("vendor");
  const [tenantOption, setTenantOption] = useState<"join" | "create" | "default">("default");
  const [tenantSlug, setTenantSlug] = useState("");
  const [tenantName, setTenantName] = useState("");

  const { loading, error, submit } = useAuthForm<SignupFormData>({
    endpoint: "/api/auth/signup",
    redirectTo: "/dashboard",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      email,
      password,
      organizationName,
      role,
      tenantSlug: tenantOption === "join" ? tenantSlug : undefined,
      tenantName: tenantOption === "create" ? tenantName : undefined,
    });
  };

  return (
    <AuthPageLayout>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3 font-normal">
            Create Account
          </h1>
          <p className="text-sm text-foreground-muted font-normal font-brand">
            Join the world's most regulated organizations
          </p>
        </div>

        <div className="bg-background-elevated border border-border p-8 md:p-12">

          <AuthForm
            title=""
            subtitle=""
            error={error}
            onSubmit={handleSubmit}
            footer={
              <div className="text-sm text-foreground-muted font-brand font-normal">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-foreground hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>
            }
          >
            <FormField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />

            <FormField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              minLength={8}
            />

            <FormField
              type="text"
              label="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1 font-brand font-normal">
                Account Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "vendor" | "company")}
                className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-brand font-normal"
                disabled={loading}
                aria-label="Account type"
              >
                <option value="vendor">Vendor</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1 font-brand font-normal">
                Tenant
              </label>
              <select
                value={tenantOption}
                onChange={(e) =>
                  setTenantOption(e.target.value as "join" | "create" | "default")
                }
                className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mb-2 font-brand font-normal"
                disabled={loading}
                aria-label="Tenant option"
              >
                <option value="default">Use Default Tenant</option>
                <option value="join">Join Existing Tenant</option>
                <option value="create">Create New Tenant</option>
              </select>

              {tenantOption === "join" && (
                <FormField
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
                <FormField
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed group font-brand"
            >
              {loading ? "Creating account..." : "Sign Up"}
              <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </AuthForm>
        </div>
      </div>
    </AuthPageLayout>
  );
}

