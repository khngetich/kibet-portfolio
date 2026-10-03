'use server';

import { headers } from 'next/headers';
import { APIError, getPayload, ValidationError, type Payload, type TypedUser, type Where } from 'payload';
import config from '@payload-config';

/**
 * Everything the Studio reads and writes. Each action resolves the signed-in editor from
 * the session cookie and passes them to Payload with `overrideAccess: false`, so the
 * collection/global access rules and field validation apply exactly as in the admin.
 */

type Rec = Record<string, unknown>;
type GlobalSlug = 'header' | 'footer' | 'theme' | 'site';
const GLOBALS: GlobalSlug[] = ['header', 'footer', 'theme', 'site'];

/** An error whose message is written for the editor, so it's safe to show as it is. */
class Shown extends Error {}

async function session(): Promise<{ payload: Payload; user: TypedUser }> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) throw new Shown('Your session has ended. Sign in again to keep editing.');
  return { payload, user };
}

/**
 * Optimistic concurrency: the editor sends back the `updatedAt` it last saw. A newer stored one
 * means someone saved in between (the admin, another tab or device), and writing now would
 * silently undo their change. Payload returns the stored updatedAt from every save, so the
 * editor's own consecutive saves always match. New documents have nothing to compare.
 */
function assertFresh(stored: string | null | undefined, seen: unknown) {
  if (typeof seen !== 'string' || !stored) return;
  if (new Date(stored).getTime() > new Date(seen).getTime()) {
    throw new Shown('Someone else changed this since you opened it. Reload to see their changes, then make your edit again.');
  }
}
async function freshDoc(payload: Payload, collection: 'pages' | 'projects' | 'posts' | 'services', id: number, seen: unknown) {
  const cur = await payload.findByID({ collection, id, draft: true, depth: 0, select: { updatedAt: true } as never });
  assertFresh((cur as { updatedAt?: string }).updatedAt, seen);
}

/** Plain JSON only: dates and Payload internals don't cross the server-action boundary well. */
const json = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const clean = (data: Rec) => { const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = data; return rest; };

/**
 * Every action returns `{ ok, data }` or `{ ok: false, error }` instead of throwing:
 * Next.js replaces thrown server-action messages with a generic one in production, and
 * the editor should see the real reason ("Your session has ended", a validation error…).
 * Only messages meant for people are passed on (ours, field validation, Payload's 4xx
 * errors such as "locked" or "not allowed"); anything else (a database error can quote its
 * SQL) is logged on the server and replaced with a generic line.
 * components/studio/api.ts unwraps these back into values / thrown Errors on the client.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ValidationError) {
      const detail = (e.data?.errors ?? []).map((x) => x.message).filter(Boolean).join(' ');
      return { ok: false, error: detail || e.message };
    }
    if (e instanceof Shown || (e instanceof APIError && e.status < 500)) return { ok: false, error: e.message };
    console.error('[studio]', e);
    return { ok: false, error: 'Something went wrong on the server. Try again; if it keeps happening, reload the Studio.' };
  }
}

/* ── pages ── */

async function listPagesImpl() {
  const { payload, user } = await session();
  const res = await payload.find({ collection: 'pages', user, overrideAccess: false, draft: true, depth: 0, limit: 200, sort: 'title', select: { title: true, slug: true, _status: true, updatedAt: true } });
  return json(res.docs);
}

async function getPageImpl(id: number) {
  const { payload, user } = await session();
  return json(await payload.findByID({ collection: 'pages', id, user, overrideAccess: false, draft: true, depth: 0 }));
}

async function savePageDraftImpl(id: number, data: Rec) {
  const { payload, user } = await session();
  await freshDoc(payload, 'pages', id, data.updatedAt);
  const doc = await payload.update({ collection: 'pages', id, data: { ...clean(data), _status: 'draft' } as never, draft: true, autosave: true, context: { autosave: true }, user, overrideAccess: false, overrideLock: false, depth: 0 });
  return json({ updatedAt: doc.updatedAt });
}

async function publishPageImpl(id: number, data: Rec) {
  const { payload, user } = await session();
  await freshDoc(payload, 'pages', id, data.updatedAt);
  const doc = await payload.update({ collection: 'pages', id, data: { ...clean(data), _status: 'published' } as never, user, overrideAccess: false, overrideLock: false, depth: 0 });
  return json(doc);
}

