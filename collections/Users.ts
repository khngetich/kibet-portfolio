import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'name', group: 'Settings' },
  auth: { tokenExpiration: 60 * 60 * 24 * 7 },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text' }],
};
