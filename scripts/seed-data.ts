/**
 * ─────────────────────────────────────────────────────────────
 *  Content for Humphrey Kibet's portfolio (Kaptured Creatives).
 *  Sourced from the uploaded Portfolio.ai deck. A few notes on
 *  what changed in the conversion, for whoever edits this next:
 *
 *  - The Matchday Posters, Crash Game Posters and Winners'
 *    Announcements were designed for a sports-betting client and
 *    used licensed footballer photos, club crests and the
 *    client's brand. Those can't be reproduced here, so each is
 *    represented with a generic abstract cover (lib/art.ts:
 *    'matchday' / 'crashgame' / 'winners') instead of the real
 *    artwork -- swap in real exported JPGs under /public/work
 *    once you have the rights to publish them, by setting
 *    `cover` on the project below.
 *  - The Rovex Car Rentals and Techpressive Prints & Design web
 *    projects use the real mockup screenshots extracted from the
 *    deck (/public/work/rovex.jpg, techpressive.jpg).
 *  - The profile photo is the real one from the deck
 *    (/public/profile.jpg).
 * ─────────────────────────────────────────────────────────────
 */

export type Media = { art: string; src?: string; alt: string };

export interface Project {
  slug: string;
  title: string;
  client: string;
  year: string;
  discipline: string;
  art: string;
  cover?: string;
  summary: string;
  role: string[];
  brief: string;
  approach: string;
  result: string;
  gallery: Media[];
  note?: string;
}

export const designer = {
  name: 'Humphrey Kibet',
  studio: 'Kaptured Creatives',
  role: 'Graphic designer & social media manager',
  city: 'Kenya',
  email: 'khngetich@gmail.com',
  phone: '+254 720 949 086',
  website: 'kaptured.biz',
  availability: 'Open to freelance and retainer projects',
  handle: '@kapturedcreatives',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'ig' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'in' },
    { label: 'X', href: 'https://x.com/', icon: 'x' },
  ],
};

export const hero = {
  title: 'I don\u2019t just create designs; I craft experiences.',
  sub: 'Graphic design and social media creative for brands, sports platforms and small businesses across Kenya and beyond.',
  tags: ['Social media design', 'Web design'],
  fan: ['matchday', 'crashgame', 'winners', 'halftone', 'burst', 'rainbow', 'swirl'],
};

export const profile = {
  kicker: 'Profile',
  tagline: 'I don\u2019t just create designs;\nI craft experiences.',
  paragraphs: [
    'I\u2019m Humphrey Kibet, a graphic designer with over three years of professional experience. I specialise in creating impactful visuals that resonate with viewers and translate effectively across social media platforms.',
    'My approach revolves around storytelling and evoking emotional responses. Every project is executed with a pursuit of perfection, so each design communicates its intended message clearly.',
    'I\u2019m continuously refining my process and efficiency, and I\u2019m dedicated to providing top-notch service to every client I work with.',
  ],
  photo: '/profile.jpg',
};