async function createPageImpl(input: { title: string; slug: string }) {
  const { payload, user } = await session();
  const doc = await payload.create({ collection: 'pages', data: { title: input.title, slug: input.slug, sections: [], _status: 'draft' } as never, user, overrideAccess: false, draft: true, depth: 0 });
  return json({ id: doc.id, title: doc.title, slug: doc.slug });
}

async function duplicatePageImpl(id: number) {
  const { payload, user } = await session();
  const src = await payload.findByID({ collection: 'pages', id, user, overrideAccess: false, draft: true, depth: 0 });
  const { title, slug, sections, meta } = src as unknown as Rec & { title: string; slug: string };
  const strip = (v: unknown): unknown => (Array.isArray(v) ? v.map(strip) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'id').map(([k, x]) => [k, strip(x)])) : v);
  const doc = await payload.create({ collection: 'pages', data: { title: `${title} (copy)`, slug: `${slug}-copy-${Date.now().toString(36).slice(-4)}`, sections: strip(sections), meta: strip(meta), _status: 'draft' } as never, user, overrideAccess: false, draft: true, depth: 0 });
  return json({ id: doc.id, title: doc.title, slug: doc.slug });
}

async function deletePageImpl(id: number) {
  const { payload, user } = await session();
  await payload.delete({ collection: 'pages', id, user, overrideAccess: false });
  return true;
}

async function listPageVersionsImpl(id: number) {
  const { payload, user } = await session();
  const res = await payload.findVersions({ collection: 'pages', where: { parent: { equals: id } }, sort: '-updatedAt', limit: 40, depth: 0, user, overrideAccess: false });
  return json(res.docs.map((v) => {
    const version = v.version as unknown as Rec;
    return { id: v.id, updatedAt: v.updatedAt, status: version._status as string, autosave: (v as unknown as Rec).autosave === true, title: version.title as string, sections: (version.sections as unknown[] | undefined)?.length ?? 0 };
  }));
}

async function restorePageVersionImpl(versionId: number | string) {
  const { payload, user } = await session();
  await payload.restoreVersion({ collection: 'pages', id: versionId as never, user, overrideAccess: false, depth: 0 });
  return true;
}

/* ── globals: header, footer, styles, site settings ── */

async function getGlobalImpl(slug: GlobalSlug) {
  if (!GLOBALS.includes(slug)) throw new Shown('Unknown settings');
  const { payload, user } = await session();
  return json(await payload.findGlobal({ slug, user, overrideAccess: false, depth: 0 }));
}

async function saveGlobalImpl(slug: GlobalSlug, data: Rec) {
  if (!GLOBALS.includes(slug)) throw new Shown('Unknown settings');
  const { payload, user } = await session();
  assertFresh((await payload.findGlobal({ slug, depth: 0, select: { updatedAt: true } as never })).updatedAt as string | undefined, data.updatedAt);
  return json(await payload.updateGlobal({ slug, data: clean(data) as never, user, overrideAccess: false, overrideLock: false, depth: 0 }));
}

/* ── media library ── */

async function listMediaImpl(opts: { search?: string; page?: number; ids?: number[] } = {}) {
  const { payload, user } = await session();
  const where: Where | undefined = opts.ids?.length ? { id: { in: opts.ids } } : opts.search ? { or: [{ alt: { like: opts.search } }, { filename: { like: opts.search } }] } : undefined;
  const res = await payload.find({ collection: 'media', where, sort: '-createdAt', limit: opts.ids?.length ? opts.ids.length : 48, page: opts.page ?? 1, depth: 0, user, overrideAccess: false });
  return json({ docs: res.docs.map((m) => ({ id: m.id, url: m.url, alt: m.alt, filename: m.filename, mimeType: m.mimeType, width: m.width, height: m.height, filesize: m.filesize })), hasNextPage: res.hasNextPage });
}

async function uploadMediaImpl(form: FormData) {
  const { payload, user } = await session();
  const file = form.get('file');
  if (!(file instanceof File)) throw new Shown('Choose a file to upload.');
  const alt = String(form.get('alt') || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
  const data = Buffer.from(await file.arrayBuffer());
  const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, name: file.name, mimetype: file.type, size: file.size }, user, overrideAccess: false });
  return json({ id: doc.id, url: doc.url, alt: doc.alt, filename: doc.filename, mimeType: doc.mimeType, width: doc.width, height: doc.height, filesize: doc.filesize });
}

