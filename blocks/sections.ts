import type { Block, Field } from 'payload';
import { linkTarget } from '../lib/validate';
import { COPY, DEFAULT_PROCESS, DEFAULT_ROLES, DEFAULT_STATS } from '../lib/home-copy';

/**
 * Page sections. Every page (Pages collection) is an ordered list of these; the editor
 * opens each one in its own panel (components/admin/SectionsField.tsx). The front end
 * renders them in components/sections/RenderSections.tsx, keyed by `slug`.
 *
 * Every section also gets shared fields, added by `section()` below:
 *  - style: background, text and accent colours, spacing, height, width, alignment, visibility
 *  - hidden: switched from the section list or panel header; hidden sections are skipped
 *  - anchor: the #id menu links jump to
 */

const link = (name: string, label: string, defaults: { label?: string; url?: string } = {}): Field => ({
  name,
  label,
  type: 'group',
  admin: { custom: { control: 'link' } },
  fields: [
    { type: 'row', fields: [
      { name: 'label', type: 'text', defaultValue: defaults.label, admin: { width: '40%' } },
      { name: 'url', type: 'text', defaultValue: defaults.url, validate: linkTarget, admin: { width: '60%', description: 'A page (/about), a section (/#contact) or a full URL.' } },
    ] },
    // Two button styles site-wide: Primary (a solid fill, colour picked for the background) and
    // Secondary (outline). The stored values predate that and are kept for existing content.
    { name: 'variant', label: 'Style', type: 'select', defaultValue: 'default', options: [
      { label: 'Primary', value: 'default' }, { label: 'Primary · white', value: 'light' }, { label: 'Primary · dark', value: 'dark' },
      { label: 'Primary · red', value: 'accent' }, { label: 'Secondary · outline', value: 'outline' }, { label: 'Text link', value: 'ghost' },
    ] },
  ],
});

const hexOrEmpty = (v: unknown) => !v || (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) || 'Use a hex colour like #E8352B';

/** Per-section style overrides. Empty values keep the section's designed look. */
const styleGroup: Field = {
  name: 'style',
  type: 'group',
  admin: { custom: { styleTab: true }, description: 'Leave anything empty to keep the design’s default.' },
  fields: [
    { type: 'row', fields: [
      { name: 'background', type: 'text', validate: hexOrEmpty, admin: { width: '33%', custom: { control: 'colour' } } },
      { name: 'text', label: 'Text colour', type: 'text', validate: hexOrEmpty, admin: { width: '33%', custom: { control: 'colour' } } },
      { name: 'accent', label: 'Accent', type: 'text', validate: hexOrEmpty, admin: { width: '33%', custom: { control: 'colour' } } },
    ] },
    { type: 'row', fields: [
      { name: 'paddingTop', label: 'Space above', type: 'number', min: 0, max: 320, admin: { width: '33%', step: 4, custom: { control: 'range', unit: 'px' } } },
      { name: 'paddingBottom', label: 'Space below', type: 'number', min: 0, max: 320, admin: { width: '33%', step: 4, custom: { control: 'range', unit: 'px' } } },
      { name: 'minHeight', label: 'Minimum height', type: 'number', min: 0, max: 100, admin: { width: '33%', step: 5, custom: { control: 'range', unit: 'vh' } } },
    ] },
    { type: 'row', fields: [
      { name: 'width', label: 'Content width', type: 'select', defaultValue: 'default', admin: { width: '33%' }, options: [
        { label: 'Default', value: 'default' }, { label: 'Narrow', value: 'narrow' }, { label: 'Wide', value: 'wide' }, { label: 'Full width', value: 'full' },
      ] },
      { name: 'align', label: 'Alignment', type: 'select', defaultValue: 'default', admin: { width: '33%' }, options: [
        { label: 'Default', value: 'default' }, { label: 'Left', value: 'left' }, { label: 'Centre', value: 'center' },
      ] },
      { name: 'visibility', label: 'Show on', type: 'select', defaultValue: 'all', admin: { width: '33%' }, options: [
        { label: 'All screens', value: 'all' }, { label: 'Desktop only', value: 'desktop' }, { label: 'Mobile only', value: 'mobile' },
      ] },
    ] },
  ],
};

