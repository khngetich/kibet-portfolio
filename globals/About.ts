import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About page',
  admin: { group: 'Pages' },
  access: { read: anyone, update: authenticated },
  versions: { drafts: { autosave: { interval: 800 } }, max: 20 },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'short', type: 'textarea', admin: { description: 'A short paragraph shown on the homepage' } },
    { name: 'body', type: 'richText' },
    {
      name: 'experience',
      type: 'array',
      fields: [
        { type: 'row', fields: [
          { name: 'role', type: 'text', required: true, admin: { width: '40%' } },
          { name: 'company', type: 'text', admin: { width: '35%' } },
          { name: 'years', type: 'text', admin: { width: '25%', placeholder: '2023 – now' } },
        ] },
      ],
    },
    { type: 'row', fields: [
      { name: 'skills', type: 'text', hasMany: true, admin: { width: '50%' } },
      { name: 'tools', type: 'text', hasMany: true, admin: { width: '50%' } },
    ] },
    { name: 'cv', type: 'upload', relationTo: 'media', admin: { description: 'Optional downloadable CV or PDF portfolio' } },
  ],
};