async function updateMediaImpl(id: number, data: { alt?: string; caption?: string }) {
  const { payload, user } = await session();
  await payload.update({ collection: 'media', id, data, user, overrideAccess: false });
  return true;
}

async function deleteMediaImpl(id: number) {
  const { payload, user } = await session();
  await payload.delete({ collection: 'media', id, user, overrideAccess: false });
  return true;
}

/* ── projects and enquiries ── */

// the parts of a case study beyond the required title, summary and cover (same rule as the dashboard)
const STORY_PARTS = ['brief', 'approach', 'outcome', 'samples', 'tools', 'timeline'] as const;
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim().length > 0 : v != null);

async function listProjectsImpl() {
  const { payload, user } = await session();
  const [res, main] = await Promise.all([
    payload.find({ collection: 'projects', user, overrideAccess: false, draft: true, depth: 0, limit: 200, sort: '_order', select: { title: true, slug: true, client: true, cover: true, featured: true, _status: true, updatedAt: true, disciplines: true, brief: true, approach: true, outcome: true, samples: true, tools: true, deliverables: true, timeline: true } }),
    // the main row says whether a project is on the site; the latest draft says whether edits wait
    payload.find({ collection: 'projects', user, overrideAccess: false, depth: 0, limit: 200, pagination: false, select: { _status: true } }),
  ]);
  const live = new Map(main.docs.map((d) => [d.id, d._status === 'published']));
  return json(res.docs.map(({ brief, approach, outcome, samples, tools, deliverables, timeline, ...p }) => {
    const has = { brief: filled(brief), approach: filled(approach), outcome: filled(outcome), samples: filled(samples), tools: filled(tools) || filled(deliverables), timeline: filled(timeline) };
    const missing = STORY_PARTS.filter((k) => !has[k]);
    return {
      ...p,
      live: live.get(p.id) ?? false,
      samples: Array.isArray(samples) ? samples.length : 0,
      score: Math.round(((STORY_PARTS.length - missing.length) / STORY_PARTS.length) * 100),
      missing,
    };
  }));
}

async function getProjectImpl(id: number) {
  const { payload, user } = await session();
  return json(await payload.findByID({ collection: 'projects', id, user, overrideAccess: false, draft: true, depth: 0 }));
}

async function saveProjectImpl(id: number | null, data: Rec, publish: boolean) {
  const { payload, user } = await session();
  if (id) await freshDoc(payload, 'projects', id, data.updatedAt);
  const body = { ...clean(data), _status: publish ? 'published' : 'draft' } as never;
  const doc = id
    ? await payload.update({ collection: 'projects', id, data: body, draft: !publish, user, overrideAccess: false, overrideLock: false, depth: 0 })
    : await payload.create({ collection: 'projects', data: body, draft: !publish, user, overrideAccess: false, depth: 0 });
  return json({ id: doc.id, title: doc.title, updatedAt: doc.updatedAt });
}

async function deleteProjectImpl(id: number) {
  const { payload, user } = await session();
  await payload.delete({ collection: 'projects', id, user, overrideAccess: false });
  return true;
}

async function listPostsImpl() {
  const { payload, user } = await session();
  const res = await payload.find({ collection: 'posts', user, overrideAccess: false, draft: true, depth: 0, limit: 200, sort: '-publishedAt', select: { title: true, slug: true, excerpt: true, cover: true, publishedAt: true, tags: true, _status: true, updatedAt: true } });
  return json(res.docs);
}

async function getPostImpl(id: number) {
  const { payload, user } = await session();
  return json(await payload.findByID({ collection: 'posts', id, user, overrideAccess: false, draft: true, depth: 0 }));
}

async function savePostImpl(id: number | null, data: Rec, publish: boolean) {
  const { payload, user } = await session();
  if (id) await freshDoc(payload, 'posts', id, data.updatedAt);
  const body = { ...clean(data), _status: publish ? 'published' : 'draft' } as never;
  const doc = id
    ? await payload.update({ collection: 'posts', id, data: body, draft: !publish, user, overrideAccess: false, overrideLock: false, depth: 0 })
    : await payload.create({ collection: 'posts', data: body, draft: !publish, user, overrideAccess: false, depth: 0 });
  return json({ id: doc.id, title: doc.title, updatedAt: doc.updatedAt });
}

