import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'email', 'updatedAt'],
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'users', label: '+ Add editor', hint: 'People who can sign in to this CMS.' } }] },
  },
  auth: { tokenExpiration: 60 * 60 * 24 * 7 },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text', admin: { components: { Cell: '/components/admin/Crud#ModalCell' } } }],
};
