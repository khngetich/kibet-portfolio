/**
 * Content fixes from the October 2026 site review and design critique, applied through Payload
 * (so every change has a version in History). Shows what it would change; nothing is written
 * unless you pass --apply:
 *
 *   npm run fix-content              (preview)
 *   npm run fix-content -- --apply   (write)
 *
 * The homepage edits are saved as a DRAFT on top of the latest draft (the About wording fix is
 * already waiting there), so you review and publish them together. Everything else is a small,
 * self-contained setting and is saved directly. Each change is skipped when the content no
 * longer matches what this script expects, so it never overwrites later edits.
 */
import { getPayload } from 'payload';
import config from '@payload-config';

const apply = process.argv.includes('--apply');
const payload = await getPayload({ config });
const log = (msg: string) => console.log(`${apply ? '✓' : '·'} ${msg}`);

// 1. Image descriptions that are file names
const ALT: Record<string, string> = {
  'triad-logo-on-blue': 'Triad Brands logo on a navy blue background',
  'triad-logo-on-yellow': 'Triad Brands logo on a yellow background',
  'triad-logo-on-red': 'Triad Brands logo on a red background',
  'triad-logo-on-white': 'Triad Brands logo on a white background',
  'ngepe-logo-on-neon': 'Ngepe Tickets logo on a neon background',
  'ngepe-logo-on-black': 'Ngepe Tickets logo on a black background',
  'ngepe-logo-on-white': 'Ngepe Tickets logo on a white background',
};
const { docs: media } = await payload.find({ collection: 'media', where: { alt: { in: Object.keys(ALT) } }, limit: 50, depth: 0 });
for (const m of media) {
  log(`Media #${m.id}: alt "${m.alt}" → "${ALT[m.alt]}"`);
  if (apply) await payload.update({ collection: 'media', id: m.id, data: { alt: ALT[m.alt] }, depth: 0 });
}

// 2. A project whose search title was left as its slug
const { docs: projects } = await payload.find({ collection: 'projects', where: { slug: { equals: 'triad-brands' } }, limit: 1, depth: 0, draft: true });
const triad = projects[0];
if (triad?.metaTitle === triad?.slug && triad) {
  log('Triad Brands: clear the search title "triad-brands" (the project title is used instead)');
  if (apply) await payload.update({ collection: 'projects', id: triad.id, data: { metaTitle: null, _status: 'published' }, depth: 0 });
}

// 3. Footer: the site's name (not an uppercase override) and one call-to-action label
const footer = await payload.findGlobal({ slug: 'footer', depth: 0 });
const footerData: Record<string, unknown> = {};
if (footer.title === 'HUMPHREY') { footerData.title = null; log('Footer: name override "HUMPHREY" cleared (uses Site settings → Name)'); }
if (footer.cta?.buttonLabel === 'Book a Strategy Call') { footerData.cta = { ...footer.cta, buttonLabel: 'Start a project' }; log('Footer: button "Book a Strategy Call" → "Start a project" (it opens the contact form, not a booking)'); }
if (apply && Object.keys(footerData).length) await payload.updateGlobal({ slug: 'footer', data: footerData });

// 4. Header: no floating availability badge (availability is in the contact section and footer)
const header = await payload.findGlobal({ slug: 'header', depth: 0 });
if (header.showAvailability !== false) {
  log('Header: hide the floating availability badge');
  if (apply) await payload.updateGlobal({ slug: 'header', data: { showAvailability: false } });
}

// 5. Homepage copy, as a draft
const { docs: homes } = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 });
if (homes[0]) {
  const home = await payload.findByID({ collection: 'pages', id: homes[0].id, draft: true, depth: 0 });
  let changed = false;
  const sections = (home.sections ?? []).map((s) => {
    const next = { ...s } as Record<string, unknown> & typeof s;
    const swap = (field: string, from: string, to: string, what: string) => {
      if (next[field] === from) { next[field] = to; changed = true; log(`Home ${what}: "${from}" → "${to}"`); }
    };
    if (s.blockType === 'hero') {
      swap('intro',
        'Hi, I’m Humphrey, a graphic designer based in Kenya. With over five years of professional experience. For over five years, I’ve been turning ideas into compelling visual stories that connect with people and perform effortlessly across social media.',
        'Hi, I’m Humphrey, a graphic and brand designer based in Kenya. For over five years I’ve turned ideas into visual stories that connect with people and perform across social media.',
        'hero intro (said “five years” twice)');
      const button = s.button as { label?: string | null } | undefined;
      if (button?.label === 'Get in Touch') { next.button = { ...button, label: 'Start a project' }; changed = true; log('Home hero button: "Get in Touch" → "Start a project" (one label for the main action)'); }
    }
    if (s.blockType === 'workShowcase') swap('heading', 'Visual storytelling case studies', 'Visual storytelling *case studies*', 'work heading (serif accent)');
    if (s.blockType === 'services') swap('heading', 'What I can do for you', 'What I can do *for you*', 'services heading (serif accent)');
    if (s.blockType === 'contact') swap('heading', 'This isn’t just for you. It’s for us to craft together.', 'Let’s make something *together.*', 'contact heading');
    return next;
  });
  if (changed && apply) await payload.update({ collection: 'pages', id: home.id, data: { sections }, draft: true, depth: 0 });
}

console.log(apply ? '\nDone. Review the homepage draft in the CMS and publish it.' : '\nPreview only. Run with --apply to make these changes.');
process.exit(0);
