import type { MetadataRoute } from 'next';
import { getPageSlugs, getPostSlugs, getProjectSlugs } from '@/lib/cms';
import { pagePath } from '@/collections/Pages';

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects, posts] = await Promise.all([getPageSlugs(), getProjectSlugs(), getPostSlugs()]);
  return [
    ...pages.map((s) => ({ url: `${base}${pagePath(s)}`, priority: s === 'home' ? 1 : 0.8 })),
    ...projects.map((s) => ({ url: `${base}/work/${s}`, priority: 0.7 })),
    ...(posts.length ? [{ url: `${base}/insights`, priority: 0.6 }] : []),
    ...posts.map((s) => ({ url: `${base}/insights/${s}`, priority: 0.5 })),
  ];
}
