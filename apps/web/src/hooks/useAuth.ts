/**
 * useAuth Hook
 * 
 * Client-side authentication hook for React components.
 * Provides user state and authentication status.
 * 
 * This hook wraps Supabase Auth and provides a consistent API
 * for client-side components while maintaining security.
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth";

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for client-side authentication
 * 
 * @returns {UseAuthReturn} User state, loading status, and error
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *   
 *   return <div>Hello {user.email}</div>;
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session && mounted) {
          await fetchUser(session.access_token);
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Auth initialization failed"));
          setLoading(false);
        }
      }
    };

    // Fetch user from API
    const fetchUser = async (accessToken: string) => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Include cookies (session-based auth)
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();

        if (mounted) {
          // Handle both success response formats
          const userData = data.data?.user || data.user;
          if (userData) {
            setUser(userData);
            setError(null);
          } else {
            throw new Error("Invalid user data");
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch user"));
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        await fetchUser(session.access_token);
      } else {
        setUser(null);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, error };
}
