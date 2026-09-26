/**
 * Creates the Home, About and Work pages and fills the Header and Footer.
 *   npm run seed-pages
 *
 * Safe to re-run: pages that already exist, and a Header/Footer that already has content,
 * are left alone. Content comes from the old Homepage/About editors when they still exist
 * (so nothing typed there is lost), otherwise from the default copy in lib/home-copy.ts.
 */
import { getPayload, type Payload } from 'payload';
import config from '@payload-config';
import { COPY, DEFAULT_PROCESS, DEFAULT_ROLES, DEFAULT_STATS } from '../lib/home-copy';
import { clients, designer, pricing, profile, services, toolkit } from './seed-data';

type Rec = Record<string, unknown>;
const ctx = { disableRevalidate: true };

/** Array rows without their ids, so they can be written into a new document. */
const rows = <T extends Rec>(list: unknown): T[] => (Array.isArray(list) ? list.map(({ id: _id, ...rest }) => rest as T) : []);
const idOf = (v: unknown) => (v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : (v as number | null | undefined) ?? null);
const richText = (paras: string[]) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: paras.map((text) => ({
      type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0,
      children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
});

/** Starter services (with prices) for a fresh install. */
const starterServices = () => services.map((s) => {
  const plan = pricing.find((pl) => pl.name.toLowerCase().split(' ')[0] === s.title.toLowerCase().split(' ')[0]);
  return {
    title: s.title,
    description: s.text,
    deliverables: s.title.startsWith('Social') ? ['Poster templates', 'Promo creative', 'Social calendar'] : s.title.startsWith('Web') ? ['Responsive website', 'Booking or shop flow', 'Launch assets'] : ['Logo', 'Colour & type', 'Brand guidelines'],
    priceFrom: plan ? Number(plan.amount) : undefined,
    currency: 'USD',
    unit: plan?.unit === '/mo' ? '/month' : undefined,
  };
});

const or = <T,>(v: T | null | undefined | '', fallback: T): T => (v == null || v === '' || (Array.isArray(v) && !v.length) ? fallback : v);

/** The retired Homepage / About globals, if this database still has them. */
async function legacy(payload: Payload, slug: string): Promise<Rec> {
  try {
    return (await payload.findGlobal({ slug: slug as never, depth: 0 })) as unknown as Rec;
  } catch {
    return {};
  }
}

async function run() {
  const payload = await getPayload({ config });
  const [home, about, site] = await Promise.all([legacy(payload, 'home'), legacy(payload, 'about'), payload.findGlobal({ slug: 'site', depth: 0 })]);
  const siteRec = site as unknown as Rec;
  const cta = (siteRec.ctaLabel as string) || 'Start a project';
  // The newest portrait wins; the original profile photo is the fallback.
  const portrait = (await payload.find({ collection: 'media', where: { filename: { in: ['humphrey-kibet-portrait.webp', 'profile.jpg'] } }, sort: '-createdAt', limit: 1, depth: 0 })).docs[0]?.id ?? null;

  const pages: { slug: string; title: string; sections: Rec[] }[] = [
    {
      slug: 'home',
      title: 'Home',
      sections: [
        {
          blockType: 'hero',
          trustedText: or(home.trustedText, COPY.trustedText),
          headline: or(home.headline, 'Social media and brand design that ships on time.'),
          intro: or(home.intro, `I’m ${designer.name}, a graphic designer in ${designer.city}. I make matchday posters, campaign creative, brand identities and websites for sports platforms and growing businesses.`),
          ctaText: or(home.heroCtaText, COPY.heroCtaText),
          button: { label: cta, url: '#contact' },
          clients: or(rows<Rec>(home.clients).map((c) => ({ name: c.name, url: c.url ?? null })), clients.map((name) => ({ name, url: null }))),
        },
        {
          blockType: 'workShowcase',
          anchor: 'work',
          heading: or(home.workHeading, COPY.workHeading),
          intro: or(home.workIntro, 'A few recent projects, each with a short case study.'),
          extraImages: (Array.isArray(home.heroImages) ? home.heroImages : []).map(idOf).filter(Boolean),
          showWall: true,
          link: { label: or(home.workLinkLabel, COPY.workLinkLabel), url: '/work' },
        },
        {
          blockType: 'aboutBanner',
          anchor: 'about',
          greeting: or(home.aboutGreeting, COPY.aboutGreeting),
          heading: or(about.headline, profile.tagline.replace('\n', ' ')),
          photo: idOf(about.photo) ?? portrait,
          stats: or(rows(home.stats), DEFAULT_STATS),
          link: { label: or(home.aboutLinkLabel, COPY.aboutLinkLabel), url: '/about' },
        },
        {
          blockType: 'audience',
          anchor: 'for-who',
          heading: or(home.rolesHeading, COPY.rolesHeading),
          lead: or(home.rolesLead, COPY.rolesLead),
          roles: or(home.audienceRoles as string[], DEFAULT_ROLES),
        },
        {
          blockType: 'process',
          anchor: 'process',
          eyebrow: or(home.processEyebrow, COPY.processEyebrow),
          heading: or(home.processHeading, COPY.processHeading),
          steps: or<Rec[]>(rows<Rec>(home.process).map((s) => ({ ...s, image: idOf(s.image) })), DEFAULT_PROCESS),
        },
        {
          blockType: 'services',
          anchor: 'services',
          eyebrow: or(home.servicesEyebrow, COPY.servicesEyebrow),
          heading: or(home.servicesHeading, COPY.servicesHeading),
          intro: or(home.servicesIntro, 'Fixed-scope packages. Every project starts with a short call about the brief.'),
          items: or(rows(home.services), starterServices()),
          showWhatsApp: true,
        },
        {
          blockType: 'testimonials',
          eyebrow: or(home.testimonialsEyebrow, COPY.testimonialsEyebrow),
          heading: or(home.testimonialsHeading, COPY.testimonialsHeading),
          items: rows<Rec>(home.testimonials).map((t) => ({ ...t, photo: idOf(t.photo) })),
        },
        {
          blockType: 'contact',
          anchor: 'contact',
          eyebrow: or(home.contactEyebrow, COPY.contactEyebrow),
          heading: or(home.contactHeading, COPY.contactHeading),
          intro: or(home.contactIntro, 'Tell me what you need and when you need it. I usually reply within one working day.'),
          showAvailability: true,
        },
      ],
    },
    {
      slug: 'about',
      title: 'About',
      sections: [
        {
          blockType: 'profile',
          eyebrow: 'About',
          heading: or(about.headline, profile.tagline.replace('\n', ' ')),
          body: about.body ?? richText(profile.paragraphs),
          photo: idOf(about.photo) ?? portrait,
          experience: or(rows(about.experience), [{ role: 'Graphic designer & social media manager', company: designer.studio, years: '3+ years' }]),
          skills: or(about.skills as string[], ['Social media design', 'Campaign design', 'Brand identity', 'Web design', 'Layout systems']),
          tools: or(about.tools as string[], toolkit.map(([, name]) => name).filter((n) => n !== 'XD')),
          cv: idOf(about.cv),
          button: { label: 'Work with me', url: '/#contact' },
        },
      ],
    },
    {
      slug: 'work',
      title: 'Work',
      sections: [
        {
          blockType: 'projectGrid',
          heading: 'Work',
          intro: 'Campaigns, identities and websites, each with a short case study on the brief, the process and what shipped.',
          showFilters: true,
        },
      ],
    },
  ];

  for (const p of pages) {
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: p.slug } }, limit: 1, depth: 0 });
    if (existing.docs[0]) { payload.logger.info(`Page “${p.title}” already exists — skipped`); continue; }
    await payload.create({ collection: 'pages', data: { title: p.title, slug: p.slug, sections: p.sections, _status: 'published' } as never, context: ctx });
    payload.logger.info(`Page “${p.title}” created with ${p.sections.length} section(s)`);
  }

  const header = (await payload.findGlobal({ slug: 'header', depth: 0 })) as unknown as Rec;
  if (!rows(header.menu).length) {
    await payload.updateGlobal({
      slug: 'header',
      context: ctx,
      data: {
        menu: [
          { label: 'Work', url: '/#work' },
          { label: 'About', url: '/#about' },
          { label: 'For who', url: '/#for-who' },
          { label: 'Process', url: '/#process' },
          { label: 'Services', url: '/#services' },
        ],
        quoteButton: { label: cta, url: '/#contact' },
        showAvailability: true,
      },
    });
    payload.logger.info('Header filled');
  }

  const footer = (await payload.findGlobal({ slug: 'footer', depth: 0 })) as unknown as Rec;
  if (!rows(footer.columns).length) {
    await payload.updateGlobal({
      slug: 'footer',
      context: ctx,
      data: {
        columns: [{
          heading: 'Site',
          links: [
            { label: 'Work', url: '/work' },
            { label: 'About', url: '/about' },
            { label: 'Process', url: '/#process' },
            { label: 'Services', url: '/#services' },
            { label: 'Contact', url: '/#contact' },
          ],
        }],
        note: (siteRec.footerNote as string) || 'Some client work is shown under NDA or with permission.',
      },
    });
    payload.logger.info('Footer filled');
  }
}

try {
  await run();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
