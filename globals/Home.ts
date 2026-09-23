import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';
import { COPY } from '../lib/home-copy';

/** Tabs follow the order of the sections on the homepage. */
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Pages', description: 'Every section of the homepage, top to bottom. Use the preview on the right to see changes as you type.' },
  access: { read: anyone, update: authenticated },
  versions: { drafts: { autosave: { interval: 800 } }, max: 20 },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'headline', type: 'text', required: true },
            { name: 'intro', type: 'textarea' },
            { name: 'heroCtaText', label: 'Button prompt', type: 'text', defaultValue: COPY.heroCtaText, admin: { description: 'The short line beside the “Start a project” button.' } },
            { name: 'trustedText', label: 'Clients line', type: 'text', defaultValue: COPY.trustedText, admin: { description: 'Shown above the headline. {count} is replaced with the number of clients. Clear it to hide the line.' } },
            { name: 'heroImages', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 5, admin: { description: 'Extra images for the tilted work wall. Leave empty to use the project covers only.' } },
          ],
        },
        {
          label: 'Clients',
          description: 'The names that scroll across the hero.',
          fields: [
            {
              name: 'clients',
              type: 'array',
              fields: [
                { type: 'row', fields: [
                  { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                  { name: 'url', type: 'text', admin: { width: '50%' } },
                ] },
                { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Optional. A single-colour SVG or PNG looks best.' } },
              ],
            },
          ],
        },
        {
          label: 'Selected work',
          description: 'Tick “Featured” on a project to show it here and in the hero cards. Drag projects in the Projects list to reorder.',
          fields: [
            { name: 'workHeading', type: 'text', defaultValue: COPY.workHeading },
            { name: 'workIntro', type: 'textarea' },
            { name: 'workLinkLabel', type: 'text', defaultValue: COPY.workLinkLabel },
          ],
        },
        {
          label: 'About',
          description: 'The red “Hi, I’m …” section. The headline and photo come from Pages → About page.',
          fields: [
            { type: 'row', fields: [
              { name: 'aboutGreeting', type: 'text', defaultValue: COPY.aboutGreeting, admin: { width: '50%', description: 'Followed by your first name.' } },
              { name: 'aboutLinkLabel', type: 'text', defaultValue: COPY.aboutLinkLabel, admin: { width: '50%' } },
            ] },
            {
              name: 'stats',
              type: 'array',
              maxRows: 3,
              admin: { description: 'Three numbers, e.g. years working, projects delivered, typical turnaround.' },
              fields: [
                { type: 'row', fields: [
                  { name: 'value', type: 'text', required: true, admin: { width: '30%', placeholder: '3+' } },
                  { name: 'label', type: 'text', required: true, admin: { width: '70%' } },
                ] },
              ],
            },
          ],
        },
        {
          label: 'Who it’s for',
          fields: [
            { type: 'row', fields: [
              { name: 'rolesHeading', type: 'text', defaultValue: COPY.rolesHeading, admin: { width: '60%' } },
              { name: 'rolesLead', type: 'text', defaultValue: COPY.rolesLead, admin: { width: '40%' } },
            ] },
            { name: 'audienceRoles', type: 'text', hasMany: true, admin: { description: 'Finishes the sentence. The list rolls past as visitors scroll.' } },
          ],
        },
        {
          label: 'How it works',
          fields: [
            { name: 'processEyebrow', type: 'text', defaultValue: COPY.processEyebrow },
            { name: 'processHeading', type: 'text', defaultValue: COPY.processHeading },
            {
              name: 'process',
              type: 'array',
              maxRows: 6,
              admin: { description: 'The stacking step cards.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { name: 'points', type: 'text', hasMany: true },
                { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Leave empty to use a project cover.' } },
              ],
            },
          ],
        },
        {
          label: 'What I do',
          fields: [
            { name: 'servicesEyebrow', type: 'text', defaultValue: COPY.servicesEyebrow },
            { name: 'servicesHeading', type: 'text', defaultValue: COPY.servicesHeading },
            { name: 'servicesIntro', type: 'textarea' },
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { name: 'deliverables', type: 'text', hasMany: true },
                { type: 'row', fields: [
                  { name: 'priceFrom', type: 'number', admin: { width: '33%', description: 'Leave empty to hide the price' } },
                  { name: 'currency', type: 'select', defaultValue: 'KES', options: ['KES', 'USD'], admin: { width: '33%' } },
                  { name: 'unit', type: 'text', admin: { width: '33%', placeholder: '/month' } },
                ] },
              ],
            },
          ],
        },
        {
          label: 'Testimonials',
          description: 'The section appears once there is at least one testimonial.',
          fields: [
            { type: 'row', fields: [
              { name: 'testimonialsEyebrow', type: 'text', defaultValue: COPY.testimonialsEyebrow, admin: { width: '50%' } },
              { name: 'testimonialsHeading', type: 'text', defaultValue: COPY.testimonialsHeading, admin: { width: '50%' } },
            ] },
            {
              name: 'testimonials',
              type: 'array',
              fields: [
                { name: 'quote', type: 'textarea', required: true },
                { type: 'row', fields: [
                  { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                  { name: 'title', type: 'text', admin: { width: '50%' } },
                ] },
                { name: 'photo', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'contactEyebrow', type: 'text', defaultValue: COPY.contactEyebrow },
            { name: 'contactHeading', type: 'text', defaultValue: COPY.contactHeading },
            { name: 'contactIntro', type: 'textarea' },
          ],
        },
      ],
    },
  ],
};
