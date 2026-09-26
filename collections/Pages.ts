import { slugField, type CollectionConfig } from 'payload';
import { MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField } from '@payloadcms/plugin-seo/fields';
import { authenticated, publishedOrAuthenticated } from '../access';
import { pageSections } from '../blocks/sections';
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate';

/** The URL a page lives at: "home" is the site root. */
export const pagePath = (slug?: string | null) => (!slug || slug === 'home' ? '/' : `/${slug}`);

/**
 * Site pages, each an ordered list of sections. Drafts are autosaved only so the live
 * preview can follow along while typing; the single “Publish changes” button puts edits
 * live, and every publish is kept in the version history.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Every page on the site. Open one to add, reorder, hide or edit its sections.',
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'pages', label: '+ New page', hint: 'Name the page and pick its address; you add sections on the next screen.', then: 'open' } }] },
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 600 }, schedulePublish: false }, maxPerDoc: 50 },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'Used in the admin and as the default browser-tab and search title.' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sections',
          fields: [
            {
              name: 'sections',
              type: 'blocks',
              blocks: pageSections,
              admin: {
                initCollapsed: true,
                components: { Field: '/components/admin/SectionsField#SectionsField' },
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'Page settings',
          description: 'How this page appears in Google and when its link is shared.',
          fields: [
            OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaDescriptionField({}),
            MetaImageField({ relationTo: 'media' }),
            PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
          ],
        },
      ],
    },
    slugField({ useAsSlug: 'title', position: 'sidebar' }),
  ],
};
