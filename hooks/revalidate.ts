import { revalidatePath } from 'next/cache';
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload';

/**
 * The public site is statically generated. Any content change re-renders every page
 * on the next request, which is simple and cheap for a site this size.
 * Skipped during seeding and outside a Next.js request (e.g. CLI scripts).
 */
function purge(context: Record<string, unknown>) {
  if (context.disableRevalidate) return;
  try {
    revalidatePath('/', 'layout');
  } catch {
    // Not running inside Next.js (seed script, migrations) — nothing to revalidate.
  }
}

/**
 * Autosaved drafts never change what visitors see, so they don't purge the cache (the
 * Studio and the admin autosave every pause in typing). Publishing, unpublishing and
 * manual saves still purge.
 */
const isAutosave = (doc: { _status?: string | null }, req: { context: Record<string, unknown>; query?: Record<string, unknown> }) =>
  doc._status === 'draft' && (req.context.autosave === true || req.query?.autosave === 'true');

export const revalidateCollection: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!isAutosave(doc, req)) purge(req.context);
  return doc;
};

export const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  purge(req.context);
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  purge(req.context);
  return doc;
};
