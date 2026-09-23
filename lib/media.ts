import type { Media } from '@/payload-types';

/** Narrows an upload field (id or populated doc) to a usable Media document. Safe to import from client components. */
export const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null);
