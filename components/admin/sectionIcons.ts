import type { IconName } from '@/components/ui/Icon';

/**
 * One picture per CMS area, shared by the sidebar, the phone tab bar, the ⌘K palette and the
 * dashboard's shortcuts, so an area looks the same wherever it appears. Keyed by collection
 * or global slug.
 */
export const SECTION_ICON: Record<string, IconName> = {
  dashboard: 'dashboard',
  pages: 'file',
  projects: 'portfolio',
  media: 'image',
  inquiries: 'inbox',
  users: 'users',
  header: 'layoutTop',
  footer: 'layoutBottom',
  theme: 'palette',
  site: 'settings',
};

export const sectionIcon = (slug: string): IconName => SECTION_ICON[slug] ?? 'folder';
