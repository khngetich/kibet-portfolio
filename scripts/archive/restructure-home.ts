/**
 * Reorders the homepage into one continuous story and fills the new fields:
 *   Hero → Selected projects → Process (circuit) → About & services → Services deck → Testimonials → Contact
 *   npm run restructure-home            (skips a homepage that is already in this shape)
 *   npm run restructure-home -- --force (re-applies the copy below over the current version)
 *
 * Nothing is deleted. “Who it’s for” is kept on the page but hidden (its roles move into the
 * contact section); the Services section becomes the 3D card deck with four services. Every change is a normal published
 * version, so the page's History can restore the previous layout.
 *
 * Also points the header menu at the new chapters, drops footer links to the hidden sections
 * and brightens the body-text colour in Styles, when they still have their old values.
 */
import { getPayload } from 'payload';
import config from '@payload-config';

type Rec = Record<string, unknown>;
const force = process.argv.includes('--force');

const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, draft: true, depth: 0, limit: 1 });
const home = docs[0];

if (!home) {
  console.log('No homepage found. Run `npm run seed-pages` first.');
} else {
  const sections = (home.sections ?? []) as Rec[];
  const byType = (t: string) => sections.find((s) => s.blockType === t);
  const done = (byType('workShowcase')?.layout === 'feature') && ((byType('aboutBanner')?.services as unknown[] | undefined)?.length ?? 0) > 0;

  if (done && !force) {
    console.log('The homepage is already in the new shape. Use --force to re-apply the copy.');
  } else {
    const audience = byType('audience');
    const patch: Record<string, Rec> = {
      hero: { clientsLabel: 'A few trusted partners' },
      workShowcase: {
        eyebrow: 'Selected projects',
        heading: 'Visual storytelling case studies',
        intro: 'Campaigns, brand identities and websites for sports platforms and growing businesses. Start with the featured case study, then browse the rest: each one opens the brief, what I did and what changed.',
        layout: 'feature',
        showWall: false,
      },
      process: {
        eyebrow: 'The process',
        heading: 'The Humphrey process',
        lead: 'Vision → Design → Performance',
        layout: 'steps',
        steps: [
          { title: 'Strategy & Vision', icon: 'compass', description: 'We start with the goal: who it’s for, where it will live and what success looks like. A short call or voice note is enough; I turn it into a clear direction.', points: ['Audience, message and channels agreed', 'Deadline and deliverables set up front'] },
          { title: 'Collaborative Design', icon: 'pen', description: 'Two or three routes, each with a reason behind it. We choose one together, then I build it out across every size and format.', points: ['Moodboards built from your market', 'One route chosen together'] },
          { title: 'Testing & Feedback', icon: 'chat', description: 'Designs are checked where they’ll be seen (in the feed, on phones, in print proofs) and refined in one or two focused rounds.', points: ['Checked on real screens and proofs', 'Short, focused feedback rounds'] },
          { title: 'Deployment', icon: 'rocket', description: 'Organised, ready-to-use files and templates, delivered on schedule, with help when the next campaign lands.', points: ['Source files and exports', 'Templates your team can reuse'] },
        ],
      },
      aboutBanner: {
        eyebrow: 'About & services',
        intro: 'a Senior Designer specializing in',
        expertise: [
          'Matchday posters and campaign creative for sports platforms',
          'Brand identities for growing businesses',
          'Websites that take bookings and orders',
          'Social content systems that keep up with a daily schedule',
        ],
        servicesHeading: 'What I do',
        services: [
          { title: 'Social Media Strategy', description: 'Content systems, matchday posters and promo templates built for fast, on-brand turnaround.' },
          { title: 'Brand Identity', description: 'Logo, colour, type and guidelines for a business that’s outgrown its old look.' },
          { title: 'UI/UX Design', description: 'Responsive, booking- and store-ready websites, from first wireframe to launch.' },
          { title: 'Campaign Creative', description: 'Launch visuals, key art and ad sets that stay consistent across every channel.' },
        ],
        cta: { label: 'Let’s talk about your brand', url: '/#contact', variant: 'light' },
      },
      testimonials: { eyebrow: 'Social proof' },
      contact: {
        eyebrow: 'Let’s work together',
        heading: 'This isn’t just for you. It’s for us to craft together.',
        rolesLead: 'if you’re a',
        roles: (audience?.roles as string[] | undefined) ?? ['startup founder', 'sports platform', 'marketing team', 'growing business'],
        showSocials: true,
      },
      // kept, but off the page for now
      audience: { hidden: true },
      services: { hidden: true },
    };

    const order = ['hero', 'workShowcase', 'process', 'aboutBanner', 'testimonials', 'contact', 'audience', 'services'];
    const known = order.map(byType).filter((s): s is Rec => !!s);
    const others = sections.filter((s) => !order.includes(s.blockType as string));
    const next = [...known, ...others].map((s) => ({ ...s, ...(patch[s.blockType as string] ?? {}) }));
    // the testimonials slot is part of the story even before it has quotes (it stays hidden publicly until then)
    if (!byType('testimonials')) next.splice(4, 0, { blockType: 'testimonials', eyebrow: 'Social proof', heading: 'What clients say', items: [] });

    await payload.update({ collection: 'pages', id: home.id, data: { sections: next, _status: 'published' } as never, depth: 0 });
    console.log(`Homepage reordered: ${next.filter((s) => !s.hidden).map((s) => s.blockType).join(' → ')}`);
  }

  // Step 2: the Services section as the 3D card deck, right after About & services.
  const fresh = (await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, draft: true, depth: 0, limit: 1 })).docs[0];
  if (fresh) {
    const list = (fresh.sections ?? []) as Rec[];
    const services = list.find((x) => x.blockType === 'services');
    const hasDeckCopy = ((services?.items as { title?: string }[] | undefined) ?? []).some((x) => x.title === 'Creative Direction');
    if (services && (force || services.layout !== 'deck' || services.hidden || !hasDeckCopy)) {
      const deck = {
        ...services,
        hidden: false,
        layout: 'deck',
        eyebrow: 'Services',
        heading: 'What I can do for you',
        intro: 'Four ways to work together, from a single campaign to a monthly design partner.',
        ctaLabel: 'Inquire for this service',
        items: [
          { title: 'Graphic Design & Social Assets', description: 'Crafting high-impact visuals that engage & convert', deliverables: ['Matchday and promo posters', 'Social post and story templates', 'Campaign creative in every size', 'Print-ready and web-ready files'] },
          { title: 'Brand Identity & Systems', description: 'Cohesive visual stories across all platforms', deliverables: ['Logo and visual identity', 'Colour, type and graphic language', 'Brand guidelines', 'Templates for everyday use'] },
          { title: 'Design on Demand / Retainers', description: 'Fast, reliable turnarounds on monthly subscription', deliverables: ['A monthly design allowance', 'Quick turnaround on everyday requests', 'Consistent, on-brand output', 'A monthly check-in on what’s next'] },
          { title: 'Creative Direction', description: 'Strategic visual guidance for marketing campaigns', deliverables: ['Campaign concepts and moodboards', 'Art direction for shoots and design teams', 'One visual language across channels', 'Review and sign-off on final work'] },
        ],
      };
      const rest = list.filter((x) => x !== services);
      const at = rest.findIndex((x) => x.blockType === 'aboutBanner');
      rest.splice(at >= 0 ? at + 1 : rest.length, 0, deck);
      await payload.update({ collection: 'pages', id: fresh.id, data: { sections: rest, _status: 'published' } as never, depth: 0 });
      console.log(`Services deck added: ${rest.filter((x) => !x.hidden).map((x) => x.blockType).join(' → ')}`);
    }
  }

  // Step 3: the Process section as the circuit flow (badge → traces → four phase cards).
  const latest = (await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, draft: true, depth: 0, limit: 1 })).docs[0];
  if (latest) {
    const list = (latest.sections ?? []) as Rec[];
    const proc = list.find((x) => x.blockType === 'process');
    if (proc && (force || proc.layout !== 'circuit')) {
      const circuit = {
        ...proc,
        layout: 'circuit',
        heading: 'Our 4-Step Project Process',
        steps: [
          { title: 'Discovery', icon: 'bulb', duration: '1–2 days', description: 'We get to know your brand, your audience and the goal, and agree what success looks like before anything is designed.', points: ['Kick-off call or voice-note brief', 'Audience and competitor scan', 'Agreed goals, scope and deadline'] },
          { title: 'Strategy', icon: 'chart', duration: '2–3 days', description: 'What we learn becomes a clear direction: the message, the channels and the look that will carry them.', points: ['Creative direction and moodboard', 'Content and channel plan', 'Two or three concept routes'] },
          { title: 'Execution', icon: 'sliders', duration: '1–2 weeks', description: 'The chosen route is designed across every size and format, and refined with you in focused rounds.', points: ['The full design set, in every format', 'One or two focused feedback rounds', 'Checked on real screens and proofs'] },
          { title: 'Delivery', icon: 'checkCircle', duration: '1–2 days', description: 'Organised, ready-to-use files and templates, with support when the next campaign lands.', points: ['Source files and exports', 'Reusable templates', 'Handover notes and follow-up support'] },
        ],
      };
      await payload.update({ collection: 'pages', id: latest.id, data: { sections: list.map((x) => (x === proc ? circuit : x)), _status: 'published' } as never, depth: 0 });
      console.log('Process: circuit flow with Discovery → Strategy → Execution → Delivery.');
    }
  }

  // Step 4: About as the editorial split screen with Overview / Expertise / Impact tabs.
  const cur = (await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, draft: true, depth: 0, limit: 1 })).docs[0];
  if (cur) {
    const list = (cur.sections ?? []) as Rec[];
    const about = list.find((x) => x.blockType === 'aboutBanner');
    if (about && (force || !((about.tabs as unknown[] | undefined)?.length))) {
      const editorial = {
        ...about,
        layout: 'editorial',
        eyebrow: 'About',
        role: 'Senior Graphic & Brand Designer',
        tabs: [
          { label: 'Overview', heading: '5+ years of experience', text: 'I’m Humphrey, a graphic and brand designer in Kenya. I design conversion-driven social content and brand identities that stay consistent everywhere they appear, from matchday posters to complete visual systems.',
            rows: [{ value: '50+', label: 'Brands launched' }, { value: '5+', label: 'Years of experience' }, { value: '100%', label: 'On-time delivery' }, { value: '3.5M+', label: 'Social impressions' }] },
          { label: 'Expertise', heading: 'What I specialise in', text: 'Two disciplines that feed each other: social design that earns attention and converts, and brand identity that keeps every piece recognisable.',
            rows: [{ value: '01', label: 'Social media & campaign design' }, { value: '02', label: 'Brand identity & systems' }, { value: '03', label: 'Creative direction' }, { value: '04', label: 'Web & UI design' }] },
          { label: 'Impact', heading: 'Work that performs', text: 'What recent projects changed for the people who commissioned them.',
            rows: [{ value: 'Live', label: 'Rovex Car Rentals: bookings run through their own site' }, { value: 'Online', label: 'Techpressive: orders taken on their own store' }, { value: 'Weekly', label: 'KwikBet: a matchday poster system every week' }] },
        ],
      };
      await payload.update({ collection: 'pages', id: cur.id, data: { sections: list.map((x) => (x === about ? editorial : x)), _status: 'published' } as never, depth: 0 });
      console.log('About: editorial split screen with Overview / Expertise / Impact.');
    }
  }

  const header = await payload.findGlobal({ slug: 'header', depth: 0 });
  const urls = (header.menu ?? []).map((l) => l.url).join(',');
  if (force || urls === '/#work,/#about,/#for-who,/#process,/#services' || urls === '/#work,/#process,/#about') {
    await payload.updateGlobal({ slug: 'header', data: { menu: [{ label: 'Work', url: '/#work' }, { label: 'Process', url: '/#process' }, { label: 'About', url: '/#about' }, { label: 'Services', url: '/#services' }] } as never });
    console.log('Header menu: Work · Process · About · Services (plus the Start a project button).');
  }

  // (the footer's link columns were removed in the 2026-10 redesign; it's name, socials and policies now)

  const theme = await payload.findGlobal({ slug: 'theme', depth: 0 });
  if (!theme.mutedText || theme.mutedText.toUpperCase() === '#A8A8A6') {
    await payload.updateGlobal({ slug: 'theme', data: { mutedText: '#E2E8F0' } as never });
    console.log('Styles → Body text: #E2E8F0.');
  }
}
process.exit(0);
