import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Search engines may index the public pages. The admin dashboard and the API are blocked.
// (/download is blocked too so crawlers do not create click records.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/download"] }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
