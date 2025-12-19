// Internationalization utilities
// Basic i18n setup - can be extended with next-intl or similar

export type Locale = "en" | "es" | "fr" | "de";

export const defaultLocale: Locale = "en";

export const supportedLocales: Locale[] = ["en", "es", "fr", "de"];

export interface Translations {
  [key: string]: string | Translations;
}

// Basic translation storage (in production, use a proper i18n library)
const translations: Record<Locale, Translations> = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      close: "Close",
      search: "Search",
      filter: "Filter",
      export: "Export",
      upload: "Upload",
      download: "Download",
    },
    dashboard: {
      title: "Dashboard",
      documents: "Documents",
      payments: "Payments",
      statements: "Statements",
      messages: "Messages",
    },
    documents: {
      title: "Documents",
      upload: "Upload Document",
      name: "Name",
      category: "Category",
      size: "Size",
      uploaded: "Uploaded",
      actions: "Actions",
    },
  },
  es: {
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      view: "Ver",
      close: "Cerrar",
      search: "Buscar",
      filter: "Filtrar",
      export: "Exportar",
      upload: "Subir",
      download: "Descargar",
    },
    dashboard: {
      title: "Panel de control",
      documents: "Documentos",
      payments: "Pagos",
      statements: "Estados de cuenta",
      messages: "Mensajes",
    },
    documents: {
      title: "Documentos",
      upload: "Subir documento",
      name: "Nombre",
      category: "Categoría",
      size: "Tamaño",
      uploaded: "Subido",
      actions: "Acciones",
    },
  },
  fr: {
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      close: "Fermer",
      search: "Rechercher",
      filter: "Filtrer",
      export: "Exporter",
      upload: "Télécharger",
      download: "Télécharger",
    },
    dashboard: {
      title: "Tableau de bord",
      documents: "Documents",
      payments: "Paiements",
      statements: "Relevés",
      messages: "Messages",
    },
    documents: {
      title: "Documents",
      upload: "Télécharger un document",
      name: "Nom",
      category: "Catégorie",
      size: "Taille",
      uploaded: "Téléchargé",
      actions: "Actions",
    },
  },
  de: {
    common: {
      loading: "Laden...",
      error: "Fehler",
      success: "Erfolg",
      cancel: "Abbrechen",
      save: "Speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      view: "Anzeigen",
      close: "Schließen",
      search: "Suchen",
      filter: "Filtern",
      export: "Exportieren",
      upload: "Hochladen",
      download: "Herunterladen",
    },
    dashboard: {
      title: "Dashboard",
      documents: "Dokumente",
      payments: "Zahlungen",
      statements: "Kontoauszüge",
      messages: "Nachrichten",
    },
    documents: {
      title: "Dokumente",
      upload: "Dokument hochladen",
      name: "Name",
      category: "Kategorie",
      size: "Größe",
      uploaded: "Hochgeladen",
      actions: "Aktionen",
    },
  },
};

export function getTranslation(
  locale: Locale,
  key: string,
  fallback?: string
): string {
  const keys = key.split(".");
  let value: string | Translations | undefined = translations[locale];

  for (const k of keys) {
    if (typeof value === "object" && value !== null) {
      value = value[k];
    } else {
      break;
    }
  }

  if (typeof value === "string") {
    return value;
  }

  // Fallback to English if translation not found
  if (locale !== "en") {
    let enValue: string | Translations | undefined = translations.en;
    for (const k of keys) {
      if (typeof enValue === "object" && enValue !== null) {
        enValue = enValue[k];
      } else {
        break;
      }
    }
    if (typeof enValue === "string") {
      return enValue;
    }
  }

  return fallback || key;
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const browserLang = navigator.language.split("-")[0];
  if (supportedLocales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}
