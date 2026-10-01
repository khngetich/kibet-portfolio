'use client';

import { useAuth, useDocumentDrawer } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * One pop-up editor for the whole CMS. Anything can call `openDoc({ collection, id })` (or
 * leave out `id` to create); the host, mounted once in the sidebar, opens Payload's document
 * drawer for it: the same form, validation, versions and publish button as the full page,
 * without leaving the screen underneath. Saving or deleting refreshes the server-rendered
 * data behind it (dashboard cards, sidebar counts).
 *
 * <DocLink> is the trigger to use in place of a link: a plain click opens the pop-up, while
 * ⌘/Ctrl/Shift-click and middle-click still open the full editor in a new tab.
 *
 * Every other record link in the CMS gets the same treatment: the host listens for clicks on
 * links to one record (`/admin/collections/{slug}/{id}`) or to a create screen (`…/create`):
 * list rows, the media grid, Payload's own "Create new" buttons, breadcrumbs. They all open
 * the pop-up instead of navigating. Site-wide settings (globals) have no Payload drawer, so
 * `/admin/globals/{slug}` opens its own editor in a centred window (an embedded admin page with
 * the CMS frame hidden; see the `cms-embed` rules in custom.css).
 */

export type DocTarget = { collection: string; id?: number | null };

const EVENT = 'cms:doc';
export const openDoc = (target: DocTarget) => window.dispatchEvent(new CustomEvent<DocTarget>(EVENT, { detail: target }));

function Opened({ collection, id, onGone }: DocTarget & { onGone: () => void }) {
  const router = useRouter();
  const [Drawer, , { openDrawer, closeDrawer, isDrawerOpen }] = useDocumentDrawer({ collectionSlug: collection, id: id ?? undefined });
  const shown = useRef(false);

  useEffect(() => { openDrawer(); }, [openDrawer]);
  // unmount once the drawer has been open and is closed again (Esc, ×, backdrop)
  useEffect(() => {
    if (isDrawerOpen) shown.current = true;
    else if (shown.current) onGone();
  }, [isDrawerOpen, onGone]);

  return (
    <Drawer
      onSave={() => router.refresh()}
      onDelete={() => { closeDrawer(); router.refresh(); }}
    />
  );
}

/** Site-wide settings in a centred window: the global's own editor, embedded without the CMS frame. */
function GlobalWindow({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  // the embedded page posts this once it has hidden the CMS frame (NavMenuClient)
  useEffect(() => {
    const on = (e: MessageEvent) => { if (e.origin === location.origin && e.data === 'cms:embed-ready') setLoaded(true); };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
  return (
    <dialog ref={dialog} className="cms-window" aria-label={label} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="cms-window-box">
        <div className="cms-window-bar">
          <b>{label}</b>
          <a className="cms-window-full" href={src} target="_blank" rel="noopener noreferrer">Open full page ↗</a>
          <button type="button" className="cms-window-close" onClick={() => dialog.current?.close()} aria-label={`Close ${label}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg>
          </button>
        </div>
        {!loaded && <div className="cms-window-loading" aria-hidden="true"><span /></div>}
        <iframe className={loaded ? 'is-ready' : undefined} title={label} src={src} />
      </div>
    </dialog>
  );
}

/** The path's segments after the admin route, e.g. "/admin/collections/pages/12" → ["collections", "pages", "12"]. */
const segments = (path: string, admin: string) => (path.startsWith(`${admin}/`) ? path.slice(admin.length + 1).replace(/\/$/, '').split('/') : []);

/** A link to one record or a create screen → what to open; anything else (lists, versions, API) → null. */
function recordOf(path: string, admin: string): DocTarget | null {
  const [kind, slug, id, ...rest] = segments(path, admin);
  if (kind !== 'collections' || !slug || !id || rest.length) return null;
  if (id === 'create') return { collection: slug, id: null };
  return /^\d+$/.test(id) ? { collection: slug, id: Number(id) } : null;
}

export function DocModalHost({ admin = '/admin' }: { admin?: string }) {
  const router = useRouter();
  const [target, setTarget] = useState<(DocTarget & { n: number }) | null>(null);
  const [global, setGlobal] = useState<{ src: string; label: string } | null>(null);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => setTarget({ ...(e as CustomEvent<DocTarget>).detail, n: ++n });
    // record and settings links anywhere in the CMS open as pop-ups
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.closest('[data-no-popup]')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      const record = recordOf(url.pathname, admin);
      if (record) {
        // already on that record's own page: let the link do what it does
        if (url.pathname === location.pathname) return;
        e.preventDefault();
        e.stopPropagation();
        setTarget({ ...record, n: ++n });
        return;
      }
      const [kind, slug, ...more] = segments(url.pathname, admin);
      if (kind === 'globals' && slug && !more.length && !document.documentElement.classList.contains('cms-embed') && url.pathname !== location.pathname) {
        e.preventDefault();
        e.stopPropagation();
        setGlobal({ src: url.pathname, label: (a.querySelector('b, .cms-nav-label')?.textContent || a.textContent || slug).trim() });
      }
    };
    window.addEventListener(EVENT, on);
    window.addEventListener('click', onClick, true);
    return () => { window.removeEventListener(EVENT, on); window.removeEventListener('click', onClick, true); };
  }, [admin]);
  const gone = useCallback(() => setTarget(null), []);
  return (
    <>
      {/* a fresh key per request: reopening the same document starts a clean drawer */}
      {target && <Opened key={`${target.collection}:${target.id ?? 'new'}:${target.n}`} collection={target.collection} id={target.id} onGone={gone} />}
      {global && <GlobalWindow src={global.src} label={global.label} onClose={() => { setGlobal(null); router.refresh(); }} />}
    </>
  );
}

type DocLinkProps = DocTarget & { href: string; className?: string; children: ReactNode; label?: string; title?: string };

export function DocLink({ collection, id, href, className, children, label, title }: DocLinkProps) {
  return (
    <a
      href={href}
      className={className}
      aria-label={label}
      title={title}
      aria-haspopup="dialog"
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openDoc({ collection, id });
      }}
    >
      {children}
    </a>
  );
}

/** "New …" button: opens the create form as a pop-up and keeps it open after the first save, so you carry straight on editing. Hidden if you can't create. */
export function NewDoc({ collection, className, children }: { collection: string; className?: string; children: ReactNode }) {
  const { permissions } = useAuth();
  if (permissions && !permissions.collections?.[collection]?.create) return null;
  return <button type="button" className={className} aria-haspopup="dialog" onClick={() => openDoc({ collection })}>{children}</button>;
}
