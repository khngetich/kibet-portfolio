import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { directUploads } from '@/payload.config';
import { pageSections } from '@/blocks/sections';
import { Projects } from '@/collections/Projects';
import { Posts } from '@/collections/Posts';
import { Services } from '@/collections/Services';
import { Header } from '@/globals/Header';
import { Footer } from '@/globals/Footer';
import { Theme } from '@/globals/Theme';
import { Site } from '@/globals/Site';
import { toSBlock, toSFields, toSGlobal } from '@/lib/studio-schema';
import { Studio } from '@/components/studio/Studio';

export const dynamic = 'force-dynamic';

// Payload adds its own fields to collections once the config is built (_status for drafts,
// timestamps); the Studio's publish buttons set the status, so those never show as inputs.
const editable = (fields: ReturnType<typeof toSFields>) => fields.filter((f) => !f.name || !(f.name.startsWith('_') || f.name === 'createdAt' || f.name === 'updatedAt'));

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
    project: editable(toSFields(Projects.fields)),
    post: editable(toSFields(Posts.fields)),
    service: editable(toSFields(Services.fields)),
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
