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

export function DocModalHost() {
  const [target, setTarget] = useState<(DocTarget & { n: number }) | null>(null);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => setTarget({ ...(e as CustomEvent<DocTarget>).detail, n: ++n });
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const gone = useCallback(() => setTarget(null), []);
  if (!target) return null;
  // a fresh key per request: reopening the same document starts a clean drawer
  return <Opened key={`${target.collection}:${target.id ?? 'new'}:${target.n}`} collection={target.collection} id={target.id} onGone={gone} />;
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
