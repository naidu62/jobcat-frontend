// app/robots.js
import { SITE_URL } from "@/lib/api";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        // Public content surfaces are explicitly allowed for crawlers.
        allow: ["/", "/jobs/", "/schemes/", "/scholarships/"],
        // Keep private app surfaces out of the index.
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/settings",
          "/verify-email",
          "/reset-password",
          "/search",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
