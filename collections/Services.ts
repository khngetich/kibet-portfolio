import { slugField, type CollectionConfig } from 'payload';
import { authenticated, publishedOrAuthenticated } from '../access';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';

/**
 * What you offer, one document per service. Each gets its own page at /services/<slug>, and
 * the Services section on a page shows them as cards (pick them in the section, or it lists
 * every published one). The contact form offers them as "What do you need?" options.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  orderable: true,
  defaultSort: '_order',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['image', 'title', 'priceFrom', 'featured', '_status'],
    description: 'Each service has its own page. Drag rows to set the order they appear in.',
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'services', label: '+ New service', hint: 'Add the service in a pop-up, then fill in its page.' } }] },
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
          label: 'Card',
          description: 'What shows on the service card (and at the top of its page).',
          fields: [
            { name: 'description', label: 'One-line summary', type: 'textarea', maxLength: 180, admin: { description: 'Shown on the card and under the title on the page.' } },
            { type: 'row', fields: [
              { name: 'priceFrom', label: 'Price from', type: 'number', admin: { width: '33%', description: 'Leave empty to hide the price.' } },
              { name: 'currency', type: 'select', defaultValue: 'KES', options: ['KES', 'USD'], admin: { width: '33%' } },
              { name: 'unit', type: 'text', admin: { width: '33%', placeholder: '/month' } },
            ] },
            { name: 'image', label: 'Cover image', type: 'upload', relationTo: 'media', admin: { description: 'The picture on the service card, under the title on its page, and when the page is shared. Use real work for this service. If empty, the card borrows a project cover and the page shows no picture.' } },
            { name: 'imageCaption', label: 'Cover caption', type: 'text', admin: { description: 'Under the cover, e.g. “Triad Brands / Brand identity”.' } },
            { name: 'deliverables', label: 'What you get', type: 'text', hasMany: true, admin: { description: 'The bullet points on the card and the page. Type one and press Enter.' } },
            { type: 'row', fields: [
              { name: 'featured', label: 'Featured service', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Shown inverted (dark), with a “Featured” label.' } },
              { name: 'starter', label: 'A good first project', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Marks a small, low-risk way to start working together.' } },
            ] },
          ],
        },
        {
          label: 'Page',
          description: 'The rest of the service page. Everything here is optional; empty parts are left out.',
          fields: [
            { name: 'intro', label: 'About this service', type: 'textarea', admin: { description: 'A short paragraph: what it is and the problem it solves.' } },
            { type: 'row', fields: [
              { name: 'goodFor', label: 'Good for', type: 'text', hasMany: true, admin: { width: '60%', description: 'Who it suits, e.g. “Startups launching”.' } },
              { name: 'timeline', label: 'Typical timeline', type: 'text', admin: { width: '40%', placeholder: '2–3 weeks' } },
            ] },
            {
              name: 'steps',
              label: 'How it works',
              type: 'array',
              maxRows: 6,
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            { name: 'projects', label: 'Selected work', type: 'relationship', relationTo: 'projects', hasMany: true, admin: { description: 'Projects shown on the page as examples of this service.' } },
            {
              name: 'faqs',
              label: 'Questions',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', admin: { description: 'Defaults to the service title.' } },
            { name: 'metaDescription', type: 'textarea', admin: { description: 'Defaults to the one-line summary.' } },
          ],
        },
      ],
    },
    slugField({ useAsSlug: 'title', position: 'sidebar' }),
  ],
};
