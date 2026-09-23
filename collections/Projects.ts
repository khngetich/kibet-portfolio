import { slugField, type CollectionConfig } from 'payload';
import { authenticated, publishedOrAuthenticated } from '../access';
import { caseStudyBlocks } from '../blocks';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';

export const DISCIPLINES = [
  { label: 'Social media', value: 'social' },
  { label: 'Brand identity', value: 'brand' },
  { label: 'Web design', value: 'web' },
  { label: 'Print', value: 'print' },
  { label: 'Packaging', value: 'packaging' },
  { label: 'Illustration', value: 'illustration' },
  { label: 'Motion', value: 'motion' },
];

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  orderable: true,
  defaultSort: '_order',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'disciplines', 'year', 'featured', '_status'],
    description: 'Drag rows to set the order projects appear on the site.',
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'summary', type: 'textarea', required: true, maxLength: 220, admin: { description: 'One or two sentences. Shown on project cards and in search/social previews.' } },
            { name: 'cover', type: 'upload', relationTo: 'media', required: true, admin: { description: 'The thumbnail and the big image at the top of the case study. Landscape 16:10 works best.' } },
            { name: 'brief', type: 'textarea', admin: { description: 'What the client needed.' } },
            { name: 'approach', type: 'textarea', admin: { description: 'What you did and why.' } },
            { name: 'outcome', type: 'textarea', admin: { description: 'What happened after launch. Keep it factual.' } },
          ],
        },
        {
          label: 'Case study',
          description: 'Stack blocks to tell the story. Lead with images; keep text short.',
          fields: [{ name: 'layout', type: 'blocks', blocks: caseStudyBlocks }],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', admin: { description: 'Defaults to the project title.' } },
            { name: 'metaDescription', type: 'textarea', admin: { description: 'Defaults to the summary.' } },
            { name: 'ogImage', type: 'upload', relationTo: 'media', admin: { description: 'Image shown when the link is shared (1200×630). Defaults to the cover.' } },
          ],
        },
      ],
    },
    slugField({ useAsSlug: 'title', position: 'sidebar' }),
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the homepage' } },
    { name: 'client', type: 'text', required: true, admin: { position: 'sidebar' } },
    { name: 'year', type: 'text', required: true, admin: { position: 'sidebar' } },
    { name: 'disciplines', type: 'select', hasMany: true, required: true, options: DISCIPLINES, admin: { position: 'sidebar' } },
    { name: 'role', type: 'text', hasMany: true, admin: { position: 'sidebar', description: 'e.g. Art direction, Layout system' } },
    { name: 'liveUrl', type: 'text', admin: { position: 'sidebar', description: 'Link to the live site or post, if public' } },
    { name: 'accent', type: 'text', admin: { position: 'sidebar', description: 'Hex colour used for this project’s accents, e.g. #F5C400' } },
    { name: 'note', type: 'textarea', admin: { position: 'sidebar', description: 'Small print shown at the end (NDA, placeholder images, etc.)' } },
  ],
};
