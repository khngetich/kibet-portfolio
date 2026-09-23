/**
 * Writes the default homepage and site copy (lib/home-copy.ts) into any CMS field that is
 * still empty, so every piece of text on the site is visible and editable in the admin.
 *   npm run fill-copy
 * Safe to re-run: fields that already have content are never touched.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { COPY, DEFAULT_PROCESS, DEFAULT_ROLES, DEFAULT_STATS, SITE_COPY } from '../lib/home-copy';

const ctx = { disableRevalidate: true };
const empty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

async function run() {
  const payload = await getPayload({ config });

  const home = (await payload.findGlobal({ slug: 'home', depth: 0 })) as unknown as Record<string, unknown>;
  const defaults: Record<string, unknown> = { ...COPY, audienceRoles: DEFAULT_ROLES, process: DEFAULT_PROCESS, stats: DEFAULT_STATS };
  const homePatch = Object.fromEntries(Object.entries(defaults).filter(([k]) => empty(home[k])));
  if (Object.keys(homePatch).length) {
    await payload.updateGlobal({ slug: 'home', data: { ...homePatch, _status: 'published' } as never, context: ctx });
  }
  payload.logger.info(`Homepage: filled ${Object.keys(homePatch).join(', ') || 'nothing (all set)'}`);

  const site = (await payload.findGlobal({ slug: 'site', depth: 0 })) as unknown as Record<string, unknown>;
  const sitePatch = Object.fromEntries(Object.entries(SITE_COPY).filter(([k]) => empty(site[k])));
  if (Object.keys(sitePatch).length) await payload.updateGlobal({ slug: 'site', data: sitePatch as never, context: ctx });
  payload.logger.info(`Site settings: filled ${Object.keys(sitePatch).join(', ') || 'nothing (all set)'}`);
}

try {
  await run();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
