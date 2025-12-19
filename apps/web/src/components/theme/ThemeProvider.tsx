"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "aibos-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }, []);

  // Resolve theme (system -> light/dark)
  const resolveTheme = useCallback(
    (currentTheme: Theme): "light" | "dark" => {
      if (currentTheme === "system") {
        return getSystemTheme();
      }
      return currentTheme;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback(
    (newTheme: Theme) => {
      const resolved = resolveTheme(newTheme);
      const root = document.documentElement;

      // Remove transition class temporarily to prevent flash
      root.classList.add("no-transition");

      if (newTheme === "system") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", newTheme);
      }

      setResolvedTheme(resolved);

      // Re-enable transitions after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove("no-transition");
        });
      });
    },
    [resolveTheme]
  );

  // Initialize theme on mount
  useEffect(() => {
    // Get saved theme or default to system
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system" || !mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      applyTheme("system");
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, mounted, applyTheme]);

  // Set theme function
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);

      // Save to localStorage
      if (newTheme === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    },
    [applyTheme]
  );

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
