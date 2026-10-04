/**
 * Copy edits from the October 2026 page-by-page review (docs/content-review-2026-10.md has every
 * edit with its original text). Applied through Payload, so each change also gets a version in
 * History you can restore. Shows what it would change; nothing is written unless APPLY=1 is set:
 *
 *   npm run review-content           (preview)
 *   APPLY=1 npm run review-content   (write)
 *
 * Each edit only happens while the text still matches what the review read (ignoring *accent*
 * marks, apostrophe style and spacing), so later edits are never overwritten and running it again
 * is safe. A page, project or service with unpublished changes gets these edits as a draft on top
 * of them (publish it in the CMS); everything else is published straight away.
 * Nothing here touches prices, legal pages, the copyright line or figures (years, counts, stats).
 */
import { getPayload } from 'payload';
import config from '@payload-config';

const apply = process.env.APPLY === '1';
const payload = await getPayload({ config });
const log = (msg: string) => console.log(`${apply ? '✓' : '·'} ${msg}`);
const norm = (v: unknown) => (typeof v === 'string' ? v.replace(/\*/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : v);
type Doc = Record<string, unknown>;

/** Replaces obj[key] when it still reads `from`; returns whether it changed. */
function swap(obj: Doc | undefined, key: string, from: string, to: string | null, what: string) {
  if (!obj || norm(obj[key]) !== norm(from)) return false;
  obj[key] = to;
  log(`${what}: "${from}" → ${to === null ? '(removed)' : `"${to}"`}`);
  return true;
}

/** Lexical rich text: replaces (or removes, with `to` null) the paragraph that reads `from`. */
function swapParagraph(rich: unknown, from: string, to: string | null, what: string) {
  const root = (rich as { root?: { children?: Doc[] } } | null)?.root;
  if (!root?.children) return false;
  const textOf = (n: Doc): string => (Array.isArray(n.children) ? (n.children as Doc[]).map(textOf).join('') : typeof n.text === 'string' ? n.text : '');
  const at = root.children.findIndex((n) => n.type === 'paragraph' && norm(textOf(n)) === norm(from));
  if (at < 0) return false;
  if (to === null) root.children.splice(at, 1);
  else root.children[at] = { ...root.children[at], children: [{ type: 'text', text: to, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }] };
  log(`${what}: "${from}" → ${to === null ? '(removed)' : `"${to}"`}`);
  return true;
}

/** Edits the latest version of a document, then publishes it, or saves a draft when it already has unpublished changes. */
async function edit(collection: 'pages' | 'projects' | 'services', slug: string, change: (doc: Doc) => boolean) {
  const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true });
  if (!docs[0]) return console.log(`– ${collection}/${slug}: not found, skipped`);
  const doc = structuredClone(docs[0]) as unknown as Doc;
  if (!change(doc)) return;
  const pending = doc._status === 'draft';
  if (pending) console.log(`  (${collection}/${slug} has unpublished changes: saved as a draft for you to publish)`);
  if (!apply) return;
  const { id, createdAt, updatedAt, _status, ...data } = doc;
  void createdAt; void updatedAt; void _status;
  await payload.update({ collection, id: id as number, data: { ...data, _status: pending ? 'draft' : 'published' }, draft: pending, depth: 0 });
}

const sectionsOf = (doc: Doc) => (doc.sections ?? []) as Doc[];
const block = (doc: Doc, type: string) => sectionsOf(doc).find((s) => s.blockType === type);

