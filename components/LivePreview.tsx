'use client';

import { useRouter } from 'next/navigation';
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react';

/** Mounted only in draft mode: re-renders the page whenever the editor autosaves in the admin. */
export function LivePreview({ serverURL }: { serverURL: string }) {
  const router = useRouter();
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />;
}
