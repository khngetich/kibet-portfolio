import { cache } from 'react';
import { cookies, draftMode } from 'next/headers';
import { getPayload, type Where } from 'payload';
import config from '@payload-config';
import type { Project } from '@/payload-types';

/**
 * All reads for the public site. Pages are statically rendered and re-rendered when
 * content changes (see hooks/revalidate.ts). In draft mode (the admin's live preview)
 * unpublished changes are shown instead.
 */

const cms = () => getPayload({ config });

export const isPreview = async () => (await draftMode()).isEnabled;

/** True inside the Studio's canvas iframe (draft mode entered with ?studio=1). */
export const isStudioCanvas = async () => (await isPreview()) && (await cookies()).get('studio-canvas')?.value === '1';

// In preview, drafts show too, except empty ones (the admin's "Create" drawer autosaves an untitled draft as soon as it opens).
const published = (draft: boolean): Where => (draft ? { title: { exists: true } } : { _status: { equals: 'published' } });

export const getSite = cache(async () => (await cms()).findGlobal({ slug: 'site', depth: 1 }));

export const getHeader = cache(async () => (await cms()).findGlobal({ slug: 'header', depth: 0 }));
export const getFooter = cache(async () => (await cms()).findGlobal({ slug: 'footer', depth: 0 }));
export const getTheme = cache(async () => (await cms()).findGlobal({ slug: 'theme', depth: 0 }));

/** A page by slug ("home" is the root), with its sections' projects and images populated. */
export const getPage = cache(async (slug: string) => {
  const draft = await isPreview();
  const { docs } = await (await cms()).find({
    collection: 'pages',
    where: { and: [{ slug: { equals: slug } }, published(draft)] },
    depth: 2,
    limit: 1,
    draft,
  });
  return docs[0] ?? null;
});

export const getPageSlugs = async () => {
  const { docs } = await (await cms()).find({ collection: 'pages', where: published(false), limit: 1000, depth: 0, select: { slug: true } });
  return docs.map((d) => d.slug).filter(Boolean) as string[];
};

const cardSelect = { title: true, slug: true, client: true, year: true, disciplines: true, summary: true, cover: true, featured: true, accent: true, role: true, outcome: true, stats: true } as const;
export type ProjectCard = Pick<Project, keyof typeof cardSelect | 'id'>;

export const getProjects = cache(async (opts: { featured?: boolean } = {}) => {
  const draft = await isPreview();
  const where: Where = { and: [published(draft), ...(opts.featured ? [{ featured: { equals: true } }] : [])] };
  const { docs } = await (await cms()).find({ collection: 'projects', where, sort: '_order', depth: 1, limit: 100, draft, select: cardSelect });
  return docs as ProjectCard[];
});

export const getProject = cache(async (slug: string) => {
  const draft = await isPreview();
  const { docs } = await (await cms()).find({
    collection: 'projects',
    where: { and: [{ slug: { equals: slug } }, published(draft)] },
    depth: 2,
    limit: 1,
    draft,
  });
  return docs[0] ?? null;
});

export const getProjectSlugs = async () => {
  const { docs } = await (await cms()).find({ collection: 'projects', where: published(false), limit: 1000, depth: 0, select: { slug: true } });
  return docs.map((d) => d.slug).filter(Boolean) as string[];
};

export { asMedia } from './media';
