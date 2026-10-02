import { slugField, type CollectionConfig } from 'payload';
import { authenticated, publishedOrAuthenticated } from '../access';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';

/**
 * Insights: short design notes and articles, shown at /insights and /insights/<slug>, and as
 * cards in the "Insights" page section. Drafts and autosave like the other content.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Insight', plural: 'Insights' },
  defaultSort: '-publishedAt',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'tags', '_status'],
    description: 'Short articles and design notes. They appear at /insights and in the Insights section.',
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'posts', label: '+ New insight', hint: 'Write a short design note; publish it when it’s ready.' } }] },
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 30 },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 220, admin: { description: 'One or two sentences for the card and search/social previews.' } },
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { description: 'Landscape 16:10 works best. Without one, the card shows a coloured panel with the title.' } },
    { name: 'content', type: 'richText', required: true },
    { name: 'publishedAt', label: 'Date', type: 'date', required: true, defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } } },
    { name: 'tags', type: 'text', hasMany: true, admin: { position: 'sidebar', description: 'e.g. Branding, Process' } },
    slugField({ useAsSlug: 'title', position: 'sidebar' }),
    { name: 'metaTitle', label: 'Search title', type: 'text', admin: { position: 'sidebar', description: 'Defaults to the title.' } },
  ],
};