const eyebrow = (defaultValue?: string): Field => ({ name: 'eyebrow', type: 'text', defaultValue, admin: { description: 'The small line above the heading.' } });
const heading = (defaultValue?: string, required = false): Field => ({ name: 'heading', type: 'text', defaultValue, required });
const intro: Field = { name: 'intro', type: 'textarea' };

type SectionDef = Omit<Block, 'fields'> & { fields: Field[]; anchor?: string; summary?: string; description?: string };

/** Adds the shared fields and admin metadata to a section definition. */
const section = ({ anchor, summary, description, fields, admin, ...block }: SectionDef): Block => ({
  // Wireframe thumbnail shown in the “Add section” picker (public/cms/sections/*.svg).
  imageURL: `/cms/sections/${block.slug}.svg`,
  imageAltText: `${typeof block.labels?.singular === 'string' ? block.labels.singular : block.slug} section layout`,
  ...block,
  admin: {
    ...admin,
    disableBlockName: true,
    // Read by the section list: which field to show as the row's summary, and a one-line explanation.
    custom: { summary: summary ?? 'heading', description },
  },
  fields: [
    ...fields,
    styleGroup,
    { name: 'hidden', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
    { name: 'anchor', type: 'text', defaultValue: anchor, admin: { description: 'Optional. Lets menu links jump here, e.g. “work” for /#work. Letters, numbers and dashes only.' }, validate: (v: unknown) => !v || (typeof v === 'string' && /^[a-z0-9-]+$/i.test(v)) || 'Use letters, numbers and dashes only' },
  ],
});

export const HeroSection = section({
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  summary: 'headline',
  description: 'Big headline with a word-by-word reveal, a button, the scrolling client names and three project cards.',
  fields: [
    { name: 'trustedText', label: 'Clients line', type: 'text', defaultValue: COPY.trustedText, admin: { description: 'Above the headline. {count} becomes the number of clients. Leave empty to hide.' } },
    { name: 'headline', type: 'text', required: true, admin: { description: 'Wrap words in *asterisks* to give them a hand-drawn underline, e.g. I craft *experiences*.' } },
    { name: 'intro', type: 'textarea' },
    { name: 'ctaText', label: 'Button prompt', type: 'text', defaultValue: COPY.heroCtaText, admin: { description: 'The short line beside the button.' } },
    link('button', 'Button', { url: '#contact' }),
    { name: 'clientsLabel', label: 'Clients strip label', type: 'text', defaultValue: COPY.clientsLabel, admin: { description: 'Shown at the start of the strip of client names.' } },
    {
      name: 'clients',
      type: 'array',
      admin: { description: 'The names scrolling under the button.', initCollapsed: true },
      fields: [{ type: 'row', fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'url', type: 'text', admin: { width: '50%' } },
      ] }],
    },
    { name: 'projects', label: 'Project cards', type: 'relationship', relationTo: 'projects', hasMany: true, maxRows: 3, admin: { description: 'Up to three. Leave empty to use the first three featured projects.' } },
  ],
});

export const WorkShowcaseSection = section({
  slug: 'workShowcase',
  labels: { singular: 'Work showcase', plural: 'Work showcases' },
  anchor: 'work',
  description: 'Selected projects: one large case study with client, role and outcome, then smaller cards side by side (or the older carousel).',
  fields: [
    eyebrow(COPY.workEyebrow),
    heading(COPY.workHeading),
    intro,
    { name: 'layout', type: 'select', defaultValue: 'feature', options: [
      { label: 'Case studies: one large, then cards', value: 'feature' },
      { label: 'Carousel', value: 'carousel' },
    ] },
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true, admin: { description: 'In order: the first is the large case study. Leave empty to use every featured project.' } },
    { name: 'extraImages', label: 'Extra wall images', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'Added to the project covers on the tilted wall.', condition: (_, s) => s?.layout === 'carousel' } },
    { name: 'showWall', label: 'Show the tilted wall above', type: 'checkbox', defaultValue: false, admin: { condition: (_, s) => s?.layout === 'carousel' } },
    link('link', 'Link under the carousel', { label: COPY.workLinkLabel, url: '/work' }),
  ],
});