async function deletePostImpl(id: number) {
  const { payload, user } = await session();
  await payload.delete({ collection: 'posts', id, user, overrideAccess: false });
  return true;
}

async function listServicesImpl() {
  const { payload, user } = await session();
  const res = await payload.find({ collection: 'services', user, overrideAccess: false, draft: true, depth: 0, limit: 100, sort: '_order', select: { title: true, slug: true, description: true, image: true, priceFrom: true, currency: true, unit: true, featured: true, starter: true, _status: true, updatedAt: true } });
  return json(res.docs);
}

async function getServiceImpl(id: number) {
  const { payload, user } = await session();
  return json(await payload.findByID({ collection: 'services', id, user, overrideAccess: false, draft: true, depth: 0 }));
}

async function saveServiceImpl(id: number | null, data: Rec, publish: boolean) {
  const { payload, user } = await session();
  if (id) await freshDoc(payload, 'services', id, data.updatedAt);
  const body = { ...clean(data), _status: publish ? 'published' : 'draft' } as never;
  const doc = id
    ? await payload.update({ collection: 'services', id, data: body, draft: !publish, user, overrideAccess: false, overrideLock: false, depth: 0 })
    : await payload.create({ collection: 'services', data: body, draft: !publish, user, overrideAccess: false, depth: 0 });
  return json({ id: doc.id, title: doc.title, updatedAt: doc.updatedAt });
}

async function deleteServiceImpl(id: number) {
  const { payload, user } = await session();
  await payload.delete({ collection: 'services', id, user, overrideAccess: false });
  return true;
}

async function listEnquiriesImpl() {
  const { payload, user } = await session();
  const res = await payload.find({ collection: 'inquiries', user, overrideAccess: false, sort: '-createdAt', limit: 100, depth: 0 });
  return json(res.docs);
}

async function setEnquiryStatusImpl(id: number, status: 'new' | 'replied' | 'archived') {
  const { payload, user } = await session();
  await payload.update({ collection: 'inquiries', id, data: { status }, user, overrideAccess: false });
  return true;
}

async function deleteEnquiryImpl(id: number) {
  const { payload, user } = await session();
  await payload.delete({ collection: 'inquiries', id, user, overrideAccess: false });
  return true;
}

/* ── exported actions (wrapped, see `run`) ── */

