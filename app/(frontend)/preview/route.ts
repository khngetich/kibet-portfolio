import { draftMode, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';

/** Entered from the admin's live-preview pane. Only logged-in editors can turn on draft mode. */
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path') || '/';
  // Only allow same-site paths, never an absolute URL (open-redirect guard).
  const target = path.startsWith('/') && !path.startsWith('//') ? path : '/';

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return new Response('You must be logged in to preview drafts.', { status: 403 });

  (await draftMode()).enable();
  redirect(target);
}
