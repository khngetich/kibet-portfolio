import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * Admin panel graphics, styled like the public site (see app/(payload)/custom.css).
 * Both read the name from Site settings so the CMS always carries the site's identity.
 */

const siteName = async () => {
  try {
    const site = await (await getPayload({ config })).findGlobal({ slug: 'site', depth: 0 });
    return { name: site.name || 'Portfolio', studio: site.studio };
  } catch {
    return { name: 'Portfolio', studio: null };
  }
};

/** Login page: the name as a wordmark, with the studio underneath. No logo mark. */
export async function Logo() {
  const { name, studio } = await siteName();
  return (
    <div className="cms-logo">
      <b>{name}</b>
      <small>{studio ? `${studio} · ` : ''}Content studio</small>
    </div>
  );
}

/** Top-left of the dashboard: the first name as a small wordmark. */
export async function Icon() {
  const { name } = await siteName();
  return <span className="cms-wordmark"><span aria-hidden="true">{name.split(/\s+/)[0]}<i>.</i></span><span className="cms-sr">{name}</span></span>;
}
