import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseAuthFormOptions {
  endpoint: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

interface AuthFormState {
  loading: boolean;
  error: string;
}

export function useAuthForm<T extends Record<string, any>>({
  endpoint,
  redirectTo,
  onSuccess,
}: UseAuthFormOptions) {
  const router = useRouter();
  const [state, setState] = useState<AuthFormState>({
    loading: false,
    error: "",
  });

  const submit = useCallback(
    async (data: T) => {
      setState({ loading: true, error: "" });

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          setState({
            loading: false,
            error: result.error || "An error occurred",
          });
          return;
        }

        if (onSuccess) {
          onSuccess();
        }

        if (redirectTo) {
          router.push(redirectTo);
          router.refresh();
        }
      } catch (err) {
        setState({
          loading: false,
          error: "An unexpected error occurred",
        });
      }
    },
    [endpoint, redirectTo, onSuccess, router]
  );

  return {
    ...state,
    submit,
    setError: (error: string) => setState((prev) => ({ ...prev, error })),
  };
}
