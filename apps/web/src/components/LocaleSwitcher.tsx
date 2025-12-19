"use client";

import { useState, useEffect } from "react";
import { Button } from "@aibos/ui";
import { detectLocale, supportedLocales, type Locale } from "@/lib/i18n";

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    const detected = detectLocale();
    setCurrentLocale(detected);
    // Store in localStorage
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored && supportedLocales.includes(stored)) {
      setCurrentLocale(stored);
    }
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem("locale", locale);
    // Reload page to apply new locale
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground-muted">Language:</span>
      <div className="flex gap-1">
        {supportedLocales.map((locale) => (
          <Button
            key={locale}
            size="sm"
            variant={currentLocale === locale ? "primary" : "outline"}
            onClick={() => handleLocaleChange(locale)}
            className="min-w-[3rem]"
          >
            {localeNames[locale]}
          </Button>
        ))}
      </div>
    </div>
  );
}
