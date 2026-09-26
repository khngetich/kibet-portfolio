import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

/** Messages sent through the contact form. Created server-side only (see app/(frontend)/actions.ts). */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'service', 'status', 'createdAt'],
  },
  access: { read: authenticated, create: () => false, update: authenticated, delete: authenticated },
  fields: [
    { type: 'row', fields: [
      { name: 'name', type: 'text', required: true, admin: { width: '50%', components: { Cell: '/components/admin/Crud#ModalCell' } } },
      { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
    ] },
    { type: 'row', fields: [
      { name: 'service', type: 'text', admin: { width: '50%' } },
      { name: 'budget', type: 'text', admin: { width: '50%' } },
    ] },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [{ label: 'New', value: 'new' }, { label: 'Replied', value: 'replied' }, { label: 'Archived', value: 'archived' }],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
};
