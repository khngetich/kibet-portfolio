'use server';

import { headers } from 'next/headers';
import { getPayload, ValidationError } from 'payload';
import config from '@payload-config';

type Values = { name: string; email: string; service: string; budget: string; timeline: string; message: string; whatsapp: string; logoWording: string; brandStage: string; keep: string };
/** `field` names the input to fix; `values` refill the form, which React resets after every submit. */
export type ContactState = { ok: boolean; error?: string; field?: 'name' | 'email' | 'message'; values?: Values } | null;

const field = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? '').trim().slice(0, max);

/**
 * Flood limits, on top of the honeypot and (once its keys are set) Cloudflare Turnstile.
 * Per address: kept in this server instance's memory, so best-effort on serverless. Per email:
 * counted in the database, so it holds everywhere. The whole-inbox cap only applies while
 * Turnstile is off: with it on, bots can't fill the inbox, and the cap would only block real leads.
 */
const MIN = 60_000;
const LIMITS = { perIp: { max: 5, window: 10 * MIN }, perEmail: { max: 3, window: 60 * MIN }, inbox: { max: 30, window: 60 * MIN } };
const recent = new Map<string, number[]>();

function ipAllowed(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < LIMITS.perIp.window);
  if (hits.length >= LIMITS.perIp.max) return false;
  recent.set(ip, [...hits, now]);
  if (recent.size > 5000) recent.delete(recent.keys().next().value!);
  return true;
}

/** Cloudflare Turnstile: true when it is off (no secret set) or the visitor passed the check. */
async function humanCheck(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

/** Saves a contact-form message as an Enquiry in the CMS. */
export async function sendEnquiry(_prev: ContactState, fd: FormData): Promise<ContactState> {
  // Bots fill every field, including this visually hidden one.
  if (field(fd, 'company', 200)) return { ok: true };

  const data = {
    name: field(fd, 'name', 120),
    email: field(fd, 'email', 200).toLowerCase(),
    service: field(fd, 'service', 120),
    budget: field(fd, 'budget', 60),
    timeline: field(fd, 'timeline', 60),
    whatsapp: field(fd, 'whatsapp', 40),
    logoWording: field(fd, 'logoWording', 160),
    brandStage: field(fd, 'brandStage', 20),
    keep: field(fd, 'keep', 2000),
    message: field(fd, 'message', 5000),
  };
  if (!data.name) return { ok: false, field: 'name', error: 'Please add your name.', values: data };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, field: 'email', error: 'That email address doesn’t look right.', values: data };
  if (!data.message) return { ok: false, field: 'message', error: 'Please add a short message about the project.', values: data };

  const busy = { ok: false, error: 'You’ve sent a few messages already. I’ll reply soon; if it’s urgent, please email me directly.', values: data };
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim();
  if (ip && !ipAllowed(ip)) return busy;
  if (!(await humanCheck(String(fd.get('cf-turnstile-response') ?? ''), ip))) {
    return { ok: false, error: 'Please complete the quick check above the button, then send again.', values: data };
  }

  try {
    const payload = await getPayload({ config });
    const since = (ms: number) => new Date(Date.now() - ms).toISOString();
    const [fromEmail, inbox] = await Promise.all([
      payload.count({ collection: 'inquiries', where: { and: [{ email: { equals: data.email } }, { createdAt: { greater_than: since(LIMITS.perEmail.window) } }] } }),
      payload.count({ collection: 'inquiries', where: { createdAt: { greater_than: since(LIMITS.inbox.window) } } }),
    ]);
    if (fromEmail.totalDocs >= LIMITS.perEmail.max) return busy;
    if (!process.env.TURNSTILE_SECRET_KEY && inbox.totalDocs >= LIMITS.inbox.max) return { ok: false, error: 'The form is busy right now. Please email me directly instead.', values: data };
    // Public visitors can't create enquiries through the API (access is closed);
    // this trusted server action is the only way in.
    // brandStage is a fixed list in the CMS: anything else (or nothing) is left empty
    const brandStage = (['new', 'rebrand', 'refresh'] as const).find((x) => x === data.brandStage);
    await payload.create({ collection: 'inquiries', data: { ...data, brandStage, status: 'new' }, overrideAccess: true });
    return { ok: true };
  } catch (err) {
    // the CMS's own email check is stricter than the one above: point at the field instead of failing
    if (err instanceof ValidationError && err.data.errors.some((e) => e.path === 'email')) {
      return { ok: false, field: 'email', error: 'That email address doesn’t look right.', values: data };
    }
    // log what failed, never what the visitor wrote
    console.error('Enquiry failed:', err instanceof Error ? `${err.name}: ${err.message}` : 'unknown error');
    return { ok: false, error: 'Something went wrong. Please email me directly instead.', values: data };
  }
}