export const AboutBannerSection = section({
  slug: 'aboutBanner',
  labels: { singular: 'About banner', plural: 'About banners' },
  anchor: 'about',
  description: 'About you. “Portrait”: a tilted portrait with sticker labels (and a second photo to switch the mood) beside a two-line heading, a short intro and a link. “Editorial”: portrait and name on the left, and on the right tabs (Overview, Expertise, Impact) that switch a heading, a short text and a table of figures that count up. “Red banner”: portrait on red with intro, expertise, services and stats.',
  fields: [
    { name: 'layout', type: 'select', defaultValue: 'editorial', options: [
      { label: 'Portrait with stickers', value: 'portrait' },
      { label: 'Editorial with tabs', value: 'editorial' },
      { label: 'Red banner', value: 'banner' },
    ] },
    eyebrow(COPY.aboutEyebrow),
    { name: 'role', type: 'text', defaultValue: 'Senior Graphic & Brand Designer', admin: { description: 'Under your name (editorial layout).' } },
    {
      name: 'tabs',
      type: 'array',
      maxRows: 3,
      admin: { initCollapsed: true, description: 'Editorial layout: each tab swaps the heading, text and table on the right.' },
      fields: [
        { type: 'row', fields: [
          { name: 'label', type: 'text', required: true, admin: { width: '40%', placeholder: 'Overview' } },
          { name: 'heading', type: 'text', required: true, admin: { width: '60%', placeholder: '5+ years of experience' } },
        ] },
        { name: 'text', type: 'textarea' },
        {
          name: 'rows',
          label: 'Table',
          type: 'array',
          maxRows: 6,
          admin: { description: 'Numbers at the start of a value (50+, 3.5M+, 100%) count up when the section comes into view.' },
          fields: [{ type: 'row', fields: [
            { name: 'value', type: 'text', required: true, admin: { width: '35%', placeholder: '50+' } },
            { name: 'label', type: 'text', required: true, admin: { width: '65%', placeholder: 'Brands launched' } },
          ] }],
        },
      ],
    },
    { name: 'greeting', type: 'text', defaultValue: COPY.aboutGreeting, admin: { description: 'Followed by your first name, e.g. “Hi, I’m” → “Hi, I’m Humphrey,”.' } },
    heading(undefined, true),
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'A cut-out portrait (transparent PNG or WebP) looks best. Portrait layout: any portrait photo works.' } },
    { name: 'moodPhoto', label: 'Second photo (mood)', type: 'upload', relationTo: 'media', admin: { description: 'Portrait layout: a second portrait. A “Change the mood” button swaps between the two.' } },
    { name: 'stickers', type: 'text', hasMany: true, maxRows: 3, admin: { description: 'Portrait layout: short labels stuck on the photo, e.g. “Always curious”. The site tagline is added on its own.' } },
    { name: 'caption', type: 'text', admin: { description: 'Portrait layout: a small line under the photo, e.g. “Designer by practice. Explorer by nature.”' } },
    { name: 'intro', type: 'textarea', defaultValue: COPY.aboutIntro, admin: { description: 'Continues the greeting, e.g. “a Senior Designer specialising in”. The list below finishes it.' } },
    { name: 'expertise', type: 'text', hasMany: true, admin: { description: 'Short points, one per line. Type one and press Enter.' } },
    { name: 'servicesHeading', type: 'text', defaultValue: COPY.aboutServicesHeading },
    { name: 'services', label: 'Services to show', type: 'relationship', relationTo: 'services', hasMany: true, maxRows: 6, admin: { description: 'Red banner layout: pick from Content → Services; each links to its own page. Leave empty to list every published service.' } },
    link('cta', 'Main button', { label: COPY.aboutCta, url: '/#contact' }),
    {
      name: 'stats',
      type: 'array',
      maxRows: 3,
      defaultValue: DEFAULT_STATS,
      fields: [{ type: 'row', fields: [
        { name: 'value', type: 'text', required: true, admin: { width: '30%', placeholder: '3+' } },
        { name: 'label', type: 'text', required: true, admin: { width: '70%' } },
      ] }],
    },
    { name: 'bigName', type: 'text', admin: { description: 'The giant word at the bottom. Defaults to your first name.' } },
    link('link', 'Link', { label: COPY.aboutLinkLabel, url: '/about' }),
  ],
});