export async function listPages(...a: Parameters<typeof listPagesImpl>): Promise<Result<Awaited<ReturnType<typeof listPagesImpl>>>> { return run(() => listPagesImpl(...a)); }
export async function getPage(...a: Parameters<typeof getPageImpl>): Promise<Result<Awaited<ReturnType<typeof getPageImpl>>>> { return run(() => getPageImpl(...a)); }
export async function savePageDraft(...a: Parameters<typeof savePageDraftImpl>): Promise<Result<Awaited<ReturnType<typeof savePageDraftImpl>>>> { return run(() => savePageDraftImpl(...a)); }
export async function publishPage(...a: Parameters<typeof publishPageImpl>): Promise<Result<Awaited<ReturnType<typeof publishPageImpl>>>> { return run(() => publishPageImpl(...a)); }
export async function createPage(...a: Parameters<typeof createPageImpl>): Promise<Result<Awaited<ReturnType<typeof createPageImpl>>>> { return run(() => createPageImpl(...a)); }
export async function duplicatePage(...a: Parameters<typeof duplicatePageImpl>): Promise<Result<Awaited<ReturnType<typeof duplicatePageImpl>>>> { return run(() => duplicatePageImpl(...a)); }
export async function deletePage(...a: Parameters<typeof deletePageImpl>): Promise<Result<Awaited<ReturnType<typeof deletePageImpl>>>> { return run(() => deletePageImpl(...a)); }
export async function listPageVersions(...a: Parameters<typeof listPageVersionsImpl>): Promise<Result<Awaited<ReturnType<typeof listPageVersionsImpl>>>> { return run(() => listPageVersionsImpl(...a)); }
export async function restorePageVersion(...a: Parameters<typeof restorePageVersionImpl>): Promise<Result<Awaited<ReturnType<typeof restorePageVersionImpl>>>> { return run(() => restorePageVersionImpl(...a)); }
export async function getGlobal(...a: Parameters<typeof getGlobalImpl>): Promise<Result<Awaited<ReturnType<typeof getGlobalImpl>>>> { return run(() => getGlobalImpl(...a)); }
export async function saveGlobal(...a: Parameters<typeof saveGlobalImpl>): Promise<Result<Awaited<ReturnType<typeof saveGlobalImpl>>>> { return run(() => saveGlobalImpl(...a)); }
export async function listMedia(...a: Parameters<typeof listMediaImpl>): Promise<Result<Awaited<ReturnType<typeof listMediaImpl>>>> { return run(() => listMediaImpl(...a)); }
export async function uploadMedia(...a: Parameters<typeof uploadMediaImpl>): Promise<Result<Awaited<ReturnType<typeof uploadMediaImpl>>>> { return run(() => uploadMediaImpl(...a)); }
export async function updateMedia(...a: Parameters<typeof updateMediaImpl>): Promise<Result<Awaited<ReturnType<typeof updateMediaImpl>>>> { return run(() => updateMediaImpl(...a)); }
export async function deleteMedia(...a: Parameters<typeof deleteMediaImpl>): Promise<Result<Awaited<ReturnType<typeof deleteMediaImpl>>>> { return run(() => deleteMediaImpl(...a)); }
export async function listProjects(...a: Parameters<typeof listProjectsImpl>): Promise<Result<Awaited<ReturnType<typeof listProjectsImpl>>>> { return run(() => listProjectsImpl(...a)); }
export async function getProject(...a: Parameters<typeof getProjectImpl>): Promise<Result<Awaited<ReturnType<typeof getProjectImpl>>>> { return run(() => getProjectImpl(...a)); }
export async function saveProject(...a: Parameters<typeof saveProjectImpl>): Promise<Result<Awaited<ReturnType<typeof saveProjectImpl>>>> { return run(() => saveProjectImpl(...a)); }
export async function deleteProject(...a: Parameters<typeof deleteProjectImpl>): Promise<Result<Awaited<ReturnType<typeof deleteProjectImpl>>>> { return run(() => deleteProjectImpl(...a)); }
export async function listPosts(...a: Parameters<typeof listPostsImpl>): Promise<Result<Awaited<ReturnType<typeof listPostsImpl>>>> { return run(() => listPostsImpl(...a)); }
export async function getPost(...a: Parameters<typeof getPostImpl>): Promise<Result<Awaited<ReturnType<typeof getPostImpl>>>> { return run(() => getPostImpl(...a)); }
export async function savePost(...a: Parameters<typeof savePostImpl>): Promise<Result<Awaited<ReturnType<typeof savePostImpl>>>> { return run(() => savePostImpl(...a)); }
export async function deletePost(...a: Parameters<typeof deletePostImpl>): Promise<Result<Awaited<ReturnType<typeof deletePostImpl>>>> { return run(() => deletePostImpl(...a)); }
export async function listServices(...a: Parameters<typeof listServicesImpl>): Promise<Result<Awaited<ReturnType<typeof listServicesImpl>>>> { return run(() => listServicesImpl(...a)); }
export async function getService(...a: Parameters<typeof getServiceImpl>): Promise<Result<Awaited<ReturnType<typeof getServiceImpl>>>> { return run(() => getServiceImpl(...a)); }
export async function saveService(...a: Parameters<typeof saveServiceImpl>): Promise<Result<Awaited<ReturnType<typeof saveServiceImpl>>>> { return run(() => saveServiceImpl(...a)); }
export async function deleteService(...a: Parameters<typeof deleteServiceImpl>): Promise<Result<Awaited<ReturnType<typeof deleteServiceImpl>>>> { return run(() => deleteServiceImpl(...a)); }
export async function listEnquiries(...a: Parameters<typeof listEnquiriesImpl>): Promise<Result<Awaited<ReturnType<typeof listEnquiriesImpl>>>> { return run(() => listEnquiriesImpl(...a)); }
export async function setEnquiryStatus(...a: Parameters<typeof setEnquiryStatusImpl>): Promise<Result<Awaited<ReturnType<typeof setEnquiryStatusImpl>>>> { return run(() => setEnquiryStatusImpl(...a)); }
export async function deleteEnquiry(...a: Parameters<typeof deleteEnquiryImpl>): Promise<Result<Awaited<ReturnType<typeof deleteEnquiryImpl>>>> { return run(() => deleteEnquiryImpl(...a)); }
