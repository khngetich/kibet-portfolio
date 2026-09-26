'use client';

import { useRowLabel } from '@payloadcms/ui';

/** Names a link row by its label and URL, e.g. “Work — /#work”, instead of “Menu 01”. */
export function LinkRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; url?: string; heading?: string }>();
  const title = data?.label || data?.heading;
  if (!title) return <span>Link {String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>;
  return <span>{title}{data?.url ? <span style={{ opacity: 0.55 }}> — {data.url}</span> : null}</span>;
}
