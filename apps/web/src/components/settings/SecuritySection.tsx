"use client";

import { useState, useCallback, memo } from "react";
import { Button, Input } from "@aibos/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export const SecuritySection = memo(function SecuritySection() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = useCallback(async (data: PasswordChangeFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      setMessage({
        type: "success",
        text: "Password changed successfully",
      });

      reset();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  }, [reset]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">Security</h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${message.type === "success"
            ? "bg-success-900/50 border-success-700 text-success-200"
            : "bg-error-900/50 border-error-700 text-error-200"
            }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Change password form">
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-foreground mb-2">
            Current Password
          </label>
          <Input
            id="current-password"
            type="password"
            {...register("currentPassword")}
            disabled={loading}
            className="w-full"
            autoComplete="current-password"
            aria-describedby={errors.currentPassword ? "current-password-error" : undefined}
            aria-invalid={errors.currentPassword ? "true" : "false"}
          />
          {errors.currentPassword && (
            <p id="current-password-error" className="mt-1 text-sm text-error-500" role="alert">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">
            New Password
          </label>
          <Input
            id="new-password"
            type="password"
            {...register("newPassword")}
            disabled={loading}
            className="w-full"
            autoComplete="new-password"
            aria-describedby="new-password-hint new-password-error"
            aria-invalid={errors.newPassword ? "true" : "false"}
          />
          {errors.newPassword && (
            <p id="new-password-error" className="mt-1 text-sm text-error-500" role="alert">
              {errors.newPassword.message}
            </p>
          )}
          <p id="new-password-hint" className="mt-1 text-sm text-foreground-muted">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
            Confirm New Password
          </label>
          <Input
            id="confirm-password"
            type="password"
            {...register("confirmPassword")}
            disabled={loading}
            className="w-full"
            autoComplete="new-password"
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-error-500" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={loading} aria-label="Change password">
            {loading ? "Changing Password..." : "Change Password"}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Two-Factor Authentication
        </h3>
        <p className="text-foreground-muted mb-4">
          Add an extra layer of security to your account with two-factor
          authentication.
        </p>
        <Button variant="outline" disabled aria-label="Two-factor authentication (coming soon)">
          Coming Soon
        </Button>
      </div>
    </div>
  );
});
