import type { Media } from '@/payload-types';

/** Narrows an upload field (id or populated doc) to a usable Media document. Safe to import from client components. */
export const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null);

/**
 * A small, optimised copy of an uploaded image for editor thumbnails (via the Next image
 * optimiser; `w` must be one of Next's image sizes). Other file types keep their own URL.
 */
export const thumbURL = (m: { url?: string | null; mimeType?: string | null } | null | undefined, w: 128 | 256 | 384 = 256) => {
  if (!m?.url) return null;
  if (!m.mimeType?.startsWith('image/') || m.mimeType === 'image/svg+xml' || m.mimeType === 'image/gif') return m.url;
  return `/_next/image?url=${encodeURIComponent(m.url)}&w=${w}&q=70`;
};
