import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendor.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/privacy", "/terms", "/security"],
        disallow: [
          "/api/",
          "/_next/",
          "/dashboard",
          "/documents",
          "/payments",
          "/statements",
          "/messages",
          "/settings",
          "/login",
          "/signup",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
