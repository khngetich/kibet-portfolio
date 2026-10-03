import { slugField, type CollectionConfig } from 'payload';
import { authenticated, publishedOrAuthenticated } from '../access';
import { caseStudyBlocks } from '../blocks';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';
import { hexColour, tidyURL, webURL, yearText } from '../lib/validate';

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
    listSearchableFields: ['title', 'client', 'summary'],
    description: 'Drag rows to set the order projects appear on the site.',
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'projects', label: '+ New project', hint: 'Add the project in a pop-up; it stays open so you can carry on with the case study.' } }] },
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateOnDelete] },
  fields: [
    // the editor's banner: cover, facts and case-study completeness (stores nothing)
    { name: 'projectHeader', type: 'ui', admin: { components: { Field: '/components/admin/ProjectHeader#ProjectHeader' } } },
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'summary', type: 'textarea', required: true, maxLength: 220, admin: { description: 'One or two sentences. Shown on project cards and in search/social previews.' } },
            { name: 'cover', type: 'upload', relationTo: 'media', required: true, admin: { description: 'The thumbnail and the big image at the top of the case study. Landscape 16:10 works best.' } },
            { name: 'contribution', label: 'My contribution', type: 'textarea', admin: { description: 'One or two sentences on your part, shown under the lead image, e.g. “Creative lead: I created the logo and visual identity, and work across social and campaigns.”' } },
            { name: 'brief', type: 'textarea', admin: { description: 'What the client needed.' } },
            { name: 'approach', type: 'textarea', admin: { description: 'What you did and why.' } },
            { name: 'outcome', type: 'textarea', admin: { description: 'What happened after launch. Keep it factual.' } },
            { type: 'row', fields: [
              { name: 'deliverables', type: 'text', hasMany: true, admin: { width: '50%', description: 'What you handed over, e.g. Poster templates, Brand guidelines.' } },
              { name: 'tools', type: 'text', hasMany: true, admin: { width: '50%', description: 'e.g. Photoshop, Illustrator, Figma.' } },
            ] },
            { name: 'timeline', type: 'text', admin: { description: 'How long it took, e.g. “3 weeks” or “Ongoing since 2023”.' } },
          ],
        },
        {
          label: 'Samples',
          description: 'The work itself: images, PDFs (brand guidelines, decks, print files) and videos. They appear as a grid on the case study and open full screen in a pop-up viewer.',
          fields: [{
            name: 'samples',
            type: 'array',
            labels: { singular: 'Sample', plural: 'Samples' },
            admin: { initCollapsed: true },
            fields: [
              { name: 'file', type: 'upload', relationTo: 'media', required: true },
              { type: 'row', fields: [
                { name: 'title', type: 'text', admin: { width: '50%', placeholder: 'e.g. Matchday poster, week 12' } },
                { name: 'note', type: 'text', admin: { width: '50%', placeholder: 'Optional one-line caption' } },
              ] },
            ],
          }],
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
    { name: 'year', type: 'text', required: true, validate: yearText, admin: { position: 'sidebar', placeholder: '2025' } },
    { name: 'disciplines', type: 'select', hasMany: true, required: true, options: DISCIPLINES, admin: { position: 'sidebar' } },
    { name: 'role', type: 'text', hasMany: true, admin: { position: 'sidebar', description: 'e.g. Art direction, Layout system' } },
    { name: 'liveUrl', label: 'Live link', type: 'text', validate: webURL, hooks: { beforeValidate: [tidyURL] }, admin: { position: 'sidebar', description: 'The live website, a YouTube/Vimeo video, or a public post. Shows a preview button on the case study.' } },
    { name: 'liveType', label: 'Live link is a…', type: 'select', defaultValue: 'website', options: [
      { label: 'Website', value: 'website' }, { label: 'Video', value: 'video' }, { label: 'Social post', value: 'post' },
    ], admin: { position: 'sidebar', condition: (d) => !!d?.liveUrl } },
    { name: 'accent', type: 'text', validate: hexColour, admin: { position: 'sidebar', description: 'Leave empty and the card, its glow and the case study take their colour from the cover. Set a hex (e.g. #F5C400) to use a brand colour instead.' } },
    { name: 'note', type: 'textarea', admin: { position: 'sidebar', description: 'Small print shown at the end (NDA, placeholder images, etc.)' } },
    {
      name: 'stats',
      label: 'Card stats',
      type: 'array',
      maxRows: 2,
      admin: { position: 'sidebar', description: 'Up to two real, checkable results for the foot of the project card, e.g. “05” Deliverables and “+120%” Engagement. Leave empty to show the year instead.' },
      fields: [{ type: 'row', fields: [
        { name: 'value', type: 'text', required: true, admin: { width: '40%', placeholder: '05' } },
        { name: 'label', type: 'text', required: true, admin: { width: '60%', placeholder: 'Deliverables' } },
      ] }],
    },
  ],
};
