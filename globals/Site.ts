import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const SOCIAL_PLATFORMS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Behance', value: 'behance' },
  { label: 'Dribbble', value: 'dribbble' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'X (Twitter)', value: 'x' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'TikTok', value: 'tiktok' },
];

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { type: 'row', fields: [
              { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
              { name: 'studio', type: 'text', admin: { width: '50%' } },
            ] },
            { name: 'role', type: 'text', required: true, admin: { description: 'e.g. Graphic designer & social media creative' } },
            { name: 'location', type: 'text' },
            { name: 'availability', type: 'text', admin: { description: 'Shown in the footer and contact section, e.g. "Booking projects for October"' } },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { type: 'row', fields: [
              { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
              { name: 'phone', type: 'text', admin: { width: '50%', description: 'International format, e.g. +254 720 949 086' } },
            ] },
            { name: 'whatsapp', type: 'checkbox', defaultValue: true, admin: { description: 'Show a WhatsApp button using the phone number above' } },
            {
              name: 'socials',
              type: 'array',
              admin: { description: 'Only profiles with a full URL are shown.' },
              fields: [
                { type: 'row', fields: [
                  { name: 'platform', type: 'select', required: true, options: SOCIAL_PLATFORMS, admin: { width: '35%' } },
                  { name: 'url', type: 'text', required: true, admin: { width: '65%', placeholder: 'https://www.behance.net/your-name' }, validate: (v: unknown) => (typeof v === 'string' && /^https?:\/\/[^/]+\.[^/]+\/.+/.test(v)) || 'Paste the full profile URL, including your username' },
                ] },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaDescription', type: 'textarea' },
            { name: 'ogImage', type: 'upload', relationTo: 'media', admin: { description: 'Default image when a page is shared (1200×630)' } },
          ],
        },
      ],
    },
  ],
};
