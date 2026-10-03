import type { Field, GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';
import { linkTarget } from '../lib/validate';

export const linkFields: Field[] = [
  { type: 'row', fields: [
    { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
    { name: 'url', type: 'text', required: true, validate: linkTarget, admin: { width: '60%', description: 'A page (/about), a section (/#work) or a full URL.' } },
  ] },
];

/** The floating header on every page. Saving publishes immediately; earlier versions stay in History. */
export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  admin: { group: 'Website', description: 'The floating bar at the top of every page.' },
  access: { read: anyone, update: authenticated },
  versions: { max: 30 },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'menu',
      label: 'Menu links',
      type: 'array',
      maxRows: 7,
      admin: { description: 'Links to sections (/#work) highlight while that section is on screen.', initCollapsed: true, components: { RowLabel: '/components/admin/LinkRowLabel#LinkRowLabel' } },
      fields: linkFields,
    },
    {
      name: 'quoteButton',
      label: 'Quote button',
      type: 'group',
      fields: [
        { name: 'show', label: 'Show the button in the header', type: 'checkbox', defaultValue: false },
        { type: 'row', fields: [
          { name: 'label', type: 'text', defaultValue: 'Start a project', required: true, admin: { width: '40%' } },
          { name: 'url', type: 'text', defaultValue: '/#contact', required: true, admin: { width: '60%' } },
        ] },
      ],
    },
    { name: 'showAvailability', label: 'Show the availability badge (bottom-right)', type: 'checkbox', defaultValue: true, admin: { description: 'The text comes from Site settings → Availability.' } },
  ],
};
