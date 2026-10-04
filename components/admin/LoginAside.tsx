import { getPayload } from 'payload';
import config from '@payload-config';
import type { Media } from '@/payload-types';
import { ThemeSwitch } from './ThemeSwitch';

/**
 * The login screen's showcase (admin.components.beforeLogin), styled in app/(payload)/custom.css:
 * on wide screens a panel down the left with the site's name, a glass folder with the three
 * newest published covers peeking out (as on the site's selected work), and a welcome line; the
 * form sits on the right. It follows the admin's light/dark theme, with the switch in the
 * corner. Only public things are shown here: the name and published covers.
 */
export async function LoginAside() {
  const { name, covers, count } = await showcase();
  const first = name.split(/\s+/)[0];
  return (
    <>
      <div className="cms-login-theme"><ThemeSwitch /></div>
      <aside className="cms-login-aside">
        <div className="cms-login-top">
          <span className="cms-wordmark">{first}<i>.</i></span>
          <a className="cms-login-back" href="/">Back to the site <span aria-hidden="true">↗</span></a>
        </div>
        <div className="cms-login-folder" aria-hidden="true">
          <span className="cms-login-folder-back" />
          <span className="cms-login-sheets">
            {covers.map((c, i) => <span key={c.id} className={`cms-login-sheet is-${i}`}><img src={c.url ?? ''} alt="" /></span>)}
          </span>
          <span className="cms-login-folder-front">
            <small>Content studio</small>
            <b>{count ? `${count} project${count === 1 ? '' : 's'} live` : 'Your work, in one place'}</b>
          </span>
        </div>
        <div className="cms-login-hello">
          <p className="cms-login-eyebrow">{name}</p>
          <h1>Welcome <span className="cms-accent">back</span>.</h1>
          <p>Sign in to edit the site: pages, projects, services and the enquiries that come in.</p>
        </div>
      </aside>
    </>
  );
}

async function showcase() {
  try {
    const payload = await getPayload({ config });
    const [site, projects] = await Promise.all([
      payload.findGlobal({ slug: 'site', depth: 0 }),
      payload.find({ collection: 'projects', where: { _status: { equals: 'published' } }, sort: ['-featured', '-updatedAt'], limit: 3, depth: 1 }),
    ]);
    const covers = projects.docs.map((p) => p.cover).filter((m): m is Media => typeof m === 'object' && !!m?.url);
    return { name: site.name || 'Portfolio', covers, count: projects.totalDocs };
  } catch {
    return { name: 'Portfolio', covers: [] as Media[], count: 0 };
  }
}
