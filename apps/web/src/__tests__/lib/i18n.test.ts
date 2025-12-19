import { getTranslation, detectLocale, supportedLocales } from "@/lib/i18n";

describe("i18n utilities", () => {
  describe("getTranslation", () => {
    it("returns correct translation for English", () => {
      expect(getTranslation("en", "common.loading")).toBe("Loading...");
      expect(getTranslation("en", "dashboard.title")).toBe("Dashboard");
    });

    it("returns correct translation for Spanish", () => {
      expect(getTranslation("es", "common.loading")).toBe("Cargando...");
      expect(getTranslation("es", "dashboard.title")).toBe("Panel de control");
    });

    it("falls back to English if translation not found", () => {
      expect(getTranslation("es", "nonexistent.key", "Fallback")).toBe("Fallback");
    });

    it("returns key if no translation found and no fallback", () => {
      expect(getTranslation("en", "nonexistent.key")).toBe("nonexistent.key");
    });
  });

  describe("detectLocale", () => {
    it("returns default locale when window is undefined", () => {
      // Mock window as undefined (SSR)
      const originalWindow = global.window;
      // @ts-expect-error - intentionally setting to undefined for test
      global.window = undefined;

      expect(detectLocale()).toBe("en");

      global.window = originalWindow;
    });
  });

  describe("supportedLocales", () => {
    it("includes all expected locales", () => {
      expect(supportedLocales).toContain("en");
      expect(supportedLocales).toContain("es");
      expect(supportedLocales).toContain("fr");
      expect(supportedLocales).toContain("de");
    });
  });
});
