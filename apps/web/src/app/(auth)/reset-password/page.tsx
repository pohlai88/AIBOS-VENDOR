"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { FormField } from "@/components/auth/FormField";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // This would call a password reset API endpoint
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3 font-normal">
            Reset Password
          </h1>
          <p className="text-sm text-foreground-muted font-normal font-brand">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-background-elevated border border-border p-8 md:p-12">
          {success ? (
            <div className="space-y-6">
              <div
                className="bg-success-900/50 border border-success-700 text-success-200 px-4 py-3 rounded-lg text-sm"
                role="alert"
                aria-live="polite"
              >
                Password reset email sent! Please check your inbox.
              </div>
              <Link href="/login">
                <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] group font-brand">
                  Back to Login
                  <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          ) : (
            <AuthForm
              title=""
              subtitle=""
              error={error}
              onSubmit={handleSubmit}
              footer={
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors font-brand font-normal"
                  >
                    Back to Login
                  </Link>
                </div>
              }
            >
              <p className="text-sm text-foreground-muted font-normal font-brand">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <FormField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed group font-brand"
              >
                {loading ? "Sending..." : "Send Reset Link"}
                <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </AuthForm>
          )}
        </div>
      </div>
    </AuthPageLayout>
  );
}

