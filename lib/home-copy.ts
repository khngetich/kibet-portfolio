/**
 * Default section copy. It is used as each section field's default value and, for safety,
 * as the fallback when a field is left empty. Edit the text in Payload (Website → Pages);
 * change it here only to alter what a fresh install starts with.
 */

export const COPY = {
  heroCtaText: 'Have a brief? Tell me about it.',
  trustedText: 'Trusted by {count}+ brands',
  clientsLabel: 'A few trusted partners',
  workEyebrow: 'Selected projects',
  workHeading: 'Selected work',
  workLinkLabel: 'All projects',
  aboutGreeting: 'Hi, I’m',
  aboutLinkLabel: 'More about me',
  aboutEyebrow: 'About & services',
  aboutIntro: 'a designer specialising in',
  aboutServicesHeading: 'What I do',
  aboutCta: 'Let’s talk about your brand',
  rolesHeading: 'This work is for you',
  rolesLead: 'if you’re a',
  processEyebrow: 'How it works',
  processHeading: 'From first message to finished files in four steps',
  servicesEyebrow: 'What I do',
  servicesHeading: 'What I do',
  testimonialsEyebrow: 'Honest words, real results',
  testimonialsHeading: 'What clients say',
  contactEyebrow: 'Let’s talk',
  contactHeading: 'Have a brief? Let’s talk.',
  contactRolesLead: 'Made for you if you’re a',
} as const;

export const DEFAULT_ROLES = [
  'startup founder',
  'sports platform',
  'marketing team',
  'growing business',
  'event organiser',
  'brand manager',
  'content creator',
];

export const DEFAULT_PROCESS = [
  { title: 'Brief & direction', description: 'A short call or voice note is enough. I turn it into a clear direction before anything is designed.', points: ['What it needs to say and to whom', 'Where it will live: feed, print or web', 'Deadline and deliverables agreed up front'] },
  { title: 'Concepts', description: 'Two or three routes, each with a reason behind it, so you choose with confidence rather than guesswork.', points: ['Moodboards built from your market', 'Type, colour and layout explored', 'One route chosen together'] },
  { title: 'Design & refine', description: 'The chosen route is built out in full and refined with you, usually in one or two focused rounds.', points: ['Every size and format produced', 'Feedback rounds kept tight', 'Templates you can reuse'] },
  { title: 'Deliver & support', description: 'Organised, ready-to-use files and a system that keeps working after the handover.', points: ['Source files and exports', 'A simple guide for your team', 'Help when the next campaign lands'] },
];

export const DEFAULT_STATS = [
  { value: '3+', label: 'Years designing for brands, sports platforms and small businesses.' },
  { value: '1,000+', label: 'Posters, posts and campaign pieces delivered on deadline.' },
  { value: '24h', label: 'Typical turnaround for daily social content once a system is in place.' },
];

/** Returns the CMS list when it has entries, otherwise the default. */
export const orDefault = <T,>(value: T[] | null | undefined, fallback: T[]): T[] => (value?.length ? value : fallback);

/**
 * Section copy: the default only when the field has never been set (null/undefined).
 * An editor who empties a field gets an empty string back, so the element can be left out.
 */
export const copy = (value: string | null | undefined, fallback: string) => (value == null ? fallback : value.trim());

/** Returns the CMS text when it is filled in, otherwise the default (for labels that must not be blank). */
export const text = (value: string | null | undefined, fallback: string) => (value?.trim() ? value : fallback);
