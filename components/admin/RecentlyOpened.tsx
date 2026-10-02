'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';
import { openDoc } from './DocModal';
import { sectionIcon } from './sectionIcons';

/**
 * "Recent" at the foot of the sidebar: the last five documents and settings you opened, in this
 * browser. Both a full-page edit (/admin/collections/<slug>/<id>, /admin/globals/<slug>) and a
 * pop-up (the `cms:doc` event from DocModal) count. Titles are looked up once and kept with the
 * entry. A per-browser convenience, so it lives in localStorage and simply starts empty without it.
 */

type Entry = { key: string; collection?: string; global?: string; id?: number; label: string; href: string };
const STORE = 'cms-recent';
const MAX = 5;

const CHANGED = 'cms-recent-change';
const raw = () => { try { return localStorage.getItem(STORE) || '[]'; } catch { return '[]'; } };
const read = (): Entry[] => { try { return JSON.parse(raw()); } catch { return []; } };
const write = (list: Entry[]) => { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch { /* private mode */ } window.dispatchEvent(new Event(CHANGED)); };
// the stored string is the snapshot (stable between changes); other tabs report through `storage`
const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGED, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(CHANGED, cb); window.removeEventListener('storage', cb); };
};

async function titleOf(collection: string, id: number) {
  try {
    const res = await fetch(`/api/${collection}/${id}?depth=0&draft=true`, { credentials: 'include' });
    if (!res.ok) return null;
    const d = await res.json();
    return (d.title || d.name || d.filename || d.alt || null) as string | null;
  } catch { return null; }
}

export function RecentlyOpened({ admin, globals }: { admin: string; globals: Record<string, string> }) {
  const pathname = usePathname();
  const stored = useSyncExternalStore(subscribe, raw, () => '[]');
  const list = useMemo<Entry[]>(() => { try { return JSON.parse(stored); } catch { return []; } }, [stored]);

  useEffect(() => {
    const remember = async (e: Omit<Entry, 'label'> & { label?: string | null }) => {
      const label = e.label ?? (e.collection && e.id != null ? await titleOf(e.collection, e.id) : null);
      if (!label) return;
      const next = [{ ...e, label }, ...read().filter((x) => x.key !== e.key)].slice(0, MAX);
      write(next);
    };
    const doc = pathname.match(new RegExp(`^${admin}/collections/([^/]+)/(\\d+)$`));
    const glob = pathname.match(new RegExp(`^${admin}/globals/([^/]+)$`));
    if (doc) remember({ key: `${doc[1]}:${doc[2]}`, collection: doc[1], id: Number(doc[2]), href: pathname });
    else if (glob) remember({ key: `global:${glob[1]}`, global: glob[1], href: pathname, label: globals[glob[1]] ?? glob[1] });

    // pop-ups opened anywhere (see DocModal's openDoc); a create has no id yet, so it isn't kept
    const onDoc = (ev: Event) => {
      const t = (ev as CustomEvent<{ collection: string; id?: number | null }>).detail;
      if (t?.id != null) remember({ key: `${t.collection}:${t.id}`, collection: t.collection, id: t.id, href: `${admin}/collections/${t.collection}/${t.id}` });
    };
    window.addEventListener('cms:doc', onDoc);
    return () => window.removeEventListener('cms:doc', onDoc);
  }, [pathname, admin, globals]);

  if (!list.length) return null;
  return (
    <div className="cms-nav-group cms-nav-recent">
      <p>Recent</p>
      <ul>
        {list.map((e) => {
          const icon = <Icon name={sectionIcon(e.collection ?? e.global ?? '')} size={16} />;
          return (
            <li key={e.key}>
              {e.collection && e.id != null ? (
                // reopen in the pop-up (⌘/Ctrl-click still opens the full editor)
                <a className="cms-nav-link cms-nav-recent-link" href={e.href} onClick={(ev) => { if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return; ev.preventDefault(); openDoc({ collection: e.collection!, id: e.id }); }}>
                  {icon}<span className="cms-nav-label">{e.label}</span>
                </a>
              ) : (
                <Link className="cms-nav-link cms-nav-recent-link" href={e.href}>{icon}<span className="cms-nav-label">{e.label}</span></Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
