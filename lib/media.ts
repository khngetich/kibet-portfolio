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

/** A YouTube or Vimeo page link → its privacy-friendly embed URL; anything else → null. */
export function embedURL(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** An item in the case-study sample viewer (components/motion/SampleViewer.tsx). */
export type ViewItem = { kind: 'image' | 'pdf' | 'video' | 'embed'; url: string; title?: string | null; note?: string | null; media?: Media | null };
const kindOf = (m: Media): ViewItem['kind'] => (m.mimeType === 'application/pdf' ? 'pdf' : m.mimeType?.startsWith('video/') ? 'video' : 'image');
/** A project's samples as viewer items (entries without a usable file are left out). */
export const toItems = (samples: { file: unknown; title?: string | null; note?: string | null }[]): ViewItem[] =>
  samples.flatMap((s) => {
    const m = asMedia(s.file);
    return m?.url ? [{ kind: kindOf(m), url: m.url, title: s.title || m.alt, note: s.note ?? null, media: m }] : [];
  });
