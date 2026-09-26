import type { MetadataRoute } from 'next';
import { getPageSlugs, getProjectSlugs } from '@/lib/cms';
import { pagePath } from '@/collections/Pages';

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects] = await Promise.all([getPageSlugs(), getProjectSlugs()]);
  return [
    ...pages.map((s) => ({ url: `${base}${pagePath(s)}`, priority: s === 'home' ? 1 : 0.8 })),
    ...projects.map((s) => ({ url: `${base}/work/${s}`, priority: 0.7 })),
  ];
}
