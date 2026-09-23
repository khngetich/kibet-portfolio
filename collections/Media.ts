import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** A tiny blurred preview shown while the full image loads (next/image `placeholder="blur"`). */
const addBlurPlaceholder: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file;
  if (!file?.data || !file.mimetype?.startsWith('image/') || file.mimetype === 'image/svg+xml') return data;
  try {
    const buf = await sharp(file.data).resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer();
    data.blurDataURL = `data:image/webp;base64,${buf.toString('base64')}`;
  } catch {
    // Unreadable image: skip the placeholder rather than failing the upload.
  }
  return data;
};

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Every image and video used on the site. Upload big (up to 2560px wide); the site resizes for each screen.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeChange: [addBlurPlaceholder],
    afterChange: [revalidateCollection],
    afterDelete: [revalidateOnDelete],
  },
  upload: {
    staticDir: path.resolve(dirname, '../media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'application/pdf'],
    focalPoint: true,
    crop: true,
    // Keep originals at a sensible size; next/image generates the per-screen versions.
    resizeOptions: { width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true },
    adminThumbnail: ({ doc }) => (doc.url as string) || null,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and search engines, e.g. "Matchday poster for Arsenal v Chelsea".' },
    },
    { name: 'caption', type: 'text' },
    { name: 'blurDataURL', type: 'text', admin: { hidden: true } },
  ],
};
