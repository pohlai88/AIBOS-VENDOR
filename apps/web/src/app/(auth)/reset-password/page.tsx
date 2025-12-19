"use client";

import { useState } from "react";
import { Button, Input } from "@aibos/ui";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-background-elevated border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
            Reset Password
          </h1>

          {success ? (
            <div className="space-y-4">
              <div className="bg-success-900/50 border border-success-700 text-success-200 px-4 py-3 rounded-lg">
                Password reset email sent! Please check your inbox.
              </div>
              <Link href="/login">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-foreground-muted mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />

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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

