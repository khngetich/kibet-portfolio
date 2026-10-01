import { APIError, type Access, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook, type CollectionConfig, type FieldAccess } from 'payload';
import { authenticated } from '../access';

/**
 * People who can sign in. Admins manage accounts; editors edit content and can change only
 * their own name, email and password. The first account ever created is always an admin, and
 * the last admin can't be deleted or demoted, so the CMS can never lock itself out.
 */

const isAdmin = (user: unknown) => (user as { role?: string } | null)?.role === 'admin';

const adminOnly: Access = ({ req }) => isAdmin(req.user);
const adminOrSelf: Access = ({ req }) => (isAdmin(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false);
const adminField: FieldAccess = ({ req }) => isAdmin(req.user);

const countAdmins = async (req: Parameters<CollectionBeforeChangeHook>[0]['req']) =>
  (await req.payload.count({ collection: 'users', where: { role: { equals: 'admin' } }, req })).totalDocs;

const keepAnAdmin: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation === 'create') {
    if ((await req.payload.count({ collection: 'users', req })).totalDocs === 0) data.role = 'admin';
    return data;
  }
  if (originalDoc?.role === 'admin' && data.role && data.role !== 'admin' && (await countAdmins(req)) <= 1) {
    throw new APIError('This is the only admin. Make someone else an admin first.', 400, undefined, true);
  }
  return data;
};

const keepLastAdmin: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const doc = await req.payload.findByID({ collection: 'users', id, depth: 0, req });
  if (doc.role === 'admin' && (await countAdmins(req)) <= 1) {
    throw new APIError('This is the only admin, so it can’t be deleted.', 400, undefined, true);
  }
};

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    components: { beforeListTable: [{ path: '/components/admin/Crud#ListQuickCreate', clientProps: { collection: 'users', label: '+ Add editor', hint: 'People who can sign in to this CMS.' } }] },
  },
  auth: { tokenExpiration: 60 * 60 * 24 * 7 },
  access: {
    read: authenticated,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
  },
  hooks: { beforeChange: [keepAnAdmin], beforeDelete: [keepLastAdmin] },
  fields: [
    { name: 'name', type: 'text', admin: { components: { Cell: '/components/admin/Crud#ModalCell' } } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [{ label: 'Admin', value: 'admin' }, { label: 'Editor', value: 'editor' }],
      access: { create: adminField, update: adminField },
      admin: { position: 'sidebar', description: 'Admins can add, remove and change other people’s accounts. Editors can only edit content and their own account.' },
    },
  ],
};
