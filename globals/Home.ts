import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Pages' },
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
            { name: 'heroImages', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 5, admin: { description: 'Up to 5 pieces of your best work shown in the hero. Leave empty to use the featured projects’ covers.' } },
          ],
        },
        {
          label: 'Selected work',
          description: 'Tick “Featured” on a project to show it here. Drag projects in the Projects list to reorder.',
          fields: [
            { name: 'workHeading', type: 'text', defaultValue: 'Selected work' },
            { name: 'workIntro', type: 'textarea' },
          ],
        },
        {
          label: 'Services',
          fields: [
            { name: 'servicesHeading', type: 'text', defaultValue: 'What I do' },
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
          label: 'Clients & testimonials',
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
            { name: 'contactHeading', type: 'text', defaultValue: 'Have a brief? Let’s talk.' },
            { name: 'contactIntro', type: 'textarea' },
          ],
        },
      ],
    },
  ],
};
