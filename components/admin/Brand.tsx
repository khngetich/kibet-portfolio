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

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/** Login page: the name as a wordmark with a small red “CMS” tag. */
export async function Logo() {
  const { name, studio } = await siteName();
  return (
    <div className="cms-logo">
      <span className="cms-mark" aria-hidden="true">{initials(name)}</span>
      <span className="cms-logo-text">
        <b>{name}</b>
        <small>{studio ? `${studio} · ` : ''}Content studio</small>
      </span>
    </div>
  );
}

/** Top-left of the dashboard: the monogram on its own. */
export async function Icon() {
  const { name } = await siteName();
  return <span className="cms-mark cms-mark-sm" aria-label={name}>{initials(name)}</span>;
}