// ── Homepage ──────────────────────────────────────────────────────────────────────────────────
await edit('pages', 'home', (doc) => {
  let changed = false;
  changed = swap(doc.meta as Doc, 'title', 'Humphrey Portfolio', 'Humphrey Kibet — Graphic & Brand Designer in Kenya', 'Home search title (said “Portfolio”, not the name or the work)') || changed;
  changed = swap(block(doc, 'workShowcase'), 'intro',
    'Campaigns, brand identities and websites for sports platforms and growing businesses. Start with the featured case study, then browse the rest: each one opens the brief, what I did and what changed.',
    'Campaigns, brand identities and websites for sports platforms and growing businesses. Each case study covers the brief, what I did and what changed.',
    'Home work intro (instructions on how to browse)') || changed;
  changed = swap(block(doc, 'process'), 'heading', 'Our 4-Step Project Process', 'How a project runs, in *four steps*', 'Home process heading (title case, “Our” on a one-person site)') || changed;
  const about = block(doc, 'aboutBanner');
  const overview = ((about?.tabs ?? []) as Doc[]).find((t) => norm(t.label) === 'Overview');
  changed = swap(overview, 'text',
    'I’m Humphrey, a graphic and brand designer in Kenya. I design conversion-driven social content and brand identities that stay consistent everywhere they appear, from matchday posters to complete visual systems.',
    'I design social content that converts and brand identities that stay consistent everywhere they appear, from matchday posters to complete visual systems.',
    'Home About → Overview (repeated the hero’s introduction)') || changed;
  changed = swap(block(doc, 'services'), 'intro',
    'Four ways to work together, from a single campaign to a monthly design partner. Open a card to see what’s included.',
    'Four ways to work together, from a single campaign to a monthly design partner.',
    'Home services intro (the cards carry their own “Pick a card” hint; on /services they’re already open)') || changed;
  for (const s of sectionsOf(doc)) {
    if (s.blockType === 'ctaBanner' && !s.hidden) { s.hidden = true; changed = true; log('Home: hide a call-to-action band (the footer card closes every page)'); }
  }
  return changed;
});

// ── About ─────────────────────────────────────────────────────────────────────────────────────
await edit('pages', 'about', (doc) => {
  let changed = false;
  if (!(doc.meta as Doc | undefined)?.description) { doc.meta = { ...(doc.meta as Doc), description: 'Humphrey Kibet, graphic and brand designer in Kenya: my approach, experience, skills and tools.' }; changed = true; log('About search description: (site-wide default) → own description'); }
  const profile = block(doc, 'profile');
  changed = swap(profile, 'heading', 'I don’t just create designs; I craft experiences.', 'Design that tells *the story.*', 'About headline (the same line is the homepage headline)') || changed;
  if (profile) {
    changed = swapParagraph(profile.body,
      'My approach revolves around storytelling and evoking emotional responses. Every project is executed with a pursuit of perfection, so each design communicates its intended message clearly.',
      'My approach revolves around storytelling and the feeling a design should leave. I sweat the details so every piece says exactly what it should.',
      'About paragraph 2 (wordy)') || changed;
    changed = swapParagraph(profile.body,
      'I’m continuously refining my process and efficiency, and I’m dedicated to providing top-notch service to every client I work with.',
      null, 'About paragraph 3 (general promise with no information)') || changed;
  }
  for (const s of sectionsOf(doc)) {
    if (s.blockType === 'ctaBanner' && !s.hidden) { s.hidden = true; changed = true; log('About: hide a call-to-action band (the footer card closes every page)'); }
  }
  return changed;
});

// ── Work ──────────────────────────────────────────────────────────────────────────────────────
await edit('pages', 'work', (doc) => {
  let changed = false;
  if (!(doc.meta as Doc | undefined)?.description) {
    doc.meta = { ...(doc.meta as Doc), description: 'Case studies by Humphrey Kibet: brand identities, social media campaigns and print, each with the brief, the process and what shipped.' };
    changed = true; log('Work search description: (site-wide default) → own description');
  }
  for (const s of sectionsOf(doc)) {
    if (s.blockType === 'ctaBanner' && !s.hidden) { s.hidden = true; changed = true; log('Work: hide a call-to-action band (the footer card closes every page)'); }
  }
  return changed;
});

