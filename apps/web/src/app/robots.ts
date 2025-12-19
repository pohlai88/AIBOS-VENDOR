import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendor.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/_next/", "/dashboard/", "/documents/", "/payments/", "/statements/", "/messages/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
