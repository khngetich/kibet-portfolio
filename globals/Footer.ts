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
    { name: 'copyright', type: 'text', defaultValue: '© {year} {name}.', admin: { description: '{year} and {name} are filled in automatically.' } },
    { name: 'note', type: 'text', defaultValue: 'Some client work is shown under NDA or with permission.', admin: { description: 'Small print after the copyright line.' } },
  ],
};