export const AudienceSection = section({
  slug: 'audience',
  labels: { singular: 'Who it’s for', plural: 'Who it’s for' },
  anchor: 'for-who',
  description: '“This work is for you if you’re a …” with a list that rolls past as you scroll.',
  fields: [
    { type: 'row', fields: [
      { ...heading(COPY.rolesHeading), admin: { width: '60%' } } as Field,
      { name: 'lead', type: 'text', defaultValue: COPY.rolesLead, admin: { width: '40%' } },
    ] },
    { name: 'roles', type: 'text', hasMany: true, defaultValue: DEFAULT_ROLES, admin: { description: 'Finishes the sentence. Type one and press Enter.' } },
  ],
});

export const ProcessSection = section({
  slug: 'process',
  labels: { singular: 'Process', plural: 'Process' },
  anchor: 'process',
  description: 'Your way of working as a numbered timeline (heading on the left, each step with its timing and points), or as steps in a row, or stacking cards.',
  fields: [
    eyebrow(COPY.processEyebrow),
    heading(COPY.processHeading),
    { name: 'lead', type: 'text', admin: { description: 'A line under the heading, e.g. “Vision → Design → Performance”.' } },
    { name: 'layout', type: 'select', defaultValue: 'circuit', options: [
      // 'circuit' is the stored value for the timeline; it predates the redesign
      { label: 'Numbered timeline', value: 'circuit' },
      { label: 'Steps in a row', value: 'steps' },
      { label: 'Stacking cards', value: 'stack' },
    ] },
    {
      name: 'steps',
      type: 'array',
      maxRows: 6,
      defaultValue: DEFAULT_PROCESS,
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'icon', type: 'select', defaultValue: 'compass', options: [
          { label: 'Compass (strategy)', value: 'compass' }, { label: 'Pen (design)', value: 'pen' },
          { label: 'Chat (feedback)', value: 'chat' }, { label: 'Rocket (launch)', value: 'rocket' },
          { label: 'Layers', value: 'layers' }, { label: 'Spark', value: 'spark' },
          { label: 'Light bulb (discovery)', value: 'bulb' }, { label: 'Chart (strategy)', value: 'chart' },
          { label: 'Sliders (execution)', value: 'sliders' }, { label: 'Check (delivery)', value: 'checkCircle' },
        ] },
        { name: 'duration', label: 'Timeline', type: 'text', admin: { description: 'How long this phase usually takes, e.g. “2–3 days”. Shown beside the step’s title (timeline layout).' } },
        { name: 'description', type: 'textarea' },
        { name: 'points', type: 'text', hasMany: true },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Leave empty to use a project cover.', condition: (data, _, { blockData }) => (blockData as { layout?: string } | undefined)?.layout === 'stack' } },
      ],
    },
  ],
});

export const ServicesSection = section({
  slug: 'services',
  labels: { singular: 'Services', plural: 'Services' },
  anchor: 'services',
  description: 'Your services (Content → Services) as priced cards that open each service’s page, or as a 3D deck of glass cards. “Start a project” opens the contact form with that service chosen.',
  fields: [
    eyebrow(COPY.servicesEyebrow),
    heading(COPY.servicesHeading),
    intro,
    { name: 'layout', type: 'select', defaultValue: 'deck', options: [
      { label: '3D card deck', value: 'deck' },
      { label: 'Priced cards', value: 'cards' },
    ] },
    { name: 'ctaLabel', label: 'Card button', type: 'text', defaultValue: 'Inquire for this service', admin: { description: 'The button inside an opened card.' } },
    { name: 'pageLinkLabel', label: 'Card link', type: 'text', defaultValue: 'See the service', admin: { description: 'The link on each card to that service’s own page.' } },
    { name: 'services', label: 'Services to show', type: 'relationship', relationTo: 'services', hasMany: true, admin: { description: 'Pick from Content → Services (each has its own page). Leave empty to show every published service.' } },
    { name: 'extras', label: 'A little extra', type: 'text', hasMany: true, admin: { description: 'Small add-ons shown as chips under the cards, e.g. “Logo animation”.' } },
    {
      name: 'labels',
      label: 'Small wording',
      type: 'group',
      admin: { description: 'Leave anything empty to keep the default shown in grey.' },
      fields: [
        { type: 'row', fields: [
          { name: 'featured', label: 'Featured flag', type: 'text', admin: { width: '33%', placeholder: 'Featured service' } },
          { name: 'extras', label: 'Extras heading', type: 'text', admin: { width: '33%', placeholder: 'A little extra' } },
          { name: 'deckHint', label: 'Deck hint', type: 'text', admin: { width: '33%', placeholder: 'Pick a card to see what’s included.', condition: (_, s) => s?.layout !== 'cards' } },
        ] },
      ],
    },
    { name: 'showWhatsApp', label: 'Show “Or chat on WhatsApp” under each card', type: 'checkbox', defaultValue: true },
  ],
});