export const projects: Project[] = [
  {
    slug: 'kwikbet-matchday-posters',
    title: 'Matchday Posters',
    client: 'KwikBet',
    year: '2025',
    discipline: 'Social media design',
    art: 'matchday',
    summary: 'A weekly poster system previewing fixtures across Europe\u2019s top leagues, built for fast turnaround on matchday mornings.',
    role: ['Social media design', 'Layout system', 'Campaign design'],
    brief: 'KwikBet needed a new matchday poster going out several times a week across every major fixture, each one produced and approved within hours of the lineup being confirmed.',
    approach: 'I built a single template with fixed slots for team colours, odds and kickoff time, so a new poster is a fast re-skin rather than a redesign every time. A consistent header and footer keep the whole run recognisable at a glance in a crowded feed.',
    result: 'The template has run for a full season across dozens of fixtures without missing a matchday deadline.',
    gallery: [{ art: 'matchday', alt: 'Matchday poster template' }, { art: 'burst', alt: 'Poster colour variant' }, { art: 'halftone', alt: 'Feed layout study' }],
    note: 'Shown here as a generic template mockup \u2014 the published posters used licensed player photography and club crests that can\u2019t be reproduced outside that campaign.',
  },
  {
    slug: 'kwikbet-crash-game-posters',
    title: 'Crash Game Posters',
    client: 'KwikBet',
    year: '2025',
    discipline: 'Social media design',
    art: 'crashgame',
    summary: 'Launch and promo creative for KwikBet\u2019s crash-style games, designed to read instantly on a phone screen.',
    role: ['Social media design', 'Motion-ready layouts', 'Iconography'],
    brief: 'Crash games move fast, and so does the feed. The posters needed to sell the thrill of the multiplier climbing in a single glance.',
    approach: 'A rising flight path anchors every poster, with the multiplier set big enough to read paused mid-scroll. The same layout adapts to a static post or a short animated teaser.',
    result: 'The series became the visual template for every new crash-style game KwikBet has launched since.',
    gallery: [{ art: 'crashgame', alt: 'Crash game poster template' }, { art: 'rainbow', alt: 'Alternate colourway' }, { art: 'swirl', alt: 'Motion teaser still' }],
    note: 'Represented here with a generic template \u2014 the original series used the client\u2019s branding and in-app screenshots.',
  },
  {
    slug: 'kwikbet-winners-announcements',
    title: 'Winners\u2019 Announcements',
    client: 'KwikBet',
    year: '2025',
    discipline: 'Social media design',
    art: 'winners',
    summary: 'Daily and campaign winner-announcement graphics, built to publish minutes after a payout is confirmed.',
    role: ['Social media design', 'Data-driven templates'],
    brief: 'Winner posts needed to go out fast, stay on-brand, and scale from a single daily winner to a leaderboard of fifty for bigger promotions.',
    approach: 'One flexible template handles both cases: a single hero winner card, and a compact table layout for leaderboards, sharing the same header treatment so either reads as part of the same campaign.',
    result: 'The templates are now the standard format for every winner announcement the brand posts.',
    gallery: [{ art: 'winners', alt: 'Winner announcement template' }, { art: 'party', alt: 'Leaderboard variant' }],
    note: 'Shown as a generic template \u2014 the published graphics carried real (masked) winner details under NDA.',
  },
  {
    slug: 'rovex-car-rentals',
    title: 'Rovex Car Rentals',
    client: 'Rovex Car Rentals',
    year: '2023',
    discipline: 'Web design',
    art: 'rovex',
    cover: '/work/rovex.jpg',
    summary: 'A booking-first website for a car rental company in Houston, Texas, designed to get a visitor from search to a held reservation in four steps.',
    role: ['Web design', 'UX', 'Mobile layout'],
    brief: 'Rovex needed a website that felt as premium as their fleet, with a booking flow simple enough that it didn\u2019t need a phone call to finish.',
    approach: 'A high-contrast yellow-and-black identity carries through hero, search and confirmation, with the pickup/return/date search bar always in reach. Every screen was designed for mobile first, since most of Rovex\u2019s traffic books from a phone.',
    result: 'Live at Rovex\u2019s own domain, running their day-to-day booking traffic.',
    gallery: [{ art: 'rovex', src: '/work/rovex.jpg', alt: 'Rovex Car Rentals homepage on desktop and mobile' }],
  },
  {
    slug: 'techpressive-prints-and-design',
    title: 'Techpressive Prints & Design',
    client: 'Techpressive Prints and Design',
    year: '2023',
    discipline: 'Web design',
    art: 'techpressive',
    cover: '/work/techpressive.jpg',
    summary: 'A full rebrand and e-commerce website for a Juja-based printing company, built to showcase and sell their print products directly.',
    role: ['Brand revamp', 'Web design', 'E-commerce'],
    brief: 'Techpressive\u2019s old site couldn\u2019t show off their print quality or sell online. They needed a rebrand and a responsive storefront in one project.',
    approach: 'A confident navy-and-pink identity replaces the old look, built around the line \u201cwhere creativity meets craftsmanship.\u201d The new site pairs a portfolio-style showcase with a straightforward, secure checkout.',
    result: 'Techpressive now takes orders for business cards, banners and more directly through their own site.',
    gallery: [{ art: 'techpressive', src: '/work/techpressive.jpg', alt: 'Techpressive Prints and Design website across devices' }],
  },
];

export const statement =
  'Whether it\u2019s a matchday poster going out in an hour or a full {teal:web rebuild} {icon:face} launching in a month, I design work that reads clearly {icon:tag} and ships on time.';

export const archive = {
  title: 'An archive of\nwork in progress.',
  lede: 'Client campaigns sit next to the personal type and poster experiments that keep my eye sharp between briefs.',
  tabs: {
    client: ['matchday', 'crashgame', 'winners', 'rovex', 'techpressive', 'halftone'],
    personal: ['swirl', 'rainbow', 'burst', 'neon', 'map', 'party'],
  },
};

export const community = {
  title: 'Built for founders\nand teams who ship',
  sub: 'Betting platforms, car rental brands, print shops and small teams who needed design that keeps up with them.',
};

export const services = [
  { title: 'Social media design', text: 'Matchday posters, promo creative and daily announcement templates built for fast, on-brand turnaround.', cta: 'See social work' },
  { title: 'Web design', text: 'Responsive, booking- and store-ready websites, from first wireframe to launch.', cta: 'See web work' },
  { title: 'Brand revamp', text: 'A new visual identity for a business that\u2019s outgrown its old one \u2014 logo, colour, type and guidelines.', cta: 'Start a project' },
];

export const deliverables = ['Poster templates', 'Social calendar', 'Brand guidelines', 'Responsive website', 'Launch assets'];

export const clients = ['KwikBet', 'Rovex Car Rentals', 'Techpressive Prints & Design'];

export const toolkit: [string, string][] = [
  ['Ai', 'Illustrator'], ['Ps', 'Photoshop'], ['Id', 'InDesign'], ['Xd', 'XD'], ['Pr', 'Premiere Pro'], ['Fg', 'Figma'],
];

export const pricing = [
  { name: 'Social pack', amount: '250', unit: '/mo', note: 'A month of matchday, promo and announcement templates' },
  { name: 'Web design', amount: '900', unit: '', note: 'A full responsive website, brief to launch', popular: true },
  { name: 'Brand revamp', amount: '600', unit: '', note: 'Logo, colour, type and a short guideline sheet' },
];

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'Archive', href: '/#archive', spark: true },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' },
];
