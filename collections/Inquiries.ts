import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';
import { notifyInquiry } from '../hooks/notifyInquiry';

/** Messages sent through the contact form. Created server-side only (see app/(frontend)/actions.ts). */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'service', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'message'],
  },
  access: { read: authenticated, create: () => false, update: authenticated, delete: authenticated },
  hooks: { afterChange: [notifyInquiry] },
  fields: [
    { type: 'row', fields: [
      { name: 'name', type: 'text', required: true, admin: { width: '50%', components: { Cell: '/components/admin/Crud#ModalCell' } } },
      { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
    ] },
    { type: 'row', fields: [
      { name: 'service', type: 'text', admin: { width: '50%' } },
      { name: 'budget', type: 'text', admin: { width: '50%' } },
    ] },
    { name: 'timeline', type: 'text', admin: { description: 'When they need it, from the brief builder.' } },
    { type: 'row', fields: [
      { name: 'brandStage', label: 'New or existing brand', type: 'select', options: [
        { label: 'A new brand', value: 'new' },
        { label: 'A rebrand / redesign', value: 'rebrand' },
        { label: 'A refresh of an existing identity', value: 'refresh' },
      ], admin: { width: '50%' } },
      { name: 'whatsapp', label: 'WhatsApp', type: 'text', admin: { width: '50%' } },
    ] },
    { name: 'logoWording', label: 'Wording for the logo', type: 'text' },
    { name: 'keep', label: 'What prompts the change, and what should stay', type: 'textarea' },
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