export const TestimonialsSection = section({
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  description: 'Client quotes as cards in a light horizontal scroll: the key sentence large, the rest of the quote, photo, name and company logo. Hidden until you add a quote.',
  fields: [
    eyebrow(COPY.testimonialsEyebrow),
    heading(COPY.testimonialsHeading),
    {
      name: 'items',
      label: 'Testimonials',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'highlight', label: 'Key sentence', type: 'text', admin: { description: 'Shown large at the top. Leave empty to show only the quote.' } },
        { name: 'quote', type: 'textarea', required: true },
        { type: 'row', fields: [
          { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
          { name: 'title', type: 'text', admin: { width: '50%', placeholder: 'Marketing lead' } },
        ] },
        { type: 'row', fields: [
          { name: 'company', type: 'text', admin: { width: '50%', placeholder: 'KwikBet' } },
          { name: 'logo', label: 'Company logo', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
        ] },
        { name: 'photo', type: 'upload', relationTo: 'media' },
        { name: 'rating', type: 'number', min: 1, max: 5, admin: { step: 1, description: 'Star rating from the client, 1–5. Leave empty to show no stars.' } },
      ],
    },
  ],
});

export const ContactSection = section({
  slug: 'contact',
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  anchor: 'contact',
  description: 'Full-width closing section: heading, who it’s for, availability, a booking button and the enquiry form (messages arrive under Enquiries). Email, WhatsApp and socials are in the footer.',
  fields: [
    eyebrow(COPY.contactEyebrow),
    heading(COPY.contactHeading),
    intro,
    { name: 'rolesLead', label: 'Who it’s for: lead', type: 'text', defaultValue: COPY.contactRolesLead },
    { name: 'roles', label: 'Who it’s for', type: 'text', hasMany: true, admin: { description: 'Shown as tags, e.g. “startup founder”. Type one and press Enter.' } },
    { name: 'showAvailability', label: 'Show availability (from Site settings)', type: 'checkbox', defaultValue: true },
    // the contact links moved to the footer (October 2026); kept so older pages still validate
    { name: 'showSocials', label: 'Show social links (from Site settings)', type: 'checkbox', defaultValue: true, admin: { hidden: true } },
    { name: 'bookLabel', label: 'Booking button', type: 'text', admin: { placeholder: 'Book a 15-minute call', description: 'Shown when Site settings has a booking link.' } },
    {
      name: 'form',
      label: 'Form',
      type: 'group',
      admin: { description: 'The wording on the enquiry form. Leave anything empty to keep the default shown in grey.' },
      fields: [
        { type: 'row', fields: [
          { name: 'serviceLabel', label: 'Service question', type: 'text', admin: { width: '50%', placeholder: 'What do you need?' } },
          { name: 'submitLabel', label: 'Button', type: 'text', admin: { width: '50%', placeholder: 'Send message' } },
        ] },
        { name: 'messagePlaceholder', label: 'Message hint', type: 'text', admin: { placeholder: 'What is it, who is it for, and when do you need it?' } },
        { name: 'successText', label: 'After sending', type: 'text', admin: { placeholder: 'I usually reply within one working day.' } },
        { type: 'row', fields: [
          { name: 'privacyNote', label: 'Privacy line', type: 'text', defaultValue: 'Your details are only used to reply to you.', admin: { width: '65%' } },
          { name: 'privacyUrl', label: 'Links to', type: 'text', defaultValue: '/cookies', admin: { width: '35%' } },
        ] },
      ],
    },
  ],
});

export const ProjectGridSection = section({
  slug: 'projectGrid',
  labels: { singular: 'Project grid', plural: 'Project grids' },
  description: 'Every published project as cards, with discipline filters.',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Work' },
    intro,
    { name: 'showFilters', type: 'checkbox', defaultValue: true },
    { name: 'onlyFeatured', label: 'Featured projects only', type: 'checkbox', defaultValue: false },
  ],
});

