'use server';

import { getPayload } from 'payload';
import config from '@payload-config';

export type ContactState = { ok: boolean; error?: string } | null;

const field = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? '').trim().slice(0, max);

/** Saves a contact-form message as an Enquiry in the CMS. */
export async function sendEnquiry(_prev: ContactState, fd: FormData): Promise<ContactState> {
  // Bots fill every field, including this visually hidden one.
  if (field(fd, 'company', 200)) return { ok: true };

  const data = {
    name: field(fd, 'name', 120),
    email: field(fd, 'email', 200),
    service: field(fd, 'service', 120),
    budget: field(fd, 'budget', 60),
    message: field(fd, 'message', 5000),
  };
  if (!data.name || !data.message) return { ok: false, error: 'Please add your name and a short message.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, error: 'That email address doesn’t look right.' };

  try {
    const payload = await getPayload({ config });
    // Public visitors can't create enquiries through the API (access is closed);
    // this trusted server action is the only way in.
    await payload.create({ collection: 'inquiries', data: { ...data, status: 'new' }, overrideAccess: true });
    return { ok: true };
  } catch (err) {
    console.error('Enquiry failed', err);
    return { ok: false, error: 'Something went wrong. Please email me directly instead.' };
  }
}
