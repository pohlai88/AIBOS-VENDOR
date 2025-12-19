"use client";

import { useTheme } from "./ThemeProvider";
import { Button } from "@aibos/ui";
import { useCallback } from "react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    // Cycle: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  }, [theme, setTheme]);

  const getIcon = () => {
    if (theme === "system") {
      return resolvedTheme === "light" ? "🌓" : "🌓";
    }
    return theme === "light" ? "☀️" : "🌙";
  };

  const getLabel = () => {
    if (theme === "system") {
      return `System (${resolvedTheme})`;
    }
    return theme === "light" ? "Light" : "Dark";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
      className="flex items-center gap-2"
    >
      <span className="text-lg" role="img" aria-hidden="true">
        {getIcon()}
      </span>
      <span className="hidden sm:inline text-sm">{getLabel()}</span>
    </Button>
  );
}
