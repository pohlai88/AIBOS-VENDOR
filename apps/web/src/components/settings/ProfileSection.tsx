"use client";

import { useState, useCallback, memo } from "react";
import { Button, Input } from "@aibos/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  email: string;
  role: string;
  organizationName: string;
}

interface ProfileSectionProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const ProfileSection = memo(function ProfileSection({
  profile,
  onProfileUpdate,
}: ProfileSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: profile.email,
    },
  });

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      setLoading(true);
      setMessage(null);

      try {
        const response = await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update profile");
        }

        setMessage({
          type: "success",
          text: "Profile updated successfully",
        });

        onProfileUpdate({
          ...profile,
          email: data.email,
        });

        router.refresh();
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to update profile",
        });
      } finally {
        setLoading(false);
      }
    },
    [profile, onProfileUpdate, router]
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">Profile</h2>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Profile update form">
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <Input
            id="profile-email"
            type="email"
            {...register("email")}
            disabled={loading}
            className="w-full"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-error-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="profile-role" className="block text-sm font-medium text-foreground mb-2">
            Role
          </label>
          <Input
            id="profile-role"
            type="text"
            value={profile.role.replace("_", " ").toUpperCase()}
            disabled
            className="w-full bg-background-elevated"
            aria-label="Your role (read-only)"
          />
          <p className="mt-1 text-sm text-foreground-muted">
            Your role cannot be changed
          </p>
        </div>

        <div>
          <label htmlFor="profile-organization" className="block text-sm font-medium text-foreground mb-2">
            Organization
          </label>
          <Input
            id="profile-organization"
            type="text"
            value={profile.organizationName}
            disabled
            className="w-full bg-background-elevated"
            aria-label="Your organization (read-only)"
          />
          <p className="mt-1 text-sm text-foreground-muted">
            Organization cannot be changed
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={loading} aria-label="Save profile changes">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
});
