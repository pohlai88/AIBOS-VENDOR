export const config = {
  app: {
    name: "AI-BOS Vendor Portal",
    version: "0.1.0",
  },
  api: {
    timeout: 30000,
    retries: 3,
  },
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "jpg",
      "jpeg",
      "png",
      "gif",
    ],
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;