export const ProfileSection = section({
  slug: 'profile',
  labels: { singular: 'Profile', plural: 'Profiles' },
  description: 'Long-form about: bio, portrait, experience, skills, tools and a CV download.',
  fields: [
    eyebrow('About'),
    heading(undefined, true),
    { name: 'body', type: 'richText' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'experience',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ type: 'row', fields: [
        { name: 'role', type: 'text', required: true, admin: { width: '40%' } },
        { name: 'company', type: 'text', admin: { width: '35%' } },
        { name: 'years', type: 'text', admin: { width: '25%', placeholder: '2023 – now' } },
      ] }],
    },
    { type: 'row', fields: [
      { name: 'skills', type: 'text', hasMany: true, admin: { width: '50%' } },
      { name: 'tools', type: 'text', hasMany: true, admin: { width: '50%' } },
    ] },
    { name: 'cv', label: 'CV / PDF', type: 'upload', relationTo: 'media' },
    link('button', 'Button', { label: 'Work with me', url: '/#contact' }),
  ],
});

export const RichTextSection = section({
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text' },
  description: 'A heading and formatted text.',
  fields: [eyebrow(), heading(), { name: 'body', type: 'richText' }, { name: 'align', type: 'select', defaultValue: 'left', options: ['left', 'center'] }],
});

export const MediaSection = section({
  slug: 'mediaSection',
  labels: { singular: 'Image or video', plural: 'Images or videos' },
  summary: 'caption',
  description: 'One large image or looping video that grows as it scrolls into view.',
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    { name: 'width', type: 'select', defaultValue: 'wide', options: [{ label: 'Wide', value: 'wide' }, { label: 'Full bleed', value: 'full' }] },
  ],
});

export const CtaSection = section({
  slug: 'ctaBanner',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  description: 'A bold banner with a heading, a line of text and a button.',
  fields: [heading(undefined, true), { name: 'text', type: 'textarea' }, link('button', 'Button', { label: 'Start a project', url: '/#contact' })],
});

export const FaqSection = section({
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  description: 'Questions and answers that open one at a time.',
  fields: [
    eyebrow('Questions'),
    heading('Good to know'),
    {
      name: 'items',
      label: 'Questions',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'question', type: 'text', required: true }, { name: 'answer', type: 'textarea', required: true }],
    },
  ],
});

export const ToolsSection = section({
  slug: 'tools',
  labels: { singular: 'Tools', plural: 'Tools' },
  description: 'The tools you work with, gathered from your projects’ Tools lists, with how many projects used each.',
  fields: [
    eyebrow('Tools'),
    heading('Tools I work with'),
    intro,
    { name: 'extra', label: 'Also show', type: 'text', hasMany: true, admin: { description: 'Tools that aren’t on a project yet. The rest come from your projects.' } },
    { name: 'showCounts', label: 'Show how many projects used each', type: 'checkbox', defaultValue: true },
  ],
});

export const ShowreelSection = section({
  slug: 'showreel',
  labels: { singular: 'Showreel', plural: 'Showreels' },
  description: 'A wide video still with a play button; the reel opens full screen.',
  fields: [
    eyebrow('Showreel'),
    heading('A quick look at my work'),
    { name: 'text', type: 'textarea', defaultValue: 'A short reel of recent work, from first sketch to final frame.' },
    { name: 'video', type: 'upload', relationTo: 'media', admin: { description: 'An uploaded video file. Or use a YouTube/Vimeo link below instead.' } },
    { name: 'link', label: 'YouTube or Vimeo link', type: 'text', admin: { description: 'Used when there’s no uploaded video.' } },
    { name: 'poster', label: 'Still image', type: 'upload', relationTo: 'media', admin: { description: 'Shown before it plays. Defaults to the first project cover.' } },
    { name: 'buttonLabel', label: 'Button', type: 'text', defaultValue: 'Watch the showreel' },
  ],
});

export const InsightsSection = section({
  slug: 'insights',
  labels: { singular: 'Insights', plural: 'Insights' },
  description: 'Your latest insights (articles) as cards, with a link to all of them.',
  fields: [
    eyebrow('Insights'),
    heading('Insights & ideas'),
    { name: 'count', label: 'How many', type: 'number', defaultValue: 3, min: 1, max: 6 },
    link('button', 'Button', { label: 'Read all insights', url: '/insights' }),
  ],
});

