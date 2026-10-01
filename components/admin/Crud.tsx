'use client';

import type { DefaultCellComponentProps } from 'payload';
import { useAuth, useConfig, useDocumentDrawer } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { NewDoc } from './DocModal';

/**
 * Pop-up create/edit forms. Short records (enquiries, users, a new page's title, a new
 * project, a media upload) open in a drawer instead of a full page; saving or deleting
 * there refreshes whatever list or dashboard is underneath.
 */

type QuickCreateProps = {
  collection: string;
  label: string;
  className?: string;
  /** "open" goes straight to the full editor after creating (used for pages). */
  then?: 'refresh' | 'open';
  children?: ReactNode;
};

export function QuickCreate({ collection, label, className = 'cms-btn cms-btn-primary', then = 'refresh', children }: QuickCreateProps) {
  const router = useRouter();
  const { config } = useConfig();
  const { permissions } = useAuth();
  const [Drawer, , { openDrawer, closeDrawer }] = useDocumentDrawer({ collectionSlug: collection });
  // e.g. only admins may add editors: hide the button rather than offer a form that will be refused
  if (permissions && !permissions.collections?.[collection]?.create) return null;
  return (
    <>
      <button type="button" className={className} onClick={openDrawer}>{children ?? label}</button>
      <Drawer
        onSave={({ doc, operation }) => {
          closeDrawer();
          if (then === 'open' && operation === 'create' && doc?.id) router.push(`${config.routes.admin}/collections/${collection}/${doc.id}`);
          else router.refresh();
        }}
      />
    </>
  );
}

/** Opens an existing document in a drawer (view, edit or delete without leaving the page). */
export function OpenInModal({ collection, id, className, children, label }: { collection: string; id: number; className?: string; children: ReactNode; label?: string }) {
  const router = useRouter();
  const [Drawer, , { openDrawer, closeDrawer }] = useDocumentDrawer({ collectionSlug: collection, id });
  return (
    <>
      <button type="button" className={className} onClick={openDrawer} aria-label={label}>{children}</button>
      <Drawer
        onSave={() => router.refresh()}
        onDelete={() => { closeDrawer(); router.refresh(); }}
      />
    </>
  );
}

/** List-view title cell that opens the row in a drawer instead of navigating away. */
export function ModalCell({ cellData, rowData, collectionSlug }: DefaultCellComponentProps) {
  const id = (rowData as { id?: number })?.id;
  if (id == null || !collectionSlug) return <span>{String(cellData ?? '')}</span>;
  return (
    <OpenInModal collection={collectionSlug} id={id} className="cms-cell-link" label={`Open ${String(cellData ?? 'item')}`}>
      {String(cellData || 'Untitled')}
    </OpenInModal>
  );
}

/**
 * “Quick add” bar shown above a collection's list (admin.components.beforeListTable). It opens
 * the create form in the shared pop-up (DocModal), which stays open after the first save so a
 * new page or project can be finished there; the list underneath refreshes.
 */
export function ListQuickCreate({ collection, label, hint }: { collection: string; label: string; hint?: string; then?: 'refresh' | 'open' }) {
  const { permissions } = useAuth();
  if (permissions && !permissions.collections?.[collection]?.create) return null;
  return (
    <div className="cms-quickbar">
      {hint && <p>{hint}</p>}
      <NewDoc collection={collection} className="cms-btn cms-btn-primary">{label}</NewDoc>
    </div>
  );
}
