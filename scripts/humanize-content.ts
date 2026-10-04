/**
 * The October 2026 "humanize" pass: warmer, client-first copy across the site, a /contact page,
 * and the parts the About page was missing. Applied through Payload, so every change gets a
 * version in History you can restore. Shows what it would change; nothing is written unless
 * APPLY=1 is set:
 *
 *   npm run humanize-content           (preview)
 *   APPLY=1 npm run humanize-content   (write)
 *
 * Needs migration 20261004_134452_profile_principles first (`npx payload migrate`).
 *
 * Each copy edit only happens while the text still reads as below (ignoring *accent* marks,
 * apostrophe style and spacing), so your own later edits are never overwritten and running it
 * again is safe. Facts stay as they are: no prices, years, counts or legal text change, and the
 * About experience is copied from the Résumé page, not written here.
 */
import { getPayload } from 'payload';
import config from '@payload-config';

const apply = process.env.APPLY === '1';
const payload = await getPayload({ config });
const log = (msg: string) => console.log(`${apply ? '✓' : '·'} ${msg}`);
const norm = (v: unknown) => (typeof v === 'string' ? v.replace(/\*/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim() : v);
type Doc = Record<string, unknown>;

/** Replaces obj[key] when it still reads `from` (null: only when empty); returns whether it changed. */
function swap(obj: Doc | undefined, key: string, from: string | null, to: string, what: string) {
  if (!obj) return false;
  const now = obj[key];
  if (from === null ? now != null && now !== '' : norm(now) !== norm(from)) return false;
  obj[key] = to;
  log(`${what}: ${from === null ? '(empty)' : `"${from}"`} → "${to}"`);
  return true;
}

/** Edits the latest version of a document, then publishes it, or saves a draft when it already has unpublished changes. */
async function edit(collection: 'pages' | 'services', slug: string, change: (doc: Doc) => boolean) {
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
const any = (...xs: boolean[]) => xs.some(Boolean);

// ── Homepage ──────────────────────────────────────────────────────────────────────────────────
await edit('pages', 'home', (doc) => {
  const hero = block(doc, 'hero');
  const work = block(doc, 'workShowcase');
  const process = block(doc, 'process');
  const about = block(doc, 'aboutBanner');
  const services = block(doc, 'services');
  const audience = block(doc, 'audience');
  const contact = block(doc, 'contact');
  const steps = (process?.steps ?? []) as Doc[];
  const step = (title: string) => steps.find((s) => norm(s.title) === title);
  const tab = (label: string) => ((about?.tabs ?? []) as Doc[]).find((t) => norm(t.label) === label);
  const form = (contact?.form ?? undefined) as Doc | undefined;
  return any(
    swap(hero, 'headline', 'I don’t just create designs; I craft experiences.', 'Designs your audience *stops scrolling for.*', 'Hero headline'),
    swap(hero, 'intro', 'Hi, I’m Humphrey, a graphic and brand designer based in Kenya. For over five years I’ve turned ideas into visual stories that connect with people and perform across social media.',
      'Hi, I’m Humphrey, a graphic and brand designer in Kenya. For over five years I’ve helped brands, sports platforms and growing businesses look sharp, sound like themselves and get noticed, one post, poster and logo at a time.', 'Hero intro'),
    swap(hero, 'ctaText', 'Have a brief? Tell me about it.', 'Got a brief? Or just a hunch?', 'Hero button lead-in'),
    swap(hero, 'clientsLabel', 'A few trusted partners', 'In good company', 'Clients label'),

    swap(work, 'heading', 'Visual storytelling *case studies*', 'Work that *did the job*', 'Projects heading'),
    swap(work, 'intro', 'Campaigns, brand identities and websites for sports platforms and growing businesses. Each case study covers the brief, what I did and what changed.',
      'Campaigns, identities and websites for sports platforms and growing businesses. Open a folder for the brief, what I did and what changed.', 'Projects intro'),
    swap(work?.link as Doc | undefined, 'label', 'All projects', 'See all the work', 'Projects link'),

    swap(process, 'heading', 'How a project runs, in *four steps*', 'How we’ll work, in *four steps*', 'Process heading'),
    swap(process, 'lead', 'Vision → Design → Performance', 'No black boxes. You’ll see it take shape, and you’ll always know what’s next.', 'Process lead'),
    swap(step('Discovery'), 'description', 'We get to know your brand, your audience and the goal, and agree what success looks like before anything is designed.',
      'We talk about your brand, your audience and the goal, and agree what “nailed it” looks like before anything gets designed.', 'Process: Discovery'),
    swap(step('Strategy'), 'description', 'What we learn becomes a clear direction: the message, the channels and the look that will carry them.',
      'Everything we learned turns into a clear direction: the message, the channels and a look that can carry them.', 'Process: Strategy'),
    swap(step('Execution'), 'description', 'The chosen route is designed across every size and format, and refined with you in focused rounds.',
      'The chosen route gets designed in every size and format you need, then polished with you in focused rounds (not endless ones).', 'Process: Execution'),
    swap(step('Delivery'), 'description', 'Organised, ready-to-use files and templates, with support when the next campaign lands.',
      'Neatly named, ready-to-use files and templates, plus a hand when the next campaign lands.', 'Process: Delivery'),

    swap(about, 'heading', 'Brand and social design that *performs*.', 'Brand and social design that *pulls its weight*.', 'About heading'),
    swap(about, 'intro', 'a senior graphic and brand designer in Kenya, creating social campaigns and brand identities that stay consistent everywhere they appear.',
      'a senior graphic and brand designer in Kenya, making social campaigns and brand identities that look like the same brand everywhere they show up.', 'About intro'),
    swap(tab('Expertise'), 'text', 'Two disciplines that feed each other: social design that earns attention and converts, and brand identity that keeps every piece recognisable.',
      'Two crafts that feed each other: social design that earns the scroll-stop, and brand identity that makes every piece unmistakably yours.', 'About → Expertise'),
    swap(tab('Impact'), 'text', 'What recent projects changed for the people who commissioned them.', 'What recent projects changed for the people who hired me.', 'About → Impact'),
    swap(about?.cta as Doc | undefined, 'label', 'Let’s talk about your brand', 'Tell me about your brand', 'About button'),
    swap(about?.link as Doc | undefined, 'label', 'More about me', 'The longer story', 'About link'),

    swap(services, 'heading', 'What I can do *for you*', 'Ways I can *help*', 'Services heading'),
    swap(services, 'intro', 'Four ways to work together, from a single campaign to a monthly design partner.', 'Four ways to work together, from a one-off campaign to a design partner on call every month.', 'Services intro'),
    swap(services, 'ctaLabel', 'Inquire for this service', 'Ask about this one', 'Services button'),
    swap(services, 'pageLinkLabel', 'See the service', 'What’s included', 'Services link'),

    swap(audience, 'heading', 'This work is for you', 'Made for you', 'Who it’s for'),

    swap(contact, 'eyebrow', 'Let’s work together', 'Your move', 'Contact label'),
    swap(contact, 'heading', 'Let’s make something *together.*', 'Let’s make something *worth sharing.*', 'Contact heading'),
    swap(contact, 'intro', 'Tell me what you need and when you need it. I usually reply within one working day.', 'Tell me what you’re planning and when it needs to land. I reply within one working day.', 'Contact intro'),
    swap(form, 'serviceLabel', null, 'What can I help with?', 'Form: service question'),
    swap(form, 'messagePlaceholder', null, 'The what, the who and the when. Rough notes are perfect.', 'Form: message hint'),
    swap(form, 'submitLabel', null, 'Send it over', 'Form: button'),
    swap(form, 'successText', null, 'Got it! You’ll hear from me within one working day.', 'Form: after sending'),
  );
});

// ── Work ──────────────────────────────────────────────────────────────────────────────────────
await edit('pages', 'work', (doc) => swap(block(doc, 'projectGrid'), 'intro',
  'Campaigns, identities and websites, each with a short case study on the brief, the process and what shipped.',
  'Every project, with the story behind it: the brief, the process and what shipped.', 'Work intro'));

// ── About: how I work, the full experience (from the Résumé), selected work ────────────────────
const resume = (await payload.find({ collection: 'pages', where: { slug: { equals: 'resume' } }, limit: 1, depth: 0, draft: true })).docs[0] as unknown as Doc | undefined;
const jobs = ((block(resume ?? {}, 'resume')?.jobs ?? []) as Doc[]).filter((j) => j.role);
// "Aug 2025 – Present" → "2025 – now"; "Oct 2024 – Jul 2025" → "2024 – 2025"
const years = (dates: unknown) => {
  const [a, b] = String(dates ?? '').split(/\s*[–-]\s*/);
  const y = (s?: string) => (/present|now/i.test(s ?? '') ? 'now' : (s ?? '').match(/\d{4}/)?.[0] ?? '');
  return [y(a), y(b)].filter(Boolean).filter((v, i, all) => all.indexOf(v) === i).join(' – ');
};

await edit('pages', 'about', (doc) => {
  const profile = block(doc, 'profile');
  if (!profile) return false;
  let changed = false;
  if (!(profile.principles as Doc[] | undefined)?.length) {
    profile.principlesHeading = 'How I like to *work*';
    profile.principles = [
      { title: 'Brief first, pixels second', text: 'We agree what “nailed it” means before I open a single file, so nobody’s guessing at the end.' },
      { title: 'You’re in the room', text: 'Work-in-progress links and quick voice notes along the way. No dramatic big reveal, no surprises.' },
      { title: 'Made for the feed', text: 'Every piece gets checked at real size on a real phone, because that’s where your audience will see it.' },
      { title: 'Files you can actually use', text: 'Neatly named, organised and templated, so your team can run with it long after handover.' },
    ];
    log('About: added “How I like to work” (four principles)');
    changed = true;
  }
  // only while the experience is still the single line it was; then the Résumé's roles, newest first
  const xp = (profile.experience ?? []) as Doc[];
  if (xp.length <= 1 && jobs.length) {
    const [now, ...earlier] = jobs.map((j) => ({ role: j.role, company: j.company, years: years(j.dates) }));
    profile.experience = [now, ...xp.map(({ id, ...rest }) => { void id; return rest; }), ...earlier];
    log(`About experience: ${xp.length} role → ${jobs.length + xp.length} (copied from the Résumé, current role first)`);
    changed = true;
  }
  changed = swap(profile.button as Doc | undefined, 'url', '/#contact', '/contact', 'About button link') || changed;
  if (!block(doc, 'workShowcase')) {
    doc.sections = [...sectionsOf(doc), { blockType: 'workShowcase', eyebrow: 'Proof', heading: 'A few things *I’ve made*', intro: 'Open a folder: each one has the brief, what I did and how it turned out.', layout: 'feature', link: { label: 'See all the work', url: '/work' } }];
    log('About: added the selected work (glass folders) after the profile');
    changed = true;
  }
  return changed;
});

// ── Services: one-line summaries that say what you get ─────────────────────────────────────────
for (const [slug, from, to] of [
  ['brand-identity-and-systems', 'Cohesive visual stories across all platforms', 'A look people recognise before they’ve read the name.'],
  ['design-on-demand-retainers', 'Fast, reliable turnarounds on monthly subscription', 'Your on-call designer, on a simple monthly plan.'],
  ['creative-direction', 'Strategic visual guidance for marketing campaigns', 'Someone to keep every campaign looking like one brand.'],
] as const) await edit('services', slug, (doc) => swap(doc, 'description', from, to, `Service summary (${slug})`));

// ── A /contact page ───────────────────────────────────────────────────────────────────────────
const existing = await payload.find({ collection: 'pages', where: { slug: { equals: 'contact' } }, limit: 1, depth: 0, draft: true });
if (!existing.docs.length) {
  log('New page /contact: the contact form as a page, then “Before you ask” questions');
  if (apply) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Contact',
        slug: 'contact',
        _status: 'published',
        meta: { title: 'Contact — Humphrey Kibet', description: 'Start a project with Humphrey Kibet, graphic and brand designer in Kenya. Send a brief, email or WhatsApp; replies within one working day.' },
        sections: [
          {
            blockType: 'contact', eyebrow: 'Contact', heading: 'Let’s make something *worth sharing.*',
            intro: 'Tell me what you’re planning and when it needs to land. I reply within one working day.',
            showAvailability: true,
            form: { serviceLabel: 'What can I help with?', messagePlaceholder: 'The what, the who and the when. Rough notes are perfect.', submitLabel: 'Send it over', successText: 'Got it! You’ll hear from me within one working day.' },
          },
          {
            blockType: 'faq', eyebrow: 'Before you ask', heading: 'Good to *know*',
            items: [
              { question: 'How do we get started?', answer: 'Send a short brief through the form, by email or on WhatsApp: what it is, who it’s for and when you need it. I’ll reply within one working day with questions and next steps.' },
              { question: 'What does a project cost?', answer: 'It depends on the scope. Social and campaign design starts from KES 1,500, and identities, retainers and creative direction are quoted after a quick chat about what you need.' },
              { question: 'How long does it take?', answer: 'Most projects take about two to three weeks from kick-off to final files. Everyday social content moves much faster once a template system is in place.' },
              { question: 'How many rounds of changes do I get?', answer: 'Usually one or two focused rounds. That’s normally plenty, because we agree the direction before the design starts.' },
              { question: 'What do I get at the end?', answer: 'Source files and exports, reusable templates and handover notes, plus a hand when the next campaign lands.' },
              { question: 'Do you work with clients outside Kenya?', answer: 'Yes. I’m based in Kenya and work remotely with teams elsewhere, including a part-time role with a Houston-based marketing agency.' },
            ],
          },
        ],
      } as never,
      depth: 0,
    });
  }
}

// ── Header and footer: “Contact” goes to the new page ─────────────────────────────────────────
const header = await payload.findGlobal({ slug: 'header', depth: 0 }) as unknown as Doc;
const menu = ((header.menu ?? []) as Doc[]).map((m) => ({ ...m }));
const contactItem = menu.find((m) => norm(m.label) === 'Contact');
if (contactItem && swap(contactItem, 'url', '/#contact', '/contact', 'Menu: Contact link') && apply) await payload.updateGlobal({ slug: 'header', data: { menu } as never, depth: 0 });

const footer = await payload.findGlobal({ slug: 'footer', depth: 0 }) as unknown as Doc;
const cta = { ...(footer.cta as Doc) };
if (swap(cta, 'buttonUrl', '/#contact', '/contact', 'Footer card button link') && apply) await payload.updateGlobal({ slug: 'footer', data: { cta } as never, depth: 0 });

console.log(apply ? '\nDone. Anything saved as a draft is waiting in the CMS for you to publish.' : '\nPreview only. Run with APPLY=1 to make these changes.');
process.exit(0);