export const ResumeSection = section({
  slug: 'resume',
  labels: { singular: 'Résumé', plural: 'Résumés' },
  summary: 'name',
  description: 'A full CV on one page: name, role and a download button beside an availability card, figures, profile, roles, selected work, skills, education and a closing call. An “At a glance” menu follows down the side.',
  fields: [
    { type: 'tabs', tabs: [
      {
        label: 'Intro',
        fields: [
          eyebrow('Résumé / The experience behind the ideas'),
          { name: 'name', type: 'text', required: true, admin: { description: 'Wrap a word in *asterisks* for the serif accent, e.g. Humphrey *Kibet.*' } },
          { name: 'role', type: 'text' },
          { name: 'intro', type: 'textarea' },
          { type: 'row', fields: [
            { name: 'currentLead', label: 'Current role: lead', type: 'text', defaultValue: 'Currently', admin: { width: '30%' } },
            { name: 'current', label: 'Current role', type: 'text', admin: { width: '70%', placeholder: 'Design Lead at BrighterMonday Kenya' } },
          ] },
          { type: 'row', fields: [
            { name: 'cv', label: 'CV file (PDF)', type: 'upload', relationTo: 'media', admin: { width: '50%', description: 'Adds the download buttons. Leave empty to hide them.' } },
            { name: 'cvLabel', label: 'Download button', type: 'text', defaultValue: 'Download résumé', admin: { width: '50%' } },
          ] },
          {
            name: 'card',
            label: 'Availability card',
            type: 'group',
            admin: { description: 'The dark card beside your name. Leave the heading empty to hide it.' },
            fields: [
              { name: 'kicker', type: 'text', admin: { placeholder: 'Based in Kenya · Open to global roles' } },
              { name: 'heading', type: 'text', admin: { placeholder: 'Nairobi roots. *Global outlook.*' } },
              { name: 'text', type: 'textarea' },
              { name: 'topicsLabel', label: 'Topics label', type: 'text', defaultValue: 'Let’s talk about' },
              { name: 'topics', type: 'text', hasMany: true, admin: { description: 'Type one and press Enter.' } },
              { name: 'workTypes', label: 'Ways of working', type: 'text', hasMany: true, admin: { description: 'Shown as outlined chips, e.g. Remote-first, Full-time, Contract.' } },
              { name: 'place', label: 'Location line', type: 'text', admin: { placeholder: 'Nairobi, Kenya · UTC+3' } },
            ],
          },
          link('cardLink', 'Card link', { label: 'Discuss an opportunity', url: '/#contact' }),
          {
            name: 'stats',
            label: 'Figures',
            type: 'array',
            maxRows: 4,
            admin: { initCollapsed: true, description: 'A row of figures under the intro.' },
            fields: [{ type: 'row', fields: [
              { name: 'value', type: 'text', required: true, admin: { width: '30%', placeholder: '5+' } },
              { name: 'label', type: 'text', required: true, admin: { width: '70%', placeholder: 'years in brand design' } },
            ] }],
          },
        ],
      },
      {
        label: 'Profile',
        fields: [
          { name: 'profileHeading', label: 'Heading', type: 'text', defaultValue: 'Profile. *In short.*' },
          { name: 'profile', label: 'Text', type: 'textarea', admin: { description: 'A blank line starts a new paragraph.' } },
          { name: 'quote', type: 'textarea', admin: { description: 'Optional. Set large in the serif italic.' } },
          {
            name: 'pillars',
            label: 'What you bring',
            type: 'array',
            maxRows: 3,
            admin: { initCollapsed: true },
            fields: [
              { name: 'title', type: 'text', required: true },
              { name: 'text', type: 'textarea' },
            ],
          },
        ],
      },
      {
        label: 'Experience',
        fields: [
          { name: 'xpHeading', label: 'Heading', type: 'text', defaultValue: 'Experience. *Hands on.*' },
          {
            name: 'jobs',
            label: 'Roles',
            type: 'array',
            admin: { initCollapsed: true, description: 'Newest first.' },
            fields: [
              { type: 'row', fields: [
                { name: 'role', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'company', type: 'text', required: true, admin: { width: '50%' } },
              ] },
              { type: 'row', fields: [
                { name: 'dates', type: 'text', admin: { width: '34%', placeholder: 'Aug 2025 – Present' } },
                { name: 'place', label: 'Location', type: 'text', admin: { width: '33%', placeholder: 'Nairobi, Kenya' } },
                { name: 'mode', label: 'Arrangement', type: 'text', admin: { width: '33%', placeholder: 'Hybrid' } },
              ] },
              { name: 'about', label: 'About the company', type: 'text', admin: { placeholder: 'Career and recruitment platform' } },
              { name: 'summary', label: 'In one line', type: 'text', admin: { description: 'Optional. A bold line above the points.' } },
              { name: 'points', type: 'text', hasMany: true, admin: { description: 'What you did and what changed. Type one and press Enter.' } },
              { type: 'row', fields: [
                { name: 'linkLabel', type: 'text', admin: { width: '40%', placeholder: 'See the campaign' } },
                { name: 'linkUrl', type: 'text', admin: { width: '60%', placeholder: '/work/future-of-work' } },
              ] },
            ],
          },
        ],
      },
      {
        label: 'Work & skills',
        fields: [
          { name: 'workHeading', label: 'Work heading', type: 'text', defaultValue: 'The work, *made visible.*' },
          { name: 'workIntro', label: 'Work intro', type: 'textarea' },
          { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true, maxRows: 4, admin: { description: 'Up to four. Leave empty to show the first featured projects.' } },
          link('workLink', 'Link under the work', { label: 'See all work', url: '/work' }),
          { name: 'skillsHeading', label: 'Skills heading', type: 'text', defaultValue: 'Skills. *And the tools.*' },
          {
            name: 'skillGroups',
            label: 'Skill groups',
            type: 'array',
            admin: { initCollapsed: true },
            fields: [
              { name: 'label', type: 'text', required: true },
              { name: 'items', type: 'text', hasMany: true, admin: { description: 'Type one and press Enter.' } },
            ],
          },
        ],
      },
      {
        label: 'Education',
        fields: [
          { name: 'eduHeading', label: 'Heading', type: 'text', defaultValue: 'Education. *Still learning.*' },
          {
            name: 'schools',
            label: 'Education',
            type: 'array',
            admin: { initCollapsed: true },
            fields: [
              { type: 'row', fields: [
                { name: 'qualification', type: 'text', required: true, admin: { width: '60%' } },
                { name: 'years', type: 'text', admin: { width: '40%', placeholder: '2014 – 2017' } },
              ] },
              { type: 'row', fields: [
                { name: 'school', type: 'text', required: true, admin: { width: '60%' } },
                { name: 'place', label: 'Location', type: 'text', admin: { width: '40%' } },
              ] },
              { name: 'note', type: 'text' },
            ],
          },
          {
            name: 'certs',
            label: 'Certifications',
            type: 'array',
            admin: { initCollapsed: true },
            fields: [
              { type: 'row', fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
                { name: 'year', type: 'text', admin: { width: '40%' } },
              ] },
              { name: 'issuer', type: 'text' },
              { name: 'note', type: 'textarea' },
            ],
          },
        ],
      },
      {
        label: 'Closing',
        fields: [
          { name: 'closingKicker', label: 'Eyebrow', type: 'text', defaultValue: 'The next chapter' },
          { name: 'closingHeading', label: 'Heading', type: 'text', defaultValue: 'Building a brand? *Let’s talk.*' },
          { name: 'closingText', label: 'Text', type: 'textarea' },
          link('closingLink', 'Button', { label: 'Let’s talk about it', url: '/#contact' }),
          { name: 'showEmail', label: 'Show your email (from Site settings)', type: 'checkbox', defaultValue: true },
          { name: 'showLinkedIn', label: 'Show LinkedIn (from Site settings → Socials)', type: 'checkbox', defaultValue: true },
        ],
      },
    ] },
  ],
});

export const pageSections = [
  HeroSection,
  WorkShowcaseSection,
  AboutBannerSection,
  AudienceSection,
  ProcessSection,
  ServicesSection,
  TestimonialsSection,
  ContactSection,
  ProjectGridSection,
  ProfileSection,
  RichTextSection,
  MediaSection,
  CtaSection,
  FaqSection,
  ToolsSection,
  ShowreelSection,
  InsightsSection,
  ResumeSection,
];
