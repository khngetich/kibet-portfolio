import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';
import { linkFields } from './Header';
import { linkTarget } from '../lib/validate';

/** The footer on every page: a call-to-action band, the name and socials, the copyright and policy links. Saving publishes immediately; earlier versions stay in History. */
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
        { name: 'title', label: 'Name (override)', type: 'text', admin: { width: '40%', description: 'Leave empty to use Site settings → Name.' } },
        { name: 'tagline', label: 'Tagline (override)', type: 'text', admin: { width: '60%', description: 'Leave empty to use Site settings → Tagline.' } },
      ],
    },
    { type: 'row', fields: [
      { name: 'showAvailability', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
      { name: 'showSocials', label: 'Show social profiles', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
    ] },
    {
      name: 'cta',
      label: 'Call to action card',
      type: 'group',
      admin: { description: 'The dark band at the top of the footer.' },
      fields: [
        { name: 'show', type: 'checkbox', defaultValue: true },
        { name: 'heading', type: 'text', defaultValue: 'Ready to elevate your visual identity?' },
        { name: 'text', type: 'textarea', defaultValue: 'Let’s partner to create high-impact graphics and social media campaigns that drive growth.' },
        { type: 'row', fields: [
          { name: 'buttonLabel', type: 'text', defaultValue: 'Book a Strategy Call', admin: { width: '40%' } },
          { name: 'buttonUrl', type: 'text', defaultValue: '/#contact', validate: linkTarget, admin: { width: '60%', description: 'A page, a section (/#contact), a booking link or mailto:' } },
        ] },
      ],
    },
    { name: 'copyright', type: 'text', defaultValue: '© {year} {name}. All rights reserved.', admin: { description: '{year} and {name} are filled in automatically.' } },
    { name: 'legal', label: 'Policy links', type: 'array', admin: { initCollapsed: true, description: 'Shown beside the copyright, e.g. Terms → /terms. The pages themselves are in Pages; link only to ones that exist.' }, fields: linkFields },
    { name: 'note', type: 'text', defaultValue: 'Some client work is shown under NDA or with permission.', admin: { description: 'Small print after the copyright line.' } },
  ],
};
