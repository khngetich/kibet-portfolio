'use client';

import { uploadMedia } from './api';
import type { MediaDoc } from './Data';

/**
 * How the Studio sends files. On Vercel a request body is capped at about 4.5 MB, so:
 *   direct  — the browser asks Payload for a signed URL, PUTs the file straight to Supabase,
 *             then creates the media document with a small JSON reference (the same three
 *             steps the admin's own upload field uses with `clientUploads`);
 *   maxBytes — when direct uploads are off, files over the host's limit are refused up front
 *             with a clear message instead of failing mid-request.
 */
export type UploadMode = { direct: boolean; maxBytes: number | null };

const mb = (b: number) => `${(b / 1048576).toFixed(1)} MB`;
const altFrom = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

async function failure(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { errors?: { message?: string }[] };
    return new Error(body.errors?.map((e) => e.message).filter(Boolean).join(' ') || fallback);
  } catch {
    return new Error(fallback);
  }
}

async function directUpload(file: File): Promise<MediaDoc> {
  const signed = await fetch('/api/storage-s3-generate-signed-url', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionSlug: 'media', filename: file.name, filesize: file.size, mimeType: file.type }),
  });
  if (!signed.ok) throw await failure(signed, 'Could not start the upload.');
  const { clientUploadContext, filename, headers, url } = (await signed.json()) as { clientUploadContext: { prefix?: string; signedReceipt: string }; filename?: string; headers: Record<string, string>; url: string };

  const put = await fetch(url, { method: 'PUT', headers, body: file });
  if (!put.ok) throw new Error(`The storage service refused the file (status ${put.status}).`);

  const form = new FormData();
  form.append('file', JSON.stringify({ clientUploadContext, collectionSlug: 'media', filename: filename || file.name, mimeType: file.type, size: file.size }));
  form.append('_payload', JSON.stringify({ alt: altFrom(file.name) }));
  const created = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form });
  if (!created.ok) throw await failure(created, 'The file uploaded but could not be added to the library.');
  const { doc } = (await created.json()) as { doc: MediaDoc };
  return doc;
}

export async function uploadFile(file: File, mode: UploadMode): Promise<MediaDoc> {
  if (mode.direct) return directUpload(file);
  if (mode.maxBytes && file.size > mode.maxBytes) {
    throw new Error(`${mb(file.size)} is over the ${mb(mode.maxBytes)} upload limit. Compress it, or turn on direct uploads (S3_CLIENT_UPLOADS).`);
  }
  const fd = new FormData();
  fd.append('file', file);
  return (await uploadMedia(fd)) as MediaDoc;
}
