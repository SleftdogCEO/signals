import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth", "/dashboard/", "/onboarding/", "/brief/", "/snapshot/"],
      },
    ],
    sitemap: "https://sleftsignals.com/sitemap.xml",
  };
}
