import type { MetadataRoute } from 'next';
import { getSitemapEntries } from '@/lib/cms';
import { pagePath } from '@/collections/Pages';
import { SITE_URL as base } from '@/lib/seo';

/** /sitemap.xml: every published page, case study, service and article, with when it last changed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, projects, services, posts } = await getSitemapEntries();
  const at = (d: string) => new Date(d);
  const newest = (list: { updatedAt: string }[]) => (list.length ? at(list.map((x) => x.updatedAt).sort().at(-1)!) : undefined);
  return [
    ...pages.map((p) => ({ url: `${base}${pagePath(p.slug)}`, lastModified: at(p.updatedAt), priority: p.slug === 'home' ? 1 : 0.8 })),
    ...projects.map((p) => ({ url: `${base}/work/${p.slug}`, lastModified: at(p.updatedAt), priority: 0.7 })),
    ...services.map((p) => ({ url: `${base}/services/${p.slug}`, lastModified: at(p.updatedAt), priority: 0.7 })),
    ...(posts.length ? [{ url: `${base}/insights`, lastModified: newest(posts), priority: 0.6 }] : []),
    ...posts.map((p) => ({ url: `${base}/insights/${p.slug}`, lastModified: at(p.updatedAt), priority: 0.5 })),
    { url: `${base}/lab`, priority: 0.4 },
  ];
}
