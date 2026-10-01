import { cache } from 'react';
import type { Payload } from 'payload';
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { pagePath } from '@/collections/Pages';

/**
 * The dashboard's queries. Each card streams in on its own (Suspense), so these are wrapped in
 * React's per-request `cache`: cards that need the same rows share one query. Every query
 * selects only the fields it shows, and counts use COUNT rather than loading documents.
 */

const DAY = 86400000;
export const LARGE_IMAGE = 1024 * 1024;

/** Live = published with nothing newer; edits = published, with unpublished changes saved as a draft; draft = not on the site. */
export type Status = 'live' | 'edits' | 'draft';

const ago = (iso: string | null | undefined, now: number) => {
  if (!iso) return '';
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  if (mins < 60 * 24 * 7) return `${Math.round(mins / 1440)} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Payload keeps the published copy in the main table and drafts as versions: saving a draft
 * over a published document leaves the main row "published". So the main row's status says
 * whether it is on the site, and the latest version's status says whether edits are waiting.
 */
const statusOf = (latest?: string | null, main?: string | null): Status =>
  main !== 'published' ? 'draft' : latest === 'draft' ? 'edits' : 'live';

type Meta = { title?: string | null; description?: string | null; image?: unknown } | null;

export const getPages = cache(async (payload: Payload) => {
  const [latest, main] = await Promise.all([
    payload.find({ collection: 'pages', draft: true, depth: 0, limit: 200, pagination: false, sort: '-updatedAt', select: { title: true, slug: true, updatedAt: true, _status: true, meta: true } }),
    payload.find({ collection: 'pages', depth: 0, limit: 200, pagination: false, select: { _status: true } }),
  ]);
  const live = new Map(main.docs.map((d) => [d.id, d._status]));
  const now = Date.now();
  return latest.docs.map((p) => ({
    id: p.id,
    title: p.title || 'Untitled page',
    slug: p.slug ?? null,
    // a new draft may not have an address yet
    path: p.slug ? pagePath(p.slug) : null,
    meta: (p.meta ?? null) as Meta,
    status: statusOf(p._status, live.get(p.id)),
    ago: ago(p.updatedAt, now),
    updatedAt: p.updatedAt,
  }));
});

export const getProjects = cache(async (payload: Payload) => {
  const [latest, main] = await Promise.all([
    payload.find({ collection: 'projects', draft: true, depth: 0, limit: 300, pagination: false, sort: '-updatedAt', select: { title: true, slug: true, client: true, updatedAt: true, _status: true, featured: true, samples: true, liveUrl: true } }),
    payload.find({ collection: 'projects', depth: 0, limit: 300, pagination: false, select: { _status: true } }),
  ]);
  const live = new Map(main.docs.map((d) => [d.id, d._status]));
  const now = Date.now();
  return latest.docs.map((p) => ({
    id: p.id,
    title: p.title || 'Untitled project',
    client: (p as { client?: string | null }).client ?? null,
    path: p.slug ? `/work/${p.slug}` : null,
    featured: !!p.featured,
    samples: (p.samples ?? []).length,
    status: statusOf(p._status, live.get(p.id)),
    ago: ago(p.updatedAt, now),
    updatedAt: p.updatedAt,
  }));
});

export const getSiteDefaults = cache(async (payload: Payload) => {
  const site = await payload.findGlobal({ slug: 'site', depth: 0, select: { name: true, metaDescription: true, ogImage: true } });
  return { name: site.name, description: !!site.metaDescription, image: !!site.ogImage };
});

export const getMediaStats = cache(async (payload: Payload) => {
  const [total, large] = await Promise.all([
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'media', where: { and: [{ mimeType: { like: 'image' } }, { filesize: { greater_than: LARGE_IMAGE } }] } }),
  ]);
  return { total: total.totalDocs, large: large.totalDocs };
});

/**
 * Enquiries per hour for the chart: grouped in the database, so the volume is never capped and
 * the browser still sorts the hours into days in the editor's own time zone. Two years, so
 * every range can be compared with the one before it.
 */
export const getEnquiryStats = cache(async (payload: Payload) => {
  const since = new Date(Date.now() - 2 * 366 * DAY).toISOString();
  const [rows, replied, archived, total] = await Promise.all([
    (payload.db as unknown as PostgresAdapter).drizzle.execute(sql`
      SELECT extract(epoch FROM date_trunc('hour', created_at)) * 1000 AS t, count(*)::int AS n
      FROM inquiries WHERE created_at > ${since} GROUP BY 1`),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'replied' } } }),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'archived' } } }),
    payload.count({ collection: 'inquiries' }),
  ]);
  const hours = (rows.rows as { t: string | number; n: string | number }[]).map((r) => ({ t: Number(r.t), n: Number(r.n) }));
  // archived messages were set aside, not answered: they leave the reply rate entirely
  const open = total.totalDocs - archived.totalDocs;
  return { hours, replyRate: open ? Math.round((replied.totalDocs / open) * 100) : null };
});

export const getInbox = cache(async (payload: Payload) => {
  const [recent, unread, total] = await Promise.all([
    payload.find({ collection: 'inquiries', depth: 0, limit: 6, sort: '-createdAt', where: { status: { not_equals: 'archived' } }, select: { name: true, email: true, service: true, message: true, status: true, createdAt: true } }),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'inquiries' }),
  ]);
  const now = Date.now();
  return {
    unread: unread.totalDocs,
    total: total.totalDocs,
    items: recent.docs.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      service: e.service ?? null,
      excerpt: e.message.replace(/\s+/g, ' ').slice(0, 140),
      status: e.status ?? 'new',
      ago: ago(e.createdAt, now),
    })),
  };
});
