import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/cms';

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs();
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/work`, priority: 0.9 },
    { url: `${base}/about`, priority: 0.6 },
    ...slugs.map((s) => ({ url: `${base}/work/${s}`, priority: 0.8 })),
  ];
}
