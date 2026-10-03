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

/** Insights (articles), newest first, with the same live / unpublished changes / not live rule. */
export const getPostsStatus = cache(async (payload: Payload) => {
  const [latest, main] = await Promise.all([
    payload.find({ collection: 'posts', draft: true, depth: 0, limit: 200, pagination: false, sort: '-updatedAt', select: { title: true, slug: true, updatedAt: true, _status: true, publishedAt: true } }),
    payload.find({ collection: 'posts', depth: 0, limit: 200, pagination: false, select: { _status: true } }),
  ]);
  const live = new Map(main.docs.map((d) => [d.id, d._status]));
  const now = Date.now();
  return latest.docs.map((p) => ({
    id: p.id,
    title: p.title || 'Untitled insight',
    path: p.slug ? `/insights/${p.slug}` : null,
    status: statusOf(p._status, live.get(p.id)),
    ago: ago(p.updatedAt, now),
    updatedAt: p.updatedAt,
  }));
});

/** Services in site order, with whether each has its own cover (the card borrows a project cover otherwise). */
export const getServicesCovers = cache(async (payload: Payload) => {
  const res = await payload.find({ collection: 'services', draft: true, depth: 0, limit: 100, pagination: false, sort: '_order', select: { title: true, image: true } });
  return res.docs.map((d) => ({ id: d.id, title: d.title || 'Untitled service', cover: !!d.image }));
});

type Sec = { blockType: string; hidden?: boolean | null; photo?: unknown; intro?: string | null; body?: unknown; items?: unknown[] | null };

/**
 * What a visitor needs to trust you, as checks. Each names where it's fixed. Read from Site
 * settings, the live pages' sections (portrait and bio, testimonials) and the projects.
 */
export const getProfile = cache(async (payload: Payload) => {
  const [site, pages, projects] = await Promise.all([
    payload.findGlobal({ slug: 'site', depth: 0 }),
    payload.find({ collection: 'pages', depth: 0, limit: 200, pagination: false, where: { _status: { equals: 'published' } }, select: { sections: true } }),
    getProjects(payload),
  ]);
  const sections = pages.docs.flatMap((p) => ((p as { sections?: Sec[] | null }).sections ?? []).filter((x) => !x.hidden));
  const about = sections.find((x) => (x.blockType === 'aboutBanner' || x.blockType === 'profile') && x.photo && (x.intro || x.body));
  const quotes = sections.filter((x) => x.blockType === 'testimonials').reduce((a, x) => a + (x.items?.length ?? 0), 0);
  const socials = (site.socials ?? []).filter((x) => x.url).length;
  const showcase = projects.filter((p) => p.status !== 'draft' && p.samples > 0).length;
  return [
    { key: 'identity', label: 'Role and location', ok: !!(site.role && site.location), detail: site.role && site.location ? `${site.role} · ${site.location}` : 'Say what you do and where you are', fix: 'site' },
    { key: 'availability', label: 'Availability', ok: !!site.availability?.trim(), detail: site.availability?.trim() || 'Tell visitors whether you’re booking', fix: 'site' },
    { key: 'contact', label: 'Ways to reach you', ok: !!(site.email && (site.phone || site.bookingUrl)), detail: site.email && (site.phone || site.bookingUrl) ? 'Email plus phone or booking link' : 'Add a phone number or a booking link', fix: 'site' },
    { key: 'socials', label: 'Social profiles', ok: socials >= 2, detail: socials ? `${socials} linked${socials < 2 ? ', add one more' : ''}` : 'Link at least two', fix: 'site' },
    { key: 'about', label: 'Portrait and short bio', ok: !!about, detail: about ? 'In your About section' : 'Add an About or Profile section with a photo', fix: 'pages' },
    { key: 'quotes', label: 'Client testimonials', ok: quotes >= 2, detail: quotes ? `${quotes} on the site${quotes < 2 ? ', add one more' : ''}` : 'Add a Testimonials section with two or more', fix: 'pages' },
    { key: 'showcase', label: 'Three live case studies', ok: showcase >= 3, detail: `${showcase} live with samples`, fix: 'projects' },
    { key: 'sharing', label: 'Search and share defaults', ok: !!(site.metaDescription && site.ogImage), detail: site.metaDescription && site.ogImage ? 'Description and share image set' : 'Add a site description and share image', fix: 'site' },
  ] as const;
});

