"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { FormField } from "@/components/auth/FormField";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { LoginFormData } from "@/types/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading, error, submit } = useAuthForm<LoginFormData>({
    endpoint: "/api/auth/login",
    redirectTo: redirect,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({ email, password });
  };

  return (
    <AuthPageLayout>
      <AuthForm
        title="Sign In"
        subtitle="Access your institutional-grade vendor governance platform"
        error={error}
        onSubmit={handleSubmit}
        footer={
          <>
            <Link
              href="/reset-password"
              className="block text-sm text-foreground-muted hover:text-foreground transition-colors font-brand font-normal"
            >
              Forgot password?
            </Link>
            <div className="text-sm text-foreground-muted font-brand font-normal">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-foreground hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>
          </>
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
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed group font-brand"
        >
          {loading ? "Signing in..." : "Sign In"}
          <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </AuthForm>
    </AuthPageLayout>
  );
}

