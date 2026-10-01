import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook, type CollectionConfig, type Where } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';
import { thumbURL } from '../lib/media'

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

/**
 * Deleting a file clears every field that points at it. Project covers and sample files are
 * required, so a file still used there can't be deleted (the project would stop saving).
 * Checks both the live projects and their latest drafts.
 */
const refuseIfRequired: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const where: Where = { or: [{ cover: { equals: id } }, { 'samples.file': { equals: id } }] };
  const find = (draft: boolean) => req.payload.find({ collection: 'projects', where, draft, depth: 0, limit: 5, pagination: false, select: { title: true }, req });
  const [live, drafts] = await Promise.all([find(false), find(true)]);
  const titles = [...new Set([...live.docs, ...drafts.docs].map((p) => p.title))];
  if (titles.length) {
    throw new APIError(`This file is the cover or a sample of ${titles.map((t) => `“${t}”`).join(', ')}. Replace it there first, then delete it.`, 400, undefined, true);
  }
};

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Every image and video used on the site. Upload big (up to 2560px wide); the site resizes for each screen.',
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'media', label: '+ Upload', hint: 'Drop an image, video or PDF into the pop-up and give it a description.' } }] },
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeChange: [addBlurPlaceholder],
    beforeDelete: [refuseIfRequired],
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
    // List and picker thumbnails: a 384px optimised copy instead of the original.
    adminThumbnail: ({ doc }) => thumbURL(doc as { url?: string; mimeType?: string }, 384),
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
