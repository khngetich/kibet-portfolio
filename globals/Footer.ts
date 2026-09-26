import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';
import { linkFields } from './Header';

/** The footer on every page. Saving publishes immediately; earlier versions stay in History. */
export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Website', description: 'The footer at the bottom of every page.' },
  access: { read: anyone, update: authenticated },
  versions: { max: 30 },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', admin: { width: '40%', description: 'Defaults to the studio name.' } },
        { name: 'tagline', type: 'text', admin: { width: '60%', description: 'Defaults to your role and location.' } },
      ],
    },
    { type: 'row', fields: [
      { name: 'showAvailability', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
      { name: 'showSocials', label: 'Show social profiles', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
    ] },
    {
      name: 'columns',
      label: 'Link columns',
      type: 'array',
      maxRows: 4,
      admin: { components: { RowLabel: '/components/admin/LinkRowLabel#LinkRowLabel' } },
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'links', type: 'array', admin: { initCollapsed: true, components: { RowLabel: '/components/admin/LinkRowLabel#LinkRowLabel' } }, fields: linkFields },
      ],
    },
    {
      name: 'contact',
      label: 'Contact column',
      type: 'group',
      admin: { description: 'Email, phone and WhatsApp come from Site settings → Contact.' },
      fields: [
        { type: 'row', fields: [
          { name: 'show', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
          { name: 'heading', type: 'text', defaultValue: 'Contact', admin: { width: '70%' } },
        ] },
        { type: 'row', fields: [
          { name: 'showEmail', type: 'checkbox', defaultValue: true, admin: { width: '33%' } },
          { name: 'showPhone', type: 'checkbox', defaultValue: true, admin: { width: '33%' } },
          { name: 'showWhatsApp', label: 'Show WhatsApp', type: 'checkbox', defaultValue: true, admin: { width: '33%' } },
        ] },
      ],
    },
    {
      name: 'cta',
      label: 'Call to action card',
      type: 'group',
      admin: { description: 'The dark card at the top of the footer.' },
      fields: [
        { name: 'show', type: 'checkbox', defaultValue: true },
        { name: 'heading', type: 'text', defaultValue: 'Ready to elevate your visual identity?' },
        { name: 'text', type: 'textarea', defaultValue: 'Let’s partner to create high-impact graphics and social media campaigns that drive growth.' },
        { type: 'row', fields: [
          { name: 'buttonLabel', type: 'text', defaultValue: 'Book a Strategy Call', admin: { width: '40%' } },
          { name: 'buttonUrl', type: 'text', defaultValue: '/#contact', admin: { width: '60%', description: 'A page, a section (/#contact), a booking link or mailto:' } },
        ] },
      ],
    },
    { name: 'copyright', type: 'text', defaultValue: '© {year} {name}. All rights reserved.', admin: { description: '{year} and {name} are filled in automatically.' } },
    { name: 'legal', label: 'Legal links', type: 'array', admin: { initCollapsed: true, description: 'Shown beside the copyright, e.g. Privacy policy → /privacy. Link only to pages that exist.' }, fields: linkFields },
    { name: 'note', type: 'text', defaultValue: 'Some client work is shown under NDA or with permission.', admin: { description: 'Small print after the copyright line.' } },
  ],
};
