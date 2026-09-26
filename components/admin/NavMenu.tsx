import type { Payload, SanitizedPermissions } from 'payload';
import { NavMenuClient, type NavGroup } from './NavMenuClient';

/**
 * The CMS sidebar: every collection and global the editor can open, grouped as in the
 * config, each with an icon and a live count (new enquiries are flagged). Rendered
 * before Payload's own nav links, which custom.css hides.
 */

const GROUP_ORDER = ['Website', 'Content', 'Inbox', 'Settings'];
const labelOf = (l: unknown, fallback: string) => (typeof l === 'string' ? l : l && typeof l === 'object' ? String(Object.values(l)[0] ?? fallback) : fallback);

export async function NavMenu({ payload, permissions }: { payload: Payload; permissions?: SanitizedPermissions }) {
  const admin = payload.config.routes.admin;
  const canRead = (kind: 'collections' | 'globals', slug: string) => {
    const p = permissions?.[kind]?.[slug as never] as { read?: boolean } | undefined;
    return p ? p.read !== false : true;
  };

  const collections = payload.config.collections.filter((c) => !c.admin?.hidden && canRead('collections', c.slug));
  const globals = payload.config.globals.filter((g) => !g.admin?.hidden && canRead('globals', g.slug));

  const counts = Object.fromEntries(
    await Promise.all(collections.map(async (c) => [c.slug, (await payload.count({ collection: c.slug as never })).totalDocs] as const)),
  );
  const newEnquiries = collections.some((c) => c.slug === 'inquiries')
    ? (await payload.count({ collection: 'inquiries', where: { status: { equals: 'new' } } })).totalDocs
    : 0;

  const groups = new Map<string, NavGroup['items']>();
  const push = (group: unknown, item: NavGroup['items'][number]) => {
    const name = labelOf(group, 'Other');
    groups.set(name, [...(groups.get(name) ?? []), item]);
  };
  for (const c of collections) {
    push(c.admin?.group, {
      slug: c.slug,
      label: labelOf(c.labels?.plural, c.slug),
      href: `${admin}/collections/${c.slug}`,
      count: counts[c.slug],
      badge: c.slug === 'inquiries' && newEnquiries ? `${newEnquiries} new` : undefined,
    });
  }
  for (const g of globals) push(g.admin?.group, { slug: g.slug, label: labelOf(g.label, g.slug), href: `${admin}/globals/${g.slug}` });

  const ordered: NavGroup[] = [...groups.entries()]
    .sort(([a], [b]) => (GROUP_ORDER.indexOf(a) + 1 || 99) - (GROUP_ORDER.indexOf(b) + 1 || 99))
    .map(([label, items]) => ({ label, items }));

  return <NavMenuClient admin={admin} groups={ordered} />;
}
