import { cache } from 'react';
import { draftMode } from 'next/headers';
import { getPayload, type Where } from 'payload';
import config from '@payload-config';
import type { Media, Project } from '@/payload-types';

/**
 * All reads for the public site. Pages are statically rendered and re-rendered when
 * content changes (see hooks/revalidate.ts). In draft mode (the admin's live preview)
 * unpublished changes are shown instead.
 */

const cms = () => getPayload({ config });

export const isPreview = async () => (await draftMode()).isEnabled;

const published = (draft: boolean): Where => (draft ? {} : { _status: { equals: 'published' } });

export const getSite = cache(async () => (await cms()).findGlobal({ slug: 'site', depth: 1 }));

export const getHome = cache(async () => {
  const draft = await isPreview();
  return (await cms()).findGlobal({ slug: 'home', depth: 1, draft });
});

export const getAbout = cache(async () => {
  const draft = await isPreview();
  return (await cms()).findGlobal({ slug: 'about', depth: 1, draft });
});

const cardSelect = { title: true, slug: true, client: true, year: true, disciplines: true, summary: true, cover: true, featured: true, accent: true } as const;
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

/** Narrows an upload field (id or populated doc) to a usable Media document. */
export const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null);
