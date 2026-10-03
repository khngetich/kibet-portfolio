import type { CollectionAfterChangeHook } from 'payload';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Emails you when a new enquiry arrives, so a lead never waits for you to open the dashboard.
 * Sent only when an email provider is set up (RESEND_API_KEY, see payload.config.ts), to
 * NOTIFY_EMAIL or else Site settings → Email. Replying to the email replies to the visitor.
 * A failed email never loses the enquiry: it is already saved, and the error is only logged.
 */
export const notifyInquiry: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || !process.env.RESEND_API_KEY) return doc;
  try {
    const site = await req.payload.findGlobal({ slug: 'site', depth: 0, req });
    const to = process.env.NOTIFY_EMAIL || site.email;
    if (!to) return doc;
    const admin = `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/inquiries/${doc.id}`;
    const rows: [string, string | null | undefined][] = [
      ['Name', doc.name], ['Email', doc.email], ['Service', doc.service], ['Budget', doc.budget], ['Timeline', doc.timeline], ['WhatsApp', doc.whatsapp],
    ];
    const lines = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    await req.payload.sendEmail({
      to,
      replyTo: doc.email,
      subject: `New enquiry from ${doc.name}${doc.service ? ` · ${doc.service}` : ''}`,
      text: `${lines.join('\n')}\n\n${doc.message}\n\nOpen it: ${admin}`,
      html: `<p>${lines.map((l) => esc(l)).join('<br>')}</p><p style="white-space:pre-wrap">${esc(doc.message ?? '')}</p><p><a href="${esc(admin)}">Open it in the CMS</a></p>`,
    });
  } catch (err) {
    req.payload.logger.error({ msg: 'New-enquiry email failed', err: err instanceof Error ? err.message : String(err) });
  }
  return doc;
};
