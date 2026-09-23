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

export const revalidateCollection: CollectionAfterChangeHook = ({ doc, req }) => {
  purge(req.context);
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
