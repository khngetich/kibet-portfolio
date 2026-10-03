import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

/**
 * /robots.txt. It has to live at the root of app/ (Next ignores it inside a route group).
 * Crawlers skip the CMS, the Studio, preview routes and the share-card generator.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/studio', '/preview', '/exit-preview', '/og'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