// ── Résumé ────────────────────────────────────────────────────────────────────────────────────
await edit('pages', 'resume', (doc) => {
  const cv = block(doc, 'resume');
  if (!cv) return false;
  let changed = false;
  changed = swap(cv, 'eyebrow', 'Résumé / Five years, seven teams', 'Résumé', 'Résumé label (the Experience heading says “Five years. Seven teams.”)') || changed;
  changed = swap(cv.card as Doc, 'kicker', 'Based in Nairobi · Open to global teams', 'Availability', 'Résumé card label (repeated the card’s heading “Nairobi-based. Open to the world.”)') || changed;
  if (typeof cv.profile === 'string') {
    const dup = 'I translate brand vision into cohesive campaigns across digital and print.';
    const next = cv.profile.replace(/\s*I translate brand vision into cohesive campaigns across digital and print\./, '');
    if (next !== cv.profile) { cv.profile = next; changed = true; log(`Résumé profile: removed "${dup}" (the same line opens the page)`); }
  }
  if (norm(cv.closingHeading) === norm('Building a brand? Let’s talk.')) {
    log(`Résumé closing card hidden: "${cv.closingKicker ?? ''}" / "${cv.closingHeading}" / "${cv.closingText ?? ''}" (the footer card follows it; the page keeps “Discuss an opportunity” and “Discuss a role”)`);
    cv.closingHeading = null; changed = true;
  }
  return changed;
});

// ── Projects ──────────────────────────────────────────────────────────────────────────────────
await edit('projects', 'turkey-golf-tour', (doc) => {
  let changed = false;
  changed = swap(doc, 'title', 'Turkey Golf TOur', 'Turkey Golf Tour', 'Turkey Golf Tour title (typo)') || changed;
  changed = swap(doc, 'timeline', '4days', '4 days', 'Turkey Golf Tour timeline (spacing)') || changed;
  if (typeof doc.approach === 'string' && /via Mtickets$/.test(doc.approach.trim())) {
    doc.approach = `${doc.approach.trim()}.`; changed = true; log('Turkey Golf Tour approach: added the missing full stop');
  }
  return changed;
});

// ── Services ──────────────────────────────────────────────────────────────────────────────────
await edit('services', 'graphic-design-and-social-assets', (doc) => {
  let changed = false;
  changed = swap(doc, 'description',
    'Crafting high-impact visuals that engage, align with your brand, and convert views into action.',
    'On-brand visuals that get noticed and turn views into action.',
    'Graphic Design service summary (buzzwords)') || changed;
  changed = swap(doc, 'intro',
    'High-impact graphic design and digital media assets built to elevate your brand presence and convert views into engagement. From high-converting social media collateral and campaign visuals to marketing materials and print assets, this service provides tailored, consistent visual design that aligns with your strategic goals.',
    'Social media collateral, campaign visuals, marketing materials and print assets, designed to match your brand and turn views into engagement.',
    'Graphic Design “About this service” (wordy)') || changed;
  return changed;
});

// ── Footer ────────────────────────────────────────────────────────────────────────────────────
const footer = (await payload.findGlobal({ slug: 'footer', depth: 0 })) as unknown as Doc;
const site = await payload.findGlobal({ slug: 'site', depth: 0 });
const footerData: Doc = {};
const cta = { ...((footer.cta ?? {}) as Doc) };
if (swap(cta, 'heading', 'Ready to elevate your visual identity?', 'Got a launch, campaign or *rebrand* coming up?', 'Footer card heading (generic)')) footerData.cta = cta;
if (swap(cta, 'text', 'Let’s partner to create high-impact graphics and social media campaigns that drive growth.', 'Send a short brief: what it is, who it’s for and when you need it.', 'Footer card text (generic)')) footerData.cta = cta;
const credit = (footer.credit ?? {}) as Doc;
if (!credit.label && /Kaptured Creatives/.test(String(footer.copyright ?? ''))) {
  const instagram = (site.socials ?? []).find((s) => /instagram\.com\/kapturedcreatives/i.test(s.url ?? ''))?.url ?? null;
  footerData.credit = { label: 'Kaptured Creatives', url: instagram };
  log(`Footer: “Kaptured Creatives” in the copyright line becomes a link${instagram ? ` to ${instagram}` : ' (add its address in Website → Footer → Site credit)'}`);
}
if (apply && Object.keys(footerData).length) await payload.updateGlobal({ slug: 'footer', data: footerData });

console.log(apply ? '\nDone. Anything saved as a draft is waiting in the CMS for you to publish.' : '\nPreview only. Run with APPLY=1 to make these changes.');
process.exit(0);
