import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { directUploads } from '@/payload.config';
import { pageSections } from '@/blocks/sections';
import { Projects } from '@/collections/Projects';
import { Header } from '@/globals/Header';
import { Footer } from '@/globals/Footer';
import { Theme } from '@/globals/Theme';
import { Site } from '@/globals/Site';
import { toSBlock, toSFields, toSGlobal } from '@/lib/studio-schema';
import { Studio } from '@/components/studio/Studio';

export const dynamic = 'force-dynamic';

/** /studio — the site editor. Signed-out visitors go to the CMS login and come back here. */
export default async function StudioPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect(`${payload.config.routes.admin}/login?redirect=${encodeURIComponent('/studio')}`);

  const [pages, site] = await Promise.all([
    payload.find({ collection: 'pages', user, overrideAccess: false, draft: true, depth: 0, limit: 200, sort: 'title', select: { title: true, slug: true, _status: true, updatedAt: true } }),
    payload.findGlobal({ slug: 'site', depth: 0 }),
  ]);

  const schema = {
    sections: pageSections.map(toSBlock),
    globals: [Header, Footer, Theme, Site].map(toSGlobal),
    project: toSFields(Projects.fields),
  };

  return (
    <Studio
      schema={JSON.parse(JSON.stringify(schema))}
      initialPages={JSON.parse(JSON.stringify(pages.docs))}
      siteName={site.name}
      user={{ name: (user as { name?: string }).name ?? '', email: user.email ?? '' }}
      adminRoute={payload.config.routes.admin}
      // Vercel refuses request bodies over ~4.5 MB; locally there's no such limit.
      upload={{ direct: directUploads, maxBytes: process.env.VERCEL ? 4 * 1024 * 1024 : null }}
    />
  );
}
