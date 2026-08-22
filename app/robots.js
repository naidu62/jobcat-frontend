// app/robots.js
import { SITE_URL } from "@/lib/api";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep auth flows and on-site search results out of the index.
        disallow: ["/login", "/register", "/search"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
