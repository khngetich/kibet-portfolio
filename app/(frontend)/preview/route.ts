import { cookies, draftMode, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';

const STUDIO_COOKIE = 'studio-canvas';

/**
 * Entered from the admin's live-preview pane or the Studio canvas (`?studio=1`). Only
 * logged-in editors can turn on draft mode. The Studio flag makes pages keep hidden
 * sections (dimmed) and mark each section so it can be clicked to select it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';
  // Only same-site paths (open-redirect guard): resolve against this origin and refuse anything
  // that lands elsewhere, which also catches "//evil.com" and "/\\evil.com".
  const resolved = /^\/(?![/\\])/.test(path) ? new URL(path, url.origin) : null;
  const target = resolved && resolved.origin === url.origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : '/';

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return new Response('You must be logged in to preview drafts.', { status: 403 });

  (await draftMode()).enable();
  const jar = await cookies();
  if (url.searchParams.get('studio') === '1') jar.set(STUDIO_COOKIE, '1', { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  else jar.delete(STUDIO_COOKIE);
  redirect(target);
}