/** The latest four projects with their covers, for the visual "Recent work" strip. Status comes from getProjects (same rule). */
export const getRecentWork = cache(async (payload: Payload) => {
  const [latest, all] = await Promise.all([
    payload.find({ collection: 'projects', draft: true, depth: 1, limit: 4, sort: '-updatedAt', select: { title: true, client: true, year: true, cover: true, samples: true } }),
    getProjects(payload),
  ]);
  const byId = new Map(all.map((p) => [p.id, p]));
  return latest.docs.map((p) => ({
    id: p.id,
    title: p.title || 'Untitled project',
    client: p.client ?? null,
    year: p.year ?? null,
    cover: p.cover ?? null,
    samples: (p.samples ?? []).length,
    status: byId.get(p.id)?.status ?? 'draft',
    ago: byId.get(p.id)?.ago ?? '',
  }));
});

/**
 * What a full case study has beyond the required title, summary and cover. A project's score is
 * the share of these it has; the dashboard lists the lowest first, with what each one is missing.
 */
export const CASE_STUDY_PARTS = [
  { key: 'brief', label: 'brief' },
  { key: 'approach', label: 'approach' },
  { key: 'outcome', label: 'outcome' },
  { key: 'samples', label: 'samples' },
  { key: 'tools', label: 'tools or deliverables' },
  { key: 'timeline', label: 'timeline' },
] as const;

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim().length > 0 : v != null);

export const getCaseStudies = cache(async (payload: Payload) => {
  const [rows, all] = await Promise.all([
    payload.find({ collection: 'projects', draft: true, depth: 0, limit: 300, pagination: false, sort: '-updatedAt', select: { title: true, client: true, brief: true, approach: true, outcome: true, samples: true, tools: true, deliverables: true, timeline: true } }),
    getProjects(payload),
  ]);
  const byId = new Map(all.map((p) => [p.id, p]));
  return rows.docs.map((p) => {
    const has: Record<(typeof CASE_STUDY_PARTS)[number]['key'], boolean> = {
      brief: filled(p.brief), approach: filled(p.approach), outcome: filled(p.outcome), samples: filled(p.samples),
      tools: filled(p.tools) || filled(p.deliverables), timeline: filled(p.timeline),
    };
    const missing = CASE_STUDY_PARTS.filter((c) => !has[c.key]).map((c) => c.label);
    return {
      id: p.id,
      title: p.title || 'Untitled project',
      client: p.client ?? null,
      status: byId.get(p.id)?.status ?? ('draft' as Status),
      score: Math.round(((CASE_STUDY_PARTS.length - missing.length) / CASE_STUDY_PARTS.length) * 100),
      missing,
    };
  });
});

/**
 * Projects grouped by discipline, each group with its newest project's cover (one small media
 * query for at most one cover per discipline). A project with several disciplines counts in each.
 */
export const getDisciplines = cache(async (payload: Payload, options: readonly { label: string; value: string }[]) => {
  const [rows, all] = await Promise.all([
    payload.find({ collection: 'projects', draft: true, depth: 0, limit: 300, pagination: false, sort: '-updatedAt', select: { title: true, disciplines: true, cover: true } }),
    getProjects(payload),
  ]);
  const byId = new Map(all.map((p) => [p.id, p]));
  const groups = options.map((o) => {
    const list = rows.docs.filter((p) => (p.disciplines ?? []).includes(o.value as never));
    const coverId = list.map((p) => (typeof p.cover === 'object' ? p.cover?.id : p.cover)).find((c) => c != null) ?? null;
    return { value: o.value, label: o.label, count: list.length, live: list.filter((p) => byId.get(p.id)?.status !== 'draft').length, latest: list[0]?.title ?? null, coverId };
  });
  const ids = [...new Set(groups.map((g) => g.coverId).filter((c): c is number => c != null))];
  const covers = ids.length
    ? (await payload.find({ collection: 'media', depth: 0, limit: ids.length, pagination: false, where: { id: { in: ids } } })).docs
    : [];
  const coverById = new Map(covers.map((m) => [m.id, m]));
  return groups.map(({ coverId, ...g }) => ({ ...g, cover: coverId != null ? coverById.get(coverId) ?? null : null }));
});

export const getSiteDefaults = cache(async (payload: Payload) => {
  const site = await payload.findGlobal({ slug: 'site', depth: 0, select: { name: true, metaDescription: true, ogImage: true, availability: true } });
  return { name: site.name, description: !!site.metaDescription, image: !!site.ogImage, availability: site.availability?.trim() || null };
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

/** What people ask for: enquiries per service over the last twelve months, most asked first. */
export const getServiceMix = cache(async (payload: Payload) => {
  const since = new Date(Date.now() - 366 * DAY).toISOString();
  const rows = await (payload.db as unknown as PostgresAdapter).drizzle.execute(sql`
    SELECT coalesce(nullif(trim(service), ''), 'General enquiry') AS service, count(*)::int AS n
    FROM inquiries WHERE created_at > ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 6`);
  return (rows.rows as { service: string; n: number | string }[]).map((r) => ({ service: r.service, n: Number(r.n) }));
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
